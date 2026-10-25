import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { CreateLeadPayload } from '../../../types/lead.types';
import leadsApi from '../../../services/leads-api';
import { useToast } from '../../../hooks/useToast';
import { formatErrorMessage } from '../../../utils/errors';

export const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateLeadPayload) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const created = await leadsApi.createLead(payload);
      success('Lead created successfully', `${created.name} was added to the pipeline.`);
      navigate(`/leads/${created.id}`);
    } catch (err: unknown) {
      const msg = formatErrorMessage(err);
      setApiError(msg);
      toastError('Creation failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Back button and page heading */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leads')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          aria-label="Back to leads list"
        >
          Back
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Create New Lead
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Add a prospective customer contact to your CRM pipeline.
          </p>
        </div>
      </div>

      <Card
        title="Lead Information"
        subtitle="Fill in the contact details and initial pipeline stage"
        action={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <UserPlus className="h-4 w-4" />
          </div>
        }
      >
        <LeadForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Lead"
          onCancel={() => navigate('/leads')}
          apiError={apiError}
        />
      </Card>
    </div>
  );
};

export default CreateLeadPage;
