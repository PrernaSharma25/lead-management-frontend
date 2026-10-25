import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import EditLeadPage from './EditLeadPage';
import { renderWithProviders } from '../../../test/test-utils';
import leadsApi from '../../../services/leads-api';
import { LeadWithNotes } from '../../../types/lead.types';

vi.mock('../../../services/leads-api');

const mockLead: LeadWithNotes = {
  id: 15,
  name: 'Jim Halpert',
  email: 'jim@dundermifflin.com',
  phone: '+1-555-0155',
  status: 'contacted',
  createdAt: '2026-10-25T08:00:00.000Z',
  notes: [],
};

describe('EditLeadPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('prepopulates form with existing lead data and sends PATCH request on submit', async () => {
    vi.mocked(leadsApi.getLeadById).mockResolvedValue(mockLead);
    vi.mocked(leadsApi.updateLead).mockResolvedValue({
      ...mockLead,
      name: 'Jim Halpert Jr',
      status: 'qualified',
    });

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/leads/:id/edit" element={<EditLeadPage />} />
      </Routes>,
      { initialEntries: ['/leads/15/edit'] },
    );

    // Verify fields are prepopulated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jim Halpert')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jim@dundermifflin.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1-555-0155')).toBeInTheDocument();
    });

    // Update name and status
    const nameInput = screen.getByDisplayValue('Jim Halpert');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jim Halpert Jr');

    const statusSelect = screen.getByLabelText(/lead status/i);
    await user.selectOptions(statusSelect, 'qualified');

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(leadsApi.updateLead).toHaveBeenCalledWith(15, {
        name: 'Jim Halpert Jr',
        email: 'jim@dundermifflin.com',
        phone: '+1-555-0155',
        status: 'qualified',
      });
    });
  });
});
