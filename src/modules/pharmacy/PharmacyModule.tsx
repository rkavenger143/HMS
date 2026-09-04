import React, { useState, useEffect } from 'react';
import {
  Pill, LayoutDashboard, Search, Layers, Package, ShoppingCart,
  Truck, ArrowUpDown, FileText, Undo2, AlertTriangle, ShieldAlert,
  BarChart3, Settings, Plus, ShoppingBag, ShieldCheck, DollarSign,
  TrendingDown, ReceiptText
} from 'lucide-react';
import { PharmacyProvider, usePharmacy, PharmacyTab } from './context/PharmacyContext';
import PharmacyDashboard from './components/PharmacyDashboard';
import MedicineMaster from './components/MedicineMaster';
import MedicineSearch from './components/MedicineSearch';
import BatchManagement from './components/BatchManagement';
import StockManagement from './components/StockManagement';
import StockInView from './components/StockInView';
import PurchaseOrderManagement from './components/PurchaseOrderManagement';
import SupplierMaster from './components/SupplierMaster';
import StockMovementLedger from './components/StockMovementLedger';
import PrescriptionQueue from './components/PrescriptionQueue';
import PharmacyDispensingDesk from './components/PharmacyDispensingDesk';
import PharmacyPOS from './components/PharmacyPOS';
import PharmacyBillingTab from './components/PharmacyBillingTab';
import MedicineReturns from './components/MedicineReturns';
import ExpiryManagement from './components/ExpiryManagement';
import LowStockAlerts from './components/LowStockAlerts';
import MedicineRecall from './components/MedicineRecall';
import PatientPharmacyHistory from './components/PatientPharmacyHistory';
import PharmacyAnalytics from './components/PharmacyAnalytics';
import PharmacyReports from './components/PharmacyReports';
import PharmacySettings from './components/PharmacySettings';
import PharmacySearchModal from './components/PharmacySearchModal';
import StockInModal from './components/modals/StockInModal';

function PharmacyModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
  } = usePharmacy();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);

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

  const totalExpiryAlerts = kpis.nearExpiryMedicines + kpis.expiredMedicines;

  const NAV_TABS = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'prescriptions', label: '2. Prescriptions', icon: <FileText size={14} />, badge: kpis.pendingPrescriptions },
    { id: 'dispensing', label: '3. Dispensing Desk', icon: <Pill size={14} /> },
    { id: 'pos', label: '4. Counter POS', icon: <ShoppingBag size={14} /> },
    { id: 'medicines', label: '5. Medicines Master', icon: <Pill size={14} />, badge: kpis.totalMedicines },
    { id: 'stock', label: '6. Inventory Stock', icon: <Package size={14} /> },
    { id: 'stock_in', label: '7. Stock In (GRN)', icon: <ShoppingCart size={14} /> },
    { id: 'movement_ledger', label: '8. Stock Movement', icon: <ArrowUpDown size={14} /> },
    { id: 'low_stock', label: '9. Low Stock', icon: <TrendingDown size={14} />, badge: kpis.lowStockMedicines > 0 ? kpis.lowStockMedicines : undefined },
    { id: 'expiry', label: '10. Expiry Management', icon: <AlertTriangle size={14} />, badge: totalExpiryAlerts > 0 ? totalExpiryAlerts : undefined },
    { id: 'suppliers', label: '11. Suppliers', icon: <Truck size={14} /> },
    { id: 'purchase_orders', label: '12. Purchase Orders', icon: <FileText size={14} />, badge: kpis.pendingPurchaseOrders },
    { id: 'returns', label: '13. Returns', icon: <Undo2 size={14} /> },
    { id: 'reports', label: '14. Pharmacy Reports', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Medication & Pharmacy</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Pharmacy</span>
          </div>
          <div className="page-title">Pharmacy Management & Dispensing (PIS)</div>
          <div className="page-subtitle">
            Pharmacy workflow: Prescription Verification → FEFO Stock / Batch Selection → Dispensing → Central Billing → Patient Handout
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search Pharmacy <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Low Stock Badge */}
          {kpis.lowStockMedicines > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('low_stock')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <AlertTriangle size={13} /> {kpis.lowStockMedicines} Low Stock
            </button>
          )}

          {/* Action CTAs */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowStockInModal(true)}
          >
            <Plus size={14} /> Stock In (GRN)
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
                onClick={() => setActiveTab(tab.id as PharmacyTab)}
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
        {activeTab === 'dashboard' && <PharmacyDashboard />}
        {activeTab === 'medicines' && <MedicineMaster />}
        {activeTab === 'search' && <MedicineSearch />}
        {activeTab === 'batches' && <BatchManagement />}
        {activeTab === 'stock' && <StockManagement />}
        {activeTab === 'stock_in' && <StockInView />}
        {activeTab === 'purchase_orders' && <PurchaseOrderManagement />}
        {activeTab === 'suppliers' && <SupplierMaster />}
        {activeTab === 'movement_ledger' && <StockMovementLedger />}
        {activeTab === 'prescriptions' && <PrescriptionQueue />}
        {activeTab === 'dispensing' && <PharmacyDispensingDesk />}
        {activeTab === 'pos' && <PharmacyPOS />}
        {activeTab === 'billing' && <PharmacyBillingTab />}
        {activeTab === 'returns' && <MedicineReturns />}
        {activeTab === 'expiry' && <ExpiryManagement />}
        {activeTab === 'low_stock' && <LowStockAlerts />}
        {activeTab === 'recall' && <MedicineRecall />}
        {activeTab === 'patient_history' && <PatientPharmacyHistory />}
        {activeTab === 'analytics' && <PharmacyAnalytics />}
        {activeTab === 'reports' && <PharmacyReports />}
        {activeTab === 'settings' && <PharmacySettings />}
      </div>

      {/* Modals */}
      {showSearchModal && (
        <PharmacySearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {showStockInModal && (
        <StockInModal onClose={() => setShowStockInModal(false)} />
      )}
    </div>
  );
}

export default function PharmacyModule() {
  return (
    <PharmacyProvider>
      <PharmacyModuleContent />
    </PharmacyProvider>
  );
}
