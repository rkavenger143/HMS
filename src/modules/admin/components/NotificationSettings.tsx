import React, { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, ShieldCheck,
  Save, CheckCircle2, AlertTriangle, Send
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface NotificationTriggerRule {
  id: string;
  category: string;
  eventTitle: string;
  description: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

const DEFAULT_NOTIFICATION_RULES: NotificationTriggerRule[] = [
  { id: 'nt-1', category: 'Appointments', eventTitle: 'Appointment Confirmed', description: 'Triggered when patient confirms OPD consultation slot', email: true, sms: true, inApp: true },
  { id: 'nt-2', category: 'Appointments', eventTitle: 'Token Queue Proximity', description: 'Triggered when patient is within 3 tokens of consulting room', email: false, sms: true, inApp: true },
  { id: 'nt-3', category: 'Clinical IPD', eventTitle: 'Patient Admitted to Inpatient Ward', description: 'Notification sent to attending physician & nursing station', email: true, sms: false, inApp: true },
  { id: 'nt-4', category: 'Clinical IPD', eventTitle: 'Final Discharge Summary Ready', description: 'Dispatched to billing cashier & patient emergency contact', email: true, sms: true, inApp: true },
  { id: 'nt-5', category: 'Diagnostic Lab', eventTitle: 'STAT Critical Analyte Value Alert', description: 'High-priority SMS & In-app alert to ordering doctor for critical values', email: true, sms: true, inApp: true },
  { id: 'nt-6', category: 'Diagnostic Lab', eventTitle: 'Verified Lab Report Published', description: 'Dispatched to patient portal and OPD consulting doctor', email: true, sms: true, inApp: true },
  { id: 'nt-7', category: 'Radiology', eventTitle: 'Radiologist Impression Verified', description: 'Dispatched to ordering consultant for review', email: true, sms: false, inApp: true },
  { id: 'nt-8', category: 'Pharmacy', eventTitle: 'Low Stock Medicine Threshold Reached', description: 'Alert sent to Chief Pharmacist & Purchase Department', email: true, sms: false, inApp: true },
  { id: 'nt-9', category: 'Blood Bank', eventTitle: 'Emergency STAT Blood Order Placed', description: 'High-acuity alert broadcast to Blood Bank duty technician', email: true, sms: true, inApp: true },
  { id: 'nt-10', category: 'Central Billing', eventTitle: 'Payment Settled & Receipt Issued', description: 'Dispatched with digital PDF invoice link to patient', email: true, sms: true, inApp: true },
  { id: 'nt-11', category: 'Security & Admin', eventTitle: 'Failed Login Threshold Exceeded', description: 'Alert sent to System Administrator for potential brute force', email: true, sms: true, inApp: true },
];

export default function NotificationSettings() {
  const { systemSettings, updateSystemSettings, logAuditEvent } = useAdmin();

  const [rules, setRules] = useState<NotificationTriggerRule[]>(DEFAULT_NOTIFICATION_RULES);
  const [channels, setChannels] = useState({
    enableEmail: systemSettings.enableEmailAlerts,
    enableSMS: systemSettings.enableSMSAlerts,
    enableInApp: systemSettings.enableInAppAlerts,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (id: string, channel: 'email' | 'sms' | 'inApp') => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, [channel]: !r[channel] } : r))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      enableEmailAlerts: channels.enableEmail,
      enableSMSAlerts: channels.enableSMS,
      enableInAppAlerts: channels.enableInApp,
    });
    logAuditEvent('Updated Notification Trigger Matrices & Alert Rules', 'Notifications', undefined, 'info');
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
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital Automated Notifications & Alert Dispatch Matrix</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure trigger events, multi-channel gateways (In-App, Email, SMS), and critical escalation rules
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} /> Save Notification Rules
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Notification gateways and trigger matrix rules successfully updated!
        </div>
      )}

      {/* Global Channel Gateways */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Hospital Master Notification Gateways</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Email */}
            <div style={{ padding: '14px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} style={{ color: '#0284c7' }} />
                  <strong style={{ fontSize: 13 }}>SMTP Email Gateway</strong>
                </div>
                <input
                  type="checkbox"
                  checked={channels.enableEmail}
                  onChange={e => setChannels({ ...channels, enableEmail: e.target.checked })}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Dispatches PDF reports, billing invoices, and appointment confirmations.
              </div>
            </div>

            {/* SMS */}
            <div style={{ padding: '14px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} style={{ color: '#10b981' }} />
                  <strong style={{ fontSize: 13 }}>SMS Telephony Gateway</strong>
                </div>
                <input
                  type="checkbox"
                  checked={channels.enableSMS}
                  onChange={e => setChannels({ ...channels, enableSMS: e.target.checked })}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Critical analyte STAT alerts, OTP verification, and queue token numbers.
              </div>
            </div>

            {/* In-App */}
            <div style={{ padding: '14px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} style={{ color: '#8b5cf6' }} />
                  <strong style={{ fontSize: 13 }}>In-App Toast & Header Alerts</strong>
                </div>
                <input
                  type="checkbox"
                  checked={channels.enableInApp}
                  onChange={e => setChannels({ ...channels, enableInApp: e.target.checked })}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Live real-time notification bells for doctors, nurses, and billing cashiers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Event Matrix Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Trigger Event & Multi-Channel Routing Matrix</span>
          <span className="badge badge-primary">{rules.length} Trigger Rules Configured</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Domain & Trigger Title</th>
                  <th>Description / Target Recipient</th>
                  <th style={{ textAlign: 'center', width: 90 }}>In-App</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Email</th>
                  <th style={{ textAlign: 'center', width: 90 }}>SMS</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id}>
                    <td>
                      <div>
                        <span className="badge badge-neutral" style={{ fontSize: 10, marginBottom: 2 }}>{rule.category}</span>
                      </div>
                      <strong style={{ fontSize: 13 }}>{rule.eventTitle}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rule.description}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={rule.inApp}
                        onChange={() => handleToggle(rule.id, 'inApp')}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={rule.email}
                        onChange={() => handleToggle(rule.id, 'email')}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={rule.sms}
                        onChange={() => handleToggle(rule.id, 'sms')}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
