import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteLeadModal from './DeleteLeadModal';
import { Lead } from '../../../types/lead.types';

const mockLead: Lead = {
  id: 7,
  name: 'Kelly Kapoor',
  email: 'kelly@dundermifflin.com',
  phone: '+1-555-0177',
  status: 'new',
  createdAt: '2026-10-25T11:00:00.000Z',
};

describe('DeleteLeadModal', () => {
  it('renders confirmation dialog warning about cascading note deletion', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <DeleteLeadModal
        isOpen={true}
        lead={mockLead}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Lead')).toBeInTheDocument();
    expect(screen.getByText('Kelly Kapoor')).toBeInTheDocument();
    expect(screen.getByText(/cascading delete/i)).toBeInTheDocument();
  });

  it('calls onConfirm only after user explicitly clicks confirm button', async () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <DeleteLeadModal
        isOpen={true}
        lead={mockLead}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    expect(handleConfirm).not.toHaveBeenCalled();

    const confirmBtn = screen.getByRole('button', { name: /yes, delete lead/i });
    await user.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith(7);
  });
});
