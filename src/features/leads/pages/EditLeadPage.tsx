import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { CreateLeadPayload, Lead } from '../../../types/lead.types';
import leadsApi from '../../../services/leads-api';
import { useToast } from '../../../hooks/useToast';
import { formatErrorMessage, isRequestCanceled } from '../../../utils/errors';

export const EditLeadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const numericId = Number(id);
  const isValidId = !isNaN(numericId) && numericId > 0;

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchLead = useCallback(
    async (signal?: AbortSignal) => {
      if (!isValidId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setNotFound(false);
        const data = await leadsApi.getLeadById(numericId, signal);
        setLead(data);
      } catch (err: unknown) {
        if (isRequestCanceled(err) || signal?.aborted) {
          return;
        }
        const msg = formatErrorMessage(err);
        if (
          msg.toLowerCase().includes('not found') ||
          (err as { statusCode?: number }).statusCode === 404
        ) {
          setNotFound(true);
        } else {
          setApiError(msg);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [isValidId, numericId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchLead(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchLead]);

  const handleSubmit = async (payload: CreateLeadPayload) => {
    if (!lead) return;

    try {
      setIsSaving(true);
      setApiError(null);

      const updated = await leadsApi.updateLead(lead.id, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        status: payload.status,
      });

      success('Lead updated', `${updated.name}'s details were updated.`);
      navigate(`/leads/${lead.id}`);
    } catch (err: unknown) {
      const msg = formatErrorMessage(err);
      setApiError(msg);
      toastError('Update failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (notFound && !isLoading) {
    return (
      <div className="py-12">
        <EmptyState
          title="Lead Not Found"
          description="The lead record you are attempting to edit does not exist or has been deleted."
          actionLabel="Back to Leads"
          onAction={() => navigate('/leads')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(lead ? `/leads/${lead.id}` : '/leads')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          aria-label="Back"
        >
          Cancel
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Edit Lead</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Update contact details or pipeline stage for this lead.
          </p>
        </div>
      </div>

      <Card
        title="Edit Information"
        subtitle={lead ? `Modifying record #${lead.id} — ${lead.name}` : undefined}
        action={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Edit3 className="h-4 w-4" />
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : lead ? (
          <LeadForm
            defaultValues={{
              name: lead.name,
              email: lead.email,
              phone: lead.phone || '',
              status: lead.status,
            }}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            submitLabel="Save Changes"
            onCancel={() => navigate(`/leads/${lead.id}`)}
            apiError={apiError}
          />
        ) : null}
      </Card>
    </div>
  );
};

export default EditLeadPage;
