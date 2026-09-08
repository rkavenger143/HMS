import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Printer,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Edit,
  FileText,
  Apple,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import PrintBedsideDietCardModal from './modals/PrintBedsideDietCardModal';
import CreateDietChartModal from './modals/CreateDietChartModal';
import type { ComprehensiveDietChart, MealType } from '../../../types';

const MEAL_SLOT_CONFIG: { type: MealType; label: string; icon: string; defaultTime: string }[] = [
  { type: 'early_morning', label: '1. Early Morning', icon: '🌅', defaultTime: '06:30' },
  { type: 'breakfast', label: '2. Breakfast', icon: '🍳', defaultTime: '08:30' },
  { type: 'mid_morning', label: '3. Mid-Morning', icon: '🍎', defaultTime: '11:00' },
  { type: 'lunch', label: '4. Lunch', icon: '🍲', defaultTime: '13:00' },
  { type: 'evening_snack', label: '5. Evening Snack', icon: '🍵', defaultTime: '16:30' },
  { type: 'dinner', label: '6. Dinner', icon: '🥗', defaultTime: '19:30' },
  { type: 'bedtime', label: '7. Bedtime', icon: '🥛', defaultTime: '21:30' },
];

export default function DailyDietChartView() {
  const {
    admissions,
    dietCharts,
    selectedAdmissionId,
    setSelectedAdmissionId,
    setActiveTab,
  } = useDiet();

  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdmission =
    admissions.find(a => a.id === selectedAdmissionId) || activeAdmissions[0];

  const currentChart = dietCharts.find(
    c => c.admissionId === selectedAdmission?.id && c.status === 'active'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Patient Selector Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT INPATIENT:</div>
          <select
            className="form-select"
            style={{ minWidth: 280, height: 34, fontSize: 13 }}
            value={selectedAdmission?.id}
            onChange={e => setSelectedAdmissionId(e.target.value)}
          >
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>
                {a.patientName} — Bed {a.bedNumber} ({a.ward})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {currentChart && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setPrintBedsideCard(currentChart)}>
                <UtensilsCrossed size={13} /> Bedside Tray Card
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPrintChart(currentChart)}>
                <Printer size={13} /> Print Official Chart
              </button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Edit size={13} /> {currentChart ? 'Modify Daily Diet' : 'Create Diet Chart'}
          </button>
        </div>
      </div>

      {selectedAdmission && (
        <>
          {/* Patient Overview Header */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              borderLeft: '5px solid var(--color-primary)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{selectedAdmission.patientName}</span>
                  <span className="badge badge-primary">{selectedAdmission.bedNumber} ({selectedAdmission.ward})</span>
                  {currentChart && (
                    <span className="badge badge-success">
                      {currentChart.dietType.toUpperCase().replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>UHID: <strong>{selectedAdmission.patientId}</strong></span>
                  <span>Attending: <strong>{selectedAdmission.admittingDoctorName}</strong></span>
                  <span>Dietitian: <strong>{currentChart?.dietitianName || 'Unassigned'}</strong></span>
                  <span>Feeding Route: <strong>{currentChart?.feedingMethod?.toUpperCase() || 'ORAL'}</strong></span>
                </div>
              </div>

              {/* Allergies Callout */}
              {currentChart?.allergies && currentChart.allergies.length > 0 && (
                <div className="badge badge-danger" style={{ padding: '6px 12px', fontSize: 11 }}>
                  ⚠️ ALLERGIC TO: {currentChart.allergies.join(', ')}
                </div>
              )}
            </div>
          </div>

          {currentChart ? (
            <>
              {/* Nutritional Breakdown Ribbon */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 12,
                }}
              >
                <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>
                    {currentChart.estimatedCalories}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Calories (kcal)</div>
                </div>

                <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>
                    {currentChart.proteinGrams}g
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Protein</div>
                </div>

                <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-warning)' }}>
                    {currentChart.carbsGrams}g
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Carbohydrates</div>
                </div>

                <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-danger)' }}>
                    {currentChart.fatGrams}g
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Fats</div>
                </div>

                <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0891b2' }}>
                    {currentChart.fluidRequirementMl || 2000} ml
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Fluid / 24h</div>
                </div>
              </div>

              {/* 7-Meal Daily Schedule Timetable */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UtensilsCrossed size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="card-title">Daily Meal Schedule (7 Hospital Slots)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Consistency: <strong>{currentChart.dietConsistency.toUpperCase()}</strong>
                  </span>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MEAL_SLOT_CONFIG.map(slotCfg => {
                    const scheduledSlot = currentChart.mealSchedules.find(
                      s => s.mealType === slotCfg.type
                    );

                    const hasItems = scheduledSlot && scheduledSlot.foodItems.length > 0;
                    const scheduledTime = scheduledSlot?.scheduledTime || slotCfg.defaultTime;

                    return (
                      <div
                        key={slotCfg.type}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 16px',
                          display: 'grid',
                          gridTemplateColumns: '180px 1fr 220px',
                          gap: 14,
                          alignItems: 'center',
                        }}
                      >
                        {/* Slot Name & Time */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>
                            <span>{slotCfg.icon}</span>
                            <span>{slotCfg.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> Scheduled: <strong>{scheduledTime}</strong>
                          </div>
                        </div>

                        {/* Food Items & Portions */}
                        <div>
                          {hasItems ? (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {scheduledSlot.foodItems.map((fi, idx) => (
                                <span
                                  key={idx}
                                  className="badge badge-primary"
                                  style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600 }}
                                >
                                  {fi.foodName} ({fi.portion})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                              Standard fluid/light accompaniment
                            </span>
                          )}
                        </div>

                        {/* Instructions & Calorie Sum */}
                        <div style={{ textAlign: 'right', fontSize: 12 }}>
                          {scheduledSlot?.specialInstructions && (
                            <div style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                              {scheduledSlot.specialInstructions}
                            </div>
                          )}
                          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>
                            Total Slot: <strong>{scheduledSlot?.foodItems.reduce((acc, f) => acc + (f.calories || 0), 0) || 0} kcal</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Instructions Footer */}
              {currentChart.specialInstructions && (
                <div
                  className="card"
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(10, 132, 255, 0.05)',
                    border: '1px solid rgba(10, 132, 255, 0.2)',
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    <strong>Kitchen & Nursing Special Instructions: </strong>
                    {currentChart.specialInstructions}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <UtensilsCrossed size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>No Active Daily Diet Chart Prescribed</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                This patient currently has no active diet chart. Prescribe one to generate their daily meal timetable.
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 14 }}
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={13} /> Prescribe Diet Chart
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {printChart && <PrintDietChartModal chart={printChart} onClose={() => setPrintChart(null)} />}
      {printBedsideCard && <PrintBedsideDietCardModal chart={printBedsideCard} onClose={() => setPrintBedsideCard(null)} />}
      {showCreateModal && (
        <CreateDietChartModal
          initialAdmissionId={selectedAdmission?.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
