import React, { useState } from 'react';
import { HeartPulse, CheckCircle2, X, BedDouble } from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';
import type { Doctor } from '../../../../types';

interface RecordRoundModalProps {
  admission: any;
  doctor: Doctor;
  onClose: () => void;
}

export default function RecordRoundModal({ admission, doctor, onClose }: RecordRoundModalProps) {
  const { addDoctorRoundNote } = useDoctor();

  const [clinicalStatus, setClinicalStatus] = useState<'improving' | 'stable' | 'critical' | 'deteriorating' | 'ready_for_discharge'>('improving');
  const [vitalsSummary, setVitalsSummary] = useState('BP: 126/82 mmHg · Pulse: 76 bpm · SpO2: 99% · Temp: 98.4°F');
  const [examinationNotes, setExaminationNotes] = useState('Patient comfortable at rest. Chest clear. Abdomen soft, non-tender. Surgical site clean with minimal serosanguinous discharge.');
  const [assessmentAndPlan, setAssessmentAndPlan] = useState('Continue current antibiotic course for 48h. Step down IV analgesics to oral.');
  const [nursingInstructions, setNursingInstructions] = useState('Monitor vitals 4-hourly. Strict intake/output monitoring. Mobilize patient in chair.');
  const [dietInstructions, setDietInstructions] = useState('Normal soft diabetic diet with low sodium.');
  const [isDischargePlanned, setIsDischargePlanned] = useState(false);
  const [plannedDischargeDate, setPlannedDischargeDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addDoctorRoundNote({
      admissionId: admission.id,
      patientId: admission.patientId,
      patientName: admission.patientName,
      bedNumber: admission.bedNumber,
      ward: admission.ward,
      doctorId: doctor.id,
      doctorName: doctor.name,
      roundDate: new Date().toISOString().slice(0, 10),
      roundTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clinicalStatus,
      vitalsSummary,
      examinationNotes,
      assessmentAndPlan,
      nursingInstructions,
      dietInstructions,
      isDischargePlanned,
      plannedDischargeDate: isDischargePlanned ? plannedDischargeDate : undefined,
    });

    alert(`Daily Doctor Round Note recorded for ${admission.patientName} (${admission.bedNumber}).`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <HeartPulse size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Daily Doctor Round Progress Note</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Patient: {admission.patientName} ({admission.bedNumber} · {admission.ward}) · Attending: {doctor.name}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Clinical Status Assessment <span className="required">*</span></label>
                <select className="form-select" value={clinicalStatus} onChange={e => setClinicalStatus(e.target.value as any)}>
                  <option value="improving">Improving / Positive Trajectory</option>
                  <option value="stable">Stable Condition</option>
                  <option value="critical">Critical / Intensive Monitoring</option>
                  <option value="deteriorating">Deteriorating / Urgent Attention</option>
                  <option value="ready_for_discharge">Ready for Discharge</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Bedside Vitals Summary</label>
                <input
                  type="text"
                  className="form-input"
                  value={vitalsSummary}
                  onChange={e => setVitalsSummary(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Examination & Bedside Findings <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={2}
                value={examinationNotes}
                onChange={e => setExaminationNotes(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Assessment & Action Plan <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={2}
                value={assessmentAndPlan}
                onChange={e => setAssessmentAndPlan(e.target.value)}
                required
              />
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Nursing Care Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  value={nursingInstructions}
                  onChange={e => setNursingInstructions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diet & Nutrition Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  value={dietInstructions}
                  onChange={e => setDietInstructions(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDischargePlanned}
                  onChange={e => setIsDischargePlanned(e.target.checked)}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Plan Patient for Discharge
                </span>
              </label>

              {isDischargePlanned && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Target Discharge Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ width: 180, height: 32 }}
                    value={plannedDischargeDate}
                    onChange={e => setPlannedDischargeDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> Save Round Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
