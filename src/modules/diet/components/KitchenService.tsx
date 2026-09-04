import React, { useState } from 'react';
import { ChefHat, Printer, Users, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintKitchenBatchModal from './modals/PrintKitchenBatchModal';

export default function KitchenService() {
  const { mealDeliveries, dietCharts, npoPatients } = useDiet();

  const [selectedMealSlot, setSelectedMealSlot] = useState<string>('lunch');
  const [showPrintBatch, setShowPrintBatch] = useState(false);

  const activeNPOList = npoPatients.filter(n => n.status === 'active');
  const currentSlotDeliveries = mealDeliveries.filter(m => m.mealType === selectedMealSlot);

  // Group by diet type
  const dietCounts: Record<string, number> = {};
  currentSlotDeliveries.forEach(del => {
    const chart = dietCharts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
    const type = chart?.dietType || 'regular';
    dietCounts[type] = (dietCounts[type] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Kitchen Central Dietary & Batch Food Service</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Ward-wise meal aggregation, batch preparation lists, dietary portioning, and culinary print sheets
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-select"
            style={{ width: 160 }}
            value={selectedMealSlot}
            onChange={e => setSelectedMealSlot(e.target.value)}
          >
            <option value="early_morning">Early Morning</option>
            <option value="breakfast">Breakfast</option>
            <option value="mid_morning">Mid-Morning</option>
            <option value="lunch">Lunch</option>
            <option value="evening_snack">Evening Snack</option>
            <option value="dinner">Dinner</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setShowPrintBatch(true)}>
            <Printer size={13} /> Print Kitchen Batch Sheet
          </button>
        </div>
      </div>

      {/* Aggregated Requirements Summary Cards */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
          Batch Meal Requirements: {selectedMealSlot.toUpperCase().replace('_', ' ')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {Object.keys(dietCounts).map(type => (
            <div key={type} className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                <ChefHat size={18} />
              </div>
              <div className="stat-value">{dietCounts[type]} Trays</div>
              <div className="stat-label">{type.toUpperCase().replace('_', ' ')}</div>
            </div>
          ))}

          {/* NPO Fasting Count */}
          <div className="stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={18} />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{activeNPOList.length} Pts</div>
            <div className="stat-label">NPO Fasting (No Tray)</div>
          </div>
        </div>
      </div>

      {/* Production Item Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Inpatient Meal Trays in Batch ({currentSlotDeliveries.length} Trays)</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & UHID</th>
                  <th>Location (Bed/Ward)</th>
                  <th>Diet Type</th>
                  <th>Menu Items to Plate</th>
                  <th>Allergens to Avoid</th>
                  <th>Kitchen Status</th>
                </tr>
              </thead>
              <tbody>
                {currentSlotDeliveries.map(del => {
                  const chart = dietCharts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
                  const schedule = chart?.mealSchedules.find(s => s.mealType === del.mealType);

                  return (
                    <tr key={del.id}>
                      <td>
                        <strong>{del.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{del.patientId}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{del.bedNumber}</span> {del.ward}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {chart?.dietType.toUpperCase().replace('_', ' ') || 'REGULAR'}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          {schedule?.foodItems.map(f => `${f.foodName} (${f.portion})`).join(', ') || 'Standard diet items'}
                        </div>
                      </td>
                      <td>
                        {chart?.allergies && chart.allergies.length > 0 ? (
                          <span className="badge badge-danger" style={{ fontSize: 10 }}>⚠️ {chart.allergies.join(', ')}</span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Nil</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${del.status === 'ready' || del.status === 'served' ? 'badge-success' : 'badge-primary'}`}>
                          {del.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPrintBatch && (
        <PrintKitchenBatchModal
          mealType={selectedMealSlot}
          date={new Date().toISOString().slice(0, 10)}
          deliveries={currentSlotDeliveries}
          charts={dietCharts}
          onClose={() => setShowPrintBatch(false)}
        />
      )}
    </div>
  );
}
