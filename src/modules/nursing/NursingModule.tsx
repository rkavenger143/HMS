import React, { useState, useEffect } from 'react';
import {
  HeartPulse, LayoutDashboard, Users, User, Activity, ClipboardList,
  FileText, CheckCircle2, Pill, Droplets, Stethoscope, Clock,
  CheckSquare, BookOpen, AlertTriangle, Bell, BarChart3, Search,
  Plus, ShieldAlert, Sparkles, UserCheck
} from 'lucide-react';
import { NursingProvider, useNursing, NursingTab } from './context/NursingContext';
import NursingDashboard from './components/NursingDashboard';
import NursingPatientList from './components/NursingPatientList';
import NursingPatientProfile from './components/NursingPatientProfile';
import VitalsManagement from './components/VitalsManagement';
import NursingNotesManagement from './components/NursingNotesManagement';
import CarePlanManagement from './components/CarePlanManagement';
import NursingTaskManagement from './components/NursingTaskManagement';
import MARManagement from './components/MARManagement';
import IVInfusionMonitoring from './components/IVInfusionMonitoring';
import IntakeOutputManagement from './components/IntakeOutputManagement';
import PatientAssessment from './components/PatientAssessment';
import WoundCareManagement from './components/WoundCareManagement';
import NursingHandover from './components/NursingHandover';
import ShiftManagement from './components/ShiftManagement';
import DoctorOrdersManagement from './components/DoctorOrdersManagement';
import SampleCollectionManagement from './components/SampleCollectionManagement';
import DischargeChecklist from './components/DischargeChecklist';
import PatientEducation from './components/PatientEducation';
import IncidentReporting from './components/IncidentReporting';
import AlertCenter from './components/AlertCenter';
import NursingAnalytics from './components/NursingAnalytics';
import NursingReports from './components/NursingReports';
import NursingSearchModal from './components/NursingSearchModal';
import RecordVitalsModal from './components/modals/RecordVitalsModal';

function NursingModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    admissions,
    nursingAlerts,
    nursingTasks,
  } = useNursing();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickVitalsModal, setShowQuickVitalsModal] = useState(false);

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

  const unackAlerts = nursingAlerts.filter(a => a.status === 'new').length;
  const pendingTasks = nursingTasks.filter(t => t.status === 'pending').length;

  const NAV_TABS = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'patients', label: '2. My Patients', icon: <Users size={14} />, badge: kpis.totalAssignedPatients },
    { id: 'patient_profile', label: '3. Patient Care EHR', icon: <User size={14} /> },
    { id: 'vitals', label: '4. Vitals', icon: <Activity size={14} /> },
    { id: 'mar', label: '5. Medication Admin (MAR)', icon: <Pill size={14} />, badge: kpis.medicationDueCount > 0 ? kpis.medicationDueCount : undefined },
    { id: 'tasks', label: '6. Nursing Tasks', icon: <CheckCircle2 size={14} />, badge: pendingTasks > 0 ? pendingTasks : undefined },
    { id: 'care_plans', label: '7. Care Plans', icon: <FileText size={14} /> },
    { id: 'intake_output', label: '8. Intake & Output', icon: <Droplets size={14} /> },
    { id: 'wound_care', label: '9. Wound Care', icon: <HeartPulse size={14} /> },
    { id: 'assessment', label: '10. Pain & Assessment', icon: <Stethoscope size={14} /> },
    { id: 'notes', label: '11. Nursing Notes', icon: <ClipboardList size={14} /> },
    { id: 'handover', label: '12. Handover', icon: <FileText size={14} /> },
    { id: 'shifts', label: '13. Shift Management', icon: <Clock size={14} /> },
    { id: 'doctor_orders', label: '14. Doctor Orders', icon: <Stethoscope size={14} /> },
    { id: 'reports', label: '15. Nursing Reports', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Clinical Care</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Nursing</span>
          </div>
          <div className="page-title">Nursing Station & Inpatient Care</div>
          <div className="page-subtitle">
            Bedside care flow: Nurse Allocation → Vitals → Doctor Orders → MAR → Tasks → Care Plan → Notes → Shift Handover
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search Nursing <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Live Alert Badge */}
          {unackAlerts > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('alerts')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bell size={13} /> {unackAlerts} Critical Alert{unackAlerts > 1 ? 's' : ''}
            </button>
          )}

          {/* Quick Record Vitals CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowQuickVitalsModal(true)}
          >
            <Activity size={14} /> Record Vitals
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar (Scrollable with Badges) */}
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
                onClick={() => setActiveTab(tab.id as NursingTab)}
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

      {/* Tab Panels */}
      <div>
        {activeTab === 'dashboard' && <NursingDashboard />}
        {activeTab === 'patients' && <NursingPatientList />}
        {activeTab === 'patient_profile' && <NursingPatientProfile />}
        {activeTab === 'vitals' && <VitalsManagement />}
        {activeTab === 'notes' && <NursingNotesManagement />}
        {activeTab === 'care_plans' && <CarePlanManagement />}
        {activeTab === 'tasks' && <NursingTaskManagement />}
        {activeTab === 'mar' && <MARManagement />}
        {activeTab === 'iv_infusion' && <IVInfusionMonitoring />}
        {activeTab === 'intake_output' && <IntakeOutputManagement />}
        {activeTab === 'assessment' && <PatientAssessment />}
        {activeTab === 'wound_care' && <WoundCareManagement />}
        {activeTab === 'handover' && <NursingHandover />}
        {activeTab === 'shifts' && <ShiftManagement />}
        {activeTab === 'doctor_orders' && <DoctorOrdersManagement />}
        {activeTab === 'sample_collection' && <SampleCollectionManagement />}
        {activeTab === 'discharge_checklist' && <DischargeChecklist />}
        {activeTab === 'patient_education' && <PatientEducation />}
        {activeTab === 'incidents' && <IncidentReporting />}
        {activeTab === 'alerts' && <AlertCenter />}
        {activeTab === 'analytics' && <NursingAnalytics />}
        {activeTab === 'reports' && <NursingReports />}
      </div>

      {/* Modals */}
      {showSearchModal && (
        <NursingSearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {showQuickVitalsModal && (
        <RecordVitalsModal
          admission={admissions[0]}
          onClose={() => setShowQuickVitalsModal(false)}
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
