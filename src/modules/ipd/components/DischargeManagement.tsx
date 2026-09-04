import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Printer, Plus,
  Sparkles, Stethoscope, User, Calendar, Clock, Pill, Trash2
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, DischargeType, IPDDischargeRecord } from '../../../types';
import PrintDischargeSummaryModal from './modals/PrintDischargeSummaryModal';

export default function DischargeManagement() {
  const {
    admissions,
    dischargeRecords,
    processDischarge,
    doctors,
    patients,
  } = useIPD();

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const [selectedAdmissionId, setSelectedAdmissionId] = useState(activeAdmissions[0]?.id || '');
  const [dischargeType, setDischargeType] = useState<DischargeType>('normal');
  const [dischargeDate, setDischargeDate] = useState('2026-08-31');
  const [dischargeTime, setDischargeTime] = useState('12:00');
  const [conditionAtDischarge, setConditionAtDischarge] = useState<'cured' | 'improved' | 'stable' | 'relieved' | 'critical' | 'expired'>('improved');
  const [finalDiagnosis, setFinalDiagnosis] = useState('Acute Inpatient Condition (Resolved)');
  const [clinicalSummary, setClinicalSummary] = useState('Patient admitted with acute complaints, evaluated and stabilized successfully.');
  const [hospitalCourse, setHospitalCourse] = useState('Managed with IV fluids, appropriate antibiotics, and daily doctor rounds. Vitals remained stable.');
  const [treatmentGiven, setTreatmentGiven] = useState('IV Antibiotics, Analgesics, Antacids, supportive fluid management.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-07');
  const [followUpDoctor, setFollowUpDoctor] = useState(doctors[0]?.name || 'Dr. Rajesh Kumar');
  const [followUpInstructions, setFollowUpInstructions] = useState('Report to OPD on follow-up date. In case of high fever or acute pain, contact Emergency 24x7.');

  // Discharge Medications List
  const [dischargeMeds, setDischargeMeds] = useState([
    { medicineName: 'Tab. Cefixime 200mg', dosage: '1 Tab', frequency: 'Twice Daily (BD)', duration: '5 Days', instructions: 'Take after meals' },
    { medicineName: 'Tab. Pantoprazole 40mg', dosage: '1 Tab', frequency: 'Once Daily (OD)', duration: '5 Days', instructions: 'Take before breakfast' },
    { medicineName: 'Tab. Paracetamol 650mg', dosage: '1 Tab', frequency: 'As Needed (SOS)', duration: '3 Days', instructions: 'For body ache or fever' },
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('1 Tab');
  const [newMedFreq, setNewMedFreq] = useState('Twice Daily (BD)');
  const [newMedDur, setNewMedDur] = useState('5 Days');
  const [newMedInst, setNewMedInst] = useState('After meals');

  // Print Summary Modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [createdSummary, setCreatedSummary] = useState<IPDDischargeRecord | null>(null);

  const selectedAdm = admissions.find(a => a.id === selectedAdmissionId) || activeAdmissions[0];
  const patient = selectedAdm ? patients.find(p => p.id === selectedAdm.patientId) : null;

  const handleAddMed = () => {
    if (!newMedName) return;
    setDischargeMeds(prev => [
      ...prev,
      { medicineName: newMedName, dosage: newMedDose, frequency: newMedFreq, duration: newMedDur, instructions: newMedInst }
    ]);
    setNewMedName('');
  };

  const handleRemoveMed = (index: number) => {
    setDischargeMeds(prev => prev.filter((_, i) => i !== index));
  };

  const handleDischargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdm) return;

    const record = processDischarge({
      admissionId: selectedAdm.id,
      dischargeDate,
      dischargeTime,
      dischargeType,
      finalDiagnosis: [finalDiagnosis],
      clinicalSummary,
      hospitalCourse,
      treatmentGiven,
      conditionAtDischarge,
      dischargeMedications: dischargeMeds,
      followUpDate,
      followUpDoctor,
      followUpInstructions,
    });

    setCreatedSummary(record);
    setShowSummaryModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Discharge Management & Summaries</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Discharge clearance, automated bed sanitization transition (Cleaning), and summary generation
            </div>
          </div>
        </div>
      </div>

      {/* Main Discharge Form */}
      {activeAdmissions.length > 0 ? (
        <form onSubmit={handleDischargeSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Left Column: Discharge Clinical Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <User size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="card-title">1. Patient & Discharge Category</span>
                </div>
                <div className="card-body">
                  <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Select Inpatient to Discharge <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={selectedAdmissionId}
                        onChange={e => {
                          setSelectedAdmissionId(e.target.value);
                          const adm = admissions.find(a => a.id === e.target.value);
                          if (adm) setFinalDiagnosis(adm.diagnosis.join(', '));
                        }}
                      >
                        {activeAdmissions.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.patientName} ({a.patientId}) — Bed {a.bedNumber} ({a.ward})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Discharge Category <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={dischargeType}
                        onChange={e => setDischargeType(e.target.value as DischargeType)}
                      >
                        <option value="normal">Normal / Clinical Discharge</option>
                        <option value="ama">DAMA / AMA (Against Medical Advice)</option>
                        <option value="transfer">Referral / Transfer to Tertiary Centre</option>
                        <option value="death">Expired / Clinical Death</option>
                        <option value="absconded">Absconded</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Condition at Discharge <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={conditionAtDischarge}
                        onChange={e => setConditionAtDischarge(e.target.value as any)}
                      >
                        <option value="cured">Cured</option>
                        <option value="improved">Improved / Stable</option>
                        <option value="stable">Stable</option>
                        <option value="relieved">Symptomatically Relieved</option>
                        <option value="critical">Critical (AMA/Transfer)</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Discharge Date</label>
                      <input type="date" className="form-input" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Discharge Time</label>
                      <input type="time" className="form-input" value={dischargeTime} onChange={e => setDischargeTime(e.target.value)} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Course & Summary Card */}
              <div className="card">
                <div className="card-header">
                  <Stethoscope size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="card-title">2. Clinical Summary & Treatment Record</span>
                </div>
                <div className="card-body">
                  <div className="form-grid" style={{ gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Final Clinical Diagnosis (ICD-10) <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        value={finalDiagnosis}
                        onChange={e => setFinalDiagnosis(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Clinical Presentation & Summary</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={clinicalSummary}
                        onChange={e => setClinicalSummary(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Course in Hospital & Significant Findings</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={hospitalCourse}
                        onChange={e => setHospitalCourse(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Treatment Given During Stay</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={treatmentGiven}
                        onChange={e => setTreatmentGiven(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Discharge Medications & Follow-up */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Discharge Medications */}
              <div className="card">
                <div className="card-header">
                  <Pill size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="card-title">3. Discharge Medications ({dischargeMeds.length})</span>
                </div>
                <div className="card-body">
                  {/* Med List Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {dischargeMeds.map((m, i) => (
                      <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <div>
                          <strong>{m.medicineName}</strong> ({m.dosage}) · <span style={{ color: 'var(--color-primary)' }}>{m.frequency}</span> for {m.duration}
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.instructions}</div>
                        </div>
                        <button type="button" className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleRemoveMed(i)}>
                          <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Med Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 6, borderTop: '1px solid var(--border-muted)', paddingTop: 10 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Medicine name"
                      style={{ fontSize: 12 }}
                      value={newMedName}
                      onChange={e => setNewMedName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dosage & Freq"
                      style={{ fontSize: 12 }}
                      value={newMedFreq}
                      onChange={e => setNewMedFreq(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={handleAddMed}>
                    <Plus size={12} /> Add Medicine
                  </button>
                </div>
              </div>

              {/* Follow-up Advice Card */}
              <div className="card">
                <div className="card-header">
                  <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="card-title">4. Follow-Up Review Instructions</span>
                </div>
                <div className="card-body">
                  <div className="form-grid" style={{ gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Next Review Date</label>
                      <input type="date" className="form-input" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reviewing Consultant</label>
                      <select className="form-select" value={followUpDoctor} onChange={e => setFollowUpDoctor(e.target.value)}>
                        {doctors.map(d => (
                          <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Follow-up Instructions & Warning Signs</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={followUpInstructions}
                        onChange={e => setFollowUpInstructions(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                  ℹ️ Confirming discharge will automatically transition Bed <strong>{selectedAdm?.bedNumber}</strong> to <strong>CLEANING</strong> status.
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 14 }}
                >
                  <CheckCircle2 size={16} /> Finalize Discharge & Generate Summary
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="empty-state-icon"><CheckCircle2 size={32} /></div>
          <div className="empty-state-title">No Active Inpatients to Discharge</div>
          <div className="empty-state-desc">All current inpatients have been discharged or transferred.</div>
        </div>
      )}

      {/* Discharge Summary Print Modal */}
      {showSummaryModal && createdSummary && (
        <PrintDischargeSummaryModal
          record={createdSummary}
          patient={patient}
          admission={selectedAdm}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}
