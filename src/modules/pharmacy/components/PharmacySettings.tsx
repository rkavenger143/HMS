import React, { useState } from 'react';
import { Settings, CheckCircle2, ShieldCheck, Pill, Tag } from 'lucide-react';

export default function PharmacySettings() {
  const [dl20B, setDl20B] = useState('KA-B1-20B-88194');
  const [dl21B, setDl21B] = useState('KA-B1-21B-88195');
  const [gstin, setGstin] = useState('29AAACH5519Q1ZT');
  const [chiefPharmacist, setChiefPharmacist] = useState('Praveen Nair, M.Pharm, Reg No: KA-PH-55421');
  const [fefoEnforced, setFefoEnforced] = useState(true);
  const [scheduleH1DoubleSign, setScheduleH1DoubleSign] = useState(true);
  const [disclaimerText, setDisclaimerText] = useState(
    'Medicines sold under valid registered medical practitioner prescription. Refrigerated items (2°C - 8°C) once sold cannot be returned. Please check batch & expiry before leaving counter.'
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Information System (PIS) Master Configurations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Drug license credentials, GSTIN registration, FEFO automated policies, and statutory cash bill declarations
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            ✓ Configurations Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Drug License Credentials */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pharmacy Licensing & Regulatory Registrations</span>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Drug License No. (Form 20B - Allopathic Retail)</label>
                <input
                  type="text"
                  className="form-input"
                  value={dl20B}
                  onChange={e => setDl20B(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Drug License No. (Form 21B - Biologicals/Antibiotics)</label>
                <input
                  type="text"
                  className="form-input"
                  value={dl21B}
                  onChange={e => setDl21B(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pharmacy GSTIN Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supervising Registered Chief Pharmacist</label>
                <input
                  type="text"
                  className="form-input"
                  value={chiefPharmacist}
                  onChange={e => setChiefPharmacist(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Statutory Cash Memo Disclaimer</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={disclaimerText}
                  onChange={e => setDisclaimerText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quality Protocols */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Clinical Inventory & Safety Enforcement Protocols</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={fefoEnforced} onChange={e => setFefoEnforced(e.target.checked)} />
              <span><strong>Enforce Strict FEFO (First-Expiry-First-Out) Dispensing:</strong> Automatically select earliest expiring batches and prevent overrides without supervisor pin.</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={scheduleH1DoubleSign} onChange={e => setScheduleH1DoubleSign(e.target.checked)} />
              <span><strong>Schedule H1 & Narcotic Double-Verification:</strong> Require patient contact details and prescribing doctor verification prior to high-alert drug dispensing.</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={14} /> Save Master Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
