import React from 'react';
import { Printer, X, ReceiptText, Download, CheckCircle2 } from 'lucide-react';
import type { Bill, Patient, OPDVisit } from '../../../../types';

interface PrintBillModalProps {
  bill?: Bill | null;
  patient?: Patient | null;
  visit?: OPDVisit | null;
  onClose: () => void;
}

export default function PrintBillModal({ bill, patient, visit, onClose }: PrintBillModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const billNumber = bill?.billNumber || 'ALN-BILL-2026-101';
  const billDate = bill?.date || '2026-08-31';
  const patientName = bill?.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : visit?.patientName || 'Ramesh Yadav');
  const patientId = bill?.patientId || patient?.id || visit?.patientId || 'ALN-2026-00001';
  const items = bill?.items || [
    { id: '1', category: 'consultation', description: 'Cardiology Specialist OPD Consultation', quantity: 1, unitPrice: 800, totalPrice: 800, date: '2026-08-31' },
    { id: '2', category: 'lab', description: 'Complete Blood Count (CBC) + Lipid Profile', quantity: 1, unitPrice: 1100, totalPrice: 1100, date: '2026-08-31' },
  ];
  const subtotal = bill?.subtotal || items.reduce((acc, i) => acc + i.totalPrice, 0);
  const discount = bill?.discount || 0;
  const tax = bill?.tax || 0;
  const total = bill?.total || (subtotal - discount + tax);
  const paidAmount = bill?.paidAmount || total;
  const balanceDue = bill?.balanceDue || (total - paidAmount);
  const status = bill?.status || 'paid';
  const payments = bill?.payments || [
    { id: 'p-1', amount: total, mode: 'upi', referenceNumber: 'UPI202608310088', date: '2026-08-31', receivedBy: 'Anita Verma' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <ReceiptText size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">OPD Invoice & Payment Receipt</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Invoice
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          {/* Printable Invoice Container */}
          <div
            id="printable-opd-bill"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#111827', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>
                  Plot 45, Knowledge Park III, Greater Noida, UP - 201306
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  GSTIN: <strong>07AABCD1234E1Z5</strong> | PAN: <strong>AABCC1234F</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', background: '#059669', color: 'white', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                  TAX INVOICE / RECEIPT
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginTop: '6px' }}>{billNumber}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Date: {billDate}</div>
              </div>
            </div>

            {/* Billed To / Patient Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Billed To Patient:</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginTop: '2px' }}>{patientName}</div>
                <div style={{ color: '#4B5563', marginTop: '2px' }}>UHID: <strong>{patientId}</strong></div>
                {patient?.phone && <div style={{ color: '#6B7280' }}>Mobile: {patient.phone}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Encounter Info:</div>
                <div style={{ color: '#111827', marginTop: '2px' }}>Department: <strong>{visit?.department || 'Cardiology'}</strong></div>
                <div style={{ color: '#4B5563' }}>Attending Doctor: <strong>{visit?.doctorName || 'Dr. Rajesh Kumar'}</strong></div>
                <div style={{ color: '#4B5563' }}>OPD Visit ID: <strong>{visit?.id || 'OPD-2026-00101'}</strong></div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', width: '30px' }}>#</th>
                  <th style={{ padding: '8px 10px' }}>Service / Investigation Description</th>
                  <th style={{ padding: '8px 10px', width: '70px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#6B7280' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#1F2937' }}>
                      {item.description}
                      <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', marginLeft: '6px' }}>({item.category})</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#4B5563' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#4B5563' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>₹{item.totalPrice.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Payments Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '2px solid #E5E7EB', paddingTop: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Payment Transactions:
                </div>
                {payments.length > 0 ? (
                  payments.map((p, i) => (
                    <div key={i} style={{ background: '#F3F4F6', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', color: '#374151', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mode: <strong style={{ textTransform: 'uppercase' }}>{p.mode}</strong> {p.referenceNumber && `(${p.referenceNumber})`}</span>
                      <span>Paid: <strong>₹{p.amount.toLocaleString('en-IN')}</strong></span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: '#DC2626', fontStyle: 'italic' }}>Payment pending</div>
                )}
              </div>

              <div style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#4B5563' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#059669' }}>
                    <span>Discount:</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#4B5563' }}>
                    <span>Tax (GST):</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #E5E7EB', fontSize: '14px', fontWeight: '800', color: '#111827' }}>
                  <span>Grand Total:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#059669', fontWeight: '700' }}>
                  <span>Paid Amount:</span>
                  <span>₹{paidAmount.toLocaleString('en-IN')}</span>
                </div>
                {balanceDue > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#DC2626', fontWeight: '800' }}>
                    <span>Balance Due:</span>
                    <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Signature */}
            <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div>• This is a computer generated invoice and requires no physical signature.</div>
                <div>• Medicines and diagnostic charges are non-refundable once processed.</div>
                <div>• Thank you for choosing ALN Cure Multispeciality Hospital.</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ height: '28px', borderBottom: '1px solid #9CA3AF', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Authorized Cashier</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
