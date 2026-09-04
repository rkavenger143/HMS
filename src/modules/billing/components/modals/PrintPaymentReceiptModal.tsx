import React from 'react';
import { Receipt, Printer, Download, X } from 'lucide-react';
import type { BillingPaymentRecord } from '../../../../types';

interface PrintPaymentReceiptModalProps {
  payment: BillingPaymentRecord;
  department?: string;
  items?: { name: string; qty?: number; amount: number }[];
  totalBill?: number;
  previousPaid?: number;
  remainingBalance?: number;
  onClose: () => void;
}

export default function PrintPaymentReceiptModal({
  payment,
  department,
  items,
  totalBill,
  previousPaid,
  remainingBalance,
  onClose,
}: PrintPaymentReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 440,
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#059669' }}>
            <Receipt size={16} color="#059669" />
            <span>Payment Receipt #{payment.receiptNumber}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ height: 30, fontSize: 11 }}>
              <Printer size={12} /> Print POS (80mm)
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Thermal POS Slip Content */}
        <div style={{ padding: '24px 20px', fontFamily: 'Courier New, monospace', fontSize: 12 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #94a3b8', paddingBottom: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '0.5px', color: '#059669' }}>
              ALN CURE SUPER SPECIALTY HOSPITAL
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>124 Healthcare Blvd, Medical District, Bengaluru</div>
            <div style={{ fontSize: 10, color: '#475569' }}>GSTIN: 29AAACH5519Q1ZT · Ph: +91 80 4912 8800</div>
            <div style={{ fontWeight: 800, fontSize: 12, marginTop: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              OFFICIAL PAYMENT RECEIPT
            </div>
            {department && (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginTop: 2 }}>
                DEPARTMENT: {department.toUpperCase()}
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Receipt No:</span>
              <strong>{payment.receiptNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Invoice Ref:</span>
              <strong>{payment.invoiceId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Date & Time:</span>
              <span>{payment.paymentDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Patient Name:</span>
              <strong>{payment.patientName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Patient UHID:</span>
              <span>{payment.patientId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Billing Desk:</span>
              <span>{payment.counterName || 'Main Billing Counter'}</span>
            </div>
          </div>

          {/* Itemized Services / Scans / Medicines if available */}
          {items && items.length > 0 && (
            <div style={{ borderTop: '1px dashed #94a3b8', borderBottom: '1px dashed #94a3b8', padding: '8px 0', margin: '8px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                Service / Medicine Description:
              </div>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, margin: '2px 0' }}>
                  <span>{item.name} {item.qty ? `x${item.qty}` : ''}</span>
                  <strong>₹{item.amount.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Financial Breakdown */}
          <div style={{ borderTop: '1px dashed #94a3b8', borderBottom: '1px dashed #94a3b8', padding: '10px 0', margin: '8px 0' }}>
            {totalBill !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>Gross Invoice Total:</span>
                <span>₹{totalBill.toFixed(2)}</span>
              </div>
            )}
            {previousPaid !== undefined && previousPaid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>Previously Settled:</span>
                <span>₹{previousPaid.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, marginTop: 4 }}>
              <span>AMOUNT RECEIVED:</span>
              <span style={{ color: '#059669' }}>₹{payment.amount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
              <span>Payment Tender:</span>
              <strong style={{ textTransform: 'uppercase' }}>{payment.paymentMethod}</strong>
            </div>
            {payment.transactionRef && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginTop: 2 }}>
                <span>Txn Reference:</span>
                <span>{payment.transactionRef}</span>
              </div>
            )}

            {remainingBalance !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4, borderTop: '1px dotted #cbd5e1', paddingTop: 4 }}>
                <span>Remaining Dues / Balance:</span>
                <strong style={{ color: remainingBalance > 0 ? '#dc2626' : '#16a34a' }}>
                  ₹{remainingBalance.toFixed(2)} {remainingBalance === 0 ? '(FULLY PAID)' : ''}
                </strong>
              </div>
            )}
          </div>

          {/* Signoff */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 10, color: '#475569' }}>
            <div>Received with thanks by: <strong>{payment.receivedBy}</strong></div>
            <div style={{ marginTop: 6 }}>*** Thank you for choosing ALN Cure Hospital ***</div>
            <div style={{ fontSize: 9 }}>Valid computer-generated hospital payment receipt</div>
          </div>
        </div>
      </div>
    </div>
  );
}
