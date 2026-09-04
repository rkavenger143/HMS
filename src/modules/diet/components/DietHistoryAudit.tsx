import React, { useState } from 'react';
import { History, Search, Filter, Eye, Printer, FileText } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import type { ComprehensiveDietChart } from '../../../types';

export default function DietHistoryAudit() {
  const { dietCharts, setSelectedAdmissionId, setActiveTab } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('ALL');
  const [viewChart, setViewChart] = useState<ComprehensiveDietChart | null>(null);

  const filteredCharts = dietCharts.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.patientName.toLowerCase().includes(q) ||
      c.patientId.toLowerCase().includes(q) ||
      c.dietitianName.toLowerCase().includes(q) ||
      (c.modificationReason && c.modificationReason.toLowerCase().includes(q));

    const matchesType = selectedDietType === 'ALL' || c.dietType === selectedDietType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diet Chart Version History & Clinical Audit Trail</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Non-destructive historical chart versions, modification reasons, clinical dietitian signoffs, and audit timestamps
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Dietitian, Reason..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedDietType} onChange={e => setSelectedDietType(e.target.value)}>
            <option value="ALL">All Diet Types ({dietCharts.length})</option>
            <option value="regular">Regular</option>
            <option value="diabetic">Diabetic</option>
            <option value="cardiac">Cardiac</option>
            <option value="renal">Renal</option>
            <option value="npo">NPO</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chart ID & Version</th>
                  <th>Patient & Location</th>
                  <th>Diet Classification</th>
                  <th>Caloric Allowance</th>
                  <th>Clinical Dietitian</th>
                  <th>Modification Reason</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharts.map(ch => (
                  <tr key={ch.id}>
                    <td>
                      <strong>#{ch.id}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>v{ch.version}</div>
                    </td>

                    <td>
                      <strong>{ch.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Bed <span className="badge badge-primary" style={{ fontSize: 10 }}>{ch.bedNumber}</span> ({ch.ward})
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-primary">{ch.dietType.toUpperCase().replace('_', ' ')}</span>
                    </td>

                    <td>
                      <div><strong>{ch.estimatedCalories} kcal</strong></div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>P: {ch.proteinGrams}g · C: {ch.carbsGrams}g</div>
                    </td>

                    <td>{ch.dietitianName}</td>

                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {ch.modificationReason || 'Initial Diet Prescription'}
                      </div>
                    </td>

                    <td>
                      <div>{ch.updatedAt}</div>
                    </td>

                    <td>
                      <span className={`badge ${ch.status === 'active' || ch.status === 'approved' ? 'badge-success' : 'badge-neutral'}`}>
                        {ch.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setViewChart(ch)} title="View Chart">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View/Print Modal */}
      {viewChart && <PrintDietChartModal chart={viewChart} onClose={() => setViewChart(null)} />}
    </div>
  );
}
