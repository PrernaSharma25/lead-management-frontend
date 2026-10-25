export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  createdAt: string;
  _count?: {
    notes: number;
  };
}

export interface Note {
  id: number;
  leadId: number;
  content: string;
  createdAt: string;
}

export interface LeadWithNotes extends Lead {
  notes: Note[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface LeadQueryParams {
  search?: string;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string | null;
  status?: LeadStatus;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  status?: LeadStatus;
}

export interface CreateNotePayload {
  content: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  lostLeads: number;
  conversionRate: number;
}
