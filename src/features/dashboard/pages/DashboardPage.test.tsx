import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import { renderWithProviders } from '../../../test/test-utils';
import leadsApi from '../../../services/leads-api';
import { Lead } from '../../../types/lead.types';

vi.mock('../../../services/leads-api');

const mockRecentLeads: Lead[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0101',
    status: 'qualified',
    createdAt: '2026-10-25T10:00:00.000Z',
    _count: { notes: 2 },
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: null,
    status: 'new',
    createdAt: '2026-10-25T11:00:00.000Z',
    _count: { notes: 0 },
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders dashboard statistics and recent leads from API data', async () => {
    vi.mocked(leadsApi.getLeads).mockImplementation(async (params) => {
      if (params?.status === 'new') {
        return {
          success: true,
          data: [],
          pagination: { total: 4, page: 1, limit: 1, totalPages: 4 },
        };
      }
      if (params?.status === 'contacted') {
        return {
          success: true,
          data: [],
          pagination: { total: 3, page: 1, limit: 1, totalPages: 3 },
        };
      }
      if (params?.status === 'qualified') {
        return {
          success: true,
          data: [],
          pagination: { total: 2, page: 1, limit: 1, totalPages: 2 },
        };
      }
      if (params?.status === 'lost') {
        return {
          success: true,
          data: [],
          pagination: { total: 1, page: 1, limit: 1, totalPages: 1 },
        };
      }
      return {
        success: true,
        data: mockRecentLeads,
        pagination: { total: 10, page: 1, limit: 5, totalPages: 2 },
      };
    });

    renderWithProviders(<DashboardPage />);

    // Check heading
    expect(screen.getByText('Pipeline Dashboard')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // total leads
    expect(screen.getByText('20%')).toBeInTheDocument(); // 2 / 10 = 20% conversion rate
  });

  it('renders an empty state when there are no leads in the database', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 5, totalPages: 0 },
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No leads in database yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Create First Lead')).toBeInTheDocument();
  });

  it('renders error state with retry button when API fails', async () => {
    vi.mocked(leadsApi.getLeads).mockRejectedValue(new Error('Network connection error'));

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load CRM Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry Request')).toBeInTheDocument();

    // Clicking retry calls getLeads again
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: mockRecentLeads,
      pagination: { total: 2, page: 1, limit: 5, totalPages: 1 },
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Retry Request'));

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });
});
