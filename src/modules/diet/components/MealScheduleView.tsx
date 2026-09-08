import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  Clock,
  Printer,
  AlertTriangle,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintKitchenBatchModal from './modals/PrintKitchenBatchModal';
import RecordConsumptionModal from './modals/RecordConsumptionModal';
import type { MealDeliveryRecord, MealStatus, MealType } from '../../../types';

export default function MealScheduleView() {
  const { mealDeliveries, dietCharts, updateMealStatus } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedMealSlot, setSelectedMealSlot] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  // Modals
  const [showPrintBatch, setShowPrintBatch] = useState(false);
  const [consumptionDelivery, setConsumptionDelivery] = useState<MealDeliveryRecord | null>(null);

  const filteredDeliveries = mealDeliveries.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q) ||
      m.ward.toLowerCase().includes(q);

    const matchesMeal = selectedMealSlot === 'ALL' || m.mealType === selectedMealSlot;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    const matchesWard = selectedWard === 'ALL' || m.ward === selectedWard;

    return matchesSearch && matchesMeal && matchesStatus && matchesWard;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Bar */}
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
            <ChefHat size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Meal Schedule & Delivery Workflow</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Diet Chart Created → Meal Scheduled → Prepared in Kitchen → Delivered to Ward → Status Updated
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowPrintBatch(true)}>
          <Printer size={13} /> Print Kitchen Batch Sheet
        </button>
      </div>

      {/* Workflow Stage Visual Pill */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-primary">1</span>
          <strong>Scheduled</strong> ({mealDeliveries.filter(m => m.status === 'scheduled' || m.status === 'pending').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-warning">2</span>
          <strong>Preparing</strong> ({mealDeliveries.filter(m => m.status === 'preparing' || m.status === 'ready').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-primary">3</span>
          <strong>Delivered</strong> ({mealDeliveries.filter(m => m.status === 'delivered').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-success">4</span>
          <strong>Consumed</strong> ({mealDeliveries.filter(m => m.status === 'consumed' || m.status === 'served').length})
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Bed #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedMealSlot} onChange={e => setSelectedMealSlot(e.target.value)}>
            <option value="ALL">All Meal Slots ({mealDeliveries.length})</option>
            <option value="early_morning">Early Morning (06:30)</option>
            <option value="breakfast">Breakfast (08:30)</option>
            <option value="mid_morning">Mid-Morning (11:00)</option>
            <option value="lunch">Lunch (13:00)</option>
            <option value="evening_snack">Evening Snack (16:30)</option>
            <option value="dinner">Dinner (19:30)</option>
            <option value="bedtime">Bedtime (21:30)</option>
          </select>

          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Wards</option>
            <option value="General Ward A">General Ward A</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Private Ward">Private Ward</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="preparing">Preparing in Kitchen</option>
            <option value="ready">Ready for Dispatch</option>
            <option value="delivered">Delivered to Bedside</option>
            <option value="consumed">Consumed</option>
            <option value="partially_consumed">Partially Consumed</option>
            <option value="missed">Missed / Refused</option>
          </select>
        </div>
      </div>

      {/* Meal Schedule Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Bed</th>
                  <th>Meal Slot</th>
                  <th>Menu Items to Serve</th>
                  <th>Scheduled Time</th>
                  <th>Allergies</th>
                  <th>Workflow Status</th>
                  <th style={{ textAlign: 'right' }}>Advance Workflow</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(del => {
                  const chart = dietCharts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
                  const schedule = chart?.mealSchedules.find(s => s.mealType === del.mealType);

                  return (
                    <tr key={del.id}>
                      {/* Patient */}
                      <td>
                        <strong>{del.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Bed <span className="badge badge-primary" style={{ fontSize: 10 }}>{del.bedNumber}</span> ({del.ward})
                        </div>
                      </td>

                      {/* Meal Slot */}
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {del.mealType.toUpperCase().replace('_', ' ')}
                        </strong>
                      </td>

                      {/* Menu Items */}
                      <td>
                        <div style={{ fontSize: 12 }}>
                          {schedule?.foodItems.map(f => `${f.foodName} (${f.portion})`).join(', ') || 'Standard diet items'}
                        </div>
                      </td>

                      {/* Time */}
                      <td>
                        <div>{del.scheduledTime}</div>
                        {del.deliveredTime && (
                          <div style={{ fontSize: 10, color: 'var(--color-success)' }}>Delivered: {del.deliveredTime}</div>
                        )}
                      </td>

                      {/* Allergies */}
                      <td>
                        {chart?.allergies && chart.allergies.length > 0 ? (
                          <span className="badge badge-danger" style={{ fontSize: 10 }}>
                            ⚠️ {chart.allergies.join(', ')}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            del.status === 'consumed' || del.status === 'served'
                              ? 'badge-success'
                              : del.status === 'delivered' || del.status === 'ready'
                              ? 'badge-primary'
                              : del.status === 'preparing' || del.status === 'pending'
                              ? 'badge-warning'
                              : del.status === 'missed' || del.status === 'refused'
                              ? 'badge-danger'
                              : 'badge-neutral'
                          }`}
                        >
                          {del.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      {/* Workflow Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {(del.status === 'scheduled' || del.status === 'pending') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => updateMealStatus(del.id, 'preparing', 'Chef Ramesh')}
                            >
                              Start Prep
                            </button>
                          )}

                          {del.status === 'preparing' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => updateMealStatus(del.id, 'ready', 'Chef Ramesh')}
                            >
                              Plated / Ready
                            </button>
                          )}

                          {del.status === 'ready' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => updateMealStatus(del.id, 'delivered', 'Suresh Kumar')}
                            >
                              Mark Delivered
                            </button>
                          )}

                          {del.status === 'delivered' && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => setConsumptionDelivery(del)}
                            >
                              Record Intake
                            </button>
                          )}

                          {(del.status === 'consumed' || del.status === 'partially_consumed') && (
                            <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>
                              ✓ Intake Logged
                            </span>
                          )}

                          {del.status !== 'consumed' && del.status !== 'missed' && del.status !== 'refused' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, height: 26, color: 'var(--color-danger)' }}
                              onClick={() => setConsumptionDelivery(del)}
                            >
                              Record Problem
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPrintBatch && (
        <PrintKitchenBatchModal
          mealType={selectedMealSlot === 'ALL' ? 'lunch' : selectedMealSlot}
          date={new Date().toISOString().slice(0, 10)}
          deliveries={filteredDeliveries}
          charts={dietCharts}
          onClose={() => setShowPrintBatch(false)}
        />
      )}

      {consumptionDelivery && (
        <RecordConsumptionModal
          delivery={consumptionDelivery}
          onClose={() => setConsumptionDelivery(null)}
        />
      )}
    </div>
  );
}
