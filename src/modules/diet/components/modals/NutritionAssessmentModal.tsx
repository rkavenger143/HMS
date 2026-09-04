import React, { useState } from 'react';
import { Scale, CheckCircle2, Activity } from 'lucide-react';
import { useDiet } from '../../context/DietContext';

interface NutritionAssessmentModalProps {
  onClose: () => void;
  initialAdmissionId?: string;
}

export default function NutritionAssessmentModal({ onClose, initialAdmissionId }: NutritionAssessmentModalProps) {
  const { admissions, recordNutritionAssessment } = useDiet();

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(initialAdmissionId || activeAdmissions[0]?.id || '');

  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(65);
  const [recentWeightChange, setRecentWeightChange] = useState('Stable past 3 months');
  const [appetite, setAppetite] = useState<'good' | 'fair' | 'poor' | 'anorexic'>('good');
  const [feedingAbility, setFeedingAbility] = useState<'independent' | 'assisted' | 'tube_fed' | 'npo'>('independent');
  const [swallowingDifficulty, setSwallowingDifficulty] = useState(false);
  const [dietaryHistory, setDietaryHistory] = useState('Balanced home cooked diet');
  const [notes, setNotes] = useState('Patient alert, good oral intake.');

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let nutritionalRisk: 'Low Risk' | 'Moderate Risk' | 'High Risk' = 'Low Risk';
  if (bmi < 18.5 || appetite === 'anorexic' || swallowingDifficulty) {
    nutritionalRisk = 'High Risk';
  } else if (bmi < 20 || bmi > 30 || appetite === 'poor') {
    nutritionalRisk = 'Moderate Risk';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = activeAdmissions.find(a => a.id === admissionId) || activeAdmissions[0];
    if (!adm) return;

    recordNutritionAssessment({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      date: new Date().toISOString().slice(0, 10),
      dietitianName: 'Dietitian Shalini Gupta, RD',
      heightCm: Number(heightCm) || 160,
      weightKg: Number(weightKg) || 60,
      recentWeightChange,
      appetite,
      feedingAbility,
      swallowingDifficulty,
      dietaryHistory,
      notes,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <Scale size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Record Clinical Nutrition Assessment</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Select Inpatient <span className="required">*</span></label>
                <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" className="form-input" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-input" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))} />
              </div>

              {/* Live BMI & Risk Pill */}
              <div style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Calculated BMI: </span>
                  <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>{bmi} kg/m²</strong>
                </div>
                <span className={`badge ${nutritionalRisk === 'High Risk' ? 'badge-danger' : nutritionalRisk === 'Moderate Risk' ? 'badge-warning' : 'badge-success'}`}>
                  {nutritionalRisk.toUpperCase()}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Appetite</label>
                <select className="form-select" value={appetite} onChange={e => setAppetite(e.target.value as any)}>
                  <option value="good">Good / Normal</option>
                  <option value="fair">Fair (50-75% intake)</option>
                  <option value="poor">{'Poor (<50% intake)'}</option>
                  <option value="anorexic">Anorexic / Nil oral</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Feeding Ability</label>
                <select className="form-select" value={feedingAbility} onChange={e => setFeedingAbility(e.target.value as any)}>
                  <option value="independent">Independent</option>
                  <option value="assisted">Assisted Feeding</option>
                  <option value="tube_fed">Enteral Tube Fed</option>
                  <option value="npo">NPO</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={swallowingDifficulty} onChange={e => setSwallowingDifficulty(e.target.checked)} />
                  <span style={{ fontWeight: 600, color: swallowingDifficulty ? 'var(--color-danger)' : undefined }}>
                    Patient exhibits Swallowing Difficulty / Dysphagia (Aspiration Risk)
                  </span>
                </label>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Recent Weight & Dietary Changes</label>
                <input type="text" className="form-input" value={recentWeightChange} onChange={e => setRecentWeightChange(e.target.value)} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Dietitian Notes & Action Plan</label>
                <textarea className="form-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
