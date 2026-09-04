import React, { useState } from 'react';
import { Settings, Plus, CheckCircle2, Clock, UtensilsCrossed, ShieldAlert } from 'lucide-react';

interface MealTimingConfig {
  id: string;
  mealType: string;
  defaultTime: string;
  kitchenDispatchDeadline: string;
  active: boolean;
}

const DEFAULT_TIMINGS: MealTimingConfig[] = [
  { id: 'mt-1', mealType: 'Early Morning Tea / Beverage', defaultTime: '06:30', kitchenDispatchDeadline: '06:15', active: true },
  { id: 'mt-2', mealType: 'Breakfast', defaultTime: '08:30', kitchenDispatchDeadline: '08:15', active: true },
  { id: 'mt-3', mealType: 'Mid-Morning Snack / Fruit', defaultTime: '11:00', kitchenDispatchDeadline: '10:45', active: true },
  { id: 'mt-4', mealType: 'Lunch', defaultTime: '13:00', kitchenDispatchDeadline: '12:45', active: true },
  { id: 'mt-5', mealType: 'Evening Snack / Broth', defaultTime: '16:30', kitchenDispatchDeadline: '16:15', active: true },
  { id: 'mt-6', mealType: 'Dinner', defaultTime: '19:30', kitchenDispatchDeadline: '19:15', active: true },
  { id: 'mt-7', mealType: 'Bedtime Milk / Beverage', defaultTime: '21:30', kitchenDispatchDeadline: '21:15', active: true },
];

export default function DietSettings() {
  const [mealTimings, setMealTimings] = useState<MealTimingConfig[]>(DEFAULT_TIMINGS);
  const [hospitalFluidCap, setHospitalFluidCap] = useState(2500);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Clinical Diet & Nutrition Master Configurations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Meal delivery timetable schedules, kitchen dispatch deadlines, serving units, and dietary policies
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            ✓ Configurations Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Meal Timetable Schedule */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Meal Timings & Dispatch Schedule</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meal Category</th>
                    <th>Bedside Service Time</th>
                    <th>Kitchen Dispatch Deadline</th>
                    <th>Schedule Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mealTimings.map((mt, idx) => (
                    <tr key={mt.id}>
                      <td><strong>{mt.mealType}</strong></td>
                      <td>
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 120, height: 32 }}
                          value={mt.defaultTime}
                          onChange={e => {
                            const updated = [...mealTimings];
                            updated[idx].defaultTime = e.target.value;
                            setMealTimings(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 120, height: 32 }}
                          value={mt.kitchenDispatchDeadline}
                          onChange={e => {
                            const updated = [...mealTimings];
                            updated[idx].kitchenDispatchDeadline = e.target.value;
                            setMealTimings(updated);
                          }}
                        />
                      </td>
                      <td>
                        <span className="badge badge-success">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Clinical Dietary Policy Parameters */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Nutrition Policy Parameters</span>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Default Adult Daily Fluid Allowance Cap (ml)</label>
                <input
                  type="number"
                  className="form-input"
                  value={hospitalFluidCap}
                  onChange={e => setHospitalFluidCap(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allergen Safety Cross-Checking</label>
                <select className="form-select" defaultValue="mandatory">
                  <option value="mandatory">Mandatory Conflict Resolution Banner</option>
                  <option value="warning">Warning Only</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">NPO Fasting Confirmation Requirement</label>
                <select className="form-select" defaultValue="doctor_only">
                  <option value="doctor_only">Attending Physician / Surgeon Authorization Only</option>
                  <option value="nurse_doctor">Physician or Charge Nurse Authorized</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={14} /> Save Master Settings
          </button>
        </div>
      </form>
    </div>
  );
}
