import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import leadsApi from './services/leads-api';

vi.mock('./services/leads-api');

describe('App navigation & shell', () => {
  it('renders application shell with LeadHub branding and navigation links', async () => {
    vi.mocked(leadsApi.getLeads).mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
    vi.mocked(leadsApi.checkHealth).mockResolvedValue({
      status: 'ok',
      uptime: 100,
      timestamp: new Date().toISOString(),
    });

    render(<App />);

    // Branding in sidebar
    expect(screen.getByText('LeadHub')).toBeInTheDocument();
    expect(screen.getByText('Portal CRM')).toBeInTheDocument();

    // Navigation links
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Leads')[0]).toBeInTheDocument();

    // Wait for Dashboard heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pipeline Dashboard' })).toBeInTheDocument();
    });
  });
});
