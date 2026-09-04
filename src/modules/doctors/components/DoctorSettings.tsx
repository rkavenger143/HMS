import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';

export default function DoctorSettings() {
  const [defaultSlotMins, setDefaultSlotMins] = useState(15);
  const [autoBillingCharge, setAutoBillingCharge] = useState(true);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(true);
  const [requireDiagnosisBeforePrescribe, setRequireDiagnosisBeforePrescribe] = useState(true);

  const handleSave = () => {
    alert('Doctor Module Configuration Saved Successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Doctor Module System Preferences & Clinical Defaults
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configure consultation workflows, automated Central Billing triggers, and appointment slot rules
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={14} /> Save Preferences
        </button>
      </div>

      {/* Settings Options Grid */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Auto-Generate Central Billing Consultation Charge</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Automatically creates an itemized OPD consultation invoice in Central Billing upon completing a consultation.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoBillingCharge}
              onChange={e => setAutoBillingCharge(e.target.checked)}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Mandatory Primary Diagnosis Validation</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Requires doctors to record a primary diagnosis/ICD code before finalizing prescriptions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={requireDiagnosisBeforePrescribe}
              onChange={e => setRequireDiagnosisBeforePrescribe(e.target.checked)}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Allow Emergency OPD Overbooking</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Permits emergency walk-in tokens to exceed normal session quotas.
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowOverbooking}
              onChange={e => setAllowOverbooking(e.target.checked)}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Automated Patient Prescription SMS Dispatch</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Sends digital Rx link to patient mobile upon physician consultation sign-off.
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableSmsNotifications}
              onChange={e => setEnableSmsNotifications(e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
