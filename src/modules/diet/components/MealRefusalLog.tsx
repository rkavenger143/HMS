import React, { useState } from 'react';
import { AlertCircle, Search, Filter, AlertTriangle } from 'lucide-react';
import { useDiet } from '../context/DietContext';

export default function MealRefusalLog() {
  const { mealDeliveries } = useDiet();

  const [search, setSearch] = useState('');

  const refusedMeals = mealDeliveries.filter(m => m.status === 'refused');

  const filteredRefusals = refusedMeals.filter(m => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q) ||
      (m.refusalReason && m.refusalReason.toLowerCase().includes(q)) ||
      (m.remarks && m.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Meal Refusal & Intake Variance Audit</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Documentation of skipped or rejected meals, clinical symptoms (nausea, emesis), and dietetic review triggers
            </div>
          </div>
        </div>

        <span className="badge badge-danger" style={{ padding: '6px 12px', fontSize: 12 }}>
          {refusedMeals.length} Refusal Event{refusedMeals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Patient, Bed #, Reason..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Refusals Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Meal Slot</th>
                  <th>Date & Scheduled Time</th>
                  <th>Clinical Reason for Refusal</th>
                  <th>Staff Observations & Action Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefusals.length > 0 ? (
                  filteredRefusals.map(m => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>UHID: {m.patientId}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{m.bedNumber}</span> {m.ward}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{m.mealType.toUpperCase()}</strong>
                      </td>
                      <td>
                        <div>{m.date}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.scheduledTime}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-danger)' }}>{m.refusalReason || 'Patient Refused'}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.remarks || 'Clinical team notified.'}</div>
                      </td>
                      <td>
                        <span className="badge badge-danger">REFUSED</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}>
                      No meal refusals documented today. All patient meals successfully delivered and consumed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
