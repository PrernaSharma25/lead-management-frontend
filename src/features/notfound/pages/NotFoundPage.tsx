import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 mb-6 ring-8 ring-brand-50/50 shadow-soft">
        <Compass className="h-10 w-10 text-brand-600 animate-pulse" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          leftIcon={<Home className="h-4 w-4" />}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
