import React, { useState, useEffect } from 'react';
import {
  BedDouble, LayoutDashboard, Layers, Users, UserPlus, FileText,
  Activity, Stethoscope, Pill, ArrowRightLeft, CheckCircle2,
  ReceiptText, TrendingUp, Search, Plus, Sparkles, Building2,
  History, Settings, BarChart3
} from 'lucide-react';
import { IPDProvider, useIPD, type IPDTab } from './context/IPDContext';
import IPDDashboard from './components/IPDDashboard';
import PatientAdmission from './components/PatientAdmission';
import InpatientList from './components/InpatientList';
import BedManagement from './components/BedManagement';
import BedAllocationView from './components/BedAllocationView';
import BedTransferManagement from './components/BedTransferManagement';
import WardManagement from './components/WardManagement';
import RoomManagement from './components/RoomManagement';
import DischargeManagement from './components/DischargeManagement';
import IPDHistoryView from './components/IPDHistoryView';
import IPDBilling from './components/IPDBilling';
import IPDReports from './components/IPDReports';
import IPDSettings from './components/IPDSettings';

// Supporting clinical subcomponents
import BedBoard from './components/BedBoard';
import InpatientProfile from './components/InpatientProfile';
import NursingManagement from './components/NursingManagement';
import DoctorRoundsManagement from './components/DoctorRoundsManagement';
import InpatientMedications from './components/InpatientMedications';
import BedOccupancyAnalytics from './components/BedOccupancyAnalytics';
import IPDSearchModal from './components/IPDSearchModal';

interface NavTabItem {
  id: IPDTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function IPDModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    admissions,
    beds,
    nursingTasks,
  } = useIPD();

  const [showSearchModal, setShowSearchModal] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeInpatientsCount = admissions.filter(a => a.status === 'active').length;
  const pendingTasksCount = nursingTasks.filter(t => t.status === 'pending').length;
  const cleaningBedsCount = beds.filter(b => b.status === 'cleaning').length;

  // 7 Clean Core Hospital Views
  const NAV_TABS: NavTabItem[] = [
    { id: 'dashboard', label: 'IPD Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'admission', label: 'Admit Patient', icon: <UserPlus size={14} /> },
    { id: 'inpatients', label: 'Inpatient Census', icon: <Users size={14} />, badge: activeInpatientsCount },
    { id: 'beds', label: 'Bed Management & Board', icon: <BedDouble size={14} />, badge: cleaningBedsCount > 0 ? cleaningBedsCount : undefined },
    { id: 'transfers', label: 'Patient Transfer', icon: <ArrowRightLeft size={14} /> },
    { id: 'discharge', label: 'Discharge Station', icon: <CheckCircle2 size={14} /> },
    { id: 'history', label: 'Stay & Bed History', icon: <History size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Clinical</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inpatient Department (IPD) & Bed Management</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{activeTab.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">IPD & Bed Management</div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✦ Production Hospital Suite
            </span>
          </div>
          <div className="page-subtitle">
            Clinical Lifecycle: Admission → Real-time Bed Allocation → Census & Care → Direct Transfer → Discharge & Bed Sanitization
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search IPD <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Live Occupancy Badge */}
          <div
            className="badge badge-primary"
            style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
            {kpis.bedOccupancyRate}% Occupancy ({kpis.occupiedBeds}/{kpis.totalOperationalBeds} Beds)
          </div>

          {/* Quick Actions */}
          <button
            id="admit-patient-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('admission')}
          >
            <Plus size={14} /> Admit Patient
          </button>
        </div>
      </div>

      {/* Streamlined Sub-Navigation Tabs Bar */}
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
            const isActive = activeTab === tab.id ||
              (tab.id === 'beds' && (activeTab === 'bed_management' || activeTab === 'bed_allocation' || activeTab === 'bed_board' || activeTab === 'wards' || activeTab === 'rooms'));
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
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

      {/* Main Tab View Rendering */}
      <div>
        {activeTab === 'dashboard' && <IPDDashboard />}
        {activeTab === 'admission' && <PatientAdmission />}
        {activeTab === 'inpatients' && <InpatientList />}
        {(activeTab === 'beds' || activeTab === 'bed_management' || activeTab === 'bed_allocation' || activeTab === 'bed_board' || activeTab === 'wards' || activeTab === 'rooms') && <BedManagement />}
        {activeTab === 'transfers' && <BedTransferManagement />}
        {activeTab === 'discharge' && <DischargeManagement />}
        {activeTab === 'history' && <IPDHistoryView />}

        {/* Clinical Support Views */}
        {activeTab === 'inpatient_profile' && <InpatientProfile />}
        {activeTab === 'billing' && <IPDBilling />}
        {activeTab === 'reports' && <IPDReports />}
        {activeTab === 'settings' && <IPDSettings />}
        {activeTab === 'nursing' && <NursingManagement />}
        {activeTab === 'doctor_rounds' && <DoctorRoundsManagement />}
        {activeTab === 'medications' && <InpatientMedications />}
        {activeTab === 'analytics' && <BedOccupancyAnalytics />}
      </div>

      {/* Universal Search Modal */}
      {showSearchModal && <IPDSearchModal onClose={() => setShowSearchModal(false)} />}
    </div>
  );
}

export default function IPDModule() {
  return (
    <IPDProvider>
      <IPDModuleContent />
    </IPDProvider>
  );
}
