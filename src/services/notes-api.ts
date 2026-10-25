import { CreateNotePayload, Note, SingleResponse } from '../types/lead.types';
import apiClient from './api-client';

export const notesApi = {
  /**
   * Retrieve all notes for a specific lead ordered newest first
   */
  async getNotes(leadId: number, signal?: AbortSignal): Promise<Note[]> {
    const response = await apiClient.get<SingleResponse<Note[]>>(`/api/leads/${leadId}/notes`, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Add a note to a specific lead
   */
  async createNote(leadId: number, payload: CreateNotePayload): Promise<Note> {
    const response = await apiClient.post<SingleResponse<Note>>(`/api/leads/${leadId}/notes`, {
      content: payload.content.trim(),
    });
    return response.data.data;
  },
};

export default notesApi;
