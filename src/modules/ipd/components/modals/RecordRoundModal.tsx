import React, { useState } from 'react';
import {
  Stethoscope, X, CheckCircle2, HeartPulse, FileText,
  AlertTriangle, Plus
} from 'lucide-react';
import { useIPD } from '../../context/IPDContext';
import type { Admission } from '../../../../types';

interface RecordRoundModalProps {
  admission: Admission;
  onClose: () => void;
}

export default function RecordRoundModal({ admission, onClose }: RecordRoundModalProps) {
  const {
    doctors,
    recordDoctorRound,
  } = useIPD();

  const [selectedDoctorId, setSelectedDoctorId] = useState(admission.admittingDoctorId || doctors[0]?.id || 'doc-001');
  const [condition, setCondition] = useState<'stable' | 'improving' | 'critical' | 'deteriorating'>('stable');
  const [progressNotes, setProgressNotes] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [medicationChanges, setMedicationChanges] = useState('');
  const [investigationOrders, setInvestigationOrders] = useState('');
  const [procedureOrders, setProcedureOrders] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');

  // Vitals
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNotes) return;

    recordDoctorRound({
      admissionId: admission.id,
      doctorId: selectedDoctorId,
      progressNotes,
      clinicalFindings,
      treatmentPlan,
      medicationChanges,
      investigationOrders,
      procedureOrders,
      followUpInstructions,
      condition,
      vitals: {
        bloodPressure: `${systolic}/${diastolic}`,
        pulse: parseInt(pulse, 10) || 76,
        temperature: parseFloat(temperature) || 98.6,
        spo2: parseInt(spo2, 10) || 98,
        respiratoryRate: 18,
      },
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Inpatient Doctor Round</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {admission.patientName} ({admission.patientId}) · {admission.ward} — Bed {admission.bedNumber}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              {/* Doctor & Condition */}
              <div className="form-group">
                <label className="form-label">Rounding Doctor <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Clinical Condition <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={condition}
                  onChange={e => setCondition(e.target.value as any)}
                  required
                >
                  <option value="stable">Stable / Satisfactory</option>
                  <option value="improving">Improving / Responding to Therapy</option>
                  <option value="critical">Critical / Intensive Monitoring</option>
                  <option value="deteriorating">Deteriorating / Urgent Attention</option>
                </select>
              </div>

              {/* Vitals Bar during round */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Round Vitals (BP, Pulse, Temp, SpO2)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="BP (120/80)"
                    value={`${systolic}/${diastolic}`}
                    onChange={e => {
                      const [s, d] = e.target.value.split('/');
                      if (s) setSystolic(s);
                      if (d) setDiastolic(d);
                    }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Pulse (bpm)"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Temp (°F)"
                    value={temperature}
                    onChange={e => setTemperature(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="SpO2 (%)"
                    value={spo2}
                    onChange={e => setSpo2(e.target.value)}
                  />
                </div>
              </div>

              {/* Progress Notes */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Clinical Progress Notes (Subjective & Objective) <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Patient reports improvement in symptoms, chest clear, bowel sounds present..."
                  value={progressNotes}
                  onChange={e => setProgressNotes(e.target.value)}
                  required
                />
              </div>

              {/* Clinical Examination Findings */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Physical Examination Findings</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="CVS: S1 S2 heard | RS: Bilateral clear | P/A: Soft, non-tender | CNS: Conscious, oriented"
                  value={clinicalFindings}
                  onChange={e => setClinicalFindings(e.target.value)}
                />
              </div>

              {/* Treatment Plan */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Treatment Plan & Doctor's Orders</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Continue IV antibiotics for 48 hrs. Maintain strict fluid balance. Step-down planning..."
                  value={treatmentPlan}
                  onChange={e => setTreatmentPlan(e.target.value)}
                />
              </div>

              {/* Medication & Investigation Orders */}
              <div className="form-group">
                <label className="form-label">Medication Dose Adjustments</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stop Inj. Tramadol, switch to Oral PCM"
                  value={medicationChanges}
                  onChange={e => setMedicationChanges(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Investigation & Lab Orders</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Repeat CBC & KFT tomorrow morning"
                  value={investigationOrders}
                  onChange={e => setInvestigationOrders(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Doctor Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
