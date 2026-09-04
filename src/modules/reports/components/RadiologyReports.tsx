import React, { useMemo } from 'react';
import {
  ScanLine, CheckCircle2, Clock, DollarSign, Download,
  Printer, BarChart2, FileSpreadsheet, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function RadiologyReports() {
  const { radiologyStudies, filters, exportCSV } = useReports();

  const filtered = useMemo(() => {
    return radiologyStudies.filter(r => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || r.patientName?.toLowerCase().includes(q) || r.patientId?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q) || r.modality?.toLowerCase().includes(q);
      const mdoc = filters.doctorId === 'ALL' || r.doctorId === filters.doctorId || r.doctorName === filters.doctorId;
      return ms && mdoc;
    });
  }, [radiologyStudies, filters]);

  // Modality Breakdown
  const modalityData = useMemo(() => {
    const map: { [key: string]: { count: number; revenue: number } } = {};
    filtered.forEach(r => {
      const mod = r.modality?.toUpperCase() || 'XRAY';
      if (!map[mod]) map[mod] = { count: 0, revenue: 0 };
      map[mod].count++;
      map[mod].revenue += r.price || 1200;
    });
    return Object.keys(map).map(m => ({
      modality: m,
      count: map[m].count,
      revenue: map[m].revenue,
    }));
  }, [filtered]);

  const totalRevenue = filtered.reduce((acc, r) => acc + (r.price || 1200), 0);
  const completedCount = filtered.filter(r => r.status === 'completed').length;

  const handleExportCSV = () => {
    const rows = filtered.map(r => [
      r.id,
      r.patientName || r.patientId,
      r.modality?.toUpperCase() || 'XRAY',
      r.bodyPart || 'Chest',
      r.doctorName || r.doctorId || 'Physician',
      r.scheduledDate || '2026-09-02',
      `₹${r.price || 1200}`,
      r.status.toUpperCase(),
    ]);

    exportCSV(
      'Radiology_Imaging_Studies_Report',
      ['Study ID', 'Patient Name', 'Modality', 'Body Part', 'Ordering Doctor', 'Scheduled Date', 'Tariff (INR)', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Radiology & Medical Imaging Investigations Report"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Total Imaging Studies</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{completedCount}</div>
          <div className="stat-label">Reported by Radiologist</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>{modalityData.length} Modalities</div>
          <div className="stat-label">Active Imaging Modalities</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Imaging Revenue</div>
        </div>
      </div>

      {/* Modality Chart */}
      <div className="card">
        <div className="card-header">
          <ScanLine size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Radiology Imaging Volume by Modality</span>
        </div>
        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modalityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="modality" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Studies" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Radiology Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Radiology Studies & Reports Register</span>
          <span className="badge badge-primary">{filtered.length} Studies</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Study ID</th>
                  <th>Patient Name & ID</th>
                  <th>Modality</th>
                  <th>Body Region</th>
                  <th>Ordering Physician</th>
                  <th>Fee (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{r.id}</strong>
                    </td>
                    <td>
                      <strong>{r.patientName || r.patientId}</strong>
                    </td>
                    <td>
                      <span className="badge badge-primary">{r.modality?.toUpperCase() || 'XRAY'}</span>
                    </td>
                    <td>{r.bodyPart || 'Chest / Abdomen'}</td>
                    <td>{r.doctorName || r.doctorId}</td>
                    <td><strong>₹{r.price || 1200}</strong></td>
                    <td>
                      <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
