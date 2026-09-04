import React, { useState } from 'react';
import { Truck, Search, Filter, CheckCircle2, Clock, User, AlertTriangle } from 'lucide-react';
import { useDiet } from '../context/DietContext';

export default function MealDeliveryTracker() {
  const { mealDeliveries, updateMealStatus } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');

  const filteredDeliveries = mealDeliveries.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q) ||
      (m.deliveryStaff && m.deliveryStaff.toLowerCase().includes(q));

    const matchesWard = selectedWard === 'ALL' || m.ward === selectedWard;
    return matchesSearch && matchesWard;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Ward Meal Tray Delivery & Handover Tracking</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Dispatch cart tracking, staff handovers, bedside delivery confirmation, and delay logging
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
              placeholder="Search Patient, Bed #, Delivery Staff..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Hospital Wards</option>
            <option value="General Ward A">General Ward A</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Private Ward">Private Ward</option>
          </select>
        </div>
      </div>

      {/* Delivery Queue */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Bed</th>
                  <th>Meal Category</th>
                  <th>Delivery Scheduled</th>
                  <th>Delivered Time</th>
                  <th>Delivery Staff</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(del => {
                  const isServed = del.status === 'served';
                  const isDelivered = del.status === 'delivered';
                  const isReady = del.status === 'ready';

                  return (
                    <tr key={del.id}>
                      <td>
                        <strong>{del.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Bed <span className="badge badge-primary" style={{ fontSize: 10 }}>{del.bedNumber}</span> ({del.ward})
                        </div>
                      </td>

                      <td>
                        <strong>{del.mealType.toUpperCase().replace('_', ' ')}</strong>
                      </td>

                      <td>{del.scheduledTime}</td>

                      <td>
                        <strong>{del.deliveredTime || '—'}</strong>
                      </td>

                      <td>{del.deliveryStaff || 'Suresh Kumar'}</td>

                      <td>
                        <span className={`badge ${isServed ? 'badge-success' : isDelivered ? 'badge-primary' : isReady ? 'badge-warning' : 'badge-neutral'}`}>
                          {del.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isReady && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => updateMealStatus(del.id, 'delivered', 'Suresh Kumar')}
                          >
                            Mark Dispatched
                          </button>
                        )}
                        {isDelivered && (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => updateMealStatus(del.id, 'served', 'Nurse Kavitha')}
                          >
                            Confirm Bedside Delivery
                          </button>
                        )}
                        {isServed && (
                          <span className="badge badge-success">✓ COMPLETED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
