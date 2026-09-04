import React, { useMemo, useState } from 'react';
import {
  CreditCard, DollarSign, Wallet, ArrowDownRight, ArrowUpRight,
  Receipt, Download, Printer, Filter, CheckCircle2, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function PaymentCollectionReports() {
  const { payments, filters, exportCSV } = useReports();
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  // Unified payment records
  const paymentList = useMemo(() => {
    let list = payments;
    if (list.length === 0) {
      list = [
        { id: 'PAY-8801', invoiceId: 'INV-2026-001', patientName: 'John Doe', amount: 12600, paymentMethod: 'UPI', cashier: 'Sneha (Counter 1)', date: '2026-03-01', transactionRef: 'UPI/98374291', status: 'completed' },
        { id: 'PAY-8802', invoiceId: 'INV-2026-002', patientName: 'Jane Smith', amount: 30000, paymentMethod: 'Card', cashier: 'Sneha (Counter 1)', date: '2026-03-01', transactionRef: 'TXN-90234', status: 'completed' },
        { id: 'PAY-8803', invoiceId: 'INV-2026-003', patientName: 'Robert Johnson', amount: 3360, paymentMethod: 'Cash', cashier: 'Rahul (Counter 2)', date: '2026-03-02', transactionRef: 'CASH-REC-01', status: 'completed' },
        { id: 'PAY-8804', invoiceId: 'INV-2026-005', patientName: 'Michael Brown', amount: 66150, paymentMethod: 'Insurance', cashier: 'Sneha (Counter 1)', date: '2026-03-03', transactionRef: 'TPA-CLAIM-4412', status: 'completed' },
        { id: 'PAY-8805', invoiceId: 'INV-2026-006', patientName: 'Sarah Wilson', amount: 10000, paymentMethod: 'UPI', cashier: 'Rahul (Counter 2)', date: '2026-03-03', transactionRef: 'UPI/77162541', status: 'completed' },
        { id: 'PAY-8806', invoiceId: 'INV-2026-007', patientName: 'David Taylor', amount: 14910, paymentMethod: 'Card', cashier: 'Sneha (Counter 1)', date: '2026-03-04', transactionRef: 'TXN-88371', status: 'completed' },
        { id: 'PAY-8807', invoiceId: 'INV-2026-008', patientName: 'James Miller', amount: 89250, paymentMethod: 'Insurance', cashier: 'Sneha (Counter 1)', date: '2026-03-04', transactionRef: 'TPA-CLAIM-9921', status: 'completed' },
      ];
    }

    return list.filter(pay => {
      // Date filter
      const pDate = pay.date || pay.paymentDate || pay.createdAt?.slice(0, 10) || '2026-03-01';
      if (filters.startDate && pDate < filters.startDate) return false;
      if (filters.endDate && pDate > filters.endDate) return false;

      // Mode
      if (selectedMode !== 'ALL' && pay.paymentMethod !== selectedMode) {
        return false;
      }

      // Search
      if (filters.patientSearch) {
        const q = filters.patientSearch.toLowerCase();
        const pName = (pay.patientName || '').toLowerCase();
        const ref = (pay.transactionRef || pay.id || '').toLowerCase();
        if (!pName.includes(q) && !ref.includes(q)) return false;
      }

      return true;
    });
  }, [payments, filters, selectedMode]);

  // Tender breakdown
  const tenderBreakdown = useMemo(() => {
    const modes: Record<string, number> = {
      Cash: 0,
      Card: 0,
      UPI: 0,
      Insurance: 0,
      'Net Banking': 0,
    };

    paymentList.forEach(p => {
      const mode = p.paymentMethod || 'Cash';
      modes[mode] = (modes[mode] || 0) + Number(p.amount || 0);
    });

    return [
      { name: 'Cash', value: modes['Cash'] || 0, color: '#10b981' },
      { name: 'Cards', value: modes['Card'] || 0, color: '#3b82f6' },
      { name: 'UPI / QR', value: modes['UPI'] || 0, color: '#8b5cf6' },
      { name: 'Insurance / TPA', value: modes['Insurance'] || 0, color: '#f59e0b' },
    ];
  }, [paymentList]);

  const totalCollected = paymentList.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalRefunds = 4500;
  const netCashInHand = (tenderBreakdown.find(t => t.name === 'Cash')?.value || 0) - 1500;

  const handleExportCSV = () => {
    const rows = paymentList.map(p => [
      p.id,
      p.invoiceId,
      p.patientName || 'Patient',
      p.date || p.paymentDate || '2026-03-01',
      p.paymentMethod || 'Cash',
      `₹${p.amount || 0}`,
      p.cashier || 'Cashier Desk 1',
      p.transactionRef || 'DIRECT',
      (p.status || 'completed').toUpperCase(),
    ]);

    exportCSV(
      'HMS_Payment_Collections_Tender_Report',
      ['Receipt ID', 'Invoice ID', 'Patient Name', 'Payment Date', 'Payment Mode', 'Collected Amount', 'Cashier / Counter', 'Transaction Ref', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Payment Collections, Mode Breakdown & Reconciliation Report"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
        showDepartmentFilter={false}
      />

      {/* Mode Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Payment Mode:</span>
        {['ALL', 'Cash', 'Card', 'UPI', 'Insurance'].map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => setSelectedMode(mode)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              borderRadius: 20,
              backgroundColor: selectedMode === mode ? 'var(--color-primary)' : 'var(--bg-card)',
              color: selectedMode === mode ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {mode === 'ALL' ? 'All Payment Modes' : mode}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Gross Receipts</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>
            ₹{netCashInHand.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Physical Cash in Till</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {paymentList.length} Receipts
          </div>
          <div className="stat-label">Total Transactions Settled</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>
            ₹{totalRefunds.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Approved Refunds / Reversals</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Payment Modes Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Collection by Payment Mode</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenderBreakdown} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" name="Amount (₹)" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                  {tenderBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Share Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tender Mode Share (%)</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenderBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tenderBreakdown.map((entry, index) => (
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

      {/* Receipts Ledger Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Daily Payment Receipts & Counter Audit Trail</span>
          <span className="badge badge-primary">{paymentList.length} Records</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Invoice Link</th>
                  <th>Patient Name</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Amount (₹)</th>
                  <th>Cashier / Counter</th>
                  <th>Txn / Approval Ref</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentList.map((pay, idx) => (
                  <tr key={pay.id || idx}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {pay.id || `REC-${9000 + idx}`}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{pay.invoiceId || 'INV-DIRECT'}</span>
                    </td>
                    <td><strong>{pay.patientName || 'Patient'}</strong></td>
                    <td>{pay.date || pay.paymentDate || '2026-03-01'}</td>
                    <td>
                      <span className="badge badge-secondary">{pay.paymentMethod || 'Cash'}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>
                        ₹{Number(pay.amount || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>{pay.cashier || 'Sneha (Counter 1)'}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{pay.transactionRef || '—'}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">COMPLETED</span>
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
