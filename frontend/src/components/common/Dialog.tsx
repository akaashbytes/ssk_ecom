import React from 'react';
import { Modal, ModalProps } from './Modal';
import { Button } from './Button';

export interface DialogProps extends Omit<ModalProps, 'footer'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'amber' | 'danger';
  isConfirmLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onClose,
  confirmVariant = 'amber',
  isConfirmLoading = false,
  children,
  ...props
}) => {
  const footer = (
    <>
      {cancelText && (
        <Button variant="secondary" onClick={onClose} disabled={isConfirmLoading}>
          {cancelText}
        </Button>
      )}
      <Button
        variant={confirmVariant}
        onClick={onConfirm || onClose}
        isLoading={isConfirmLoading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal onClose={onClose} footer={footer} {...props}>
      {children}
    </Modal>
  );
};
