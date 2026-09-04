import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES FOR SETTINGS MODULE
// ==========================================

export type SettingsTab =
  | 'dashboard'
  | 'hospital_profile'
  | 'general'
  | 'appearance'
  | 'localization'
  | 'numbering'
  | 'opd'
  | 'appointments'
  | 'ipd'
  | 'beds'
  | 'nursing'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'blood_bank'
  | 'billing'
  | 'payments'
  | 'insurance'
  | 'notifications'
  | 'email'
  | 'sms'
  | 'printing'
  | 'reports'
  | 'security'
  | 'users_access'
  | 'patients'
  | 'doctors'
  | 'audit'
  | 'system'
  | 'history';

export interface HospitalProfileConfig {
  name: string;
  code: string;
  registrationNumber: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  tagline: string;
  footerText: string;
}

export interface GeneralSettingsConfig {
  defaultLanguage: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: string;
  defaultPageSize: number;
  defaultDashboard: string;
  sessionTimeoutMinutes: number;
  autoLogoutOnIdle: boolean;
}

export interface AppearanceConfig {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  sidebarStyle: 'expanded' | 'collapsed' | 'compact';
  headerStyle: 'sticky' | 'fixed' | 'static';
  tableDensity: 'compact' | 'comfortable';
  loginPageBrandingText: string;
  faviconUrl: string;
}

export interface LocalizationConfig {
  language: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: 'en-IN' | 'en-US' | 'de-DE';
  decimalPlaces: number;
  timeZone: string;
  country: string;
  state: string;
}

export interface DocumentNumberFormat {
  prefix: string;
  startingNumber: number;
  digits: number;
  includeYear: boolean;
  yearFormat: 'YYYY' | 'YY';
  separator: '-' | '/' | '_';
}

export interface NumberingConfig {
  patientId: DocumentNumberFormat;
  appointmentNumber: DocumentNumberFormat;
  opdToken: DocumentNumberFormat;
  admissionNumber: DocumentNumberFormat;
  ipdNumber: DocumentNumberFormat;
  invoiceNumber: DocumentNumberFormat;
  paymentNumber: DocumentNumberFormat;
  receiptNumber: DocumentNumberFormat;
  refundNumber: DocumentNumberFormat;
  labOrderNumber: DocumentNumberFormat;
  labReportNumber: DocumentNumberFormat;
  radiologyOrderNumber: DocumentNumberFormat;
  pharmacyInvoiceNumber: DocumentNumberFormat;
  bloodRequestNumber: DocumentNumberFormat;
  bloodBagNumber: DocumentNumberFormat;
  dischargeNumber: DocumentNumberFormat;
  purchaseOrderNumber: DocumentNumberFormat;
}

export interface OPDSettingsConfig {
  workingHoursStart: string;
  workingHoursEnd: string;
  consultationDurationMin: number;
  tokenPrefix: string;
  maxPatientsPerSlot: number;
  followUpValidityDays: number;
  defaultConsultationFee: number;
  autoCallNextPatient: boolean;
  waitingTimeThresholdMin: number;
  opdRegistrationFee: number;
}

export interface AppointmentSettingsConfig {
  slotDurationMin: number;
  maxAdvanceBookingDays: number;
  cancellationCutoffHours: number;
  autoNoShowAfterMin: number;
  maxDailyAppointmentsPerDoctor: number;
  requireSmsConfirmation: boolean;
  enablePatientPortalBooking: boolean;
}

export interface IPDSettingsConfig {
  baseAdmissionCharge: number;
  nursingCareDailyRate: number;
  doctorDailyRoundFee: number;
  dischargeCutoffTime: string;
  mlcProtocolMandatory: boolean;
  emergencyAdmissionDeposit: number;
  allowBedPreBooking: boolean;
}

export interface BedSettingsConfig {
  generalWardDailyRate: number;
  semiPrivateDailyRate: number;
  privateRoomDailyRate: number;
  icuDailyRate: number;
  isolationDailyRate: number;
  emergencyBayDailyRate: number;
  autoSanitizationStatusAfterDischarge: boolean;
}

export interface NursingSettingsConfig {
  shiftTypes: string[];
  shiftDurationHours: number;
  vitalsMonitoringIntervalHours: number;
  mandatoryMedicationAlerts: boolean;
  incidentSeverityLevels: string[];
  shiftHandoverNoteRequired: boolean;
}

export interface LaboratorySettingsConfig {
  defaultLabTatHours: number;
  statPriorityMultiplier: number;
  requirePathologistSignoff: boolean;
  enableCriticalSmsAlerts: boolean;
  autoPrintBarcodeOnAccession: boolean;
  labWorkingHours: string;
}

export interface RadiologySettingsConfig {
  modalitySlotDurationMin: number;
  requireContrastConsent: boolean;
  requireRadiologistVerification: boolean;
  radiologyWorkingHours: string;
  pacsIntegrationEnabled: boolean;
}

export interface PharmacySettingsConfig {
  lowStockThreshold: number;
  nearExpiryWarningDays: number;
  pharmacyGstRate: number;
  returnWindowDays: number;
  allowDispenseWithoutPrescription: boolean;
  autoDeductStockOnDispense: boolean;
}

export interface BloodBankSettingsConfig {
  mandatoryTtiScreening: boolean;
  prbcShelfLifeDays: number;
  plateletShelfLifeDays: number;
  ffpShelfLifeDays: number;
  criticalGroupThresholdUnits: number;
  allowEmergencyOTypeReleaseWithoutCrossmatch: boolean;
}

export interface BillingSettingsConfig {
  invoicePrefix: string;
  receiptPrefix: string;
  advanceReceiptPrefix: string;
  defaultGstPercent: number;
  maxCashDiscountPercent: number;
  seniorCitizenDiscountPercent: number;
  invoiceFooterNote: string;
  displayTaxBreakup: boolean;
  displayDiscountOnReceipt: boolean;
}

export interface PaymentSettingsConfig {
  enableCashPayments: boolean;
  enableCardPayments: boolean;
  enableUpiPayments: boolean;
  enableInsuranceClaims: boolean;
  enableBankTransfer: boolean;
  enableCheque: boolean;
  refundApprovalRequiredRole: string;
  instantDigitalReceiptOnSms: boolean;
}

export interface PrintingSettingsConfig {
  hospitalHeaderLetterhead: string;
  footerDisclaimerText: string;
  defaultPaperSize: 'A4' | 'Letter' | 'Thermal_80mm';
  pageOrientation: 'portrait' | 'landscape';
  showAuthorizedSignatoryLine: boolean;
  signatoryTitle: string;
  marginTopMm: number;
  marginBottomMm: number;
  showHospitalLogo: boolean;
}

export interface NotificationSettingsConfig {
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
  enableInAppAlerts: boolean;
  notifyOnAppointmentConfirm: boolean;
  notifyOnQueueTokenTurn: boolean;
  notifyOnAdmission: boolean;
  notifyOnDischarge: boolean;
  notifyOnCriticalLabValue: boolean;
  notifyOnLowStock: boolean;
  notifyOnPaymentSuccess: boolean;
}

export interface EmailSettingsConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSenderName: string;
  smtpSenderEmail: string;
  encryptionType: 'TLS' | 'SSL' | 'NONE';
  isConfigured: boolean;
}

export interface SMSSettingsConfig {
  providerName: string;
  senderId: string;
  apiKeyMasked: string;
  isConfigured: boolean;
}

export interface SecuritySettingsConfig {
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  passwordMinLength: number;
  requirePasswordComplexity: boolean;
  passwordExpiryDays: number;
  requireTwoFactor: boolean;
  enforceIpWhitelist: boolean;
}

export interface UserAccessSettingsConfig {
  defaultRoleForNewStaff: string;
  defaultUserActiveState: boolean;
  allowConcurrentLogins: boolean;
  forcePasswordChangeOnFirstLogin: boolean;
}

export interface PatientSettingsConfig {
  patientIdPrefix: string;
  enableDuplicateDetection: boolean;
  duplicateMatchFields: ('phone' | 'email' | 'name_dob')[];
  requireGovtIdOnRegistration: boolean;
  emergencyPatientAutoMrn: boolean;
}

export interface DoctorSettingsConfig {
  doctorIdPrefix: string;
  defaultConsultationFee: number;
  defaultSlotDurationMin: number;
  allowDoctorScheduleOverride: boolean;
}

export interface InsuranceSettingsConfig {
  defaultSettlementPeriodDays: number;
  allowCashlessAdmissionWithoutPreAuth: boolean;
  tpaCoordinatorPhone: string;
}

export interface ReportSettingsConfig {
  defaultDateRange: 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year';
  defaultPageSize: number;
  includeAuditSummaryInReports: boolean;
  allowCsvExportForNonAdmins: boolean;
}

export interface AuditSettingsConfig {
  enableAuditLogging: boolean;
  logUserSignIns: boolean;
  logFinancialTransactions: boolean;
  logClinicalPrescriptions: boolean;
  logSettingsChanges: boolean;
  logPatientChartViews: boolean;
  auditRetentionDays: number;
}

export interface SystemInfoConfig {
  appName: string;
  version: string;
  environment: string;
  databaseEngine: string;
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastBackupDate: string;
  uptime: string;
}

export interface SettingsChangeRecord {
  id: string;
  settingName: string;
  category: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

// ==========================================
// INITIAL DEFAULT SETTINGS STATE
// ==========================================

const DEFAULT_HOSPITAL_PROFILE: HospitalProfileConfig = {
  name: 'ALN Cure Hospital & Research Center',
  code: 'ALN-DEL-01',
  registrationNumber: 'HOSP-DEL-2024-8849',
  logo: '',
  address: 'Plot 14, Institutional Area, Sector 62',
  city: 'Noida',
  state: 'Uttar Pradesh',
  country: 'India',
  pincode: '201309',
  phone: '+91-120-4567890',
  emergencyPhone: '+91-120-4567999',
  email: 'info@alnhms.com',
  website: 'https://alncurehms.com',
  gstNumber: '07AAAAA0000A1Z5',
  panNumber: 'AAACA0000A',
  tagline: 'Excellence in Healthcare, Compassion in Healing',
  footerText: 'This is an official system generated document by ALN Cure Hospital Management System.',
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettingsConfig = {
  defaultLanguage: 'English (India)',
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata (IST +5:30)',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour (AM/PM)',
  firstDayOfWeek: 'Monday',
  defaultPageSize: 15,
  defaultDashboard: 'Executive Overview',
  sessionTimeoutMinutes: 60,
  autoLogoutOnIdle: true,
};

const DEFAULT_APPEARANCE: AppearanceConfig = {
  theme: 'light',
  primaryColor: '#059669',
  secondaryColor: '#0284c7',
  sidebarStyle: 'expanded',
  headerStyle: 'sticky',
  tableDensity: 'comfortable',
  loginPageBrandingText: 'Secure Enterprise Hospital Management Suite',
  faviconUrl: '',
};

const DEFAULT_LOCALIZATION: LocalizationConfig = {
  language: 'English (India)',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour (AM/PM)',
  numberFormat: 'en-IN',
  decimalPlaces: 2,
  timeZone: 'Asia/Kolkata (IST +5:30)',
  country: 'India',
  state: 'Uttar Pradesh',
};

const DEFAULT_NUMBERING: NumberingConfig = {
  patientId: { prefix: 'PAT', startingNumber: 10001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  appointmentNumber: { prefix: 'APT', startingNumber: 20001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  opdToken: { prefix: 'TKN', startingNumber: 1, digits: 3, includeYear: false, yearFormat: 'YYYY', separator: '-' },
  admissionNumber: { prefix: 'ADM', startingNumber: 30001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  ipdNumber: { prefix: 'IPD', startingNumber: 40001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  invoiceNumber: { prefix: 'INV', startingNumber: 50001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  paymentNumber: { prefix: 'PAY', startingNumber: 60001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  receiptNumber: { prefix: 'REC', startingNumber: 70001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  refundNumber: { prefix: 'REF', startingNumber: 80001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  labOrderNumber: { prefix: 'LAB', startingNumber: 10001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  labReportNumber: { prefix: 'LRP', startingNumber: 10001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  radiologyOrderNumber: { prefix: 'RAD', startingNumber: 10001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  pharmacyInvoiceNumber: { prefix: 'PHR', startingNumber: 90001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  bloodRequestNumber: { prefix: 'BRQ', startingNumber: 1001, digits: 5, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  bloodBagNumber: { prefix: 'BAG', startingNumber: 5001, digits: 5, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  dischargeNumber: { prefix: 'DSC', startingNumber: 30001, digits: 6, includeYear: true, yearFormat: 'YYYY', separator: '-' },
  purchaseOrderNumber: { prefix: 'PO', startingNumber: 1001, digits: 5, includeYear: true, yearFormat: 'YYYY', separator: '-' },
};

const DEFAULT_OPD: OPDSettingsConfig = {
  workingHoursStart: '08:00 AM',
  workingHoursEnd: '08:00 PM',
  consultationDurationMin: 15,
  tokenPrefix: 'TKN-',
  maxPatientsPerSlot: 4,
  followUpValidityDays: 7,
  defaultConsultationFee: 600,
  autoCallNextPatient: false,
  waitingTimeThresholdMin: 30,
  opdRegistrationFee: 100,
};

const DEFAULT_APPOINTMENTS: AppointmentSettingsConfig = {
  slotDurationMin: 15,
  maxAdvanceBookingDays: 30,
  cancellationCutoffHours: 4,
  autoNoShowAfterMin: 30,
  maxDailyAppointmentsPerDoctor: 40,
  requireSmsConfirmation: true,
  enablePatientPortalBooking: true,
};

const DEFAULT_IPD: IPDSettingsConfig = {
  baseAdmissionCharge: 1000,
  nursingCareDailyRate: 500,
  doctorDailyRoundFee: 800,
  dischargeCutoffTime: '12:00 PM',
  mlcProtocolMandatory: true,
  emergencyAdmissionDeposit: 5000,
  allowBedPreBooking: true,
};

const DEFAULT_BEDS: BedSettingsConfig = {
  generalWardDailyRate: 1500,
  semiPrivateDailyRate: 2200,
  privateRoomDailyRate: 3500,
  icuDailyRate: 4500,
  isolationDailyRate: 4000,
  emergencyBayDailyRate: 2000,
  autoSanitizationStatusAfterDischarge: true,
};

const DEFAULT_NURSING: NursingSettingsConfig = {
  shiftTypes: ['Morning (08:00 - 16:00)', 'Evening (16:00 - 00:00)', 'Night (00:00 - 08:00)', 'General (09:00 - 17:00)'],
  shiftDurationHours: 8,
  vitalsMonitoringIntervalHours: 4,
  mandatoryMedicationAlerts: true,
  incidentSeverityLevels: ['Low', 'Moderate', 'Severe', 'Sentinel Event'],
  shiftHandoverNoteRequired: true,
};

const DEFAULT_LAB: LaboratorySettingsConfig = {
  defaultLabTatHours: 2,
  statPriorityMultiplier: 1.5,
  requirePathologistSignoff: true,
  enableCriticalSmsAlerts: true,
  autoPrintBarcodeOnAccession: true,
  labWorkingHours: '24 Hours (Round the Clock)',
};

const DEFAULT_RADIOLOGY: RadiologySettingsConfig = {
  modalitySlotDurationMin: 20,
  requireContrastConsent: true,
  requireRadiologistVerification: true,
  radiologyWorkingHours: '24 Hours Emergency / 08:00 - 20:00 Routine',
  pacsIntegrationEnabled: true,
};

const DEFAULT_PHARMACY: PharmacySettingsConfig = {
  lowStockThreshold: 20,
  nearExpiryWarningDays: 30,
  pharmacyGstRate: 12,
  returnWindowDays: 7,
  allowDispenseWithoutPrescription: false,
  autoDeductStockOnDispense: true,
};

const DEFAULT_BLOOD_BANK: BloodBankSettingsConfig = {
  mandatoryTtiScreening: true,
  prbcShelfLifeDays: 42,
  plateletShelfLifeDays: 5,
  ffpShelfLifeDays: 365,
  criticalGroupThresholdUnits: 2,
  allowEmergencyOTypeReleaseWithoutCrossmatch: false,
};

const DEFAULT_BILLING: BillingSettingsConfig = {
  invoicePrefix: 'INV-2026-',
  receiptPrefix: 'REC-2026-',
  advanceReceiptPrefix: 'ADV-2026-',
  defaultGstPercent: 18,
  maxCashDiscountPercent: 10,
  seniorCitizenDiscountPercent: 5,
  invoiceFooterNote: 'Thank you for choosing ALN Cure Hospital. Get well soon!',
  displayTaxBreakup: true,
  displayDiscountOnReceipt: true,
};

const DEFAULT_PAYMENT: PaymentSettingsConfig = {
  enableCashPayments: true,
  enableCardPayments: true,
  enableUpiPayments: true,
  enableInsuranceClaims: true,
  enableBankTransfer: true,
  enableCheque: true,
  refundApprovalRequiredRole: 'hospital_admin',
  instantDigitalReceiptOnSms: true,
};

const DEFAULT_PRINTING: PrintingSettingsConfig = {
  hospitalHeaderLetterhead: 'ALN CURE HOSPITAL & RESEARCH CENTER • ACCREDITED BY NABH & NABL',
  footerDisclaimerText: 'Computer generated document. Valid without physical signature when authorized electronically.',
  defaultPaperSize: 'A4',
  pageOrientation: 'portrait',
  showAuthorizedSignatoryLine: true,
  signatoryTitle: 'Authorized Medical Superintendent / Billing Officer',
  marginTopMm: 15,
  marginBottomMm: 15,
  showHospitalLogo: true,
};

const DEFAULT_NOTIFICATIONS: NotificationSettingsConfig = {
  enableEmailAlerts: true,
  enableSMSAlerts: true,
  enableInAppAlerts: true,
  notifyOnAppointmentConfirm: true,
  notifyOnQueueTokenTurn: true,
  notifyOnAdmission: true,
  notifyOnDischarge: true,
  notifyOnCriticalLabValue: true,
  notifyOnLowStock: true,
  notifyOnPaymentSuccess: true,
};

const DEFAULT_EMAIL: EmailSettingsConfig = {
  smtpHost: 'smtp.alnhms.com',
  smtpPort: 587,
  smtpSenderName: 'ALN Cure Hospital System',
  smtpSenderEmail: 'notifications@alnhms.com',
  encryptionType: 'TLS',
  isConfigured: true,
};

const DEFAULT_SMS: SMSSettingsConfig = {
  providerName: 'Twilio / BharatSMS Gateway',
  senderId: 'ALNHMS',
  apiKeyMasked: '••••••••••••••••••••••••3821',
  isConfigured: true,
};

const DEFAULT_SECURITY: SecuritySettingsConfig = {
  sessionTimeoutMinutes: 60,
  maxFailedLoginAttempts: 5,
  passwordMinLength: 8,
  requirePasswordComplexity: true,
  passwordExpiryDays: 90,
  requireTwoFactor: true,
  enforceIpWhitelist: false,
};

const DEFAULT_USER_ACCESS: UserAccessSettingsConfig = {
  defaultRoleForNewStaff: 'doctor',
  defaultUserActiveState: true,
  allowConcurrentLogins: false,
  forcePasswordChangeOnFirstLogin: true,
};

const DEFAULT_PATIENT: PatientSettingsConfig = {
  patientIdPrefix: 'PAT-2026-',
  enableDuplicateDetection: true,
  duplicateMatchFields: ['phone', 'name_dob'],
  requireGovtIdOnRegistration: true,
  emergencyPatientAutoMrn: true,
};

const DEFAULT_DOCTOR: DoctorSettingsConfig = {
  doctorIdPrefix: 'DOC-2026-',
  defaultConsultationFee: 600,
  defaultSlotDurationMin: 15,
  allowDoctorScheduleOverride: true,
};

const DEFAULT_INSURANCE: InsuranceSettingsConfig = {
  defaultSettlementPeriodDays: 15,
  allowCashlessAdmissionWithoutPreAuth: false,
  tpaCoordinatorPhone: '+91-120-4567888',
};

const DEFAULT_REPORT: ReportSettingsConfig = {
  defaultDateRange: 'this_month',
  defaultPageSize: 20,
  includeAuditSummaryInReports: true,
  allowCsvExportForNonAdmins: false,
};

const DEFAULT_AUDIT: AuditSettingsConfig = {
  enableAuditLogging: true,
  logUserSignIns: true,
  logFinancialTransactions: true,
  logClinicalPrescriptions: true,
  logSettingsChanges: true,
  logPatientChartViews: true,
  auditRetentionDays: 365,
};

const DEFAULT_SYSTEM_INFO: SystemInfoConfig = {
  appName: 'ALN Cure Hospital Management System',
  version: '2.5.0-PROD',
  environment: 'Production (Enterprise Cluster)',
  databaseEngine: 'PostgreSQL 16 with Supabase Engine',
  apiStatus: 'ONLINE',
  lastBackupDate: new Date().toISOString(),
  uptime: '99.98% (34 days, 14 hours)',
};

const INITIAL_HISTORY: SettingsChangeRecord[] = [
  { id: 'SET-991', settingName: 'Hospital Registration Number', category: 'Hospital Profile', oldValue: 'HOSP-2023-01', newValue: 'HOSP-DEL-2024-8849', changedBy: 'Super Admin', timestamp: '02/09/2026, 09:30 AM', reason: 'Annual NABH renewal certification update' },
  { id: 'SET-992', settingName: 'Session Inactivity Timeout', category: 'Security Settings', oldValue: '120 Minutes', newValue: '60 Minutes', changedBy: 'Super Admin', timestamp: '02/09/2026, 11:15 AM', reason: 'Enforced HIPAA compliance security policy' },
  { id: 'SET-993', settingName: 'Standard Medical GST Rate', category: 'Billing Settings', oldValue: '12%', newValue: '18%', changedBy: 'Hospital Admin', timestamp: '02/09/2026, 01:45 PM', reason: 'GST council revised tax slab' },
  { id: 'SET-994', settingName: 'STAT Priority Multiplier', category: 'Laboratory Settings', oldValue: '1.2x', newValue: '1.5x', changedBy: 'Hospital Admin', timestamp: '02/09/2026, 03:20 PM', reason: 'Emergency night shift tariff alignment' },
];

// ==========================================
// CONTEXT INTERFACE
// ==========================================

interface SettingsContextType {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Settings State
  hospitalProfile: HospitalProfileConfig;
  updateHospitalProfile: (data: Partial<HospitalProfileConfig>) => void;

  generalSettings: GeneralSettingsConfig;
  updateGeneralSettings: (data: Partial<GeneralSettingsConfig>) => void;

  appearance: AppearanceConfig;
  updateAppearance: (data: Partial<AppearanceConfig>) => void;

  localization: LocalizationConfig;
  updateLocalization: (data: Partial<LocalizationConfig>) => void;

  numbering: NumberingConfig;
  updateNumbering: (key: keyof NumberingConfig, format: DocumentNumberFormat) => void;

  opdSettings: OPDSettingsConfig;
  updateOPDSettings: (data: Partial<OPDSettingsConfig>) => void;

  appointmentSettings: AppointmentSettingsConfig;
  updateAppointmentSettings: (data: Partial<AppointmentSettingsConfig>) => void;

  ipdSettings: IPDSettingsConfig;
  updateIPDSettings: (data: Partial<IPDSettingsConfig>) => void;

  bedSettings: BedSettingsConfig;
  updateBedSettings: (data: Partial<BedSettingsConfig>) => void;

  nursingSettings: NursingSettingsConfig;
  updateNursingSettings: (data: Partial<NursingSettingsConfig>) => void;

  labSettings: LaboratorySettingsConfig;
  updateLabSettings: (data: Partial<LaboratorySettingsConfig>) => void;

  radiologySettings: RadiologySettingsConfig;
  updateRadiologySettings: (data: Partial<RadiologySettingsConfig>) => void;

  pharmacySettings: PharmacySettingsConfig;
  updatePharmacySettings: (data: Partial<PharmacySettingsConfig>) => void;

  bloodBankSettings: BloodBankSettingsConfig;
  updateBloodBankSettings: (data: Partial<BloodBankSettingsConfig>) => void;

  billingSettings: BillingSettingsConfig;
  updateBillingSettings: (data: Partial<BillingSettingsConfig>) => void;

  paymentSettings: PaymentSettingsConfig;
  updatePaymentSettings: (data: Partial<PaymentSettingsConfig>) => void;

  printingSettings: PrintingSettingsConfig;
  updatePrintingSettings: (data: Partial<PrintingSettingsConfig>) => void;

  notificationSettings: NotificationSettingsConfig;
  updateNotificationSettings: (data: Partial<NotificationSettingsConfig>) => void;

  emailSettings: EmailSettingsConfig;
  updateEmailSettings: (data: Partial<EmailSettingsConfig>) => void;

  smsSettings: SMSSettingsConfig;
  updateSMSSettings: (data: Partial<SMSSettingsConfig>) => void;

  securitySettings: SecuritySettingsConfig;
  updateSecuritySettings: (data: Partial<SecuritySettingsConfig>) => void;

  userAccessSettings: UserAccessSettingsConfig;
  updateUserAccessSettings: (data: Partial<UserAccessSettingsConfig>) => void;

  patientSettings: PatientSettingsConfig;
  updatePatientSettings: (data: Partial<PatientSettingsConfig>) => void;

  doctorSettings: DoctorSettingsConfig;
  updateDoctorSettings: (data: Partial<DoctorSettingsConfig>) => void;

  insuranceSettings: InsuranceSettingsConfig;
  updateInsuranceSettings: (data: Partial<InsuranceSettingsConfig>) => void;

  reportSettings: ReportSettingsConfig;
  updateReportSettings: (data: Partial<ReportSettingsConfig>) => void;

  auditSettings: AuditSettingsConfig;
  updateAuditSettings: (data: Partial<AuditSettingsConfig>) => void;

  systemInfo: SystemInfoConfig;
  history: SettingsChangeRecord[];
  addHistoryRecord: (record: Omit<SettingsChangeRecord, 'id' | 'timestamp'>) => void;

  resetToDefaults: (category: SettingsTab) => void;
  exportSettingsBackup: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ==========================================
// PROVIDER IMPLEMENTATION
// ==========================================

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Load from localStorage or defaults
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfileConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_hospital');
    return saved ? JSON.parse(saved) : DEFAULT_HOSPITAL_PROFILE;
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_general');
    return saved ? JSON.parse(saved) : DEFAULT_GENERAL_SETTINGS;
  });

  const [appearance, setAppearance] = useState<AppearanceConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_appearance');
    return saved ? JSON.parse(saved) : DEFAULT_APPEARANCE;
  });

  const [localization, setLocalization] = useState<LocalizationConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_localization');
    return saved ? JSON.parse(saved) : DEFAULT_LOCALIZATION;
  });

  const [numbering, setNumbering] = useState<NumberingConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_numbering');
    return saved ? JSON.parse(saved) : DEFAULT_NUMBERING;
  });

  const [opdSettings, setOpdSettings] = useState<OPDSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_opd');
    return saved ? JSON.parse(saved) : DEFAULT_OPD;
  });

  const [appointmentSettings, setAppointmentSettings] = useState<AppointmentSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_appointments');
    return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
  });

  const [ipdSettings, setIpdSettings] = useState<IPDSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_ipd');
    return saved ? JSON.parse(saved) : DEFAULT_IPD;
  });

  const [bedSettings, setBedSettings] = useState<BedSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_beds');
    return saved ? JSON.parse(saved) : DEFAULT_BEDS;
  });

  const [nursingSettings, setNursingSettings] = useState<NursingSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_nursing');
    return saved ? JSON.parse(saved) : DEFAULT_NURSING;
  });

  const [labSettings, setLabSettings] = useState<LaboratorySettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_lab');
    return saved ? JSON.parse(saved) : DEFAULT_LAB;
  });

  const [radiologySettings, setRadiologySettings] = useState<RadiologySettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_radiology');
    return saved ? JSON.parse(saved) : DEFAULT_RADIOLOGY;
  });

  const [pharmacySettings, setPharmacySettings] = useState<PharmacySettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_pharmacy');
    return saved ? JSON.parse(saved) : DEFAULT_PHARMACY;
  });

  const [bloodBankSettings, setBloodBankSettings] = useState<BloodBankSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_blood_bank');
    return saved ? JSON.parse(saved) : DEFAULT_BLOOD_BANK;
  });

  const [billingSettings, setBillingSettings] = useState<BillingSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_billing');
    return saved ? JSON.parse(saved) : DEFAULT_BILLING;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_payment');
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENT;
  });

  const [printingSettings, setPrintingSettings] = useState<PrintingSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_printing');
    return saved ? JSON.parse(saved) : DEFAULT_PRINTING;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_email');
    return saved ? JSON.parse(saved) : DEFAULT_EMAIL;
  });

  const [smsSettings, setSmsSettings] = useState<SMSSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_sms');
    return saved ? JSON.parse(saved) : DEFAULT_SMS;
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_security');
    return saved ? JSON.parse(saved) : DEFAULT_SECURITY;
  });

  const [userAccessSettings, setUserAccessSettings] = useState<UserAccessSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_user_access');
    return saved ? JSON.parse(saved) : DEFAULT_USER_ACCESS;
  });

  const [patientSettings, setPatientSettings] = useState<PatientSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_patients');
    return saved ? JSON.parse(saved) : DEFAULT_PATIENT;
  });

  const [doctorSettings, setDoctorSettings] = useState<DoctorSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_doctors');
    return saved ? JSON.parse(saved) : DEFAULT_DOCTOR;
  });

  const [insuranceSettings, setInsuranceSettings] = useState<InsuranceSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_insurance');
    return saved ? JSON.parse(saved) : DEFAULT_INSURANCE;
  });

  const [reportSettings, setReportSettings] = useState<ReportSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_reports');
    return saved ? JSON.parse(saved) : DEFAULT_REPORT;
  });

  const [auditSettings, setAuditSettings] = useState<AuditSettingsConfig>(() => {
    const saved = localStorage.getItem('aln_hms_settings_audit');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT;
  });

  const [systemInfo] = useState<SystemInfoConfig>(DEFAULT_SYSTEM_INFO);

  const [history, setHistory] = useState<SettingsChangeRecord[]>(() => {
    const saved = localStorage.getItem('aln_hms_settings_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  // History Helper
  const addHistoryRecord = (record: Omit<SettingsChangeRecord, 'id' | 'timestamp'>) => {
    const newRec: SettingsChangeRecord = {
      id: `SET-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-IN'),
      ...record,
    };
    setHistory(prev => {
      const updated = [newRec, ...prev];
      localStorage.setItem('aln_hms_settings_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Updaters
  const updateHospitalProfile = (data: Partial<HospitalProfileConfig>) => {
    setHospitalProfile(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_hospital', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Hospital Profile Updated', category: 'Hospital Profile', oldValue: 'Previous config', newValue: 'Updated details', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateGeneralSettings = (data: Partial<GeneralSettingsConfig>) => {
    setGeneralSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_general', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'General Settings Updated', category: 'General', oldValue: 'Previous config', newValue: JSON.stringify(data), changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateAppearance = (data: Partial<AppearanceConfig>) => {
    setAppearance(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_appearance', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Appearance Styling Updated', category: 'Appearance', oldValue: 'Previous Theme', newValue: data.theme || 'Modified', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateLocalization = (data: Partial<LocalizationConfig>) => {
    setLocalization(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_localization', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Localization Formats Updated', category: 'Localization', oldValue: 'Previous Formats', newValue: `${data.currency || ''} ${data.dateFormat || ''}`, changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateNumbering = (key: keyof NumberingConfig, format: DocumentNumberFormat) => {
    setNumbering(prev => {
      const updated = { ...prev, [key]: format };
      localStorage.setItem('aln_hms_settings_numbering', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: `Document Numbering (${key})`, category: 'Numbering', oldValue: `${numbering[key]?.prefix}`, newValue: `${format.prefix}`, changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateOPDSettings = (data: Partial<OPDSettingsConfig>) => {
    setOpdSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_opd', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'OPD Queue Rules Updated', category: 'OPD Settings', oldValue: 'Previous Rules', newValue: 'Updated Parameters', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateAppointmentSettings = (data: Partial<AppointmentSettingsConfig>) => {
    setAppointmentSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_appointments', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Appointment Booking Rules', category: 'Appointments', oldValue: 'Previous Rules', newValue: 'Updated Windows', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateIPDSettings = (data: Partial<IPDSettingsConfig>) => {
    setIpdSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_ipd', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'IPD Tariffs & Admission Rules', category: 'IPD Settings', oldValue: 'Previous Tariffs', newValue: 'Updated Tariffs', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateBedSettings = (data: Partial<BedSettingsConfig>) => {
    setBedSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_beds', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Bed Tariffs & Categories', category: 'Bed Settings', oldValue: 'Previous Rates', newValue: 'Updated Rates', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateNursingSettings = (data: Partial<NursingSettingsConfig>) => {
    setNursingSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_nursing', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Nursing Shifts & Vitals Rules', category: 'Nursing', oldValue: 'Previous Policy', newValue: 'Updated Policy', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateLabSettings = (data: Partial<LaboratorySettingsConfig>) => {
    setLabSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_lab', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Laboratory TAT & Signoff Rules', category: 'Laboratory', oldValue: 'Previous TAT', newValue: 'Updated Benchmarks', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateRadiologySettings = (data: Partial<RadiologySettingsConfig>) => {
    setRadiologySettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_radiology', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Radiology Modalities & Protocols', category: 'Radiology', oldValue: 'Previous Config', newValue: 'Updated Protocols', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updatePharmacySettings = (data: Partial<PharmacySettingsConfig>) => {
    setPharmacySettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_pharmacy', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Pharmacy Inventory & Reorder Rules', category: 'Pharmacy', oldValue: 'Previous Thresholds', newValue: 'Updated Thresholds', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateBloodBankSettings = (data: Partial<BloodBankSettingsConfig>) => {
    setBloodBankSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_blood_bank', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Blood Bank Component Shelf Lives', category: 'Blood Bank', oldValue: 'Previous Shelf Lives', newValue: 'Updated Parameters', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateBillingSettings = (data: Partial<BillingSettingsConfig>) => {
    setBillingSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_billing', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Billing Prefix & Tax Slabs', category: 'Billing Settings', oldValue: 'Previous Taxes', newValue: 'Updated Tax Rules', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updatePaymentSettings = (data: Partial<PaymentSettingsConfig>) => {
    setPaymentSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_payment', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Payment Tender Methods', category: 'Payment Settings', oldValue: 'Previous Tenders', newValue: 'Updated Tenders', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updatePrintingSettings = (data: Partial<PrintingSettingsConfig>) => {
    setPrintingSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_printing', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Document Print Layouts & Letterhead', category: 'Printing', oldValue: 'Previous Header', newValue: 'Updated Layouts', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateNotificationSettings = (data: Partial<NotificationSettingsConfig>) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_notifications', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Alert Triggers & Channels', category: 'Notifications', oldValue: 'Previous Triggers', newValue: 'Updated Triggers', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateEmailSettings = (data: Partial<EmailSettingsConfig>) => {
    setEmailSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_email', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'SMTP Gateway Server Config', category: 'Email Settings', oldValue: 'Previous Host', newValue: `${data.smtpHost || ''}`, changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateSMSSettings = (data: Partial<SMSSettingsConfig>) => {
    setSmsSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_sms', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'SMS Gateway Credentials', category: 'SMS Settings', oldValue: 'Previous Gateway', newValue: `${data.providerName || ''}`, changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateSecuritySettings = (data: Partial<SecuritySettingsConfig>) => {
    setSecuritySettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_security', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Security & Lockout Policies', category: 'Security', oldValue: 'Previous Rules', newValue: 'Updated Policies', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateUserAccessSettings = (data: Partial<UserAccessSettingsConfig>) => {
    setUserAccessSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_user_access', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'User Access & Session Rules', category: 'User Access', oldValue: 'Previous Policy', newValue: 'Updated Policy', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updatePatientSettings = (data: Partial<PatientSettingsConfig>) => {
    setPatientSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_patients', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Patient Registration Rules', category: 'Patient Settings', oldValue: 'Previous Rules', newValue: 'Updated Rules', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateDoctorSettings = (data: Partial<DoctorSettingsConfig>) => {
    setDoctorSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_doctors', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Doctor Consultation Defaults', category: 'Doctor Settings', oldValue: 'Previous Defaults', newValue: 'Updated Defaults', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateInsuranceSettings = (data: Partial<InsuranceSettingsConfig>) => {
    setInsuranceSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_insurance', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Insurance / TPA Policies', category: 'Insurance Settings', oldValue: 'Previous Policy', newValue: 'Updated Policy', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateReportSettings = (data: Partial<ReportSettingsConfig>) => {
    setReportSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_reports', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Report Layouts & Filters', category: 'Report Settings', oldValue: 'Previous Layout', newValue: 'Updated Layout', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  const updateAuditSettings = (data: Partial<AuditSettingsConfig>) => {
    setAuditSettings(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('aln_hms_settings_audit', JSON.stringify(updated));
      return updated;
    });
    addHistoryRecord({ settingName: 'Audit Trail Retention Rules', category: 'Audit Settings', oldValue: 'Previous Retention', newValue: 'Updated Rules', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  // Reset category to default
  const resetToDefaults = (category: SettingsTab) => {
    switch (category) {
      case 'hospital_profile':
        setHospitalProfile(DEFAULT_HOSPITAL_PROFILE);
        localStorage.setItem('aln_hms_settings_hospital', JSON.stringify(DEFAULT_HOSPITAL_PROFILE));
        break;
      case 'general':
        setGeneralSettings(DEFAULT_GENERAL_SETTINGS);
        localStorage.setItem('aln_hms_settings_general', JSON.stringify(DEFAULT_GENERAL_SETTINGS));
        break;
      case 'appearance':
        setAppearance(DEFAULT_APPEARANCE);
        localStorage.setItem('aln_hms_settings_appearance', JSON.stringify(DEFAULT_APPEARANCE));
        break;
      case 'localization':
        setLocalization(DEFAULT_LOCALIZATION);
        localStorage.setItem('aln_hms_settings_localization', JSON.stringify(DEFAULT_LOCALIZATION));
        break;
      case 'numbering':
        setNumbering(DEFAULT_NUMBERING);
        localStorage.setItem('aln_hms_settings_numbering', JSON.stringify(DEFAULT_NUMBERING));
        break;
      case 'opd':
        setOpdSettings(DEFAULT_OPD);
        localStorage.setItem('aln_hms_settings_opd', JSON.stringify(DEFAULT_OPD));
        break;
      case 'appointments':
        setAppointmentSettings(DEFAULT_APPOINTMENTS);
        localStorage.setItem('aln_hms_settings_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
        break;
      case 'ipd':
        setIpdSettings(DEFAULT_IPD);
        localStorage.setItem('aln_hms_settings_ipd', JSON.stringify(DEFAULT_IPD));
        break;
      case 'beds':
        setBedSettings(DEFAULT_BEDS);
        localStorage.setItem('aln_hms_settings_beds', JSON.stringify(DEFAULT_BEDS));
        break;
      case 'nursing':
        setNursingSettings(DEFAULT_NURSING);
        localStorage.setItem('aln_hms_settings_nursing', JSON.stringify(DEFAULT_NURSING));
        break;
      case 'laboratory':
        setLabSettings(DEFAULT_LAB);
        localStorage.setItem('aln_hms_settings_lab', JSON.stringify(DEFAULT_LAB));
        break;
      case 'radiology':
        setRadiologySettings(DEFAULT_RADIOLOGY);
        localStorage.setItem('aln_hms_settings_radiology', JSON.stringify(DEFAULT_RADIOLOGY));
        break;
      case 'pharmacy':
        setPharmacySettings(DEFAULT_PHARMACY);
        localStorage.setItem('aln_hms_settings_pharmacy', JSON.stringify(DEFAULT_PHARMACY));
        break;
      case 'blood_bank':
        setBloodBankSettings(DEFAULT_BLOOD_BANK);
        localStorage.setItem('aln_hms_settings_blood_bank', JSON.stringify(DEFAULT_BLOOD_BANK));
        break;
      case 'billing':
        setBillingSettings(DEFAULT_BILLING);
        localStorage.setItem('aln_hms_settings_billing', JSON.stringify(DEFAULT_BILLING));
        break;
      case 'payments':
        setPaymentSettings(DEFAULT_PAYMENT);
        localStorage.setItem('aln_hms_settings_payment', JSON.stringify(DEFAULT_PAYMENT));
        break;
      case 'printing':
        setPrintingSettings(DEFAULT_PRINTING);
        localStorage.setItem('aln_hms_settings_printing', JSON.stringify(DEFAULT_PRINTING));
        break;
      case 'notifications':
        setNotificationSettings(DEFAULT_NOTIFICATIONS);
        localStorage.setItem('aln_hms_settings_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        break;
      case 'email':
        setEmailSettings(DEFAULT_EMAIL);
        localStorage.setItem('aln_hms_settings_email', JSON.stringify(DEFAULT_EMAIL));
        break;
      case 'sms':
        setSmsSettings(DEFAULT_SMS);
        localStorage.setItem('aln_hms_settings_sms', JSON.stringify(DEFAULT_SMS));
        break;
      case 'security':
        setSecuritySettings(DEFAULT_SECURITY);
        localStorage.setItem('aln_hms_settings_security', JSON.stringify(DEFAULT_SECURITY));
        break;
      case 'users_access':
        setUserAccessSettings(DEFAULT_USER_ACCESS);
        localStorage.setItem('aln_hms_settings_user_access', JSON.stringify(DEFAULT_USER_ACCESS));
        break;
      case 'patients':
        setPatientSettings(DEFAULT_PATIENT);
        localStorage.setItem('aln_hms_settings_patients', JSON.stringify(DEFAULT_PATIENT));
        break;
      case 'doctors':
        setDoctorSettings(DEFAULT_DOCTOR);
        localStorage.setItem('aln_hms_settings_doctors', JSON.stringify(DEFAULT_DOCTOR));
        break;
      case 'insurance':
        setInsuranceSettings(DEFAULT_INSURANCE);
        localStorage.setItem('aln_hms_settings_insurance', JSON.stringify(DEFAULT_INSURANCE));
        break;
      case 'reports':
        setReportSettings(DEFAULT_REPORT);
        localStorage.setItem('aln_hms_settings_reports', JSON.stringify(DEFAULT_REPORT));
        break;
      case 'audit':
        setAuditSettings(DEFAULT_AUDIT);
        localStorage.setItem('aln_hms_settings_audit', JSON.stringify(DEFAULT_AUDIT));
        break;
      default:
        break;
    }

    addHistoryRecord({ settingName: `Reset ${category} to Default Settings`, category, oldValue: 'Custom Settings', newValue: 'System Default', changedBy: 'Administrator' });
    setIsDirty(false);
  };

  // Export Settings JSON Backup
  const exportSettingsBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      hospitalProfile,
      generalSettings,
      appearance,
      localization,
      numbering,
      opdSettings,
      appointmentSettings,
      ipdSettings,
      bedSettings,
      nursingSettings,
      labSettings,
      radiologySettings,
      pharmacySettings,
      bloodBankSettings,
      billingSettings,
      paymentSettings,
      printingSettings,
      notificationSettings,
      emailSettings,
      smsSettings,
      securitySettings,
      userAccessSettings,
      patientSettings,
      doctorSettings,
      insuranceSettings,
      reportSettings,
      auditSettings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALN_CURE_HMS_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SettingsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isDirty,
        setIsDirty,

        hospitalProfile,
        updateHospitalProfile,

        generalSettings,
        updateGeneralSettings,

        appearance,
        updateAppearance,

        localization,
        updateLocalization,

        numbering,
        updateNumbering,

        opdSettings,
        updateOPDSettings,

        appointmentSettings,
        updateAppointmentSettings,

        ipdSettings,
        updateIPDSettings,

        bedSettings,
        updateBedSettings,

        nursingSettings,
        updateNursingSettings,

        labSettings,
        updateLabSettings,

        radiologySettings,
        updateRadiologySettings,

        pharmacySettings,
        updatePharmacySettings,

        bloodBankSettings,
        updateBloodBankSettings,

        billingSettings,
        updateBillingSettings,

        paymentSettings,
        updatePaymentSettings,

        printingSettings,
        updatePrintingSettings,

        notificationSettings,
        updateNotificationSettings,

        emailSettings,
        updateEmailSettings,

        smsSettings,
        updateSMSSettings,

        securitySettings,
        updateSecuritySettings,

        userAccessSettings,
        updateUserAccessSettings,

        patientSettings,
        updatePatientSettings,

        doctorSettings,
        updateDoctorSettings,

        insuranceSettings,
        updateInsuranceSettings,

        reportSettings,
        updateReportSettings,

        auditSettings,
        updateAuditSettings,

        systemInfo,
        history,
        addHistoryRecord,

        resetToDefaults,
        exportSettingsBackup,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
