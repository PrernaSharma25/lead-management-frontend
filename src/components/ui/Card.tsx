import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white shadow-soft transition-all ${className}`}
    >
      {(header || title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          {header ? (
            header
          ) : (
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
