import React, { useState } from 'react';
import {
  Settings, Globe, Save, RotateCcw, CheckCircle2, Clock,
  DollarSign, Calendar, Layers
} from 'lucide-react';
import { useSettings, GeneralSettingsConfig, LocalizationConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function GeneralLocalizationSettingsTab() {
  const {
    generalSettings,
    updateGeneralSettings,
    localization,
    updateLocalization,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'general' | 'localization'>('general');
  const [generalForm, setGeneralForm] = useState<GeneralSettingsConfig>(generalSettings);
  const [localForm, setLocalForm] = useState<LocalizationConfig>(localization);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'general') {
      updateGeneralSettings(generalForm);
    } else {
      updateLocalization(localForm);
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
              {activeSub === 'general' ? <Settings size={20} /> : <Globe size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'general' ? 'General System Preferences' : 'Localization, Date & Currency Standards'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure global timezones, date formatting, currency indicators, and application default behaviors
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'general' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('general')}
            >
              General Settings
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'localization' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('localization')}
            >
              Localization & Formats
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
          Configuration settings successfully updated and synchronized across all HMS components!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeSub === 'general' ? (
          <>
            {/* General Preferences */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Application Defaults & Working Conventions</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default UI Language</label>
                    <select
                      className="form-select"
                      value={generalForm.defaultLanguage}
                      onChange={e => setGeneralForm({ ...generalForm, defaultLanguage: e.target.value })}
                    >
                      <option value="English (India)">English (India)</option>
                      <option value="English (US)">English (US)</option>
                      <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">First Day of Week</label>
                    <select
                      className="form-select"
                      value={generalForm.firstDayOfWeek}
                      onChange={e => setGeneralForm({ ...generalForm, firstDayOfWeek: e.target.value })}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Landing View</label>
                    <select
                      className="form-select"
                      value={generalForm.defaultDashboard}
                      onChange={e => setGeneralForm({ ...generalForm, defaultDashboard: e.target.value })}
                    >
                      <option value="Executive Overview">Executive Overview Dashboard</option>
                      <option value="OPD Queue">OPD Outpatient Desk</option>
                      <option value="IPD Census">IPD Inpatient Census</option>
                      <option value="Billing POS">Central Billing POS</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Table Page Size (Records)</label>
                    <select
                      className="form-select"
                      value={generalForm.defaultPageSize}
                      onChange={e => setGeneralForm({ ...generalForm, defaultPageSize: Number(e.target.value) })}
                    >
                      <option value={10}>10 records per table</option>
                      <option value={15}>15 records per table</option>
                      <option value={25}>25 records per table</option>
                      <option value={50}>50 records per table</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Session Inactivity & Auto-Logout</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Inactivity Timeout (Minutes) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={generalForm.sessionTimeoutMinutes}
                      onChange={e => setGeneralForm({ ...generalForm, sessionTimeoutMinutes: Number(e.target.value) })}
                      required
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Workstation will lock automatically after idle threshold.
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={generalForm.autoLogoutOnIdle}
                        onChange={e => setGeneralForm({ ...generalForm, autoLogoutOnIdle: e.target.checked })}
                      />
                      Enforce Auto-Logout on Session Expiry
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Localization Standards */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Currency, Timezone & Regional Formats</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">System Time Zone *</label>
                    <select
                      className="form-select"
                      value={localForm.timeZone}
                      onChange={e => setLocalForm({ ...localForm, timeZone: e.target.value })}
                    >
                      <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC (GMT +0:00)">UTC (GMT +0:00)</option>
                      <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
                      <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">System Currency Code *</label>
                    <select
                      className="form-select"
                      value={localForm.currency}
                      onChange={e => {
                        const cur = e.target.value;
                        const sym = cur === 'INR' ? '₹' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : 'AED';
                        setLocalForm({ ...localForm, currency: cur, currencySymbol: sym });
                      }}
                    >
                      <option value="INR">INR (Indian Rupee - ₹)</option>
                      <option value="USD">USD (US Dollar - $)</option>
                      <option value="EUR">EUR (Euro - €)</option>
                      <option value="GBP">GBP (British Pound - £)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Currency Symbol Display *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={localForm.currencySymbol}
                      onChange={e => setLocalForm({ ...localForm, currencySymbol: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date Format *</label>
                    <select
                      className="form-select"
                      value={localForm.dateFormat}
                      onChange={e => setLocalForm({ ...localForm, dateFormat: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 02/09/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-02)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/02/2026)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Time Format</label>
                    <select
                      className="form-select"
                      value={localForm.timeFormat}
                      onChange={e => setLocalForm({ ...localForm, timeFormat: e.target.value })}
                    >
                      <option value="12-hour (AM/PM)">12-hour Clock (e.g. 02:30 PM)</option>
                      <option value="24-hour">24-hour Military Clock (e.g. 14:30)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Number Notation Format</label>
                    <select
                      className="form-select"
                      value={localForm.numberFormat}
                      onChange={e => setLocalForm({ ...localForm, numberFormat: e.target.value as any })}
                    >
                      <option value="en-IN">Indian Lakhs & Crores (e.g. 1,00,000.00)</option>
                      <option value="en-US">International Millions (e.g. 100,000.00)</option>
                      <option value="de-DE">European Dot Separation (e.g. 100.000,00)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Financial Decimal Precision</label>
                    <input
                      type="number"
                      className="form-input"
                      value={localForm.decimalPlaces}
                      onChange={e => setLocalForm({ ...localForm, decimalPlaces: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save {activeSub === 'general' ? 'General Preferences' : 'Localization Settings'}
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub === 'general' ? 'general' : 'localization');
          if (activeSub === 'general') setGeneralForm(generalSettings);
          else setLocalForm(localization);
        }}
        categoryName={activeSub === 'general' ? 'General Settings' : 'Localization Settings'}
      />
    </div>
  );
}
