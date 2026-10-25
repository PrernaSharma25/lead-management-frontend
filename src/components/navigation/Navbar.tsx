import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, User, Activity, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import leadsApi from '../../services/leads-api';

export interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        await leadsApi.checkHealth();
        if (isMounted) setIsBackendOnline(true);
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) {
      return [{ label: 'Dashboard', path: '/' }];
    }

    const breadcrumbs = [{ label: 'Home', path: '/' }];
    let accumulatedPath = '';

    paths.forEach((segment) => {
      accumulatedPath += `/${segment}`;
      if (segment === 'leads') {
        breadcrumbs.push({ label: 'Leads', path: '/leads' });
      } else if (segment === 'new') {
        breadcrumbs.push({ label: 'Create Lead', path: accumulatedPath });
      } else if (segment === 'edit') {
        breadcrumbs.push({ label: 'Edit', path: accumulatedPath });
      } else if (!isNaN(Number(segment))) {
        breadcrumbs.push({ label: `Lead #${segment}`, path: accumulatedPath });
      } else {
        breadcrumbs.push({ label: segment, path: accumulatedPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                {isLast ? (
                  <span className="font-semibold text-slate-800">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="text-slate-500 hover:text-slate-700 transition">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick actions, Health badge, and User profile */}
      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div
          title={
            isBackendOnline === true
              ? 'Backend API is connected and healthy'
              : isBackendOnline === false
                ? 'Backend API is offline or unreachable on http://localhost:3000'
                : 'Checking API health...'
          }
          className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
        >
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-500 animate-pulse'
                : isBackendOnline === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-medium">
            {isBackendOnline === true
              ? 'API Online'
              : isBackendOnline === false
                ? 'API Offline'
                : 'Connecting'}
          </span>
        </div>

        {/* Quick Add Lead Button */}
        {location.pathname !== '/leads/new' && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => navigate('/leads/new')}
          >
            <span className="hidden xs:inline">Add Lead</span>
          </Button>
        )}

        {/* User profile placeholder */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold ring-2 ring-brand-50">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold leading-none text-slate-800">Prerna Sharma</p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Lead Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
