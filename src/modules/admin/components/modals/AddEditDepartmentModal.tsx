import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, UserCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { Department } from '../../../../types';

interface AddEditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
}

export default function AddEditDepartmentModal({ isOpen, onClose, department }: AddEditDepartmentModalProps) {
  const { addDepartment, updateDepartment, doctors } = useAdmin();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headName: '',
    phone: '',
    email: '',
    location: '',
    isActive: true,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        headName: department.headName || '',
        phone: department.phone || '',
        email: department.email || '',
        location: department.location || '',
        isActive: department.isActive,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        headName: '',
        phone: '',
        email: '',
        location: '',
        isActive: true,
      });
    }
    setError('');
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setError('Please provide department name and code.');
      return;
    }

    if (department) {
      updateDepartment(department.id, formData);
    } else {
      addDepartment(formData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 500, width: '100%' }}>
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
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">{department ? 'Edit Department' : 'Create Hospital Department'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Configure department identity, HOD, and physical location
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Neurology & Neurosurgery"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dept Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NEURO"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Head of Department (HOD)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Rajesh Khanna"
                value={formData.headName}
                onChange={e => setFormData({ ...formData, headName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91-120-4000-XXX"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="dept@alnhms.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location / Wing / Floor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Block B, 2nd Floor, Rooms 201-215"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="deptActiveCheck"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="deptActiveCheck" style={{ fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Department Active & Accepting Patient Encounters
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {department ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
