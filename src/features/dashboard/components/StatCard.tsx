import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
  colorScheme?: 'brand' | 'blue' | 'amber' | 'emerald' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  colorScheme = 'brand',
  onClick,
}) => {
  const schemeStyles = {
    brand: {
      iconBg: 'bg-brand-50 text-brand-600',
      border: 'border-slate-200/80',
      accent: 'text-brand-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      accent: 'text-blue-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      accent: 'text-amber-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      accent: 'text-emerald-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      accent: 'text-rose-600',
    },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${scheme.border} bg-white p-5 shadow-soft transition-all duration-200 hover:shadow-card ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${scheme.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
