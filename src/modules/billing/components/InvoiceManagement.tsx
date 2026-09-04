import React, { useState } from 'react';
import { ReceiptText, Search, Filter, Printer, CreditCard, Undo2, Plus, Eye } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import PrintInvoiceModal from './modals/PrintInvoiceModal';
import RecordPaymentModal from './modals/RecordPaymentModal';
import ProcessRefundModal from './modals/ProcessRefundModal';
import type { CentralInvoiceItem } from '../../../types';

export default function InvoiceManagement() {
  const { invoices, selectedInvoiceId, setSelectedInvoiceId } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEncounter, setSelectedEncounter] = useState('ALL');

  // Modals
  const [printInvoice, setPrintInvoice] = useState<CentralInvoiceItem | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<CentralInvoiceItem | null>(null);
  const [refundInvoice, setRefundInvoice] = useState<CentralInvoiceItem | null>(null);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.uhid.toLowerCase().includes(q) ||
      (inv.doctorName && inv.doctorName.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    const matchesEncounter = selectedEncounter === 'ALL' || inv.encounterType === selectedEncounter;

    return matchesSearch && matchesStatus && matchesEncounter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Invoices Directory & Tax Billing Register</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consolidated patient tax invoices, partial payments, advance adjustments, and insurance deductions
            </div>
          </div>
        </div>

        <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
          {invoices.length} Total Invoices
        </span>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Invoice #, Patient Name, UHID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Invoice Statuses</option>
            <option value="paid">Paid (Settled in Full)</option>
            <option value="partially_paid">Partially Paid (Balance Due)</option>
            <option value="generated">Generated (Unpaid)</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select className="form-select" value={selectedEncounter} onChange={e => setSelectedEncounter(e.target.value)}>
            <option value="ALL">All Encounters</option>
            <option value="opd">Outpatient (OPD)</option>
            <option value="ipd">Inpatient (IPD)</option>
            <option value="emergency">Emergency Casualty</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Encounter</th>
                  <th>Consultant / Dept</th>
                  <th>Gross Total (₹)</th>
                  <th>Advance / Ins</th>
                  <th>Net Payable (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Balance Due (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const isPaid = inv.status === 'paid';
                  const isPartial = inv.status === 'partially_paid';

                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{inv.invoiceNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.invoiceDate}</div>
                      </td>

                      <td>
                        <strong>{inv.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.uhid}</div>
                      </td>

                      <td>
                        <span className="badge badge-primary">{inv.encounterType.toUpperCase()}</span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{inv.doctorName || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.department}</div>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13 }}>₹{inv.grossAmount.toLocaleString()}</strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Adv: ₹{inv.advanceAdjusted} · Ins: ₹{inv.insuranceAmount}
                        </div>
                      </td>

                      <td>
                        <strong>₹{inv.netPayable.toLocaleString()}</strong>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-success)' }}>₹{inv.paidAmount.toLocaleString()}</strong>
                      </td>

                      <td>
                        <strong style={{ color: inv.outstandingBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: 14 }}>
                          ₹{inv.outstandingBalance.toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <span className={`badge ${isPaid ? 'badge-success' : isPartial ? 'badge-warning' : 'badge-danger'}`}>
                          {inv.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {inv.outstandingBalance > 0 && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => setPaymentInvoice(inv)}
                            >
                              <CreditCard size={11} /> Pay
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => setPrintInvoice(inv)}
                          >
                            <Printer size={11} /> Bill (A4)
                          </button>

                          {inv.paidAmount > 0 && (
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              title="Process Refund"
                              onClick={() => setRefundInvoice(inv)}
                            >
                              <Undo2 size={13} style={{ color: 'var(--color-danger)' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {printInvoice && (
        <PrintInvoiceModal invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}

      {paymentInvoice && (
        <RecordPaymentModal invoice={paymentInvoice} onClose={() => setPaymentInvoice(null)} />
      )}

      {refundInvoice && (
        <ProcessRefundModal invoice={refundInvoice} onClose={() => setRefundInvoice(null)} />
      )}
    </div>
  );
}
