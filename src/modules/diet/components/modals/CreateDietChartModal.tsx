import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import type { DietType, DietStatus, MealType, MealScheduleItem } from '../../../../types';

interface CreateDietChartModalProps {
  onClose: () => void;
  initialAdmissionId?: string;
}

const DEFAULT_7_MEAL_SLOTS: MealScheduleItem[] = [
  {
    id: 'ms-1',
    mealType: 'early_morning',
    scheduledTime: '06:30',
    foodItems: [{ foodItemId: 'fi-012', foodName: 'Tender Coconut Water', portion: '1 Glass (200ml)', calories: 40 }],
    specialInstructions: 'Empty stomach',
  },
  {
    id: 'ms-2',
    mealType: 'breakfast',
    scheduledTime: '08:30',
    foodItems: [
      { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge', portion: '1 Bowl (200g)', calories: 150 },
      { foodItemId: 'fi-002', foodName: 'Boiled Egg Whites', portion: '2 pcs (60g)', calories: 34 },
    ],
    specialInstructions: 'Warm, low sugar',
  },
  {
    id: 'ms-3',
    mealType: 'mid_morning',
    scheduledTime: '11:00',
    foodItems: [{ foodItemId: 'fi-008', foodName: 'Papaya Cubes', portion: '1 Bowl (150g)', calories: 60 }],
    specialInstructions: '',
  },
  {
    id: 'ms-4',
    mealType: 'lunch',
    scheduledTime: '13:00',
    foodItems: [
      { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs (60g)', calories: 160 },
      { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
      { foodItemId: 'fi-005', foodName: 'Low-Fat Curd / Yogurt', portion: '1 Cup (150g)', calories: 95 },
    ],
    specialInstructions: '',
  },
  {
    id: 'ms-5',
    mealType: 'evening_snack',
    scheduledTime: '16:30',
    foodItems: [{ foodItemId: 'fi-007', foodName: 'Clear Vegetable Broth', portion: '1 Cup (200ml)', calories: 30 }],
    specialInstructions: 'Hot strained broth',
  },
  {
    id: 'ms-6',
    mealType: 'dinner',
    scheduledTime: '19:30',
    foodItems: [
      { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi', portion: '1 Bowl (250g)', calories: 220 },
      { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
    ],
    specialInstructions: 'Light dinner before 20:00',
  },
  {
    id: 'ms-7',
    mealType: 'bedtime',
    scheduledTime: '21:30',
    foodItems: [{ foodItemId: 'fi-013', foodName: 'Warm Turmeric Milk', portion: '1 Glass (180ml)', calories: 110 }],
    specialInstructions: '',
  },
];

export default function CreateDietChartModal({ onClose, initialAdmissionId }: CreateDietChartModalProps) {
  const { admissions, foodItems, createDietChart, checkAllergyConflicts } = useDiet();

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(initialAdmissionId || activeAdmissions[0]?.id || '');

  const selectedAdm = activeAdmissions.find(a => a.id === admissionId) || activeAdmissions[0];

  // Form State
  const [dietType, setDietType] = useState<DietType>('regular');
  const [dietConsistency, setDietConsistency] = useState<'regular' | 'soft' | 'pureed' | 'liquid' | 'npo'>('regular');
  const [feedingMethod, setFeedingMethod] = useState<'oral' | 'enteral_tube' | 'parenteral_tpn' | 'assisted' | 'npo'>('oral');
  const [status, setStatus] = useState<DietStatus>('active');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [reviewDate, setReviewDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [estimatedCalories, setEstimatedCalories] = useState(1800);
  const [proteinGrams, setProteinGrams] = useState(70);
  const [carbsGrams, setCarbsGrams] = useState(220);
  const [fatGrams, setFatGrams] = useState(45);
  const [fluidRequirementMl, setFluidRequirementMl] = useState(2000);
  const [restrictions, setRestrictions] = useState('Low Sodium, No Refined Sugar');
  const [specialInstructions, setSpecialInstructions] = useState('Serve warm. Avoid spicy seasonings.');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiAppliedBadge, setAiAppliedBadge] = useState(false);

  // 7 Meal Schedules
  const [mealSchedules, setMealSchedules] = useState<MealScheduleItem[]>(DEFAULT_7_MEAL_SLOTS);

  const handleAISuggestDiet = async () => {
    if (!selectedAdm) return;
    setAiSuggesting(true);
    await new Promise(r => setTimeout(r, 700));

    const diagStr = selectedAdm.diagnosis?.join(', ') || '';
    if (diagStr.toLowerCase().includes('diabet') || diagStr.toLowerCase().includes('sugar')) {
      setDietType('diabetic');
      setDietConsistency('regular');
      setEstimatedCalories(1600);
      setProteinGrams(75);
      setCarbsGrams(160);
      setFatGrams(40);
      setFluidRequirementMl(2200);
      setRestrictions('Zero Refined Sugar, Low Glycemic Index Carbohydrates, High Soluble Fiber');
      setSpecialInstructions('Small frequent meals. Avoid fruit juices and potatoes. Monitor post-prandial blood glucose.');
    } else if (diagStr.toLowerCase().includes('cardiac') || diagStr.toLowerCase().includes('coronary') || diagStr.toLowerCase().includes('hypertens')) {
      setDietType('cardiac');
      setDietConsistency('regular');
      setEstimatedCalories(1700);
      setProteinGrams(70);
      setCarbsGrams(200);
      setFatGrams(35);
      setFluidRequirementMl(1800);
      setRestrictions('Strict Low Sodium (<2g NaCl/day), Zero Trans Fats, High Potassium Steamed Vegetables');
      setSpecialInstructions('Avoid table salt, processed snacks, and saturated fats. Provide steamed greens.');
    } else if (diagStr.toLowerCase().includes('renal') || diagStr.toLowerCase().includes('kidney')) {
      setDietType('renal');
      setDietConsistency('soft');
      setEstimatedCalories(1750);
      setProteinGrams(45);
      setCarbsGrams(240);
      setFatGrams(45);
      setFluidRequirementMl(1200);
      setRestrictions('Low Protein (0.6g/kg), Low Potassium, Low Phosphate, Strict Fluid Restriction 1.2L');
      setSpecialInstructions('Leach vegetables before cooking. Strictly avoid citrus fruits and dairy.');
    } else {
      setDietType('high_protein');
      setDietConsistency('regular');
      setEstimatedCalories(2000);
      setProteinGrams(90);
      setCarbsGrams(230);
      setFatGrams(50);
      setFluidRequirementMl(2400);
      setRestrictions('Balanced Macro Targets, Low Sodium');
      setSpecialInstructions('High biological value proteins (egg whites, paneer, lentils) to accelerate recovery.');
    }

    setAiAppliedBadge(true);
    setAiSuggesting(false);
  };

  // Simulated patient allergies
  const patientAllergies = selectedAdm ? ['Peanuts', 'Seafood'] : [];

  // Check allergen conflicts live
  const allSelectedFoodIds: string[] = [];
  mealSchedules.forEach(ms => ms.foodItems.forEach(fi => allSelectedFoodIds.push(fi.foodItemId)));
  const conflicts = checkAllergyConflicts(allSelectedFoodIds, patientAllergies);

  const handleAddFoodToSchedule = (scheduleIndex: number, foodItemId: string) => {
    const food = foodItems.find(f => f.id === foodItemId);
    if (!food) return;

    const updated = [...mealSchedules];
    updated[scheduleIndex].foodItems.push({
      foodItemId: food.id,
      foodName: food.name,
      portion: food.standardPortion,
      calories: food.calories,
    });
    setMealSchedules(updated);
  };

  const handleRemoveFoodFromSchedule = (scheduleIndex: number, foodIndex: number) => {
    const updated = [...mealSchedules];
    updated[scheduleIndex].foodItems.splice(foodIndex, 1);
    setMealSchedules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdm) return;

    const restrictionArray = restrictions.split(',').map(r => r.trim()).filter(Boolean);

    createDietChart({
      admissionId: selectedAdm.id,
      patientId: selectedAdm.patientId,
      patientName: selectedAdm.patientName,
      bedNumber: selectedAdm.bedNumber,
      ward: selectedAdm.ward,
      doctorName: selectedAdm.admittingDoctorName,
      dietitianId: 'dt-001',
      dietitianName: 'Dietitian Shalini Gupta, RD',
      dietType,
      dietConsistency,
      feedingMethod,
      mealFrequency: `${mealSchedules.length} Meals / Day`,
      estimatedCalories: Number(estimatedCalories) || 0,
      proteinGrams: Number(proteinGrams) || 0,
      carbsGrams: Number(carbsGrams) || 0,
      fatGrams: Number(fatGrams) || 0,
      fluidRequirementMl: Number(fluidRequirementMl) || 0,
      mealSchedules: dietType === 'npo' ? [] : mealSchedules,
      restrictions: restrictionArray,
      allergies: patientAllergies,
      specialInstructions,
      startDate,
      reviewDate,
      status,
      approvedBy: 'Dietitian Shalini Gupta, RD',
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 880, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UtensilsCrossed size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Prescribe Clinical Inpatient Diet Plan</div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleAISuggestDiet}
            disabled={aiSuggesting || !selectedAdm}
            style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={13} /> {aiSuggesting ? 'Analyzing Condition...' : 'AI Suggest Diet Plan'}
          </button>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {aiAppliedBadge && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(79, 70, 229, 0.08)',
                  border: '1px solid rgba(79, 70, 229, 0.25)',
                  fontSize: '12px',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={15} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <span>
                    <strong>AI Diet Recommendation Applied:</strong> Macro targets and restrictions tailored to {selectedAdm?.diagnosis[0] || 'clinical diagnosis'}. <em>Dietitian clinical review and sign-off required.</em>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiAppliedBadge(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>
            )}
            {/* Patient Selector */}
            <div className="card" style={{ padding: 14, background: 'var(--bg-surface)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Select Inpatient <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={admissionId}
                  onChange={e => setAdmissionId(e.target.value)}
                >
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} (UHID: {a.patientId}) — Bed {a.bedNumber} ({a.ward}) · Dr. {a.admittingDoctorName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAdm && (
                <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>Diagnosis: <strong>{selectedAdm.diagnosis[0] || 'Clinical Observation'}</strong></span>
                  <span>Recorded Allergies: <strong style={{ color: 'var(--color-danger)' }}>{patientAllergies.join(', ') || 'None Recorded'}</strong></span>
                </div>
              )}
            </div>

            {/* Allergen Conflict Alert Banner */}
            {conflicts.length > 0 && (
              <div
                style={{
                  background: 'var(--color-danger-muted)',
                  border: '1.5px solid var(--color-danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <ShieldAlert size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 13 }}>
                    ⚠️ ALLERGEN CONFLICT DETECTED IN MENU SELECTION:
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                    {conflicts[0]}
                  </div>
                </div>
              </div>
            )}

            {/* Diet Classification & Parameters */}
            <div className="form-grid form-grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">
                  Diet Type <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={dietType}
                  onChange={e => setDietType(e.target.value as any)}
                >
                  <option value="regular">Regular Diet</option>
                  <option value="soft">Soft Diet</option>
                  <option value="liquid">Liquid Diet</option>
                  <option value="diabetic">Diabetic Diet</option>
                  <option value="low_salt">Low Salt Diet</option>
                  <option value="cardiac">Cardiac Diet</option>
                  <option value="renal">Renal Diet</option>
                  <option value="high_protein">High Protein Diet</option>
                  <option value="low_fat">Low Fat Diet</option>
                  <option value="post_op">Post-Surgery Diet</option>
                  <option value="other">Custom Diet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Texture / Consistency</label>
                <select
                  className="form-select"
                  value={dietConsistency}
                  onChange={e => setDietConsistency(e.target.value as any)}
                >
                  <option value="regular">Regular Solid</option>
                  <option value="soft">Soft / Minced</option>
                  <option value="pureed">Pureed</option>
                  <option value="liquid">Liquid</option>
                  <option value="npo">NPO (Fasting)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diet Plan Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="modified">Modified</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Feeding Route</label>
                <select
                  className="form-select"
                  value={feedingMethod}
                  onChange={e => setFeedingMethod(e.target.value as any)}
                >
                  <option value="oral">Oral</option>
                  <option value="assisted">Oral (Assisted)</option>
                  <option value="enteral_tube">Enteral Tube Fed</option>
                  <option value="parenteral_tpn">Parenteral (TPN)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={reviewDate}
                  onChange={e => setReviewDate(e.target.value)}
                />
              </div>
            </div>

            {/* Target Nutritional Values */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                Target Macronutrient & Caloric Allowance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Calories (kcal)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={estimatedCalories}
                    onChange={e => setEstimatedCalories(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Protein (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={proteinGrams}
                    onChange={e => setProteinGrams(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Carbs (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={carbsGrams}
                    onChange={e => setCarbsGrams(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Fat (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fatGrams}
                    onChange={e => setFatGrams(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Fluid (ml/24h)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fluidRequirementMl}
                    onChange={e => setFluidRequirementMl(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Daily Meal Schedule (7 Slots) */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                Daily Meal Schedule (7 Hospital Slots)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mealSchedules.map((slot, sIdx) => (
                  <div
                    key={slot.id}
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>
                          {slot.mealType.toUpperCase().replace('_', ' ')}
                        </strong>
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 95, height: 28, fontSize: 11 }}
                          value={slot.scheduledTime}
                          onChange={e => {
                            const updated = [...mealSchedules];
                            updated[sIdx].scheduledTime = e.target.value;
                            setMealSchedules(updated);
                          }}
                        />
                      </div>
                    </div>

                    {/* Food Items in Slot */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {slot.foodItems.map((fi, fIdx) => (
                        <span
                          key={fIdx}
                          className="badge badge-primary"
                          style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          {fi.foodName} ({fi.portion})
                          <button
                            type="button"
                            onClick={() => handleRemoveFoodFromSchedule(sIdx, fIdx)}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Food Select */}
                    <select
                      className="form-select"
                      style={{ height: 28, fontSize: 11, maxWidth: 280 }}
                      onChange={e => {
                        if (e.target.value) {
                          handleAddFoodToSchedule(sIdx, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add Food Item from Database...</option>
                      {foodItems.filter(f => f.isActive).map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.standardPortion})</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Restrictions & Instructions */}
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Dietary Restrictions (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={restrictions}
                  onChange={e => setRestrictions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions for Kitchen & Nursing</label>
                <input
                  type="text"
                  className="form-input"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              borderTop: '1px solid var(--border-default)',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save & Prescribe Diet Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
