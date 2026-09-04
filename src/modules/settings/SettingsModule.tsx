import React, { useState, useMemo } from 'react';
import {
  Settings, Building2, Globe, Palette, Hash, Stethoscope,
  Calendar, BedDouble, FlaskConical, Pill, DollarSign,
  Bell, Printer, Shield, Users, BarChart3, History,
  Search, ArrowRight, Save, RotateCcw, ShieldCheck, Download,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { SettingsProvider, useSettings, SettingsTab } from './context/SettingsContext';

// Import Tab Components
import SettingsDashboard from './components/SettingsDashboard';
import HospitalProfileSettingsTab from './components/HospitalProfileSettingsTab';
import GeneralLocalizationSettingsTab from './components/GeneralLocalizationSettingsTab';
import AppearanceSettingsTab from './components/AppearanceSettingsTab';
import NumberingSettingsTab from './components/NumberingSettingsTab';
import OPDAppointmentSettingsTab from './components/OPDAppointmentSettingsTab';
import IPDBedNursingSettingsTab from './components/IPDBedNursingSettingsTab';
import DiagnosticsSettingsTab from './components/DiagnosticsSettingsTab';
import PharmacyBloodBankSettingsTab from './components/PharmacyBloodBankSettingsTab';
import BillingPaymentInsuranceSettingsTab from './components/BillingPaymentInsuranceSettingsTab';
import NotificationGatewaySettingsTab from './components/NotificationGatewaySettingsTab';
import PrintingDocumentSettingsTab from './components/PrintingDocumentSettingsTab';
import SecurityUserAccessSettingsTab from './components/SecurityUserAccessSettingsTab';
import PatientDoctorSettingsTab from './components/PatientDoctorSettingsTab';
import ReportAuditSystemSettingsTab from './components/ReportAuditSystemSettingsTab';
import SettingsHistoryTab from './components/SettingsHistoryTab';

interface NavTabItem {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const SETTINGS_NAV: NavTabItem[] = [
  { id: 'dashboard', label: 'Settings Hub', icon: Settings },
  { id: 'hospital_profile', label: 'Hospital Profile', icon: Building2 },
  { id: 'general', label: 'General & Localization', icon: Globe },
  { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
  { id: 'numbering', label: 'Document Numbering', icon: Hash },
  { id: 'opd', label: 'OPD & Appointments', icon: Stethoscope },
  { id: 'ipd', label: 'IPD, Beds & Nursing', icon: BedDouble },
  { id: 'laboratory', label: 'Diagnostics (Lab & Rad)', icon: FlaskConical },
  { id: 'pharmacy', label: 'Pharmacy & Blood Bank', icon: Pill },
  { id: 'billing', label: 'Billing, Tax & Insurance', icon: DollarSign },
  { id: 'notifications', label: 'Gateways & Triggers', icon: Bell },
  { id: 'printing', label: 'Printing & Layouts', icon: Printer },
  { id: 'security', label: 'Security & User Access', icon: Shield },
  { id: 'patients', label: 'Patients & Doctors', icon: Users },
  { id: 'reports', label: 'Reports, Audit & System', icon: BarChart3 },
  { id: 'history', label: 'Change History', icon: History },
];

function SettingsModuleContent() {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, exportSettingsBackup, hospitalProfile } = useSettings();
  const [searchFocused, setSearchFocused] = useState(false);

  // Search items across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const items = [
      { tab: 'hospital_profile' as SettingsTab, title: 'Hospital Name & Legal Registration', desc: 'Hospital profile, license, codes' },
      { tab: 'hospital_profile' as SettingsTab, title: 'Hospital Logo & Letterhead Branding', desc: 'Logo upload & print previews' },
      { tab: 'hospital_profile' as SettingsTab, title: 'GSTIN & PAN Number', desc: 'Tax registration codes' },
      { tab: 'general' as SettingsTab, title: 'Timezone & Currency (INR / ₹)', desc: 'General regional standards' },
      { tab: 'general' as SettingsTab, title: 'Date Format (DD/MM/YYYY)', desc: 'Date and time formatting' },
      { tab: 'general' as SettingsTab, title: 'Session Inactivity Timeout', desc: 'Workstation auto-logout threshold' },
      { tab: 'appearance' as SettingsTab, title: 'Theme Colors (Green + White HMS)', desc: 'Interface theme and palette' },
      { tab: 'appearance' as SettingsTab, title: 'Table Row Spacing Density', desc: 'Compact / Comfortable data tables' },
      { tab: 'numbering' as SettingsTab, title: 'Patient MRN Sequence (PAT-2026-)', desc: 'Patient document numbering' },
      { tab: 'numbering' as SettingsTab, title: 'Tax Invoice Numbering (INV-2026-)', desc: 'Billing invoice prefixes' },
      { tab: 'numbering' as SettingsTab, title: 'Lab Order & Report Numbering', desc: 'Diagnostics sequences' },
      { tab: 'numbering' as SettingsTab, title: 'OPD Token Prefix (TKN-)', desc: 'Outpatient queue numbering' },
      { tab: 'opd' as SettingsTab, title: 'OPD Working Hours & Shift Timings', desc: 'Outpatient consulting hours' },
      { tab: 'opd' as SettingsTab, title: 'OPD Consultation Duration (15m)', desc: 'Doctor slot length' },
      { tab: 'opd' as SettingsTab, title: 'Appointment 30-Day Booking Window', desc: 'Advance scheduling rules' },
      { tab: 'ipd' as SettingsTab, title: 'IPD Base Admission Processing Fee', desc: 'Inpatient tariffs & admission' },
      { tab: 'ipd' as SettingsTab, title: 'Ward Bed Daily Rates (ICU, General, Private)', desc: 'Bed category daily charges' },
      { tab: 'ipd' as SettingsTab, title: 'Nursing Shifts & Vitals Intervals', desc: 'Bedside care schedules' },
      { tab: 'laboratory' as SettingsTab, title: 'Lab Turnaround Time (TAT) & STAT Multiplier', desc: 'Diagnostic testing rules' },
      { tab: 'laboratory' as SettingsTab, title: 'Pathologist Mandatory Signoff', desc: 'Report verification workflow' },
      { tab: 'laboratory' as SettingsTab, title: 'Radiology Modality Slot & Contrast Consent', desc: 'Imaging RIS protocols' },
      { tab: 'pharmacy' as SettingsTab, title: 'Pharmacy Low Stock Reorder Threshold', desc: 'Inventory minimum batch limits' },
      { tab: 'pharmacy' as SettingsTab, title: 'Blood Component Shelf Lives (PRBC, FFP)', desc: 'Blood bank safety parameters' },
      { tab: 'pharmacy' as SettingsTab, title: '5-Marker TTI Serology Screening', desc: 'Blood donor safety clearance' },
      { tab: 'billing' as SettingsTab, title: 'Medical GST Tax Rate (18%)', desc: 'Procedure and service tax slabs' },
      { tab: 'billing' as SettingsTab, title: 'Cashier Concession Caps & Discounts', desc: 'Financial authorization thresholds' },
      { tab: 'billing' as SettingsTab, title: 'Payment Gateways (Cash, Cards, UPI, TPA)', desc: 'Supported cashier tenders' },
      { tab: 'billing' as SettingsTab, title: 'Insurance / TPA Claims Pre-Authorization', desc: 'Cashless corporate admission' },
      { tab: 'notifications' as SettingsTab, title: 'SMTP Email Gateway Host & Port', desc: 'Email broadcast relay' },
      { tab: 'notifications' as SettingsTab, title: 'SMS Telephony Gateway (DLT Sender ID)', desc: 'SMS text alerts' },
      { tab: 'notifications' as SettingsTab, title: 'Automated Notification Event Triggers', desc: 'Multi-channel routing rules' },
      { tab: 'printing' as SettingsTab, title: 'Header Letterhead Banner & Legal Footer', desc: 'Official print templates' },
      { tab: 'printing' as SettingsTab, title: 'Paper Size (A4, Letter, Thermal 80mm)', desc: 'Print dimensions & orientation' },
      { tab: 'security' as SettingsTab, title: 'Account Lockout on Failed Password Attempts', desc: 'Security brute force protection' },
      { tab: 'security' as SettingsTab, title: 'Two-Factor Authentication (2FA)', desc: 'Admin login OTP enforcement' },
      { tab: 'security' as SettingsTab, title: 'Default Role for New Staff Accounts', desc: 'User onboarding defaults' },
      { tab: 'patients' as SettingsTab, title: 'Duplicate Patient Chart Detection', desc: 'EMR chart matching rules' },
      { tab: 'patients' as SettingsTab, title: 'Doctor Standard Consultation Fee Tariff', desc: 'Consultant fee defaults' },
      { tab: 'reports' as SettingsTab, title: 'Audit Trail Retention Period (365 Days)', desc: 'Compliance logging retention' },
      { tab: 'reports' as SettingsTab, title: 'System Environment Health & Server Uptime', desc: 'PostgreSQL 16 & API telemetry' },
      { tab: 'history' as SettingsTab, title: 'Settings Modification Change Ledger', desc: 'Auditable configuration logs' },
    ];

    return items.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SettingsDashboard />;
      case 'hospital_profile':
        return <HospitalProfileSettingsTab />;
      case 'general':
      case 'localization':
        return <GeneralLocalizationSettingsTab />;
      case 'appearance':
        return <AppearanceSettingsTab />;
      case 'numbering':
        return <NumberingSettingsTab />;
      case 'opd':
      case 'appointments':
        return <OPDAppointmentSettingsTab />;
      case 'ipd':
      case 'beds':
      case 'nursing':
        return <IPDBedNursingSettingsTab />;
      case 'laboratory':
      case 'radiology':
        return <DiagnosticsSettingsTab />;
      case 'pharmacy':
      case 'blood_bank':
        return <PharmacyBloodBankSettingsTab />;
      case 'billing':
      case 'payments':
      case 'insurance':
        return <BillingPaymentInsuranceSettingsTab />;
      case 'notifications':
      case 'email':
      case 'sms':
        return <NotificationGatewaySettingsTab />;
      case 'printing':
        return <PrintingDocumentSettingsTab />;
      case 'security':
      case 'users_access':
        return <SecurityUserAccessSettingsTab />;
      case 'patients':
      case 'doctors':
        return <PatientDoctorSettingsTab />;
      case 'reports':
      case 'audit':
      case 'system':
        return <ReportAuditSystemSettingsTab />;
      case 'history':
        return <SettingsHistoryTab />;
      default:
        return <SettingsDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Administration</span>
            <span className="breadcrumb-sep">›</span>
            <span>Configuration</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Central Settings Engine</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings size={28} style={{ color: 'var(--color-primary)' }} />
            ALN CURE HMS — Central Hospital Settings & Configuration Center
          </div>
          <div className="page-subtitle">
            {hospitalProfile.name} • Registered Code: <strong>{hospitalProfile.code}</strong> • Central System Configuration Layer
          </div>
        </div>

        {/* Global Settings Live Search */}
        <div style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search setting (e.g. GST, Logo, Token, ICU)..."
              style={{ paddingLeft: 32, fontSize: 13 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            />
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1050,
                marginTop: 6,
                maxHeight: 280,
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                padding: 6,
              }}
            >
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onMouseDown={() => {
                    setActiveTab(res.tab);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-default)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{res.title}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{res.desc}</div>
                  </div>
                  <ArrowRight size={13} style={{ color: 'var(--color-primary)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-color)',
          scrollbarWidth: 'thin',
        }}
      >
        {SETTINGS_NAV.map(tab => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'general' && (activeTab === 'general' || activeTab === 'localization')) ||
            (tab.id === 'opd' && (activeTab === 'opd' || activeTab === 'appointments')) ||
            (tab.id === 'ipd' && (activeTab === 'ipd' || activeTab === 'beds' || activeTab === 'nursing')) ||
            (tab.id === 'laboratory' && (activeTab === 'laboratory' || activeTab === 'radiology')) ||
            (tab.id === 'pharmacy' && (activeTab === 'pharmacy' || activeTab === 'blood_bank')) ||
            (tab.id === 'billing' && (activeTab === 'billing' || activeTab === 'payments' || activeTab === 'insurance')) ||
            (tab.id === 'notifications' && (activeTab === 'notifications' || activeTab === 'email' || activeTab === 'sms')) ||
            (tab.id === 'security' && (activeTab === 'security' || activeTab === 'users_access')) ||
            (tab.id === 'patients' && (activeTab === 'patients' || activeTab === 'doctors')) ||
            (tab.id === 'reports' && (activeTab === 'reports' || activeTab === 'audit' || activeTab === 'system'));

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      <div style={{ minHeight: 600 }}>
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default function SettingsModule() {
  return (
    <SettingsProvider>
      <SettingsModuleContent />
    </SettingsProvider>
  );
}
