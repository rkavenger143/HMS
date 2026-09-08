import React, { useState } from 'react';
import {
  Users, AlertTriangle, Activity, Pill, Clock, ClipboardList,
  HeartPulse, UserPlus, CheckCircle2, ArrowRight,
  ShieldAlert, Bell, Sparkles, Plus, Droplets, CalendarDays,
  UserCheck, Siren, Check
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import RecordNoteModal from './modals/RecordNoteModal';
import EmergencyReportingModal from './modals/EmergencyReportingModal';

export default function NursingDashboard() {
  const {
    kpis,
    admissions,
    nurses,
    emergencies,
    vitalsList,
    marRecords,
    nursingTasks,
    setSelectedAdmissionId,
    setActiveTab,
    resolveEmergency,
  } = useNursing();

  const [vitalsModalAdm, setVitalsModalAdm] = useState<any | null>(null);
  const [notesModalAdm, setNotesModalAdm] = useState<any | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const onDutyNurses = nurses.filter(n => n.status === 'on_duty');
  const activeEmergencies = emergencies.filter(e => e.status === 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Active Emergencies Action Card */}
      {activeEmergencies.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)', background: 'var(--bg-card)' }}>
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Siren size={18} style={{ color: 'var(--color-danger)' }} />
              <span className="card-title" style={{ color: 'var(--color-danger)' }}>
                Active Hospital Emergency Broadcasts ({activeEmergencies.length})
              </span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setShowEmergencyModal(true)}>
              <Plus size={13} /> Report Another Emergency
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emergency Type</th>
                    <th>Inpatient / Ward</th>
                    <th>Reported By & Time</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Resolution Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmergencies.map(emg => (
                    <tr key={emg.id}>
                      <td>
                        <span className="badge badge-danger" style={{ textTransform: 'uppercase', fontWeight: 800 }}>
                          {emg.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <strong>{emg.patientName || 'Ward Area'}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {emg.bedNumber ? `Bed ${emg.bedNumber} · ` : ''}{emg.ward}
                        </div>
                      </td>
                      <td>
                        <div>{emg.reportedBy}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{emg.reportedAt}</div>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emg.description}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ padding: '3px 10px', fontSize: 11 }}
                          onClick={() => resolveEmergency(emg.id)}
                        >
                          <Check size={12} /> Mark Resolved
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exact 7 Essential KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {/* 1. Nurses Currently on Duty */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('nurses')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <UserCheck size={18} />
          </div>
          <div className="stat-value">{kpis.onDutyNursesCount || onDutyNurses.length}</div>
          <div className="stat-label">Nurses on Duty</div>
        </div>

        {/* 2. Assigned Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Users size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.totalAssignedPatients}</div>
          <div className="stat-label">Assigned Patients</div>
        </div>

        {/* 3. Critical Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <HeartPulse size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalPatientsCount}</div>
          <div className="stat-label">Critical Patients</div>
        </div>

        {/* 4. Pending Tasks */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tasks')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <ClipboardList size={18} />
          </div>
          <div className="stat-value">{kpis.tasksPendingCount}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>

        {/* 5. Medication Due */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('medication')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Pill size={18} />
          </div>
          <div className="stat-value">{kpis.medicationDueCount}</div>
          <div className="stat-label">Medication Due</div>
        </div>

        {/* 6. Vital Signs Due */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('vitals')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Activity size={18} />
          </div>
          <div className="stat-value">{kpis.vitalsDueCount}</div>
          <div className="stat-label">Vitals Due</div>
        </div>

        {/* 7. Current Shift */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('shifts')}>
          <div className="stat-icon" style={{ background: 'var(--bg-surface)', color: 'var(--color-primary)' }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            {kpis.currentShift?.split(' ')[0] || 'Morning'}
          </div>
          <div className="stat-label" style={{ fontSize: 11 }}>Active Shift</div>
        </div>
      </div>

      {/* 2-Column Bedside Roster: On-Duty Nurses (Left) & Active Inpatient Roster (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* On-Duty Nurses Roster */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">On-Duty Nursing Staff</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('nurses')}>
              View All
            </button>
          </div>
          <div className="card-body" style={{ padding: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {onDutyNurses.length > 0 ? (
                onDutyNurses.map(nurse => (
                  <div
                    key={nurse.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm">{nurse.name[0]}</div>
                      <div>
                        <strong style={{ fontSize: 13 }}>{nurse.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{nurse.ward} · {nurse.employeeId}</div>
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: 10 }}>
                      {nurse.shift?.toUpperCase() || 'MORNING'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  No nurses logged as on duty.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Bedside Inpatient Roster */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Bedside Inpatient Care Census</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patients')}>
              Full Roster ({activeAdmissions.length})
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bed & Ward</th>
                    <th>Patient Name</th>
                    <th>Condition</th>
                    <th>Attending Doctor</th>
                    <th>Latest Vitals</th>
                    <th style={{ textAlign: 'right' }}>Bedside Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAdmissions.slice(0, 5).map(adm => {
                    const isICU = adm.ward.toLowerCase().includes('icu');
                    const latestVital = vitalsList.find(v => v.admissionId === adm.id);

                    return (
                      <tr key={adm.id}>
                        <td>
                          <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800 }}>
                            {adm.bedNumber}
                          </span>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{adm.ward}</div>
                        </td>

                        <td>
                          <strong style={{ fontSize: 13 }}>{adm.patientName}</strong>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{adm.patientId}</div>
                        </td>

                        <td>
                          <span className={`badge ${adm.condition === 'critical' ? 'badge-danger' : 'badge-neutral'}`} style={{ textTransform: 'capitalize', fontSize: 10 }}>
                            {adm.condition || 'Stable'}
                          </span>
                        </td>

                        <td>{adm.admittingDoctorName}</td>

                        <td>
                          {latestVital ? (
                            <div style={{ fontSize: 11 }}>
                              <span>BP: <strong>{latestVital.bloodPressure}</strong></span> · <span>SpO2: <strong>{latestVital.spo2}%</strong></span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-warning)' }}>Pending Vitals</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="Chart Vitals"
                              onClick={() => setVitalsModalAdm(adm)}
                            >
                              <Activity size={12} /> Vitals
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="Add Note"
                              onClick={() => setNotesModalAdm(adm)}
                            >
                              <ClipboardList size={12} /> Note
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      {vitalsModalAdm && (
        <RecordVitalsModal
          admission={vitalsModalAdm}
          onClose={() => setVitalsModalAdm(null)}
        />
      )}

      {/* Record Note Modal */}
      {notesModalAdm && (
        <RecordNoteModal
          admission={notesModalAdm}
          onClose={() => setNotesModalAdm(null)}
        />
      )}

      {/* Emergency Reporting Modal */}
      {showEmergencyModal && (
        <EmergencyReportingModal
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
}
