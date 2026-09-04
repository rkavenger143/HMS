import React, { useState } from 'react';
import {
  FileText, Search, User, Calendar, Clock, Activity,
  Pill, FlaskConical, Scan, HeartPulse, Stethoscope, ChevronRight
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';

export default function DoctorPatientHistory() {
  const { patients, consultations, doctorRounds } = useDoctor();

  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat-001');

  const filteredPatients = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Past consultations for this patient
  const patientConsults = consultations.filter(c => c.patientId === activePatient?.id);

  // Past rounds for this patient
  const patientRounds = doctorRounds.filter(r => r.patientId === activePatient?.id);

  const getAge = (dob?: string) => {
    if (!dob) return 45;
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear || 45;
    } catch {
      return 45;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Comprehensive Patient Medical Record & Consultation History
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Unified EHR view: Longitudinal Clinical Notes → Prescriptions → Lab & Radiology Findings → Inpatient Rounds
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Patient Selector + Detailed EHR Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Left Column: Patient Explorer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient name, UHID..."
                style={{ paddingLeft: 32 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body" style={{ padding: 0, maxHeight: 560, overflowY: 'auto' }}>
            {filteredPatients.map(p => {
              const isSelected = p.id === activePatient?.id;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-default)',
                    background: isSelected ? 'var(--color-primary-muted)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setSelectedPatientId(p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--bg-surface)', color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13
                    }}>
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {p.firstName} {p.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {p.id} · {getAge(p.dateOfBirth)}y / {p.gender}
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Longitudinal EHR Timeline */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient Demographic Banner */}
          {activePatient && (
            <div className="card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activePatient.firstName} {activePatient.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    UHID: <strong>{activePatient.id}</strong> · {getAge(activePatient.dateOfBirth)} yrs · {activePatient.gender} · Blood: <strong>{activePatient.bloodGroup || 'O+'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-success">Active Registered</span>
                </div>
              </div>
            </div>
          )}

          {/* Consultation Encounters */}
          <div className="card">
            <div className="card-header">
              <Stethoscope size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Past Clinical Consultations ({patientConsults.length})</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patientConsults.map(c => (
                <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{c.primaryDiagnosis}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Consulted with <strong>{c.doctorName}</strong> on {c.consultationDate}
                      </div>
                    </div>
                    <span className="badge badge-success">COMPLETED</span>
                  </div>

                  <div style={{ fontSize: 12 }}>
                    <strong>Chief Complaints:</strong> {c.chiefComplaint}
                  </div>

                  <div style={{ fontSize: 12 }}>
                    <strong>Examination:</strong> {c.examinationFindings}
                  </div>

                  {c.medicines?.length > 0 && (
                    <div style={{ fontSize: 11, background: '#ffffff', padding: '8px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                      <strong>Prescribed Medicines:</strong>
                      <div style={{ marginTop: 2 }}>
                        {c.medicines.map((m, i) => (
                          <span key={i} style={{ display: 'inline-block', marginRight: 10, color: '#0f172a' }}>
                            • {m.name} ({m.frequency}, {m.duration})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {patientConsults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                  No previous outpatient consultations recorded for this patient.
                </div>
              )}
            </div>
          </div>

          {/* Inpatient Round Progress Notes */}
          <div className="card">
            <div className="card-header">
              <HeartPulse size={17} style={{ color: '#d97706' }} />
              <span className="card-title">Inpatient Ward Rounds & Progress Notes ({patientRounds.length})</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patientRounds.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      Round on {r.roundDate} at {r.roundTime} by {r.doctorName} ({r.bedNumber})
                    </div>
                    <span className="badge badge-primary">{r.clinicalStatus.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r.examinationNotes}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Plan: {r.assessmentAndPlan}</div>
                </div>
              ))}

              {patientRounds.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                  No inpatient ward round notes recorded for this patient.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
