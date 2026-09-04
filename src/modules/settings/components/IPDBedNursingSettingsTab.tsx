import React, { useState } from 'react';
import {
  BedDouble, HeartPulse, Save, RotateCcw, CheckCircle2,
  DollarSign, Clock, ShieldCheck, Activity, Users
} from 'lucide-react';
import { useSettings, IPDSettingsConfig, BedSettingsConfig, NursingSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function IPDBedNursingSettingsTab() {
  const {
    ipdSettings,
    updateIPDSettings,
    bedSettings,
    updateBedSettings,
    nursingSettings,
    updateNursingSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'ipd' | 'beds' | 'nursing'>('ipd');
  const [ipdForm, setIpdForm] = useState<IPDSettingsConfig>(ipdSettings);
  const [bedForm, setBedForm] = useState<BedSettingsConfig>(bedSettings);
  const [nursingForm, setNursingForm] = useState<NursingSettingsConfig>(nursingSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'ipd') updateIPDSettings(ipdForm);
    else if (activeSub === 'beds') updateBedSettings(bedForm);
    else updateNursingSettings(nursingForm);

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
              {activeSub === 'nursing' ? <HeartPulse size={20} /> : <BedDouble size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'ipd' ? 'IPD Inpatient Policies & Admission Tariffs' : activeSub === 'beds' ? 'Hospital Beds & Ward Tariffs' : 'Nursing Care Shifts & Vitals Monitoring Rules'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure inpatient daily billing rates, bed category tariffs, duty shift schedules, and bedside nursing intervals
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'ipd' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('ipd')}
            >
              IPD Policies
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'beds' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('beds')}
            >
              Bed Tariffs
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'nursing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('nursing')}
            >
              Nursing Rules
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
          Configuration rules for {activeSub.toUpperCase()} successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* IPD Policies */}
        {activeSub === 'ipd' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Inpatient Admission Charges & Billing Cutoffs</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Base Admission Processing Fee (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={ipdForm.baseAdmissionCharge}
                    onChange={e => setIpdForm({ ...ipdForm, baseAdmissionCharge: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Routine Nursing Care Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={ipdForm.nursingCareDailyRate}
                    onChange={e => setIpdForm({ ...ipdForm, nursingCareDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Doctor Daily Round Fee (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={ipdForm.doctorDailyRoundFee}
                    onChange={e => setIpdForm({ ...ipdForm, doctorDailyRoundFee: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hospital Discharge Cutoff Billing Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ipdForm.dischargeCutoffTime}
                    onChange={e => setIpdForm({ ...ipdForm, dischargeCutoffTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Emergency Admission Mandatory Deposit (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={ipdForm.emergencyAdmissionDeposit}
                    onChange={e => setIpdForm({ ...ipdForm, emergencyAdmissionDeposit: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={ipdForm.mlcProtocolMandatory}
                      onChange={e => setIpdForm({ ...ipdForm, mlcProtocolMandatory: e.target.checked })}
                    />
                    Mandatory MLC (Medico-Legal Case) Documentation Flag
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bed Tariffs */}
        {activeSub === 'beds' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Hospital Bed Category Daily Tariffs (Per 24h)</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">General Ward Bed Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.generalWardDailyRate}
                    onChange={e => setBedForm({ ...bedForm, generalWardDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Semi-Private Room Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.semiPrivateDailyRate}
                    onChange={e => setBedForm({ ...bedForm, semiPrivateDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Deluxe Private Room Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.privateRoomDailyRate}
                    onChange={e => setBedForm({ ...bedForm, privateRoomDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Intensive Care Unit (ICU) Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.icuDailyRate}
                    onChange={e => setBedForm({ ...bedForm, icuDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Isolation Ward Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.isolationDailyRate}
                    onChange={e => setBedForm({ ...bedForm, isolationDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Emergency Trauma Bay Daily Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bedForm.emergencyBayDailyRate}
                    onChange={e => setBedForm({ ...bedForm, emergencyBayDailyRate: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={bedForm.autoSanitizationStatusAfterDischarge}
                    onChange={e => setBedForm({ ...bedForm, autoSanitizationStatusAfterDischarge: e.target.checked })}
                  />
                  Auto Change Bed Status to &quot;Cleaning / Sanitizing&quot; Upon Inpatient Discharge
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Nursing Care */}
        {activeSub === 'nursing' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Nursing Shift Schedules & Vitals Monitoring Intervals</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Shift Duration (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={nursingForm.shiftDurationHours}
                    onChange={e => setNursingForm({ ...nursingForm, shiftDurationHours: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vitals Monitoring Interval (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={nursingForm.vitalsMonitoringIntervalHours}
                    onChange={e => setNursingForm({ ...nursingForm, vitalsMonitoringIntervalHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={nursingForm.mandatoryMedicationAlerts}
                    onChange={e => setNursingForm({ ...nursingForm, mandatoryMedicationAlerts: e.target.checked })}
                  />
                  Mandatory MAR Scheduled Medication Due Alerts
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={nursingForm.shiftHandoverNoteRequired}
                    onChange={e => setNursingForm({ ...nursingForm, shiftHandoverNoteRequired: e.target.checked })}
                  />
                  Require Signed Nursing Handover Notes on Every Shift Change
                </label>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'ipd' ? 'IPD Policies' : activeSub === 'beds' ? 'Bed Tariffs' : 'Nursing Settings'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub);
          if (activeSub === 'ipd') setIpdForm(ipdSettings);
          else if (activeSub === 'beds') setBedForm(bedSettings);
          else setNursingForm(nursingSettings);
        }}
        categoryName={activeSub === 'ipd' ? 'IPD Inpatient Policies' : activeSub === 'beds' ? 'Bed & Ward Tariffs' : 'Nursing Rules'}
      />
    </div>
  );
}
