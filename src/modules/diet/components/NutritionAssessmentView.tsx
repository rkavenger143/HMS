import React, { useState } from 'react';
import { Scale, Plus, Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import NutritionAssessmentModal from './modals/NutritionAssessmentModal';

export default function NutritionAssessmentView() {
  const { assessments, setSelectedAdmissionId, setActiveTab } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredAssessments = assessments.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.bedNumber.toLowerCase().includes(q) ||
      a.dietitianName.toLowerCase().includes(q);

    const matchesRisk = selectedRisk === 'ALL' || a.nutritionalRisk === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const handleOpenPatient = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Clinical Nutrition Assessments</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Nutritional risk stratification, BMI trends, dysphagia aspiration risk, and dietary history
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Record Nutrition Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Bed #, Dietitian..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)}>
            <option value="ALL">All Nutritional Risks ({assessments.length})</option>
            <option value="high">High Risk Only</option>
            <option value="moderate">Moderate Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Assessments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {filteredAssessments.map(a => {
          const isHigh = a.nutritionalRisk === 'high';
          const isMod = a.nutritionalRisk === 'moderate';

          return (
            <div
              key={a.id}
              className="card"
              style={{
                padding: 18,
                borderLeft: `4px solid ${isHigh ? 'var(--color-danger)' : isMod ? 'var(--color-warning)' : 'var(--color-success)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)', cursor: 'pointer' }}
                    onClick={() => handleOpenPatient(a.admissionId)}
                  >
                    {a.patientName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    UHID: {a.patientId} · Bed {a.bedNumber} · Date: {a.date}
                  </div>
                </div>

                <span className={`badge ${isHigh ? 'badge-danger' : isMod ? 'badge-warning' : 'badge-success'}`}>
                  {a.nutritionalRisk.toUpperCase()} RISK
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 10 }}>
                <div>Height: <strong>{a.heightCm}cm</strong></div>
                <div>Weight: <strong>{a.weightKg}kg</strong></div>
                <div>BMI: <strong style={{ color: 'var(--color-primary)' }}>{a.bmi}</strong></div>
                <div>Appetite: <strong>{a.appetite.toUpperCase()}</strong></div>
                <div>Feeding: <strong>{a.feedingAbility.toUpperCase()}</strong></div>
                <div>Dysphagia: <strong style={{ color: a.swallowingDifficulty ? 'var(--color-danger)' : 'var(--color-success)' }}>{a.swallowingDifficulty ? 'YES' : 'NO'}</strong></div>
              </div>

              {a.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  <strong>Notes:</strong> {a.notes}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Assessed by: <strong>{a.dietitianName}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && <NutritionAssessmentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
