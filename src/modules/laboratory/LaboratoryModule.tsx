import React, { useState, useEffect } from 'react';
import {
  FlaskConical, LayoutDashboard, FileText, Barcode, Truck, Clock,
  Play, ShieldCheck, AlertTriangle, Printer, History, Tag, Package,
  BarChart3, Settings, Search, Plus, ReceiptText, Scan
} from 'lucide-react';
import { LabProvider, useLab, LabTab } from './context/LabContext';
import { BillingProvider } from '../billing/context/BillingContext';
import LabDashboard from './components/LabDashboard';
import LabOrderManagement from './components/LabOrderManagement';
import SampleCollectionQueue from './components/SampleCollectionQueue';
import SampleReceiving from './components/SampleReceiving';
import SampleTrackingTimeline from './components/SampleTrackingTimeline';
import TestProcessingQueue from './components/TestProcessingQueue';
import ResultVerificationQueue from './components/ResultVerificationQueue';
import CriticalResultsCenter from './components/CriticalResultsCenter';
import LabReportsView from './components/LabReportsView';
import PatientLabHistory from './components/PatientLabHistory';
import LabBillingTab from './components/LabBillingTab';
import LabTestMaster from './components/LabTestMaster';
import LabPackagesMaster from './components/LabPackagesMaster';
import LabAnalytics from './components/LabAnalytics';
import LabStatisticalReports from './components/LabStatisticalReports';
import LabSettings from './components/LabSettings';
import LabSearchModal from './components/LabSearchModal';
import CreateLabOrderModal from './components/modals/CreateLabOrderModal';

function LaboratoryModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    criticalAlerts,
  } = useLab();

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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Laboratory</span>
          </div>
          <div className="page-title">Laboratory Management & LIS System</div>
          <div className="page-subtitle">
            Complete clinical laboratory lifecycle: Physician Lab Order → Phlebotomy & Barcode → Sample Intake → Instrument Run → Result Entry & Critical Flags → Pathologist Signoff → Verified Report Release → Billing & Receipts
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Universal Quick Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search LIS <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
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

          {/* Create Lab Order CTA */}
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} /> Order Lab Tests
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar (Scrollable with Badges) */}
      <div
        className="tabs"
        style={{
          marginBottom: 20,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: 4,
          display: 'flex',
          gap: 4,
        }}
      >
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={14} /> Lab Dashboard
        </button>

        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={14} /> Lab Orders ({kpis.totalOrdersToday})
        </button>

        <button
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <ReceiptText size={14} /> Lab Billing & Payments
        </button>

        <button
          className={`tab ${activeTab === 'sample_collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('sample_collection')}
        >
          <Barcode size={14} /> Sample Collection ({kpis.sampleCollectionPending})
        </button>

        <button
          className={`tab ${activeTab === 'sample_receiving' ? 'active' : ''}`}
          onClick={() => setActiveTab('sample_receiving')}
        >
          <Truck size={14} /> Sample Receiving & Quality
        </button>

        <button
          className={`tab ${activeTab === 'sample_tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('sample_tracking')}
        >
          <Clock size={14} /> Sample Tracking Timeline
        </button>

        <button
          className={`tab ${activeTab === 'test_processing' ? 'active' : ''}`}
          onClick={() => setActiveTab('test_processing')}
        >
          <FlaskConical size={14} /> Processing Queue ({kpis.samplesInProcessing})
        </button>

        <button
          className={`tab ${activeTab === 'result_verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('result_verification')}
        >
          <ShieldCheck size={14} /> Pathologist Verification ({kpis.reportsPendingVerification})
        </button>

        <button
          className={`tab ${activeTab === 'critical_results' ? 'active' : ''}`}
          onClick={() => setActiveTab('critical_results')}
        >
          <AlertTriangle size={14} /> Critical Panic Results
          {unackCritical > 0 && (
            <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 10 }}>
              {unackCritical}
            </span>
          )}
        </button>

        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Printer size={14} /> Released Lab Reports ({kpis.reportsVerified})
        </button>

        <button
          className={`tab ${activeTab === 'patient_history' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient_history')}
        >
          <History size={14} /> Patient Lab History
        </button>

        <button
          className={`tab ${activeTab === 'test_master' ? 'active' : ''}`}
          onClick={() => setActiveTab('test_master')}
        >
          <Tag size={14} /> Test Master
        </button>

        <button
          className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          <Package size={14} /> Health Packages
        </button>

        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={14} /> TAT & Analytics
        </button>

        <button
          className={`tab ${activeTab === 'statistical_reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistical_reports')}
        >
          <FileText size={14} /> LIS Reports (14)
        </button>

        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={14} /> Master Settings
        </button>
      </div>

      {/* Main Tab View */}
      <div>
        {activeTab === 'dashboard' && <LabDashboard />}
        {activeTab === 'orders' && <LabOrderManagement />}
        {activeTab === 'billing' && <LabBillingTab />}
        {activeTab === 'sample_collection' && <SampleCollectionQueue />}
        {activeTab === 'sample_receiving' && <SampleReceiving />}
        {activeTab === 'sample_tracking' && <SampleTrackingTimeline />}
        {activeTab === 'test_processing' && <TestProcessingQueue />}
        {activeTab === 'result_verification' && <ResultVerificationQueue />}
        {activeTab === 'critical_results' && <CriticalResultsCenter />}
        {activeTab === 'reports' && <LabReportsView />}
        {activeTab === 'patient_history' && <PatientLabHistory />}
        {activeTab === 'test_master' && <LabTestMaster />}
        {activeTab === 'packages' && <LabPackagesMaster />}
        {activeTab === 'analytics' && <LabAnalytics />}
        {activeTab === 'statistical_reports' && <LabStatisticalReports />}
        {activeTab === 'settings' && <LabSettings />}
      </div>

      {/* Universal Quick Search Modal */}
      {showSearchModal && <LabSearchModal onClose={() => setShowSearchModal(false)} />}

      {/* Quick Create Lab Order Modal */}
      {showCreateModal && <CreateLabOrderModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

export default function LaboratoryModule() {
  return (
    <BillingProvider>
      <LabProvider>
        <LaboratoryModuleContent />
      </LabProvider>
    </BillingProvider>
  );
}
