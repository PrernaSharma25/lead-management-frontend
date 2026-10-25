import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { CreateLeadPayload, LeadStatus } from '../../../types/lead.types';
import { leadFormSchema, LeadFormData } from '../schemas/lead.schema';

export interface LeadFormProps {
  defaultValues?: Partial<LeadFormData>;
  onSubmit: (data: CreateLeadPayload) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  apiError?: string | null;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export const LeadForm: React.FC<LeadFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Lead',
  onCancel,
  apiError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      status: (defaultValues?.status as LeadStatus) || 'new',
    },
  });

  const isPending = isLoading || isSubmitting;

  const handleFormSubmit = async (data: LeadFormData) => {
    await onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone && data.phone.trim().length > 0 ? data.phone.trim() : null,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 animate-in fade-in-50">
          {apiError}
        </div>
      )}

      {/* Name Field */}
      <Input
        label="Full Name"
        required
        placeholder="e.g. Sarah Connor"
        prefixIcon={<User className="h-4 w-4" />}
        error={errors.name?.message}
        disabled={isPending}
        {...register('name')}
      />

      {/* Email Field */}
      <Input
        label="Email Address"
        required
        type="email"
        placeholder="e.g. sarah.connor@cyberdyne.com"
        prefixIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        disabled={isPending}
        {...register('email')}
      />

      {/* Phone Field */}
      <Input
        label="Phone Number"
        type="tel"
        placeholder="e.g. +1-555-0199 (optional)"
        prefixIcon={<Phone className="h-4 w-4" />}
        helperText="Optional contact number with country code"
        error={errors.phone?.message}
        disabled={isPending}
        {...register('phone')}
      />

      {/* Status Field */}
      <Select
        label="Lead Status"
        required
        options={STATUS_OPTIONS}
        error={errors.status?.message}
        disabled={isPending}
        {...register('status')}
      />

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
