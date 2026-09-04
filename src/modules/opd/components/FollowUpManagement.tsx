import React, { useState } from 'react';
import {
  Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Search,
  Phone, UserCheck, Plus, Filter, ArrowRight, UserPlus
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDFollowUp } from '../../../types';

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  completed: { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  missed: { label: 'Missed / Overdue', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  cancelled: { label: 'Cancelled', color: 'var(--text-tertiary)', bg: 'var(--bg-surface)' },
};

export default function FollowUpManagement() {
  const {
    followUps,
    doctors,
    departments,
    updateFollowUpStatus,
    createFollowUp,
    registerExistingPatientVisit,
    setActiveTab,
  } = useOPD();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');

  // New Follow up modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [followUpDate, setFollowUpDate] = useState('2026-09-07');
  const [reason, setReason] = useState('Routine review of symptoms and laboratory parameters');
  const [instructions, setInstructions] = useState('Bring fasting blood sugar report');

  const filteredFollowUps = followUps.filter(f => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.patientName.toLowerCase().includes(q) ||
      f.patientId.toLowerCase().includes(q) ||
      f.patientPhone.includes(q);

    const matchStatus = !statusFilter || f.status === statusFilter;
    const matchDoctor = !doctorFilter || f.doctorId === doctorFilter;

    return matchSearch && matchStatus && matchDoctor;
  });

  const handleBookVisit = (fu: OPDFollowUp) => {
    registerExistingPatientVisit(fu.patientId, {
      doctorId: fu.doctorId,
      department: fu.department,
      visitDate: fu.followUpDate,
      visitType: 'follow_up',
      reasonForVisit: `Follow-up: ${fu.reason}`,
    });
    updateFollowUpStatus(fu.id, 'completed');
    setActiveTab('queue');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = doctors.find(d => d.id === doctorId);
    createFollowUp({
      patientId: patientId || 'ALN-2026-00001',
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '9876543210',
      doctorId,
      doctorName: doctor?.name || 'Dr. Sneha Patel',
      department: doctor?.department || 'General Medicine',
      followUpDate,
      reason,
      instructions,
      status: 'upcoming',
    });
    setShowCreateModal(false);
  };

  // KPIs
  const totalUpcoming = followUps.filter(f => f.status === 'upcoming').length;
  const totalMissed = followUps.filter(f => f.status === 'missed').length;
  const totalCompleted = followUps.filter(f => f.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Outpatient Follow-up & Recall Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Track scheduled post-consultation reviews, reminders, and patient recall compliance
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> Schedule Follow-Up
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-4" style={{ gap: 12 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>{followUps.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Total Tracked Follow-ups</div>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>{totalUpcoming}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Upcoming Reviews</div>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-danger)' }}>{totalMissed}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Missed / Overdue</div>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)' }}>{totalCompleted}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Completed Visits</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search patient, UHID, phone..."
              style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed / Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
            >
              <option value="">All Consulting Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Follow-ups List Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Doctor & Dept</th>
                <th>Target Follow-up Date</th>
                <th>Reason for Follow-up</th>
                <th>Special Instructions</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map(fu => {
                  const sc = STATUS_CONFIG[fu.status] || STATUS_CONFIG.upcoming;
                  return (
                    <tr key={fu.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{fu.patientName}</div>
                        <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          <span className="patient-id" style={{ fontSize: 10 }}>{fu.patientId}</span>
                          <span>·</span>
                          <span><Phone size={10} style={{ display: 'inline' }} /> {fu.patientPhone}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{fu.doctorName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{fu.department}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: fu.status === 'missed' ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {fu.followUpDate}
                        </div>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fu.reason}</div>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          {fu.instructions || 'Standard outpatient follow-up'}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                          <span className="badge-dot" />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {fu.status !== 'completed' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => handleBookVisit(fu)}
                            >
                              <UserCheck size={11} /> Check In / Book
                            </button>
                          )}

                          {fu.status === 'upcoming' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => updateFollowUpStatus(fu.id, 'completed')}
                            >
                              <CheckCircle2 size={11} /> Mark Done
                            </button>
                          )}

                          {fu.status !== 'cancelled' && fu.status !== 'completed' && (
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              style={{ color: 'var(--color-danger)' }}
                              title="Cancel Follow-up"
                              onClick={() => updateFollowUpStatus(fu.id, 'cancelled')}
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 16px' }}>
                      <div className="empty-state-icon"><Clock size={28} /></div>
                      <div className="empty-state-title">No Follow-ups Found</div>
                      <div className="empty-state-desc">Try clearing filters or schedule a new patient follow-up review.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Clock size={16} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Schedule Outpatient Follow-Up</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Name & UHID <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Yadav (ALN-2026-00001)"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Mobile number"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Follow-up Target Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Consulting Doctor <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={doctorId}
                      onChange={e => setDoctorId(e.target.value)}
                      required
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Reason for Follow-Up</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Pre-requisite Instructions</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bring fasting lab reports / avoid heavy meals"
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Follow-Up</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
