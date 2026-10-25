import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import LeadDetailPage from './LeadDetailPage';
import { renderWithProviders } from '../../../test/test-utils';
import leadsApi from '../../../services/leads-api';
import notesApi from '../../../services/notes-api';
import { LeadWithNotes } from '../../../types/lead.types';
import { ApiError } from '../../../utils/errors';

vi.mock('../../../services/leads-api');
vi.mock('../../../services/notes-api');

const mockLeadWithNotes: LeadWithNotes = {
  id: 42,
  name: 'Pam Beesly',
  email: 'pam@dundermifflin.com',
  phone: '+1-555-0188',
  status: 'contacted',
  createdAt: '2026-10-25T09:00:00.000Z',
  notes: [
    {
      id: 101,
      leadId: 42,
      content: 'Called regarding contract renewal. She asked for updated pricing.',
      createdAt: '2026-10-25T09:30:00.000Z',
    },
  ],
};

describe('LeadDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders lead details and existing notes correctly', async () => {
    vi.mocked(leadsApi.getLeadById).mockResolvedValue(mockLeadWithNotes);

    renderWithProviders(
      <Routes>
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>,
      { initialEntries: ['/leads/42'] },
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pam Beesly' })).toBeInTheDocument();
    });

    expect(screen.getByText('pam@dundermifflin.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0188')).toBeInTheDocument();
    expect(screen.getByText(/She asked for updated pricing/i)).toBeInTheDocument();
  });

  it('adds a new note and appends it to the activity timeline', async () => {
    vi.mocked(leadsApi.getLeadById).mockResolvedValue(mockLeadWithNotes);
    vi.mocked(notesApi.createNote).mockResolvedValue({
      id: 102,
      leadId: 42,
      content: 'Sent revised enterprise proposal by email.',
      createdAt: '2026-10-25T10:00:00.000Z',
    });

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>,
      { initialEntries: ['/leads/42'] },
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pam Beesly' })).toBeInTheDocument();
    });

    const noteTextarea = screen.getByPlaceholderText(/type a new update/i);
    await user.type(noteTextarea, 'Sent revised enterprise proposal by email.');

    const addNoteBtn = screen.getByRole('button', { name: /add note/i });
    await user.click(addNoteBtn);

    await waitFor(() => {
      expect(notesApi.createNote).toHaveBeenCalledWith(42, {
        content: 'Sent revised enterprise proposal by email.',
      });
      expect(screen.getByText('Sent revised enterprise proposal by email.')).toBeInTheDocument();
    });
  });

  it('displays not-found empty state when lead ID does not exist (404)', async () => {
    vi.mocked(leadsApi.getLeadById).mockRejectedValue(
      new ApiError(404, 'NOT_FOUND', 'Requested record does not exist'),
    );

    renderWithProviders(
      <Routes>
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>,
      { initialEntries: ['/leads/999'] },
    );

    await waitFor(() => {
      expect(screen.getByText('Lead Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText('Return to Leads')).toBeInTheDocument();
  });
});
