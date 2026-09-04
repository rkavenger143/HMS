import React from 'react';
import { BarChart3, Clock, Scan, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';

export default function RadiologyAnalytics() {
  const { kpis, radiologyOrders } = useRadiology();

  // Modality count mapping
  const modalityCounts: Record<string, number> = {};
  radiologyOrders.forEach(ord => {
    const mod = ord.modalityType.toUpperCase();
    modalityCounts[mod] = (modalityCounts[mod] || 0) + 1;
  });

  const modalityData = Object.keys(modalityCounts).map(mod => ({
    name: mod,
    scans: modalityCounts[mod],
  }));

  // Turnaround Time Stages
  const tatData = [
    { stage: 'Order → Scheduled', minutes: 18, target: 20 },
    { stage: 'Scheduled → Arrival Check-in', minutes: 14, target: 15 },
    { stage: 'Check-in → Scan Run', minutes: 16, target: 20 },
    { stage: 'Scan → Radiologist Report', minutes: 42, target: 60 },
    { stage: 'Report → Final Release', minutes: 22, target: 30 },
    { stage: 'Total Imaging TAT', minutes: 112, target: 145 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Operational Analytics & Turnaround Time (TAT)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Modality scan volume distribution, equipment utilization metrics, and multi-stage turnaround benchmarks
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-value">1.9 Hrs</div>
          <div className="stat-label">Average Hospital Imaging TAT</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {Math.round(((kpis.reportsVerified) / (kpis.totalOrdersToday || 1)) * 100)}%
          </div>
          <div className="stat-label">Report Verification Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Scan size={20} />
          </div>
          <div className="stat-value">{kpis.completedExaminations}</div>
          <div className="stat-label">Total Completed Scans</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalReportsCount}</div>
          <div className="stat-label">Critical Findings Escalated</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Modality Volume Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Imaging Volume by Diagnostic Modality</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="scans" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Examinations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Turnaround Time Stage Bar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Stage-Wise Turnaround Time (Minutes)</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="stage" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="minutes" fill="#32D74B" radius={[4, 4, 0, 0]} name="Actual Time (mins)" />
                <Bar dataKey="target" fill="rgba(255, 159, 10, 0.4)" radius={[4, 4, 0, 0]} name="NABH Target (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
