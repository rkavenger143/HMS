import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import {
  LogOut, ChevronLeft, ChevronRight, Bell, Shield, ShieldCheck,
  LayoutDashboard, Users, CalendarCheck, Calendar, BedDouble,
  Stethoscope, HeartPulse, FlaskConical, Scan, UtensilsCrossed,
  Pill, ReceiptText, BarChart3, Settings as SettingsIcon,
  Sparkles, Siren, Building2, UserCheck, LifeBuoy, Briefcase, X
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
  emergencyCount = 0,
  mobileOpen = false,
  onCloseMobile
}: {
  collapsed: boolean;
  onToggle: () => void;
  emergencyCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const { state, logout } = useAuth();
  const location = useLocation();
  const [liveStats, setLiveStats] = useState(() => storageService.getDashboardMetrics());
  const [liveInsMetrics, setLiveInsMetrics] = useState(() => storageService.getInsuranceMetrics());
  const [liveErCount, setLiveErCount] = useState(() => storageService.getEmergencyPatients().filter(p => p.status !== 'discharged').length);
  const [liveCleaningCount, setLiveCleaningCount] = useState(() => storageService.getCleaningTasks().filter(t => t.status === 'pending' || t.status === 'assigned').length);
  const [liveSupportCount, setLiveSupportCount] = useState(() => storageService.getSupportTickets().filter(t => t.status === 'open' || t.status === 'assigned').length);

  useEffect(() => {
    const handleUpdate = () => {
      setLiveStats(storageService.getDashboardMetrics());
      setLiveInsMetrics(storageService.getInsuranceMetrics());
      setLiveErCount(storageService.getEmergencyPatients().filter(p => p.status !== 'discharged').length);
      setLiveCleaningCount(storageService.getCleaningTasks().filter(t => t.status === 'pending' || t.status === 'assigned').length);
      setLiveSupportCount(storageService.getSupportTickets().filter(t => t.status === 'open' || t.status === 'assigned').length);
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  // Standard Master 22-Module HMS Order
  const NAV_ITEMS: NavItem[] = [
    // Dashboard
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/dashboard',
      section: 'Core Management'
    },
    {
      id: 'ai-assistant',
      label: 'AI Command Center',
      icon: <Sparkles size={18} style={{ color: 'var(--color-primary, #059669)' }} />,
      path: '/ai',
      badge: undefined,
      section: 'Core Management',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dietitian', 'lab_technician', 'radiology_technician', 'pharmacist', 'billing_staff', 'insurance_coordinator', 'ambulance_staff', 'blood_bank_staff', 'receptionist', 'management']
    },
    // Patients
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users size={18} />,
      path: '/patients',
      badge: liveStats.totalPatients,
      badgeVariant: 'primary',
      section: 'Clinical Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'billing_staff', 'management']
    },
    // Appointments
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar size={18} />,
      path: '/appointments',
      badge: liveStats.pendingAppointments > 0 ? liveStats.pendingAppointments : undefined,
      badgeVariant: 'warning',
      section: 'Clinical Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'management']
    },
    // OPD
    {
      id: 'opd',
      label: 'OPD & Consultations',
      icon: <CalendarCheck size={18} />,
      path: '/opd',
      section: 'Clinical Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'management']
    },
    // Emergency
    {
      id: 'emergency',
      label: 'Emergency & Trauma',
      icon: <Siren size={18} style={{ color: liveErCount > 0 ? '#ef4444' : 'inherit' }} />,
      path: '/emergency',
      badge: liveErCount > 0 ? liveErCount : undefined,
      badgeVariant: 'danger',
      section: 'Clinical Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'ambulance_staff', 'receptionist', 'management']
    },
    // IPD & Beds
    {
      id: 'ipd',
      label: 'IPD & Beds',
      icon: <BedDouble size={18} />,
      path: '/ipd',
      badge: liveStats.ipdPatients > 0 ? liveStats.ipdPatients : undefined,
      badgeVariant: 'primary',
      section: 'Clinical Care',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management']
    },
    // Doctors
    {
      id: 'doctors',
      label: 'Doctors',
      icon: <Stethoscope size={18} />,
      path: '/doctors',
      badge: liveStats.doctorsOnDuty > 0 ? liveStats.doctorsOnDuty : undefined,
      badgeVariant: 'success',
      section: 'Medical Staff',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'management']
    },
    // Nursing
    {
      id: 'nursing',
      label: 'Nursing Care',
      icon: <HeartPulse size={18} />,
      path: '/nursing',
      section: 'Medical Staff',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management']
    },
    // Laboratory (Dedicated LIS)
    {
      id: 'laboratory',
      label: 'Laboratory',
      icon: <FlaskConical size={18} />,
      path: '/laboratory',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'lab_technician', 'nurse', 'management']
    },
    // Diagnostics & Radiology (Dedicated RIS)
    {
      id: 'radiology',
      label: 'Diagnostics & Radiology',
      icon: <Scan size={18} />,
      path: '/radiology',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'radiology_technician', 'lab_technician', 'nurse', 'management']
    },
    // Pharmacy
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
    // Diet & Nutrition
    {
      id: 'diet',
      label: 'Diet & Nutrition',
      icon: <UtensilsCrossed size={18} />,
      path: '/diet',
      section: 'Diagnostics & Pharmacy',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dietitian', 'management']
    },
    // Billing & Finance
    {
      id: 'billing',
      label: 'Billing & Finance',
      icon: <ReceiptText size={18} />,
      path: '/billing',
      section: 'Finance & Insurance',
      allowedRoles: ['super_admin', 'hospital_admin', 'billing_staff', 'management']
    },
    // Insurance
    {
      id: 'insurance',
      label: 'Insurance & TPA',
      icon: <ShieldCheck size={18} />,
      path: '/insurance',
      badge: liveInsMetrics.pendingPreAuths + liveInsMetrics.pendingClaims > 0 ? liveInsMetrics.pendingPreAuths + liveInsMetrics.pendingClaims : undefined,
      badgeVariant: 'warning',
      section: 'Finance & Insurance',
      allowedRoles: ['super_admin', 'hospital_admin', 'insurance_coordinator', 'billing_staff', 'management', 'doctor']
    },
    // Ambulance
    {
      id: 'ambulance',
      label: 'Ambulance Fleet',
      icon: <MedicalIcon name="ambulance" size={18} />,
      path: '/ambulance',
      section: 'Support Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'ambulance_staff', 'receptionist', 'doctor', 'management']
    },
    // Blood Bank
    {
      id: 'blood-bank',
      label: 'Blood Bank',
      icon: <MedicalIcon name="bloodbank" size={18} />,
      path: '/blood-bank',
      section: 'Support Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'blood_bank_staff', 'doctor', 'management']
    },
    // Housekeeping & Facilities
    {
      id: 'housekeeping',
      label: 'Housekeeping & Facilities',
      icon: <Building2 size={18} />,
      path: '/housekeeping',
      badge: liveCleaningCount > 0 ? liveCleaningCount : undefined,
      badgeVariant: 'warning',
      section: 'Support Services',
      allowedRoles: ['super_admin', 'hospital_admin', 'nurse', 'doctor', 'management']
    },
    // HR & Employees
    {
      id: 'hr',
      label: 'HR & Employees',
      icon: <Briefcase size={18} />,
      path: '/hr',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin', 'management']
    },
    // Help & Support Desk
    {
      id: 'support',
      label: 'Help & Support Desk',
      icon: <LifeBuoy size={18} />,
      path: '/support',
      badge: liveSupportCount > 0 ? liveSupportCount : undefined,
      badgeVariant: 'primary',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management', 'billing_staff', 'receptionist', 'pharmacist', 'lab_technician']
    },
    // Reports
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 size={18} />,
      path: '/reports',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin', 'management', 'billing_staff']
    },
    // Notifications
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
    // Administration / Settings
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <Shield size={18} />,
      path: '/admin',
      section: 'Administration',
      allowedRoles: ['super_admin', 'hospital_admin']
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

  const filteredNav = NAV_ITEMS.filter(item => {
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
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'transparent', padding: 0 }}>
          <MedicalBrandLogo size={26} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title" style={{ color: '#065f46', fontWeight: 800 }}>ALN Cure HMS</div>
            <div className="sidebar-logo-sub" style={{ color: '#059669', fontWeight: 600 }}>Enterprise Health System</div>
          </div>
        )}
        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          title="Close Sidebar"
        >
          <X size={16} />
        </button>
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
                  onClick={onCloseMobile}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {!collapsed ? (
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
                  ) : (
                    item.badge !== undefined && item.badge > 0 && (
                      <span className={`sidebar-badge badge-${item.badgeVariant || 'primary'}`} />
                    )
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
            <div className="avatar avatar-sm" style={{ flexShrink: 0, background: '#059669', color: 'white', fontWeight: 700 }}>
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
