import React, { useState } from 'react';
import {
  Shield, UserCheck, Save, RotateCcw, CheckCircle2,
  KeyRound, Lock, ShieldCheck, UserPlus, Eye
} from 'lucide-react';
import { useSettings, SecuritySettingsConfig, UserAccessSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function SecurityUserAccessSettingsTab() {
  const {
    securitySettings,
    updateSecuritySettings,
    userAccessSettings,
    updateUserAccessSettings,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'security' | 'user_access'>('security');
  const [secForm, setSecForm] = useState<SecuritySettingsConfig>(securitySettings);
  const [usrForm, setUsrForm] = useState<UserAccessSettingsConfig>(userAccessSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'security') updateSecuritySettings(secForm);
    else updateUserAccessSettings(usrForm);

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
              {activeSub === 'security' ? <Shield size={20} /> : <UserCheck size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'security' ? 'Security Policies & Access Lockouts (NABH & HIPAA Compliant)' : 'User Account Provisioning & Session Access Defaults'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure session idle timeouts, account lockout thresholds, password complexities, and default staff roles
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'security' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('security')}
            >
              Security Policies
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'user_access' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('user_access')}
            >
              User Access Defaults
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
          {activeSub === 'security' ? 'Security parameters' : 'User access rules'} successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Security Policies */}
        {activeSub === 'security' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Session Inactivity, Lockouts & Password Standards</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Session Inactivity Timeout (Minutes) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={secForm.sessionTimeoutMinutes}
                    onChange={e => setSecForm({ ...secForm, sessionTimeoutMinutes: Number(e.target.value) })}
                    required
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Auto-disconnects unattended clinical terminals.
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Failed Login Attempts (Lockout) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={secForm.maxFailedLoginAttempts}
                    onChange={e => setSecForm({ ...secForm, maxFailedLoginAttempts: Number(e.target.value) })}
                    required
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Temporarily locks user account on password brute-force.
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Minimum Password Length (Characters) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={secForm.passwordMinLength}
                    onChange={e => setSecForm({ ...secForm, passwordMinLength: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mandatory Password Expiry (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={secForm.passwordExpiryDays}
                    onChange={e => setSecForm({ ...secForm, passwordExpiryDays: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={secForm.requirePasswordComplexity}
                    onChange={e => setSecForm({ ...secForm, requirePasswordComplexity: e.target.checked })}
                  />
                  Enforce Password Complexity (Uppercase, Lowercase, Number & Special Character)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={secForm.requireTwoFactor}
                    onChange={e => setSecForm({ ...secForm, requireTwoFactor: e.target.checked })}
                  />
                  Enforce Two-Factor Authentication (2FA) for All Administrators
                </label>
              </div>
            </div>
          </div>
        )}

        {/* User Access Defaults */}
        {activeSub === 'user_access' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Staff Onboarding Defaults & Multi-Session Rules</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default Role for New Staff Accounts</label>
                  <select
                    className="form-select"
                    value={usrForm.defaultRoleForNewStaff}
                    onChange={e => setUsrForm({ ...usrForm, defaultRoleForNewStaff: e.target.value })}
                  >
                    <option value="doctor">Consultant Doctor</option>
                    <option value="nurse">Staff Nurse</option>
                    <option value="receptionist">Front Desk Receptionist</option>
                    <option value="billing_staff">Billing Cashier</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={usrForm.defaultUserActiveState}
                    onChange={e => setUsrForm({ ...usrForm, defaultUserActiveState: e.target.checked })}
                  />
                  Newly Created Users Are Active By Default
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={usrForm.forcePasswordChangeOnFirstLogin}
                    onChange={e => setUsrForm({ ...usrForm, forcePasswordChangeOnFirstLogin: e.target.checked })}
                  />
                  Force Mandatory Password Reset on First Login
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={usrForm.allowConcurrentLogins}
                    onChange={e => setUsrForm({ ...usrForm, allowConcurrentLogins: e.target.checked })}
                  />
                  Allow Concurrent Logins from Multiple Browsers / Devices
                </label>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'security' ? 'Security Policies' : 'User Access Rules'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub === 'security' ? 'security' : 'users_access');
          if (activeSub === 'security') setSecForm(securitySettings);
          else setUsrForm(userAccessSettings);
        }}
        categoryName={activeSub === 'security' ? 'Security & Access Policies' : 'User Access Defaults'}
      />
    </div>
  );
}
