import React, { useState } from 'react';
import {
  User, BedDouble, Stethoscope, Activity, FileText, Pill,
  TestTube, Scissors, ArrowRightLeft, ReceiptText, Printer,
  CheckCircle2, Clock, Plus, ShieldAlert, Sparkles, Download, AlertCircle,
  Eye
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, Patient, Bed } from '../../../types';
import PrintAdmissionSlipModal from './modals/PrintAdmissionSlipModal';
import PrintDischargeSummaryModal from './modals/PrintDischargeSummaryModal';
import PrintIPDBillModal from './modals/PrintIPDBillModal';
import RecordRoundModal from './modals/RecordRoundModal';
import RecordNursingVitalsModal from './modals/RecordNursingVitalsModal';
import TransferModal from './modals/TransferModal';

export type InpatientProfileTab =
  | 'overview'
  | 'admission'
  | 'vitals'
  | 'nursing'
  | 'rounds'
  | 'medications'
  | 'laboratory'
  | 'radiology'
  | 'procedures'
  | 'diet'
  | 'transfers'
  | 'billing'
  | 'discharge'
  | 'history';

export default function InpatientProfile() {
  const {
    selectedAdmission,
    selectedAdmissionId,
    admissions,
    setSelectedAdmissionId,
    patients,
    beds,
    vitalsHistory,
    doctorRounds,
    nursingNotes,
    inpatientMedications,
    medicationAdministrations,
    administerMedication,
    procedures,
    transfers,
    ipdBills,
    dischargeRecords,
    labRequests,
    radiologyOrders,
    setActiveTab,
  } = useIPD();

  const [activeTab, setActiveTabState] = useState<InpatientProfileTab>('overview');

  // Modals
  const [showAdmissionSlip, setShowAdmissionSlip] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // If no admission selected, fallback to first active admission
  const admission = selectedAdmission || admissions[0];
  const patient = admission ? patients.find(p => p.id === admission.patientId) : null;
  const bed = admission ? beds.find(b => b.id === admission.bedId) : null;

  if (!admission) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="empty-state-icon"><User size={32} /></div>
        <div className="empty-state-title">No Inpatient Selected</div>
        <div className="empty-state-desc">Select an inpatient from the active admissions roster.</div>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setActiveTab('inpatients')}>
          Go to Inpatients Roster
        </button>
      </div>
    );
  }

  const patientVitals = vitalsHistory[admission.id] || [];
  const patientRounds = doctorRounds.filter(r => r.admissionId === admission.id);
  const patientNursing = nursingNotes.filter(n => n.admissionId === admission.id);
  const patientMeds = inpatientMedications.filter(m => m.admissionId === admission.id);
  const patientProcedures = procedures.filter(p => p.admissionId === admission.id);
  const patientTransfers = transfers.filter(t => t.admissionId === admission.id);
  const patientBills = ipdBills.filter(b => b.admissionId === admission.id);
  const patientDischarge = dischargeRecords.find(d => d.admissionId === admission.id);
  const patientLabs = labRequests.filter(l => l.admissionId === admission.id || l.patientId === admission.patientId);
  const patientRads = radiologyOrders.filter(r => r.admissionId === admission.id || r.patientId === admission.patientId);

  const daysStay = Math.floor((new Date().getTime() - new Date(admission.admissionDate).getTime()) / 86400000) + 1;
  const isICU = admission.ward.toLowerCase().includes('icu');
  const isDischarged = admission.status === 'discharged';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Sticky Inpatient Header Banner */}
      <div className="card" style={{ padding: '18px 24px', background: 'var(--bg-card)', borderLeft: isICU ? '5px solid var(--color-danger)' : '5px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          {/* Patient Details & Avatar */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar avatar-xl" style={{ background: isICU ? 'linear-gradient(135deg, var(--color-danger), #ff6b35)' : 'linear-gradient(135deg, var(--color-primary), var(--color-ai))', color: 'white', fontWeight: 800 }}>
              {admission.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {admission.patientName}
                </span>
                <span className="patient-id">{admission.patientId}</span>
                <span className="badge badge-primary">{admission.id}</span>
                {isICU && <span className="badge badge-danger">🔴 ICU INPATIENT</span>}
                <span className={`badge ${admission.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                  {admission.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, flexWrap: 'wrap' }}>
                <span><strong>Bed:</strong> <strong style={{ color: 'var(--color-primary)' }}>{admission.bedNumber}</strong> ({admission.ward})</span>
                <span><strong>Doctor:</strong> {admission.admittingDoctorName}</span>
                <span><strong>Admitted:</strong> {admission.admissionDate} ({daysStay} days)</span>
                <span><strong>Gender:</strong> {patient?.gender || 'Male'}</span>
                <span><strong>Blood:</strong> <span className="badge badge-neutral">{patient?.bloodGroup || 'O+'}</span></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAdmissionSlip(true)}>
              <Printer size={13} /> Admission Slip
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowVitalsModal(true)}>
              <Activity size={13} /> Record Vitals
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRoundModal(true)}>
              <Stethoscope size={13} /> Add Clinical Note
            </button>
            {!isDischarged && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(true)}>
                  <ArrowRightLeft size={13} /> Transfer
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('discharge')}>
                  <CheckCircle2 size={13} /> Discharge
                </button>
              </>
            )}
          </div>
        </div>

        {/* Patient Allergies Banner */}
        {patient?.allergies && patient.allergies.length > 0 && (
          <div style={{ marginTop: 12, padding: '6px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--color-danger)', fontWeight: 700 }}>
            ⚠️ ALLERGY ALERT: {patient.allergies.join(', ')}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs (14 Ordered Tabs - Section 16) */}
      <div className="tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTabState('overview')}>
          <FileText size={13} /> 1. Overview
        </button>
        <button className={`tab ${activeTab === 'admission' ? 'active' : ''}`} onClick={() => setActiveTabState('admission')}>
          <User size={13} /> 2. Admission
        </button>
        <button className={`tab ${activeTab === 'vitals' ? 'active' : ''}`} onClick={() => setActiveTabState('vitals')}>
          <Activity size={13} /> 3. Vitals ({patientVitals.length})
        </button>
        <button className={`tab ${activeTab === 'nursing' ? 'active' : ''}`} onClick={() => setActiveTabState('nursing')}>
          <Activity size={13} /> 4. Nursing ({patientNursing.length})
        </button>
        <button className={`tab ${activeTab === 'rounds' ? 'active' : ''}`} onClick={() => setActiveTabState('rounds')}>
          <Stethoscope size={13} /> 5. Doctor Notes ({patientRounds.length})
        </button>
        <button className={`tab ${activeTab === 'medications' ? 'active' : ''}`} onClick={() => setActiveTabState('medications')}>
          <Pill size={13} /> 6. Medications ({patientMeds.length})
        </button>
        <button className={`tab ${activeTab === 'laboratory' ? 'active' : ''}`} onClick={() => setActiveTabState('laboratory')}>
          <TestTube size={13} /> 7. Laboratory ({patientLabs.length})
        </button>
        <button className={`tab ${activeTab === 'radiology' ? 'active' : ''}`} onClick={() => setActiveTabState('radiology')}>
          <FileText size={13} /> 8. Radiology ({patientRads.length})
        </button>
        <button className={`tab ${activeTab === 'procedures' ? 'active' : ''}`} onClick={() => setActiveTabState('procedures')}>
          <Scissors size={13} /> 9. Procedures ({patientProcedures.length})
        </button>
        <button className={`tab ${activeTab === 'diet' ? 'active' : ''}`} onClick={() => setActiveTabState('diet')}>
          <FileText size={13} /> 10. Diet
        </button>
        <button className={`tab ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTabState('transfers')}>
          <ArrowRightLeft size={13} /> 11. Bed/Transfer History ({patientTransfers.length})
        </button>
        <button className={`tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTabState('billing')}>
          <ReceiptText size={13} /> 12. Billing
        </button>
        <button className={`tab ${activeTab === 'discharge' ? 'active' : ''}`} onClick={() => setActiveTabState('discharge')}>
          <CheckCircle2 size={13} /> 13. Discharge
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTabState('history')}>
          <Clock size={13} /> 14. Medical History
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          {/* Admission & Clinical Details */}
          <div className="card">
            <div className="card-header">
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Inpatient Admission Record</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Admission Date & Time:</span><br /><strong>{admission.admissionDate} at {admission.admissionTime}</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Attending Consultant:</span><br /><strong>{admission.admittingDoctorName}</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Ward / Floor:</span><br /><strong>{admission.ward} (Floor {bed?.floor || 1})</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Allocated Bed #:</span><br /><strong style={{ color: 'var(--color-primary)' }}>{admission.bedNumber} ({bed?.type?.toUpperCase()})</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Daily Bed Rate:</span><br /><strong style={{ color: 'var(--color-success)' }}>₹{bed?.dailyRate || 800}/day</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Admission Source:</span><br /><strong>{admission.referredBy || 'Direct OPD'}</strong></div>
              </div>

              <div style={{ marginTop: 16, borderTop: '1px solid var(--border-muted)', paddingTop: 12 }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Provisional Admitting Diagnosis:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {admission.diagnosis.map((d, i) => (
                    <span key={i} className="badge badge-warning" style={{ fontSize: 12 }}>{d}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Admission Notes & Clinical Instructions:</span>
                <div style={{ fontSize: 13, marginTop: 4, color: 'var(--text-secondary)' }}>
                  {admission.admissionNotes || 'Routine inpatient evaluation and supportive care.'}
                </div>
              </div>
            </div>
          </div>

          {/* Attendant & Insurance Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <User size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">Attendant Pass Details</span>
              </div>
              <div className="card-body" style={{ fontSize: 13 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Attendant Name:</span><br /><strong>{admission.attendantName || 'Family Member'}</strong></div>
                  <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Relationship:</span><br /><strong>{admission.attendantRelation || 'Family'}</strong></div>
                  <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Phone:</span><br /><strong>{admission.attendantPhone || patient?.phone}</strong></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <ReceiptText size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">Insurance / TPA Coverage</span>
              </div>
              <div className="card-body" style={{ fontSize: 13 }}>
                {patient?.insurance ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Insurance Provider:</span><br /><strong style={{ color: 'var(--color-primary)' }}>{patient.insurance.provider}</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Policy / Member ID:</span><br /><strong>{patient.insurance.policyNumber}</strong></div>
                    {patient.insurance.tpaName && <div><span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>TPA Desk:</span><br /><strong>{patient.insurance.tpaName}</strong></div>}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Self-paying cash patient (No insurance on file).</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VITALS MONITORING */}
      {activeTab === 'vitals' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Inpatient Vitals Chart & Timeline</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowVitalsModal(true)}>
              <Plus size={13} /> Chart Bedside Vitals
            </button>
          </div>
          <div className="card-body">
            {patientVitals.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>BP (mmHg)</th>
                      <th>Pulse</th>
                      <th>Temp (°F)</th>
                      <th>SpO2</th>
                      <th>Resp Rate</th>
                      <th>Blood Sugar</th>
                      <th>Pain Score</th>
                      <th>BMI</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientVitals.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 700, fontSize: 12 }}>{v.recordedAt}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{v.bloodPressure}</td>
                        <td>{v.pulse} bpm</td>
                        <td>{v.temperature}°F</td>
                        <td>
                          <span className={`badge ${v.spo2 < 95 ? 'badge-danger' : 'badge-success'}`}>
                            {v.spo2}%
                          </span>
                        </td>
                        <td>{v.respiratoryRate}/min</td>
                        <td>{v.bloodSugar ? `${v.bloodSugar} mg/dL` : '—'}</td>
                        <td>
                          <span className={`badge ${v.painScore && v.painScore > 5 ? 'badge-danger' : 'badge-neutral'}`}>
                            {v.painScore ?? 0} / 10
                          </span>
                        </td>
                        <td>{v.bmi || '—'}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Activity size={28} /></div>
                <div className="empty-state-title">No Vitals Recorded Yet</div>
                <div className="empty-state-desc">Click "Chart Bedside Vitals" to add the first observation.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR ROUNDS & CLINICAL NOTES */}
      {activeTab === 'rounds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stethoscope size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">Daily Doctor Rounds & Progress Notes</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowRoundModal(true)}>
                <Plus size={13} /> Record Doctor Round
              </button>
            </div>
            <div className="card-body">
              {patientRounds.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {patientRounds.map(r => (
                    <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm">{r.doctorName[0]}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{r.doctorName} ({r.department})</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.roundDate} at {r.roundTime}</div>
                          </div>
                        </div>
                        <span className={`badge ${r.condition === 'critical' ? 'badge-danger' : r.condition === 'improving' ? 'badge-success' : 'badge-primary'}`}>
                          Condition: {r.condition.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, marginTop: 8 }}>
                        <strong>Progress Notes: </strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{r.progressNotes}</span>
                      </div>

                      {r.clinicalFindings && (
                        <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-tertiary)' }}>
                          <strong>Examination Findings: </strong>{r.clinicalFindings}
                        </div>
                      )}

                      {r.treatmentPlan && (
                        <div style={{ fontSize: 12, marginTop: 6, color: 'var(--color-primary)' }}>
                          <strong>Treatment Plan: </strong>{r.treatmentPlan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><Stethoscope size={28} /></div>
                  <div className="empty-state-title">No Doctor Rounds Recorded</div>
                  <div className="empty-state-desc">Record daily inpatient clinical findings and treatment plans.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMISSION & DIAGNOSIS */}
      {activeTab === 'admission' && (
        <div className="card">
          <div className="card-header">
            <ShieldAlert size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Inpatient Clinical Diagnoses (ICD-10 Coded)</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {admission.diagnosis.map((diag, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{diag}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Primary Admitting Condition · ICD-10 Verified</div>
                  </div>
                  <span className="badge badge-warning">Active Diagnosis</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MEDICATIONS & MAR */}
      {activeTab === 'medications' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Inpatient Medication Chart & MAR</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('medications')}>
              <Plus size={13} /> Manage Drug Chart
            </button>
          </div>
          <div className="card-body">
            {patientMeds.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Strength</th>
                      <th>Route</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Prescribed By</th>
                      <th>Status</th>
                      <th>Quick Administration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientMeds.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 800, fontSize: 13 }}>{m.medicineName}</td>
                        <td>{m.strength}</td>
                        <td><span className="badge badge-neutral">{m.route}</span></td>
                        <td>{m.dose}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{m.frequency}</td>
                        <td style={{ fontSize: 12 }}>{m.prescribingDoctor}</td>
                        <td><span className="badge badge-success">{m.status}</span></td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={() => administerMedication({ medicationId: m.id, admissionId: admission.id, status: 'administered' })}
                          >
                            ✓ Mark Given
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Pill size={28} /></div>
                <div className="empty-state-title">No Active Medications</div>
                <div className="empty-state-desc">Prescribe medications from the Inpatient Medications module.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7 & 8: LABORATORY & RADIOLOGY */}
      {(activeTab === 'laboratory' || activeTab === 'radiology') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Lab Orders */}
          <div className="card">
            <div className="card-header">
              <TestTube size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Laboratory Orders ({patientLabs.length})</span>
            </div>
            <div className="card-body">
              {patientLabs.length > 0 ? (
                patientLabs.map(l => (
                  <div key={l.id} style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{l.id}</span>
                      <span className="badge badge-info">{l.status}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>Tests: {l.tests.map(t => t.testName).join(', ')}</div>
                    {l.aiInsight && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-ai)', background: 'var(--color-ai-muted)', padding: '6px 8px', borderRadius: 4 }}>
                        ✨ AI: {l.aiInsight}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: 20 }}>No Lab Orders</div>
              )}
            </div>
          </div>

          {/* Radiology Scans */}
          <div className="card">
            <div className="card-header">
              <Eye size={16} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title">Radiology & Imaging Scans ({patientRads.length})</span>
            </div>
            <div className="card-body">
              {patientRads.length > 0 ? (
                patientRads.map(r => (
                  <div key={r.id} style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{r.modality} — {r.bodyPart}</span>
                      <span className="badge badge-primary">{r.status}</span>
                    </div>
                    <div style={{ marginTop: 4, color: 'var(--text-tertiary)' }}>Doctor: {r.doctorName}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: 20 }}>No Radiology Scans</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PROCEDURES */}
      {activeTab === 'procedures' && (
        <div className="card">
          <div className="card-header">
            <Scissors size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Inpatient Surgical & Bedside Procedures</span>
          </div>
          <div className="card-body">
            {patientProcedures.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Procedure Name</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Operating Doctor</th>
                      <th>Charge (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientProcedures.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 800 }}>{p.procedureName}</td>
                        <td><span className="badge badge-neutral">{p.category}</span></td>
                        <td>{p.procedureDate} {p.procedureTime}</td>
                        <td>{p.doctorName}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{p.price}</td>
                        <td><span className="badge badge-success">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Scissors size={28} /></div>
                <div className="empty-state-title">No Procedures Performed</div>
                <div className="empty-state-desc">Procedures performed during inpatient stay will appear here.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: BED TRANSFERS AUDIT */}
      {activeTab === 'transfers' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRightLeft size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Room & Bed Transfer Audit Trail</span>
            </div>
            {!isDischarged && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowTransferModal(true)}>
                <ArrowRightLeft size={13} /> Transfer Bed
              </button>
            )}
          </div>
          <div className="card-body">
            {patientTransfers.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Transfer ID</th>
                      <th>From Bed / Ward</th>
                      <th>To Bed / Ward</th>
                      <th>Reason</th>
                      <th>Requested By</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientTransfers.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, fontSize: 12 }}>{t.id}</td>
                        <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{t.fromBedNumber} ({t.fromWard})</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{t.toBedNumber} ({t.toWard})</td>
                        <td>{t.reason}</td>
                        <td>{t.requestedBy}</td>
                        <td>{t.transferDate} {t.transferTime}</td>
                        <td><span className="badge badge-success">{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><ArrowRightLeft size={28} /></div>
                <div className="empty-state-title">No Transfers Recorded</div>
                <div className="empty-state-desc">Patient has remained in their initially allocated bed ({admission.bedNumber}).</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: BILLING & TPA */}
      {activeTab === 'billing' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ReceiptText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Inpatient Stay Billing & Accrued Charges</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('billing')}>
              <ReceiptText size={13} /> Open IPD Billing Desk
            </button>
          </div>
          <div className="card-body">
            {/* Accrual Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">Length of Stay</div>
                <div className="stat-value">{daysStay} Days</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Daily Bed Tariff</div>
                <div className="stat-value">₹{bed?.dailyRate || 800}/d</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Accrued Room Tariff</div>
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{(bed?.dailyRate || 800) * daysStay}</div>
              </div>
            </div>

            {patientBills.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Generated Invoices on File:</div>
                {patientBills.map(b => (
                  <div key={b.id} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>Invoice #{b.billNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total: ₹{b.total} · Paid: ₹{b.paidAmount} · Due: ₹{b.balanceDue}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowBillModal(true)}>
                      <Printer size={12} /> Print Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 13: DISCHARGE & DOCUMENTS */}
      {activeTab === 'discharge' && (
        <div className="card">
          <div className="card-header">
            <Printer size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Inpatient Printable Documents & Slips</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {/* Admission Pass */}
              <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Inpatient Admission Pass</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>Official admission pass with attendant authorization</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAdmissionSlip(true)}>
                  <Printer size={13} /> Print Admission Pass
                </button>
              </div>

              {/* Discharge Summary */}
              <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Discharge Summary</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>Clinical summary, hospital course & discharge Rx</div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (patientDischarge) setShowDischargeModal(true);
                    else setActiveTab('discharge');
                  }}
                >
                  <Printer size={13} /> {patientDischarge ? 'Print Discharge Summary' : 'Create Discharge'}
                </button>
              </div>

              {/* IPD Bill */}
              <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>IPD Tax Invoice</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>Itemized inpatient invoice with room tariff</div>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('billing')}>
                  <ReceiptText size={13} /> Open Billing Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals Suite */}
      {showAdmissionSlip && (
        <PrintAdmissionSlipModal
          admission={admission}
          patient={patient}
          bed={bed}
          onClose={() => setShowAdmissionSlip(false)}
        />
      )}

      {showDischargeModal && patientDischarge && (
        <PrintDischargeSummaryModal
          record={patientDischarge}
          patient={patient}
          admission={admission}
          onClose={() => setShowDischargeModal(false)}
        />
      )}

      {showBillModal && patientBills.length > 0 && (
        <PrintIPDBillModal
          bill={patientBills[0]}
          patient={patient}
          admission={admission}
          onClose={() => setShowBillModal(false)}
        />
      )}

      {showRoundModal && (
        <RecordRoundModal
          admission={admission}
          onClose={() => setShowRoundModal(false)}
        />
      )}

      {showVitalsModal && (
        <RecordNursingVitalsModal
          admission={admission}
          onClose={() => setShowVitalsModal(false)}
        />
      )}

      {showTransferModal && (
        <TransferModal
          admission={admission}
          onClose={() => setShowTransferModal(false)}
        />
      )}
    </div>
  );
}
