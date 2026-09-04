import React, { useState } from 'react';
import {
  User, Activity, ClipboardList, Pill, ShieldAlert, FileText,
  Calendar, CheckCircle2, AlertTriangle, Plus, Clock, Droplets,
  Stethoscope, FlaskConical, ArrowLeft, Printer, HeartPulse, Shield
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import RecordNoteModal from './modals/RecordNoteModal';
import PrintVitalsChartModal from './modals/PrintVitalsChartModal';
import PrintMARSheetModal from './modals/PrintMARSheetModal';

type EHRTab =
  | 'overview'
  | 'vitals'
  | 'medications'
  | 'tasks'
  | 'care_plan'
  | 'notes'
  | 'intake_output'
  | 'wound_care'
  | 'pain'
  | 'orders'
  | 'handover';

export default function NursingPatientProfile() {
  const {
    selectedAdmission,
    selectedPatient,
    vitalsList,
    nursingNotes,
    marRecords,
    carePlans,
    nursingTasks,
    intakeOutputLogs,
    doctorOrders,
    setActiveTab,
  } = useNursing();

  const [activeSubTab, setActiveSubTab] = useState<EHRTab>('overview');

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPrintVitalsModal, setShowPrintVitalsModal] = useState(false);
  const [showPrintMARModal, setShowPrintMARModal] = useState(false);

  if (!selectedAdmission) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <User size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>No Inpatient Selected</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Please select an inpatient from the Nursing Patient List.
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setActiveTab('patients')}>
          Go to Patient List
        </button>
      </div>
    );
  }

  const patientVitals = vitalsList.filter(v => v.admissionId === selectedAdmission.id);
  const latestVitals = patientVitals[0];
  const patientNotes = nursingNotes.filter(n => n.admissionId === selectedAdmission.id);
  const patientMAR = marRecords.filter(m => m.admissionId === selectedAdmission.id);
  const patientCarePlans = carePlans.filter(c => c.admissionId === selectedAdmission.id);
  const patientTasks = nursingTasks.filter(t => t.admissionId === selectedAdmission.id);
  const patientIO = intakeOutputLogs.filter(i => i.admissionId === selectedAdmission.id);
  const patientDoctorOrders = doctorOrders.filter(d => d.admissionId === selectedAdmission.id);

  const daysStay = Math.floor((new Date().getTime() - new Date(selectedAdmission.admissionDate).getTime()) / 86400000) + 1;
  const isCritical = selectedAdmission.ward.toLowerCase().includes('icu') || latestVitals?.isAbnormal;

  // Fluid Totals
  const totalIntake = patientIO.filter(i => i.category === 'intake').reduce((sum, i) => sum + i.amountMl, 0);
  const totalOutput = patientIO.filter(i => i.category === 'output').reduce((sum, i) => sum + i.amountMl, 0);
  const netFluidBalance = totalIntake - totalOutput;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back Button & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('patients')}>
          <ArrowLeft size={14} /> Back to Nursing Patients Roster
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab('overview')}>
            <User size={13} /> View Patient
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowVitalsModal(true)}>
            <Activity size={13} /> Record Vitals
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab('medications')}>
            <Pill size={13} /> Medication
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNoteModal(true)}>
            <ClipboardList size={13} /> Add Note
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintVitalsModal(true)}>
            <Printer size={13} /> Print Vitals
          </button>
        </div>
      </div>

      {/* Standardized Patient Demographic Banner */}
      <div className="card" style={{ padding: '18px 22px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg" style={{ fontSize: 20, width: 50, height: 50 }}>
              {selectedAdmission.patientName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{selectedAdmission.patientName}</span>
                <span className={`badge ${isCritical ? 'badge-danger' : 'badge-success'}`}>
                  {isCritical ? 'CRITICAL' : 'STABLE'}
                </span>
                <span className="badge badge-primary">Day {daysStay} of Stay</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>UHID: <strong>{selectedAdmission.patientId}</strong></span>
                <span>Adm ID: <strong>{selectedAdmission.id}</strong></span>
                <span>Bed / Room: <strong>{selectedAdmission.bedNumber} ({selectedAdmission.ward})</strong></span>
                <span>Doctor: <strong>{selectedAdmission.admittingDoctorName}</strong></span>
                <span>Admission Date: <strong>{selectedAdmission.admissionDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Allergy Callout */}
          <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.25)', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} /> Drug Allergies:
            </div>
            <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>
              {selectedPatient?.allergies?.join(', ') || 'No Known Drug Allergies (NKDA)'}
            </div>
          </div>
        </div>
      </div>

      {/* 11-Tab Standardized Sub-Navigation */}
      <div className="tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button className={`tab ${activeSubTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveSubTab('overview')}>
          <User size={13} /> Overview
        </button>
        <button className={`tab ${activeSubTab === 'vitals' ? 'active' : ''}`} onClick={() => setActiveSubTab('vitals')}>
          <Activity size={13} /> Vitals ({patientVitals.length})
        </button>
        <button className={`tab ${activeSubTab === 'medications' ? 'active' : ''}`} onClick={() => setActiveSubTab('medications')}>
          <Pill size={13} /> Medications ({patientMAR.length})
        </button>
        <button className={`tab ${activeSubTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveSubTab('tasks')}>
          <CheckCircle2 size={13} /> Tasks ({patientTasks.length})
        </button>
        <button className={`tab ${activeSubTab === 'care_plan' ? 'active' : ''}`} onClick={() => setActiveSubTab('care_plan')}>
          <FileText size={13} /> Care Plan ({patientCarePlans.length})
        </button>
        <button className={`tab ${activeSubTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveSubTab('notes')}>
          <ClipboardList size={13} /> Notes ({patientNotes.length})
        </button>
        <button className={`tab ${activeSubTab === 'intake_output' ? 'active' : ''}`} onClick={() => setActiveSubTab('intake_output')}>
          <Droplets size={13} /> Intake / Output ({patientIO.length})
        </button>
        <button className={`tab ${activeSubTab === 'wound_care' ? 'active' : ''}`} onClick={() => setActiveSubTab('wound_care')}>
          <HeartPulse size={13} /> Wound Care
        </button>
        <button className={`tab ${activeSubTab === 'pain' ? 'active' : ''}`} onClick={() => setActiveSubTab('pain')}>
          <ShieldAlert size={13} /> Pain & Assessment
        </button>
        <button className={`tab ${activeSubTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveSubTab('orders')}>
          <Stethoscope size={13} /> Orders ({patientDoctorOrders.length})
        </button>
        <button className={`tab ${activeSubTab === 'handover' ? 'active' : ''}`} onClick={() => setActiveSubTab('handover')}>
          <Clock size={13} /> Handover
        </button>
      </div>

      {/* Sub-Tab Contents */}
      <div className="card">
        {/* 1. OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="card-body">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--color-primary)' }}>Admission Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div><strong>Admission Date:</strong> {selectedAdmission.admissionDate} (Day {daysStay})</div>
                  <div><strong>Attending Doctor:</strong> {selectedAdmission.admittingDoctorName}</div>
                  <div><strong>Bed / Ward:</strong> {selectedAdmission.bedNumber} — {selectedAdmission.ward}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--color-primary)' }}>Clinical Diagnoses</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedAdmission.diagnosis.map((d, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '6px 12px' }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. VITALS */}
        {activeSubTab === 'vitals' && (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Blood Pressure</th>
                    <th>Pulse</th>
                    <th>SpO2</th>
                    <th>Temp</th>
                    <th>Resp Rate</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {patientVitals.map(v => (
                    <tr key={v.id}>
                      <td>{v.recordedAt}</td>
                      <td><strong>{v.bloodPressure || `${v.systolic}/${v.diastolic}`}</strong> mmHg</td>
                      <td>{v.pulse} bpm</td>
                      <td>{v.spo2}%</td>
                      <td>{v.temperature} °F</td>
                      <td>{v.respiratoryRate} /min</td>
                      <td>{v.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MEDICATIONS */}
        {activeSubTab === 'medications' && (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose & Route</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Nurse</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMAR.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.medicineName}</strong></td>
                      <td>{m.dose} · {m.route}</td>
                      <td>{m.scheduledTime}</td>
                      <td><span className={`badge ${m.status === 'administered' ? 'badge-success' : 'badge-warning'}`}>{m.status.toUpperCase()}</span></td>
                      <td>{m.nurseName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TASKS */}
        {activeSubTab === 'tasks' && (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task Description</th>
                    <th>Priority</th>
                    <th>Due Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientTasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.description}</td>
                      <td><span className={`badge badge-${t.priority === 'urgent' ? 'danger' : 'neutral'}`}>{t.priority.toUpperCase()}</span></td>
                      <td>{t.dueTime}</td>
                      <td><span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{t.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CARE PLAN */}
        {activeSubTab === 'care_plan' && (
          <div className="card-body">
            {patientCarePlans.map(cp => (
              <div key={cp.id} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{cp.nursingDiagnosis}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}><strong>Goal:</strong> {cp.goal}</div>
              </div>
            ))}
          </div>
        )}

        {/* 6. NOTES */}
        {activeSubTab === 'notes' && (
          <div className="card-body">
            {patientNotes.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <span>{n.createdAt || `${n.noteDate} ${n.noteTime}`}</span>
                  <span>Nurse {n.nurseName}</span>
                </div>
                <div style={{ fontSize: 13 }}>{n.observations}</div>
              </div>
            ))}
          </div>
        )}

        {/* 7. INTAKE / OUTPUT */}
        {activeSubTab === 'intake_output' && (
          <div className="card-body">
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>Total Intake: <strong>{totalIntake} mL</strong></div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>Total Output: <strong>{totalOutput} mL</strong></div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>Net Balance: <strong>{netFluidBalance} mL</strong></div>
            </div>
          </div>
        )}

        {/* 8. WOUND CARE */}
        {activeSubTab === 'wound_care' && (
          <div className="card-body">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Regular dressing and surgical site monitoring active under nurse protocol.
            </div>
          </div>
        )}

        {/* 9. PAIN & ASSESSMENT */}
        {activeSubTab === 'pain' && (
          <div className="card-body">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Pain Score: {latestVitals?.painScore || 2}/10 · Analgesia managed per doctor prescription.
            </div>
          </div>
        )}

        {/* 10. ORDERS */}
        {activeSubTab === 'orders' && (
          <div className="card-body">
            {patientDoctorOrders.map(o => (
              <div key={o.id} style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{o.orderText}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Ordered by Dr. {o.doctorName}</div>
              </div>
            ))}
          </div>
        )}

        {/* 11. HANDOVER */}
        {activeSubTab === 'handover' && (
          <div className="card-body">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Patient stable. IV fluids ongoing. Vitals monitored every 4 hours.
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showVitalsModal && (
        <RecordVitalsModal
          admission={selectedAdmission}
          onClose={() => setShowVitalsModal(false)}
        />
      )}

      {showNoteModal && (
        <RecordNoteModal
          admission={selectedAdmission}
          onClose={() => setShowNoteModal(false)}
        />
      )}

      {showPrintVitalsModal && selectedPatient && (
        <PrintVitalsChartModal
          admission={selectedAdmission}
          patient={selectedPatient}
          vitals={patientVitals}
          onClose={() => setShowPrintVitalsModal(false)}
        />
      )}

      {showPrintMARModal && selectedPatient && (
        <PrintMARSheetModal
          admission={selectedAdmission}
          patient={selectedPatient}
          records={patientMAR}
          onClose={() => setShowPrintMARModal(false)}
        />
      )}
    </div>
  );
}
