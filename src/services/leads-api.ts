import {
  CreateLeadPayload,
  Lead,
  LeadQueryParams,
  LeadWithNotes,
  PaginatedResponse,
  SingleResponse,
  UpdateLeadPayload,
} from '../types/lead.types';
import apiClient from './api-client';

export const leadsApi = {
  /**
   * List, search, filter, and paginate leads
   */
  async getLeads(
    params: LeadQueryParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Lead>> {
    const query: Record<string, string | number> = {};

    if (params.page !== undefined && params.page > 0) {
      query.page = params.page;
    }
    if (params.limit !== undefined && params.limit > 0) {
      query.limit = params.limit;
    }
    if (params.search && params.search.trim().length > 0) {
      query.search = params.search.trim();
    }
    if (params.status) {
      query.status = params.status;
    }

    const response = await apiClient.get<PaginatedResponse<Lead>>('/api/leads', {
      params: query,
      signal,
    });
    return response.data;
  },

  /**
   * Get single lead by ID with associated notes
   */
  async getLeadById(id: number, signal?: AbortSignal): Promise<LeadWithNotes> {
    const response = await apiClient.get<SingleResponse<LeadWithNotes>>(`/api/leads/${id}`, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Create a new lead
   */
  async createLead(payload: CreateLeadPayload): Promise<Lead> {
    const response = await apiClient.post<SingleResponse<Lead>>('/api/leads', {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone && payload.phone.trim().length > 0 ? payload.phone.trim() : null,
      status: payload.status || 'new',
    });
    return response.data.data;
  },

  /**
   * Update an existing lead (PATCH)
   */
  async updateLead(id: number, payload: UpdateLeadPayload): Promise<Lead> {
    const body: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      body.name = payload.name.trim();
    }
    if (payload.email !== undefined) {
      body.email = payload.email.trim().toLowerCase();
    }
    if (payload.phone !== undefined) {
      body.phone = payload.phone && payload.phone.trim().length > 0 ? payload.phone.trim() : null;
    }
    if (payload.status !== undefined) {
      body.status = payload.status;
    }

    const response = await apiClient.patch<SingleResponse<Lead>>(`/api/leads/${id}`, body);
    return response.data.data;
  },

  /**
   * Delete a lead by ID (cascades notes)
   */
  async deleteLead(id: number): Promise<void> {
    await apiClient.delete(`/api/leads/${id}`);
  },

  /**
   * Check backend health
   */
  async checkHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
    const response = await apiClient.get<{ status: string; uptime: number; timestamp: string }>(
      '/health',
    );
    return response.data;
  },
};

export default leadsApi;
