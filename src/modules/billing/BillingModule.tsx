import React, { useState, useEffect } from 'react';
import {
  DollarSign, ReceiptText, CreditCard, Clock, CheckCircle2,
  AlertCircle, Undo2, ShieldCheck, Plus, ShoppingBag, Building2,
  Activity, Pill, Microscope, Radio, HeartPulse, Search, BarChart3,
  Layers, Users, Scale, FileText, Settings
} from 'lucide-react';
import { BillingProvider, useBilling, BillingTab } from './context/BillingContext';
import BillingDashboard from './components/BillingDashboard';
import CentralBillingWorkspace from './components/CentralBillingWorkspace';
import InvoiceManagement from './components/InvoiceManagement';
import PaymentManagement from './components/PaymentManagement';
import PatientAccountLedger from './components/PatientAccountLedger';
import DepartmentChargeCapture from './components/DepartmentChargeCapture';
import AdvanceManagement from './components/AdvanceManagement';
import RefundManagement from './components/RefundManagement';
import CashCounterManagement from './components/CashCounterManagement';
import InsuranceTPAManagement from './components/InsuranceTPAManagement';
import DiscountManagement from './components/DiscountManagement';
import BillingServiceMaster from './components/BillingServiceMaster';
import BillingReconciliation from './components/BillingReconciliation';
import BillingAnalytics from './components/BillingAnalytics';
import BillingReports from './components/BillingReports';
import BillingSettings from './components/BillingSettings';
import BillingSearchModal from './components/BillingSearchModal';

function BillingModuleContent() {
  const { activeTab, setActiveTab, kpis } = useBilling();
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global search shortcut Ctrl+K
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

  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <ReceiptText size={14} /> },
    { id: 'ledger', label: 'Patient Accounts', icon: <Users size={14} /> },
    { id: 'workspace', label: 'Create Central Bill', icon: <Plus size={14} /> },
    { id: 'invoices', label: 'Invoices Ledger', icon: <FileText size={14} />, badge: kpis.totalInvoicesToday },
    { id: 'payments', label: 'Payments & Receipts', icon: <CreditCard size={14} /> },
    { id: 'charge_capture', label: 'Department Charges', icon: <Layers size={14} /> },
    { id: 'cash_counters', label: 'Cash Counter & Shifts', icon: <DollarSign size={14} /> },
    { id: 'advances', label: 'IPD Advances & Final', icon: <Activity size={14} /> },
    { id: 'insurance_tpa', label: 'Insurance / TPA', icon: <ShieldCheck size={14} /> },
    { id: 'refunds', label: 'Refunds', icon: <Undo2 size={14} /> },
    { id: 'discounts', label: 'Discounts & Concessions', icon: <Scale size={14} /> },
    { id: 'services', label: 'Tariffs & Service Master', icon: <Settings size={14} /> },
    { id: 'reconciliation', label: 'Reconciliation', icon: <CheckCircle2 size={14} /> },
    { id: 'reports', label: 'Billing Reports', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Finance</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Billing</span>
          </div>
          <div className="page-title">Central Billing, Payments & Cashiering</div>
          <div className="page-subtitle">
            Consolidated finance flow: Department Charge Capture → Central Invoice → Payment Processing → Official Receipt Printing → TPA Claims
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search Invoices <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* New Invoice CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('workspace')}
          >
            <Plus size={14} /> Create Central Bill
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
                onClick={() => setActiveTab(tab.id as BillingTab)}
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
        {activeTab === 'dashboard' && <BillingDashboard />}
        {activeTab === 'workspace' && <CentralBillingWorkspace />}
        {activeTab === 'invoices' && <InvoiceManagement />}
        {activeTab === 'payments' && <PaymentManagement />}
        {activeTab === 'ledger' && <PatientAccountLedger />}
        {activeTab === 'charge_capture' && <DepartmentChargeCapture />}
        {activeTab === 'advances' && <AdvanceManagement />}
        {activeTab === 'refunds' && <RefundManagement />}
        {activeTab === 'cash_counters' && <CashCounterManagement />}
        {activeTab === 'insurance_tpa' && <InsuranceTPAManagement />}
        {activeTab === 'discounts' && <DiscountManagement />}
        {activeTab === 'services' && <BillingServiceMaster />}
        {activeTab === 'reconciliation' && <BillingReconciliation />}
        {activeTab === 'analytics' && <BillingAnalytics />}
        {activeTab === 'reports' && <BillingReports />}
        {activeTab === 'settings' && <BillingSettings />}
      </div>

      {/* Modals */}
      {showSearchModal && (
        <BillingSearchModal onClose={() => setShowSearchModal(false)} />
      )}
    </div>
  );
}

export default function BillingModule() {
  return (
    <BillingProvider>
      <BillingModuleContent />
    </BillingProvider>
  );
}
