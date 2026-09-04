import React, { useState } from 'react';
import { Search, X, ReceiptText, ArrowRight, CreditCard, User, DollarSign } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DEMO_PATIENTS } from '../../../data/seedData';

interface BillingSearchModalProps {
  onClose: () => void;
}

export default function BillingSearchModal({ onClose }: BillingSearchModalProps) {
  const { invoices, payments, advances, setSelectedInvoiceId, setSelectedPatientId, setActiveTab } = useBilling();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedInvoices = query.length >= 2 ? invoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(q) ||
    i.patientName.toLowerCase().includes(q) ||
    i.uhid.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedPayments = query.length >= 2 ? payments.filter(p =>
    p.receiptNumber.toLowerCase().includes(q) ||
    p.patientName.toLowerCase().includes(q) ||
    p.patientId.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedPatients = query.length >= 2 ? DEMO_PATIENTS.filter(p =>
    p.firstName.toLowerCase().includes(q) ||
    p.lastName.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.phone.includes(q)
  ).slice(0, 3) : [];

  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    setActiveTab('invoices');
    onClose();
  };

  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    setActiveTab('workspace');
    onClose();
  };

  const handleSelectPayment = (payId: string) => {
    setActiveTab('payments');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Financial & Billing Quick Search</span>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              autoFocus
              className="form-input"
              placeholder="Search Invoice #, Receipt #, Patient Name, UHID, Phone..."
              style={{ paddingLeft: 36, height: 42, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {query.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Matched Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Invoices ({matchedInvoices.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedInvoices.map(inv => (
                      <div
                        key={inv.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectInvoice(inv.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                            {inv.invoiceNumber} — {inv.patientName} ({inv.uhid})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Gross: ₹{inv.grossAmount} · Due: <strong>₹{inv.outstandingBalance}</strong> · Status: {inv.status.toUpperCase()}
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Patients */}
              {matchedPatients.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Patient Accounts ({matchedPatients.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedPatients.map(p => (
                      <div
                        key={p.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectPatient(p.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {p.firstName} {p.lastName} — {p.id}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Phone: {p.phone} · Gender: {p.gender?.toUpperCase()}
                          </div>
                        </div>
                        <span className="badge badge-primary">OPEN LEDGER</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Payments */}
              {matchedPayments.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Receipts ({matchedPayments.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedPayments.map(pay => (
                      <div
                        key={pay.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectPayment(pay.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-success)' }}>
                            {pay.receiptNumber} — ₹{pay.amount} ({pay.paymentMethod.toUpperCase()})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Patient: {pay.patientName} · Cashier: {pay.receivedBy}
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-success)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedInvoices.length === 0 && matchedPatients.length === 0 && matchedPayments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching billing records found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search invoices, patients, receipts, and claims.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
