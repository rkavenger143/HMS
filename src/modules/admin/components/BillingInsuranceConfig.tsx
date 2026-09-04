import React, { useState } from 'react';
import {
  DollarSign, Shield, Plus, Edit3, CheckCircle2, Building2,
  FileSpreadsheet, Save, CreditCard, Percent, ArrowRight
} from 'lucide-react';
import { useAdmin, InsuranceCompany } from '../context/AdminContext';

export default function BillingInsuranceConfig() {
  const {
    insuranceCompanies,
    addInsuranceCompany,
    updateInsuranceCompany,
    systemSettings,
    updateSystemSettings,
    exportCSV
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'billing' | 'insurance'>('billing');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Billing & Prefix State
  const [billingConfig, setBillingConfig] = useState({
    invoicePrefix: systemSettings.invoicePrefix || 'INV-2026-',
    receiptPrefix: systemSettings.receiptPrefix || 'REC-2026-',
    advanceReceiptPrefix: 'ADV-2026-',
    defaultGstPercent: 18,
    maxCashDiscountPercent: 10,
    seniorCitizenDiscountPercent: 5,
    enableCashPayments: true,
    enableCardPayments: true,
    enableUpiPayments: true,
    enableInsuranceClaims: true,
  });

  // Insurance Modal state
  const [isInsModalOpen, setIsInsModalOpen] = useState(false);
  const [editingIns, setEditingIns] = useState<InsuranceCompany | null>(null);
  const [insForm, setInsForm] = useState<Omit<InsuranceCompany, 'id'>>({
    name: '',
    code: '',
    type: 'Insurance',
    contactPerson: '',
    phone: '',
    email: '',
    settlementPeriodDays: 15,
    discountPercentage: 5,
    isActive: true,
  });

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      invoicePrefix: billingConfig.invoicePrefix,
      receiptPrefix: billingConfig.receiptPrefix,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenInsModal = (comp?: InsuranceCompany) => {
    if (comp) {
      setEditingIns(comp);
      setInsForm({
        name: comp.name,
        code: comp.code,
        type: comp.type,
        contactPerson: comp.contactPerson,
        phone: comp.phone,
        email: comp.email,
        settlementPeriodDays: comp.settlementPeriodDays,
        discountPercentage: comp.discountPercentage,
        isActive: comp.isActive,
      });
    } else {
      setEditingIns(null);
      setInsForm({
        name: '',
        code: '',
        type: 'Insurance',
        contactPerson: '',
        phone: '',
        email: '',
        settlementPeriodDays: 15,
        discountPercentage: 5,
        isActive: true,
      });
    }
    setIsInsModalOpen(true);
  };

  const handleSaveInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIns) {
      updateInsuranceCompany(editingIns.id, insForm);
    } else {
      addInsuranceCompany(insForm);
    }
    setIsInsModalOpen(false);
  };

  const handleExportInsuranceCSV = () => {
    const rows = insuranceCompanies.map(c => [
      c.id,
      c.name,
      c.code,
      c.type,
      c.contactPerson,
      c.phone,
      c.email,
      `${c.settlementPeriodDays} Days`,
      `${c.discountPercentage}%`,
      c.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);

    exportCSV(
      'HMS_Insurance_TPA_Partner_Registry',
      ['Company ID', 'Company Name', 'Code', 'Category', 'Contact Person', 'Phone', 'Email', 'Settlement Window', 'MOU Discount', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Central Billing, Tariffs, Taxes & Insurance / TPA</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure invoice prefixes, GST tax slabs, concession policies, and corporate insurance providers
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('billing')}
            >
              Billing & Taxes
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'insurance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('insurance')}
            >
              Insurance & TPA Partners ({insuranceCompanies.length})
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Billing parameters, tax rules, and invoice sequences successfully updated!
        </div>
      )}

      {activeTab === 'billing' ? (
        <form onSubmit={handleSaveBilling} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Invoice Prefix & Numbering */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Document Numbering & Sequence Prefixes</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tax Invoice Prefix *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingConfig.invoicePrefix}
                    onChange={e => setBillingConfig({ ...billingConfig, invoicePrefix: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    e.g. {billingConfig.invoicePrefix}0001
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Payment Receipt Prefix *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingConfig.receiptPrefix}
                    onChange={e => setBillingConfig({ ...billingConfig, receiptPrefix: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">IPD Advance Deposit Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingConfig.advanceReceiptPrefix}
                    onChange={e => setBillingConfig({ ...billingConfig, advanceReceiptPrefix: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Slabs & Discounts */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">GST Tax Rules & Concession Limits</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Medical Service GST (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billingConfig.defaultGstPercent}
                    onChange={e => setBillingConfig({ ...billingConfig, defaultGstPercent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Allowed Staff Concession (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billingConfig.maxCashDiscountPercent}
                    onChange={e => setBillingConfig({ ...billingConfig, maxCashDiscountPercent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Senior Citizen Concession Surcharge (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billingConfig.seniorCitizenDiscountPercent}
                    onChange={e => setBillingConfig({ ...billingConfig, seniorCitizenDiscountPercent: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Supported Tender Methods */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Supported Tender Payment Channels</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={billingConfig.enableCashPayments}
                    onChange={e => setBillingConfig({ ...billingConfig, enableCashPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Cash in Hand</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Physical Counter Till</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={billingConfig.enableCardPayments}
                    onChange={e => setBillingConfig({ ...billingConfig, enableCardPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Credit / Debit Cards</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>EDC POS Swiping</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={billingConfig.enableUpiPayments}
                    onChange={e => setBillingConfig({ ...billingConfig, enableUpiPayments: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>UPI / QR Codes</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Instant BharatPe / PhonePe</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={billingConfig.enableInsuranceClaims}
                    onChange={e => setBillingConfig({ ...billingConfig, enableInsuranceClaims: e.target.checked })}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>Insurance & TPA</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cashless Pre-Auth</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={15} /> Save Billing & Tax Policies
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Insurance Companies Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Contracted Insurance Companies, TPAs & Corporate Accounts
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExportInsuranceCSV}
              >
                <FileSpreadsheet size={13} /> Export CSV
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenInsModal()}
              >
                <Plus size={14} /> Add Insurance Partner
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {insuranceCompanies.map(c => (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `3px solid ${c.type === 'Insurance' ? '#0284c7' : c.type === 'TPA' ? '#8b5cf6' : '#10b981'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>{c.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{c.code}</div>
                    </div>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {c.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div><strong>Coordinator:</strong> {c.contactPerson}</div>
                    <div><strong>Phone:</strong> {c.phone}</div>
                    <div><strong>Email:</strong> {c.email}</div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 12 }}>
                      <span className="badge badge-neutral">⏱ {c.settlementPeriodDays}d Settlement</span>
                      <span className="badge badge-neutral">🏷 {c.discountPercentage}% MOU Disc</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleOpenInsModal(c)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Edit3 size={13} /> Edit MOU Terms
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Insurance Modal */}
      {isInsModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ maxWidth: 500, width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="modal-title">{editingIns ? 'Edit Insurance MOU' : 'Register Insurance / TPA Partner'}</h3>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setIsInsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInsurance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Company Legal Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Star Health & Allied Insurance Co."
                    value={insForm.name}
                    onChange={e => setInsForm({ ...insForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Partner Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. STAR-001"
                      value={insForm.code}
                      onChange={e => setInsForm({ ...insForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Partner Type</label>
                    <select
                      className="form-select"
                      value={insForm.type}
                      onChange={e => setInsForm({ ...insForm, type: e.target.value as any })}
                    >
                      <option value="Insurance">Insurance Company</option>
                      <option value="TPA">Third-Party Administrator (TPA)</option>
                      <option value="Corporate">Corporate / PSU Account</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Desk Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mr. Alok Saxena"
                      value={insForm.contactPerson}
                      onChange={e => setInsForm({ ...insForm, contactPerson: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Desk Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91-9876543210"
                      value={insForm.phone}
                      onChange={e => setInsForm({ ...insForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Claims Authorizations Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="claims@starhealth.in"
                    value={insForm.email}
                    onChange={e => setInsForm({ ...insForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Settlement Window (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={insForm.settlementPeriodDays}
                      onChange={e => setInsForm({ ...insForm, settlementPeriodDays: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">MOU Tariff Discount (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={insForm.discountPercentage}
                      onChange={e => setInsForm({ ...insForm, discountPercentage: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsInsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIns ? 'Save Terms' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
