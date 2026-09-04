import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

export default function ShiftManagement() {
  const { assignments, shiftRosters, admissions, assignNurseToPatients, updateShiftRoster } = useNursing();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Assignment Form State
  const [nurseName, setNurseName] = useState('Kavitha Nair');
  const [employeeId, setEmployeeId] = useState('EMP-NUR-101');
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [ward, setWard] = useState('General Ward A');
  const [selectedPatients, setSelectedPatients] = useState<string[]>(['ALN-2026-00001', 'ALN-2026-00003']);

  // Shift Form State
  const [shiftNurseName, setShiftNurseName] = useState('Rekha Sharma');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [shiftWard, setShiftWard] = useState('Medical ICU');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    assignNurseToPatients({
      nurseName,
      employeeId,
      shift,
      ward,
      assignedPatientIds: selectedPatients,
      patientCount: selectedPatients.length,
    });

    setShowAssignModal(false);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();

    updateShiftRoster({
      nurseName: shiftNurseName,
      shift: shiftType,
      ward: shiftWard,
      startTime: shiftType === 'morning' ? '07:00' : shiftType === 'afternoon' ? '15:00' : '23:00',
      endTime: shiftType === 'morning' ? '15:00' : shiftType === 'afternoon' ? '23:00' : '07:00',
      status: 'scheduled',
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Shifts & Patient Allocation Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Nurse-to-patient ratios, ward duty rosters, shift schedules, and workload distribution
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowShiftModal(true)}>
            <Plus size={13} /> Add Shift Duty
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAssignModal(true)}>
            <Users size={13} /> Assign Nurse to Patients
          </button>
        </div>
      </div>

      {/* 2-Section Grid: Nurse-to-Patient Allocation (Left) & Shift Duty Roster (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Nurse-to-Patient Allocation */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Active Nurse-to-Patient Allocations</span>
            </div>
            <span className="badge badge-primary">{assignments.length} Active</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nurse Name & ID</th>
                    <th>Ward & Shift</th>
                    <th>Assigned Patients</th>
                    <th>Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(asg => (
                    <tr key={asg.id}>
                      <td>
                        <strong>{asg.nurseName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{asg.employeeId}</div>
                      </td>
                      <td>
                        <div>{asg.ward}</div>
                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>{asg.shift.toUpperCase()}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {asg.assignedPatientIds.map(pid => (
                            <span key={pid} className="badge badge-primary" style={{ fontSize: 10 }}>{pid}</span>
                          ))}
                        </div>
                      </td>
                      <td><strong>{asg.patientCount} pts</strong></td>
                      <td><span className="badge badge-success">ACTIVE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Shift Duty Roster */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--color-warning)' }} />
              <span className="card-title">Hospital Nursing Shift Duty Roster</span>
            </div>
            <span className="badge badge-warning">{shiftRosters.length} Shifts</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Duty Nurse</th>
                    <th>Ward</th>
                    <th>Shift Timing</th>
                    <th>Duty Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftRosters.map(s => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.nurseName}</strong>
                      </td>
                      <td>{s.ward}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.shift.toUpperCase()}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.startTime} - {s.endTime}</div>
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'on_duty' ? 'badge-success' : 'badge-primary'}`}>
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
      </div>

      {/* Assign Nurse Modal */}
      {showAssignModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Assign Nurse to Inpatients</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAssignModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveAssignment}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Nurse Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={nurseName} onChange={e => setNurseName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input type="text" className="form-input" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Afternoon (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ward</label>
                    <select className="form-select" value={ward} onChange={e => setWard(e.target.value)}>
                      <option value="General Ward A">General Ward A</option>
                      <option value="Medical ICU">Medical ICU</option>
                      <option value="Private Ward">Private Ward</option>
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

      {/* Add Shift Modal */}
      {showShiftModal && (
        <div className="modal-backdrop" onClick={() => setShowShiftModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <Clock size={18} style={{ color: 'var(--color-warning)' }} />
              <div className="modal-title">Schedule Shift Duty</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowShiftModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveShift}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Duty Nurse Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={shiftNurseName} onChange={e => setShiftNurseName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={shiftType} onChange={e => setShiftType(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Afternoon (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ward</label>
                    <select className="form-select" value={shiftWard} onChange={e => setShiftWard(e.target.value)}>
                      <option value="General Ward A">General Ward A</option>
                      <option value="Medical ICU">Medical ICU</option>
                      <option value="Private Ward">Private Ward</option>
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
