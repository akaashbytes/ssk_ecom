import React from 'react';
import { useToastStore, ToastItem, ToastType } from '../../stores/useToastStore';
import { CheckIcon, AlertTriangleIcon, XIcon, InfoIcon } from './Icons';

export const Toast: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const borderVariants: Record<ToastType, string> = {
    success: 'border-l-4 border-l-functional-success text-functional-success',
    warning: 'border-l-4 border-l-functional-warning text-functional-warning',
    error: 'border-l-4 border-l-functional-error text-functional-error',
    info: 'border-l-4 border-l-functional-info text-functional-info',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckIcon size={18} />,
    warning: <AlertTriangleIcon size={18} />,
    error: <XIcon size={18} />,
    info: <InfoIcon size={18} />,
  };

  return (
    <div
      role="alert"
      className={`p-3.5 bg-white border border-surface-border rounded-r-xl rounded-l-sm shadow-card flex items-start gap-3 w-80 sm:w-96 transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
        borderVariants[toast.type]
      }`}
    >
      <div className="pt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded transition cursor-pointer"
        aria-label="Dismiss notification"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-32px)]"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
