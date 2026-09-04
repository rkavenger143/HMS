import React, { useState } from 'react';
import {
  Stethoscope, BedDouble, Calendar, FlaskConical, Scan,
  Pill, Droplet, Save, CheckCircle2, ShieldCheck, Clock, Settings2
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function ClinicalModuleSettings() {
  const { logAuditEvent } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'opd' | 'ipd' | 'appointments' | 'lab' | 'radiology' | 'pharmacy' | 'blood_bank'>('opd');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    // OPD
    tokenPrefix: 'TKN-',
    consultationDurationMin: 15,
    followUpValidityDays: 7,
    autoCallNextPatient: false,
    opdRegistrationFee: 100,

    // IPD
    admissionBaseCharge: 1000,
    nursingCareDailyRate: 500,
    doctorDailyRoundFee: 800,
    dischargeCutoffTime: '12:00 PM',
    mlcProtocolMandatory: true,

    // Appointments
    appointmentSlotDurationMin: 15,
    maxAdvanceBookingDays: 30,
    cancellationCutoffHours: 4,
    autoNoShowAfterMin: 30,

    // Laboratory
    defaultLabTatHours: 2,
    statPriorityMultiplier: 1.5,
    requirePathologistSignoff: true,
    enableCriticalSmsAlerts: true,

    // Radiology
    modalitySlotDurationMin: 20,
    requireContrastConsent: true,
    requireRadiologistVerification: true,

    // Pharmacy
    lowStockThreshold: 20,
    nearExpiryWarningDays: 30,
    pharmacyGstRate: 12,
    returnWindowDays: 7,

    // Blood Bank
    mandatoryTtiScreening: true,
    prbcShelfLifeDays: 42,
    plateletShelfLifeDays: 5,
    ffpShelfLifeDays: 365,
    criticalGroupThresholdUnits: 2,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    logAuditEvent('Updated Clinical Module Configuration', 'Clinical Settings', `Section: ${activeSubTab.toUpperCase()}`, 'info');
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
              <Settings2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Clinical & Diagnostic Department Configurations</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure OPD queues, IPD tariffs, lab TATs, pharmacy stock rules, and blood bank parameters
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} /> Save Clinical Settings
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Clinical module configuration rules successfully saved and active across all departments!
        </div>
      )}

      {/* Sub-Tabs Pill Navigation */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'thin' }}>
        {[
          { id: 'opd', label: 'OPD Outpatient', icon: Stethoscope },
          { id: 'ipd', label: 'IPD Inpatient', icon: BedDouble },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'lab', label: 'Diagnostic Laboratory', icon: FlaskConical },
          { id: 'radiology', label: 'Radiology & Imaging', icon: Scan },
          { id: 'pharmacy', label: 'Pharmacy & Stock', icon: Pill },
          { id: 'blood_bank', label: 'Blood Bank & Transfusion', icon: Droplet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave}>
        {/* OPD Settings */}
        {activeSubTab === 'opd' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Outpatient Department (OPD) & Token Settings</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Token Number Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={config.tokenPrefix}
                    onChange={e => setConfig({ ...config, tokenPrefix: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default Consultation Slot (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.consultationDurationMin}
                    onChange={e => setConfig({ ...config, consultationDurationMin: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Free Follow-Up Validity (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.followUpValidityDays}
                    onChange={e => setConfig({ ...config, followUpValidityDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">OPD Patient Registration Charge (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.opdRegistrationFee}
                    onChange={e => setConfig({ ...config, opdRegistrationFee: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IPD Settings */}
        {activeSubTab === 'ipd' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Inpatient Department (IPD) & Admission Policies</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Base Admission Processing Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.admissionBaseCharge}
                    onChange={e => setConfig({ ...config, admissionBaseCharge: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Routine Nursing Care Daily Tariff (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.nursingCareDailyRate}
                    onChange={e => setConfig({ ...config, nursingCareDailyRate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Doctor Daily Round Charge (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.doctorDailyRoundFee}
                    onChange={e => setConfig({ ...config, doctorDailyRoundFee: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hospital Discharge Cutoff Billing Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={config.dischargeCutoffTime}
                    onChange={e => setConfig({ ...config, dischargeCutoffTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments */}
        {activeSubTab === 'appointments' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Appointment Scheduling & Slot Allocation</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Appointment Slot Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.appointmentSlotDurationMin}
                    onChange={e => setConfig({ ...config, appointmentSlotDurationMin: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Advance Booking Window (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.maxAdvanceBookingDays}
                    onChange={e => setConfig({ ...config, maxAdvanceBookingDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cancellation Cutoff Notice (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.cancellationCutoffHours}
                    onChange={e => setConfig({ ...config, cancellationCutoffHours: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Auto Mark No-Show After (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.autoNoShowAfterMin}
                    onChange={e => setConfig({ ...config, autoNoShowAfterMin: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Laboratory */}
        {activeSubTab === 'lab' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Diagnostic Laboratory & LIS Benchmarks</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Routine Turnaround Time (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.defaultLabTatHours}
                    onChange={e => setConfig({ ...config, defaultLabTatHours: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">STAT Emergency Fee Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={config.statPriorityMultiplier}
                    onChange={e => setConfig({ ...config, statPriorityMultiplier: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.requirePathologistSignoff}
                      onChange={e => setConfig({ ...config, requirePathologistSignoff: e.target.checked })}
                    />
                    Mandatory Pathologist Signoff Before Report Release
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.enableCriticalSmsAlerts}
                      onChange={e => setConfig({ ...config, enableCriticalSmsAlerts: e.target.checked })}
                    />
                    Dispatch STAT SMS Alerts to Doctor for Critical High/Low Results
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Radiology */}
        {activeSubTab === 'radiology' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Radiology & Medical Imaging (RIS) Protocol</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Modality Slot Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.modalitySlotDurationMin}
                    onChange={e => setConfig({ ...config, modalitySlotDurationMin: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.requireContrastConsent}
                      onChange={e => setConfig({ ...config, requireContrastConsent: e.target.checked })}
                    />
                    Enforce Mandatory Signed Consent for IV Contrast Studies
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.requireRadiologistVerification}
                      onChange={e => setConfig({ ...config, requireRadiologistVerification: e.target.checked })}
                    />
                    Require Consultant Radiologist Digital Verification & Signature
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pharmacy */}
        {activeSubTab === 'pharmacy' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Pharmacy Retail & Inventory Thresholds</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Low Stock Reorder Threshold (Units)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.lowStockThreshold}
                    onChange={e => setConfig({ ...config, lowStockThreshold: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Near-Expiry Warning Threshold (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.nearExpiryWarningDays}
                    onChange={e => setConfig({ ...config, nearExpiryWarningDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Pharmacy GST Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.pharmacyGstRate}
                    onChange={e => setConfig({ ...config, pharmacyGstRate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Medicine Return Policy Window (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.returnWindowDays}
                    onChange={e => setConfig({ ...config, returnWindowDays: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blood Bank */}
        {activeSubTab === 'blood_bank' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Blood Bank, Component Shelf Life & Safety Policies</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">PRBC Shelf Life (Days at 2-6°C)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.prbcShelfLifeDays}
                    onChange={e => setConfig({ ...config, prbcShelfLifeDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Platelet Shelf Life (Days at 22°C Agitator)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.plateletShelfLifeDays}
                    onChange={e => setConfig({ ...config, plateletShelfLifeDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">FFP Plasma Shelf Life (Days at -30°C)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.ffpShelfLifeDays}
                    onChange={e => setConfig({ ...config, ffpShelfLifeDays: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Critical Blood Group Low Threshold (Units)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.criticalGroupThresholdUnits}
                    onChange={e => setConfig({ ...config, criticalGroupThresholdUnits: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save All Clinical Settings
          </button>
        </div>
      </form>
    </div>
  );
}
