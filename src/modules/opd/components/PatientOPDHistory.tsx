import React, { useState } from 'react';
import {
  History, Search, User, Calendar, Stethoscope, Pill, FlaskConical,
  Scan, ReceiptText, Clock, ChevronRight, Eye, AlertCircle, FileText,
  Activity, ArrowRight, Sparkles, Bot, ShieldCheck
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDVisit, Patient } from '../../../types';
import PrintConsultationModal from './modals/PrintConsultationModal';

export default function PatientOPDHistory() {
  const {
    patients,
    visits,
    consultations,
    prescriptions,
    labRequests,
    radiologyOrders,
    bills,
    followUps,
    selectedPatientId,
    setSelectedPatientId,
  } = useOPD();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'visits' | 'prescriptions' | 'consultations' | 'followups' | 'bills' | 'labs' | 'radiology'>('visits');
  const [inspectVisit, setInspectVisit] = useState<OPDVisit | null>(null);
  const [showAiSummary, setShowAiSummary] = useState(true);

  // Active Patient selection
  const currentPatientId = selectedPatientId || patients[0]?.id;
  const currentPatient = patients.find(p => p.id === currentPatientId) || patients[0];

  // Matching patients search
  const searchResults = patients.filter(p => {
    if (!search || search.length < 2) return false;
    const q = search.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }).slice(0, 6);

  // Patient history datasets
  const patientVisits = visits.filter(v => v.patientId === currentPatient?.id);
  const patientPrescriptions = prescriptions.filter(p => p.patientId === currentPatient?.id);
  const patientConsultations = consultations.filter(c => c.patientId === currentPatient?.id);
  const patientLabs = labRequests.filter(lr => lr.patientId === currentPatient?.id);
  const patientRadiology = radiologyOrders.filter(ro => ro.patientId === currentPatient?.id);
  const patientBills = bills.filter(b => b.patientId === currentPatient?.id);
  const patientFollowUps = followUps.filter(f => f.patientId === currentPatient?.id);

  const age = currentPatient ? new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear() : 45;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search and Patient Selector Header */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={22} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Patient OPD Encounter History & Longitudinal EHR</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Comprehensive cross-encounter clinical timeline, prescriptions, consultations, billing, and diagnostic references
              </div>
            </div>
          </div>

          {/* Quick Patient Switcher Search */}
          <div style={{ position: 'relative', width: 340 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search UHID, name, or phone..."
              style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    className="search-result-item"
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setSearch('');
                    }}
                  >
                    <div className="avatar avatar-sm">{p.firstName[0]}{p.lastName[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.id} · {p.phone} · {p.bloodGroup}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Patient Banner */}
      {currentPatient && (
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar avatar-lg" style={{ background: 'var(--color-primary)', color: '#fff', fontSize: 18, fontWeight: 700 }}>
                {currentPatient.firstName[0]}{currentPatient.lastName[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{currentPatient.firstName} {currentPatient.lastName}</span>
                  <span className="badge badge-primary">{currentPatient.id}</span>
                  <span className="badge badge-neutral">{currentPatient.gender.toUpperCase()} · {age} yrs</span>
                  <span className="badge badge-outline" style={{ fontWeight: 700 }}>Blood: {currentPatient.bloodGroup}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <span>Phone: <strong>{currentPatient.phone}</strong></span>
                  <span>·</span>
                  <span>Registered: {currentPatient.registrationDate}</span>
                  <span>·</span>
                  <span>City: {currentPatient.city}, {currentPatient.state}</span>
                </div>
              </div>
            </div>

            {currentPatient.allergies.length > 0 && (
              <div style={{ padding: '6px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: 12, fontWeight: 700 }}>
                ⚠ Allergies: {currentPatient.allergies.join(', ')}
              </div>
            )}
          </div>

          {/* AI Longitudinal Summary Panel */}
          {showAiSummary && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(59, 130, 246, 0.04) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, color: '#4338ca' }}>
                  <Sparkles size={15} style={{ color: '#6366f1' }} />
                  AI Longitudinal EHR Synthesis ({patientVisits.length} Encounters, {patientPrescriptions.length} Prescriptions)
                </div>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Automated Clinical Timeline Summary</span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                Patient has <strong>{patientVisits.length} recorded OPD visits</strong> with <strong>{patientConsultations.length} clinical consultations</strong>.
                {patientConsultations.length > 0 && patientConsultations[0].diagnosis
                  ? ` Primary documented condition: "${Array.isArray(patientConsultations[0].diagnosis) ? patientConsultations[0].diagnosis.join(', ') : patientConsultations[0].diagnosis}".`
                  : ' Baseline health indicators stable across regular follow-ups.'}
                {currentPatient.allergies.length > 0 && ` ⚠️ Known active hypersensitivity to ${currentPatient.allergies.join(', ')}.`}
              </p>
              <div style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} style={{ color: '#6366f1' }} /> AI assistive timeline synthesis — refer to primary physician notes for official diagnosis.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs Row */}
      <div className="tabs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', padding: 4 }}>
        <button className={`tab ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => setActiveTab('visits')}>
          <Stethoscope size={13} style={{ display: 'inline', marginRight: 4 }} /> Visits Timeline ({patientVisits.length})
        </button>
        <button className={`tab ${activeTab === 'consultations' ? 'active' : ''}`} onClick={() => setActiveTab('consultations')}>
          <FileText size={13} style={{ display: 'inline', marginRight: 4 }} /> Consultations ({patientConsultations.length})
        </button>
        <button className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
          <Pill size={13} style={{ display: 'inline', marginRight: 4 }} /> Prescriptions ({patientPrescriptions.length})
        </button>
        <button className={`tab ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>
          <Clock size={13} style={{ display: 'inline', marginRight: 4 }} /> Follow-Ups ({patientFollowUps.length})
        </button>
        <button className={`tab ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>
          <ReceiptText size={13} style={{ display: 'inline', marginRight: 4 }} /> Central Billing ({patientBills.length})
        </button>
        <button className={`tab ${activeTab === 'labs' ? 'active' : ''}`} onClick={() => setActiveTab('labs')}>
          <FlaskConical size={13} style={{ display: 'inline', marginRight: 4 }} /> Lab Reference ({patientLabs.length})
        </button>
        <button className={`tab ${activeTab === 'radiology' ? 'active' : ''}`} onClick={() => setActiveTab('radiology')}>
          <Scan size={13} style={{ display: 'inline', marginRight: 4 }} /> Diagnostics Reference ({patientRadiology.length})
        </button>
      </div>

      {/* Content Panels */}
      {/* 1. Visits Timeline */}
      {activeTab === 'visits' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Chronological OPD Encounters</span>
          </div>
          <div className="card-body">
            {patientVisits.length > 0 ? (
              <div className="timeline">
                {patientVisits.map((v, idx) => (
                  <div key={v.id} className="timeline-item">
                    <div className="timeline-dot" style={{ borderColor: 'var(--color-primary)' }}>
                      <Stethoscope size={14} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {v.visitDate} ({v.visitTime}) — <span style={{ color: 'var(--color-primary)' }}>{v.id}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            Dr. {v.doctorName} · {v.department} · Token #{v.tokenNumber} · Type: <strong style={{ textTransform: 'capitalize' }}>{v.visitType}</strong>
                          </div>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInspectVisit(v)}
                        >
                          <Eye size={12} /> View Full Encounter
                        </button>
                      </div>

                      {v.reasonForVisit && (
                        <div className="timeline-desc" style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>
                          <strong>Presenting Complaint:</strong> {v.reasonForVisit}
                        </div>
                      )}

                      {v.vitals && (
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                          {v.vitals.bloodPressure && <span>BP: <strong>{v.vitals.bloodPressure}</strong></span>}
                          {v.vitals.pulse && <span>Pulse: <strong>{v.vitals.pulse}</strong> bpm</span>}
                          {v.vitals.temperature && <span>Temp: <strong>{v.vitals.temperature}</strong> °F</span>}
                          {v.vitals.spo2 && <span>SpO2: <strong>{v.vitals.spo2}</strong>%</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><History size={28} /></div>
                <div className="empty-state-title">No OPD Visits Recorded</div>
                <div className="empty-state-desc">This patient has no outpatient encounters registered on file.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Consultations */}
      {activeTab === 'consultations' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Doctor Consultation Clinical Encounters</span>
          </div>
          <div className="card-body">
            {patientConsultations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {patientConsultations.map(c => (
                  <div key={c.id} style={{ padding: '16px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 14 }}>{c.id}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>Date: {c.date}</span>
                      </div>
                      <span className="badge badge-success">Consultation Completed</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Chief Complaint:</div>
                        <div>{c.chiefComplaint || 'Routine Evaluation'}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Diagnoses:</div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{c.diagnosis?.join(', ') || 'Clinical Evaluation'}</div>
                      </div>
                      {c.examination && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Clinical Examination & Findings:</div>
                          <div>{c.examination}</div>
                        </div>
                      )}
                      {c.notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Treatment Plan & Notes:</div>
                          <div>{c.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={28} /></div>
                <div className="empty-state-title">No Consultation Records Found</div>
                <div className="empty-state-desc">No clinical case sheets are logged for this patient.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Medication History</span>
          </div>
          <div className="card-body">
            {patientPrescriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {patientPrescriptions.map(rx => (
                  <div key={rx.id} style={{ padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>{rx.id}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>Date: {rx.date}</span>
                      </div>
                      <span className="badge badge-success">Doctor: {rx.doctorName || 'Dr. Rajesh Kumar'}</span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                      Diagnosis: <span style={{ color: 'var(--color-primary)' }}>{rx.diagnosis}</span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-card)', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px' }}>Medicine</th>
                          <th style={{ padding: '6px 8px' }}>Dosage</th>
                          <th style={{ padding: '6px 8px' }}>Frequency</th>
                          <th style={{ padding: '6px 8px' }}>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.medicines?.map((m: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 600 }}>{m.medicineName}</td>
                            <td style={{ padding: '6px 8px' }}>{m.dosage}</td>
                            <td style={{ padding: '6px 8px', color: 'var(--color-primary)', fontWeight: 600 }}>{m.frequency}</td>
                            <td style={{ padding: '6px 8px' }}>{m.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Prescriptions Found</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Follow-ups */}
      {activeTab === 'followups' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Follow-up Schedule</span>
          </div>
          <div className="card-body">
            {patientFollowUps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {patientFollowUps.map(fu => (
                  <div key={fu.id} style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Follow-up: {fu.followUpDate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{fu.doctorName} ({fu.department}) · {fu.reason}</div>
                    </div>
                    <span className={`badge ${fu.status === 'upcoming' ? 'badge-primary' : 'badge-neutral'}`}>
                      {fu.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Follow-ups Scheduled</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Central Bills */}
      {activeTab === 'bills' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Central Billing Invoices & Receipts</span>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/billing'}>
              View in Central Billing <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            {patientBills.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientBills.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{b.billNumber}</td>
                        <td>{b.date}</td>
                        <td style={{ fontWeight: 700 }}>₹{b.total || b.totalAmount}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>₹{b.paidAmount}</td>
                        <td style={{ color: b.balanceDue > 0 ? 'var(--color-danger)' : 'var(--text-secondary)', fontWeight: 700 }}>₹{b.balanceDue}</td>
                        <td>
                          <span className={`badge ${b.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Billing Records on File</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Lab Reference */}
      {activeTab === 'labs' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FlaskConical size={16} style={{ color: 'var(--color-info)' }} />
              <span className="card-title">Laboratory Investigations Reference</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/laboratory'}>
              View in Central Laboratory <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            {patientLabs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {patientLabs.map(lr => (
                  <div key={lr.id} style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-info)' }}>{lr.id}</span>
                      <span className={`badge ${lr.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {lr.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                      {lr.requestDate} · Dr. {lr.doctorName} · Priority: {lr.priority.toUpperCase()}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Tests: <strong>{lr.tests.map(t => t.testName).join(', ')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Lab Investigations on Record</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Diagnostics Reference */}
      {activeTab === 'radiology' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scan size={16} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title">Radiology & Diagnostics Reference</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/radiology'}>
              View in Central Diagnostics <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            {patientRadiology.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {patientRadiology.map(rad => (
                  <div key={rad.id} style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-ai)' }}>{rad.id}</span>
                      <span className="badge badge-ai" style={{ textTransform: 'uppercase' }}>{rad.modality}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginTop: 4 }}>
                      {rad.bodyPart}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {rad.scheduledDate} · Status: {rad.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Radiology Scans on Record</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Visit Modal */}
      {inspectVisit && (
        <PrintConsultationModal
          visit={inspectVisit}
          patient={currentPatient}
          onClose={() => setInspectVisit(null)}
        />
      )}
    </div>
  );
}
