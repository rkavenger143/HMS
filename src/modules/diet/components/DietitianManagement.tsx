import React, { useState } from 'react';
import { UserCheck, Plus, Search, Filter, CheckCircle2, ShieldCheck, Clock, FileText } from 'lucide-react';
import { useDiet } from '../context/DietContext';

interface DietitianStaff {
  id: string;
  name: string;
  employeeId: string;
  qualification: string;
  department: string;
  phone: string;
  assignedWard: string;
  activeChartsCount: number;
  pendingReviewsCount: number;
}

const INITIAL_DIETITIANS: DietitianStaff[] = [
  { id: 'dt-001', name: 'Dietitian Shalini Gupta, RD', employeeId: 'EMP-NUT-101', qualification: 'M.Sc. Clinical Nutrition, RD', department: 'Clinical Nutrition & Dietetics', phone: '+91 98765 43220', assignedWard: 'General Ward A & Private Ward', activeChartsCount: 14, pendingReviewsCount: 2 },
  { id: 'dt-002', name: 'Dietitian Rohan Mehta', employeeId: 'EMP-NUT-102', qualification: 'B.Sc. Dietetics, PGDND', department: 'ICU & Critical Care Nutrition', phone: '+91 98765 43221', assignedWard: 'Medical ICU & Surgical ICU', activeChartsCount: 8, pendingReviewsCount: 1 },
];

export default function DietitianManagement() {
  const { dietCharts, approveDietChart, setActiveTab } = useDiet();

  const [dietitians] = useState<DietitianStaff[]>(INITIAL_DIETITIANS);
  const pendingCharts = dietCharts.filter(c => c.status === 'draft' || c.status === 'pending_review');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Clinical Dietitians & Nutrition Review Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Dietitian staffing, ward coverage assignments, chart approval queues, and clinical audit metrics
            </div>
          </div>
        </div>
      </div>

      {/* Dietitians Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {dietitians.map(dt => (
          <div key={dt.id} className="card" style={{ padding: 20, borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar avatar-md">{dt.name[10]}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{dt.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dt.qualification} · {dt.employeeId}</div>
                </div>
              </div>
              <span className="badge badge-success">ON DUTY</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 12 }}>
              <div>Department: <strong>{dt.department}</strong></div>
              <div>Assigned Coverage: <strong>{dt.assignedWard}</strong></div>
              <div>Contact: <strong>{dt.phone}</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center' }}>
              <div style={{ background: 'rgba(10,132,255,0.08)', padding: '8px 10px', borderRadius: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{dt.activeChartsCount}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Active Diet Charts</div>
              </div>
              <div style={{ background: 'rgba(255,159,10,0.08)', padding: '8px 10px', borderRadius: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-warning)' }}>{dt.pendingReviewsCount}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pending Reviews</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Queue */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} style={{ color: 'var(--color-warning)' }} />
            <span className="card-title">Pending Diet Chart Approval & Signoff Queue</span>
          </div>
          <span className="badge badge-warning">{pendingCharts.length} Pending</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chart ID</th>
                  <th>Patient & Location</th>
                  <th>Prescribed Diet</th>
                  <th>Calories / Macros</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Authorization</th>
                </tr>
              </thead>
              <tbody>
                {pendingCharts.length > 0 ? (
                  pendingCharts.map(pc => (
                    <tr key={pc.id}>
                      <td><strong>#{pc.id}</strong></td>
                      <td>
                        <strong>{pc.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {pc.bedNumber} ({pc.ward})</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{pc.dietType.toUpperCase()}</span>
                      </td>
                      <td>
                        <div>{pc.estimatedCalories} kcal</div>
                      </td>
                      <td>{pc.createdAt}</td>
                      <td>
                        <span className="badge badge-warning">{pc.status.toUpperCase()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => approveDietChart(pc.id, 'Dietitian Shalini Gupta, RD')}
                        >
                          <ShieldCheck size={12} /> Sign Off & Approve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}>
                      No pending diet charts awaiting review. All charts approved and active.
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
