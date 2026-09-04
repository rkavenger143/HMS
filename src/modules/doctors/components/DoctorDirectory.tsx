import React, { useState } from 'react';
import {
  UserRound, Search, Plus, Star, Clock, Phone, Mail, Award,
  ShieldCheck, CheckCircle2, AlertCircle, Edit, Eye, Filter,
  Building2, Calendar, Stethoscope, ArrowRight
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';
import type { Doctor } from '../../../types';
import AddEditDoctorModal from './modals/AddEditDoctorModal';
import DoctorProfileModal from './modals/DoctorProfileModal';

export default function DoctorDirectory() {
  const { doctors, toggleDoctorAvailability, setActiveTab, setSelectedDoctorId } = useDoctor();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);

  const departments = [...new Set(doctors.map(d => d.department))];

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    const ms =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.registrationNumber?.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q);

    const md = !deptFilter || d.department === deptFilter;
    const mst =
      statusFilter === 'ALL' ||
      (statusFilter === 'available' && d.isAvailable) ||
      (statusFilter === 'unavailable' && !d.isAvailable);

    return ms && md && mst;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Hospital Medical Staff & Doctor Directory
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {doctors.length} verified physicians and clinical specialists registered across {departments.length} clinical departments
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add New Doctor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by doctor name, specialization, reg #..."
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments ({departments.length})</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Availability Statuses</option>
            <option value="available">Available on Duty</option>
            <option value="unavailable">Unavailable / Off Duty</option>
          </select>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              Card Grid
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              Data Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(doc => (
            <div key={doc.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 4, background: doc.isAvailable ? 'var(--color-primary)' : 'var(--border-default)' }} />
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Doctor Avatar & Identity */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 16, flexShrink: 0
                  }}>
                    {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{doc.specialization}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{doc.department}</div>
                  </div>
                </div>

                {/* Badges & Status */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge badge-neutral">{Array.isArray(doc.qualifications) ? doc.qualifications.join(', ') : doc.qualifications}</span>
                  <button
                    className={`badge ${doc.isAvailable ? 'badge-success' : 'badge-danger'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => toggleDoctorAvailability(doc.id)}
                    title="Click to toggle active duty status"
                  >
                    {doc.isAvailable ? '● Available on Duty' : '○ Off Duty / Away'}
                  </button>
                </div>

                {/* Contact & Professional Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Award size={12} style={{ color: 'var(--color-warning)' }} />
                    <span>{doc.experience} years clinical experience</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                    <span>₹{doc.consultationFee} Consultation Fee</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <ShieldCheck size={12} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontFamily: 'monospace' }}>Reg #: {doc.registrationNumber || 'MCI-2018-8849'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Phone size={12} />
                    <span>{doc.phone}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Mail size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.email}</span>
                  </div>
                </div>

                {/* Schedule Snippet */}
                <div style={{ marginTop: 'auto', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  📅 <strong>OPD:</strong> {doc.opdSchedule?.days?.join(', ') || 'Mon, Wed, Fri'} · {doc.opdSchedule?.startTime || '09:00 AM'} – {doc.opdSchedule?.endTime || '01:00 PM'}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setProfileDoctor(doc)}
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setEditDoctor(doc)}
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.2, justifyContent: 'center' }}
                    onClick={() => {
                      setSelectedDoctorId(doc.id);
                      setActiveTab('consultation');
                    }}
                  >
                    <Stethoscope size={12} /> Consult
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor Name & Reg #</th>
                    <th>Department & Specialization</th>
                    <th>Qualifications</th>
                    <th>Experience</th>
                    <th>Fee (₹)</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                          {doc.registrationNumber || 'MCI-REG-8941'}
                        </div>
                      </td>

                      <td>
                        <strong>{doc.specialization}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{doc.department}</div>
                      </td>

                      <td>{Array.isArray(doc.qualifications) ? doc.qualifications.join(', ') : doc.qualifications}</td>
                      <td>{doc.experience} yrs</td>
                      <td><strong>₹{doc.consultationFee}</strong></td>
                      <td>
                        <div>{doc.phone}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{doc.email}</div>
                      </td>

                      <td>
                        <button
                          className={`badge ${doc.isAvailable ? 'badge-success' : 'badge-danger'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => toggleDoctorAvailability(doc.id)}
                        >
                          {doc.isAvailable ? 'Available' : 'Off Duty'}
                        </button>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setProfileDoctor(doc)}>
                            <Eye size={11} />
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditDoctor(doc)}>
                            <Edit size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals Suite */}
      {showAddModal && (
        <AddEditDoctorModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editDoctor && (
        <AddEditDoctorModal
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
        />
      )}

      {profileDoctor && (
        <DoctorProfileModal
          doctor={profileDoctor}
          onClose={() => setProfileDoctor(null)}
        />
      )}
    </div>
  );
}
