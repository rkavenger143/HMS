import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { SettingsTab } from '../../context/SettingsContext';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
}

export default function ResetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
}: ResetConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: 440, width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="modal-title">Reset to Default Configuration</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {categoryName}
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to reset <strong>{categoryName}</strong> back to factory system defaults? All customized thresholds, prefixes, and parameters in this category will revert to standard recommendations.
          </p>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: '#d97706', borderColor: '#d97706', color: '#fff' }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm & Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
