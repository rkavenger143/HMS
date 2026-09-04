import React, { useState } from 'react';
import {
  Activity, X, CheckCircle2, HeartPulse, Scale, Thermometer,
  AlertCircle
} from 'lucide-react';
import { useIPD } from '../../context/IPDContext';
import type { Admission } from '../../../../types';

interface RecordNursingVitalsModalProps {
  admission: Admission;
  onClose: () => void;
}

export default function RecordNursingVitalsModal({ admission, onClose }: RecordNursingVitalsModalProps) {
  const { recordNursingVitals } = useIPD();

  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [bloodSugar, setBloodSugar] = useState('110');
  const [painScore, setPainScore] = useState(1);
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [notes, setNotes] = useState('Patient comfortable, vitals stable.');

  const hM = parseFloat(height) / 100;
  const wKg = parseFloat(weight);
  const bmi = hM > 0 && wKg > 0 ? parseFloat((wKg / (hM * hM)).toFixed(1)) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordNursingVitals(admission.id, {
      bloodPressure: `${systolic}/${diastolic}`,
      pulse: parseInt(pulse, 10) || 76,
      temperature: parseFloat(temperature) || 98.6,
      spo2: parseInt(spo2, 10) || 98,
      respiratoryRate: parseInt(respiratoryRate, 10) || 18,
      bloodSugar: parseInt(bloodSugar, 10) || undefined,
      painScore: parseInt(painScore.toString(), 10) || 0,
      weight: parseFloat(weight) || undefined,
      height: parseFloat(height) || undefined,
      notes,
    });

    onClose();
  };

  const getPainDescriptor = (val: number) => {
    if (val === 0) return { label: 'No Pain (0)', color: 'var(--color-success)' };
    if (val <= 3) return { label: 'Mild Pain (1-3)', color: 'var(--color-info)' };
    if (val <= 6) return { label: 'Moderate Pain (4-6)', color: 'var(--color-warning)' };
    return { label: 'Severe Pain (7-10)', color: 'var(--color-danger)' };
  };

  const painDesc = getPainDescriptor(painScore);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <Activity size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Bedside Inpatient Vitals</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {admission.patientName} ({admission.patientId}) · Bed {admission.bedNumber} ({admission.ward})
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Warning if SpO2 < 95% */}
            {parseInt(spo2, 10) < 95 && (
              <div style={{ padding: '8px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: 12, marginBottom: 14 }}>
                ⚠️ Low SpO2 detected ({spo2}%). Ensure oxygen cannula is properly connected.
              </div>
            )}

            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              {/* Blood Pressure */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Blood Pressure (Systolic / Diastolic mmHg) <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="120"
                    value={systolic}
                    onChange={e => setSystolic(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>/</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="80"
                    value={diastolic}
                    onChange={e => setDiastolic(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>mmHg</span>
                </div>
              </div>

              {/* Pulse */}
              <div className="form-group">
                <label className="form-label">Pulse (bpm) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  required
                />
              </div>

              {/* Temp */}
              <div className="form-group">
                <label className="form-label">Temperature (°F) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  required
                />
              </div>

              {/* SpO2 */}
              <div className="form-group">
                <label className="form-label">SpO2 Oxygen (%) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  required
                />
              </div>

              {/* Respiratory Rate */}
              <div className="form-group">
                <label className="form-label">Resp Rate (/min)</label>
                <input
                  type="number"
                  className="form-input"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(e.target.value)}
                />
              </div>

              {/* Blood Sugar */}
              <div className="form-group">
                <label className="form-label">RBS Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 110"
                  value={bloodSugar}
                  onChange={e => setBloodSugar(e.target.value)}
                />
              </div>

              {/* Pain Score */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Pain Score (0-10)</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: painDesc.color }}>{painDesc.label}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  className="form-input"
                  style={{ padding: 0 }}
                  value={painScore}
                  onChange={e => setPainScore(parseInt(e.target.value, 10))}
                />
              </div>

              {/* Height & Weight */}
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nurse Observation Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Afebrile, breathing comfortably on room air"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Vitals Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
