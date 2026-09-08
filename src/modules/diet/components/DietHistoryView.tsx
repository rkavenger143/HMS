import React, { useState } from 'react';
import { History, Search, Filter, Eye, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import type { ComprehensiveDietChart } from '../../../types';

export default function DietHistoryView() {
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
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient Diet History & Revision Log</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Historical diet plans, versioned prescription changes, modification reasons, and clinical dietitian signoffs
            </div>
          </div>
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
              placeholder="Search Patient, Dietitian, Reason..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedDietType}
            onChange={e => setSelectedDietType(e.target.value)}
          >
            <option value="ALL">All Diet Types ({dietCharts.length})</option>
            <option value="regular">Regular Diet</option>
            <option value="diabetic">Diabetic Diet</option>
            <option value="cardiac">Cardiac Diet</option>
            <option value="renal">Renal Diet</option>
            <option value="high_protein">High Protein Diet</option>
            <option value="soft">Soft Diet</option>
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
                  <th>Plan ID & Version</th>
                  <th>Patient & Bed</th>
                  <th>Diet Classification</th>
                  <th>Caloric Target</th>
                  <th>Clinical Dietitian</th>
                  <th>Reason for Modification</th>
                  <th>Last Modified</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharts.map(ch => (
                  <tr key={ch.id}>
                    {/* Plan ID & Version */}
                    <td>
                      <strong>#{ch.id.toUpperCase()}</strong>
                      <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: 10 }}>v{ch.version}</span>
                    </td>

                    {/* Patient */}
                    <td>
                      <strong>{ch.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Bed {ch.bedNumber} ({ch.ward}) · UHID: {ch.patientId}
                      </div>
                    </td>

                    {/* Diet Type */}
                    <td>
                      <span className="badge badge-primary">
                        {ch.dietType.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    {/* Calories */}
                    <td>
                      <strong>{ch.estimatedCalories} kcal</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        P: {ch.proteinGrams}g · C: {ch.carbsGrams}g · F: {ch.fatGrams}g
                      </div>
                    </td>

                    {/* Dietitian */}
                    <td>{ch.dietitianName}</td>

                    {/* Modification Reason */}
                    <td>
                      <div style={{ fontSize: 12, color: ch.modificationReason ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
                        {ch.modificationReason || 'Initial Diet Prescription'}
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: 12 }}>{ch.updatedAt || ch.createdAt}</div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${ch.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {ch.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11 }}
                        onClick={() => setViewChart(ch)}
                      >
                        <Eye size={12} /> View Chart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewChart && <PrintDietChartModal chart={viewChart} onClose={() => setViewChart(null)} />}
    </div>
  );
}
