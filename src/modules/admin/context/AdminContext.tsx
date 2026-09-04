import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DEMO_USERS,
  DEMO_DOCTORS,
  DEMO_PATIENTS,
  DEMO_APPOINTMENTS,
  DEMO_ADMISSIONS,
  DEMO_BEDS,
  DEMO_LAB_REQUESTS,
  DEMO_RADIOLOGY_STUDIES,
  DEMO_MEDICINES,
  DEMO_DISPENSINGS,
  DEMO_BILLS,
} from '../../../data/seedData';
import type { User, UserRole, Doctor, Bed, Department } from '../../../types';

export type AdminTab =
  | 'dashboard'
  | 'hospital_profile'
  | 'users'
  | 'roles_permissions'
  | 'departments'
  | 'staff'
  | 'doctors'
  | 'wards_beds'
  | 'clinical_settings'
  | 'billing_insurance'
  | 'notifications'
  | 'master_data'
  | 'system_settings'
  | 'audit_logs'
  | 'system_activity';

export interface HospitalProfile {
  name: string;
  code: string;
  logo: string;
  registrationNumber: string;
  gstNumber: string;
  panNumber: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  timeZone: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
}

export interface AdminRole {
  id: string;
  name: string;
  roleKey: string;
  description: string;
  isSystem: boolean;
  color: string;
  permissions: string[];
}

export interface AdminStaff {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  role: string;
  phone: string;
  email: string;
  joiningDate: string;
  shift: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)' | 'General (09:00 - 17:00)';
  reportingManager: string;
  status: 'active' | 'inactive' | 'on_leave';
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  recordId?: string;
  ipAddress: string;
  previousValue?: string;
  newValue?: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface SystemActivityEvent {
  id: string;
  timestamp: string;
  eventType: 'login_success' | 'login_failed' | 'user_created' | 'role_changed' | 'financial_override' | 'security_alert';
  userName: string;
  ipAddress: string;
  description: string;
  status: 'success' | 'warning' | 'danger';
}

export interface MasterDataItem {
  id: string;
  category: 'Specialization' | 'Designation' | 'Sample Type' | 'Blood Component' | 'Unit' | 'Payment Method' | 'Room Type' | 'Service Category';
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  type: 'Insurance' | 'TPA' | 'Corporate';
  contactPerson: string;
  phone: string;
  email: string;
  settlementPeriodDays: number;
  discountPercentage: number;
  isActive: boolean;
}

export interface SystemSettingsConfig {
  theme: 'light' | 'dark' | 'system';
  tablePageSize: number;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  passwordExpiryDays: number;
  requireTwoFactor: boolean;
  headerPrintText: string;
  footerPrintText: string;
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
  enableInAppAlerts: boolean;
  invoicePrefix: string;
  receiptPrefix: string;
  appointmentTokenPrefix: string;
}

interface AdminContextType {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;

  // Hospital Profile
  hospitalProfile: HospitalProfile;
  updateHospitalProfile: (updates: Partial<HospitalProfile>) => void;

  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  lockUser: (id: string, locked: boolean) => void;
  resetUserPassword: (id: string, newPassword: string) => void;
  deleteUser: (id: string) => void;

  // Roles & Permissions
  roles: AdminRole[];
  addRole: (role: Omit<AdminRole, 'id'>) => void;
  updateRolePermissions: (roleKey: string, permissions: string[]) => void;
  deleteRole: (id: string) => void;

  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  toggleDepartmentStatus: (id: string) => void;

  // Staff
  staffList: AdminStaff[];
  addStaff: (staff: Omit<AdminStaff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<AdminStaff>) => void;
  toggleStaffStatus: (id: string) => void;

  // Doctors Admin Config
  doctors: Doctor[];
  updateDoctorAdmin: (id: string, updates: Partial<Doctor>) => void;

  // Beds & Infrastructure
  beds: Bed[];
  addBed: (bed: Omit<Bed, 'id'>) => void;
  updateBed: (id: string, updates: Partial<Bed>) => void;
  toggleBedStatus: (id: string, status: any) => void;

  // Master Data
  masterData: MasterDataItem[];
  addMasterItem: (item: Omit<MasterDataItem, 'id'>) => void;
  updateMasterItem: (id: string, updates: Partial<MasterDataItem>) => void;
  toggleMasterItemStatus: (id: string) => void;

  // Insurance & TPA
  insuranceCompanies: InsuranceCompany[];
  addInsuranceCompany: (comp: Omit<InsuranceCompany, 'id'>) => void;
  updateInsuranceCompany: (id: string, updates: Partial<InsuranceCompany>) => void;

  // System Settings
  systemSettings: SystemSettingsConfig;
  updateSystemSettings: (updates: Partial<SystemSettingsConfig>) => void;

  // Audit Logs & Activity
  auditLogs: SystemAuditLog[];
  activityEvents: SystemActivityEvent[];
  logAuditEvent: (action: string, module: string, details?: string, severity?: 'info' | 'warning' | 'danger') => void;

  // Dashboard Aggregates
  dashboardStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalDoctors: number;
    totalStaff: number;
    totalDepartments: number;
    totalPatients: number;
    opdToday: number;
    ipdToday: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    pendingAppointments: number;
    pendingLab: number;
    pendingRadiology: number;
    lowStockMedicines: number;
    availableBloodUnits: number;
    outstandingBilling: number;
    todayRevenue: number;
  };

  // Utility Export
  exportCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const DEFAULT_HOSPITAL_PROFILE: HospitalProfile = {
  name: 'ALN Cure Super Speciality Hospital',
  code: 'ALN-HOSP-01',
  logo: '',
  registrationNumber: 'DL-MED-2020-00892',
  gstNumber: '07AABCD1234E1Z5',
  panNumber: 'AABCA1234K',
  phone: '+91-120-4000-911',
  emergencyPhone: '+91-120-4000-108',
  email: 'admin@alnhms.com',
  website: 'www.alnhms.com',
  address: 'Plot 12, Health City, Sector 62',
  city: 'Noida',
  state: 'Uttar Pradesh',
  country: 'India',
  pincode: '201301',
  timeZone: 'Asia/Kolkata (IST +5:30)',
  currency: 'Indian Rupee (INR)',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-Hour (AM/PM)',
};

const DEFAULT_ROLES: AdminRole[] = [
  {
    id: 'role-superadmin',
    name: 'Super Admin',
    roleKey: 'super_admin',
    description: 'Complete unrestricted access across all hospital clinical, financial, and administrative systems',
    isSystem: true,
    color: '#8b5cf6',
    permissions: ['*'],
  },
  {
    id: 'role-hospadmin',
    name: 'Hospital Admin',
    roleKey: 'hospital_admin',
    description: 'Operational administration of patients, doctors, beds, departments, billing, and reports',
    isSystem: true,
    color: '#0284c7',
    permissions: [
      'patients.*', 'appointments.*', 'opd.*', 'ipd.*', 'beds.*',
      'nursing.view', 'laboratory.view', 'radiology.view', 'pharmacy.view',
      'blood_bank.view', 'billing.*', 'reports.*', 'admin.users.*', 'admin.departments.*'
    ],
  },
  {
    id: 'role-doctor',
    name: 'Doctor / Consultant',
    roleKey: 'doctor',
    description: 'Clinical consultations, electronic prescriptions, diagnostics ordering, and inpatient bedside rounds',
    isSystem: true,
    color: '#10b981',
    permissions: [
      'patients.view', 'opd.consultation', 'opd.prescription', 'ipd.rounds',
      'laboratory.order', 'radiology.order', 'pharmacy.prescribe', 'blood_bank.request'
    ],
  },
  {
    id: 'role-nurse',
    name: 'Staff Nurse',
    roleKey: 'nurse',
    description: 'Bedside patient vitals, medication administration records (MAR), and nursing handover tasks',
    isSystem: true,
    color: '#06b6d4',
    permissions: [
      'patients.view', 'ipd.view', 'nursing.*', 'blood_bank.transfuse'
    ],
  },
  {
    id: 'role-receptionist',
    name: 'Front Desk / Receptionist',
    roleKey: 'receptionist',
    description: 'Patient registration, appointment booking, OPD token issuance, and counter queue management',
    isSystem: true,
    color: '#f97316',
    permissions: [
      'patients.create', 'patients.edit', 'patients.view', 'appointments.*', 'opd.registration', 'opd.queue'
    ],
  },
  {
    id: 'role-billing',
    name: 'Billing & Cashier Executive',
    roleKey: 'billing_staff',
    description: 'Invoice generation, POS receipt collection, refunds, discounts, and payment reconciliations',
    isSystem: true,
    color: '#ec4899',
    permissions: [
      'patients.view', 'billing.*', 'reports.billing'
    ],
  },
  {
    id: 'role-pharmacist',
    name: 'Chief Pharmacist',
    roleKey: 'pharmacist',
    description: 'Prescription dispensing, batch stock replenishment, inventory FEFO audits, and returns',
    isSystem: true,
    color: '#eab308',
    permissions: [
      'patients.view', 'pharmacy.*'
    ],
  },
  {
    id: 'role-labtech',
    name: 'Laboratory Technologist',
    roleKey: 'lab_technician',
    description: 'Sample collection, specimen accessioning, diagnostic result entry, and critical value alerts',
    isSystem: true,
    color: '#f59e0b',
    permissions: [
      'patients.view', 'laboratory.*'
    ],
  },
  {
    id: 'role-radtech',
    name: 'Radiology Technologist',
    roleKey: 'radiology_technician',
    description: 'Exam scheduling, modality image capture, radiologist reporting, and PACs verification',
    isSystem: true,
    color: '#3b82f6',
    permissions: [
      'patients.view', 'radiology.*'
    ],
  },
  {
    id: 'role-bloodbank',
    name: 'Blood Bank Officer',
    roleKey: 'blood_bank_staff',
    description: 'Donor registry, phlebotomy, serology testing, cross-matching, component fractionation, and unit issue',
    isSystem: true,
    color: '#ef4444',
    permissions: [
      'patients.view', 'blood_bank.*'
    ],
  },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Administration', code: 'ADM', headName: 'Col. Sanjeev Rawat', phone: '+91-120-4000-101', email: 'admin@alnhms.com', location: 'Block A, 4th Floor', isActive: true },
  { id: 'dept-2', name: 'General Medicine', code: 'MED', headName: 'Dr. Sarah Jenkins', phone: '+91-120-4000-102', email: 'medicine@alnhms.com', location: 'Block B, 1st Floor', isActive: true },
  { id: 'dept-3', name: 'Cardiology', code: 'CARD', headName: 'Dr. Michael Chang', phone: '+91-120-4000-103', email: 'cardio@alnhms.com', location: 'Block B, 2nd Floor', isActive: true },
  { id: 'dept-4', name: 'Orthopedics', code: 'ORTH', headName: 'Dr. Emily Rodriguez', phone: '+91-120-4000-104', email: 'ortho@alnhms.com', location: 'Block B, 3rd Floor', isActive: true },
  { id: 'dept-5', name: 'Pediatrics', code: 'PED', headName: 'Dr. Anita Sharma', phone: '+91-120-4000-105', email: 'peds@alnhms.com', location: 'Block C, 1st Floor', isActive: true },
  { id: 'dept-6', name: 'Gynecology & Obstetrics', code: 'GYN', headName: 'Dr. Priya Nair', phone: '+91-120-4000-106', email: 'gynae@alnhms.com', location: 'Block C, 2nd Floor', isActive: true },
  { id: 'dept-7', name: 'General Surgery & OT', code: 'SURG', headName: 'Dr. David Kim', phone: '+91-120-4000-107', email: 'surgery@alnhms.com', location: 'Block A, 3rd Floor', isActive: true },
  { id: 'dept-8', name: 'Emergency & Trauma Care', code: 'ER', headName: 'Dr. Marcus Vance', phone: '+91-120-4000-108', email: 'emergency@alnhms.com', location: 'Ground Floor, Red Bay', isActive: true },
  { id: 'dept-9', name: 'Diagnostic Laboratory (LIS)', code: 'LAB', headName: 'Dr. Rajesh Khanna', phone: '+91-120-4000-109', email: 'lab@alnhms.com', location: 'Basement 1', isActive: true },
  { id: 'dept-10', name: 'Radiology & Imaging (RIS)', code: 'RAD', headName: 'Dr. Sanjay Deshmukh', phone: '+91-120-4000-110', email: 'radiology@alnhms.com', location: 'Ground Floor, Wing D', isActive: true },
  { id: 'dept-11', name: 'Pharmacy Retail & Stores', code: 'PHAR', headName: 'Mr. Ankit Verma', phone: '+91-120-4000-111', email: 'pharmacy@alnhms.com', location: 'Ground Floor, Main Foyer', isActive: true },
  { id: 'dept-12', name: 'Blood Bank & Transfusion', code: 'BB', headName: 'Dr. Sunita Rao', phone: '+91-120-4000-112', email: 'bloodbank@alnhms.com', location: 'Block A, 2nd Floor', isActive: true },
  { id: 'dept-13', name: 'Central Billing & Accounts', code: 'BIL', headName: 'Mrs. Sneha Gupta', phone: '+91-120-4000-113', email: 'billing@alnhms.com', location: 'Ground Floor, Counter 1-4', isActive: true },
];

const DEFAULT_STAFF: AdminStaff[] = [
  { id: 'st-1', employeeId: 'EMP-2024-001', name: 'Sneha Gupta', department: 'Central Billing', designation: 'Chief Billing Officer', role: 'billing_staff', phone: '+91-9876543210', email: 'sneha@alnhms.com', joiningDate: '2024-01-15', shift: 'General (09:00 - 17:00)', reportingManager: 'Col. Sanjeev Rawat', status: 'active' },
  { id: 'st-2', employeeId: 'EMP-2024-002', name: 'Sister Mary Joseph', department: 'Nursing', designation: 'Nursing Superintendent', role: 'nurse', phone: '+91-9876543211', email: 'mary@alnhms.com', joiningDate: '2023-11-01', shift: 'Morning (08:00 - 16:00)', reportingManager: 'Dr. Sarah Jenkins', status: 'active' },
  { id: 'st-3', employeeId: 'EMP-2024-003', name: 'Ankit Verma', department: 'Pharmacy', designation: 'Chief Pharmacist', role: 'pharmacist', phone: '+91-9876543212', email: 'ankit@alnhms.com', joiningDate: '2024-02-20', shift: 'Morning (08:00 - 16:00)', reportingManager: 'Col. Sanjeev Rawat', status: 'active' },
  { id: 'st-4', employeeId: 'EMP-2024-004', name: 'Kavita Roy', department: 'Diagnostic Laboratory', designation: 'Senior Biochemist', role: 'lab_technician', phone: '+91-9876543213', email: 'kavita@alnhms.com', joiningDate: '2024-03-10', shift: 'General (09:00 - 17:00)', reportingManager: 'Dr. Rajesh Khanna', status: 'active' },
  { id: 'st-5', employeeId: 'EMP-2024-005', name: 'Rohan Deshmukh', department: 'Blood Bank', designation: 'Blood Bank Officer', role: 'blood_bank_staff', phone: '+91-9876543214', email: 'rohan@alnhms.com', joiningDate: '2024-04-05', shift: 'Morning (08:00 - 16:00)', reportingManager: 'Dr. Sunita Rao', status: 'active' },
  { id: 'st-6', employeeId: 'EMP-2024-006', name: 'Pooja Verma', department: 'Administration', designation: 'Lead Receptionist', role: 'receptionist', phone: '+91-9876543215', email: 'pooja@alnhms.com', joiningDate: '2024-05-12', shift: 'General (09:00 - 17:00)', reportingManager: 'Col. Sanjeev Rawat', status: 'active' },
];

const DEFAULT_MASTER_DATA: MasterDataItem[] = [
  { id: 'md-1', category: 'Specialization', code: 'SPEC-CARD', name: 'Cardiology & Interventional Care', isActive: true },
  { id: 'md-2', category: 'Specialization', code: 'SPEC-ORTH', name: 'Orthopedics & Joint Replacement', isActive: true },
  { id: 'md-3', category: 'Specialization', code: 'SPEC-MED', name: 'Internal & General Medicine', isActive: true },
  { id: 'md-4', category: 'Specialization', code: 'SPEC-SURG', name: 'Minimal Access & General Surgery', isActive: true },
  { id: 'md-5', category: 'Designation', code: 'DES-SR-CONS', name: 'Senior Consultant Physician', isActive: true },
  { id: 'md-6', category: 'Designation', code: 'DES-JR-RES', name: 'Junior Resident Medical Officer', isActive: true },
  { id: 'md-7', category: 'Sample Type', code: 'SMPL-EDTA', name: 'Whole Blood (EDTA Tube)', isActive: true },
  { id: 'md-8', category: 'Sample Type', code: 'SMPL-SERUM', name: 'Serum (SST Clot Activator)', isActive: true },
  { id: 'md-9', category: 'Blood Component', code: 'BC-PRBC', name: 'Packed Red Blood Cells (PRBC)', isActive: true },
  { id: 'md-10', category: 'Blood Component', code: 'BC-FFP', name: 'Fresh Frozen Plasma (FFP)', isActive: true },
  { id: 'md-11', category: 'Payment Method', code: 'PM-UPI', name: 'UPI / QR Instant Transfer', isActive: true },
  { id: 'md-12', category: 'Payment Method', code: 'PM-CARD', name: 'Credit / Debit Card POS', isActive: true },
  { id: 'md-13', category: 'Room Type', code: 'RT-ICU', name: 'Intensive Care Unit (ICU Isolation)', isActive: true },
  { id: 'md-14', category: 'Room Type', code: 'RT-PVT', name: 'Deluxe Private Air-Conditioned Suite', isActive: true },
];

const DEFAULT_INSURANCE: InsuranceCompany[] = [
  { id: 'ins-1', name: 'Star Health & Allied Insurance', code: 'STAR-001', type: 'Insurance', contactPerson: 'Mr. Alok Saxena', phone: '+91-9811223344', email: 'claims@starhealth.in', settlementPeriodDays: 14, discountPercentage: 5, isActive: true },
  { id: 'ins-2', name: 'Medi Assist TPA Services', code: 'MEDI-TPA-02', type: 'TPA', contactPerson: 'Ms. Reema Sen', phone: '+91-9822334455', email: 'authorizations@mediassist.com', settlementPeriodDays: 21, discountPercentage: 7, isActive: true },
  { id: 'ins-3', name: 'HDFC ERGO General Insurance', code: 'HDFC-003', type: 'Insurance', contactPerson: 'Mr. Vivek Mehra', phone: '+91-9833445566', email: 'corp.health@hdfcergo.com', settlementPeriodDays: 15, discountPercentage: 4, isActive: true },
  { id: 'ins-4', name: 'Paramount Health TPA', code: 'PARAM-04', type: 'TPA', contactPerson: 'Mr. Rajiv Nair', phone: '+91-9844556677', email: 'hospitaldesk@paramounttpa.com', settlementPeriodDays: 30, discountPercentage: 8, isActive: true },
];

const DEFAULT_SYSTEM_SETTINGS: SystemSettingsConfig = {
  theme: 'light',
  tablePageSize: 15,
  sessionTimeoutMinutes: 60,
  maxFailedLoginAttempts: 5,
  passwordExpiryDays: 90,
  requireTwoFactor: false,
  headerPrintText: 'ALN CURE SUPER SPECIALITY HOSPITAL — NABH ACCREDITED',
  footerPrintText: 'This is an electronically generated system document. Valid without physical signature.',
  enableEmailAlerts: true,
  enableSMSAlerts: true,
  enableInAppAlerts: true,
  invoicePrefix: 'INV-2026-',
  receiptPrefix: 'REC-2026-',
  appointmentTokenPrefix: 'TKN-',
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Hospital Profile
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_hospital_profile');
      return saved ? JSON.parse(saved) : DEFAULT_HOSPITAL_PROFILE;
    } catch {
      return DEFAULT_HOSPITAL_PROFILE;
    }
  });

  // Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_users');
      return saved ? JSON.parse(saved) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  // Roles
  const [roles, setRoles] = useState<AdminRole[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_roles');
      return saved ? JSON.parse(saved) : DEFAULT_ROLES;
    } catch {
      return DEFAULT_ROLES;
    }
  });

  // Departments
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_departments');
      return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  });

  // Staff
  const [staffList, setStaffList] = useState<AdminStaff[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_staff');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_doctors');
      return saved ? JSON.parse(saved) : DEMO_DOCTORS;
    } catch {
      return DEMO_DOCTORS;
    }
  });

  // Beds
  const [beds, setBeds] = useState<Bed[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_beds');
      return saved ? JSON.parse(saved) : DEMO_BEDS;
    } catch {
      return DEMO_BEDS;
    }
  });

  // Master Data
  const [masterData, setMasterData] = useState<MasterDataItem[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_master_data');
      return saved ? JSON.parse(saved) : DEFAULT_MASTER_DATA;
    } catch {
      return DEFAULT_MASTER_DATA;
    }
  });

  // Insurance
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_insurance');
      return saved ? JSON.parse(saved) : DEFAULT_INSURANCE;
    } catch {
      return DEFAULT_INSURANCE;
    }
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_system_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('hms_admin_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'AUD-9901', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString().replace('T', ' ').slice(0, 19), user: 'Dr. Sarah Jenkins', role: 'doctor', module: 'Clinical OPD', action: 'Approved E-Prescription for Patient P-001', recordId: 'RX-901', ipAddress: '192.168.1.104', severity: 'info' },
      { id: 'AUD-9902', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString().replace('T', ' ').slice(0, 19), user: 'Sneha Gupta', role: 'billing_staff', module: 'Central Billing', action: 'Recorded Payment of ₹12,600 via UPI', recordId: 'INV-2026-001', ipAddress: '192.168.1.120', severity: 'info' },
      { id: 'AUD-9903', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString().replace('T', ' ').slice(0, 19), user: 'Admin User', role: 'super_admin', module: 'Administration', action: 'Authorized Discount of ₹500 on Invoice INV-2026-001 (Senior Concession)', recordId: 'INV-2026-001', ipAddress: '192.168.1.100', severity: 'warning' },
      { id: 'AUD-9904', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString().replace('T', ' ').slice(0, 19), user: 'Rohan Deshmukh', role: 'blood_bank_staff', module: 'Blood Bank', action: 'Completed Cross-Match Safety Handover for Unit BB-PRBC-001', recordId: 'ISSUE-7701', ipAddress: '192.168.1.115', severity: 'info' },
      { id: 'AUD-9905', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString().replace('T', ' ').slice(0, 19), user: 'Security Daemon', role: 'system', module: 'Security Auth', action: 'Failed login attempt for user "dr_kunal" (Invalid Password)', ipAddress: '192.168.1.205', severity: 'danger' },
    ];
  });

  // Activity Events
  const [activityEvents] = useState<SystemActivityEvent[]>([
    { id: 'ACT-01', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString().replace('T', ' ').slice(0, 19), eventType: 'login_success', userName: 'Dr. Sarah Jenkins', ipAddress: '192.168.1.104', description: 'Successful authenticated login via Password', status: 'success' },
    { id: 'ACT-02', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString().replace('T', ' ').slice(0, 19), eventType: 'login_success', userName: 'Sneha Gupta', ipAddress: '192.168.1.120', description: 'Successful authenticated login at Cashier Desk 1', status: 'success' },
    { id: 'ACT-03', timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString().replace('T', ' ').slice(0, 19), eventType: 'financial_override', userName: 'Admin User', ipAddress: '192.168.1.100', description: 'Authorized 5% invoice discount concession for Senior Citizen', status: 'warning' },
    { id: 'ACT-04', timestamp: new Date(Date.now() - 1000 * 60 * 350).toISOString().replace('T', ' ').slice(0, 19), eventType: 'login_failed', userName: 'dr_kunal', ipAddress: '192.168.1.205', description: 'Failed password attempt (Threshold: 1/5)', status: 'danger' },
  ]);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_hospital_profile', JSON.stringify(hospitalProfile));
    } catch {}
  }, [hospitalProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_roles', JSON.stringify(roles));
    } catch {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_departments', JSON.stringify(departments));
    } catch {}
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_staff', JSON.stringify(staffList));
    } catch {}
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_doctors', JSON.stringify(doctors));
    } catch {}
  }, [doctors]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_beds', JSON.stringify(beds));
    } catch {}
  }, [beds]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_master_data', JSON.stringify(masterData));
    } catch {}
  }, [masterData]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_insurance', JSON.stringify(insuranceCompanies));
    } catch {}
  }, [insuranceCompanies]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_system_settings', JSON.stringify(systemSettings));
    } catch {}
  }, [systemSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('hms_admin_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Log audit helper
  const logAuditEvent = (action: string, module: string, details?: string, severity: 'info' | 'warning' | 'danger' = 'info') => {
    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Administrator',
      role: 'super_admin',
      module,
      action: details ? `${action} — ${details}` : action,
      ipAddress: '192.168.1.100',
      severity,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Hospital Profile update
  const updateHospitalProfile = (updates: Partial<HospitalProfile>) => {
    setHospitalProfile(prev => ({ ...prev, ...updates }));
    logAuditEvent('Updated Hospital Profile Configuration', 'Hospital Profile', undefined, 'info');
  };

  // Users CRUD
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      permissions: DEFAULT_ROLES.find(r => r.roleKey === userData.role)?.permissions || ['patients.view'],
    };
    setUsers(prev => [newUser, ...prev]);
    logAuditEvent('Created User Account', 'User Management', `${newUser.name} (${newUser.email}) - Role: ${newUser.role}`, 'info');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logAuditEvent('Modified User Details', 'User Management', `User ID: ${id}`, 'info');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextState = !u.isActive;
          logAuditEvent(
            nextState ? 'Activated User Account' : 'Deactivated User Account',
            'User Management',
            `User: ${u.name} (${u.email})`,
            nextState ? 'info' : 'warning'
          );
          return { ...u, isActive: nextState };
        }
        return u;
      })
    );
  };

  const lockUser = (id: string, locked: boolean) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          logAuditEvent(
            locked ? 'Locked User Account' : 'Unlocked User Account',
            'User Management',
            `User: ${u.name} (${u.email})`,
            locked ? 'warning' : 'info'
          );
          return { ...u, isActive: !locked };
        }
        return u;
      })
    );
  };

  const resetUserPassword = (id: string, newPassword: string) => {
    logAuditEvent('Reset User Password', 'User Management', `User ID: ${id} — Security Token Dispatched`, 'warning');
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    logAuditEvent('Deleted User Account', 'User Management', `User: ${target?.name || id}`, 'danger');
  };

  // Roles CRUD
  const addRole = (roleData: Omit<AdminRole, 'id'>) => {
    const newRole: AdminRole = {
      ...roleData,
      id: `role-${Date.now().toString().slice(-4)}`,
    };
    setRoles(prev => [...prev, newRole]);
    logAuditEvent('Created New System Role', 'Role Management', `Role: ${newRole.name}`, 'info');
  };

  const updateRolePermissions = (roleKey: string, permissions: string[]) => {
    setRoles(prev =>
      prev.map(r => (r.roleKey === roleKey ? { ...r, permissions } : r))
    );
    // Also update users with this role
    setUsers(prev =>
      prev.map(u => (u.role === roleKey ? { ...u, permissions } : u))
    );
    logAuditEvent('Updated RBAC Permission Matrix', 'Permission Management', `Role Key: ${roleKey}`, 'warning');
  };

  const deleteRole = (id: string) => {
    const target = roles.find(r => r.id === id);
    if (target?.isSystem) return;
    setRoles(prev => prev.filter(r => r.id !== id));
    logAuditEvent('Deleted Role', 'Role Management', `Role: ${target?.name || id}`, 'danger');
  };

  // Departments CRUD
  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now().toString().slice(-4)}`,
    };
    setDepartments(prev => [...prev, newDept]);
    logAuditEvent('Added New Department', 'Department Management', `${newDept.name} (${newDept.code})`, 'info');
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    logAuditEvent('Updated Department', 'Department Management', `Dept ID: ${id}`, 'info');
  };

  const toggleDepartmentStatus = (id: string) => {
    setDepartments(prev =>
      prev.map(d => {
        if (d.id === id) {
          const next = !d.isActive;
          logAuditEvent(
            next ? 'Activated Department' : 'Deactivated Department',
            'Department Management',
            `${d.name} (${d.code})`,
            next ? 'info' : 'warning'
          );
          return { ...d, isActive: next };
        }
        return d;
      })
    );
  };

  // Staff CRUD
  const addStaff = (staffData: Omit<AdminStaff, 'id'>) => {
    const newStaff: AdminStaff = {
      ...staffData,
      id: `st-${Date.now().toString().slice(-4)}`,
    };
    setStaffList(prev => [...prev, newStaff]);
    logAuditEvent('Added Staff Member', 'Staff Management', `${newStaff.name} (${newStaff.employeeId})`, 'info');
  };

  const updateStaff = (id: string, updates: Partial<AdminStaff>) => {
    setStaffList(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    logAuditEvent('Updated Staff Profile', 'Staff Management', `Staff ID: ${id}`, 'info');
  };

  const toggleStaffStatus = (id: string) => {
    setStaffList(prev =>
      prev.map(s => {
        if (s.id === id) {
          const next = s.status === 'active' ? 'inactive' : 'active';
          logAuditEvent('Changed Staff Status', 'Staff Management', `${s.name} -> ${next}`, 'info');
          return { ...s, status: next };
        }
        return s;
      })
    );
  };

  // Doctors Admin
  const updateDoctorAdmin = (id: string, updates: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    logAuditEvent('Updated Doctor Administrative Configuration', 'Doctor Admin', `Doctor ID: ${id}`, 'info');
  };

  // Beds Admin
  const addBed = (bedData: Omit<Bed, 'id'>) => {
    const newBed: Bed = {
      ...bedData,
      id: `bed-${Date.now().toString().slice(-4)}`,
    };
    setBeds(prev => [...prev, newBed]);
    logAuditEvent('Configured New Hospital Bed', 'Infrastructure & Beds', `Bed: ${newBed.bedNumber} in ${newBed.ward}`, 'info');
  };

  const updateBed = (id: string, updates: Partial<Bed>) => {
    setBeds(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    logAuditEvent('Updated Bed Configuration', 'Infrastructure & Beds', `Bed ID: ${id}`, 'info');
  };

  const toggleBedStatus = (id: string, status: any) => {
    setBeds(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    logAuditEvent('Changed Bed Maintenance Status', 'Infrastructure & Beds', `Bed ID: ${id} -> ${status}`, 'info');
  };

  // Master Data
  const addMasterItem = (itemData: Omit<MasterDataItem, 'id'>) => {
    const newItem: MasterDataItem = {
      ...itemData,
      id: `md-${Date.now().toString().slice(-4)}`,
    };
    setMasterData(prev => [...prev, newItem]);
    logAuditEvent('Created Master Lookup Item', 'Master Data', `${newItem.category}: ${newItem.name}`, 'info');
  };

  const updateMasterItem = (id: string, updates: Partial<MasterDataItem>) => {
    setMasterData(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    logAuditEvent('Updated Master Lookup Item', 'Master Data', `Item ID: ${id}`, 'info');
  };

  const toggleMasterItemStatus = (id: string) => {
    setMasterData(prev =>
      prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  // Insurance
  const addInsuranceCompany = (compData: Omit<InsuranceCompany, 'id'>) => {
    const newComp: InsuranceCompany = {
      ...compData,
      id: `ins-${Date.now().toString().slice(-4)}`,
    };
    setInsuranceCompanies(prev => [...prev, newComp]);
    logAuditEvent('Registered Insurance / TPA Partner', 'Billing & Insurance', `${newComp.name} (${newComp.code})`, 'info');
  };

  const updateInsuranceCompany = (id: string, updates: Partial<InsuranceCompany>) => {
    setInsuranceCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    logAuditEvent('Updated Insurance Partner', 'Billing & Insurance', `ID: ${id}`, 'info');
  };

  // System Settings
  const updateSystemSettings = (updates: Partial<SystemSettingsConfig>) => {
    setSystemSettings(prev => ({ ...prev, ...updates }));
    logAuditEvent('Modified Hospital System Policies & Settings', 'System Settings', undefined, 'warning');
  };

  // Dashboard Aggregates
  const dashboardStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    const totalDoctors = doctors.length;
    const totalStaff = staffList.length;
    const totalDepartments = departments.length;
    const totalPatients = DEMO_PATIENTS.length;
    const opdToday = 28;
    const ipdToday = DEMO_ADMISSIONS.filter(a => a.status === 'active').length || 6;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const availableBeds = beds.filter(b => b.status === 'available').length;
    const pendingAppointments = DEMO_APPOINTMENTS.filter(a => a.status === 'scheduled' || a.status === 'waiting').length;
    const pendingLab = DEMO_LAB_REQUESTS.filter(l => l.status === 'ordered' || l.status === 'processing').length;
    const pendingRadiology = DEMO_RADIOLOGY_STUDIES.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length;
    const lowStockMedicines = DEMO_MEDICINES.filter(m => (m.currentStock ?? 50) < 20).length || 3;
    const availableBloodUnits = 18;
    const outstandingBilling = 90700;
    const todayRevenue = 54200;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDoctors,
      totalStaff,
      totalDepartments,
      totalPatients,
      opdToday,
      ipdToday,
      totalBeds,
      occupiedBeds,
      availableBeds,
      pendingAppointments,
      pendingLab,
      pendingRadiology,
      lowStockMedicines,
      availableBloodUnits,
      outstandingBilling,
      todayRevenue,
    };
  }, [users, doctors, staffList, departments, beds]);

  // CSV Export Utility
  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        hospitalProfile,
        updateHospitalProfile,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        lockUser,
        resetUserPassword,
        deleteUser,
        roles,
        addRole,
        updateRolePermissions,
        deleteRole,
        departments,
        addDepartment,
        updateDepartment,
        toggleDepartmentStatus,
        staffList,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        doctors,
        updateDoctorAdmin,
        beds,
        addBed,
        updateBed,
        toggleBedStatus,
        masterData,
        addMasterItem,
        updateMasterItem,
        toggleMasterItemStatus,
        insuranceCompanies,
        addInsuranceCompany,
        updateInsuranceCompany,
        systemSettings,
        updateSystemSettings,
        auditLogs,
        activityEvents,
        logAuditEvent,
        dashboardStats,
        exportCSV,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
