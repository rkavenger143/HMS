import React, { useState } from 'react';
import {
  ReceiptText, Printer, CheckCircle2, AlertTriangle, ShieldCheck,
  CreditCard, Plus, Clock, Search, FileText, User
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, IPDBill, PaymentMode } from '../../../types';
import PrintIPDBillModal from './modals/PrintIPDBillModal';

export default function IPDBilling() {
  const {
    admissions,
    beds,
    ipdBills,
    generateIPDBill,
    recordIPDPayment,
    processInsuranceClaim,
    patients,
  } = useIPD();

  const [selectedAdmissionId, setSelectedAdmissionId] = useState(admissions[0]?.id || '');
  const [discount, setDiscount] = useState('500');
  const [taxRate, setTaxRate] = useState('0'); // 0% standard healthcare GST

  // Payment Recording State
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentMode>('upi');
  const [payRef, setPayRef] = useState('UPI' + Date.now().toString().slice(-6));

  // TPA Insurance Pre-auth State
  const [tpaProvider, setTpaProvider] = useState('Star Health Insurance');
  const [tpaPolicy, setTpaPolicy] = useState('SH2026001234');
  const [tpaPreAuth, setTpaPreAuth] = useState('25000');
  const [tpaApproved, setTpaApproved] = useState('22000');

  // Print Invoice Modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<IPDBill | null>(null);

  const selectedAdm = admissions.find(a => a.id === selectedAdmissionId) || admissions[0];
  const allocatedBed = selectedAdm ? beds.find(b => b.id === selectedAdm.bedId) : null;
  const patient = selectedAdm ? patients.find(p => p.id === selectedAdm.patientId) : null;

  // Auto Calculations based on Stay
  const totalDays = selectedAdm ? Math.max(1, Math.floor((new Date().getTime() - new Date(selectedAdm.admissionDate).getTime()) / 86400000) + 1) : 3;
  const dailyBedRate = allocatedBed?.dailyRate || 800;
  const roomCharges = dailyBedRate * totalDays;
  const doctorVisitCharges = totalDays * 500;
  const nursingCharges = totalDays * 200;
  const labCharges = 2600;
  const diagnosticCharges = 500;
  const pharmacyCharges = 1450;
  const consumablesCharges = 350;
  const procedureCharges = 0;

  const grossSubtotal = roomCharges + doctorVisitCharges + nursingCharges + labCharges + diagnosticCharges + pharmacyCharges + consumablesCharges + procedureCharges;
  const discountAmount = parseFloat(discount) || 0;
  const netTotal = Math.max(0, grossSubtotal - discountAmount);

  // Check if invoice already exists
  const existingBill = ipdBills.find(b => b.admissionId === selectedAdm?.id);

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdm) return;

    const newBill = generateIPDBill({
      admissionId: selectedAdm.id,
      patientId: selectedAdm.patientId,
      patientName: selectedAdm.patientName,
      uhid: selectedAdm.patientId,
      ward: selectedAdm.ward,
      bedNumber: selectedAdm.bedNumber,
      admissionDate: selectedAdm.admissionDate,
      dischargeDate: selectedAdm.status === 'discharged' ? selectedAdm.dischargeDate : undefined,
      totalDays,
      dailyBedRate,
      roomCharges,
      doctorVisitCharges,
      nursingCharges,
      procedureCharges,
      labCharges,
      diagnosticCharges,
      pharmacyCharges,
      consumablesCharges,
      subtotal: grossSubtotal,
      discount: discountAmount,
      tax: 0,
      total: netTotal,
      insuranceCoveredAmount: 0,
      patientPayable: netTotal,
      paidAmount: 0,
      balanceDue: netTotal,
      status: 'pending',
    });

    setSelectedBillForPrint(newBill);
    setShowBillModal(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (!amount || !existingBill) return;

    recordIPDPayment(existingBill.id, amount, payMode, payRef);
    setPayAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient (IPD) Billing & Daily Bed Charges</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Accrued daily room tariff, multi-category line items, TPA insurance claims, and payments
            </div>
          </div>
        </div>
      </div>

      {/* Main Billing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        {/* Left Column: Line Items & Daily Bed Charge Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ReceiptText size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">Inpatient Stay & Accrued Charges</span>
              </div>

              <select
                className="form-select"
                style={{ height: 32, fontSize: 12, width: 240 }}
                value={selectedAdmissionId}
                onChange={e => setSelectedAdmissionId(e.target.value)}
              >
                {admissions.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patientName} (Bed {a.bedNumber} - {a.ward})
                  </option>
                ))}
              </select>
            </div>

            <div className="card-body">
              {/* Stay Summary Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 16 }}>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Inpatient:</span><br /><strong>{selectedAdm?.patientName}</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Ward / Bed:</span><br /><strong>{selectedAdm?.bedNumber} ({selectedAdm?.ward})</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Admission Date:</span><br /><strong>{selectedAdm?.admissionDate}</strong></div>
                <div><span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Duration:</span><br /><strong style={{ color: 'var(--color-primary)' }}>{totalDays} Days Stay</strong></div>
              </div>

              {/* Itemized Table */}
              <div className="table-container" style={{ marginBottom: 16 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fee Category</th>
                      <th>Rate (₹)</th>
                      <th>Quantity / Days</th>
                      <th style={{ textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Room & Bed Charges</strong> ({selectedAdm?.ward})</td>
                      <td>₹{dailyBedRate}/d</td>
                      <td>{totalDays} Days</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{roomCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Doctor Rounds & Consultant Visits</strong></td>
                      <td>₹500/visit</td>
                      <td>{totalDays} Visits</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{doctorVisitCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Inpatient Nursing Care Charges</strong></td>
                      <td>₹200/d</td>
                      <td>{totalDays} Days</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{nursingCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Diagnostic Laboratory Panel</strong></td>
                      <td>—</td>
                      <td>Panel</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{labCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Radiology & Imaging Scans</strong></td>
                      <td>—</td>
                      <td>Scan</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{diagnosticCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Inpatient Pharmacy & Medications</strong></td>
                      <td>—</td>
                      <td>Rx</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{pharmacyCharges}</td>
                    </tr>
                    <tr>
                      <td><strong>Medical Consumables & IV Sets</strong></td>
                      <td>—</td>
                      <td>Supplies</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{consumablesCharges}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Gross vs Net Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', fontSize: 13, borderTop: '1px solid var(--border-muted)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: 280 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gross Subtotal:</span>
                  <strong>₹{grossSubtotal.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: 280, alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-success)' }}>Hospital Discount (₹):</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: 90, height: 28, textAlign: 'right', fontSize: 12 }}
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: 280, fontSize: 16, fontWeight: 900, borderTop: '1px solid var(--border-default)', paddingTop: 6 }}>
                  <span>Net Inpatient Bill:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{netTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Generate Invoice Action */}
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleGenerateInvoice}>
                  <ReceiptText size={14} /> Generate Official Tax Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: TPA Insurance & Cashier Settlement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* TPA Insurance Pre-Authorization Card */}
          <div className="card">
            <div className="card-header">
              <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">TPA / Cashless Insurance Claim</span>
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">TPA / Insurance Provider</label>
                  <input type="text" className="form-input" value={tpaProvider} onChange={e => setTpaProvider(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Policy / Member ID</label>
                  <input type="text" className="form-input" value={tpaPolicy} onChange={e => setTpaPolicy(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="form-group">
                    <label className="form-label">Pre-Auth (₹)</label>
                    <input type="number" className="form-input" value={tpaPreAuth} onChange={e => setTpaPreAuth(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approved (₹)</label>
                    <input type="number" className="form-input" value={tpaApproved} onChange={e => setTpaApproved(e.target.value)} />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => processInsuranceClaim({ admissionId: selectedAdm.id, patientId: selectedAdm.patientId, insuranceProvider: tpaProvider, policyNumber: tpaPolicy, approvedAmount: parseFloat(tpaApproved) })}
                >
                  <CheckCircle2 size={13} /> Update TPA Pre-Authorization
                </button>
              </div>
            </div>
          </div>

          {/* Cashier Payment Collection Desk */}
          <div className="card">
            <div className="card-header">
              <CreditCard size={16} style={{ color: 'var(--color-success)' }} />
              <span className="card-title">Cashier Payment Collection</span>
            </div>
            <div className="card-body">
              {existingBill ? (
                <div>
                  <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Invoice: <strong>{existingBill.billNumber}</strong></span>
                      <span className={`badge ${existingBill.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{existingBill.status.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span>Total: ₹{existingBill.total}</span>
                      <span>Paid: <strong style={{ color: 'var(--color-success)' }}>₹{existingBill.paidAmount}</strong></span>
                      <span>Due: <strong style={{ color: 'var(--color-danger)' }}>₹{existingBill.balanceDue}</strong></span>
                    </div>
                  </div>

                  <form onSubmit={handleRecordPayment}>
                    <div className="form-grid" style={{ gap: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Payment Amount (₹) <span className="required">*</span></label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder={`Enter amount up to ₹${existingBill.balanceDue}`}
                          value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Payment Mode</label>
                        <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value as PaymentMode)}>
                          <option value="upi">UPI / QR Code</option>
                          <option value="cash">Cash Counter</option>
                          <option value="card">Debit / Credit Card</option>
                          <option value="insurance">TPA / Insurance Direct</option>
                          <option value="netbanking">Net Banking / NEFT</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Transaction / Cheque Ref #</label>
                        <input type="text" className="form-input" value={payRef} onChange={e => setPayRef(e.target.value)} />
                      </div>

                      <button type="submit" className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                        <CreditCard size={14} /> Record Payment & Issue Receipt
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  Click "Generate Official Tax Invoice" on the left to activate payment collection.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable IPD Bill Modal */}
      {showBillModal && selectedBillForPrint && (
        <PrintIPDBillModal
          bill={selectedBillForPrint}
          patient={patient}
          admission={selectedAdm}
          onClose={() => setShowBillModal(false)}
        />
      )}
    </div>
  );
}
