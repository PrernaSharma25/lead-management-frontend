import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadsListPage from './LeadsListPage';
import { renderWithProviders } from '../../../test/test-utils';
import leadsApi from '../../../services/leads-api';
import { Lead } from '../../../types/lead.types';

vi.mock('../../../services/leads-api');

const mockLeads: Lead[] = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+1-555-0199',
    status: 'new',
    createdAt: '2026-10-25T12:00:00.000Z',
    _count: { notes: 3 },
  },
  {
    id: 2,
    name: 'John Connor',
    email: 'john@example.com',
    phone: null,
    status: 'qualified',
    createdAt: '2026-10-25T13:00:00.000Z',
    _count: { notes: 1 },
  },
];

describe('LeadsListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders leads list with data from API', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: mockLeads,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    renderWithProviders(<LeadsListPage />);

    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();

    await waitFor(() => {
      // In both desktop and mobile views
      expect(screen.getAllByText('Sarah Connor')[0]).toBeInTheDocument();
      expect(screen.getAllByText('John Connor')[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText('sarah@example.com')[0]).toBeInTheDocument();
  });

  it('filters leads by status tab click', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: [mockLeads[0]],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const user = userEvent.setup();
    renderWithProviders(<LeadsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Sarah Connor')[0]).toBeInTheDocument();
    });

    // Click 'New' status tab
    const newTab = screen.getByRole('button', { name: 'New' });
    await user.click(newTab);

    await waitFor(() => {
      expect(leadsApi.getLeads).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'new' }),
        expect.anything(),
      );
    });
  });

  it('searches leads with debouncing', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: [mockLeads[1]],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const user = userEvent.setup();
    renderWithProviders(<LeadsListPage />);

    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    await user.type(searchInput, 'John');

    await waitFor(
      () => {
        expect(leadsApi.getLeads).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'John' }),
          expect.anything(),
        );
      },
      { timeout: 1000 },
    );
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: mockLeads,
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });

    const user = userEvent.setup();
    renderWithProviders(<LeadsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Sarah Connor')[0]).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText('Delete Sarah Connor');
    await user.click(deleteBtn);

    // Modal should now be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Permanent Action Warning/i)).toBeInTheDocument();
  });
});
