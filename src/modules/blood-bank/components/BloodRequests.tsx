import React, { useState } from 'react';
import {
  AlertTriangle, Plus, Search, Droplets, ShieldAlert, CheckCircle2,
  Clock, ArrowRight, UserCheck, Check, Ban, Activity
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodRequestRecord, BloodGroup } from '../context/BloodBankContext';
import CreateBloodRequestModal from './modals/CreateBloodRequestModal';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequests() {
  const { bloodRequests, approveBloodRequest, setActiveTab } = useBloodBank();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = bloodRequests.filter(r => {
    const q = search.toLowerCase();
    const ms = !q || r.patientName.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const mp = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const mst = statusFilter === 'ALL' || r.status === statusFilter;
    return ms && mp && mst;
  });

  const emergencyCount = bloodRequests.filter(r => r.priority === 'emergency' && r.status !== 'completed' && r.status !== 'cancelled').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(217,119,6,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Patient Blood Requisition & Emergency Transfusion Orders
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Requisition workflow: Physician Requisition &rarr; Blood Bank Verification &rarr; Cross-Matching &rarr; Reservation &rarr; Issue Handover
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={15} /> Create Blood Request
        </button>
      </div>

      {/* Emergency Callout if active */}
      {emergencyCount > 0 && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontSize: 13 }}>
          <ShieldAlert size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong>🚨 {emergencyCount} Unresolved Emergency STAT Request(s):</strong> Prioritize emergency cross-matching and uncrossmatched O-negative release protocol if indicated.
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search request ID, patient name, UHID..."
              style={{ paddingLeft: 30 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Requisition Priorities</option>
            <option value="emergency">🚨 Emergency (STAT)</option>
            <option value="urgent">⚡ Urgent</option>
            <option value="routine">Routine</option>
          </select>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Request Statuses</option>
            <option value="requested">Requested (Pending Review)</option>
            <option value="approved">Approved</option>
            <option value="reserved">Reserved</option>
            <option value="ready_for_issue">Ready for Issue</option>
            <option value="issued">Issued</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Patient Blood Requisitions Register</span>
          <span className="badge badge-primary">{filtered.length} Requests</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Units Req.</th>
                  <th>Priority</th>
                  <th>Doctor & Department</th>
                  <th>Required By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id} style={{ background: req.priority === 'emergency' ? '#fef2f2' : undefined }}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{req.id}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{req.createdAt}</div>
                    </td>

                    <td>
                      <strong>{req.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.patientId} · {req.age}y/{req.gender}</div>
                    </td>

                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>{req.bloodGroup}</span>
                    </td>

                    <td>
                      <strong>{req.component.replace(/_/g, ' ').toUpperCase()}</strong>
                    </td>

                    <td><strong>{req.unitsRequested} Unit(s)</strong></td>

                    <td>
                      <span className={`badge ${req.priority === 'emergency' ? 'badge-danger' : req.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                        {req.priority.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div>{req.doctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.department} ({req.ward})</div>
                    </td>

                    <td>
                      <strong>{req.requiredDateTime}</strong>
                    </td>

                    <td>
                      <span className={`badge ${req.status === 'ready_for_issue' ? 'badge-success' : req.status === 'reserved' ? 'badge-primary' : req.status === 'issued' ? 'badge-success' : 'badge-warning'}`}>
                        {req.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {req.status === 'requested' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => approveBloodRequest(req.id, 'Dr. V. K. Murthy (Blood Bank Officer)')}
                          >
                            <Check size={11} /> Approve
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: 26, fontSize: 11 }}
                          onClick={() => setActiveTab('crossmatch')}
                        >
                          <Activity size={11} /> Match
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No blood requests matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBloodRequestModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
