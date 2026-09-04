import React, { useState } from 'react';
import {
  Users, Stethoscope, Save, RotateCcw, CheckCircle2,
  DollarSign, Clock, ShieldCheck, UserCheck
} from 'lucide-react';
import { useSettings, PatientSettingsConfig, DoctorSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function PatientDoctorSettingsTab() {
  const {
    patientSettings,
    updatePatientSettings,
    doctorSettings,
    updateDoctorSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'patients' | 'doctors'>('patients');
  const [patForm, setPatForm] = useState<PatientSettingsConfig>(patientSettings);
  const [docForm, setDocForm] = useState<DoctorSettingsConfig>(doctorSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'patients') updatePatientSettings(patForm);
    else updateDoctorSettings(docForm);

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
              {activeSub === 'patients' ? <Users size={20} /> : <Stethoscope size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'patients' ? 'Patient Demographics & Registration Rules' : 'Physician Defaults & Consultation Tariffs'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure patient chart de-duplication, required statutory fields, doctor ID formats, and consultation defaults
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'patients' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('patients')}
            >
              Patient Rules
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'doctors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('doctors')}
            >
              Doctor Defaults
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
          {activeSub === 'patients' ? 'Patient registration rules' : 'Doctor default parameters'} successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Patient Rules */}
        {activeSub === 'patients' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Registration De-duplication & Required Fields</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Patient MRN Prefix *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patForm.patientIdPrefix}
                    onChange={e => setPatForm({ ...patForm, patientIdPrefix: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={patForm.enableDuplicateDetection}
                    onChange={e => setPatForm({ ...patForm, enableDuplicateDetection: e.target.checked })}
                  />
                  Enable Live Duplicate Patient Chart Detection During Intake
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={patForm.requireGovtIdOnRegistration}
                    onChange={e => setPatForm({ ...patForm, requireGovtIdOnRegistration: e.target.checked })}
                  />
                  Require Government ID Verification (Aadhaar / Passport / DL) on Chart Creation
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={patForm.emergencyPatientAutoMrn}
                    onChange={e => setPatForm({ ...patForm, emergencyPatientAutoMrn: e.target.checked })}
                  />
                  Auto-Assign Temporary Emergency MRN for Unconscious / Unknown Trauma Arrivals
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Defaults */}
        {activeSub === 'doctors' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Doctor Consultation Tariffs & Booking Slot Defaults</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Doctor Employee Code Prefix *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docForm.doctorIdPrefix}
                    onChange={e => setDocForm({ ...docForm, doctorIdPrefix: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default Consultation Tariff (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={docForm.defaultConsultationFee}
                    onChange={e => setDocForm({ ...docForm, defaultConsultationFee: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Appointment Slot (Minutes) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={docForm.defaultSlotDurationMin}
                    onChange={e => setDocForm({ ...docForm, defaultSlotDurationMin: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={docForm.allowDoctorScheduleOverride}
                    onChange={e => setDocForm({ ...docForm, allowDoctorScheduleOverride: e.target.checked })}
                  />
                  Allow Attending Physicians to Self-Adjust Their Daily OPD Consulting Slot Timings
                </label>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'patients' ? 'Patient Rules' : 'Doctor Defaults'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub === 'patients' ? 'patients' : 'doctors');
          if (activeSub === 'patients') setPatForm(patientSettings);
          else setDocForm(doctorSettings);
        }}
        categoryName={activeSub === 'patients' ? 'Patient Registration Rules' : 'Doctor Clinical Defaults'}
      />
    </div>
  );
}
