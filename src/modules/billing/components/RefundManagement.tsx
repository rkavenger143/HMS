import React, { useState } from 'react';
import { Undo2, Search, Filter, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

export default function RefundManagement() {
  const { refunds } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

  const filtered = refunds.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.refundNumber.toLowerCase().includes(q) ||
      r.invoiceId.toLowerCase().includes(q) ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q);

    const matchesMethod = selectedMethod === 'ALL' || r.refundMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Undo2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient Refunds & Credit Note Disbursement Audit</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Authorized refunds for cancelled diagnostic procedures, pharmacy returns, and clinical billing adjustments
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Refunds Disbursed:</div>
          <strong style={{ fontSize: 16, color: 'var(--color-danger)' }}>₹{totalRefunded.toLocaleString()}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Refund #, Invoice, Patient, Reason..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
            <option value="ALL">All Refund Tenders</option>
            <option value="upi">UPI Reversal</option>
            <option value="cash">Cash Refund</option>
            <option value="card">Card Reversal</option>
            <option value="net_banking">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Refund # & Timestamp</th>
                  <th>Invoice Ref</th>
                  <th>Patient Name & UHID</th>
                  <th>Refund Amount (₹)</th>
                  <th>Tender</th>
                  <th>Reason & Clinical Justification</th>
                  <th>Requested By</th>
                  <th>Approved Authority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ color: 'var(--color-danger)', fontSize: 13 }}>{r.refundNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.processedAt}</div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{r.invoiceId}</span>
                    </td>

                    <td>
                      <strong>{r.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.patientId}</div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-danger)', fontSize: 14 }}>
                        ₹{r.amount.toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                        {r.refundMethod}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{r.reason}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{r.requestedBy}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>
                        {r.approvedBy}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-success">PROCESSED</span>
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
