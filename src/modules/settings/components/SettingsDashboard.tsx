import React from 'react';
import {
  Building2, Settings, Palette, Globe, Hash, Stethoscope,
  Calendar, BedDouble, HeartPulse, FlaskConical, Scan, Pill,
  Droplets, DollarSign, CreditCard, Bell, Mail, Smartphone,
  Printer, Shield, UserCheck, Users, Stethoscope as DoctorIcon,
  BarChart3, Activity, Server, History, ArrowRight, CheckCircle2,
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useSettings, SettingsTab } from '../context/SettingsContext';

interface CategoryCard {
  id: SettingsTab;
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  section: string;
}

export default function SettingsDashboard() {
  const { setActiveTab, exportSettingsBackup, history } = useSettings();

  const CATEGORIES: CategoryCard[] = [
    // Organization & Branding
    { id: 'hospital_profile', title: 'Hospital Profile', description: 'Hospital identity, logo, legal registration, GSTIN, PAN & contact numbers', icon: Building2, badge: 'Configured', badgeColor: '#059669', section: 'Organization & Branding' },
    { id: 'general', title: 'General Preferences', description: 'Default language, currency symbol, timezone, session timeouts & pagination', icon: Settings, badge: 'Active', badgeColor: '#059669', section: 'Organization & Branding' },
    { id: 'appearance', title: 'Appearance & Theme', description: 'Green + White HMS theme, primary colors, table density & sidebar style', icon: Palette, badge: 'Default Theme', badgeColor: '#0284c7', section: 'Organization & Branding' },
    { id: 'localization', title: 'Localization & Formats', description: 'Date formats (DD/MM/YYYY), time formats (12h/24h), decimal precision & state', icon: Globe, badge: 'IST +5:30', badgeColor: '#059669', section: 'Organization & Branding' },
    { id: 'numbering', title: 'Document Numbering', description: 'Centralized prefixes and sequence numbering for all 16 clinical & billing document types', icon: Hash, badge: '16 Formats', badgeColor: '#8b5cf6', section: 'Organization & Branding' },

    // Clinical & Diagnostic Modules
    { id: 'opd', title: 'OPD Outpatient Settings', description: 'Working hours, consultation duration (15m), token prefix, queue rules & consultation fees', icon: Stethoscope, badge: 'Active Queue', badgeColor: '#059669', section: 'Clinical & Diagnostics' },
    { id: 'appointments', title: 'Appointment Scheduling', description: 'Slot durations, 30-day booking window, cancellation cutoff & auto no-show timeouts', icon: Calendar, badge: '15 Min Slots', badgeColor: '#0284c7', section: 'Clinical & Diagnostics' },
    { id: 'ipd', title: 'IPD Inpatient Policies', description: 'Admission charges, daily nursing rate, doctor round fee, discharge cutoff & MLC rules', icon: BedDouble, badge: 'Standard Tariffs', badgeColor: '#059669', section: 'Clinical & Diagnostics' },
    { id: 'beds', title: 'Beds & Ward Tariffs', description: 'General, Semi-Private, Private, ICU, Isolation tariffs & auto sanitization status', icon: BedDouble, badge: '6 Categories', badgeColor: '#f59e0b', section: 'Clinical & Diagnostics' },
    { id: 'nursing', title: 'Nursing & Bedside Rules', description: 'Duty shifts (Morning, Evening, Night, General), vitals interval (4h) & incident severities', icon: HeartPulse, badge: '4 Shifts', badgeColor: '#8b5cf6', section: 'Clinical & Diagnostics' },
    { id: 'laboratory', title: 'Diagnostic Laboratory', description: 'Standard TAT (2h), STAT emergency multiplier (1.5x), Pathologist signoff & critical alerts', icon: FlaskConical, badge: 'STAT Active', badgeColor: '#0284c7', section: 'Clinical & Diagnostics' },
    { id: 'radiology', title: 'Radiology & Imaging', description: 'Modality slot duration (20m), mandatory contrast consent & radiologist verification', icon: Scan, badge: 'PACS Enabled', badgeColor: '#0284c7', section: 'Clinical & Diagnostics' },
    { id: 'pharmacy', title: 'Pharmacy & Stock Rules', description: 'Low stock reorder threshold (20 units), near-expiry window (30d), GST rate (12%) & returns', icon: Pill, badge: '12% GST', badgeColor: '#10b981', section: 'Clinical & Diagnostics' },
    { id: 'blood_bank', title: 'Blood Bank & Transfusion', description: 'Mandatory TTI screening, component shelf lives (PRBC 42d, Platelet 5d, FFP 365d) & safety', icon: Droplets, badge: '5-Marker TTI', badgeColor: '#dc2626', section: 'Clinical & Diagnostics' },

    // Financial & Administrative
    { id: 'billing', title: 'Billing & Tax Policies', description: 'Invoice/Receipt prefixes, GST tax slabs (18%), discount authorization caps & notes', icon: DollarSign, badge: '18% GST', badgeColor: '#059669', section: 'Finance & Administration' },
    { id: 'payments', title: 'Payment Tender Methods', description: 'Cash, Credit/Debit Cards, UPI, Insurance, Bank Transfer & refund permissions', icon: CreditCard, badge: '6 Tenders', badgeColor: '#0284c7', section: 'Finance & Administration' },
    { id: 'insurance', title: 'Insurance / TPA Rules', description: 'Settlement windows (15d), cashless pre-auth requirements & coordinator desk', icon: ShieldCheck, badge: 'TPA Active', badgeColor: '#059669', section: 'Finance & Administration' },
    { id: 'printing', title: 'Printing & Letterhead', description: 'Hospital header banner, legal footer disclaimer, A4/Thermal layouts & signature line', icon: Printer, badge: 'A4 Letterhead', badgeColor: '#8b5cf6', section: 'Finance & Administration' },

    // Security & Integration Gateways
    { id: 'notifications', title: 'Notification Gateways', description: 'In-App, Email, SMS gateways & 11 automated trigger rules across hospital workflows', icon: Bell, badge: 'Multi-Channel', badgeColor: '#059669', section: 'Security & Systems' },
    { id: 'email', title: 'Email (SMTP) Gateway', description: 'SMTP server host (smtp.alnhms.com), port 587, sender credentials & TLS encryption', icon: Mail, badge: 'Configured', badgeColor: '#0284c7', section: 'Security & Systems' },
    { id: 'sms', title: 'SMS Telephony Gateway', description: 'SMS gateway provider, sender ID (ALNHMS), API tokens & critical alert broadcasts', icon: Smartphone, badge: 'Connected', badgeColor: '#059669', section: 'Security & Systems' },
    { id: 'security', title: 'Security & Access Policies', description: 'Session timeout (60m), failed password lockout limit (5), password expiry & 2FA', icon: Shield, badge: 'HIPAA Compliant', badgeColor: '#8b5cf6', section: 'Security & Systems' },
    { id: 'users_access', title: 'User Access Defaults', description: 'Default role for new staff, account active states & password reset requirements', icon: UserCheck, badge: 'RBAC Active', badgeColor: '#059669', section: 'Security & Systems' },
    { id: 'patients', title: 'Patient Registration Rules', description: 'Patient MRN prefix, duplicate detection matching (Phone, Name+DOB) & Govt ID flags', icon: Users, badge: 'De-duplication', badgeColor: '#0284c7', section: 'Security & Systems' },
    { id: 'doctors', title: 'Doctor Clinical Defaults', description: 'Doctor ID prefix, standard consultation tariffs & schedule override permissions', icon: DoctorIcon, badge: 'Tariff Sync', badgeColor: '#059669', section: 'Security & Systems' },
    { id: 'reports', title: 'Report Layouts & Exports', description: 'Default date ranges, page size, non-admin CSV export permissions & PDF settings', icon: BarChart3, badge: 'PDF & CSV', badgeColor: '#059669', section: 'Security & Systems' },
    { id: 'audit', title: 'Audit Trail Retention', description: 'Audit logging triggers for auth, financial transactions, clinical notes & 365-day retention', icon: Activity, badge: '365 Days Log', badgeColor: '#8b5cf6', section: 'Security & Systems' },
    { id: 'system', title: 'System Environment Info', description: 'Application version, PostgreSQL 16 engine, API health telemetry & uptime', icon: Server, badge: 'ONLINE', badgeColor: '#10b981', section: 'Security & Systems' },
    { id: 'history', title: 'Settings Change History', description: 'Auditable log of all configuration modifications, timestamps, and administrator names', icon: History, badge: `${history.length} Logs`, badgeColor: '#64748b', section: 'Security & Systems' },
  ];

  // Group categories by section
  const sections = Array.from(new Set(CATEGORIES.map(c => c.section)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark, #065f46) 0%, var(--color-primary, #059669) 100%)',
          color: '#fff',
          padding: '24px',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
              <Settings size={14} /> CENTRAL CONFIGURATION ENGINE
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
              Hospital System Settings & Configuration Hub
            </h2>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 13 }}>
              Configure hospital identity, clinical parameters, billing rules, numbering formats, gateways, and security policies
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={exportSettingsBackup}
              style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 600, border: 'none' }}
            >
              Export JSON Backup
            </button>
          </div>
        </div>
      </div>

      {/* Category Groups */}
      {sections.map(secName => {
        const secCards = CATEGORIES.filter(c => c.section === secName);
        return (
          <div key={secName} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {secName}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {secCards.map(cat => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="card"
                    onClick={() => setActiveTab(cat.id)}
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: '1px solid var(--border-default)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${cat.badgeColor}15`,
                            color: cat.badgeColor,
                            fontWeight: 600,
                            fontSize: 10,
                            border: `1px solid ${cat.badgeColor}30`,
                          }}
                        >
                          {cat.badge}
                        </span>
                      </div>

                      <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                        {cat.title}
                      </strong>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {cat.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-default)', fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
                      Configure Settings <ArrowRight size={13} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
