import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, BedDouble, ShieldCheck, DollarSign } from 'lucide-react';
import { useIPD } from '../context/IPDContext';

export default function IPDSettings() {
  const [saved, setSaved] = useState(false);
  const [autoSanitizeMin, setAutoSanitizeMin] = useState(30);
  const [requireBillingClearance, setRequireBillingClearance] = useState(true);
  const [allowOverbookingICU, setAllowOverbookingICU] = useState(false);
  const [standardGeneralTariff, setStandardGeneralTariff] = useState(1500);
  const [standardIcuTariff, setStandardIcuTariff] = useState(7500);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} style={{ color: 'var(--color-primary)' }} />
            Inpatient & Bed Management System Settings
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Configure sanitization protocols, admission advance thresholds, discharge billing locks, and base ward tariffs
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '12px 16px', background: 'var(--color-success-muted)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} /> IPD Settings and tariff configuration saved successfully.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">General Ward Base Tariff (₹/day)</label>
              <input
                type="number"
                className="form-input"
                value={standardGeneralTariff}
                onChange={e => setStandardGeneralTariff(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ICU / CCU Base Tariff (₹/day)</label>
              <input
                type="number"
                className="form-input"
                value={standardIcuTariff}
                onChange={e => setStandardIcuTariff(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Post-Discharge Bed Cleaning Time (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={autoSanitizeMin}
                onChange={e => setAutoSanitizeMin(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                id="requireBillingClearance"
                checked={requireBillingClearance}
                onChange={e => setRequireBillingClearance(e.target.checked)}
              />
              <label htmlFor="requireBillingClearance" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Require Central Billing Clearance Before Physical Bed Discharge Confirmation
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                id="allowOverbookingICU"
                checked={allowOverbookingICU}
                onChange={e => setAllowOverbookingICU(e.target.checked)}
              />
              <label htmlFor="allowOverbookingICU" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Allow Emergency Standby Triage Allocation when ICU Beds are at 100% Capacity
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={14} /> Save IPD Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
