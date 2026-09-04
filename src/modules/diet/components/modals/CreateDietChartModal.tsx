import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import type { DietType, MealType, MealScheduleItem, MealScheduleFoodItem } from '../../../../types';

interface CreateDietChartModalProps {
  onClose: () => void;
  initialAdmissionId?: string;
}

export default function CreateDietChartModal({ onClose, initialAdmissionId }: CreateDietChartModalProps) {
  const { admissions, foodItems, createDietChart } = useDiet();

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(initialAdmissionId || activeAdmissions[0]?.id || '');

  const selectedAdm = activeAdmissions.find(a => a.id === admissionId) || activeAdmissions[0];

  // Diet Chart Form State
  const [dietType, setDietType] = useState<DietType>('regular');
  const [dietConsistency, setDietConsistency] = useState<'regular' | 'soft' | 'pureed' | 'liquid' | 'npo'>('regular');
  const [feedingMethod, setFeedingMethod] = useState<'oral' | 'enteral_tube' | 'parenteral_tpn' | 'assisted' | 'npo'>('oral');
  const [mealFrequency, setMealFrequency] = useState('3 Main Meals + 2 Snacks');
  const [estimatedCalories, setEstimatedCalories] = useState(1800);
  const [proteinGrams, setProteinGrams] = useState(70);
  const [carbsGrams, setCarbsGrams] = useState(220);
  const [fatGrams, setFatGrams] = useState(45);
  const [fluidRequirementMl, setFluidRequirementMl] = useState(2000);
  const [restrictions, setRestrictions] = useState('Low Sodium, No Refined Sugar');
  const [specialInstructions, setSpecialInstructions] = useState('Serve warm. Avoid spicy seasonings.');

  // Meal Schedules
  const [mealSchedules, setMealSchedules] = useState<MealScheduleItem[]>([
    {
      id: 'ms-new-1',
      mealType: 'breakfast',
      scheduledTime: '08:30',
      foodItems: [
        { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge', portion: '1 Bowl (200g)', calories: 150 },
        { foodItemId: 'fi-002', foodName: 'Boiled Egg Whites', portion: '2 pcs', calories: 34 },
      ],
      specialInstructions: '',
    },
    {
      id: 'ms-new-2',
      mealType: 'lunch',
      scheduledTime: '13:00',
      foodItems: [
        { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs', calories: 160 },
        { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl', calories: 65 },
        { foodItemId: 'fi-005', foodName: 'Low-Fat Curd / Yogurt', portion: '1 Cup', calories: 95 },
      ],
      specialInstructions: '',
    },
    {
      id: 'ms-new-3',
      mealType: 'dinner',
      scheduledTime: '19:30',
      foodItems: [
        { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi', portion: '1 Bowl (250g)', calories: 220 },
      ],
      specialInstructions: '',
    },
  ]);

  // Check Allergen Conflicts live
  const patientAllergies = selectedAdm ? ['Peanuts', 'Seafood', 'Penicillin'] : []; // Simulated or retrieved
  const allSelectedFoodIds: string[] = [];
  mealSchedules.forEach(ms => ms.foodItems.forEach(fi => allSelectedFoodIds.push(fi.foodItemId)));

  const activeConflicts: string[] = [];
  allSelectedFoodIds.forEach(fId => {
    const food = foodItems.find(f => f.id === fId);
    if (food && food.allergens) {
      food.allergens.forEach(allergen => {
        if (patientAllergies.some(pa => pa.toLowerCase().includes(allergen.toLowerCase()) || allergen.toLowerCase().includes(pa.toLowerCase()))) {
          activeConflicts.push(`Food "${food.name}" contains ${allergen} which matches patient allergy "${allergen}"`);
        }
      });
    }
  });

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

  const handleAddMealSlot = () => {
    const newSlot: MealScheduleItem = {
      id: `ms-new-${Date.now()}`,
      mealType: 'evening_snack',
      scheduledTime: '16:30',
      foodItems: [],
      specialInstructions: '',
    };
    setMealSchedules(prev => [...prev, newSlot]);
  };

  const handleRemoveMealSlot = (index: number) => {
    setMealSchedules(prev => prev.filter((_, i) => i !== index));
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
      mealFrequency,
      estimatedCalories: Number(estimatedCalories) || 0,
      proteinGrams: Number(proteinGrams) || 0,
      carbsGrams: Number(carbsGrams) || 0,
      fatGrams: Number(fatGrams) || 0,
      fluidRequirementMl: Number(fluidRequirementMl) || 0,
      mealSchedules: dietType === 'npo' ? [] : mealSchedules,
      restrictions: restrictionArray,
      allergies: patientAllergies,
      specialInstructions,
      status: 'active',
      approvedBy: 'Dietitian Shalini Gupta, RD',
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <UtensilsCrossed size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Prescribe Clinical Inpatient Diet Chart</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient Selector */}
            <div className="card" style={{ padding: 14, background: 'var(--bg-surface)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Select Active Inpatient <span className="required">*</span></label>
                <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} (UHID: {a.patientId}) — Bed {a.bedNumber} ({a.ward}) · Dr. {a.admittingDoctorName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAdm && (
                <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>Diagnosis: <strong>{selectedAdm.diagnosis[0] || 'Clinical Observation'}</strong></span>
                  <span>Known Allergies: <strong style={{ color: 'var(--color-danger)' }}>{patientAllergies.join(', ') || 'None Recorded'}</strong></span>
                </div>
              )}
            </div>

            {/* Allergen Conflict Alert Banner */}
            {activeConflicts.length > 0 && (
              <div style={{ background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 13 }}>
                    ⚠️ ALLERGEN CONFLICT DETECTED IN SELECTED MENU:
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                    {activeConflicts[0]}
                  </div>
                </div>
              </div>
            )}

            {/* Diet Specifications Grid */}
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Diet Classification <span className="required">*</span></label>
                <select className="form-select" value={dietType} onChange={e => setDietType(e.target.value as any)}>
                  <option value="regular">Regular / Normal Hospital Diet</option>
                  <option value="diabetic">Diabetic Diet (Low Glycemic)</option>
                  <option value="cardiac">Cardiac Diet (Low Sodium & Fat)</option>
                  <option value="renal">Renal Diet (Protein/K/Phos Controlled)</option>
                  <option value="soft">Soft Diet (Easily Digestible)</option>
                  <option value="liquid">Clear Liquid Diet</option>
                  <option value="full_liquid">Full Liquid Diet</option>
                  <option value="high_protein">High Protein Healing Diet</option>
                  <option value="low_salt">{'Low Sodium (<2g/day)'}</option>
                  <option value="low_fat">Low Fat / Hepatic Diet</option>
                  <option value="high_calorie">High Calorie / Malnutrition</option>
                  <option value="pediatric">Pediatric Diet</option>
                  <option value="icu">ICU Critical Care Enteral Feed</option>
                  <option value="post_op">Post-Operative Step-Up Diet</option>
                  <option value="npo">Nil Per Os (NPO Fasting)</option>
                  <option value="other">Special Formulated Diet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diet Texture / Consistency</label>
                <select className="form-select" value={dietConsistency} onChange={e => setDietConsistency(e.target.value as any)}>
                  <option value="regular">Regular Solid</option>
                  <option value="soft">Soft / Minced</option>
                  <option value="pureed">Pureed / Semi-Solid</option>
                  <option value="liquid">Liquid / Fluid</option>
                  <option value="npo">NPO</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Feeding Route / Method</label>
                <select className="form-select" value={feedingMethod} onChange={e => setFeedingMethod(e.target.value as any)}>
                  <option value="oral">Oral (Self)</option>
                  <option value="assisted">Oral (Assisted by Nurse)</option>
                  <option value="enteral_tube">Enteral (Ryle / PEG Tube)</option>
                  <option value="parenteral_tpn">Parenteral (TPN / PPN)</option>
                  <option value="npo">NPO</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Meal Frequency</label>
                <input type="text" className="form-input" value={mealFrequency} onChange={e => setMealFrequency(e.target.value)} />
              </div>
            </div>

            {/* Target Nutritional Values */}
            {dietType !== 'npo' && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Target Macronutrient & Fluid Allowance</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Calories (kcal)</label>
                    <input type="number" className="form-input" value={estimatedCalories} onChange={e => setEstimatedCalories(Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Protein (g)</label>
                    <input type="number" className="form-input" value={proteinGrams} onChange={e => setProteinGrams(Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Carbs (g)</label>
                    <input type="number" className="form-input" value={carbsGrams} onChange={e => setCarbsGrams(Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Fat (g)</label>
                    <input type="number" className="form-input" value={fatGrams} onChange={e => setFatGrams(Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Fluid (ml/24h)</label>
                    <input type="number" className="form-input" value={fluidRequirementMl} onChange={e => setFluidRequirementMl(Number(e.target.value))} />
                  </div>
                </div>
              </div>
            )}

            {/* Meal Schedules Builder */}
            {dietType !== 'npo' && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Meal Schedule & Menu Items</div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddMealSlot}>
                    <Plus size={12} /> Add Meal Slot
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {mealSchedules.map((slot, sIdx) => (
                    <div key={slot.id} style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <select
                            className="form-select"
                            style={{ width: 140, height: 32, fontSize: 12 }}
                            value={slot.mealType}
                            onChange={e => {
                              const updated = [...mealSchedules];
                              updated[sIdx].mealType = e.target.value as MealType;
                              setMealSchedules(updated);
                            }}
                          >
                            <option value="early_morning">Early Morning</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="mid_morning">Mid-Morning</option>
                            <option value="lunch">Lunch</option>
                            <option value="evening_snack">Evening Snack</option>
                            <option value="dinner">Dinner</option>
                            <option value="bedtime">Bedtime</option>
                          </select>

                          <input
                            type="time"
                            className="form-input"
                            style={{ width: 100, height: 32, fontSize: 12 }}
                            value={slot.scheduledTime}
                            onChange={e => {
                              const updated = [...mealSchedules];
                              updated[sIdx].scheduledTime = e.target.value;
                              setMealSchedules(updated);
                            }}
                          />
                        </div>

                        <button type="button" className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleRemoveMealSlot(sIdx)} title="Remove slot">
                          <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </div>

                      {/* Food Items in Slot */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                        {slot.foodItems.map((fi, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '6px 10px', borderRadius: 4, fontSize: 12 }}>
                            <span><strong>{fi.foodName}</strong> ({fi.portion}) · {fi.calories} kcal</span>
                            <button type="button" className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleRemoveFoodFromSchedule(sIdx, fIdx)}>✕</button>
                          </div>
                        ))}
                      </div>

                      {/* Add Food Picker */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          className="form-select"
                          style={{ height: 30, fontSize: 11 }}
                          onChange={e => {
                            if (e.target.value) {
                              handleAddFoodToSchedule(sIdx, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>+ Add Food Item from Master...</option>
                          {foodItems.filter(f => f.isActive).map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.category}) - {f.standardPortion}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions & Remarks */}
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Dietary Restrictions (Comma separated)</label>
                <input type="text" className="form-input" value={restrictions} onChange={e => setRestrictions(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Kitchen & Nursing Instructions</label>
                <input type="text" className="form-input" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save & Activate Diet Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
