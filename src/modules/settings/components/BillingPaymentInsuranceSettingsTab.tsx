import React, { useState } from 'react';
import {
  DollarSign, CreditCard, ShieldCheck, Save, RotateCcw,
  CheckCircle2, Percent, ReceiptText, Shield
} from 'lucide-react';
import { useSettings, BillingSettingsConfig, PaymentSettingsConfig, InsuranceSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function BillingPaymentInsuranceSettingsTab() {
  const {
    billingSettings,
    updateBillingSettings,
    paymentSettings,
    updatePaymentSettings,
    insuranceSettings,
    updateInsuranceSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'billing' | 'payments' | 'insurance'>('billing');
  const [billForm, setBillForm] = useState<BillingSettingsConfig>(billingSettings);
  const [payForm, setPayForm] = useState<PaymentSettingsConfig>(paymentSettings);
  const [insForm, setInsForm] = useState<InsuranceSettingsConfig>(insuranceSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'billing') updateBillingSettings(billForm);
    else if (activeSub === 'payments') updatePaymentSettings(payForm);
    else updateInsuranceSettings(insForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeSub === 'billing' ? <DollarSign size={20} /> : activeSub === 'payments' ? <CreditCard size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'billing' ? 'Central Billing, GST Taxes & Concessions' : activeSub === 'payments' ? 'Payment Tender Gateways & Refund Controls' : 'Insurance, TPA & Corporate Account Rules'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure tax slabs, concession approval roles, supported cashier tenders, and corporate MOU windows
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('billing')}
            >
              Billing & Taxes
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('payments')}
            >
              Payment Gateways
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'insurance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('insurance')}
            >
              Insurance / TPA
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsResetOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Financial configuration rules for {activeSub.toUpperCase()} successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Billing & Tax */}
        {activeSub === 'billing' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tax Slabs, Prefixes & Concession Policies</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Medical Service GST (%) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billForm.defaultGstPercent}
                    onChange={e => setBillForm({ ...billForm, defaultGstPercent: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Cashier Concession Limit (%) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billForm.maxCashDiscountPercent}
                    onChange={e => setBillForm({ ...billForm, maxCashDiscountPercent: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Senior Citizen Concession Surcharge (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billForm.seniorCitizenDiscountPercent}
                    onChange={e => setBillForm({ ...billForm, seniorCitizenDiscountPercent: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: '16px 0 0' }}>
                <label className="form-label">Invoice Footer Note</label>
                <input
                  type="text"
                  className="form-input"
                  value={billForm.invoiceFooterNote}
                  onChange={e => setBillForm({ ...billForm, invoiceFooterNote: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={billForm.displayTaxBreakup}
                    onChange={e => setBillForm({ ...billForm, displayTaxBreakup: e.target.checked })}
                  />
                  Print Detailed CGST / SGST Tax Breakdown on Final Invoices
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={billForm.displayDiscountOnReceipt}
                    onChange={e => setBillForm({ ...billForm, displayDiscountOnReceipt: e.target.checked })}
                  />
                  Display Itemized Concessions / Discounts on Patient Receipts
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeSub === 'payments' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Supported Tender Methods & Cashier Refund Authorization</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableCashPayments}
                    onChange={e => setPayForm({ ...payForm, enableCashPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Cash in Hand</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Physical Counter Till</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableCardPayments}
                    onChange={e => setPayForm({ ...payForm, enableCardPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Credit / Debit Cards</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>EDC POS Swiping</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableUpiPayments}
                    onChange={e => setPayForm({ ...payForm, enableUpiPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>UPI & QR Codes</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>BharatPe, GPay, PhonePe</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableInsuranceClaims}
                    onChange={e => setPayForm({ ...payForm, enableInsuranceClaims: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Insurance & TPA Claims</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cashless Pre-Auth</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableBankTransfer}
                    onChange={e => setPayForm({ ...payForm, enableBankTransfer: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>NEFT / RTGS Transfer</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Corporate Accounts</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={payForm.enableCheque}
                    onChange={e => setPayForm({ ...payForm, enableCheque: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Cheque / Demand Draft</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Clearing Process</div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Required Role for Approving Financial Refunds</label>
                  <select
                    className="form-select"
                    value={payForm.refundApprovalRequiredRole}
                    onChange={e => setPayForm({ ...payForm, refundApprovalRequiredRole: e.target.value })}
                  >
                    <option value="hospital_admin">Hospital Administrator</option>
                    <option value="super_admin">Super Administrator Only</option>
                    <option value="billing_staff">Billing Lead</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={payForm.instantDigitalReceiptOnSms}
                      onChange={e => setPayForm({ ...payForm, instantDigitalReceiptOnSms: e.target.checked })}
                    />
                    Dispatch Instant PDF Receipt Download Link via SMS
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance */}
        {activeSub === 'insurance' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Corporate Insurance & TPA Pre-Authorization Rules</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Claim Settlement Window (Days) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={insForm.defaultSettlementPeriodDays}
                    onChange={e => setInsForm({ ...insForm, defaultSettlementPeriodDays: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">TPA Helpdesk Coordinator Contact Line</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={insForm.tpaCoordinatorPhone}
                    onChange={e => setInsForm({ ...insForm, tpaCoordinatorPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={insForm.allowCashlessAdmissionWithoutPreAuth}
                    onChange={e => setInsForm({ ...insForm, allowCashlessAdmissionWithoutPreAuth: e.target.checked })}
                  />
                  Allow Provisional Emergency Cashless Admission Prior to Final Pre-Authorization Approval
                </label>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'billing' ? 'Billing Rules' : activeSub === 'payments' ? 'Payment Gateways' : 'Insurance Policies'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub);
          if (activeSub === 'billing') setBillForm(billingSettings);
          else if (activeSub === 'payments') setPayForm(paymentSettings);
          else setInsForm(insuranceSettings);
        }}
        categoryName={activeSub === 'billing' ? 'Billing & Tax Settings' : activeSub === 'payments' ? 'Payment Settings' : 'Insurance / TPA Rules'}
      />
    </div>
  );
}
