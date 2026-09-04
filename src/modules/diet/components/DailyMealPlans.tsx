import React, { useState } from 'react';
import { ChefHat, Search, Filter, CheckCircle2, Truck, AlertCircle, Ban, Clock } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import MealRefusalModal from './modals/MealRefusalModal';
import type { MealDeliveryRecord } from '../../../types';

export default function DailyMealPlans() {
  const { mealDeliveries, dietCharts, updateMealStatus } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [refusalDelivery, setRefusalDelivery] = useState<MealDeliveryRecord | null>(null);

  const filteredDeliveries = mealDeliveries.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q) ||
      m.ward.toLowerCase().includes(q);

    const matchesMeal = selectedMealType === 'ALL' || m.mealType === selectedMealType;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesSearch && matchesMeal && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Today's Inpatient Meal Plans & Service Tracking</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Live meal statuses, dietary tray preparation, delivery tracking, and refusal documentation
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Bed #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedMealType} onChange={e => setSelectedMealType(e.target.value)}>
            <option value="ALL">All Meal Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="evening_snack">Evening Snack</option>
            <option value="dinner">Dinner</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({mealDeliveries.length})</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready in Kitchen</option>
            <option value="delivered">Delivered to Ward</option>
            <option value="served">Served to Patient</option>
            <option value="refused">Refused</option>
          </select>
        </div>
      </div>

      {/* Meal Deliveries Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Location</th>
                  <th>Meal Slot</th>
                  <th>Prescribed Menu / Items</th>
                  <th>Allergy Warning</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Delivery Staff</th>
                  <th style={{ textAlign: 'right' }}>Update Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(del => {
                  const chart = dietCharts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
                  const schedule = chart?.mealSchedules.find(s => s.mealType === del.mealType);

                  return (
                    <tr key={del.id}>
                      <td>
                        <strong>{del.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Bed <span className="badge badge-primary" style={{ fontSize: 10 }}>{del.bedNumber}</span> ({del.ward})
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {del.mealType.toUpperCase().replace('_', ' ')}
                        </strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>
                          {schedule?.foodItems.map(f => f.foodName).join(', ') || 'Standard diet items'}
                        </div>
                      </td>

                      <td>
                        {chart?.allergies && chart.allergies.length > 0 ? (
                          <span className="badge badge-danger" style={{ fontSize: 10 }}>⚠️ {chart.allergies.join(', ')}</span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>None</span>
                        )}
                      </td>

                      <td>{del.scheduledTime}</td>

                      <td>
                        <span className={`badge ${del.status === 'served' ? 'badge-success' : del.status === 'refused' ? 'badge-danger' : del.status === 'ready' ? 'badge-primary' : 'badge-warning'}`}>
                          {del.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{del.deliveryStaff || del.kitchenStaff || '—'}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {del.status === 'pending' && (
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
                              Ready
                            </button>
                          )}
                          {del.status === 'ready' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => updateMealStatus(del.id, 'delivered', 'Suresh Kumar')}
                            >
                              Dispatch
                            </button>
                          )}
                          {del.status === 'delivered' && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => updateMealStatus(del.id, 'served', 'Nurse Kavitha')}
                            >
                              Served
                            </button>
                          )}
                          {del.status !== 'served' && del.status !== 'refused' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, height: 26, color: 'var(--color-danger)' }}
                              onClick={() => setRefusalDelivery(del)}
                            >
                              Refused
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

      {refusalDelivery && <MealRefusalModal delivery={refusalDelivery} onClose={() => setRefusalDelivery(null)} />}
    </div>
  );
}
