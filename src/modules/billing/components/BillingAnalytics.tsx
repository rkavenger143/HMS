import React from 'react';
import { BarChart3, TrendingUp, DollarSign, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

export default function BillingAnalytics() {
  const { kpis, departmentCharges, payments } = useBilling();

  const deptData = [
    { name: 'OPD', revenue: kpis.opdRevenue },
    { name: 'IPD & Bed', revenue: kpis.ipdRevenue },
    { name: 'Laboratory', revenue: kpis.labRevenue },
    { name: 'Radiology', revenue: kpis.radRevenue },
    { name: 'Pharmacy', revenue: kpis.pharmacyRevenue },
    { name: 'Emergency', revenue: kpis.otherRevenue },
  ];

  const tenderData = [
    { name: 'UPI / QR', value: kpis.upiCollection || 35000 },
    { name: 'Card POS', value: kpis.cardCollection || 45000 },
    { name: 'Cash', value: kpis.cashCollection || 25000 },
    { name: 'Insurance TPA', value: kpis.insuranceClaimsAmount || 30000 },
  ];

  const weeklyTrendData = [
    { day: 'Mon', billed: 120000, collected: 115000 },
    { day: 'Tue', billed: 145000, collected: 140000 },
    { day: 'Wed', billed: 168000, collected: 160000 },
    { day: 'Thu', billed: 152000, collected: 148000 },
    { day: 'Fri', billed: 185000, collected: 178000 },
    { day: 'Sat', billed: 195000, collected: 190000 },
    { day: 'Sun', billed: 110000, collected: 105000 },
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Financial Performance & Revenue Analytics</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Department revenue share, collection realization velocity, tender distribution, and outstanding ageing
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>98.4%</div>
          <div className="stat-label">Collection Realization Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-value">₹10,75,000</div>
          <div className="stat-label">Weekly Realized Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-ai-muted)', color: 'var(--color-ai)' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value">100%</div>
          <div className="stat-label">Audit Reconciliation Match</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Weekly Billed vs Collected */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daily Billed Revenue vs Collections (₹)</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="billed" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Billed Charges (₹)" />
                <Bar dataKey="collected" fill="#30D158" radius={[4, 4, 0, 0]} name="Realized Collections (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Revenue Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Department Revenue Contribution (₹)</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#BF5AF2" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
