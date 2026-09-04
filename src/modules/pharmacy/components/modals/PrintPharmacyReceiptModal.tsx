import React from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Pill, QrCode } from 'lucide-react';
import type { PharmacySaleRecord, ComprehensivePrescription } from '../../../../types';

interface PrintPharmacyReceiptModalProps {
  sale?: PharmacySaleRecord;
  prescription?: ComprehensivePrescription;
  onClose: () => void;
}

export default function PrintPharmacyReceiptModal({ sale, prescription, onClose }: PrintPharmacyReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = sale?.saleNumber || (prescription ? `DISP-${prescription.prescriptionNumber}` : 'RCPT-2026-0001');
  const dateStr = sale?.saleDate || prescription?.dispensedAt || new Date().toLocaleString();
  const patientName = sale?.patientName || prescription?.patientName || 'Walk-In Customer';
  const patientId = sale?.patientId || prescription?.patientId || 'CUST-WALKIN';
  const pharmacist = sale?.pharmacistName || prescription?.dispensedBy || 'Certified Pharmacist';
  const items = sale?.items || (prescription?.medicines.map(m => ({
    medicineId: m.medicineId,
    medicineName: m.medicineName,
    batchNumber: 'LOT-AUTO-FEFO',
    expiryDate: '2027-12-31',
    quantity: m.dispensedQty || m.prescribedQty,
    unitPrice: 50.0,
    discount: 0,
    tax: 6.0,
    total: (m.dispensedQty || m.prescribedQty) * 50.0,
  })) || []);

  const totalAmount = sale?.grandTotal || items.reduce((s, it) => s + it.total, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        {/* Header Actions */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="modal-title">Official Pharmacy Cash Bill & Dispensing Receipt</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} /> Print Bill / Thermal POS
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          className="modal-body"
          style={{
            background: '#ffffff',
            color: '#1a1a1a',
            padding: '28px 36px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {/* Hospital & Pharmacy Header */}
          <div style={{ borderBottom: '2px solid #0A84FF', paddingBottom: 12, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0A84FF', letterSpacing: 0.5 }}>
                AURA HEALTH MULTI-SPECIALTY HOSPITAL
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2c3e50', marginTop: 2 }}>
                CENTRAL 24x7 INPATIENT & OUTPATIENT PHARMACY
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
                124 Healthcare Boulevard, Medical Enclave, Bangalore 560029 · Phone: +91 80 2345 6789
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                <strong>Drug License No:</strong> Form 20B: KA-B1-20B-88194 | Form 21B: KA-B1-21B-88195 | <strong>GSTIN:</strong> 29AAACH5519Q1ZT
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#0A84FF', color: '#fff', padding: '4px 10px', borderRadius: 4, fontWeight: 800, fontSize: 11, display: 'inline-block' }}>
                TAX INVOICE / CASH MEMO
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                Bill No: <span style={{ color: '#0A84FF' }}>{receiptNumber}</span>
              </div>
              <div style={{ fontSize: 10, color: '#666' }}>
                Date: {dateStr}
              </div>
            </div>
          </div>

          {/* Patient Details & Referring Info */}
          <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: '10px 14px', marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 11 }}>
            <div>
              <span style={{ color: '#666' }}>Patient Name:</span><br />
              <strong style={{ fontSize: 12, color: '#111' }}>{patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>UHID / Patient ID:</span><br />
              <strong style={{ color: '#111' }}>{patientId}</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Payment Method:</span><br />
              <strong style={{ textTransform: 'uppercase', color: '#0A84FF' }}>{sale?.paymentMethod || 'CASH / PAID'}</strong>
            </div>
            {prescription && (
              <>
                <div>
                  <span style={{ color: '#666' }}>Prescribing Doctor:</span><br />
                  <strong style={{ color: '#111' }}>{prescription.doctorName}</strong> ({prescription.department})
                </div>
                <div>
                  <span style={{ color: '#666' }}>Encounter Type:</span><br />
                  <strong style={{ textTransform: 'uppercase', color: '#111' }}>{prescription.encounterType}</strong> {prescription.bedNumber ? `· Bed ${prescription.bedNumber}` : ''}
                </div>
                <div>
                  <span style={{ color: '#666' }}>Diagnosis:</span><br />
                  <strong style={{ color: '#111' }}>{prescription.diagnosis}</strong>
                </div>
              </>
            )}
          </div>

          {/* Medicines Line Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>#</th>
                <th style={{ padding: '6px 8px' }}>Medicine & Brand</th>
                <th style={{ padding: '6px 8px' }}>Batch No</th>
                <th style={{ padding: '6px 8px' }}>Expiry</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>MRP (₹)</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>GST%</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <strong>{item.medicineName}</strong>
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{item.batchNumber}</td>
                  <td style={{ padding: '6px 8px' }}>{item.expiryDate}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>12%</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '2px solid #333', paddingTop: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#666', maxWidth: 320 }}>
              <strong>Statutory Declaration:</strong><br />
              Medicines sold under valid registered medical practitioner prescription. Refrigerated items (2°C - 8°C) once sold cannot be returned. Please check batch & expiry before leaving counter.
            </div>

            <div style={{ width: 220, fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>Subtotal:</span>
                <span>₹{(totalAmount * 0.88).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>CGST (6%):</span>
                <span>₹{(totalAmount * 0.06).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>SGST (6%):</span>
                <span>₹{(totalAmount * 0.06).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 900, fontSize: 14, color: '#0A84FF' }}>
                <span>Grand Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Pharmacist Signature */}
          <div style={{ borderTop: '1px dashed #bbb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
            <div>
              <div>Computer Generated Electronic Tax Invoice</div>
              <div style={{ color: '#777' }}>Hospital Management Information System (HMIS) Pharmacy Ledger</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{pharmacist}</div>
              <div style={{ color: '#555' }}>Registered Pharmacist (KA-PH-55421)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
