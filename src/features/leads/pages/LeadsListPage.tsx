import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  Users,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import LeadStatusBadge from '../components/LeadStatusBadge';
import DeleteLeadModal from '../components/DeleteLeadModal';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { Lead, LeadStatus, PaginationMeta } from '../../../types/lead.types';
import leadsApi from '../../../services/leads-api';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import { formatDateShort } from '../../../utils/date';
import { formatErrorMessage, isRequestCanceled } from '../../../utils/errors';
import { getInitials } from '../../../utils/formatters';

const STATUS_FILTERS: { key: LeadStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Leads' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'lost', label: 'Lost' },
];

export const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  // Search and filter state from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = (searchParams.get('status') as LeadStatus) || undefined;
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialLimit = Number(searchParams.get('limit')) || 10;

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>(initialStatus || 'all');
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Data & loading states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lead deletion state
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (newSearch: string, newStatus: LeadStatus | 'all', newPage: number, newLimit: number) => {
      const currentSearch = searchParams.get('search') || '';
      const currentStatus = searchParams.get('status') || 'all';
      const currentPage = Number(searchParams.get('page')) || 1;
      const currentLimit = Number(searchParams.get('limit')) || 10;

      if (
        currentSearch === newSearch &&
        currentStatus === newStatus &&
        currentPage === newPage &&
        currentLimit === newLimit
      ) {
        return;
      }

      const params = new URLSearchParams();
      if (newSearch) params.set('search', newSearch);
      if (newStatus !== 'all') params.set('status', newStatus);
      if (newPage > 1) params.set('page', String(newPage));
      if (newLimit !== 10) params.set('limit', String(newLimit));
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Fetch leads from backend
  const fetchLeads = useCallback(
    async (
      search: string,
      status: LeadStatus | 'all',
      currentPage: number,
      currentLimit: number,
      signal?: AbortSignal,
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await leadsApi.getLeads(
          {
            search: search.trim() || undefined,
            status: status === 'all' ? undefined : status,
            page: currentPage,
            limit: currentLimit,
          },
          signal,
        );

        if (signal?.aborted) return;

        setLeads(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            total: response.data.length,
            page: currentPage,
            limit: currentLimit,
            totalPages: 1,
          });
        }
      } catch (err: unknown) {
        if (isRequestCanceled(err) || signal?.aborted) {
          return;
        }
        setError(formatErrorMessage(err));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  // Trigger fetch when search, status, page, or limit changes
  useEffect(() => {
    updateUrlParams(debouncedSearch, statusFilter, page, limit);

    const controller = new AbortController();
    fetchLeads(debouncedSearch, statusFilter, page, limit, controller.signal);

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, statusFilter, page, limit, fetchLeads, updateUrlParams]);

  // Reset page to 1 when search or status filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilterChange = (status: LeadStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  // Handle lead deletion
  const handleDeleteConfirm = async (leadId: number) => {
    try {
      await leadsApi.deleteLead(leadId);
      success('Lead deleted', 'Lead and associated notes were removed successfully.');
      // Refresh leads list
      fetchLeads(debouncedSearch, statusFilter, page, limit);
    } catch (err: unknown) {
      toastError('Delete failed', formatErrorMessage(err));
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header with Title and Add Lead Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Leads</h1>
            {!isLoading && (
              <span className="rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {pagination.total} {pagination.total === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your sales pipeline, contact details, and communication notes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/leads/new')}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Lead
        </Button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusFilterChange(tab.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Leads Table / Card Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-soft overflow-hidden">
        {error && !isLoading ? (
          <ErrorState
            title="Unable to load leads"
            message={error}
            onRetry={() => fetchLeads(debouncedSearch, statusFilter, page, limit)}
          />
        ) : isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`lead-skel-${i}`} className="flex items-center gap-4 py-2">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title={
              debouncedSearch || statusFilter !== 'all'
                ? 'No matching leads found'
                : 'No leads registered yet'
            }
            description={
              debouncedSearch || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter to find what you are looking for.'
                : 'Start organizing your sales pipeline by adding your very first lead.'
            }
            icon={<Users className="h-8 w-8 text-brand-600" />}
            actionLabel={
              debouncedSearch || statusFilter !== 'all' ? 'Reset Filters' : 'Add First Lead'
            }
            onAction={
              debouncedSearch || statusFilter !== 'all'
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPage(1);
                  }
                : () => navigate('/leads/new')
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Lead Contact</th>
                    <th className="px-6 py-3.5">Phone Number</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Notes</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Name & Email with Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-semibold text-brand-700 ring-2 ring-brand-100/50">
                            {getInitials(lead.name)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/leads/${lead.id}`}
                              className="font-semibold text-slate-900 hover:text-brand-600 transition block truncate"
                            >
                              {lead.name}
                            </Link>
                            <span className="text-xs text-slate-500 block truncate">
                              {lead.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {lead.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{lead.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      {/* Note Count Badge */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="View lead notes"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lead._count?.notes ?? 0}</span>
                        </Link>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDateShort(lead.createdAt)}</span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition"
                            title="View lead details and notes"
                            aria-label={`View ${lead.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                            title="Edit lead"
                            aria-label={`Edit ${lead.name}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete lead"
                            aria-label={`Delete ${lead.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card Layout */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-semibold text-brand-700 ring-2 ring-brand-100/50">
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-semibold text-slate-900 hover:text-brand-600 transition"
                        >
                          {lead.name}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      </div>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lead.phone || <span className="text-slate-400">No phone</span>}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDateShort(lead.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lead._count?.notes ?? 0} notes</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/leads/${lead.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setLeadToDelete(lead)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-slate-100 px-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                limit={pagination.limit}
                onPageChange={(newPage) => setPage(newPage)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteLeadModal
        isOpen={Boolean(leadToDelete)}
        lead={leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LeadsListPage;
