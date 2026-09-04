import React, { useMemo } from 'react';
import {
  DollarSign, Receipt, CreditCard, AlertCircle, CheckCircle2,
  TrendingUp, Download, Printer, Filter, PieChart as PieIcon, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function BillingReports() {
  const { invoices, patients, filters, exportCSV } = useReports();

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (list.length === 0) {
      // Fallback demo billing records
      list = [
        { id: 'INV-2026-001', patientId: 'p-1', patientName: 'John Doe', department: 'Cardiology', date: '2026-03-01', totalAmount: 12500, discount: 500, tax: 600, netPayable: 12600, paidAmount: 12600, status: 'paid' },
        { id: 'INV-2026-002', patientId: 'p-2', patientName: 'Jane Smith', department: 'Orthopedics', date: '2026-03-01', totalAmount: 45000, discount: 2000, tax: 2150, netPayable: 45150, paidAmount: 30000, status: 'partial' },
        { id: 'INV-2026-003', patientId: 'p-3', patientName: 'Robert Johnson', department: 'General Medicine', date: '2026-03-02', totalAmount: 3200, discount: 0, tax: 160, netPayable: 3360, paidAmount: 3360, status: 'paid' },
        { id: 'INV-2026-004', patientId: 'p-4', patientName: 'Emily Davis', department: 'Pediatrics', date: '2026-03-02', totalAmount: 8500, discount: 500, tax: 400, netPayable: 8400, paidAmount: 0, status: 'unpaid' },
        { id: 'INV-2026-005', patientId: 'p-5', patientName: 'Michael Brown', department: 'Neurology', date: '2026-03-03', totalAmount: 68000, discount: 5000, tax: 3150, netPayable: 66150, paidAmount: 66150, status: 'paid' },
        { id: 'INV-2026-006', patientId: 'p-6', patientName: 'Sarah Wilson', department: 'Gynecology', date: '2026-03-03', totalAmount: 19500, discount: 1000, tax: 925, netPayable: 19425, paidAmount: 10000, status: 'partial' },
        { id: 'INV-2026-007', patientId: 'p-7', patientName: 'David Taylor', department: 'Emergency', date: '2026-03-04', totalAmount: 14200, discount: 0, tax: 710, netPayable: 14910, paidAmount: 14910, status: 'paid' },
        { id: 'INV-2026-008', patientId: 'p-8', patientName: 'James Miller', department: 'Oncology', date: '2026-03-04', totalAmount: 92000, discount: 7000, tax: 4250, netPayable: 89250, paidAmount: 89250, status: 'paid' },
      ];
    }

    return list.filter(inv => {
      // Date filter
      const invDate = inv.date || inv.createdAt?.slice(0, 10) || '2026-03-01';
      if (filters.startDate && invDate < filters.startDate) return false;
      if (filters.endDate && invDate > filters.endDate) return false;

      // Department
      if (filters.department !== 'ALL' && inv.department && inv.department !== filters.department) {
        return false;
      }

      // Status
      if (filters.status !== 'ALL' && inv.status && inv.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Search
      if (filters.patientSearch) {
        const q = filters.patientSearch.toLowerCase();
        const pName = (inv.patientName || '').toLowerCase();
        const invId = (inv.id || inv.invoiceNumber || '').toLowerCase();
        if (!pName.includes(q) && !invId.includes(q)) return false;
      }

      return true;
    });
  }, [invoices, filters]);

  // Aggregate metrics
  const totalGross = filteredInvoices.reduce((acc, i) => acc + (Number(i.totalAmount) || Number(i.subtotal) || 0), 0);
  const totalDiscount = filteredInvoices.reduce((acc, i) => acc + (Number(i.discount) || 0), 0);
  const totalTax = filteredInvoices.reduce((acc, i) => acc + (Number(i.tax) || 0), 0);
  const totalNet = filteredInvoices.reduce((acc, i) => acc + (Number(i.netPayable) || Number(i.netAmount) || Number(i.totalAmount) || 0), 0);
  const totalCollected = filteredInvoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalNet - totalCollected);

  // Status breakdown for Pie Chart
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Paid: 0, Partial: 0, Unpaid: 0 };
    filteredInvoices.forEach(i => {
      const s = (i.status || 'unpaid').toLowerCase();
      if (s === 'paid') counts.Paid += 1;
      else if (s === 'partial') counts.Partial += 1;
      else counts.Unpaid += 1;
    });

    return [
      { name: 'Fully Paid', value: counts.Paid, color: 'var(--color-primary)' },
      { name: 'Partial Paid', value: counts.Partial, color: '#f59e0b' },
      { name: 'Pending / Unpaid', value: counts.Unpaid, color: '#ef4444' },
    ];
  }, [filteredInvoices]);

  // Department revenue for Bar Chart
  const deptBillingData = useMemo(() => {
    const map: Record<string, { gross: number; net: number; collected: number }> = {};

    filteredInvoices.forEach(i => {
      const dept = i.department || 'General';
      if (!map[dept]) map[dept] = { gross: 0, net: 0, collected: 0 };
      map[dept].gross += Number(i.totalAmount || i.subtotal || 0);
      map[dept].net += Number(i.netPayable || i.netAmount || i.totalAmount || 0);
      map[dept].collected += Number(i.paidAmount || 0);
    });

    return Object.entries(map).map(([department, data]) => ({
      department,
      gross: data.gross,
      net: data.net,
      collected: data.collected,
    }));
  }, [filteredInvoices]);

  const handleExportCSV = () => {
    const rows = filteredInvoices.map(inv => [
      inv.id || inv.invoiceNumber,
      inv.patientName || 'Walk-in Patient',
      inv.department || 'General',
      inv.date || inv.createdAt?.slice(0, 10) || '2026-03-01',
      `₹${inv.totalAmount || inv.subtotal || 0}`,
      `₹${inv.discount || 0}`,
      `₹${inv.tax || 0}`,
      `₹${inv.netPayable || inv.netAmount || inv.totalAmount || 0}`,
      `₹${inv.paidAmount || 0}`,
      `₹${Math.max(0, (inv.netPayable || inv.totalAmount || 0) - (inv.paidAmount || 0))}`,
      (inv.status || 'unpaid').toUpperCase(),
    ]);

    exportCSV(
      'HMS_Central_Billing_Revenue_Report',
      ['Invoice ID', 'Patient Name', 'Department', 'Invoice Date', 'Gross Amount', 'Discount', 'Tax', 'Net Payable', 'Paid Amount', 'Outstanding Balance', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Central Billing, Revenue & Invoicing Ledger Report"
        onExportCSV={handleExportCSV}
        showStatusFilter={true}
        statusOptions={[
          { label: 'All Invoices', value: 'ALL' },
          { label: 'Paid Invoices', value: 'paid' },
          { label: 'Partial Invoices', value: 'partial' },
          { label: 'Unpaid / Pending', value: 'unpaid' },
        ]}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Gross Billed Value</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            ₹{totalNet.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Net Realizable Billing</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Cash Collections</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Outstanding Balances</div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Department Revenue Comparison */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Department-wise Net vs Collected Billing</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBillingData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
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
                <Bar dataKey="net" name="Net Billed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Invoice Settlement Status Distribution</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Billing Ledger & Invoicing Register</span>
          <span className="badge badge-primary">{filteredInvoices.length} Invoices</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Gross (₹)</th>
                  <th>Discount (₹)</th>
                  <th>Net (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Due (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, idx) => {
                  const gross = Number(inv.totalAmount || inv.subtotal || 0);
                  const disc = Number(inv.discount || 0);
                  const net = Number(inv.netPayable || inv.netAmount || gross);
                  const paid = Number(inv.paidAmount || 0);
                  const due = Math.max(0, net - paid);
                  const status = (inv.status || 'unpaid').toLowerCase();

                  return (
                    <tr key={inv.id || idx}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {inv.id || inv.invoiceNumber || `INV-${1000 + idx}`}
                        </strong>
                      </td>
                      <td>
                        <strong>{inv.patientName || 'Walk-in Patient'}</strong>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{inv.patientId}</div>
                      </td>
                      <td>{inv.department || 'General'}</td>
                      <td>{inv.date || inv.createdAt?.slice(0, 10) || '2026-03-01'}</td>
                      <td>₹{gross.toLocaleString('en-IN')}</td>
                      <td style={{ color: disc > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                        {disc > 0 ? `-₹${disc.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td><strong>₹{net.toLocaleString('en-IN')}</strong></td>
                      <td style={{ color: 'var(--color-primary)' }}><strong>₹{paid.toLocaleString('en-IN')}</strong></td>
                      <td>
                        <strong style={{ color: due > 0 ? 'var(--color-danger)' : 'var(--text-tertiary)' }}>
                          ₹{due.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${status === 'paid' ? 'badge-success' : status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
