import React, { useState, useMemo } from 'react';
import {
  Stethoscope, Search, Edit3, CheckCircle2, XCircle,
  DollarSign, Clock, Building2, Award, FileSpreadsheet, ShieldCheck
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Doctor } from '../../../types';

export default function DoctorAdminConfig() {
  const { doctors, updateDoctorAdmin, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    consultationFee: 600,
    room: 'Room 102',
    registrationNumber: '',
    isAvailable: true,
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.registrationNumber?.toLowerCase().includes(q);

      const matchDept = deptFilter === 'ALL' || d.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [doctors, searchQuery, deptFilter]);

  const handleStartEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setEditForm({
      consultationFee: doc.consultationFee || 600,
      room: (doc as any).room || 'Room 102',
      registrationNumber: doc.registrationNumber || 'MCI-2020-001',
      isAvailable: doc.isAvailable,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      updateDoctorAdmin(editingDoctor.id, {
        consultationFee: Number(editForm.consultationFee),
        registrationNumber: editForm.registrationNumber,
        isAvailable: editForm.isAvailable,
        ...({ room: editForm.room } as any),
      });
      setEditingDoctor(null);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredDoctors.map(d => [
      d.id,
      d.name,
      d.specialization,
      d.department,
      d.registrationNumber || 'MCI-001',
      `₹${d.consultationFee || 600}`,
      (d as any).room || 'OPD Desk',
      d.isAvailable ? 'AVAILABLE' : 'OFF DUTY',
    ]);

    exportCSV(
      'HMS_Doctor_Administrative_Config',
      ['Doctor ID', 'Doctor Name', 'Specialization', 'Department', 'Medical Reg #', 'Consultation Fee (INR)', 'Assigned OPD Room', 'Duty Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Doctor Clinical Administration & Tariffs</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure consultant fees, room allocations, statutory medical registrations, and duty schedules
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileSpreadsheet size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search doctor, speciality, reg #..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Physician Administrative Master Roster</span>
          <span className="badge badge-primary">{filteredDoctors.length} Doctors Configured</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Consultant Name</th>
                  <th>Speciality & Dept</th>
                  <th>Medical Reg #</th>
                  <th>Consultation Fee</th>
                  <th>OPD Room</th>
                  <th>Duty Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {doc.name.split(' ')[1]?.[0] || 'D'}
                        </div>
                        <div>
                          <strong style={{ fontSize: 13 }}>{doc.name}</strong>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{doc.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{doc.specialization}</strong></div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{doc.department}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{doc.registrationNumber || 'MCI-DL-8821'}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>₹{doc.consultationFee || 600}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{(doc as any).room || 'Room 102'}</span>
                    </td>
                    <td>
                      <span className={`badge ${doc.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                        {doc.isAvailable ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleStartEdit(doc)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit3 size={13} /> Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Doctor Config Modal */}
      {editingDoctor && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ maxWidth: 480, width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Configure Doctor Profile</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                    {editingDoctor.name} ({editingDoctor.department})
                  </p>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditingDoctor(null)}>
                <XCircle size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Consultation Fee Tariff (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.consultationFee}
                    onChange={e => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })}
                    required
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Standard OPD consultation charge billed to outpatient receipts.
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Assigned OPD Consulting Room</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Room 204 (Block B)"
                    value={editForm.room}
                    onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Medical Council Registration #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.registrationNumber}
                    onChange={e => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="docAvailableCheck"
                    checked={editForm.isAvailable}
                    onChange={e => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                  />
                  <label htmlFor="docAvailableCheck" style={{ fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    Doctor Active for OPD Appointments & Queue
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDoctor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
