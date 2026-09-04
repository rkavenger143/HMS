import React from 'react';
import { BarChart3, UtensilsCrossed, Users, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const COLORS = ['#0A84FF', '#32D74B', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

export default function DietAnalytics() {
  const { kpis, dietCharts, mealDeliveries, npoPatients } = useDiet();

  const activeCharts = dietCharts.filter(c => c.status === 'active' || c.status === 'approved');

  // Diet Type Distribution
  const dietTypeMap: Record<string, number> = {};
  activeCharts.forEach(c => {
    const type = c.dietType.replace('_', ' ').toUpperCase();
    dietTypeMap[type] = (dietTypeMap[type] || 0) + 1;
  });

  const dietTypeData = Object.keys(dietTypeMap).map(type => ({
    name: type,
    count: dietTypeMap[type],
  }));

  // Meal Status Funnel
  const mealStatusData = [
    { name: 'Served', count: kpis.mealsServed || 4, fill: '#32D74B' },
    { name: 'Pending / Prep', count: kpis.mealsPending || 2, fill: '#0A84FF' },
    { name: 'Refused / NPO', count: kpis.mealsCancelled || 1, fill: '#FF453A' },
  ];

  // Caloric Distribution
  const caloricTrendData = [
    { range: '<1500 kcal', count: 2 },
    { range: '1500-1800 kcal', count: 4 },
    { range: '1800-2200 kcal', count: 3 },
    { range: '>2200 kcal', count: 1 },
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Dietetics & Nutrition Service Analytics</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Diet type distributions, meal delivery completion metrics, NPO fasting audits, and caloric variance
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className="stat-value">{kpis.patientsWithDiet} / {kpis.totalInpatients}</div>
          <div className="stat-label">Inpatient Diet Chart Coverage</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Truck size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {Math.round(((kpis.mealsServed || 4) / ((kpis.mealsServed + kpis.mealsPending) || 5)) * 100)}%
          </div>
          <div className="stat-label">Meal Delivery Fulfillment Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <UtensilsCrossed size={20} />
          </div>
          <div className="stat-value">{kpis.specialDietCount}</div>
          <div className="stat-label">Therapeutic / Special Diets</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.allergyCount}</div>
          <div className="stat-label">Patients with Food Allergies</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Diet Types Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Inpatient Diet Type Distribution</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dietTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Active Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Delivery Status Bar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Meal Delivery Status</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Meal Trays" fill="#32D74B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Caloric Distribution */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Prescribed Daily Caloric Intake Range</span>
          </div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloricTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="range" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#FF9F0A" radius={[4, 4, 0, 0]} name="Patient Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
