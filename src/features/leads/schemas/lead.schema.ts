import { z } from 'zod';

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone cannot exceed 30 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['new', 'contacted', 'qualified', 'lost'] as const),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
