import React, { useState } from 'react';
import { Activity, X, CheckCircle2, HeartPulse, Scale, Thermometer } from 'lucide-react';
import type { Vitals, OPDVisit } from '../../../../types';

interface VitalEntryModalProps {
  visit: OPDVisit;
  onSave: (vitals: Vitals) => void;
  onClose: () => void;
}

export default function VitalEntryModal({ visit, onSave, onClose }: VitalEntryModalProps) {
  const [systolic, setSystolic] = useState(visit.vitals?.bloodPressure ? visit.vitals.bloodPressure.split('/')[0] : '120');
  const [diastolic, setDiastolic] = useState(visit.vitals?.bloodPressure ? visit.vitals.bloodPressure.split('/')[1] : '80');
  const [pulse, setPulse] = useState(visit.vitals?.pulse?.toString() || '76');
  const [temperature, setTemperature] = useState(visit.vitals?.temperature?.toString() || '98.6');
  const [spo2, setSpo2] = useState(visit.vitals?.spo2?.toString() || '98');
  const [respiratoryRate, setRespiratoryRate] = useState(visit.vitals?.respiratoryRate?.toString() || '18');
  const [height, setHeight] = useState(visit.vitals?.height?.toString() || '170');
  const [weight, setWeight] = useState(visit.vitals?.weight?.toString() || '70');

  // BMI Calculation
  const hM = parseFloat(height) / 100;
  const wKg = parseFloat(weight);
  const bmi = hM > 0 && wKg > 0 ? parseFloat((wKg / (hM * hM)).toFixed(1)) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vitalsData: Vitals = {
      bloodPressure: `${systolic}/${diastolic}`,
      pulse: parseInt(pulse, 10) || undefined,
      temperature: parseFloat(temperature) || undefined,
      spo2: parseInt(spo2, 10) || undefined,
      respiratoryRate: parseInt(respiratoryRate, 10) || undefined,
      height: parseFloat(height) || undefined,
      weight: parseFloat(weight) || undefined,
      bmi,
    };
    onSave(vitalsData);
    onClose();
  };

  const getBMICategory = (val?: number) => {
    if (!val) return null;
    if (val < 18.5) return { label: 'Underweight', color: 'var(--color-warning)' };
    if (val < 25) return { label: 'Normal', color: 'var(--color-success)' };
    if (val < 30) return { label: 'Overweight', color: 'var(--color-warning)' };
    return { label: 'Obese', color: 'var(--color-danger)' };
  };

  const bmiCat = getBMICategory(bmi);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <Activity size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Patient Vitals</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {visit.patientName} ({visit.patientId}) · Token #{visit.tokenNumber}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Warning if BP is High */}
            {(parseInt(systolic, 10) >= 140 || parseInt(diastolic, 10) >= 90) && (
              <div style={{ padding: '8px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠ Stage 1/2 Hypertension BP Range detected. Please verify cuff placement.
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
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>mmHg</span>
                </div>
              </div>

              {/* Pulse */}
              <div className="form-group">
                <label className="form-label">Pulse Rate (bpm) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="76"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  required
                />
              </div>

              {/* Temperature */}
              <div className="form-group">
                <label className="form-label">Temperature (°F) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="98.6"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  required
                />
              </div>

              {/* SpO2 */}
              <div className="form-group">
                <label className="form-label">SpO2 Oxygen Saturation (%) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="98"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  required
                />
              </div>

              {/* Respiratory Rate */}
              <div className="form-group">
                <label className="form-label">Respiratory Rate (/min)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="18"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(e.target.value)}
                />
              </div>

              {/* Height & Weight */}
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="170"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="70"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>

              {/* BMI Card */}
              {bmi && (
                <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Body Mass Index (BMI):</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{bmi} kg/m²</div>
                  </div>
                  {bmiCat && (
                    <span className="badge" style={{ background: `${bmiCat.color}20`, color: bmiCat.color, border: `1px solid ${bmiCat.color}40`, fontSize: 12 }}>
                      {bmiCat.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Vitals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
