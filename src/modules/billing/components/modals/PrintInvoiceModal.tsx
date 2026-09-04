import React from 'react';
import { ReceiptText, Printer, Download, X, Building2, User, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { CentralInvoiceItem } from '../../../../types';

interface PrintInvoiceModalProps {
  invoice: CentralInvoiceItem;
  onClose: () => void;
}

export default function PrintInvoiceModal({ invoice, onClose }: PrintInvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 840,
          background: '#ffffff',
          color: '#1c1c1e',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: '#f4f5f7',
            borderBottom: '1px solid #e2e8f0',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <ReceiptText size={16} color="#0A84FF" />
            <span>Official Consolidated Tax Invoice: {invoice.invoiceNumber}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Invoice (A4)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Download size={13} /> Save PDF
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Official Invoice Body (Printable A4 Format) */}
        <div style={{ padding: '32px 36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Hospital Official Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0A84FF', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0A84FF', letterSpacing: '-0.5px' }}>
                ALN CURE MULTI-SPECIALITY HOSPITAL
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Accredited by NABH & NABL · Ministry of Health & Family Welfare
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                124 Healthcare Boulevard, Medical District, Bengaluru - 560001
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Tel: +91 80 4912 8800 · Email: billing@alncurehospital.com · Web: www.alncurehospital.com
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                GSTIN: 29AAACH5519Q1ZT · PAN: AAACH5519Q · SAC Code: 999312
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#0A84FF', color: '#ffffff', padding: '4px 12px', borderRadius: 4, fontWeight: 800, fontSize: 12, display: 'inline-block', marginBottom: 6 }}>
                TAX INVOICE / BILL OF SUPPLY
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Invoice Date: <strong>{invoice.invoiceDate}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Due Date: <strong>{invoice.dueDate}</strong>
              </div>
              <div style={{ marginTop: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: invoice.status === 'paid' ? '#dcfce7' : invoice.status === 'partially_paid' ? '#fef3c7' : '#fee2e2',
                    color: invoice.status === 'paid' ? '#166534' : invoice.status === 'partially_paid' ? '#92400e' : '#991b1b',
                  }}
                >
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Patient & Encounter Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 14, borderRadius: 6, marginBottom: 20, fontSize: 12, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                PATIENT DEMOGRAPHICS (BILLED TO)
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{invoice.patientName}</div>
              <div style={{ color: '#475569', marginTop: 2 }}>UHID / Patient ID: <strong>{invoice.uhid}</strong></div>
              <div style={{ color: '#475569' }}>Encounter Type: <strong style={{ textTransform: 'uppercase' }}>{invoice.encounterType}</strong></div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                ADMISSION & CLINICAL DETAILS
              </div>
              {invoice.admissionId && (
                <div style={{ color: '#475569' }}>
                  Admission ID: <strong>{invoice.admissionId}</strong> · Bed: <strong>{invoice.bedNumber || 'N/A'}</strong> ({invoice.ward || 'General'})
                </div>
              )}
              {invoice.doctorName && (
                <div style={{ color: '#475569' }}>
                  Consultant: <strong>{invoice.doctorName}</strong> ({invoice.department})
                </div>
              )}
              <div style={{ color: '#475569' }}>Billed By: <strong>{invoice.createdBy}</strong></div>
            </div>
          </div>

          {/* Consolidated Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>
                <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
                <th style={{ padding: '8px 10px', width: '45%' }}>Service Description & Department</th>
                <th style={{ padding: '8px 10px', width: '10%', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 10px', width: '12%', textAlign: 'right' }}>Unit Rate (₹)</th>
                <th style={{ padding: '8px 10px', width: '10%', textAlign: 'right' }}>Disc (₹)</th>
                <th style={{ padding: '8px 10px', width: '8%', textAlign: 'center' }}>GST%</th>
                <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                  <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700 }}>{item.description}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      Dept: <strong style={{ textTransform: 'uppercase' }}>{item.department}</strong> · Ref: {item.sourceRecordId} · SAC: {item.serviceCode}
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a' }}>
                    {item.discountAmount > 0 ? `-${item.discountAmount.toFixed(2)}` : '0.00'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.taxRate}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Summary & Calculations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 20 }}>
            {/* Left: Statutory Declarations & Bank Account */}
            <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Electronic Bank NEFT / RTGS Transfer Details:</div>
              <div>Bank: <strong>HDFC Bank Ltd</strong> · Branch: Medical Center Branch</div>
              <div>Account Name: <strong>ALN Cure Hospital Private Limited</strong></div>
              <div>A/C Number: <strong>50200088192401</strong> · IFSC Code: <strong>HDFC0001245</strong></div>
              <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                Note: Healthcare clinical consultations and inpatient room services are exempt from GST under Notification No. 12/2017-Central Tax. Pharmacy medicines and consumables are charged at applicable GST slabs.
              </div>
            </div>

            {/* Right: Net Calculations */}
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b' }}>Gross Total Charges:</span>
                <strong>₹{invoice.grossAmount.toFixed(2)}</strong>
              </div>

              {invoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#16a34a' }}>
                  <span>Hospital Discount / Concession:</span>
                  <strong>-₹{invoice.discountAmount.toFixed(2)}</strong>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b' }}>
                  <span>Applicable GST (CGST+SGST):</span>
                  <strong>+₹{invoice.taxAmount.toFixed(2)}</strong>
                </div>
              )}

              {invoice.insuranceAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#0284c7' }}>
                  <span>Insurance / TPA Pre-Auth Claim:</span>
                  <strong>-₹{invoice.insuranceAmount.toFixed(2)}</strong>
                </div>
              )}

              {invoice.advanceAdjusted > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#d97706' }}>
                  <span>Inpatient Advance Deposit Adjusted:</span>
                  <strong>-₹{invoice.advanceAdjusted.toFixed(2)}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', fontSize: 15, fontWeight: 900, color: '#0A84FF' }}>
                <span>Net Payable by Patient:</span>
                <span>₹{invoice.netPayable.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#166534', fontWeight: 700 }}>
                <span>Total Amount Paid:</span>
                <span>₹{invoice.paidAmount.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: invoice.outstandingBalance > 0 ? '#dc2626' : '#166534', fontSize: 14, fontWeight: 800 }}>
                <span>Outstanding Balance Due:</span>
                <span>₹{invoice.outstandingBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 24, marginTop: 30, fontSize: 11, color: '#64748b' }}>
            <div>
              <div>Patient / Guardian Signature</div>
              <div style={{ marginTop: 24, borderTop: '1px dashed #cbd5e1', width: 180, paddingTop: 4 }}>
                Acknowledged Receipt
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div>For ALN CURE MULTI-SPECIALITY HOSPITAL</div>
              <div style={{ marginTop: 24, borderTop: '1px dashed #cbd5e1', width: 200, paddingTop: 4, fontWeight: 700, color: '#1e293b' }}>
                Authorized Billing Officer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
