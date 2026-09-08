import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, ShieldCheck, CheckCircle2, UserCheck, X } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { Nurse } from '../../../types';

export default function ShiftManagement() {
  const {
    assignments,
    shiftRosters,
    admissions,
    nurses,
    wards,
    assignNurseToPatients,
    updateShiftRoster,
  } = useNursing();

  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon' | 'night'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Assignment Form State
  const [selectedNurseId, setSelectedNurseId] = useState(nurses[0]?.id || 'nur-001');
  const [assignmentShift, setAssignmentShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [assignmentWard, setAssignmentWard] = useState(wards[0]?.name || 'General Ward A');
  const [selectedPatients, setSelectedPatients] = useState<string[]>(['ALN-2026-00001', 'ALN-2026-00003']);

  // Shift Form State
  const [shiftNurseId, setShiftNurseId] = useState(nurses[0]?.id || 'nur-001');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [shiftWard, setShiftWard] = useState(wards[0]?.name || 'Medical ICU');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedNurseObj = nurses.find(n => n.id === selectedNurseId) || nurses[0];
  const selectedShiftNurseObj = nurses.find(n => n.id === shiftNurseId) || nurses[0];

  const filteredShifts = shiftRosters.filter(s => {
    return shiftFilter === 'all' || s.shift === shiftFilter;
  });

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurseObj) return;

    assignNurseToPatients({
      nurseId: selectedNurseObj.id,
      nurseName: selectedNurseObj.name,
      employeeId: selectedNurseObj.employeeId,
      shift: assignmentShift,
      ward: assignmentWard,
      assignedPatientIds: selectedPatients,
      patientCount: selectedPatients.length,
    });

    setShowAssignModal(false);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftNurseObj) return;

    updateShiftRoster({
      nurseId: selectedShiftNurseObj.id,
      nurseName: selectedShiftNurseObj.name,
      shift: shiftType,
      ward: shiftWard,
      startTime: shiftType === 'morning' ? '07:00' : shiftType === 'afternoon' ? '15:00' : '23:00',
      endTime: shiftType === 'morning' ? '15:00' : shiftType === 'afternoon' ? '23:00' : '07:00',
      status: 'on_duty',
    });

    setShowShiftModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Shift Schedules & Workload Allocation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hospital duty shifts: Morning (07:00-15:00), Evening (15:00-23:00), Night (23:00-07:00)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowShiftModal(true)}>
            <Plus size={13} /> Schedule Shift Duty
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAssignModal(true)}>
            <Users size={13} /> Assign Inpatients
          </button>
        </div>
      </div>

      {/* 3-Shift Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Morning Shift */}
        <div
          className={`card ${shiftFilter === 'morning' ? 'active-border' : ''}`}
          style={{ padding: '14px', cursor: 'pointer', borderLeft: '4px solid var(--color-primary)' }}
          onClick={() => setShiftFilter(shiftFilter === 'morning' ? 'all' : 'morning')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 14 }}>Morning Shift</strong>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>07:00 - 15:00</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            On-Duty: <strong>{shiftRosters.filter(s => s.shift === 'morning').length} Nurses</strong>
          </div>
        </div>

        {/* Evening Shift */}
        <div
          className={`card ${shiftFilter === 'afternoon' ? 'active-border' : ''}`}
          style={{ padding: '14px', cursor: 'pointer', borderLeft: '4px solid var(--color-warning)' }}
          onClick={() => setShiftFilter(shiftFilter === 'afternoon' ? 'all' : 'afternoon')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 14 }}>Evening Shift</strong>
            <span className="badge badge-warning" style={{ fontSize: 10 }}>15:00 - 23:00</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Scheduled: <strong>{shiftRosters.filter(s => s.shift === 'afternoon').length} Nurses</strong>
          </div>
        </div>

        {/* Night Shift */}
        <div
          className={`card ${shiftFilter === 'night' ? 'active-border' : ''}`}
          style={{ padding: '14px', cursor: 'pointer', borderLeft: '4px solid var(--color-info)' }}
          onClick={() => setShiftFilter(shiftFilter === 'night' ? 'all' : 'night')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 14 }}>Night Shift</strong>
            <span className="badge badge-info" style={{ fontSize: 10 }}>23:00 - 07:00</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Scheduled: <strong>{shiftRosters.filter(s => s.shift === 'night').length} Nurses</strong>
          </div>
        </div>
      </div>

      {/* 2-Section Grid: Shift Duty Roster (Left) & Nurse-to-Patient Allocations (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Shift Duty Roster */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Hospital Shift Duty Roster ({filteredShifts.length})</span>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Duty Nurse</th>
                    <th>Assigned Ward</th>
                    <th>Shift & Timing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm">{s.nurseName[0]}</div>
                          <strong>{s.nurseName}</strong>
                        </div>
                      </td>
                      <td>{s.ward}</td>
                      <td>
                        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>{s.shift}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.startTime} - {s.endTime}</div>
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'on_duty' ? 'badge-success' : 'badge-neutral'}`}>
                          {s.status === 'on_duty' ? 'ON DUTY' : 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Nurse-to-Patient Allocation */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Bedside Patient Assignments</span>
            </div>
            <span className="badge badge-primary">{assignments.length} Active</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nurse</th>
                    <th>Ward</th>
                    <th>Assigned Beds / Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(asg => (
                    <tr key={asg.id}>
                      <td>
                        <strong>{asg.nurseName}</strong>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{asg.employeeId}</div>
                      </td>
                      <td>
                        <div>{asg.ward}</div>
                        <span className="badge badge-neutral" style={{ fontSize: 9 }}>{asg.shift.toUpperCase()}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {asg.assignedPatientIds.map(pid => (
                            <span key={pid} className="badge badge-primary" style={{ fontSize: 10 }}>{pid}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Nurse Modal */}
      {showAssignModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Assign Nurse to Inpatients</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAssignModal(false)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Registered Nurse <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedNurseId}
                      onChange={e => setSelectedNurseId(e.target.value)}
                      required
                    >
                      {nurses.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.employeeId}) — {n.ward}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={assignmentShift} onChange={e => setAssignmentShift(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Evening (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ward</label>
                    <select className="form-select" value={assignmentWard} onChange={e => setAssignmentWard(e.target.value)}>
                      {wards.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Inpatients to Assign <span className="required">*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', background: 'var(--bg-surface)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                      {activeAdmissions.map(a => {
                        const isChecked = selectedPatients.includes(a.patientId);
                        return (
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) setSelectedPatients(p => [...p, a.patientId]);
                                else setSelectedPatients(p => p.filter(x => x !== a.patientId));
                              }}
                            />
                            {a.patientName} (Bed {a.bedNumber} — {a.ward})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Shift Modal */}
      {showShiftModal && (
        <div className="modal-backdrop" onClick={() => setShowShiftModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Schedule Shift Duty</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowShiftModal(false)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveShift}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Duty Nurse <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={shiftNurseId}
                      onChange={e => setShiftNurseId(e.target.value)}
                      required
                    >
                      {nurses.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={shiftType} onChange={e => setShiftType(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Evening (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ward</label>
                    <select className="form-select" value={shiftWard} onChange={e => setShiftWard(e.target.value)}>
                      {wards.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowShiftModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Schedule Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
