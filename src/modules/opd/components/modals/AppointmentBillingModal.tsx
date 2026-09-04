import React, { useState } from 'react';
import { ReceiptText, X, CheckCircle2, IndianRupee, CreditCard, QrCode, Wallet, Building2, Printer } from 'lucide-react';
import type { Appointment } from '../../../../types';

interface AppointmentBillingModalProps {
  appointment: Appointment & { invoiceId?: string; receiptNumber?: string; billingStatus?: string };
  existingBill?: any;
  onClose: () => void;
  onPaymentComplete: (data: {
    invoiceId: string;
    receiptNumber: string;
    amount: number;
    paymentMode: 'cash' | 'card' | 'upi' | 'insurance';
    status: 'paid' | 'pending';
  }) => void;
}

export default function AppointmentBillingModal({
  appointment,
  existingBill,
  onClose,
  onPaymentComplete,
}: AppointmentBillingModalProps) {
  const isAlreadyBilled = existingBill || appointment.invoiceId || appointment.billingStatus === 'paid';

  const [fee, setFee] = useState(appointment.consultationFee || 600);
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'insurance'>('cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const subtotal = fee - discount;
  const taxAmount = (subtotal * taxPercent) / 100;
  const netTotal = Math.max(0, subtotal + taxAmount);

  const handleProcessPayment = (payNow: boolean) => {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-2026-${seq}`;
    const receiptNumber = payNow ? `RCPT-2026-${seq}` : '';

    const payload = {
      invoiceId,
      receiptNumber,
      amount: netTotal,
      paymentMode,
      status: payNow ? ('paid' as const) : ('pending' as const),
    };

    setReceiptData({
      ...payload,
      patientName: appointment.patientName,
      patientId: appointment.patientId,
      doctorName: appointment.doctorName,
      department: appointment.department,
      date: appointment.date,
      time: appointment.time,
      fee,
      discount,
      netTotal,
    });

    setIsSuccess(true);
    onPaymentComplete(payload);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptText size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16 }}>Central Billing — Appointment Checkout</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                OPD Consultation Fee Collection & Unified Central Receipt Generation
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {isAlreadyBilled && !isSuccess ? (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <ReceiptText size={30} />
            </div>

            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                Billing Already Created for this Appointment
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                A billing transaction already exists in Central Billing for {appointment.patientName} ({appointment.patientId}).
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'left', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-default)' }}>
                <div>
                  <strong>{appointment.patientName}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>UHID: {appointment.patientId} · Apt #{appointment.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Dr. {appointment.doctorName}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{appointment.department}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{appointment.invoiceId || 'INV-2026-00101'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Receipt Number:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{appointment.receiptNumber || 'RCPT-2026-00101'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-default)', paddingTop: 8, marginTop: 8, fontWeight: 800, fontSize: 15 }}>
                <span>Status & Amount:</span>
                <span style={{ color: 'var(--color-success)' }}>PAID (₹{appointment.consultationFee || 600})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={14} /> Print Receipt
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--color-success-muted)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={32} />
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>
                {receiptData?.status === 'paid' ? 'Payment Captured Successfully!' : 'Invoice Created Successfully!'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Central Invoice #{receiptData?.invoiceId} {receiptData?.receiptNumber && `· Receipt #${receiptData?.receiptNumber}`}
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'left', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-default)' }}>
                <div>
                  <strong>{receiptData?.patientName}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>UHID: {receiptData?.patientId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Dr. {receiptData?.doctorName}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{receiptData?.department}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Consultation Fee:</span>
                <span>₹{receiptData?.fee}</span>
              </div>
              {receiptData?.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'var(--color-danger)' }}>
                  <span>Discount Applied:</span>
                  <span>-₹{receiptData?.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-default)', paddingTop: 8, marginTop: 8, fontWeight: 800, fontSize: 15 }}>
                <span>Amount Paid ({receiptData?.paymentMode?.toUpperCase()}):</span>
                <span style={{ color: 'var(--color-success)' }}>₹{receiptData?.netTotal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={14} /> Print Central Receipt
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done & Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient & Doctor Snapshot */}
            <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{appointment.patientName}</span>
                <span className="patient-id" style={{ marginLeft: 8, fontSize: 10 }}>{appointment.patientId}</span>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Slot: {appointment.date} at {appointment.time} ({appointment.type?.toUpperCase()})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Dr. {appointment.doctorName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{appointment.department}</div>
              </div>
            </div>

            {/* Fee Breakdown Calculation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Consultation Tariff (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={fee}
                  onChange={e => setFee(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount / Concession (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Payment Tender Selector */}
            <div className="form-group">
              <label className="form-label">Payment Mode / Tender <span className="required">*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${paymentMode === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', height: 38, fontSize: 12 }}
                  onClick={() => setPaymentMode('cash')}
                >
                  <IndianRupee size={14} /> Cash
                </button>
                <button
                  type="button"
                  className={`btn ${paymentMode === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', height: 38, fontSize: 12 }}
                  onClick={() => setPaymentMode('card')}
                >
                  <CreditCard size={14} /> Card / POS
                </button>
                <button
                  type="button"
                  className={`btn ${paymentMode === 'upi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', height: 38, fontSize: 12 }}
                  onClick={() => setPaymentMode('upi')}
                >
                  <QrCode size={14} /> UPI / QR
                </button>
                <button
                  type="button"
                  className={`btn ${paymentMode === 'insurance' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', height: 38, fontSize: 12 }}
                  onClick={() => setPaymentMode('insurance')}
                >
                  <Building2 size={14} /> TPA / Ins.
                </button>
              </div>
            </div>

            {/* Transaction Ref if Non-Cash */}
            {paymentMode !== 'cash' && (
              <div className="form-group">
                <label className="form-label">Transaction / Approval / UPI Reference Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UPI-REF-9837428394 or Card Auth Code"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                />
              </div>
            )}

            {/* Net Amount Box */}
            <div style={{ padding: '14px 18px', background: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Net Payable
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Will be recorded into Central Billing Ledger
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)' }}>
                ₹{netTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 8, padding: 0 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handleProcessPayment(false)}>
                Create Unpaid Bill
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleProcessPayment(true)}>
                <CheckCircle2 size={14} /> Pay & Generate Receipt (₹{netTotal})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
