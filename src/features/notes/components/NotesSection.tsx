import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { Note } from '../../../types/lead.types';
import NoteItem from './NoteItem';
import AddNoteForm from './AddNoteForm';
import Skeleton from '../../../components/ui/Skeleton';

export interface NotesSectionProps {
  notes: Note[];
  isLoading: boolean;
  onAddNote: (content: string) => Promise<void>;
  isAddingNote?: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isLoading,
  onAddNote,
  isAddingNote = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Header and Add Note Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-brand-600" />
          <span>Add Communication Note</span>
        </h3>
        <AddNoteForm onSubmit={onAddNote} isLoading={isAddingNote} />
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Activity Timeline ({notes.length})
          </h4>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-white">
            <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">No notes recorded yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Use the form above to log call summaries, updates, or next steps for this lead.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
