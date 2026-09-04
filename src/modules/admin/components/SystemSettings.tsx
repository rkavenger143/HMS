import React, { useState } from 'react';
import {
  Settings, Shield, ShieldCheck, Printer, Clock,
  KeyRound, Save, CheckCircle2, Lock, Palette
} from 'lucide-react';
import { useAdmin, SystemSettingsConfig } from '../context/AdminContext';

export default function SystemSettings() {
  const { systemSettings, updateSystemSettings, logAuditEvent } = useAdmin();

  const [settingsForm, setSettingsForm] = useState<SystemSettingsConfig>(systemSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settingsForm);
    logAuditEvent('Updated Hospital System Policies & Security Settings', 'System Settings', undefined, 'warning');
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
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>System Settings, Security Policies & Print Layouts</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure global session timeouts, account lockout thresholds, 2FA, and official hospital print templates
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} /> Save All Settings
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          System policies and security configurations successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Security & Access Policies */}
        <div className="card">
          <div className="card-header">
            <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Security & Session Policies (HIPAA & NABH Compliant)</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Session Inactivity Timeout (Minutes) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={settingsForm.sessionTimeoutMinutes}
                  onChange={e => setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: Number(e.target.value) })}
                  required
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Auto log out inactive staff workstations.
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Max Failed Login Attempts (Lockout) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={settingsForm.maxFailedLoginAttempts}
                  onChange={e => setSettingsForm({ ...settingsForm, maxFailedLoginAttempts: Number(e.target.value) })}
                  required
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Locks user account and triggers security alert.
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mandatory Password Expiry (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settingsForm.passwordExpiryDays}
                  onChange={e => setSettingsForm({ ...settingsForm, passwordExpiryDays: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.requireTwoFactor}
                    onChange={e => setSettingsForm({ ...settingsForm, requireTwoFactor: e.target.checked })}
                  />
                  Enforce Two-Factor Authentication (2FA) for Admins
                </label>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Requires SMS OTP on login for admin accounts.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UI & Display Preferences */}
        <div className="card">
          <div className="card-header">
            <Palette size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">UI & Display Preferences</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Appearance Theme</label>
                <select
                  className="form-select"
                  value={settingsForm.theme}
                  onChange={e => setSettingsForm({ ...settingsForm, theme: e.target.value as any })}
                >
                  <option value="light">Green + White Light Theme (Default)</option>
                  <option value="dark">Dark Theme</option>
                  <option value="system">Follow Operating System</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default Table Page Size (Records)</label>
                <select
                  className="form-select"
                  value={settingsForm.tablePageSize}
                  onChange={e => setSettingsForm({ ...settingsForm, tablePageSize: Number(e.target.value) })}
                >
                  <option value={10}>10 Records per page</option>
                  <option value={15}>15 Records per page</option>
                  <option value={25}>25 Records per page</option>
                  <option value={50}>50 Records per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Official Print Letterhead Templates */}
        <div className="card">
          <div className="card-header">
            <Printer size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Official Document Printing Templates</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hospital Header Print Letterhead *</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.headerPrintText}
                  onChange={e => setSettingsForm({ ...settingsForm, headerPrintText: e.target.value })}
                  required
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Appears at the top of Prescriptions, Invoices, Lab Reports, and Discharge Certificates.
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Document Legal Footer Disclaimer *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={settingsForm.footerPrintText}
                  onChange={e => setSettingsForm({ ...settingsForm, footerPrintText: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save All System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
