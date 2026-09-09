import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Barcode,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Printer,
  History,
  Search,
  Plus,
} from 'lucide-react';
import { DiagnosticProvider, useDiagnostic, DiagnosticTab } from './context/DiagnosticContext';
import DiagnosticDashboard from './components/DiagnosticDashboard';
import DiagnosticRequestsView from './components/DiagnosticRequestsView';
import DiagnosticCategoriesView from './components/DiagnosticCategoriesView';
import DiagnosticSampleCollectionView from './components/DiagnosticSampleCollectionView';
import DiagnosticProcessingView from './components/DiagnosticProcessingView';
import DiagnosticResultsView from './components/DiagnosticResultsView';
import DiagnosticCriticalAlertsView from './components/DiagnosticCriticalAlertsView';
import DiagnosticReportsGenerationView from './components/DiagnosticReportsGenerationView';
import DiagnosticReportHistoryView from './components/DiagnosticReportHistoryView';
import DiagnosticSearchModal from './components/modals/DiagnosticSearchModal';
import CreateDiagnosticRequestModal from './components/modals/CreateDiagnosticRequestModal';

function DiagnosticsModuleContent() {
  const { activeTab, setActiveTab, kpis, criticalAlerts } = useDiagnostic();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const unackCritical = criticalAlerts.filter(a => a.status === 'new').length;

  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'requests', label: 'Test Requests', icon: <FileText size={14} />, badge: kpis.todayRequests },
    { id: 'categories', label: 'Diagnostic Categories', icon: <Layers size={14} /> },
    { id: 'sample_collection', label: 'Sample Collection', icon: <Barcode size={14} />, badge: kpis.samplesCollected > 0 ? kpis.samplesCollected : undefined },
    { id: 'processing', label: 'Test Processing', icon: <FlaskConical size={14} />, badge: kpis.inProgress > 0 ? kpis.inProgress : undefined },
    { id: 'results', label: 'Diagnostic Results', icon: <ShieldCheck size={14} />, badge: kpis.reportsReady > 0 ? kpis.reportsReady : undefined },
    { id: 'critical_results', label: 'Critical Results', icon: <AlertTriangle size={14} />, badge: unackCritical > 0 ? unackCritical : undefined, isDanger: unackCritical > 0 },
    { id: 'reports', label: 'Reports', icon: <Printer size={14} /> },
    { id: 'report_history', label: 'Report History', icon: <History size={14} /> },
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
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Overview</span>
          </div>
          <div className="page-title">Diagnostic Services & Investigation Suite</div>
          <div className="page-subtitle">
            Doctor Test Request → Sample Collection / Patient Prep → Test Processing → Result Entry & Verification → Critical Panic Alert → Report Generation → Report Release → History
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Quick Search */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Quick Search <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Critical Value Alert Callout Badge */}
          {unackCritical > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('critical_results')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <AlertTriangle size={13} /> {unackCritical} Critical Panic Value{unackCritical > 1 ? 's' : ''}
            </button>
          )}

          {/* Create Diagnostic Request CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} /> Order Diagnostic Test
          </button>
        </div>
      </div>

      {/* 9-Tab Navigation Bar */}
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
                onClick={() => setActiveTab(tab.id as DiagnosticTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'white' : tab.isDanger ? 'var(--color-danger)' : 'var(--text-secondary)',
                  background: isActive ? (tab.isDanger ? 'var(--color-danger)' : 'var(--color-primary)') : 'transparent',
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
                      background: isActive ? 'white' : tab.isDanger ? 'var(--color-danger)' : 'var(--color-primary-muted)',
                      color: isActive ? (tab.isDanger ? 'var(--color-danger)' : 'var(--color-primary)') : tab.isDanger ? 'white' : 'var(--color-primary)',
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
        {activeTab === 'dashboard' && <DiagnosticDashboard />}
        {activeTab === 'requests' && <DiagnosticRequestsView />}
        {activeTab === 'categories' && <DiagnosticCategoriesView />}
        {activeTab === 'sample_collection' && <DiagnosticSampleCollectionView />}
        {activeTab === 'processing' && <DiagnosticProcessingView />}
        {activeTab === 'results' && <DiagnosticResultsView />}
        {activeTab === 'critical_results' && <DiagnosticCriticalAlertsView />}
        {activeTab === 'reports' && <DiagnosticReportsGenerationView />}
        {activeTab === 'report_history' && <DiagnosticReportHistoryView />}
      </div>

      {/* Modals */}
      {showSearchModal && <DiagnosticSearchModal onClose={() => setShowSearchModal(false)} />}
      {showCreateModal && <CreateDiagnosticRequestModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

export default function DiagnosticsModule() {
  return (
    <DiagnosticProvider>
      <DiagnosticsModuleContent />
    </DiagnosticProvider>
  );
}
