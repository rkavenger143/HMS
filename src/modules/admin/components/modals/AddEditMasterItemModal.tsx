import React, { useState, useEffect } from 'react';
import { X, Database } from 'lucide-react';
import { useAdmin, MasterDataItem } from '../../context/AdminContext';

interface AddEditMasterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MasterDataItem | null;
  defaultCategory?: MasterDataItem['category'];
}

export default function AddEditMasterItemModal({ isOpen, onClose, item, defaultCategory }: AddEditMasterItemModalProps) {
  const { addMasterItem, updateMasterItem } = useAdmin();

  const [formData, setFormData] = useState<Omit<MasterDataItem, 'id'>>({
    category: defaultCategory || 'Specialization',
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        code: item.code,
        name: item.name,
        description: item.description || '',
        isActive: item.isActive,
      });
    } else {
      setFormData({
        category: defaultCategory || 'Specialization',
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
    setError('');
  }, [item, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setError('Please provide code and display name.');
      return;
    }

    if (item) {
      updateMasterItem(item.id, formData);
    } else {
      addMasterItem(formData);
    }

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
              <Database size={18} />
            </div>
            <div>
              <h3 className="modal-title">{item ? 'Edit Master Record' : 'Add Master Lookup Record'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Configure dropdown values & standard hospital taxonomy
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
              <label className="form-label">Master Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="Specialization">Doctor Specialization</option>
                <option value="Designation">Staff Designation</option>
                <option value="Sample Type">Lab Sample Type</option>
                <option value="Blood Component">Blood Component</option>
                <option value="Payment Method">Payment Method</option>
                <option value="Room Type">Ward / Room Type</option>
                <option value="Unit">Measurement Unit</option>
                <option value="Service Category">Billing Service Category</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unique Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SPEC-NEPH"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Display Name / Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Nephrology & Renal Care"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description / Clinical Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Optional description..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="masterActiveCheck"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="masterActiveCheck" style={{ fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Active in dropdown lists across HMS
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
