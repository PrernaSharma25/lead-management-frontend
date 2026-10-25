import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  PhoneCall,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  Clock,
  Eye,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import PipelineChart from '../components/PipelineChart';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LeadStatusBadge from '../../leads/components/LeadStatusBadge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { DashboardStats, Lead } from '../../../types/lead.types';
import leadsApi from '../../../services/leads-api';
import { formatRelativeTime } from '../../../utils/date';
import { formatErrorMessage, isRequestCanceled } from '../../../utils/errors';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch overview and status counts in parallel from real backend
      const [allRes, newRes, contactedRes, qualifiedRes, lostRes] = await Promise.all([
        leadsApi.getLeads({ page: 1, limit: 5 }, signal),
        leadsApi.getLeads({ status: 'new', limit: 1 }, signal),
        leadsApi.getLeads({ status: 'contacted', limit: 1 }, signal),
        leadsApi.getLeads({ status: 'qualified', limit: 1 }, signal),
        leadsApi.getLeads({ status: 'lost', limit: 1 }, signal),
      ]);

      const total = allRes.pagination?.total ?? allRes.data.length;
      const countNew = newRes.pagination?.total ?? 0;
      const countContacted = contactedRes.pagination?.total ?? 0;
      const countQualified = qualifiedRes.pagination?.total ?? 0;
      const countLost = lostRes.pagination?.total ?? 0;

      const rate = total > 0 ? Number(((countQualified / total) * 100).toFixed(1)) : 0;

      setStats({
        totalLeads: total,
        newLeads: countNew,
        contactedLeads: countContacted,
        qualifiedLeads: countQualified,
        lostLeads: countLost,
        conversionRate: rate,
      });

      setRecentLeads(allRes.data);
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
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchDashboardData]);

  if (error && !isLoading) {
    return (
      <div className="py-12">
        <ErrorState
          title="Unable to load CRM Dashboard"
          message={error}
          onRetry={() => fetchDashboardData()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pipeline Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time overview of lead generation, pipeline status, and customer interactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/leads')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View All Leads
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/leads/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`stat-skeleton-${i}`} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            icon={Users}
            colorScheme="brand"
            subtitle="Registered in portal"
            onClick={() => navigate('/leads')}
          />
          <StatCard
            title="New"
            value={stats.newLeads}
            icon={Sparkles}
            colorScheme="blue"
            subtitle="Awaiting initial outreach"
            onClick={() => navigate('/leads?status=new')}
          />
          <StatCard
            title="Contacted"
            value={stats.contactedLeads}
            icon={PhoneCall}
            colorScheme="amber"
            subtitle="Discussions underway"
            onClick={() => navigate('/leads?status=contacted')}
          />
          <StatCard
            title="Qualified"
            value={stats.qualifiedLeads}
            icon={CheckCircle}
            colorScheme="emerald"
            subtitle={`${stats.conversionRate}% conversion rate`}
            onClick={() => navigate('/leads?status=qualified')}
          />
          <StatCard
            title="Lost"
            value={stats.lostLeads}
            icon={XCircle}
            colorScheme="rose"
            subtitle="Closed or disqualified"
            onClick={() => navigate('/leads?status=lost')}
          />
        </div>
      )}

      {/* Pipeline Funnel & Conversion Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Pipeline Stage Distribution"
          subtitle="Proportion of active contacts across lifecycle stages"
          className="lg:col-span-2"
        >
          {isLoading ? <Skeleton className="h-20 rounded-xl" /> : <PipelineChart stats={stats} />}
        </Card>

        <Card title="Conversion Efficiency" subtitle="Lead progression to qualification">
          {isLoading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : (
            <div className="flex flex-col justify-center h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Qualification Rate</span>
                <span className="text-xl font-bold text-emerald-600">{stats.conversionRate}%</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                  className="bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
              <p className="text-xs text-slate-500">
                {stats.qualifiedLeads} of {stats.totalLeads} leads qualified successfully.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Leads Table & Quick Action */}
      <Card
        title="Recent Leads"
        subtitle="Recently registered leads and their current status"
        action={
          <Link
            to="/leads"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`recent-${i}`} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <EmptyState
            title="No leads in database yet"
            description="Your CRM is ready! Create your first lead record to begin tracking communications and qualifications."
            actionLabel="Create First Lead"
            onAction={() => navigate('/leads/new')}
          />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Lead Contact</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Added</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 transition"
                      >
                        {lead.name}
                      </Link>
                      <div className="text-xs text-slate-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      {lead.phone || <span className="text-slate-400">&mdash;</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{formatRelativeTime(lead.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
