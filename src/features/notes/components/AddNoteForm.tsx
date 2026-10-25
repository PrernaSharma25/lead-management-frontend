import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../../../components/ui/Button';

export interface AddNoteFormProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddNoteForm: React.FC<AddNoteFormProps> = ({ onSubmit, isLoading = false }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_CHARS = 2000;
  const charsRemaining = MAX_CHARS - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      setError('Note content cannot be empty');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Note content cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(trimmed);
      setContent('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add note. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="note-content" className="sr-only">
          Add a note
        </label>
        <div className="relative">
          <textarea
            id="note-content"
            rows={3}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            disabled={isPending}
            placeholder="Type a new update, call summary, or reminder for this lead..."
            className={`w-full rounded-xl border bg-white p-3.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-brand-500'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error ? (
            <p className="text-xs font-medium text-rose-600 animate-in fade-in-50">{error}</p>
          ) : (
            <span
              className={`text-xs ${
                charsRemaining < 100 ? 'text-amber-600 font-medium' : 'text-slate-400'
              }`}
            >
              {content.length}/{MAX_CHARS} characters
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isPending}
          disabled={!content.trim() || isPending}
          leftIcon={<Send className="h-3.5 w-3.5" />}
        >
          Add Note
        </Button>
      </div>
    </form>
  );
};

export default AddNoteForm;
