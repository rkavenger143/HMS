import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, ShieldCheck, Clock } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

export default function PharmacyAnalytics() {
  const { kpis, medicines, batches, sales } = usePharmacy();

  // Category counts
  const categoryCounts: Record<string, number> = {};
  medicines.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + m.totalStock;
  });

  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
    stock: categoryCounts[cat],
  }));

  // Sales Trend Mock
  const weeklySalesData = [
    { day: 'Mon', sales: 42000, purchase: 35000 },
    { day: 'Tue', sales: 51000, purchase: 18000 },
    { day: 'Wed', sales: 68000, purchase: 45000 },
    { day: 'Thu', sales: 59000, purchase: 22000 },
    { day: 'Fri', sales: 74000, purchase: 60000 },
    { day: 'Sat', sales: 82000, purchase: 15000 },
    { day: 'Sun', sales: 49000, purchase: 10000 },
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Operational Analytics & Financial Performance</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Sales revenues, inventory turnover rates, therapeutic category consumption, and procurement benchmarks
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            ₹4,25,000
          </div>
          <div className="stat-label">Weekly Pharmacy Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Package size={20} />
          </div>
          <div className="stat-value">4.8x</div>
          <div className="stat-label">Inventory Turnover Ratio</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-value">3.2 Mins</div>
          <div className="stat-label">Average Dispensing Time</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value">99.8%</div>
          <div className="stat-label">FEFO Accuracy Score</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Weekly Sales vs Purchases */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daily Sales vs Procurement Spend (₹)</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="sales" fill="#32D74B" radius={[4, 4, 0, 0]} name="Sales Revenue (₹)" />
                <Bar dataKey="purchase" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Purchases (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Inventory Stock by Therapeutic Category</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="stock" fill="#BF5AF2" radius={[4, 4, 0, 0]} name="Units in Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
