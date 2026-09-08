import React, { useState } from 'react';
import {
  ReceiptText, Search, User, CheckCircle2, Plus, DollarSign,
  Building2, Activity, Pill, Microscope, Radio, FileText, ArrowRight,
  ShieldCheck, Zap
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';
import { storageService } from '../../../services/storageService';
import PrintInvoiceModal from './modals/PrintInvoiceModal';
import RecordPaymentModal from './modals/RecordPaymentModal';
import type { CentralInvoiceItem, DepartmentChargeItem } from '../../../types';

export default function CentralBillingWorkspace() {
  const {
    departmentCharges,
    invoices,
    advances,
    createInvoice,
    getPatientFinancialAccount,
    setSelectedInvoiceId,
  } = useBilling();

  const [selectedPatientId, setSelectedPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [useAdvance, setUseAdvance] = useState(true);

  // Modals
  const [createdInvoice, setCreatedInvoice] = useState<CentralInvoiceItem | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<CentralInvoiceItem | null>(null);

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const financialSummary = getPatientFinancialAccount(selectedPatientId);

  // Unbilled Charges for this patient
  const unbilledCharges = departmentCharges.filter(
    c => c.patientId === selectedPatientId && !c.isBilled
  );

  // Invoices for this patient
  const patientInvoices = invoices.filter(i => i.patientId === selectedPatientId);

  // Available Advances for this patient
  const availableAdvances = advances.filter(
    a => a.patientId === selectedPatientId && a.status === 'available'
  );
  const totalAvailableAdvance = availableAdvances.reduce((sum, a) => sum + a.amount, 0);

  const handleToggleCharge = (id: string) => {
    setSelectedChargeIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedChargeIds.length === unbilledCharges.length) {
      setSelectedChargeIds([]);
    } else {
      setSelectedChargeIds(unbilledCharges.map(c => c.id));
    }
  };

  // Calculations for newly generated invoice
  const chosenCharges = unbilledCharges.filter(c => selectedChargeIds.includes(c.id));
  const newGross = chosenCharges.reduce((sum, c) => sum + c.totalAmount, 0);
  const calculatedAdvanceAdjusted = useAdvance ? Math.min(totalAvailableAdvance, Math.max(0, newGross - discountAmount - insuranceAmount)) : 0;
  const newNetPayable = Math.max(0, newGross - discountAmount - insuranceAmount - calculatedAdvanceAdjusted);

  const handleGenerateConsolidatedBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (chosenCharges.length === 0) {
      alert('Please select at least one unbilled department charge to generate a bill.');
      return;
    }

    const newInv = createInvoice({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      uhid: selectedPatient.id,
      encounterType: chosenCharges.some(c => c.department === 'ipd') ? 'ipd' : 'opd',
      doctorName: DEMO_DOCTORS[0]?.name || 'Dr. Rajesh Sharma',
      department: 'Multi-Department',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: chosenCharges,
      grossAmount: newGross,
      discountAmount,
      taxAmount: chosenCharges.reduce((sum, c) => sum + (c.totalAmount * (c.taxRate / 100)), 0),
      insuranceAmount,
      advanceAdjusted: calculatedAdvanceAdjusted,
      netPayable: newNetPayable,
      paidAmount: 0,
      outstandingBalance: newNetPayable,
      status: newNetPayable === 0 ? 'paid' : 'generated',
      createdBy: 'Ananya Deshmukh (Cashier)',
    });

    setSelectedChargeIds([]);
    setCreatedInvoice(newInv);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Patient Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Central Consolidated Billing & Patient Accounts Hub</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consolidate charges across OPD, IPD, Laboratory, Radiology, Pharmacy, Nursing, and Diet into itemized tax invoices
            </div>
          </div>
        </div>

        {/* Patient Switcher */}
        <select
          className="form-select"
          style={{ width: 290 }}
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          {DEMO_PATIENTS.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
            </option>
          ))}
        </select>
      </div>

      {/* Patient Financial Summary Ledger Card */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-md">{selectedPatient.firstName[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                UHID: <strong>{selectedPatient.id}</strong> · {selectedPatient.gender?.toUpperCase()}, {(selectedPatient as any).age || 35}y · Phone: {selectedPatient.phone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Billed Charges</div>
              <strong style={{ fontSize: 14 }}>₹{financialSummary.totalBilled.toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Realized Paid</div>
              <strong style={{ fontSize: 14, color: 'var(--color-success)' }}>₹{financialSummary.totalPaid.toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Available Advance</div>
              <strong style={{ fontSize: 14, color: '#d97706' }}>₹{totalAvailableAdvance.toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Net Balance Due</div>
              <strong style={{ fontSize: 16, color: financialSummary.netOutstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                ₹{financialSummary.netOutstanding.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Unbilled Charges vs Consolidated Bill Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Left: Unbilled Department Charges Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="card-title">Unbilled Department Charges ({unbilledCharges.length})</span>
                <div className="card-subtitle">Select billable services from OPD, IPD, Lab, Radiology, and Pharmacy</div>
              </div>

              {unbilledCharges.length > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={handleSelectAll}>
                  {selectedChargeIds.length === unbilledCharges.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              {unbilledCharges.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>Select</th>
                        <th>Department</th>
                        <th>Service Description</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unbilledCharges.map(c => {
                        const isSelected = selectedChargeIds.includes(c.id);

                        return (
                          <tr
                            key={c.id}
                            onClick={() => handleToggleCharge(c.id)}
                            style={{ cursor: 'pointer', background: isSelected ? 'var(--color-primary-muted)' : 'inherit' }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleCharge(c.id)}
                                onClick={e => e.stopPropagation()}
                              />
                            </td>

                            <td>
                              <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                                {c.department}
                              </span>
                            </td>

                            <td>
                              <strong style={{ fontSize: 13 }}>{c.description}</strong>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                Ref: {c.sourceRecordId} · Code: {c.serviceCode} · Date: {c.chargeDate}
                              </div>
                            </td>

                            <td>{c.quantity}</td>
                            <td>₹{c.unitPrice.toFixed(2)}</td>
                            <td>
                              <strong style={{ color: 'var(--color-primary)' }}>₹{c.totalAmount.toFixed(2)}</strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <CheckCircle2 size={28} style={{ color: 'var(--color-success)', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700 }}>No Pending Unbilled Charges</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>All department charges for this patient have been consolidated into active invoices.</div>
                </div>
              )}
            </div>
          </div>

          {/* Existing Invoices Table for Patient */}
          {patientInvoices.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Existing Invoices for Patient ({patientInvoices.length})</span>
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Gross</th>
                        <th>Paid</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientInvoices.map(inv => (
                        <tr key={inv.id}>
                          <td><strong>{inv.invoiceNumber}</strong></td>
                          <td>{inv.invoiceDate}</td>
                          <td>₹{inv.grossAmount.toLocaleString()}</td>
                          <td><strong style={{ color: 'var(--color-success)' }}>₹{inv.paidAmount.toLocaleString()}</strong></td>
                          <td><strong style={{ color: inv.outstandingBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{inv.outstandingBalance.toLocaleString()}</strong></td>
                          <td>
                            <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              {inv.outstandingBalance > 0 && (
                                <button className="btn btn-primary btn-sm" onClick={() => setPaymentInvoice(inv)}>
                                  Pay
                                </button>
                              )}
                              <button className="btn btn-secondary btn-sm" onClick={() => setCreatedInvoice(inv)}>
                                Bill (A4)
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Consolidated Bill Generator Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content' }}>
          <div>
            <div className="card-header">
              <span className="card-title">Consolidated Bill Generator</span>
            </div>

            <form onSubmit={handleGenerateConsolidatedBill} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Selected Line Items:</span>
                  <strong>{chosenCharges.length} Charges</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
                  <span>Gross Total:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{newGross.toFixed(2)}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Hospital Concession / Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={newGross}
                  className="form-input"
                  style={{ height: 32, fontSize: 12 }}
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                />
              </div>

              {/* Insurance / Policy Status & Auto-Calculation */}
              {(() => {
                const patientPolicy = storageService.getPatientPolicies().find(p => p.patientId === selectedPatientId && p.status === 'active');
                const activePreAuth = storageService.getPreAuthRequests().find(pa => pa.patientId === selectedPatientId && (pa.status === 'approved' || pa.status === 'partially_approved'));
                return (
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="form-label" style={{ fontSize: 11, margin: 0 }}>Insurance / TPA Coverage (₹)</label>
                      {patientPolicy && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 10, padding: '2px 6px', height: 'auto', color: '#2563eb' }}
                          onClick={() => {
                            const copayPct = patientPolicy.coPayPercentage || 10;
                            const deductible = patientPolicy.deductible || 0;
                            const afterDeduct = Math.max(0, newGross - deductible);
                            const insShare = activePreAuth
                              ? Math.min(activePreAuth.approvedAmount, newGross)
                              : Math.min(patientPolicy.remainingCoverage, Math.round(afterDeduct * (1 - copayPct / 100)));
                            setInsuranceAmount(insShare);
                          }}
                        >
                          <Zap size={11} /> Auto-Calculate ({patientPolicy.coPayPercentage}% Copay)
                        </button>
                      )}
                    </div>
                    {patientPolicy && (
                      <div style={{ padding: '6px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', fontSize: 11, color: '#1e40af', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={12} /> {patientPolicy.providerName}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                          Policy #{patientPolicy.policyNumber} · Remaining: ₹{patientPolicy.remainingCoverage.toLocaleString()} {activePreAuth ? `· Pre-Auth Approved: ₹${activePreAuth.approvedAmount.toLocaleString()}` : ''}
                        </div>
                      </div>
                    )}
                    <input
                      type="number"
                      min="0"
                      max={newGross}
                      className="form-input"
                      style={{ height: 32, fontSize: 12 }}
                      value={insuranceAmount}
                      onChange={e => setInsuranceAmount(Number(e.target.value))}
                    />
                  </div>
                );
              })()}

              {totalAvailableAdvance > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useAdvance}
                    onChange={e => setUseAdvance(e.target.checked)}
                  />
                  <span>
                    Deduct Available Advance Deposit (<strong>₹{totalAvailableAdvance.toLocaleString()}</strong>)
                  </span>
                </label>
              )}

              {/* Net Payable Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                {calculatedAdvanceAdjusted > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                    <span>Advance Adjusted:</span>
                    <strong>-₹{calculatedAdvanceAdjusted.toFixed(2)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
                  <span>Final Net Payable:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{newNetPayable.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={chosenCharges.length === 0}
                style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              >
                <ReceiptText size={14} /> Generate Consolidated Invoice
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      {createdInvoice && (
        <PrintInvoiceModal invoice={createdInvoice} onClose={() => setCreatedInvoice(null)} />
      )}

      {paymentInvoice && (
        <RecordPaymentModal invoice={paymentInvoice} onClose={() => setPaymentInvoice(null)} />
      )}
    </div>
  );
}
