import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateLeadPage from './CreateLeadPage';
import { renderWithProviders } from '../../../test/test-utils';
import leadsApi from '../../../services/leads-api';
import { ApiError } from '../../../utils/errors';

vi.mock('../../../services/leads-api');

describe('CreateLeadPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('validates required fields and email format before submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateLeadPage />);

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await user.click(submitBtn);

    // Validation messages
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    expect(leadsApi.createLead).not.toHaveBeenCalled();

    // Type invalid email
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('submits valid lead data and triggers API call', async () => {
    vi.mocked(leadsApi.createLead).mockResolvedValue({
      id: 99,
      name: 'Michael Scott',
      email: 'michael.scott@dundermifflin.com',
      phone: '+1-555-0123',
      status: 'contacted',
      createdAt: '2026-10-25T14:00:00.000Z',
    });

    const user = userEvent.setup();
    renderWithProviders(<CreateLeadPage />);

    await user.type(screen.getByLabelText(/full name/i), 'Michael Scott');
    await user.type(screen.getByLabelText(/email address/i), 'michael.scott@dundermifflin.com');
    await user.type(screen.getByLabelText(/phone number/i), '+1-555-0123');
    await user.selectOptions(screen.getByLabelText(/lead status/i), 'contacted');

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(leadsApi.createLead).toHaveBeenCalledWith({
        name: 'Michael Scott',
        email: 'michael.scott@dundermifflin.com',
        phone: '+1-555-0123',
        status: 'contacted',
      });
    });
  });

  it('displays API error when backend rejects submission with conflict', async () => {
    vi.mocked(leadsApi.createLead).mockRejectedValue(
      new ApiError(409, 'DUPLICATE_RESOURCE', 'A record with this unique field already exists'),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateLeadPage />);

    await user.type(screen.getByLabelText(/full name/i), 'Dwight Schrute');
    await user.type(screen.getByLabelText(/email address/i), 'dwight@dundermifflin.com');

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/A record with this unique field already exists/i),
      ).toBeInTheDocument();
    });
  });
});
