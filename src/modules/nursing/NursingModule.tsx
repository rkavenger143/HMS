import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Clock, CheckCircle2, Pill, Activity,
  ClipboardList, FileText, Search, Siren, Plus, UserCheck, ShieldAlert
} from 'lucide-react';
import { NursingProvider, useNursing, NursingTab } from './context/NursingContext';
import NursingDashboard from './components/NursingDashboard';
import NurseManagement from './components/NurseManagement';
import ShiftManagement from './components/ShiftManagement';
import NursingPatientList from './components/NursingPatientList';
import NursingTaskManagement from './components/NursingTaskManagement';
import MARManagement from './components/MARManagement';
import VitalsManagement from './components/VitalsManagement';
import NursingNotesManagement from './components/NursingNotesManagement';
import NursingHandover from './components/NursingHandover';
import EmergencyReportingModal from './components/modals/EmergencyReportingModal';
import RecordVitalsModal from './components/modals/RecordVitalsModal';
import NursingSearchModal from './components/NursingSearchModal';

function NursingModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    admissions,
    emergencies,
    nursingTasks,
    nurses,
  } = useNursing();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickVitalsModal, setShowQuickVitalsModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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

  const activeEmergencies = emergencies.filter(e => e.status === 'active');
  const pendingTasks = nursingTasks.filter(t => t.status === 'pending').length;
  const onDutyCount = nurses.filter(n => n.status === 'on_duty').length;

  const NAV_TABS: { id: NursingTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'nurses', label: '2. Nurses', icon: <UserCheck size={14} />, badge: onDutyCount },
    { id: 'shifts', label: '3. Shifts', icon: <Clock size={14} /> },
    { id: 'patients', label: '4. Assigned Patients', icon: <Users size={14} />, badge: kpis.totalAssignedPatients },
    { id: 'tasks', label: '5. Nursing Tasks', icon: <CheckCircle2 size={14} />, badge: pendingTasks > 0 ? pendingTasks : undefined },
    { id: 'medication', label: '6. Medication (MAR)', icon: <Pill size={14} />, badge: kpis.medicationDueCount > 0 ? kpis.medicationDueCount : undefined },
    { id: 'vitals', label: '7. Vital Signs', icon: <Activity size={14} /> },
    { id: 'notes', label: '8. Nursing Notes', icon: <ClipboardList size={14} /> },
    { id: 'handover', label: '9. Shift Handover', icon: <FileText size={14} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Nursing Station & Bedside Care Workspace</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Nurse assignments · Rapid vitals · MAR execution · Shift handover · Emergency broadcast
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Quick Record Vitals CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowQuickVitalsModal(true)}
          >
            <Activity size={14} /> Record Vitals
          </button>

          {/* Emergency Alert Button */}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowEmergencyModal(true)}
            style={{ fontWeight: 800 }}
          >
            <Siren size={14} /> Emergency Alert
          </button>
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {activeEmergencies.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 69, 58, 0.15), rgba(255, 159, 10, 0.15))',
          border: '1px solid rgba(255, 69, 58, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Siren size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-danger)' }}>
                🚨 {activeEmergencies.length} ACTIVE MEDICAL EMERGENCY ALERT{activeEmergencies.length > 1 ? 'S' : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {activeEmergencies[0].type.toUpperCase().replace('_', ' ')}: {activeEmergencies[0].patientName ? `${activeEmergencies[0].patientName} (Bed ${activeEmergencies[0].bedNumber})` : activeEmergencies[0].ward} — {activeEmergencies[0].description}
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setActiveTab('dashboard')}
          >
            View Active Emergencies
          </button>
        </div>
      )}

      {/* 9 Core Navigation Tabs Bar */}
      <div
        className="card"
        style={{
          padding: '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id || (tab.id === 'medication' && activeTab === 'mar');
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
                {tab.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? 'white' : 'var(--color-primary-muted)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-primary)',
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

      {/* Tab Panels */}
      <div>
        {activeTab === 'dashboard' && <NursingDashboard />}
        {activeTab === 'nurses' && <NurseManagement />}
        {activeTab === 'shifts' && <ShiftManagement />}
        {activeTab === 'patients' && <NursingPatientList />}
        {activeTab === 'tasks' && <NursingTaskManagement />}
        {(activeTab === 'medication' || activeTab === 'mar') && <MARManagement />}
        {activeTab === 'vitals' && <VitalsManagement />}
        {activeTab === 'notes' && <NursingNotesManagement />}
        {activeTab === 'handover' && <NursingHandover />}
      </div>

      {/* Universal Search Modal */}
      {showSearchModal && (
        <NursingSearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {/* Quick Record Vitals Modal */}
      {showQuickVitalsModal && (
        <RecordVitalsModal
          admission={admissions[0]}
          onClose={() => setShowQuickVitalsModal(false)}
        />
      )}

      {/* Emergency Reporting Modal */}
      {showEmergencyModal && (
        <EmergencyReportingModal
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
}

export default function NursingModule() {
  return (
    <NursingProvider>
      <NursingModuleContent />
    </NursingProvider>
  );
}
