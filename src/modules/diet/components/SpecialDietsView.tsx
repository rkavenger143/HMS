import React, { useState } from 'react';
import {
  FileText,
  Users,
  Plus,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import CreateDietChartModal from './modals/CreateDietChartModal';
import type { DietType } from '../../../types';

interface SpecialDietCategory {
  id: DietType;
  name: string;
  badgeColor: string;
  description: string;
  caloriesTarget: string;
  macros: string;
  guidelines: string;
}

const SPECIAL_DIET_CATEGORIES: SpecialDietCategory[] = [
  {
    id: 'regular',
    name: 'Regular / Normal Diet',
    badgeColor: 'var(--color-primary)',
    description: 'Balanced general hospital diet meeting standard RDAs for age and gender.',
    caloriesTarget: '1800 - 2200 kcal',
    macros: 'P: 65-75g · C: 220-260g · F: 45-55g',
    guidelines: 'Nutritionally adequate for patients with no specific metabolic or digestive limitations.',
  },
  {
    id: 'soft',
    name: 'Soft / Easily Digestible Diet',
    badgeColor: '#0891b2',
    description: 'Tender, easy-to-chew and easily digestible food items with mild seasoning.',
    caloriesTarget: '1600 - 1800 kcal',
    macros: 'P: 60-70g · C: 200-240g · F: 35-45g',
    guidelines: 'Indicated for elderly, post-dental, mild GI irritation, or recovery transition.',
  },
  {
    id: 'liquid',
    name: 'Liquid / Fluid Diet',
    badgeColor: '#0284c7',
    description: 'Clear broths, coconut water, strained juices, and oral rehydration solutions.',
    caloriesTarget: '600 - 1200 kcal',
    macros: 'P: 10-30g · C: 120-180g · F: 5-15g',
    guidelines: 'Pre/post-op bowel prep, acute GI recovery, or initial oral transition.',
  },
  {
    id: 'diabetic',
    name: 'Diabetic Diet (Low GI / ADA)',
    badgeColor: '#2563eb',
    description: 'Complex carbohydrates, high soluble fiber, and strictly zero refined sugars.',
    caloriesTarget: '1500 - 1800 kcal',
    macros: 'P: 65-80g · C: 160-200g · F: 35-45g',
    guidelines: '6-7 fractionated small meals to maintain euglycemia and prevent glycemic spikes.',
  },
  {
    id: 'low_salt',
    name: 'Low Salt / Sodium Restricted Diet',
    badgeColor: '#7c3aed',
    description: 'Sodium intake strictly capped at <2000mg/day with no added table salt.',
    caloriesTarget: '1600 - 2000 kcal',
    macros: 'P: 60-70g · C: 200-240g · F: 35-45g',
    guidelines: 'Indicated for hypertension, mild congestive heart failure, and peripheral edema.',
  },
  {
    id: 'cardiac',
    name: 'Cardiac Diet (Low Sodium & Saturated Fat)',
    badgeColor: '#dc2626',
    description: 'Heart-healthy meals low in saturated fat, cholesterol (<200mg), and sodium.',
    caloriesTarget: '1400 - 1700 kcal',
    macros: 'P: 60-75g · C: 180-220g · F: 25-35g',
    guidelines: 'Indicated for CAD, post-PCI / CABG, cardiomyopathy, and severe hypertension.',
  },
  {
    id: 'renal',
    name: 'Renal Diet (Protein/K/Phos Controlled)',
    badgeColor: '#b45309',
    description: 'Carefully measured biological protein, low potassium, and low phosphorus.',
    caloriesTarget: '1500 - 1900 kcal',
    macros: 'P: 40-55g (Pre-dialysis) / 75-90g (Hemodialysis)',
    guidelines: 'Strict fluid balancing with daily electrolyte monitoring (K+ and PO43-).',
  },
  {
    id: 'high_protein',
    name: 'High Protein Healing Diet',
    badgeColor: 'var(--color-success)',
    description: 'High biological value protein (1.5 - 2.0 g/kg) for tissue repair.',
    caloriesTarget: '2200 - 2600 kcal',
    macros: 'P: 90-120g · C: 260-320g · F: 50-65g',
    guidelines: 'Indicated for post-op orthopedic healing, major wounds, pressure ulcers, burns.',
  },
  {
    id: 'low_fat',
    name: 'Low Fat / Hepatic Diet',
    badgeColor: '#059669',
    description: 'Minimal dietary lipids (<30g/day) with easily digestible carbohydrates.',
    caloriesTarget: '1500 - 1800 kcal',
    macros: 'P: 60-70g · C: 220-260g · F: 20-30g',
    guidelines: 'Indicated for acute pancreatitis, gallbladder disease, cholecystectomy, hepatitis.',
  },
  {
    id: 'post_op',
    name: 'Post-Surgery Step-Up Diet',
    badgeColor: '#d97706',
    description: 'Gradual escalation: Clear liquid → Full liquid → Soft non-irritating diet.',
    caloriesTarget: '1200 - 1600 kcal',
    macros: 'P: 40-60g · C: 160-200g · F: 20-35g',
    guidelines: 'Assess bowel sounds and flatus prior to advancing oral feeding stages.',
  },
  {
    id: 'other',
    name: 'Custom / Formulated Diet',
    badgeColor: '#6b7280',
    description: 'Individualized formulated nutrition customized by Clinical Dietitian.',
    caloriesTarget: 'As clinically prescribed',
    macros: 'Customized macro distribution',
    guidelines: 'Tailored for specific metabolic inborn errors, severe allergies, or TPN/Enteral.',
  },
];

export default function SpecialDietsView() {
  const { admissions, dietCharts, setSelectedAdmissionId, setActiveTab } = useDiet();

  const [selectedDietId, setSelectedDietId] = useState<DietType>('diabetic');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentCategory =
    SPECIAL_DIET_CATEGORIES.find(c => c.id === selectedDietId) || SPECIAL_DIET_CATEGORIES[0];

  // Patients under this diet category
  const patientsOnThisDiet = activeAdmissions.filter(adm => {
    const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
    return chart && chart.dietType === selectedDietId;
  });

  const handleOpenPatient = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('daily_diet_chart');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Special & Therapeutic Diets</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Clinical protocols, target macronutrients, and active inpatient rosters for 11 hospital diet categories
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Prescribe Special Diet
        </button>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Left: 11 Standard Diet Categories List */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            HOSPITAL DIET CATEGORIES (11)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SPECIAL_DIET_CATEGORIES.map(cat => {
              const count = activeAdmissions.filter(adm => {
                const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
                return chart && chart.dietType === cat.id;
              }).length;

              const isSelected = selectedDietId === cat.id;

              return (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    height: 'auto',
                    textAlign: 'left',
                  }}
                  onClick={() => setSelectedDietId(cat.id)}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{cat.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{cat.caloriesTarget}</div>
                  </div>
                  {count > 0 && (
                    <span
                      style={{
                        background: isSelected ? 'white' : 'var(--color-primary)',
                        color: isSelected ? 'var(--color-primary)' : 'white',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Category Details & Patient Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Diet Guideline Card */}
          <div
            className="card"
            style={{
              padding: '18px 22px',
              borderLeft: `5px solid ${currentCategory.badgeColor}`,
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{currentCategory.name}</div>
              <span className="badge badge-primary">{patientsOnThisDiet.length} Active Inpatients</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
              {currentCategory.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12, background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Target Energy: </span>
                <strong>{currentCategory.caloriesTarget}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Macronutrients: </span>
                <strong>{currentCategory.macros}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Clinical Guidelines: </span>
                <span>{currentCategory.guidelines}</span>
              </div>
            </div>
          </div>

          {/* Patient Roster under this Diet */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Inpatients Prescribed: {currentCategory.name}</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name & UHID</th>
                      <th>Location (Ward & Bed)</th>
                      <th>Attending Doctor</th>
                      <th>Calories & Macros</th>
                      <th>Allergies</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsOnThisDiet.length > 0 ? (
                      patientsOnThisDiet.map(adm => {
                        const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');

                        return (
                          <tr key={adm.id}>
                            <td>
                              <div
                                style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }}
                                onClick={() => handleOpenPatient(adm.id)}
                              >
                                {adm.patientName}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adm.patientId}</div>
                            </td>

                            <td>
                              <span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}
                            </td>

                            <td>{adm.admittingDoctorName}</td>

                            <td>
                              <strong>{chart?.estimatedCalories} kcal</strong>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                P: {chart?.proteinGrams}g · C: {chart?.carbsGrams}g · F: {chart?.fatGrams}g
                              </div>
                            </td>

                            <td>
                              {chart?.allergies && chart.allergies.length > 0 ? (
                                <span className="badge badge-danger" style={{ fontSize: 10 }}>
                                  ⚠️ {chart.allergies.join(', ')}
                                </span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>None</span>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: 11 }}
                                onClick={() => handleOpenPatient(adm.id)}
                              >
                                View Daily Chart
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}>
                          No active inpatients currently assigned to {currentCategory.name}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateDietChartModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
