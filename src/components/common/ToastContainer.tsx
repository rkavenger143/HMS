import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />,
  error: <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />,
  warning: <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />,
  info: <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {ICONS[toast.type]}
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-message">{toast.message}</div>}
          </div>
          <button
            className="btn btn-ghost btn-icon btn-icon-sm"
            onClick={() => removeToast(toast.id)}
            style={{ flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
