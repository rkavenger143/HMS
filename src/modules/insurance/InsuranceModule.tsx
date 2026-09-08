// ============================================================
// ALN Cure HMS — Master Insurance Management Module
// ============================================================

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Users,
  FileCheck,
  Clock,
  FileText,
  Files,
  Compass,
  BarChart3
} from 'lucide-react';
import { InsuranceProviderComponent, useInsurance, InsuranceTab } from './context/InsuranceContext';

// Import all 10 Streamlined Tab Views
import InsuranceDashboard from './components/InsuranceDashboard';
import InsuranceProviderManagement from './components/InsuranceProviderManagement';
import InsurancePlanManagement from './components/InsurancePlanManagement';
import PatientInsuranceManagement from './components/PatientInsuranceManagement';
import PolicyVerification from './components/PolicyVerification';
import PreAuthorizationManagement from './components/PreAuthorizationManagement';
import ClaimManagement from './components/ClaimManagement';
import ClaimDocumentsManagement from './components/ClaimDocumentsManagement';
import ClaimProcessingSettlement from './components/ClaimProcessingSettlement';
import InsuranceReportsHistory from './components/InsuranceReportsHistory';

interface NavTabItem {
  id: InsuranceTab;
  index: number;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeVariant?: 'primary' | 'warning' | 'danger' | 'success';
}

function InsuranceModuleContent() {
  const { activeTab, setActiveTab, stats, providers, plans, policies, claims } = useInsurance();

  // Exactly 10 Streamlined Navigation Tabs in the requested order
  const TABS: NavTabItem[] = [
    {
      id: 'dashboard',
      index: 1,
      label: 'Dashboard',
      icon: <LayoutDashboard size={16} />
    },
    {
      id: 'providers',
      index: 2,
      label: 'Insurance Providers',
      icon: <Building2 size={16} />,
      badge: providers.length,
      badgeVariant: 'primary'
    },
    {
      id: 'plans',
      index: 3,
      label: 'Insurance Plans',
      icon: <Layers size={16} />,
      badge: plans.length,
      badgeVariant: 'primary'
    },
    {
      id: 'patient-insurance',
      index: 4,
      label: 'Patient Insurance Registration',
      icon: <Users size={16} />,
      badge: stats.totalInsuredPatients,
      badgeVariant: 'primary'
    },
    {
      id: 'policy-verification',
      index: 5,
      label: 'Policy Verification',
      icon: <FileCheck size={16} />,
      badge: stats.pendingVerifications > 0 ? stats.pendingVerifications : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'pre-auth',
      index: 6,
      label: 'Pre-Authorization',
      icon: <Clock size={16} />,
      badge: stats.pendingPreAuths > 0 ? stats.pendingPreAuths : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'claims',
      index: 7,
      label: 'Insurance Claims',
      icon: <FileText size={16} />,
      badge: stats.pendingClaims > 0 ? stats.pendingClaims : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'claim-documents',
      index: 8,
      label: 'Claim Documents',
      icon: <Files size={16} />
    },
    {
      id: 'processing-settlement',
      index: 9,
      label: 'Claim Processing & Settlement',
      icon: <Compass size={16} />
    },
    {
      id: 'reports-history',
      index: 10,
      label: 'Reports & History',
      icon: <BarChart3 size={16} />
    }
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InsuranceDashboard />;
      case 'providers':
        return <InsuranceProviderManagement />;
      case 'plans':
        return <InsurancePlanManagement />;
      case 'patient-insurance':
      case 'patient-registration':
      case 'patient-policies':
        return <PatientInsuranceManagement />;
      case 'policy-verification':
      case 'coverage-eligibility':
      case 'eligibility':
        return <PolicyVerification />;
      case 'pre-auth':
        return <PreAuthorizationManagement />;
      case 'claims':
        return <ClaimManagement />;
      case 'claim-documents':
        return <ClaimDocumentsManagement />;
      case 'processing-settlement':
      case 'tracking':
      case 'settlements':
        return <ClaimProcessingSettlement />;
      case 'reports-history':
      case 'reports':
      case 'history':
        return <InsuranceReportsHistory />;
      default:
        return <InsuranceDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Tab Navigation Header */}
      <div
        className="card"
        style={{
          padding: '8px 12px',
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id || (tab.id === 'coverage-eligibility' && activeTab === 'eligibility');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-base)',
                    color: isActive ? '#ffffff' : tab.badgeVariant === 'warning' ? '#d97706' : tab.badgeVariant === 'success' ? '#059669' : '#2563eb'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="insurance-tab-content">
        {renderActiveTabContent()}
      </div>
    </div>
  );
}

export default function InsuranceModule() {
  return (
    <InsuranceProviderComponent>
      <InsuranceModuleContent />
    </InsuranceProviderComponent>
  );
}

