import React, { useEffect } from 'react';
import { XIcon } from './Icons';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${sizeStyles[size]} bg-white rounded-2xl shadow-modal border border-surface-border overflow-hidden z-10 transition-transform duration-200 animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-brand-slate leading-tight">{title}</h3>
              )}
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-4 border-t border-slate-100 bg-surface-subtle flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
