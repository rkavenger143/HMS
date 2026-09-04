import React, { useState } from 'react';
import {
  Droplets, LayoutDashboard, UserPlus, Layers, FlaskConical,
  AlertTriangle, Activity, ShieldCheck, HeartPulse, Trash2,
  Thermometer, DollarSign, BarChart3, Plus
} from 'lucide-react';
import { BloodBankProvider, useBloodBank, BloodBankTab } from './context/BloodBankContext';
import { BillingProvider } from '../billing/context/BillingContext';
import BloodBankDashboard from './components/BloodBankDashboard';
import DonorManagement from './components/DonorManagement';
import DonationRegistration from './components/DonationRegistration';
import ScreeningTestingQuarantine from './components/ScreeningTestingQuarantine';
import ComponentProcessing from './components/ComponentProcessing';
import BloodInventory from './components/BloodInventory';
import BloodRequests from './components/BloodRequests';
import CrossMatchDesk from './components/CrossMatchDesk';
import BloodIssueDesk from './components/BloodIssueDesk';
import TransfusionManagement from './components/TransfusionManagement';
import BloodReturnsDiscards from './components/BloodReturnsDiscards';
import StorageTemperatureLogs from './components/StorageTemperatureLogs';
import BloodBankBillingTab from './components/BloodBankBillingTab';
import BloodBankReports from './components/BloodBankReports';
import AddEditDonorModal from './components/modals/AddEditDonorModal';
import CreateBloodRequestModal from './components/modals/CreateBloodRequestModal';

function BloodBankModuleContent() {
  const { activeTab, setActiveTab, emergencyRequestsCount } = useBloodBank();
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Blood Bank Management</span>
          </div>
          <div className="page-title">Blood Bank & Transfusion Medicine Centre</div>
          <div className="page-subtitle">
            Complete Transfusion Lifecycle: Donor Registry &rarr; Phlebotomy &rarr; Serology Testing & Quarantine &rarr; Component Fractionation &rarr; FEFO Inventory &rarr; Cross-Matching &rarr; Safety Issue &rarr; Bedside Transfusion &rarr; Central Billing
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddDonorModal(true)}>
            <UserPlus size={14} /> Register Donor
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateRequestModal(true)}>
            <Plus size={14} /> Create Blood Request
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
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
          <LayoutDashboard size={14} /> Dashboard
        </button>

        <button
          className={`tab ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          <UserPlus size={14} /> Donors
        </button>

        <button
          className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          <Droplets size={14} /> Donations
        </button>

        <button
          className={`tab ${activeTab === 'screening' ? 'active' : ''}`}
          onClick={() => setActiveTab('screening')}
        >
          <FlaskConical size={14} /> Screening & Quarantine
        </button>

        <button
          className={`tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <Layers size={14} /> Component Processing
        </button>

        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Droplets size={14} /> FEFO Inventory
        </button>

        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ position: 'relative' }}
        >
          <AlertTriangle size={14} /> Requests
          {emergencyRequestsCount > 0 && (
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '1px 5px',
              fontSize: 10,
              fontWeight: 900,
              marginLeft: 4,
            }}>
              {emergencyRequestsCount}
            </span>
          )}
        </button>

        <button
          className={`tab ${activeTab === 'crossmatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('crossmatch')}
        >
          <Activity size={14} /> Cross-Matching
        </button>

        <button
          className={`tab ${activeTab === 'issue' ? 'active' : ''}`}
          onClick={() => setActiveTab('issue')}
        >
          <ShieldCheck size={14} /> Blood Issue Desk
        </button>

        <button
          className={`tab ${activeTab === 'transfusion' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfusion')}
        >
          <HeartPulse size={14} /> Transfusions & Hemovigilance
        </button>

        <button
          className={`tab ${activeTab === 'returns_discards' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns_discards')}
        >
          <Trash2 size={14} /> Returns & Discards
        </button>

        <button
          className={`tab ${activeTab === 'storage_temp' ? 'active' : ''}`}
          onClick={() => setActiveTab('storage_temp')}
        >
          <Thermometer size={14} /> Temp Logs
        </button>

        <button
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <DollarSign size={14} /> Billing & Invoices
        </button>

        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={14} /> Quality Reports
        </button>
      </div>

      {/* Main Tab Body */}
      <div>
        {activeTab === 'dashboard' && <BloodBankDashboard />}
        {activeTab === 'donors' && <DonorManagement />}
        {activeTab === 'donations' && <DonationRegistration />}
        {activeTab === 'screening' && <ScreeningTestingQuarantine />}
        {activeTab === 'components' && <ComponentProcessing />}
        {activeTab === 'inventory' && <BloodInventory />}
        {activeTab === 'requests' && <BloodRequests />}
        {activeTab === 'crossmatch' && <CrossMatchDesk />}
        {activeTab === 'issue' && <BloodIssueDesk />}
        {activeTab === 'transfusion' && <TransfusionManagement />}
        {activeTab === 'returns_discards' && <BloodReturnsDiscards />}
        {activeTab === 'storage_temp' && <StorageTemperatureLogs />}
        {activeTab === 'billing' && <BloodBankBillingTab />}
        {activeTab === 'reports' && <BloodBankReports />}
      </div>

      {/* Modals Suite */}
      {showAddDonorModal && (
        <AddEditDonorModal onClose={() => setShowAddDonorModal(false)} />
      )}

      {showCreateRequestModal && (
        <CreateBloodRequestModal onClose={() => setShowCreateRequestModal(false)} />
      )}
    </div>
  );
}

export default function BloodBankModule() {
  return (
    <BillingProvider>
      <BloodBankProvider>
        <BloodBankModuleContent />
      </BloodBankProvider>
    </BillingProvider>
  );
}
