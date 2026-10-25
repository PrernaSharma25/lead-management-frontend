import React from 'react';
import { DashboardStats } from '../../../types/lead.types';

export interface PipelineChartProps {
  stats: DashboardStats;
}

export const PipelineChart: React.FC<PipelineChartProps> = ({ stats }) => {
  const { totalLeads, newLeads, contactedLeads, qualifiedLeads, lostLeads } = stats;

  if (totalLeads === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
        <p className="text-xs text-slate-500">
          No leads registered yet. Add your first lead to see the pipeline breakdown.
        </p>
      </div>
    );
  }

  const newPct = Math.round((newLeads / totalLeads) * 100) || 0;
  const contactedPct = Math.round((contactedLeads / totalLeads) * 100) || 0;
  const qualifiedPct = Math.round((qualifiedLeads / totalLeads) * 100) || 0;
  const lostPct = Math.round((lostLeads / totalLeads) * 100) || 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50">
        {newPct > 0 && (
          <div
            style={{ width: `${newPct}%` }}
            className="bg-blue-500 transition-all duration-500"
            title={`New: ${newLeads} (${newPct}%)`}
          />
        )}
        {contactedPct > 0 && (
          <div
            style={{ width: `${contactedPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Contacted: ${contactedLeads} (${contactedPct}%)`}
          />
        )}
        {qualifiedPct > 0 && (
          <div
            style={{ width: `${qualifiedPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Qualified: ${qualifiedLeads} (${qualifiedPct}%)`}
          />
        )}
        {lostPct > 0 && (
          <div
            style={{ width: `${lostPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Lost: ${lostLeads} (${lostPct}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <div className="text-xs">
            <span className="text-slate-500">New: </span>
            <strong className="text-slate-800">{newLeads}</strong>
            <span className="text-slate-400 text-[10px] ml-1">({newPct}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div className="text-xs">
            <span className="text-slate-500">Contacted: </span>
            <strong className="text-slate-800">{contactedLeads}</strong>
            <span className="text-slate-400 text-[10px] ml-1">({contactedPct}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div className="text-xs">
            <span className="text-slate-500">Qualified: </span>
            <strong className="text-slate-800">{qualifiedLeads}</strong>
            <span className="text-slate-400 text-[10px] ml-1">({qualifiedPct}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <div className="text-xs">
            <span className="text-slate-500">Lost: </span>
            <strong className="text-slate-800">{lostLeads}</strong>
            <span className="text-slate-400 text-[10px] ml-1">({lostPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineChart;
