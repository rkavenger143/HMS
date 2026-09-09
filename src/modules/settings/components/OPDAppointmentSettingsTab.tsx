import React, { useState } from 'react';
import {
  Stethoscope, Calendar, Save, RotateCcw, CheckCircle2,
  Clock, Users, Bell, DollarSign, CheckSquare
} from 'lucide-react';
import { useSettings, OPDSettingsConfig, AppointmentSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function OPDAppointmentSettingsTab() {
  const {
    opdSettings,
    updateOPDSettings,
    appointmentSettings,
    updateAppointmentSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'opd' | 'appointments'>('opd');
  const [opdForm, setOpdForm] = useState<OPDSettingsConfig>(opdSettings);
  const [apptForm, setApptForm] = useState<AppointmentSettingsConfig>(appointmentSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'opd') {
      updateOPDSettings(opdForm);
    } else {
      updateAppointmentSettings(apptForm);
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
              {activeSub === 'opd' ? <Stethoscope size={20} /> : <Calendar size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'opd' ? 'OPD Outpatient Department & Queue Settings' : 'Appointment Scheduling & Slot Allocation Rules'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure working schedules, consulting slot intervals, token queues, and patient booking windows
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'opd' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('opd')}
            >
              OPD Settings
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('appointments')}
            >
              Appointment Rules
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
          {activeSub === 'opd' ? 'OPD Outpatient parameters' : 'Appointment booking rules'} successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSub === 'opd' ? (
          <>
            {/* OPD Hours & Slot */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">OPD Working Hours & Consultation Duration</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">OPD Shift Start Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={opdForm.workingHoursStart}
                      onChange={e => setOpdForm({ ...opdForm, workingHoursStart: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">OPD Shift End Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={opdForm.workingHoursEnd}
                      onChange={e => setOpdForm({ ...opdForm, workingHoursEnd: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Standard Consultation Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={opdForm.consultationDurationMin}
                      onChange={e => setOpdForm({ ...opdForm, consultationDurationMin: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Max Patients Per Hour Slot</label>
                    <input
                      type="number"
                      className="form-input"
                      value={opdForm.maxPatientsPerSlot}
                      onChange={e => setOpdForm({ ...opdForm, maxPatientsPerSlot: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OPD Tariffs & Queue */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tariffs, Tokens & Follow-Up Period</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">OPD Registration Fee (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={opdForm.opdRegistrationFee}
                      onChange={e => setOpdForm({ ...opdForm, opdRegistrationFee: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Consultation Tariff (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={opdForm.defaultConsultationFee}
                      onChange={e => setOpdForm({ ...opdForm, defaultConsultationFee: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Free Follow-Up Validity (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={opdForm.followUpValidityDays}
                      onChange={e => setOpdForm({ ...opdForm, followUpValidityDays: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={opdForm.autoCallNextPatient}
                        onChange={e => setOpdForm({ ...opdForm, autoCallNextPatient: e.target.checked })}
                      />
                      Auto Advance Queue When Doctor Completes Rx
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Appointments */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Booking Slots & Windows</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Appointment Slot Interval (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={apptForm.slotDurationMin}
                      onChange={e => setApptForm({ ...apptForm, slotDurationMin: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Max Advance Booking Window (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={apptForm.maxAdvanceBookingDays}
                      onChange={e => setApptForm({ ...apptForm, maxAdvanceBookingDays: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cancellation Cutoff Notice (Hours)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={apptForm.cancellationCutoffHours}
                      onChange={e => setApptForm({ ...apptForm, cancellationCutoffHours: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Auto Mark No-Show After (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={apptForm.autoNoShowAfterMin}
                      onChange={e => setApptForm({ ...apptForm, autoNoShowAfterMin: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Max Daily Appointments Per Doctor</label>
                    <input
                      type="number"
                      className="form-input"
                      value={apptForm.maxDailyAppointmentsPerDoctor}
                      onChange={e => setApptForm({ ...apptForm, maxDailyAppointmentsPerDoctor: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={apptForm.enableOnlineWalkinTriage}
                        onChange={e => setApptForm({ ...apptForm, enableOnlineWalkinTriage: e.target.checked })}
                      />
                      Enable Reception Fast-Track Triage Check-In
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'opd' ? 'OPD Settings' : 'Appointment Rules'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub === 'opd' ? 'opd' : 'appointments');
          if (activeSub === 'opd') setOpdForm(opdSettings);
          else setApptForm(appointmentSettings);
        }}
        categoryName={activeSub === 'opd' ? 'OPD Outpatient Settings' : 'Appointment Scheduling Settings'}
      />
    </div>
  );
}
