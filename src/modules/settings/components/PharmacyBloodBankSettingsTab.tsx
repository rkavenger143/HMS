import React, { useState } from 'react';
import {
  Pill, Droplets, Save, RotateCcw, CheckCircle2,
  AlertTriangle, ShieldCheck, Clock, Percent, DollarSign
} from 'lucide-react';
import { useSettings, PharmacySettingsConfig, BloodBankSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function PharmacyBloodBankSettingsTab() {
  const {
    pharmacySettings,
    updatePharmacySettings,
    bloodBankSettings,
    updateBloodBankSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'pharmacy' | 'blood_bank'>('pharmacy');
  const [pharmacyForm, setPharmacyForm] = useState<PharmacySettingsConfig>(pharmacySettings);
  const [bloodForm, setBloodForm] = useState<BloodBankSettingsConfig>(bloodBankSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'pharmacy') {
      updatePharmacySettings(pharmacyForm);
    } else {
      updateBloodBankSettings(bloodForm);
    }
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
              {activeSub === 'pharmacy' ? <Pill size={20} /> : <Droplets size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'pharmacy' ? 'Pharmacy Inventory, POS & Stock Thresholds' : 'Blood Bank Component Shelf Lives & Transfusion Safety'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure reorder points, expiry warning triggers, blood component storage limits, and TTI testing rules
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'pharmacy' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('pharmacy')}
            >
              Pharmacy Settings
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'blood_bank' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('blood_bank')}
            >
              Blood Bank Safety
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
          {activeSub === 'pharmacy' ? 'Pharmacy parameters' : 'Blood Bank safety rules'} successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSub === 'pharmacy' ? (
          <>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Inventory Thresholds & POS Tax Policies</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Low Stock Reorder Threshold (Units) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pharmacyForm.lowStockThreshold}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, lowStockThreshold: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Near-Expiry Warning Window (Days) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pharmacyForm.nearExpiryWarningDays}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, nearExpiryWarningDays: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Standard Pharmacy GST Rate (%) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pharmacyForm.pharmacyGstRate}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, pharmacyGstRate: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Medicine Return Policy Window (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pharmacyForm.returnWindowDays}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, returnWindowDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={pharmacyForm.autoDeductStockOnDispense}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, autoDeductStockOnDispense: e.target.checked })}
                    />
                    Automatically Deduct Inventory Batches When Dispensed at POS Counter
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={pharmacyForm.allowDispenseWithoutPrescription}
                      onChange={e => setPharmacyForm({ ...pharmacyForm, allowDispenseWithoutPrescription: e.target.checked })}
                    />
                    Allow OTC (Over-The-Counter) Retail Sales Without Clinical Prescription
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Blood Component Storage Limits & Critical Safety Rules</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">PRBC Packed Cells Shelf Life (Days at 2-6°C) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={bloodForm.prbcShelfLifeDays}
                      onChange={e => setBloodForm({ ...bloodForm, prbcShelfLifeDays: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Platelet Concentrate Shelf Life (Days at 22°C Agitator) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={bloodForm.plateletShelfLifeDays}
                      onChange={e => setBloodForm({ ...bloodForm, plateletShelfLifeDays: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Fresh Frozen Plasma (FFP) Shelf Life (Days at -30°C) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={bloodForm.ffpShelfLifeDays}
                      onChange={e => setBloodForm({ ...bloodForm, ffpShelfLifeDays: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Critical Blood Group Low Stock Threshold (Units)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={bloodForm.criticalGroupThresholdUnits}
                      onChange={e => setBloodForm({ ...bloodForm, criticalGroupThresholdUnits: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={bloodForm.mandatoryTtiScreening}
                      onChange={e => setBloodForm({ ...bloodForm, mandatoryTtiScreening: e.target.checked })}
                    />
                    Enforce Mandatory 5-Marker TTI Serology Clearance (HIV, HBV, HCV, Syphilis, Malaria)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={bloodForm.allowEmergencyOTypeReleaseWithoutCrossmatch}
                      onChange={e => setBloodForm({ ...bloodForm, allowEmergencyOTypeReleaseWithoutCrossmatch: e.target.checked })}
                    />
                    Allow Emergency O-Negative Uncrossmatched Release for Code Red Trauma
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'pharmacy' ? 'Pharmacy Rules' : 'Blood Bank Parameters'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub);
          if (activeSub === 'pharmacy') setPharmacyForm(pharmacySettings);
          else setBloodForm(bloodBankSettings);
        }}
        categoryName={activeSub === 'pharmacy' ? 'Pharmacy Inventory Settings' : 'Blood Bank Safety Settings'}
      />
    </div>
  );
}
