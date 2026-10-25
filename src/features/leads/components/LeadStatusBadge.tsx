import React from 'react';
import { LeadStatus } from '../../../types/lead.types';
import { formatStatusLabel, getStatusTheme } from '../../../utils/formatters';

export interface LeadStatusBadgeProps {
  status: LeadStatus;
  showDot?: boolean;
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const theme = getStatusTheme(status);
  const label = formatStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${theme.badge} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};

export default LeadStatusBadge;
