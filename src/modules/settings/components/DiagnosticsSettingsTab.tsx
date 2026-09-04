import React, { useState } from 'react';
import {
  FlaskConical, Scan, Save, RotateCcw, CheckCircle2,
  Clock, ShieldCheck, FileCheck, Radio
} from 'lucide-react';
import { useSettings, LaboratorySettingsConfig, RadiologySettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function DiagnosticsSettingsTab() {
  const {
    labSettings,
    updateLabSettings,
    radiologySettings,
    updateRadiologySettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'laboratory' | 'radiology'>('laboratory');
  const [labForm, setLabForm] = useState<LaboratorySettingsConfig>(labSettings);
  const [radForm, setRadForm] = useState<RadiologySettingsConfig>(radiologySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'laboratory') {
      updateLabSettings(labForm);
    } else {
      updateRadiologySettings(radForm);
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
              {activeSub === 'laboratory' ? <FlaskConical size={20} /> : <Scan size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'laboratory' ? 'Diagnostic Laboratory & LIS Benchmarks' : 'Radiology & Medical Imaging (RIS / PACS) Settings'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure turnaround times, STAT multipliers, approval workflows, and PACS integration
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'laboratory' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('laboratory')}
            >
              Laboratory (LIS)
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'radiology' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('radiology')}
            >
              Radiology (RIS)
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
          {activeSub === 'laboratory' ? 'Laboratory configuration' : 'Radiology configuration'} successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSub === 'laboratory' ? (
          <>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Turnaround Times & STAT Emergency Tariffs</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Standard Routine Turnaround Time (Hours) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={labForm.defaultLabTatHours}
                      onChange={e => setLabForm({ ...labForm, defaultLabTatHours: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">STAT Emergency Tariff Multiplier *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={labForm.statPriorityMultiplier}
                      onChange={e => setLabForm({ ...labForm, statPriorityMultiplier: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Laboratory Working Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      value={labForm.labWorkingHours}
                      onChange={e => setLabForm({ ...labForm, labWorkingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={labForm.requirePathologistSignoff}
                      onChange={e => setLabForm({ ...labForm, requirePathologistSignoff: e.target.checked })}
                    />
                    Mandatory Pathologist Signoff Before Releasing Lab Reports
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={labForm.enableCriticalSmsAlerts}
                      onChange={e => setLabForm({ ...labForm, enableCriticalSmsAlerts: e.target.checked })}
                    />
                    Dispatch STAT SMS Alerts to Attending Physician on Critical Low/High Values
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={labForm.autoPrintBarcodeOnAccession}
                      onChange={e => setLabForm({ ...labForm, autoPrintBarcodeOnAccession: e.target.checked })}
                    />
                    Auto Trigger Barcode Label Printing on Phlebotomy Sample Accession
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Modality Intervals & Clinical Signoff Policies</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Modality Slot Duration (Minutes) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={radForm.modalitySlotDurationMin}
                      onChange={e => setRadForm({ ...radForm, modalitySlotDurationMin: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Radiology Department Schedule</label>
                    <input
                      type="text"
                      className="form-input"
                      value={radForm.radiologyWorkingHours}
                      onChange={e => setRadForm({ ...radForm, radiologyWorkingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={radForm.requireContrastConsent}
                      onChange={e => setRadForm({ ...radForm, requireContrastConsent: e.target.checked })}
                    />
                    Mandatory Signed Patient Consent for Intravenous (IV) Contrast Studies
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={radForm.requireRadiologistVerification}
                      onChange={e => setRadForm({ ...radForm, requireRadiologistVerification: e.target.checked })}
                    />
                    Require Consultant Radiologist Digital Signature Before Report Release
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={radForm.pacsIntegrationEnabled}
                      onChange={e => setRadForm({ ...radForm, pacsIntegrationEnabled: e.target.checked })}
                    />
                    Enable DICOM / PACS Server Bi-directional Synchronization
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'laboratory' ? 'Laboratory Settings' : 'Radiology Settings'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub);
          if (activeSub === 'laboratory') setLabForm(labSettings);
          else setRadForm(radiologySettings);
        }}
        categoryName={activeSub === 'laboratory' ? 'Diagnostic Laboratory Settings' : 'Radiology Settings'}
      />
    </div>
  );
}
