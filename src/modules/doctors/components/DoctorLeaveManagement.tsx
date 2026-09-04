import React, { useState } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Plus,
  UserRound, ShieldCheck, FileText, Check, Ban
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';

export default function DoctorLeaveManagement() {
  const { doctors, doctorLeaves, applyDoctorLeave, approveDoctorLeave, rejectDoctorLeave } = useDoctor();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [leaveType, setLeaveType] = useState<'casual' | 'medical' | 'conference' | 'emergency' | 'annual'>('casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please enter a reason for the leave application.');
      return;
    }

    applyDoctorLeave({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    alert(`Leave request submitted for ${selectedDoctor.name} from ${startDate} to ${endDate}.`);
    setReason('');
    setShowApplyModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Doctor Leave & Unavailability Roster Management
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Manage physician leave applications, medical conferences, off-duty schedules, and appointment blackout periods
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={14} /> Apply Doctor Leave
        </button>
      </div>

      {/* Leave Rule Notice */}
      <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#854d0e', fontSize: 12 }}>
        <AlertTriangle size={18} style={{ color: '#ca8a04', flexShrink: 0 }} />
        <div>
          <strong>Automated Blackout Protection:</strong> When a leave is approved, the OPD appointment booking engine automatically blocks all time slots for the doctor during the specified dates and alerts the reception desk.
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Doctor Leave Applications & History</span>
          <span className="badge badge-primary">{doctorLeaves.length} Applications</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason / Justification</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {doctorLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <strong>{leave.doctorName}</strong>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{leave.department}</span>
                    </td>

                    <td>
                      <strong style={{ textTransform: 'capitalize' }}>{leave.leaveType} Leave</strong>
                    </td>

                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>

                    <td>
                      <div style={{ fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {leave.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => approveDoctorLeave(leave.id, 'Medical Superintendent')}
                          >
                            <Check size={11} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => rejectDoctorLeave(leave.id)}
                          >
                            <Ban size={11} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {leave.approvedBy ? `Approved by ${leave.approvedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {doctorLeaves.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No doctor leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Apply Doctor Leave / Blackout</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowApplyModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApply}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Doctor <span className="required">*</span></label>
                  <select className="form-select" value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Leave Type <span className="required">*</span></label>
                  <select className="form-select" value={leaveType} onChange={e => setLeaveType(e.target.value as any)}>
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical / Sick Leave</option>
                    <option value="conference">Conference / Academic Summit</option>
                    <option value="annual">Annual Leave</option>
                    <option value="emergency">Emergency Unavailability</option>
                  </select>
                </div>

                <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Justification <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter reason for leave..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={14} /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
