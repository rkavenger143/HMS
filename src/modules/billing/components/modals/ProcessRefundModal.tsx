import React, { useState } from 'react';
import { Undo2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import type { CentralInvoiceItem, PaymentTender } from '../../../../types';

interface ProcessRefundModalProps {
  invoice: CentralInvoiceItem;
  onClose: () => void;
}

export default function ProcessRefundModal({ invoice, onClose }: ProcessRefundModalProps) {
  const { processRefund } = useBilling();

  const [amount, setAmount] = useState(Math.min(500, invoice.paidAmount || 500));
  const [reason, setReason] = useState('Cancelled diagnostic investigation / consultation requested in error');
  const [refundMethod, setRefundMethod] = useState<PaymentTender>('upi');
  const [requestedBy, setRequestedBy] = useState('Dr. Rajesh Sharma');
  const [approvedBy, setApprovedBy] = useState('Dr. Anil Mehta (Medical Superintendent)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Refund amount must be greater than zero.');
      return;
    }
    if (amount > invoice.paidAmount) {
      alert(`Refund amount (₹${amount}) cannot exceed total paid amount (₹${invoice.paidAmount}).`);
      return;
    }

    processRefund({
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: Number(amount),
      reason,
      refundMethod,
      requestedBy,
      approvedBy,
      processedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'processed',
    });

    alert(`Refund of ₹${amount} disbursed to ${invoice.patientName}.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <Undo2 size={18} style={{ color: 'var(--color-danger)' }} />
          <div>
            <div className="modal-title">Disburse Patient Refund: {invoice.invoiceNumber}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Patient: {invoice.patientName} ({invoice.uhid})</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Payment Summary */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Invoice Gross:</span>
                <div style={{ fontWeight: 700 }}>₹{invoice.grossAmount.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Total Paid to Date:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{invoice.paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Max Refundable:</span>
                <div style={{ fontWeight: 800, color: 'var(--color-danger)' }}>₹{invoice.paidAmount.toFixed(2)}</div>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Refund Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={invoice.paidAmount}
                  className="form-input"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Refund Tender <span className="required">*</span></label>
                <select className="form-select" value={refundMethod} onChange={e => setRefundMethod(e.target.value as any)}>
                  <option value="upi">UPI Reversal / IMPS</option>
                  <option value="cash">Cash Refund</option>
                  <option value="card">Card Reversal (Original Payment)</option>
                  <option value="net_banking">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reason for Refund & Clinical Justification <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requested By Doctor / Nurse</label>
                <input
                  type="text"
                  className="form-input"
                  value={requestedBy}
                  onChange={e => setRequestedBy(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Approving Authority (Admin/Superintendent)</label>
                <input
                  type="text"
                  className="form-input"
                  value={approvedBy}
                  onChange={e => setApprovedBy(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-sm">
              <CheckCircle2 size={13} /> Authorize & Disburse Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
