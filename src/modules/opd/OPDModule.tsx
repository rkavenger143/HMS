import React, { useState } from 'react';
import {
  LayoutDashboard, UserPlus, Calendar, Clock, Stethoscope,
  Activity, Pill, ReceiptText, CalendarDays,
  History, BarChart3, Settings, Search, Users
} from 'lucide-react';
import { OPDProvider, useOPD, type OPDTab } from './context/OPDContext';
import { useAuth } from '../../contexts/AuthContext';

// Subcomponents
import OPDDashboard from './components/OPDDashboard';
import PatientRegistration from './components/PatientRegistration';
import AppointmentManagement from './components/AppointmentManagement';
import OPDBilling from './components/OPDBilling';
import TokenQueueManagement from './components/TokenQueueManagement';
import TodaysPatients from './components/TodaysPatients';
import DoctorConsultation from './components/DoctorConsultation';
import OPDVitalsStation from './components/OPDVitalsStation';
import PrescriptionManagement from './components/PrescriptionManagement';
import FollowUpManagement from './components/FollowUpManagement';
import PatientOPDHistory from './components/PatientOPDHistory';
import OPDReports from './components/OPDReports';
import OPDSettings from './components/OPDSettings';
import OPDPatientsView from './components/OPDPatientsView';
import OPDSearchModal from './components/OPDSearchModal';

interface NavTabItem {
  id: OPDTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function OPDModuleContent() {
  const { state: authState } = useAuth();
  const {
    activeTab,
    setActiveTab,
    currentToken,
    kpis,
  } = useOPD();

  const [showSearchModal, setShowSearchModal] = useState(false);

  // Logical Clinical Workflow: Patient → Appointment → Billing → Queue → Consultation → Follow-up
  const NAV_TABS: NavTabItem[] = [
    { id: 'dashboard', label: 'OPD Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'patients', label: 'Patients Directory', icon: <Users size={14} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={14} /> },
    { id: 'billing', label: 'OPD Billing', icon: <ReceiptText size={14} /> },
    { id: 'queue', label: 'Queue Management', icon: <Clock size={14} />, badge: kpis.waitingPatients },
    { id: 'consultation', label: 'Consultation', icon: <Stethoscope size={14} /> },
    { id: 'vitals', label: 'Vitals Station', icon: <Activity size={14} /> },
    { id: 'prescriptions', label: 'Prescription (Rx)', icon: <Pill size={14} /> },
    { id: 'follow_ups', label: 'Follow-up', icon: <CalendarDays size={14} /> },
    { id: 'history', label: 'OPD History', icon: <History size={14} /> },
    { id: 'reports', label: 'OPD Reports', icon: <BarChart3 size={14} /> },
    { id: 'settings', label: 'OPD Settings', icon: <Settings size={14} /> },
  ];

  return (
    <div>
      {/* Top Page Header with Breadcrumbs & Global OPD Search */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Clinical</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Outpatient Department (OPD)</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{activeTab.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">OPD Clinical Management</div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✦ Production Module
            </span>
          </div>
          <div className="page-subtitle">
            Integrated Hospital Flow: Patient Registration → Appointments → Central Billing → Queue → Vitals → Consultation → Follow-up
          </div>
        </div>

        {/* Global OPD Action Bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Shortcut */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ height: 38, padding: '0 14px' }}
            onClick={() => setShowSearchModal(true)}
          >
            <Search size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Search OPD...</span>
            <kbd style={{ marginLeft: 6, fontSize: 10, background: 'var(--bg-card)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
              ⌘K
            </kbd>
          </button>

          {/* Active Token Callout */}
          <div
            onClick={() => setActiveTab('queue')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-primary-muted)',
              border: '1px solid var(--color-primary-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              height: 38,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
              Current Token: #{currentToken}
            </span>
          </div>

          {/* Quick Registration Button */}
          <button
            className="btn btn-primary btn-sm"
            style={{ height: 38 }}
            onClick={() => setActiveTab('registration')}
          >
            <UserPlus size={14} /> New OPD Patient
          </button>
        </div>
      </div>

      {/* OPD Sub-Navigation Scrollable Tab Bar (12 Ordered Items) */}
      <div
        className="card"
        style={{
          padding: '6px',
          marginBottom: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      background: isActive ? 'white' : 'var(--color-warning)',
                      color: isActive ? 'var(--color-primary)' : 'var(--text-inverse)',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Submodule Render */}
      <div>
        {activeTab === 'dashboard' && <OPDDashboard />}
        {activeTab === 'patients' && <OPDPatientsView />}
        {activeTab === 'registration' && <PatientRegistration />}
        {activeTab === 'appointments' && <AppointmentManagement />}
        {activeTab === 'billing' && <OPDBilling />}
        {activeTab === 'queue' && <TokenQueueManagement />}
        {activeTab === 'todays_patients' && <TodaysPatients />}
        {activeTab === 'consultation' && <DoctorConsultation />}
        {activeTab === 'vitals' && <OPDVitalsStation />}
        {activeTab === 'prescriptions' && <PrescriptionManagement />}
        {activeTab === 'follow_ups' && <FollowUpManagement />}
        {activeTab === 'history' && <PatientOPDHistory />}
        {activeTab === 'reports' && <OPDReports />}
        {activeTab === 'settings' && <OPDSettings />}
      </div>

      {/* Global OPD Search Modal */}
      {showSearchModal && (
        <OPDSearchModal onClose={() => setShowSearchModal(false)} />
      )}
    </div>
  );
}

export default function OPDModule() {
  return (
    <OPDProvider>
      <OPDModuleContent />
    </OPDProvider>
  );
}
