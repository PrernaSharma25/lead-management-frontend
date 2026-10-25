import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Lead } from '../../../types/lead.types';

export interface DeleteLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (leadId: number) => Promise<void>;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!lead) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(lead.id);
      onClose();
    } catch {
      // Error handling is handled by parent or toast, but keep dialog open so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title="Delete Lead"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 border border-rose-100 text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block text-rose-800">Permanent Action Warning</span>
            Deleting this lead will permanently remove{' '}
            <strong className="font-semibold text-rose-950">{lead.name}</strong> ({lead.email}). All
            attached communication notes and activity history will be deleted via cascading delete.
            This cannot be undone.
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Are you sure you want to permanently delete this lead record?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<AlertTriangle className="h-4 w-4" />}
          >
            Yes, Delete Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteLeadModal;
