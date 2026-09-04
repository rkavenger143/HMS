import React, { useState } from 'react';
import { X, ShieldPlus, Shield } from 'lucide-react';
import { useAdmin, AdminRole } from '../../context/AdminContext';

interface AddEditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEditRoleModal({ isOpen, onClose }: AddEditRoleModalProps) {
  const { addRole } = useAdmin();

  const [formData, setFormData] = useState({
    name: '',
    roleKey: '',
    description: '',
    color: '#0A84FF',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.roleKey) {
      setError('Please provide role name and unique identifier key.');
      return;
    }

    addRole({
      name: formData.name,
      roleKey: formData.roleKey.toLowerCase().replace(/\s+/g, '_'),
      description: formData.description || 'Custom administrative role',
      isSystem: false,
      color: formData.color,
      permissions: ['patients.view'],
    });

    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 480, width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Custom System Role</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Define a new role and grant granular module access
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role Title / Display Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Clinical Audit Officer"
                value={formData.name}
                onChange={e => {
                  const name = e.target.value;
                  const roleKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  setFormData({ ...formData, name, roleKey });
                }}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">System Role Key *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. clinical_audit_officer"
                value={formData.roleKey}
                onChange={e => setFormData({ ...formData, roleKey: e.target.value })}
                required
                style={{ fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Used in code and backend authentication checks.
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Describe the scope of responsibility..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role Badge Color</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: 42, height: 36, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{formData.color}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
