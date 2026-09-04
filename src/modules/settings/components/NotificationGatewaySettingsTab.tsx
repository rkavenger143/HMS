import React, { useState } from 'react';
import {
  Bell, Mail, Smartphone, Save, RotateCcw, CheckCircle2,
  ShieldCheck, Send, KeyRound, Server
} from 'lucide-react';
import { useSettings, NotificationSettingsConfig, EmailSettingsConfig, SMSSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function NotificationGatewaySettingsTab() {
  const {
    notificationSettings,
    updateNotificationSettings,
    emailSettings,
    updateEmailSettings,
    smsSettings,
    updateSMSSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'notifications' | 'email' | 'sms'>('notifications');
  const [notifForm, setNotifForm] = useState<NotificationSettingsConfig>(notificationSettings);
  const [emailForm, setEmailForm] = useState<EmailSettingsConfig>(emailSettings);
  const [smsForm, setSmsForm] = useState<SMSSettingsConfig>(smsSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'notifications') updateNotificationSettings(notifForm);
    else if (activeSub === 'email') updateEmailSettings(emailForm);
    else updateSMSSettings(smsForm);

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
              {activeSub === 'notifications' ? <Bell size={20} /> : activeSub === 'email' ? <Mail size={20} /> : <Smartphone size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'notifications' ? 'Notification Triggers & Routing Matrix' : activeSub === 'email' ? 'SMTP Email Gateway Server Configuration' : 'SMS Telephony Gateway Configuration'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure automated clinical notifications, SMTP email relays, and SMS sender IDs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'notifications' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('notifications')}
            >
              Triggers
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'email' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('email')}
            >
              Email (SMTP)
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'sms' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('sms')}
            >
              SMS Gateway
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
          {activeSub.toUpperCase()} gateway parameters successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Notifications & Triggers */}
        {activeSub === 'notifications' && (
          <>
            {/* Master Channels */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Hospital Master Communication Channels</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.enableInAppAlerts}
                      onChange={e => setNotifForm({ ...notifForm, enableInAppAlerts: e.target.checked })}
                    />
                    <div>
                      <strong style={{ fontSize: 13 }}>In-App Toast & Bells</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Real-time desktop alerts</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.enableEmailAlerts}
                      onChange={e => setNotifForm({ ...notifForm, enableEmailAlerts: e.target.checked })}
                    />
                    <div>
                      <strong style={{ fontSize: 13 }}>SMTP Email Broadcasts</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>PDF receipts & reports</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.enableSMSAlerts}
                      onChange={e => setNotifForm({ ...notifForm, enableSMSAlerts: e.target.checked })}
                    />
                    <div>
                      <strong style={{ fontSize: 13 }}>SMS Telephony Gateway</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Queue tokens & STAT alerts</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Event Triggers */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Automated Notification Event Triggers</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnAppointmentConfirm}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnAppointmentConfirm: e.target.checked })}
                    />
                    Appointment Confirmed & Slotted
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnQueueTokenTurn}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnQueueTokenTurn: e.target.checked })}
                    />
                    OPD Queue Token Approaching Turn
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnAdmission}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnAdmission: e.target.checked })}
                    />
                    Inpatient Admitted to Hospital Ward
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnDischarge}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnDischarge: e.target.checked })}
                    />
                    Inpatient Final Discharge Authorized
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnCriticalLabValue}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnCriticalLabValue: e.target.checked })}
                    />
                    STAT Critical Diagnostic Lab Alert
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnLowStock}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnLowStock: e.target.checked })}
                    />
                    Pharmacy Low Medicine Reorder Alert
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifForm.notifyOnPaymentSuccess}
                      onChange={e => setNotifForm({ ...notifForm, notifyOnPaymentSuccess: e.target.checked })}
                    />
                    Payment Settled & Receipt Issued
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Email SMTP */}
        {activeSub === 'email' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">SMTP Mail Server Connection Details</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SMTP Relay Host *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailForm.smtpHost}
                    onChange={e => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SMTP Port *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={emailForm.smtpPort}
                    onChange={e => setEmailForm({ ...emailForm, smtpPort: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sender Display Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailForm.smtpSenderName}
                    onChange={e => setEmailForm({ ...emailForm, smtpSenderName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sender From Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={emailForm.smtpSenderEmail}
                    onChange={e => setEmailForm({ ...emailForm, smtpSenderEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Encryption Protocol</label>
                  <select
                    className="form-select"
                    value={emailForm.encryptionType}
                    onChange={e => setEmailForm({ ...emailForm, encryptionType: e.target.value as any })}
                  >
                    <option value="TLS">TLS (Recommended - Port 587)</option>
                    <option value="SSL">SSL (Port 465)</option>
                    <option value="NONE">None / Plaintext</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Telephony */}
        {activeSub === 'sms' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">SMS Telephony Gateway Connection</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SMS Provider Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={smsForm.providerName}
                    onChange={e => setSmsForm({ ...smsForm, providerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Approved DLT Sender ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={smsForm.senderId}
                    onChange={e => setSmsForm({ ...smsForm, senderId: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">API Auth Secret Token (Masked)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={smsForm.apiKeyMasked}
                    disabled
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'notifications' ? 'Notification Triggers' : activeSub === 'email' ? 'SMTP Settings' : 'SMS Gateway'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub);
          if (activeSub === 'notifications') setNotifForm(notificationSettings);
          else if (activeSub === 'email') setEmailForm(emailSettings);
          else setSmsForm(smsSettings);
        }}
        categoryName={activeSub === 'notifications' ? 'Notification Triggers' : activeSub === 'email' ? 'Email (SMTP) Settings' : 'SMS Gateway Settings'}
      />
    </div>
  );
}
