import React, { useState } from 'react';
import { Settings, CheckCircle2, ShieldCheck, Tag, Building2 } from 'lucide-react';

export default function BillingSettings() {
  const [gstin, setGstin] = useState('29AAACH5519Q1ZT');
  const [pan, setPan] = useState('AAACH5519Q');
  const [invPrefix, setInvPrefix] = useState('INV-2026-');
  const [receiptPrefix, setReceiptPrefix] = useState('RCPT-2026-');
  const [advancePrefix, setAdvancePrefix] = useState('ADV-2026-');
  const [refundPrefix, setRefundPrefix] = useState('REF-2026-');
  const [discountThreshold, setDiscountThreshold] = useState(1000);
  const [supervisorPinRequired, setSupervisorPinRequired] = useState(true);
  const [termsText, setTermsText] = useState(
    '1. All hospital consultations and inpatient bed charges are exempt from GST under Notification No. 12/2017-Central Tax. 2. Medicines and clinical consumables are subject to applicable GST slabs. 3. Refunds are subject to medical audit approval. 4. Inpatient advance is adjustable against final discharge bill.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Central Billing & Financial Master Configurations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hospital GSTIN credentials, statutory SAC tax rules, invoice number formatting, and discount approval thresholds
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            ✓ Settings Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Hospital Tax Credentials */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Statutory Tax Credentials</span>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Hospital GSTIN Registration Number</label>
                <input type="text" className="form-input" value={gstin} onChange={e => setGstin(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Permanent Account Number (PAN)</label>
                <input type="text" className="form-input" value={pan} onChange={e => setPan(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Number Prefix Format</label>
                <input type="text" className="form-input" value={invPrefix} onChange={e => setInvPrefix(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Receipt Prefix Format</label>
                <input type="text" className="form-input" value={receiptPrefix} onChange={e => setReceiptPrefix(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Inpatient Advance Prefix Format</label>
                <input type="text" className="form-input" value={advancePrefix} onChange={e => setAdvancePrefix(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Refund Credit Note Prefix Format</label>
                <input type="text" className="form-input" value={refundPrefix} onChange={e => setRefundPrefix(e.target.value)} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Official Tax Invoice Terms & Legal Declarations</label>
                <textarea className="form-textarea" rows={3} value={termsText} onChange={e => setTermsText(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Quality Controls */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Financial Safety & Discount Authorization Controls</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group" style={{ maxWidth: 380 }}>
              <label className="form-label">Discount Threshold Requiring Superintendent PIN (₹)</label>
              <input
                type="number"
                step="100"
                className="form-input"
                value={discountThreshold}
                onChange={e => setDiscountThreshold(Number(e.target.value))}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={supervisorPinRequired}
                onChange={e => setSupervisorPinRequired(e.target.checked)}
              />
              <span>
                <strong>Enforce Supervisor Signoff on Refunds & Waivers:</strong> Require Medical Superintendent or Billing Manager credentials prior to processing patient refunds or waivers above ₹{discountThreshold}.
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={14} /> Save Master Settings
          </button>
        </div>
      </form>
    </div>
  );
}
