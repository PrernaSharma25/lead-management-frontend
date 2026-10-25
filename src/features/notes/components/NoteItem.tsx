import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { Note } from '../../../types/lead.types';
import { formatDate, formatRelativeTime } from '../../../utils/date';

export interface NoteItemProps {
  note: Note;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-soft transition-all hover:border-slate-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-2 ring-brand-50/50">
        <MessageSquare className="h-4.5 w-4.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-800">Internal Note</span>
          <div
            className="flex items-center gap-1 text-[11px] text-slate-400"
            title={formatDate(note.createdAt)}
          >
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(note.createdAt)}</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed break-words">
          {note.content}
        </p>
      </div>
    </div>
  );
};

export default NoteItem;
