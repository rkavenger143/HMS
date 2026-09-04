import React, { useState } from 'react';
import { Activity, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNursing } from '../../context/NursingContext';
import type { Admission } from '../../../../types';

interface RecordVitalsModalProps {
  admission: Admission;
  onClose: () => void;
}

export default function RecordVitalsModal({ admission, onClose }: RecordVitalsModalProps) {
  const { recordVitals } = useNursing();

  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [bloodSugar, setBloodSugar] = useState('110');
  const [painScore, setPainScore] = useState(0);
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [consciousness, setConsciousness] = useState<'alert' | 'voice' | 'pain' | 'unresponsive'>('alert');
  const [remarks, setRemarks] = useState('Patient alert and resting comfortably.');

  // Live abnormal value detection
  const isHighBP = parseInt(systolic, 10) > 140 || parseInt(diastolic, 10) > 90;
  const isLowSpO2 = parseInt(spo2, 10) < 95;
  const isHighTemp = parseFloat(temperature) > 100.4;
  const isHighHR = parseInt(pulse, 10) > 100;
  const hasAbnormal = isHighBP || isLowSpO2 || isHighTemp || isHighHR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordVitals({
      admissionId: admission.id,
      systolic: parseInt(systolic, 10) || 120,
      diastolic: parseInt(diastolic, 10) || 80,
      pulse: parseInt(pulse, 10) || 76,
      temperature: parseFloat(temperature) || 98.6,
      spo2: parseInt(spo2, 10) || 98,
      respiratoryRate: parseInt(respiratoryRate, 10) || 18,
      bloodSugar: parseInt(bloodSugar, 10) || undefined,
      painScore: parseInt(painScore.toString(), 10) || 0,
      weight: parseFloat(weight) || undefined,
      height: parseFloat(height) || undefined,
      consciousness,
      remarks,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <Activity size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Bedside Vital Signs</div>
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
            {/* Live Warning Banner */}
            {hasAbnormal && (
              <div style={{ padding: '10px 14px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: 12, marginBottom: 14 }}>
                ⚠️ <strong>Abnormal Value Alert:</strong>{' '}
                {[
                  isHighBP ? 'High BP' : '',
                  isLowSpO2 ? 'Low SpO2 (<95%)' : '',
                  isHighTemp ? 'Fever (>100.4°F)' : '',
                  isHighHR ? 'Tachycardia (>100 bpm)' : '',
                ].filter(Boolean).join(', ')}. Automatic alert will trigger for duty nurse.
              </div>
            )}

            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              {/* BP */}
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

              {/* Pulse & Temp */}
              <div className="form-group">
                <label className="form-label">Pulse Rate (bpm) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  required
                />
              </div>

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

              {/* SpO2 & RR */}
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

              <div className="form-group">
                <label className="form-label">Respiratory Rate (/min)</label>
                <input
                  type="number"
                  className="form-input"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(e.target.value)}
                />
              </div>

              {/* Blood Sugar & Consciousness */}
              <div className="form-group">
                <label className="form-label">RBS Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="110"
                  value={bloodSugar}
                  onChange={e => setBloodSugar(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consciousness Level (AVPU)</label>
                <select
                  className="form-select"
                  value={consciousness}
                  onChange={e => setConsciousness(e.target.value as any)}
                >
                  <option value="alert">A — Alert & Oriented</option>
                  <option value="voice">V — Responds to Voice</option>
                  <option value="pain">P — Responds to Pain</option>
                  <option value="unresponsive">U — Unresponsive</option>
                </select>
              </div>

              {/* Pain Score */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Pain Score (0 - 10)</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: painScore > 6 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                    {painScore === 0 ? 'No Pain (0)' : painScore <= 3 ? `Mild (${painScore})` : painScore <= 6 ? `Moderate (${painScore})` : `Severe (${painScore})`}
                  </span>
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

              {/* Remarks */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nursing Observation Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Vital Signs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
