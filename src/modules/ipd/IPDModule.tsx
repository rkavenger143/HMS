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

  // 13 Ordered Tabs (Section 9)
  const NAV_TABS: NavTabItem[] = [
    { id: 'dashboard', label: '1. IPD Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'admission', label: '2. Admissions', icon: <UserPlus size={14} /> },
    { id: 'inpatients', label: '3. Inpatient List', icon: <Users size={14} />, badge: activeInpatientsCount },
    { id: 'bed_management', label: '4. Bed Management', icon: <BedDouble size={14} /> },
    { id: 'bed_allocation', label: '5. Bed Allocation', icon: <Layers size={14} /> },
    { id: 'transfers', label: '6. Bed Transfer', icon: <ArrowRightLeft size={14} /> },
    { id: 'wards', label: '7. Ward Management', icon: <Building2 size={14} /> },
    { id: 'rooms', label: '8. Room Management', icon: <Building2 size={14} /> },
    { id: 'discharge', label: '9. Discharge', icon: <CheckCircle2 size={14} /> },
    { id: 'history', label: '10. IPD History', icon: <History size={14} /> },
    { id: 'billing', label: '11. IPD Billing', icon: <ReceiptText size={14} /> },
    { id: 'reports', label: '12. IPD Reports', icon: <BarChart3 size={14} /> },
    { id: 'settings', label: '13. IPD Settings', icon: <Settings size={14} /> },
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
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inpatient Department (IPD) & Beds</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{activeTab.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">IPD & Bed Management</div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✦ Production Inpatient Suite
            </span>
          </div>
          <div className="page-subtitle">
            Lifecycle: Admission → Bed Allocation → Clinical Rounds & Nursing → Transfer → Clearance & Discharge → Bed Sanitization
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

          {/* Admit Patient Quick CTA */}
          <button
            id="admit-patient-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('admission')}
          >
            <Plus size={14} /> Admit Patient
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar (13 Ordered Items) */}
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

      {/* Main Tab View Rendering */}
      <div>
        {activeTab === 'dashboard' && <IPDDashboard />}
        {activeTab === 'admission' && <PatientAdmission />}
        {activeTab === 'inpatients' && <InpatientList />}
        {activeTab === 'bed_management' && <BedManagement />}
        {activeTab === 'bed_allocation' && <BedAllocationView />}
        {activeTab === 'transfers' && <BedTransferManagement />}
        {activeTab === 'wards' && <WardManagement />}
        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'discharge' && <DischargeManagement />}
        {activeTab === 'history' && <IPDHistoryView />}
        {activeTab === 'billing' && <IPDBilling />}
        {activeTab === 'reports' && <IPDReports />}
        {activeTab === 'settings' && <IPDSettings />}

        {/* Supporting Views */}
        {activeTab === 'bed_board' && <BedBoard />}
        {activeTab === 'inpatient_profile' && <InpatientProfile />}
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
