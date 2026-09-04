import React, { useState, useEffect } from 'react';
import { X, UserCheck, Phone, Mail, Building2, Calendar, Clock } from 'lucide-react';
import { useAdmin, AdminStaff } from '../../context/AdminContext';

interface AddEditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: AdminStaff | null;
}

export default function AddEditStaffModal({ isOpen, onClose, staff }: AddEditStaffModalProps) {
  const { addStaff, updateStaff, departments, roles } = useAdmin();

  const [formData, setFormData] = useState<Omit<AdminStaff, 'id'>>({
    employeeId: '',
    name: '',
    department: 'Administration',
    designation: '',
    role: 'receptionist',
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    shift: 'General (09:00 - 17:00)',
    reportingManager: 'Col. Sanjeev Rawat',
    status: 'active',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData({
        employeeId: staff.employeeId,
        name: staff.name,
        department: staff.department,
        designation: staff.designation,
        role: staff.role,
        phone: staff.phone,
        email: staff.email,
        joiningDate: staff.joiningDate,
        shift: staff.shift,
        reportingManager: staff.reportingManager,
        status: staff.status,
      });
    } else {
      setFormData({
        employeeId: `EMP-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        department: 'Administration',
        designation: '',
        role: 'receptionist',
        phone: '',
        email: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        shift: 'General (09:00 - 17:00)',
        reportingManager: 'Col. Sanjeev Rawat',
        status: 'active',
      });
    }
    setError('');
  }, [staff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation) {
      setError('Please provide staff name and designation.');
      return;
    }

    if (staff) {
      updateStaff(staff.id, formData);
    } else {
      addStaff(formData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 540, width: '100%' }}>
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
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="modal-title">{staff ? 'Edit Staff Profile' : 'Enroll Hospital Staff Member'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Maintain employee records, duty shifts, and reporting lines
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Employee Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ankit Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Designation / Post *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Staff Nurse"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91-9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="staff@alnhms.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Duty Shift</label>
                <select
                  className="form-select"
                  value={formData.shift}
                  onChange={e => setFormData({ ...formData, shift: e.target.value as any })}
                >
                  <option value="General (09:00 - 17:00)">General (09:00 - 17:00)</option>
                  <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                  <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                  <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reporting Manager</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={formData.reportingManager}
                  onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.joiningDate}
                  onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Employment Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Active Duty</option>
                  <option value="on_leave">On Approved Leave</option>
                  <option value="inactive">Inactive / Resigned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {staff ? 'Save Changes' : 'Enroll Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
