import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  Copy,
  Check,
  Building,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LeadStatusBadge from '../components/LeadStatusBadge';
import NotesSection from '../../notes/components/NotesSection';
import DeleteLeadModal from '../components/DeleteLeadModal';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { LeadStatus, LeadWithNotes, Note } from '../../../types/lead.types';
import leadsApi from '../../../services/leads-api';
import notesApi from '../../../services/notes-api';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../utils/date';
import { formatErrorMessage } from '../../../utils/errors';
import { getInitials } from '../../../utils/formatters';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const numericId = Number(id);
  const isValidId = !isNaN(numericId) && numericId > 0;

  const [lead, setLead] = useState<LeadWithNotes | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Fetch lead data and notes
  const fetchLeadDetails = useCallback(
    async (signal?: AbortSignal) => {
      if (!isValidId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);

        const data = await leadsApi.getLeadById(numericId, signal);
        setLead(data);
        setNotes(data.notes || []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') {
          return;
        }
        const errorMsg = formatErrorMessage(err);
        if (
          errorMsg.toLowerCase().includes('not found') ||
          (err as { statusCode?: number }).statusCode === 404
        ) {
          setNotFound(true);
        } else {
          setError(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isValidId, numericId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchLeadDetails(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchLeadDetails]);

  // Handle adding a note
  const handleAddNote = async (content: string) => {
    if (!lead) return;
    try {
      setIsAddingNote(true);
      const newNote = await notesApi.createNote(lead.id, { content });
      setNotes((prev) => [newNote, ...prev]);
      success('Note added', 'The communication note was recorded.');
    } catch (err: unknown) {
      const msg = formatErrorMessage(err);
      toastError('Failed to save note', msg);
      throw err;
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle inline status change
  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || lead.status === newStatus) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await leadsApi.updateLead(lead.id, { status: newStatus });
      setLead((prev) => (prev ? { ...prev, status: updated.status } : null));
      success('Status updated', `Lead status updated to ${newStatus}.`);
    } catch (err: unknown) {
      toastError('Status update failed', formatErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle lead delete
  const handleDeleteConfirm = async (leadId: number) => {
    try {
      await leadsApi.deleteLead(leadId);
      success('Lead deleted', 'Lead and associated notes were removed.');
      navigate('/leads');
    } catch (err: unknown) {
      toastError('Delete failed', formatErrorMessage(err));
      throw err;
    }
  };

  const copyEmailToClipboard = () => {
    if (lead?.email) {
      navigator.clipboard.writeText(lead.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // 404 Not Found state
  if (notFound && !isLoading) {
    return (
      <div className="py-12">
        <EmptyState
          title="Lead Not Found"
          description="The lead record you requested does not exist or may have been deleted."
          icon={<Building className="h-8 w-8 text-brand-600" />}
          actionLabel="Return to Leads"
          onAction={() => navigate('/leads')}
        />
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="py-12">
        <EmptyState
          title="Error Loading Lead Details"
          description={error}
          actionLabel="Retry"
          onAction={() => fetchLeadDetails()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Navigation Bar with Back button and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/leads')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            aria-label="Back to leads list"
          >
            Back to Leads
          </Button>

          {lead && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">/</span>
              <span className="text-sm font-semibold text-slate-700 truncate max-w-xs">
                {lead.name}
              </span>
            </div>
          )}
        </div>

        {lead && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/leads/${lead.id}/edit`)}
              leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            >
              Edit Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
        </div>
      ) : lead ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Lead Profile & Contact Card */}
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-lg font-bold text-white shadow-soft ring-4 ring-brand-50 mb-3">
                  {getInitials(lead.name)}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
                <div className="mt-2">
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>

              {/* Contact details list */}
              <div className="pt-6 space-y-4">
                {/* Email */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs font-medium text-slate-800 hover:text-brand-600 truncate flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={copyEmailToClipboard}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs text-slate-800">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="font-medium hover:text-brand-600 transition"
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No phone provided</span>
                    )}
                  </div>
                </div>

                {/* Status Quick Changer */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Update Pipeline Status
                  </span>
                  <select
                    value={lead.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    aria-label="Update Lead Status"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {/* Created Timestamp */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Registered:</span>
                  </span>
                  <span className="font-medium text-slate-700">{formatDate(lead.createdAt)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Communication Notes Section */}
          <div className="lg:col-span-2">
            <Card
              title="Communication Notes & Activity"
              subtitle="All chronological interaction logs and updates for this contact"
            >
              <NotesSection
                notes={notes}
                isLoading={false}
                onAddNote={handleAddNote}
                isAddingNote={isAddingNote}
              />
            </Card>
          </div>
        </div>
      ) : null}

      {/* Delete Lead Confirmation Modal */}
      <DeleteLeadModal
        isOpen={isDeleteModalOpen}
        lead={lead}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LeadDetailPage;
