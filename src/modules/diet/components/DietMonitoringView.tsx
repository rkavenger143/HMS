import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  UtensilsCrossed,
  Plus,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import RecordConsumptionModal from './modals/RecordConsumptionModal';
import type { MealDeliveryRecord } from '../../../types';

export default function DietMonitoringView() {
  const { mealDeliveries, dietCharts } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedConsumption, setSelectedConsumption] = useState<string>('ALL');
  const [selectedMealSlot, setSelectedMealSlot] = useState<string>('ALL');
  const [activeRecordDelivery, setActiveRecordDelivery] = useState<MealDeliveryRecord | null>(null);

  // Filter deliveries for monitoring
  const filteredDeliveries = mealDeliveries.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q) ||
      (m.foodProblem && m.foodProblem.toLowerCase().includes(q)) ||
      (m.patientFeedback && m.patientFeedback.toLowerCase().includes(q));

    const matchesConsumption =
      selectedConsumption === 'ALL' ||
      (selectedConsumption === 'fully' && (m.consumptionStatus === 'fully_consumed' || m.status === 'consumed')) ||
      (selectedConsumption === 'partially' && (m.consumptionStatus === 'partially_consumed' || m.status === 'partially_consumed')) ||
      (selectedConsumption === 'not_consumed' && (m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused'));

    const matchesMeal = selectedMealSlot === 'ALL' || m.mealType === selectedMealSlot;

    return matchesSearch && matchesConsumption && matchesMeal;
  });

  const fullyConsumedCount = mealDeliveries.filter(
    m => m.consumptionStatus === 'fully_consumed' || m.status === 'consumed'
  ).length;

  const partiallyConsumedCount = mealDeliveries.filter(
    m => m.consumptionStatus === 'partially_consumed' || m.status === 'partially_consumed'
  ).length;

  const missedCount = mealDeliveries.filter(
    m => m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Bedside Meal Intake & Diet Monitoring</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Document meal consumption (Fully / Partially / Not Consumed), patient food feedback, and clinical food problems
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Metrics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.12)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{fullyConsumedCount}</div>
          <div className="stat-label">Fully Consumed (100%)</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{partiallyConsumedCount}</div>
          <div className="stat-label">Partially Consumed (25-75%)</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{missedCount}</div>
          <div className="stat-label">Not Consumed / Missed</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Bed, Symptom..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedConsumption}
            onChange={e => setSelectedConsumption(e.target.value)}
          >
            <option value="ALL">All Intake Levels</option>
            <option value="fully">Fully Consumed (100%)</option>
            <option value="partially">Partially Consumed</option>
            <option value="not_consumed">Not Consumed / Missed</option>
          </select>

          <select
            className="form-select"
            value={selectedMealSlot}
            onChange={e => setSelectedMealSlot(e.target.value)}
          >
            <option value="ALL">All Meal Slots</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="evening_snack">Evening Snack</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>

      {/* Monitoring Logs Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Meal Slot</th>
                  <th>Intake Level</th>
                  <th>Food Problem / Clinical Reason</th>
                  <th>Patient Feedback</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(del => {
                  const isFull = del.consumptionStatus === 'fully_consumed' || del.status === 'consumed';
                  const isPart = del.consumptionStatus === 'partially_consumed' || del.status === 'partially_consumed';
                  const isMissed = del.consumptionStatus === 'not_consumed' || del.status === 'missed' || del.status === 'refused';

                  return (
                    <tr key={del.id}>
                      {/* Patient */}
                      <td>
                        <strong>{del.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UHID: {del.patientId}</div>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="badge badge-primary">{del.bedNumber}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{del.ward}</div>
                      </td>

                      {/* Meal Slot */}
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {del.mealType.toUpperCase().replace('_', ' ')}
                        </strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{del.scheduledTime}</div>
                      </td>

                      {/* Intake Level */}
                      <td>
                        {isFull ? (
                          <span className="badge badge-success">✓ 100% Fully Consumed</span>
                        ) : isPart ? (
                          <span className="badge badge-warning">⚠️ Partially Consumed</span>
                        ) : isMissed ? (
                          <span className="badge badge-danger">✗ Not Consumed / Missed</span>
                        ) : (
                          <span className="badge badge-neutral">Pending Delivery</span>
                        )}
                      </td>

                      {/* Problem / Reason */}
                      <td>
                        {del.foodProblem || del.refusalReason ? (
                          <div style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: 12 }}>
                            ⚠️ {del.foodProblem || del.refusalReason}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Normal tolerance</span>
                        )}
                      </td>

                      {/* Patient Feedback */}
                      <td>
                        {del.patientFeedback ? (
                          <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                            "{del.patientFeedback}"
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No comments</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => setActiveRecordDelivery(del)}
                        >
                          {del.consumptionStatus ? 'Edit Intake' : 'Record Intake'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeRecordDelivery && (
        <RecordConsumptionModal
          delivery={activeRecordDelivery}
          onClose={() => setActiveRecordDelivery(null)}
        />
      )}
    </div>
  );
}
