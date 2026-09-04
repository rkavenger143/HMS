import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, LayoutDashboard, Building2, Users, Shield,
  UserCheck, Stethoscope, BedDouble, Settings2, DollarSign,
  Bell, Database, Settings, Activity, Search, Printer,
  FileSpreadsheet, Radio, Sparkles
} from 'lucide-react';
import { AdminProvider, useAdmin, AdminTab } from './context/AdminContext';

// Import Subcomponents
import AdminDashboard from './components/AdminDashboard';
import HospitalProfileSettings from './components/HospitalProfileSettings';
import UserManagement from './components/UserManagement';
import RolePermissionManagement from './components/RolePermissionManagement';
import DepartmentManagement from './components/DepartmentManagement';
import StaffManagement from './components/StaffManagement';
import DoctorAdminConfig from './components/DoctorAdminConfig';
import WardBedConfig from './components/WardBedConfig';
import ClinicalModuleSettings from './components/ClinicalModuleSettings';
import BillingInsuranceConfig from './components/BillingInsuranceConfig';
import NotificationSettings from './components/NotificationSettings';
import MasterDataManager from './components/MasterDataManager';
import SystemSettings from './components/SystemSettings';
import AuditLogViewer from './components/AuditLogViewer';
import SystemActivityMonitor from './components/SystemActivityMonitor';

interface AdminTabConfig {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  section: 'Overview' | 'Access Control' | 'Organization' | 'Clinical & Finance' | 'System & Audit';
}

const ADMIN_TABS: AdminTabConfig[] = [
  { id: 'dashboard', label: 'Admin Cockpit', icon: LayoutDashboard, section: 'Overview' },
  { id: 'hospital_profile', label: 'Hospital Profile', icon: Building2, section: 'Overview' },
  { id: 'users', label: 'User Directory', icon: Users, section: 'Access Control' },
  { id: 'roles_permissions', label: 'Roles & RBAC Matrix', icon: Shield, section: 'Access Control' },
  { id: 'departments', label: 'Departments & HODs', icon: Building2, section: 'Organization' },
  { id: 'staff', label: 'Staff & Rosters', icon: UserCheck, section: 'Organization' },
  { id: 'doctors', label: 'Doctor Tariffs & Rooms', icon: Stethoscope, section: 'Organization' },
  { id: 'wards_beds', label: 'Wards & Bed Setup', icon: BedDouble, section: 'Organization' },
  { id: 'clinical_settings', label: 'Clinical Module Config', icon: Settings2, section: 'Clinical & Finance' },
  { id: 'billing_insurance', label: 'Billing, Taxes & TPA', icon: DollarSign, section: 'Clinical & Finance' },
  { id: 'notifications', label: 'Alert Gateways & Triggers', icon: Bell, section: 'Clinical & Finance' },
  { id: 'master_data', label: 'Master Data & Taxonomy', icon: Database, section: 'System & Audit' },
  { id: 'system_settings', label: 'System Policies & Security', icon: Settings, section: 'System & Audit' },
  { id: 'audit_logs', label: 'Immutable Audit Logs', icon: ShieldCheck, section: 'System & Audit' },
  { id: 'system_activity', label: 'Live System Activity', icon: Activity, section: 'System & Audit' },
];

function AdminPanelContent() {
  const { activeTab, setActiveTab, hospitalProfile } = useAdmin();
  const [globalSearch, setGlobalSearch] = useState('');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'hospital_profile':
        return <HospitalProfileSettings />;
      case 'users':
        return <UserManagement />;
      case 'roles_permissions':
        return <RolePermissionManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'doctors':
        return <DoctorAdminConfig />;
      case 'wards_beds':
        return <WardBedConfig />;
      case 'clinical_settings':
        return <ClinicalModuleSettings />;
      case 'billing_insurance':
        return <BillingInsuranceConfig />;
      case 'notifications':
        return <NotificationSettings />;
      case 'master_data':
        return <MasterDataManager />;
      case 'system_settings':
        return <SystemSettings />;
      case 'audit_logs':
        return <AuditLogViewer />;
      case 'system_activity':
        return <SystemActivityMonitor />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Breadcrumb & Title Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Hospital Administration</span>
            <span className="breadcrumb-sep">›</span>
            <span>Governance</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Administration Control Panel</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
            ALN CURE HMS — Central Administration & Governance Hub
          </div>
          <div className="page-subtitle">
            {hospitalProfile.name} • System Code: <strong>{hospitalProfile.code}</strong> • Full Hospital Configuration & RBAC Access Control
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-color)',
          scrollbarWidth: 'thin',
        }}
      >
        {ADMIN_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 15px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      <div style={{ minHeight: 600 }}>
        {renderActiveTabContent()}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
}
