import React, { useState, useEffect } from 'react';
import {
  Scan, LayoutDashboard, FileText, Calendar, Play, Eye,
  ShieldCheck, AlertTriangle, Printer, History, BarChart3,
  Settings, Search, Plus, Radio, ReceiptText, Camera, ShieldAlert
} from 'lucide-react';
import { RadiologyProvider, useRadiology, RadiologyTab } from './context/RadiologyContext';
import RadiologyDashboard from './components/RadiologyDashboard';
import RadiologyOrderManagement from './components/RadiologyOrderManagement';
import RadiologyBillingTab from './components/RadiologyBillingTab';
import RadiologyScheduling from './components/RadiologyScheduling';
import RadiologyCheckInPreparation from './components/RadiologyCheckInPreparation';
import RadiologyWorklist from './components/RadiologyWorklist';
import StudyManagementView from './components/StudyManagementView';
import RadiologyReportingView from './components/RadiologyReportingView';
import ReportVerificationQueue from './components/ReportVerificationQueue';
import CriticalRadiologyAlerts from './components/CriticalRadiologyAlerts';
import RadiologyReportsArchive from './components/RadiologyReportsArchive';
import PatientRadiologyHistory from './components/PatientRadiologyHistory';
import ModalityMaster from './components/ModalityMaster';
import ExaminationMaster from './components/ExaminationMaster';
import RadiologyPackagesMaster from './components/RadiologyPackagesMaster';
import EquipmentMaintenance from './components/EquipmentMaintenance';
import RadiologyAnalytics from './components/RadiologyAnalytics';
import RadiologyStatisticalReports from './components/RadiologyStatisticalReports';
import RadiologySettings from './components/RadiologySettings';
import RadiologySearchModal from './components/RadiologySearchModal';
import CreateRadiologyOrderModal from './components/modals/CreateRadiologyOrderModal';

function RadiologyModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    criticalAlerts,
  } = useRadiology();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Universal Search Shortcut Ctrl+K
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

  const unackCritical = criticalAlerts.filter(a => a.status === 'new').length;

  const NAV_TABS = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'orders', label: '2. Study Orders', icon: <FileText size={14} />, badge: kpis.totalOrdersToday },
    { id: 'scheduling', label: '3. Scheduling', icon: <Calendar size={14} />, badge: kpis.scheduledExaminations },
    { id: 'check_in', label: '4. Patient Preparation', icon: <ShieldCheck size={14} /> },
    { id: 'worklist', label: '5. Modality Worklist', icon: <Play size={14} />, badge: kpis.examinationsInProgress },
    { id: 'studies', label: '6. DICOM & Studies', icon: <Camera size={14} /> },
    { id: 'reporting', label: '7. Report Entry', icon: <Eye size={14} />, badge: kpis.reportsPending },
    { id: 'verification', label: '8. Report Verification', icon: <ShieldCheck size={14} /> },
    { id: 'reports_archive', label: '9. Completed Reports', icon: <Printer size={14} /> },
    { id: 'critical_findings', label: '10. Critical Findings', icon: <AlertTriangle size={14} />, badge: unackCritical > 0 ? unackCritical : undefined },
    { id: 'modalities', label: '11. Modality Master', icon: <Scan size={14} /> },
    { id: 'patient_history', label: '12. Imaging History', icon: <History size={14} /> },
    { id: 'statistical_reports', label: '13. Radiology Reports', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Diagnostic Services</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Radiology</span>
          </div>
          <div className="page-title">Radiology & Diagnostic Imaging (RIS / PACS)</div>
          <div className="page-subtitle">
            Imaging workflow: Study Order → Scheduling → Patient Prep → Modality Worklist → DICOM Acquisition → Radiologist Report → Verification → Central Billing
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search Imaging <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Critical Panic Badge */}
          {unackCritical > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('critical_findings')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <AlertTriangle size={13} /> {unackCritical} Panic Finding{unackCritical > 1 ? 's' : ''}
            </button>
          )}

          {/* New Scan Order CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} /> Order Imaging Study
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
                onClick={() => setActiveTab(tab.id as RadiologyTab)}
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
        {activeTab === 'dashboard' && <RadiologyDashboard />}
        {activeTab === 'orders' && <RadiologyOrderManagement />}
        {activeTab === 'billing' && <RadiologyBillingTab />}
        {activeTab === 'scheduling' && <RadiologyScheduling />}
        {activeTab === 'check_in' && <RadiologyCheckInPreparation />}
        {activeTab === 'worklist' && <RadiologyWorklist />}
        {activeTab === 'studies' && <StudyManagementView />}
        {activeTab === 'reporting' && <RadiologyReportingView />}
        {activeTab === 'verification' && <ReportVerificationQueue />}
        {activeTab === 'critical_findings' && <CriticalRadiologyAlerts />}
        {activeTab === 'reports_archive' && <RadiologyReportsArchive />}
        {activeTab === 'patient_history' && <PatientRadiologyHistory />}
        {activeTab === 'modalities' && <ModalityMaster />}
        {activeTab === 'examinations' && <ExaminationMaster />}
        {activeTab === 'packages' && <RadiologyPackagesMaster />}
        {activeTab === 'equipment' && <EquipmentMaintenance />}
        {activeTab === 'analytics' && <RadiologyAnalytics />}
        {activeTab === 'statistical_reports' && <RadiologyStatisticalReports />}
        {activeTab === 'settings' && <RadiologySettings />}
      </div>

      {/* Modals */}
      {showSearchModal && (
        <RadiologySearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {showCreateModal && (
        <CreateRadiologyOrderModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default function RadiologyModule() {
  return (
    <RadiologyProvider>
      <RadiologyModuleContent />
    </RadiologyProvider>
  );
}
