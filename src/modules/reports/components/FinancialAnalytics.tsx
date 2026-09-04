import React, { useMemo } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, PieChart as PieIcon,
  ArrowUpRight, ArrowDownRight, Download, Printer, ShieldCheck, Wallet
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function FinancialAnalytics() {
  const { kpis, invoices, payments, exportCSV } = useReports();

  // Monthly Revenue Trend (6-month)
  const monthlyRevenueData = useMemo(() => [
    { month: 'Oct 2025', billing: 420000, collections: 395000, expenses: 280000 },
    { month: 'Nov 2025', billing: 460000, collections: 430000, expenses: 295000 },
    { month: 'Dec 2025', billing: 510000, collections: 480000, expenses: 320000 },
    { month: 'Jan 2026', billing: 490000, collections: 470000, expenses: 310000 },
    { month: 'Feb 2026', billing: 540000, collections: 515000, expenses: 330000 },
    { month: 'Mar 2026', billing: 580000, collections: 542000, expenses: 345000 },
  ], []);

  // Department Revenue Contribution
  const departmentRevenueData = useMemo(() => [
    { name: 'Inpatient (IPD)', value: 240000, color: 'var(--color-primary)' },
    { name: 'Outpatient (OPD)', value: 120000, color: '#3b82f6' },
    { name: 'Pharmacy Retail', value: 85000, color: '#10b981' },
    { name: 'Laboratory & Diagnostics', value: 65000, color: '#8b5cf6' },
    { name: 'Radiology Imaging', value: 45000, color: '#f59e0b' },
    { name: 'Blood Bank & Transfusion', value: 25000, color: '#ef4444' },
  ], []);

  // Accounts Receivable Aging
  const arAgingData = useMemo(() => [
    { bracket: '0-30 Days (Current)', amount: 48000, count: 14, color: '#10b981' },
    { bracket: '31-60 Days', amount: 22000, count: 6, color: '#3b82f6' },
    { bracket: '61-90 Days', amount: 12500, count: 3, color: '#f59e0b' },
    { bracket: '90+ Days (Overdue)', amount: 8200, count: 2, color: '#ef4444' },
  ], []);

  const totalBilling = departmentRevenueData.reduce((acc, d) => acc + d.value, 0);
  const totalCollections = 542000;
  const netOperatingMargin = 580000 - 345000;
  const marginPercentage = ((netOperatingMargin / 580000) * 100).toFixed(1);

  const handleExportCSV = () => {
    const rows = departmentRevenueData.map(d => [
      d.name,
      `₹${d.value}`,
      `${((d.value / totalBilling) * 100).toFixed(1)}%`,
    ]);

    exportCSV(
      'HMS_Financial_Revenue_Department_Report',
      ['Revenue Stream / Department', 'Gross Revenue (₹)', 'Share (%)'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Executive Financial Analytics, Revenue Trajectory & AR Aging"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            ₹{totalBilling.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Monthly Gross Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            ₹{totalCollections.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Realized Cash Collections</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            ₹{netOperatingMargin.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Net Operating Margin ({marginPercentage}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>
            ₹90,700
          </div>
          <div className="stat-label">Accounts Receivable (A/R)</div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* 6-Month Trajectory Area Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">6-Month Revenue, Collections & Expense Trajectory</span>
          </div>
          <div className="card-body" style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="billing" name="Gross Billing" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="collections" name="Collections" stroke="#0284c7" fill="#0284c7" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Revenue Share Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Department Revenue Contribution</span>
          </div>
          <div className="card-body" style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentRevenueData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AR Aging Analysis */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Accounts Receivable (A/R) Aging Matrix</span>
          <span className="badge badge-warning">₹90,700 Total Outstanding</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aging Interval</th>
                  <th>Outstanding Value (₹)</th>
                  <th>Invoice Count</th>
                  <th>Percentage of Total AR</th>
                  <th>Risk Acuity</th>
                </tr>
              </thead>
              <tbody>
                {arAgingData.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: item.color }}>{item.bracket}</strong>
                    </td>
                    <td>
                      <strong>₹{item.amount.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>{item.count} Invoices</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            backgroundColor: 'var(--border-color)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(item.amount / 90700) * 100}%`,
                              height: '100%',
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>
                          {((item.amount / 90700) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          idx === 0 ? 'badge-success' : idx === 1 ? 'badge-info' : idx === 2 ? 'badge-warning' : 'badge-danger'
                        }`}
                      >
                        {idx === 0 ? 'LOW RISK' : idx === 1 ? 'MODERATE' : idx === 2 ? 'ELEVATED' : 'CRITICAL OVERDUE'}
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
