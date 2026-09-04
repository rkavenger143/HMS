import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import MedicalIcon, { MedicalBrandLogo } from '../common/MedicalIcons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  allowedRoles?: UserRole[];
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  // OVERVIEW
  { id: 'dashboard', label: 'Dashboard', icon: <MedicalIcon name="dashboard" size={19} strokeWidth={2} />, path: '/dashboard', section: 'Overview' },
  { id: 'ai', label: 'ALN Cure AI', icon: <MedicalIcon name="ai" size={19} strokeWidth={2} />, path: '/ai', section: 'Overview', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management'] },
  // PATIENTS
  { id: 'patients', label: 'Patients', icon: <MedicalIcon name="patients" size={19} strokeWidth={2} />, path: '/patients', section: 'Patient Care', allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'billing_staff', 'management'] },
  { id: 'appointments', label: 'Appointments', icon: <MedicalIcon name="appointments" size={19} strokeWidth={2} />, path: '/appointments', section: 'Patient Care', allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'management'] },
  // CLINICAL CARE
  { id: 'opd', label: 'OPD', icon: <MedicalIcon name="opd" size={19} strokeWidth={2} />, path: '/opd', section: 'Clinical Care', allowedRoles: ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'nurse', 'management'] },
  { id: 'ipd', label: 'IPD & Beds', icon: <MedicalIcon name="ipd" size={19} strokeWidth={2} />, path: '/ipd', section: 'Clinical Care', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management'] },
  { id: 'nursing', label: 'Nursing', icon: <MedicalIcon name="nursing" size={19} strokeWidth={2} />, path: '/nursing', section: 'Clinical Care', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'management'] },
  { id: 'diet', label: 'Diet Charts', icon: <MedicalIcon name="diet" size={19} strokeWidth={2} />, path: '/diet', section: 'Clinical Care', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dietitian', 'management'] },
  // DIAGNOSTIC SERVICES
  { id: 'lab', label: 'Laboratory', icon: <MedicalIcon name="laboratory" size={19} strokeWidth={2} />, path: '/laboratory', section: 'Diagnostic Services', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'lab_technician', 'nurse', 'management'] },
  { id: 'radiology', label: 'Radiology', icon: <MedicalIcon name="radiology" size={19} strokeWidth={2} />, path: '/radiology', section: 'Diagnostic Services', allowedRoles: ['super_admin', 'hospital_admin', 'doctor', 'radiology_technician', 'management'] },
  // MEDICATION & PHARMACY
  { id: 'pharmacy', label: 'Pharmacy', icon: <MedicalIcon name="pharmacy" size={19} strokeWidth={2} />, path: '/pharmacy', section: 'Medication & Pharmacy', allowedRoles: ['super_admin', 'hospital_admin', 'pharmacist', 'doctor', 'management'] },
  // FINANCE
  { id: 'billing', label: 'Billing', icon: <MedicalIcon name="billing" size={19} strokeWidth={2} />, path: '/billing', section: 'Finance', allowedRoles: ['super_admin', 'hospital_admin', 'billing_staff', 'management'] },
  // STAFF
  { id: 'doctors', label: 'Doctors', icon: <MedicalIcon name="doctors" size={19} strokeWidth={2} />, path: '/doctors', section: 'Staff', allowedRoles: ['super_admin', 'hospital_admin', 'management'] },
  // EMERGENCY
  { id: 'ambulance', label: 'Ambulance', icon: <MedicalIcon name="ambulance" size={19} strokeWidth={2} />, path: '/ambulance', section: 'Emergency', allowedRoles: ['super_admin', 'hospital_admin', 'ambulance_staff', 'receptionist', 'management'] },
  // BLOOD BANK
  { id: 'bloodbank', label: 'Blood Bank', icon: <MedicalIcon name="bloodbank" size={19} strokeWidth={2} />, path: '/blood-bank', section: 'Blood Bank', allowedRoles: ['super_admin', 'hospital_admin', 'blood_bank_staff', 'doctor', 'management'] },
  // ANALYTICS
  { id: 'reports', label: 'Reports', icon: <MedicalIcon name="reports" size={19} strokeWidth={2} />, path: '/reports', section: 'Analytics', allowedRoles: ['super_admin', 'hospital_admin', 'management', 'billing_staff'] },
  // ADMIN
  { id: 'admin', label: 'Admin Panel', icon: <MedicalIcon name="admin" size={19} strokeWidth={2} />, path: '/admin', section: 'Admin', allowedRoles: ['super_admin', 'hospital_admin'] },
  { id: 'settings', label: 'Settings', icon: <MedicalIcon name="settings" size={19} strokeWidth={2} />, path: '/settings', section: 'Admin', allowedRoles: ['super_admin', 'hospital_admin'] },
];

// Patient portal nav items
const PATIENT_NAV: NavItem[] = [
  { id: 'portal-dashboard', label: 'My Dashboard', icon: <MedicalIcon name="dashboard" size={19} strokeWidth={2} />, path: '/portal', section: 'Portal' },
  { id: 'portal-appointments', label: 'Appointments', icon: <MedicalIcon name="appointments" size={19} strokeWidth={2} />, path: '/portal/appointments', section: 'Portal' },
  { id: 'portal-reports', label: 'Lab Reports', icon: <MedicalIcon name="laboratory" size={19} strokeWidth={2} />, path: '/portal/reports', section: 'Portal' },
  { id: 'portal-prescriptions', label: 'Prescriptions', icon: <MedicalIcon name="pharmacy" size={19} strokeWidth={2} />, path: '/portal/prescriptions', section: 'Portal' },
  { id: 'portal-bills', label: 'Bills', icon: <MedicalIcon name="billing" size={19} strokeWidth={2} />, path: '/portal/bills', section: 'Portal' },
  { id: 'portal-profile', label: 'My Profile', icon: <MedicalIcon name="patients" size={19} strokeWidth={2} />, path: '/portal/profile', section: 'Portal' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  emergencyCount?: number;
}

export default function Sidebar({ collapsed, onToggle, emergencyCount = 0 }: SidebarProps) {
  const { state, logout } = useAuth();
  const location = useLocation();
  const isPatient = state.user?.role === 'patient';

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
      {/* Logo with Medical Heart Brand */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'transparent', padding: 0 }}>
          <MedicalBrandLogo size={26} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">ALN Cure HMS</div>
            <div className="sidebar-logo-sub">✦ AI Medical Suite</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="sidebar-section">
            {!collapsed && <div className="sidebar-section-label">{section}</div>}
            {items.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
                      {item.id === 'ambulance' && emergencyCount > 0 && (
                        <span className="sidebar-badge">{emergencyCount}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
          {!collapsed && <span className="sidebar-item-label">Logout</span>}
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
