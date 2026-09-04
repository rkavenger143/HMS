import React, { useState } from 'react';
import { CreditCard, CheckCircle2, DollarSign, X } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import type { CentralInvoiceItem, PaymentTender } from '../../../../types';

interface RecordPaymentModalProps {
  invoice: CentralInvoiceItem;
  onClose: () => void;
  onSuccess?: (payment: any) => void;
}

export default function RecordPaymentModal({ invoice, onClose, onSuccess }: RecordPaymentModalProps) {
  const { recordPayment } = useBilling();

  const [amount, setAmount] = useState(invoice.outstandingBalance);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTender>('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [receivedBy, setReceivedBy] = useState('Ananya Deshmukh (Cashier)');
  const [counterName, setCounterName] = useState('Main OPD Cash Counter 1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    if (amount > invoice.outstandingBalance) {
      if (!confirm(`Amount entered (₹${amount}) is higher than outstanding balance (₹${invoice.outstandingBalance}). Proceed with overpayment/advance adjustment?`)) {
        return;
      }
    }

    const newPayment = recordPayment({
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: Number(amount),
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      receivedBy,
      status: 'successful',
      counterName,
    });

    if (onSuccess) {
      onSuccess(newPayment);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Payment for Invoice: {invoice.invoiceNumber}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Patient: {invoice.patientName} ({invoice.uhid})</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Invoice Balances Summary */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Net Payable:</span>
                <div style={{ fontWeight: 700 }}>₹{invoice.netPayable.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Total Paid:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{invoice.paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Current Due:</span>
                <div style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 14 }}>
                  ₹{invoice.outstandingBalance.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={invoice.outstandingBalance * 2}
                  className="form-input"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Tender / Mode <span className="required">*</span></label>
                <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                  <option value="upi">UPI / QR Code (GooglePay / PhonePe / Paytm)</option>
                  <option value="cash">Cash Tender</option>
                  <option value="card">Credit / Debit Card POS</option>
                  <option value="net_banking">Net Banking / NEFT / RTGS</option>
                  <option value="cheque">Demand Draft / Bank Cheque</option>
                  <option value="insurance">Insurance / TPA Claim Payment</option>
                  <option value="corporate">Corporate / Institutional Credit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference (UTR / Auth Code / Cheque #)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UPI/9812481921/HDFC or POS-AUTH-9912"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cash Counter</label>
                <select className="form-select" value={counterName} onChange={e => setCounterName(e.target.value)}>
                  <option value="Main OPD Cash Counter 1">Main OPD Cash Counter 1</option>
                  <option value="Main OPD Cash Counter 2">Main OPD Cash Counter 2</option>
                  <option value="IPD Discharge Billing Counter">IPD Discharge Billing Counter</option>
                  <option value="Emergency 24x7 Billing Desk">Emergency 24x7 Billing Desk</option>
                  <option value="Pharmacy Cash Counter">Pharmacy Cash Counter</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Received By Cashier</label>
                <input
                  type="text"
                  className="form-input"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Record Payment & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
