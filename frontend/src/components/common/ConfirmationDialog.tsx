import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangleIcon, InfoIcon } from './Icons';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        variant={isDestructive ? 'danger' : 'amber'}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full shrink-0 ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isDestructive ? <AlertTriangleIcon size={24} /> : <InfoIcon size={24} />}
        </div>
        <div>
          <h4 className="text-base font-bold text-brand-slate leading-tight">{title}</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
