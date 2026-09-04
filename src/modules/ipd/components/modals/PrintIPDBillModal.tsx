import React from 'react';
import { Printer, X, ReceiptText, CheckCircle2 } from 'lucide-react';
import type { IPDBill, Patient, Admission } from '../../../../types';

interface PrintIPDBillModalProps {
  bill: IPDBill;
  patient?: Patient | null;
  admission?: Admission | null;
  onClose: () => void;
}

export default function PrintIPDBillModal({ bill, patient, admission, onClose }: PrintIPDBillModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = bill.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient');
  const patientId = bill.patientId || patient?.id || 'ALN-2026-00001';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <ReceiptText size={18} style={{ color: 'var(--color-success)' }} />
          <div className="modal-title">Inpatient (IPD) Invoice & Payment Receipt</div>
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
          <div
            id="printable-ipd-bill"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  GSTIN: 07AAAAA0000A1Z5 · Inpatient Billing & Cashier Desk
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>
                  Tax Invoice: <span style={{ color: '#059669' }}>{bill.billNumber}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Admission: {bill.admissionDate} {bill.dischargeDate && `→ Discharge: ${bill.dischargeDate}`}
                </div>
              </div>
            </div>

            {/* Demographics & Stay Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Ward / Bed:</span> <strong>{bill.ward} ({bill.bedNumber})</strong></div>
              <div><span style={{ color: '#6B7280' }}>Stay Duration:</span> <strong>{bill.totalDays} Days</strong></div>
            </div>

            {/* Itemized Charge Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Fee Head & Service Description</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Rate (₹)</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty / Days</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '8px' }}>1</td>
                  <td style={{ padding: '8px' }}><strong>Room & Bed Charges</strong> — {bill.ward} ({bill.bedNumber})</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>₹{bill.dailyBedRate}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{bill.totalDays} Days</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.roomCharges.toLocaleString('en-IN')}</td>
                </tr>

                {bill.doctorVisitCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>2</td>
                    <td style={{ padding: '8px' }}><strong>Doctor Rounds & Clinical Consultations</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>₹500</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{Math.max(1, Math.round(bill.doctorVisitCharges / 500))} Visits</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.doctorVisitCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.nursingCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>3</td>
                    <td style={{ padding: '8px' }}><strong>Inpatient Nursing & Patient Care Charges</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>₹200</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{bill.totalDays} Days</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.nursingCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.procedureCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>4</td>
                    <td style={{ padding: '8px' }}><strong>Surgical / Minor Bedside Procedures</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.procedureCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.labCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>5</td>
                    <td style={{ padding: '8px' }}><strong>Diagnostic Laboratory Investigations</strong> (CBC, LFT, KFT, Troponin)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>Panel</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.labCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.diagnosticCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>6</td>
                    <td style={{ padding: '8px' }}><strong>Radiology & Imaging Scans</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>Study</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.diagnosticCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.pharmacyCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>7</td>
                    <td style={{ padding: '8px' }}><strong>Inpatient Pharmacy & Dispensed Medications</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>Rx</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.pharmacyCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {bill.consumablesCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px' }}>8</td>
                    <td style={{ padding: '8px' }}><strong>Medical Consumables, Syringes & IV Fluids</strong></td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>Misc</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{bill.consumablesCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Calculation Matrix */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{ width: '320px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                  <span>Gross Subtotal:</span>
                  <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {bill.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Hospital Discount:</span>
                    <span>- ₹{bill.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: '1px solid #E5E7EB', paddingTop: '6px' }}>
                  <span>Total Inpatient Bill:</span>
                  <span style={{ color: '#059669' }}>₹{bill.total.toLocaleString('en-IN')}</span>
                </div>

                {bill.insuranceCoveredAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563EB', fontWeight: 700 }}>
                    <span>Insurance / TPA Covered:</span>
                    <span>- ₹{bill.insuranceCoveredAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Amount Paid by Patient:</span>
                  <span>₹{bill.paidAmount.toLocaleString('en-IN')}</span>
                </div>

                {bill.balanceDue > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', fontWeight: '900', fontSize: '13px' }}>
                    <span>Pending Due at Discharge:</span>
                    <span>₹{bill.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payments Receipt Log */}
            {bill.payments && bill.payments.length > 0 && (
              <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                <strong style={{ color: '#374151' }}>Payment Receipts on File:</strong>
                {bill.payments.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>{p.date} · Mode: <strong style={{ textTransform: 'uppercase' }}>{p.mode}</strong> {p.referenceNumber && `(${p.referenceNumber})`}</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Received ₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div>* Computer Generated IPD Tax Invoice</div>
                <div>* All disputes subject to hospital jurisdiction</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '140px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Authorized Billing Officer</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
