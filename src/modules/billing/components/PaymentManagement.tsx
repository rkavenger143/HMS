import React, { useState } from 'react';
import { CreditCard, Search, Filter, Printer, Download, CheckCircle2, DollarSign } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import PrintPaymentReceiptModal from './modals/PrintPaymentReceiptModal';
import type { BillingPaymentRecord } from '../../../types';

export default function PaymentManagement() {
  const { payments } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [printPayment, setPrintPayment] = useState<BillingPaymentRecord | null>(null);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.receiptNumber.toLowerCase().includes(q) ||
      p.invoiceId.toLowerCase().includes(q) ||
      p.patientName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
      p.receivedBy.toLowerCase().includes(q);

    const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Invoice #', 'Patient Name', 'UHID', 'Amount (₹)', 'Payment Method', 'Reference', 'Timestamp', 'Cashier', 'Counter'];
    const rows = filtered.map(p => [
      p.receiptNumber,
      p.invoiceId,
      `"${p.patientName}"`,
      p.patientId,
      p.amount,
      p.paymentMethod,
      `"${p.transactionRef || ''}"`,
      p.paymentDate,
      `"${p.receivedBy}"`,
      `"${p.counterName || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `payments_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Central Payment Transactions & Realized Collections Ledger</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Multi-tender settlement journal across Cash, Card POS, UPI QR codes, Bank NEFT, and Insurance TPA
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Payments Realized:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-success)' }}>₹{totalCollected.toLocaleString()}</strong>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
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
              placeholder="Search Receipt #, Invoice #, Patient, Txn Ref..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
            <option value="ALL">All Payment Methods ({payments.length})</option>
            <option value="upi">UPI / QR Codes</option>
            <option value="cash">Cash Currency</option>
            <option value="card">Credit / Debit Card</option>
            <option value="net_banking">Net Banking / NEFT</option>
            <option value="cheque">Cheque / DD</option>
            <option value="insurance">Insurance / TPA</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt # & Timestamp</th>
                  <th>Invoice Ref</th>
                  <th>Patient Name & UHID</th>
                  <th>Payment Tender</th>
                  <th>Transaction Reference</th>
                  <th>Amount Received (₹)</th>
                  <th>Cashier & Counter</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Slip</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{p.receiptNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.paymentDate}</div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{p.invoiceId}</span>
                    </td>

                    <td>
                      <strong>{p.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.patientId}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 11, fontFamily: 'monospace' }}>{p.transactionRef || 'DIRECT TENDER'}</div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-success)', fontSize: 14 }}>
                        ₹{p.amount.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{p.receivedBy}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.counterName || 'Main Counter'}</div>
                    </td>

                    <td>
                      <span className="badge badge-success">SUCCESSFUL</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setPrintPayment(p)}>
                        <Printer size={11} /> Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Thermal Receipt Modal */}
      {printPayment && (
        <PrintPaymentReceiptModal payment={printPayment} onClose={() => setPrintPayment(null)} />
      )}
    </div>
  );
}
