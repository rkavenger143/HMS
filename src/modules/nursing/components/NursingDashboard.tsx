import React, { useState } from 'react';
import {
  Users, AlertTriangle, Activity, Pill, Clock, ClipboardList,
  Stethoscope, HeartPulse, UserPlus, CheckCircle2, ArrowRight,
  ShieldAlert, Bell, Sparkles, Plus, Droplets, CalendarDays
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import RecordNoteModal from './modals/RecordNoteModal';

export default function NursingDashboard() {
  const {
    kpis,
    admissions,
    vitalsList,
    marRecords,
    nursingAlerts,
    setSelectedAdmissionId,
    setActiveTab,
  } = useNursing();

  const [vitalsModalAdm, setVitalsModalAdm] = useState<any | null>(null);
  const [notesModalAdm, setNotesModalAdm] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const unacknowledgedAlerts = nursingAlerts.filter(a => a.status === 'new');

  const handleOpenPatientEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Critical Alerts Banner */}
      {unacknowledgedAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 69, 58, 0.15), rgba(255, 159, 10, 0.15))',
          border: '1px solid rgba(255, 69, 58, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-danger)' }}>
                {unacknowledgedAlerts.length} Critical Nursing Alert{unacknowledgedAlerts.length > 1 ? 's' : ''} Require Attention
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {unacknowledgedAlerts[0].message}
              </div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('alerts')}>
            View Alert Center ({unacknowledgedAlerts.length})
          </button>
        </div>
      )}

      {/* 9 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* 1. Assigned Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Users size={17} />
          </div>
          <div className="stat-value">{kpis.totalAssignedPatients}</div>
          <div className="stat-label">Assigned Patients</div>
        </div>

        {/* 2. Total Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            <Users size={17} />
          </div>
          <div className="stat-value">{admissions.length}</div>
          <div className="stat-label">Total Inpatients</div>
        </div>

        {/* 3. Vitals Due */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('vitals')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Activity size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.vitalsDueCount}</div>
          <div className="stat-label">Vitals Due</div>
        </div>

        {/* 4. Medication Due */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('mar')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Pill size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.medicationDueCount}</div>
          <div className="stat-label">Medication Due</div>
        </div>

        {/* 5. Overdue Medications */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('mar')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.medicationOverdueCount}</div>
          <div className="stat-label">Overdue Medications</div>
        </div>

        {/* 6. Pending Nursing Tasks */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tasks')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <ClipboardList size={17} />
          </div>
          <div className="stat-value">{kpis.tasksPendingCount}</div>
          <div className="stat-label">Pending Nursing Tasks</div>
        </div>

        {/* 7. Critical Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <HeartPulse size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalPatientsCount}</div>
          <div className="stat-label">Critical Patients</div>
        </div>

        {/* 8. Today's Admissions */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patients')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <UserPlus size={17} />
          </div>
          <div className="stat-value">{kpis.newAdmissionsCount}</div>
          <div className="stat-label">Today's Admissions</div>
        </div>

        {/* 9. Today's Discharges */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('discharge_checklist')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value">{kpis.patientsForDischargeCount}</div>
          <div className="stat-label">Today's Discharges</div>
        </div>
      </div>

      {/* Today's Inpatient Nursing Roster & Status Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Today's Inpatient Nursing Care Roster</span>
              <div className="card-subtitle">Active bedside monitoring, vitals tracking, and medication administration</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('handover')}>
              Shift Handover
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('patients')}>
              View All Patients <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & UHID</th>
                  <th>Ward & Bed</th>
                  <th>Attending Doctor</th>
                  <th>Patient Status</th>
                  <th>Latest Vitals</th>
                  <th>Next Scheduled Med</th>
                  <th>Assigned Nurse</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map(adm => {
                  const patientVitals = vitalsList.filter(v => v.admissionId === adm.id);
                  const latestVitals = patientVitals[0];
                  const patientMeds = marRecords.filter(m => m.admissionId === adm.id && m.status === 'scheduled');
                  const nextMed = patientMeds[0];
                  const isCritical = adm.ward.toLowerCase().includes('icu') || latestVitals?.isAbnormal;

                  return (
                    <tr key={adm.id}>
                      {/* Name & UHID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {adm.patientName[0]}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }}
                              onClick={() => handleOpenPatientEHR(adm.id)}
                            >
                              {adm.patientName}
                            </div>
                            <div className="patient-id" style={{ fontSize: 10 }}>{adm.patientId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          <span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{(adm as any).roomNumber || 'Room 101'}</div>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{adm.admittingDoctorName}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{adm.diagnosis[0] || 'Clinical observation'}</div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${isCritical ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 10 }}>
                          {isCritical ? 'CRITICAL' : 'STABLE'}
                        </span>
                      </td>

                      {/* Latest Vitals */}
                      <td>
                        {latestVitals ? (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 11, color: latestVitals.isAbnormal ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                              BP: {latestVitals.bloodPressure || `${latestVitals.systolic}/${latestVitals.diastolic}`} · Pulse: {latestVitals.pulse}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                              SpO2: {latestVitals.spo2}% · Temp: {latestVitals.temperature}°F
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No vitals today</span>
                        )}
                      </td>

                      {/* Next Scheduled Med */}
                      <td>
                        {nextMed ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--color-primary)' }}>
                              {nextMed.medicineName} ({nextMed.dose})
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                              Due at {nextMed.scheduledTime} · {nextMed.route}
                            </div>
                          </div>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: 10 }}>No meds due</span>
                        )}
                      </td>

                      {/* Assigned Nurse */}
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>
                          {(adm as any).assignedNurseName || 'Nurse Staff On Duty'}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenPatientEHR(adm.id)}
                          >
                            View EHR
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setVitalsModalAdm(adm)}
                          >
                            <Activity size={11} /> Vitals
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
    </div>
  );
}
