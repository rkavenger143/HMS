import React from 'react';
import { BarChart3, Clock, FlaskConical, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLab } from '../context/LabContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts';

export default function LabAnalytics() {
  const { kpis, labOrders, labSamples, testMaster } = useLab();

  // Test volume by Category
  const categoryCountMap: Record<string, number> = {};
  labOrders.forEach(order => {
    order.items.forEach(item => {
      const tm = testMaster.find(t => t.id === item.testId);
      const cat = tm?.category ? tm.category.toUpperCase() : 'OTHER';
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });
  });

  const departmentData = Object.keys(categoryCountMap).map(cat => ({
    name: cat,
    tests: categoryCountMap[cat],
  }));

  // Turnaround Time Stages
  const tatData = [
    { stage: 'Order → Collection', minutes: 24, target: 30 },
    { stage: 'Collection → Lab Intake', minutes: 18, target: 20 },
    { stage: 'Intake → Test Processing', minutes: 45, target: 60 },
    { stage: 'Result → Pathologist Signoff', minutes: 22, target: 30 },
    { stage: 'Total Turnaround Time (TAT)', minutes: 109, target: 140 },
  ];

  // Specimen Quality Funnel
  const sampleQualityData = [
    { name: 'Accepted', count: labSamples.filter(s => s.status !== 'rejected').length, fill: '#32D74B' },
    { name: 'Rejected', count: labSamples.filter(s => s.status === 'rejected' || s.status === 'recollection_required').length, fill: '#FF453A' },
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Service Analytics & Turnaround Time (TAT)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Diagnostic test volume by department, pre-analytical TAT benchmarks, sample quality funnels, and critical incident ratios
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
          <div className="stat-value">1.8 Hrs</div>
          <div className="stat-label">Average Hospital Lab TAT</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {Math.round(((kpis.reportsVerified) / (kpis.totalOrdersToday || 1)) * 100)}%
          </div>
          <div className="stat-label">Verification Fulfillment Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <FlaskConical size={20} />
          </div>
          <div className="stat-value">{labOrders.reduce((sum, o) => sum + o.items.length, 0)}</div>
          <div className="stat-label">Total Test Parameters Run</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalResultsCount}</div>
          <div className="stat-label">Critical Value Incidents</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Test Volume Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Test Volume by Diagnostic Discipline</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="tests" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Investigations" />
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
                <Bar dataKey="minutes" fill="#32D74B" radius={[4, 4, 0, 0]} name="Actual TAT (mins)" />
                <Bar dataKey="target" fill="rgba(255, 159, 10, 0.4)" radius={[4, 4, 0, 0]} name="NABL Target (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
