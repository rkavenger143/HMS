import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import {
  LogOut, ChevronLeft, ChevronRight, Bell, Shield, ShieldCheck,
  LayoutDashboard, Users, CalendarCheck, BedDouble,
  Stethoscope, HeartPulse, FlaskConical, UtensilsCrossed,
  Pill, ReceiptText, BarChart3, Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import MedicalIcon, { MedicalBrandLogo } from '../common/MedicalIcons';
import { storageService } from '../../services/storageService';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  badgeVariant?: 'primary' | 'danger' | 'warning' | 'success';
  allowedRoles?: UserRole[];
  section?: string;
}

export default function Sidebar({
  collapsed,
  onToggle,
  emergencyCount = 0
}: {
  collapsed: boolean;
  onToggle: () => void;
  emergencyCount?: number;
}) {
  const { state, logout } = useAuth();
  const location = useLocation();
  const isPatient = state.user?.role === 'patient';
  const [liveStats, setLiveStats] = useState(() => storageService.getDashboardMetrics());
  const [liveInsMetrics, setLiveInsMetrics] = useState(() => storageService.getInsuranceMetrics());

  useEffect(() => {
    const handleUpdate = () => {
      setLiveStats(storageService.getDashboardMetrics());
      setLiveInsMetrics(storageService.getInsuranceMetrics());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);


  // Standard Organized Hospital Order (1 to 13)
  const NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/dashboard',
      section: 'Overview'
    },
    {
      id: 'patients',
      label: 'Patient Management',
      icon: <Users size={18} />,
      path: '/patients',
      badge: liveStats.totalPatients,
      badgeVariant: 'primary',
      section: 'Clinical Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'billing_staff', 'management']
    },
    {
      id: 'opd',
      label: 'Appointments / OPD',
      icon: <CalendarCheck size={18} />,
      path: '/opd',
      badge: liveStats.pendingAppointments > 0 ? liveStats.pendingAppointments : undefined,
      badgeVariant: 'warning',
      section: 'Clinical Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'management']
    },
    {
      id: 'ipd',
      label: 'IPD & Bed Management',
      icon: <BedDouble size={18} />,
      path: '/ipd',
      badge: liveStats.ipdPatients > 0 ? liveStats.ipdPatients : undefined,
      badgeVariant: 'primary',
      section: 'Clinical Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management']
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: <Stethoscope size={18} />,
      path: '/doctors',
      badge: liveStats.doctorsOnDuty > 0 ? liveStats.doctorsOnDuty : undefined,
      badgeVariant: 'success',
      section: 'Staff & Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'management']
    },
    {
      id: 'nursing',
      label: 'Nursing',
      icon: <HeartPulse size={18} />,
      path: '/nursing',
      section: 'Staff & Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management']
    },
    {
      id: 'diagnostics',
      label: 'Diagnostic Services',
      icon: <FlaskConical size={18} />,
      path: '/diagnostics',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'lab_technician', 'radiology_technician', 'nurse', 'management']
    },
    {
      id: 'diet',
      label: 'Diet Charts',
      icon: <UtensilsCrossed size={18} />,
      path: '/diet',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dietitian', 'management']
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: <Pill size={18} />,
      path: '/pharmacy',
      badge: liveStats.lowStockCount > 0 ? liveStats.lowStockCount : undefined,
      badgeVariant: 'danger',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'pharmacist', 'doctor', 'management']
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <ReceiptText size={18} />,
      path: '/billing',
      section: 'Finance & Analytics',
      allowedRoles: ['super_admin', 'hospital_admin', 'billing_staff', 'management']
    },
    {
      id: 'insurance',
      label: 'Insurance Management',
      icon: <ShieldCheck size={18} />,
      path: '/insurance',
      badge: liveInsMetrics.pendingPreAuths + liveInsMetrics.pendingClaims > 0 ? liveInsMetrics.pendingPreAuths + liveInsMetrics.pendingClaims : undefined,
      badgeVariant: 'warning',
      section: 'Finance & Analytics',
      allowedRoles: ['super_admin', 'hospital_admin', 'insurance_coordinator', 'billing_staff', 'management', 'doctor']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={18} />,
      path: '/reports',
      section: 'Finance & Analytics',
      allowedRoles: ['super_admin', 'hospital_admin', 'management', 'billing_staff']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      path: '/notifications',
      badge: liveStats.alerts.length > 0 ? liveStats.alerts.length : undefined,
      badgeVariant: 'danger',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management', 'billing_staff', 'receptionist', 'pharmacist', 'lab_technician']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon size={18} />,
      path: '/settings',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin']
    },
  ];

  // Patient portal nav items
  const PATIENT_NAV: NavItem[] = [
    { id: 'portal-dashboard', label: 'My Dashboard', icon: <LayoutDashboard size={18} />, path: '/portal', section: 'Patient Portal' },
    { id: 'portal-appointments', label: 'Appointments', icon: <CalendarCheck size={18} />, path: '/portal/appointments', section: 'Patient Portal' },
    { id: 'portal-reports', label: 'Lab Reports', icon: <FlaskConical size={18} />, path: '/portal/reports', section: 'Patient Portal' },
    { id: 'portal-prescriptions', label: 'Prescriptions', icon: <Pill size={18} />, path: '/portal/prescriptions', section: 'Patient Portal' },
    { id: 'portal-bills', label: 'Bills & Payments', icon: <ReceiptText size={18} />, path: '/portal/bills', section: 'Patient Portal' },
    { id: 'portal-profile', label: 'My Profile', icon: <Users size={18} />, path: '/portal/profile', section: 'Patient Portal' },
  ];

  const filteredNav = isPatient
    ? PATIENT_NAV
    : NAV_ITEMS.filter(item => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(state.user?.role as UserRole);
      });

  // Group by section
  const sections: Record<string, NavItem[]> = {};
  filteredNav.forEach(item => {
    const section = item.section || 'General';
    if (!sections[section]) sections[section] = [];
    sections[section].push(item);
  });

  const initials = state.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'transparent', padding: 0 }}>
          <MedicalBrandLogo size={26} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title" style={{ color: '#1e3a8a', fontWeight: 800 }}>ALN Cure HMS</div>
            <div className="sidebar-logo-sub" style={{ color: '#2563eb' }}>Enterprise Health System</div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="sidebar-section">
            {!collapsed && <div className="sidebar-section-label">{section}</div>}
            {items.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="sidebar-item-label">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`sidebar-badge badge-${item.badgeVariant || 'primary'}`}
                          style={{
                            marginLeft: 'auto',
                            padding: '2px 7px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '999px',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="avatar avatar-sm" style={{ flexShrink: 0, background: '#2563eb', color: 'white', fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="truncate" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {state.user?.name}
              </div>
              <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                {state.user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        )}

        <button
          className="sidebar-item"
          onClick={logout}
          style={{ width: '100%', color: 'var(--color-danger)' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="sidebar-item-icon"><LogOut size={16} /></span>
          {!collapsed && <span className="sidebar-item-label">Sign Out</span>}
        </button>

        <button
          className="sidebar-item"
          onClick={onToggle}
          style={{ width: '100%', marginTop: '4px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="sidebar-item-icon">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && <span className="sidebar-item-label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
