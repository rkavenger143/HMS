import React, { useState } from 'react';
import {
  BedDouble, HeartPulse, Plus, Clock, User, CheckCircle2,
  AlertTriangle, FileText, Activity, ShieldCheck, Printer, Stethoscope
} from 'lucide-react';
import { useDoctor, DoctorRoundNoteRecord } from '../context/DoctorContext';
import RecordRoundModal from './modals/RecordRoundModal';

export default function DoctorIPDRounds() {
  const { doctors, admissions, doctorRounds, selectedDoctorId, setSelectedDoctorId } = useDoctor();

  const [activeDoctorId, setActiveDoctorId] = useState<string>(selectedDoctorId || doctors[0]?.id || 'doc-1');
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null);
  const [showRoundModal, setShowRoundModal] = useState(false);

  const activeDoctor = doctors.find(d => d.id === activeDoctorId) || doctors[0];

  // Active admitted patients
  const activeAdmissions = admissions.filter(a => a.status === 'active');

  // Filtered rounds for selected patient or doctor
  const displayedRounds = selectedAdmission
    ? doctorRounds.filter(r => r.admissionId === selectedAdmission.id || r.patientId === selectedAdmission.patientId)
    : doctorRounds;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(217,119,6,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Doctor IPD Inpatient Care & Ward Round Progress Notes
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Daily bedside clinical rounds: Vitals Review → Examination & Assessment → Nursing & Diet Orders → Discharge Planning
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Consulting Doctor:</label>
          <select
            className="form-select"
            style={{ width: 240, height: 36, fontSize: 12 }}
            value={activeDoctorId}
            onChange={e => {
              setActiveDoctorId(e.target.value);
              setSelectedDoctorId(e.target.value);
            }}
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Inpatient List + Round Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left Column: Assigned Inpatients */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Assigned Inpatient Ward List</span>
            <span className="badge badge-warning">{activeAdmissions.length} Admitted</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bed & Ward</th>
                    <th>Patient Name & UHID</th>
                    <th>Admission Date</th>
                    <th>Diagnosis</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAdmissions.map(adm => {
                    const isSelected = selectedAdmission?.id === adm.id;
                    return (
                      <tr
                        key={adm.id}
                        style={{
                          background: isSelected ? 'var(--color-primary-muted)' : undefined,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedAdmission(adm)}
                      >
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{adm.bedNumber}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{adm.ward}</div>
                        </td>

                        <td>
                          <strong>{adm.patientName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{adm.patientId}</div>
                        </td>

                        <td>{adm.admissionDate}</td>

                        <td>
                          <div style={{ fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {Array.isArray(adm.diagnosis) ? adm.diagnosis.join(', ') : adm.diagnosis}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAdmission(adm);
                              setShowRoundModal(true);
                            }}
                          >
                            <Plus size={11} /> Round Note
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Round Progress Notes History */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartPulse size={18} style={{ color: '#d97706' }} />
              <div>
                <span className="card-title">Daily Clinical Round Progress Notes</span>
                <div className="card-subtitle">
                  {selectedAdmission ? `Showing notes for ${selectedAdmission.patientName} (${selectedAdmission.bedNumber})` : 'All recent bedside round entries'}
                </div>
              </div>
            </div>

            {selectedAdmission && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowRoundModal(true)}>
                <Plus size={12} /> Add Round Note
              </button>
            )}
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 500, overflowY: 'auto' }}>
            {displayedRounds.map(round => (
              <div
                key={round.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{round.patientName} ({round.bedNumber} · {round.ward})</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      Round by <strong>{round.doctorName}</strong> on {round.roundDate} at {round.roundTime}
                    </div>
                  </div>

                  <span className={`badge ${round.clinicalStatus === 'improving' || round.clinicalStatus === 'ready_for_discharge' ? 'badge-success' : round.clinicalStatus === 'critical' || round.clinicalStatus === 'deteriorating' ? 'badge-danger' : 'badge-primary'}`}>
                    {round.clinicalStatus.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {round.vitalsSummary && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', background: '#ffffff', padding: '6px 10px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    🩺 <strong>Vitals:</strong> {round.vitalsSummary}
                  </div>
                )}

                <div style={{ fontSize: 12 }}>
                  <strong style={{ color: 'var(--color-primary)' }}>Examination & Assessment:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{round.examinationNotes}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{round.assessmentAndPlan}</div>
                </div>

                {round.nursingInstructions && (
                  <div style={{ fontSize: 11, color: '#0369a1', background: '#f0f9ff', padding: '6px 10px', borderRadius: 4 }}>
                    📋 <strong>Nursing Instructions:</strong> {round.nursingInstructions}
                  </div>
                )}

                {round.isDischargePlanned && (
                  <div style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', padding: '6px 10px', borderRadius: 4, fontWeight: 700 }}>
                    🏁 Planned for Discharge on {round.plannedDischargeDate || 'Soon'}
                  </div>
                )}
              </div>
            ))}

            {displayedRounds.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                No clinical round notes recorded yet. Select an admitted patient and click "Add Round Note".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Round Note Modal */}
      {showRoundModal && (
        <RecordRoundModal
          admission={selectedAdmission || activeAdmissions[0]}
          doctor={activeDoctor}
          onClose={() => setShowRoundModal(false)}
        />
      )}
    </div>
  );
}
