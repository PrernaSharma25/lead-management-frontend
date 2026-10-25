import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddNoteForm from './AddNoteForm';

describe('AddNoteForm', () => {
  it('prevents submission when note content is empty', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<AddNoteForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /add note/i });
    expect(submitBtn).toBeDisabled();

    // Type whitespace only
    const textarea = screen.getByPlaceholderText(/type a new update/i);
    await user.type(textarea, '   ');
    expect(submitBtn).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed content and clears textarea on success', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<AddNoteForm onSubmit={handleSubmit} />);

    const textarea = screen.getByPlaceholderText(/type a new update/i);
    await user.type(textarea, '  Follow-up scheduled for Monday  ');

    const submitBtn = screen.getByRole('button', { name: /add note/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('Follow-up scheduled for Monday');
      expect(textarea).toHaveValue('');
    });
  });
});
