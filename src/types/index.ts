// ============================================================
// ALN Cure HMS — Core TypeScript Types
// ============================================================

// ---- AUTH & ROLES ----
export type UserRole =
  | 'super_admin'
  | 'hospital_admin'
  | 'receptionist'
  | 'doctor'
  | 'nurse'
  | 'dietitian'
  | 'lab_technician'
  | 'radiology_technician'
  | 'pharmacist'
  | 'billing_staff'
  | 'insurance_coordinator'
  | 'ambulance_staff'
  | 'blood_bank_staff'
  | 'patient'
  | 'management';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ---- PATIENT ----
export interface Patient {
  id: string; // Unique Patient ID (e.g., ALN-2024-00001)
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  emergencyContact: EmergencyContact;
  registrationDate: string;
  isActive: boolean;
  photo?: string;
  aadhaar?: string;
  insurance?: InsuranceInfo;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  validUpto: string;
  tpaName?: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// ---- DOCTOR ----
export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number; // years
  department: string;
  phone: string;
  email: string;
  registrationNumber: string;
  avatar?: string;
  consultationFee: number;
  isAvailable: boolean;
  schedule: DoctorSchedule[];
  opdSchedule?: { days?: string[]; startTime?: string; endTime?: string; };
  bio?: string;
}

export interface DoctorSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  maxPatients: number;
  isAvailable: boolean;
}

// ---- APPOINTMENT ----
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'opd' | 'follow_up' | 'emergency' | 'teleconsult';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  tokenNumber: number;
  consultationFee: number;
  notes?: string;
  chiefComplaint?: string;
  createdAt: string;
}

// ---- OPD CONSULTATION ----
export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string[];
  icdCodes?: string[];
  prescription: PrescriptionItem[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  notes: string;
  followUpDate?: string;
  followUpInstructions?: string;
  vitals: Vitals;
  aiDraftNote?: string;
  aiApproved?: boolean;
  aiApprovedBy?: string;
  aiApprovedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bloodPressure?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  medicineId?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  quantity: number;
}

export interface LabOrder {
  testId: string;
  testName: string;
  priority: 'routine' | 'urgent' | 'stat';
  notes?: string;
}

export interface RadiologyOrder {
  studyType: string;
  bodyPart: string;
  priority: 'routine' | 'urgent' | 'stat';
  clinicalHistory?: string;
}

// ---- IPD ADMISSION ----
export type AdmissionStatus = 'active' | 'discharged' | 'transferred' | 'ama' | 'expired';
export type BedType = 'general' | 'private' | 'semi_private' | 'icu' | 'hdu' | 'nicu' | 'picu' | 'emergency' | 'isolation' | 'other';
export type BedStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'blocked';

export interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  wardId: string;
  roomNumber?: string;
  building?: string;
  floor: number;
  type: BedType;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  currentAdmissionId?: string;
  admittingDoctorName?: string;
  admissionDate?: string;
  dailyRate: number;
  features: string[];
}

export interface Ward {
  id: string;
  name: string;
  floor: number;
  type: BedType;
  totalBeds: number;
  availableBeds: number;
  inchargeName?: string;
  phone?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  admittingDoctorId: string;
  admittingDoctorName: string;
  bedId: string;
  bedNumber: string;
  ward: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate?: string;
  dischargeTime?: string;
  status: AdmissionStatus;
  diagnosis: string[];
  admissionNotes: string;
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  referredBy?: string;
  mlc: boolean; // Medico-legal case
  dischargeType?: 'normal' | 'referral' | 'ama' | 'expired';
  dischargeSummary?: DischargeSummary;
  aiDischargeDraft?: string;
  dailyNotes: DailyNote[];
  createdAt: string;
}

export interface DischargeSummary {
  finalDiagnosis: string[];
  procedures: string[];
  summaryText: string;
  medications: PrescriptionItem[];
  followUpInstructions: string;
  followUpDate?: string;
  preparedBy: string;
  approvedBy: string;
  createdAt: string;
}

export interface DailyNote {
  id: string;
  date: string;
  noteType: 'doctor_round' | 'nursing' | 'diet' | 'vitals';
  authorId: string;
  authorName: string;
  content: string;
  vitals?: Vitals;
}

// ---- LABORATORY ----
export type LabTestStatus = 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';

export interface LabTest {
  id: string;
  name: string;
  category: string;
  sampleType: string;
  normalRange?: string;
  unit?: string;
  price: number;
  turnaroundHours: number;
  description?: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  admissionId?: string;
  requestDate: string;
  tests: LabRequestItem[];
  priority: 'routine' | 'urgent' | 'stat';
  status: LabTestStatus;
  sampleCollectedAt?: string;
  collectedBy?: string;
  results?: LabResult[];
  aiInsight?: string;
  aiInsightApproved?: boolean;
  totalAmount: number;
}

export interface LabRequestItem {
  testId: string;
  testName: string;
  status: LabTestStatus;
  sampleType: string;
  price: number;
}

export interface LabResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
  reportedAt: string;
  reportedBy: string;
  methodology?: string;
}

// ---- RADIOLOGY ----
export type RadiologyStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RadiologyModality = 'xray' | 'ecg' | 'ultrasound' | 'ct' | 'mri' | 'mammography' | 'dexa';

export interface RadiologyStudy {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  modality: RadiologyModality;
  bodyPart: string;
  scheduledDate: string;
  scheduledTime: string;
  status: RadiologyStatus;
  priority?: 'routine' | 'urgent' | 'stat';
  technicianId?: string;
  radiologistId?: string;
  radiologistName?: string;
  clinicalHistory?: string;
  findingsText?: string;
  impressionText?: string;
  imageFiles?: string[];
  reportUrl?: string;
  aiDraftReport?: string;
  aiReportApproved?: boolean;
  price: number;
  consultationId?: string;
  admissionId?: string;
  createdAt: string;
}

// ---- PHARMACY ----
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  form: string; // tablet, syrup, injection, etc.
  strength: string;
  unit: string;
  price: number;
  mrp: number;
  hsnCode?: string;
  prescriptionRequired: boolean;
  batches: MedicineBatch[];
  reorderLevel: number;
  isActive: boolean;
  dosageForm?: string;
  currentStock?: number;
  expiryDate?: string;
  sellingPrice?: number;
  purchasePrice?: number;
}

export interface MedicineBatch {
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierId?: string;
  receivedDate: string;
}

export interface Dispensing {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  doctorId?: string;
  doctorName?: string;
  dispensedBy: string;
  dispensedAt: string;
  items: DispensingItem[];
  totalAmount: number;
  discount: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  status: 'pending' | 'dispensed' | 'returned' | 'partial';
  notes?: string;
}

export interface DispensingItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dosageInstructions?: string;
}

// ---- BILLING ----
export type PaymentMode = 'cash' | 'card' | 'upi' | 'insurance' | 'tpa' | 'cheque' | 'online';
export type BillStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled';

export interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  patientName: string;
  admissionId?: string;
  consultationId?: string;
  date: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalAmount?: number;
  paidAmount: number;
  balanceDue: number;
  status: BillStatus;
  billType?: string;
  doctorName?: string;
  lineItems?: BillItem[];
  discountAmount?: number;
  taxAmount?: number;
  payments: Payment[];
  insuranceClaim?: InsuranceClaim;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  dispensed: boolean;
  medicines: { medicineName: string; dosage: string; frequency: string; duration: string; }[];
}

export interface BillItem {
  id: string;
  category: 'consultation' | 'ipd' | 'lab' | 'radiology' | 'pharmacy' | 'procedure' | 'room' | 'other';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface Payment {
  id: string;
  amount: number;
  mode: PaymentMode;
  referenceNumber?: string;
  date: string;
  receivedBy: string;
  notes?: string;
}

export interface InsuranceClaim {
  id: string;
  insuranceProvider: string;
  policyNumber: string;
  tpaName?: string;
  claimAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  status: ClaimStatus;
  submittedDate: string;
  settledDate?: string;
  remarks?: string;
}

// ---- DIET CHART ----
export interface DietChart {
  id: string;
  patientId: string;
  patientName: string;
  admissionId: string;
  bedId: string;
  prescribedBy: string; // doctor / dietitian userId
  prescribedByName: string;
  dietitianName?: string;
  startDate: string;
  endDate?: string;
  dietType: string; // diabetic, renal, cardiac, post-surgery, normal, etc.
  restrictions: string[]; // allergies, intolerances
  meals: MealPlan[];
  calorieTarget?: number;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  notes?: string;
  isActive: boolean;
  aiDraftPlan?: string;
  aiPlanApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  mealTime: 'breakfast' | 'mid_morning' | 'lunch' | 'afternoon' | 'dinner' | 'bedtime';
  items: string[];
  calories?: number;
  notes?: string;
}

// ---- AMBULANCE / EMERGENCY ----
export type EmergencyPriority = 'critical' | 'high' | 'medium' | 'low';
export type AmbulanceRequestStatus = 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';

export interface AmbulanceRequest {
  id: string;
  requestedBy: string; // name of caller
  phone: string;
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  patientCondition: string;
  priority: EmergencyPriority;
  status: AmbulanceRequestStatus;
  assignedAmbulanceId?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

// ---- BLOOD BANK ----
export interface BloodStock {
  bloodGroup: BloodGroup;
  units: number;
  lastUpdated: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  email?: string;
  dateOfBirth: string;
  lastDonationDate?: string;
  totalDonations: number;
  isEligible: boolean;
  address: string;
  notes?: string;
  registeredAt: string;
}

// ---- NOTIFICATION ----
export type NotificationChannel = 'sms' | 'email' | 'whatsapp' | 'in_app';
export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'token_update'
  | 'lab_report_ready'
  | 'radiology_report_ready'
  | 'payment_confirmation'
  | 'payment_reminder'
  | 'admission'
  | 'discharge'
  | 'emergency'
  | 'medication_reminder'
  | 'meal_reminder'
  | 'general';

export interface Notification {
  id: string;
  recipientId: string;
  recipientName: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

// ---- AI ----
export interface AIResponse {
  id: string;
  context: string;
  prompt: string;
  response: string;
  disclaimer: string;
  generatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  isApproved: boolean;
  userId: string;
  userName: string;
  patientId?: string;
}

// ---- REPORTS ----
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportConfig {
  type: string;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  format: ReportFormat;
  filters?: Record<string, unknown>;
}

// ---- DEPARTMENT ----
export interface Department {
  id: string;
  name: string;
  code: string;
  head?: string;
  headName?: string;
  phone?: string;
  email?: string;
  location?: string;
  isActive: boolean;
}

// ---- DASHBOARD ----
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  waitingPatients: number;
  availableDoctors: number;
  opdConsultations: number;
  ipdAdmissions: number;
  availableBeds: number;
  icuBedsAvailable: number;
  occupiedBeds: number;
  pendingLabTests: number;
  pendingRadiologyReports: number;
  lowStockMedicines: number;
  expiringMedicines: number;
  todayRevenue: number;
  pendingPayments: number;
  insuranceClaims: number;
  ambulanceRequests: number;
  emergencyAlerts: number;
}

// ---- SEARCH ----
export interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'doctor' | 'lab_report' | 'bill' | 'admission' | 'bed' | 'medicine' | 'opd_visit';
  title: string;
  subtitle: string;
  route: string;
}

// ============================================================
// OPD MODULE EXTENDED TYPES
// ============================================================
export type OPDVisitType = 'new' | 'follow_up' | 'emergency';
export type OPDVisitStatus = 'waiting' | 'called' | 'in_consultation' | 'completed' | 'cancelled' | 'no_show' | 'on_hold' | 'skipped';
export type OPDQueuePriority = 'normal' | 'priority' | 'senior' | 'emergency';

export interface OPDVisit {
  id: string; // e.g. OPD-2026-00001
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  patientPhone?: string;
  patientBloodGroup?: BloodGroup;
  doctorId: string;
  doctorName: string;
  department: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  visitType: OPDVisitType;
  tokenNumber: number;
  priority: OPDQueuePriority;
  status: OPDVisitStatus;
  reasonForVisit: string;
  referralSource?: string;
  idType?: string;
  idNumber?: string;
  vitals?: Vitals;
  consultationId?: string;
  billId?: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  waitingStartTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OPDQueueItem {
  id: string;
  visitId: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentTime: string;
  waitingSince: string;
  priority: OPDQueuePriority;
  status: OPDVisitStatus;
  chiefComplaint?: string;
}

export interface OPDDiagnosisItem {
  id: string;
  code?: string; // ICD-10 code
  name: string;
  type: 'primary' | 'secondary' | 'provisional' | 'differential';
  notes?: string;
}

export interface OPDMedicineItem {
  id: string;
  medicineId?: string;
  medicineName: string;
  genericName?: string;
  type: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops' | 'Inhaler' | 'Other';
  strength: string;
  dosage: string; // e.g. 1 tab, 5ml
  route: 'Oral' | 'IV' | 'IM' | 'SC' | 'Topical' | 'Inhalation' | 'Ophthalmic' | 'Nasal';
  frequency: 'Once Daily (OD)' | 'Twice Daily (BD)' | 'Thrice Daily (TID)' | 'Four Times (QID)' | 'Every 6 Hours' | 'Every 8 Hours' | 'As Needed (SOS)' | 'Before Food' | 'After Food' | 'At Bedtime (HS)';
  duration: string; // e.g. 5 days, 10 days, 1 month
  quantity: number;
  instructions: string; // e.g. Take with warm water after meals
}

export interface OPDFollowUp {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  previousVisitId: string;
  followUpDate: string;
  reason: string;
  instructions?: string;
  status: 'upcoming' | 'completed' | 'missed' | 'cancelled';
  createdAt: string;
}

export interface OPDBillingSummary {
  consultationFee: number;
  registrationFee: number;
  procedureFee: number;
  labCharges: number;
  diagnosticCharges: number;
  medicineCharges: number;
  otherCharges: number;
  discount: number;
  tax: number;
  subtotal: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'cancelled';
  invoiceNumber: string;
  receiptNumber?: string;
  transactionId?: string;
}

export interface OPDDashboardKPIs {
  totalPatientsToday: number;
  newPatients: number;
  followUpPatients: number;
  waitingPatients: number;
  inConsultation: number;
  completedConsultations: number;
  cancelledAppointments: number;
  revenueToday: number;
}

// ============================================================
// IPD MODULE EXTENDED TYPES
// ============================================================

export type InpatientStatus = 'admitted' | 'stable' | 'critical' | 'planned_discharge' | 'discharged' | 'transferred';
export type AdmissionType = 'planned' | 'emergency' | 'referral' | 'transfer';
export type DischargeType = 'normal' | 'ama' | 'transfer' | 'death' | 'absconded';

export interface BedTransferRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  fromWard: string;
  fromRoom?: string;
  fromBedId: string;
  fromBedNumber: string;
  toWard: string;
  toRoom?: string;
  toBedId: string;
  toBedNumber: string;
  reason: string;
  requestedBy: string;
  approvedBy: string;
  transferDate: string;
  transferTime: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface IPDDoctorRound {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  roundDate: string;
  roundTime: string;
  progressNotes: string;
  clinicalFindings: string;
  diagnosisUpdates?: string[];
  treatmentPlan: string;
  medicationChanges?: string;
  investigationOrders?: string;
  procedureOrders?: string;
  followUpInstructions?: string;
  condition: 'stable' | 'improving' | 'critical' | 'deteriorating';
  vitals?: Vitals;
  createdAt: string;
}

export interface IPDNursingTask {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  taskType: 'medication_due' | 'vitals_due' | 'doctor_round_pending' | 'investigation_pending' | 'procedure_pending' | 'care_instruction';
  title: string;
  description?: string;
  dueTime: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'completed' | 'skipped';
  assignedNurse?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface IPDNursingNote {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  nurseId: string;
  nurseName: string;
  shift: 'morning' | 'evening' | 'night';
  noteDate: string;
  noteTime: string;
  intakeOral?: number; // ml
  intakeIV?: number; // ml
  outputUrine?: number; // ml
  outputDrain?: number; // ml
  observations: string;
  nursingProcedures?: string;
  careInstructions?: string;
  vitals?: Vitals;
  createdAt: string;
}

export interface IPDVitalReading {
  id: string;
  admissionId: string;
  patientId: string;
  recordedAt: string;
  bloodPressure: string;
  pulse: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  bloodSugar?: number; // mg/dL
  painScore?: number; // 0-10
  weight?: number;
  height?: number;
  bmi?: number;
  recordedBy: string;
  notes?: string;
}

export interface InpatientMedication {
  id: string;
  admissionId: string;
  patientId: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  route: 'Oral' | 'IV' | 'IM' | 'SC' | 'Topical' | 'Inhalation' | 'Other';
  dose: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  prescribingDoctor: string;
  status: 'active' | 'completed' | 'discontinued' | 'on_hold';
}

export interface MedicationAdministrationRecord {
  id: string;
  medicationId: string;
  admissionId: string;
  patientId: string;
  medicineName: string;
  dose: string;
  route: string;
  scheduledDate: string;
  scheduledTime: string;
  administeredTime?: string;
  status: 'scheduled' | 'administered' | 'missed' | 'held' | 'cancelled';
  nurseName?: string;
  remarks?: string;
}

export interface IPDProcedure {
  id: string;
  admissionId: string;
  patientId: string;
  procedureName: string;
  category: 'surgical' | 'bedside' | 'diagnostic' | 'therapeutic';
  procedureDate: string;
  procedureTime: string;
  doctorId: string;
  doctorName: string;
  assistingStaff?: string;
  notes: string;
  findings?: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface IPDDischargeRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  uhid: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate: string;
  dischargeTime: string;
  dischargeType: DischargeType;
  finalDiagnosis: string[];
  icdCodes?: string[];
  clinicalSummary: string;
  hospitalCourse: string;
  proceduresDone: string[];
  investigationsSummary?: string;
  treatmentGiven: string;
  conditionAtDischarge: 'cured' | 'improved' | 'stable' | 'relieved' | 'critical' | 'expired';
  dischargeMedications: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  dietInstructions?: string;
  activityRestrictions?: string;
  emergencyWarningSigns?: string;
  followUpDate: string;
  followUpDoctor: string;
  followUpInstructions: string;
  consultantId: string;
  consultantName: string;
  status: 'draft' | 'finalized' | 'printed';
  createdAt: string;
}

export interface InsuranceClaimRecord {
  id: string;
  admissionId: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  memberId: string;
  tpaName?: string;
  authorizationNumber?: string;
  preAuthAmount: number;
  claimedAmount: number;
  approvedAmount: number;
  copayAmount: number;
  deductibleAmount: number;
  approvalStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | 'settled';
  claimStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'settled' | 'denied';
  denialReason?: string;
  settledDate?: string;
}

export interface IPDBill {
  id: string;
  billNumber: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  uhid: string;
  ward: string;
  bedNumber: string;
  admissionDate: string;
  dischargeDate?: string;
  totalDays: number;
  dailyBedRate: number;
  roomCharges: number;
  doctorVisitCharges: number;
  nursingCharges: number;
  procedureCharges: number;
  labCharges: number;
  diagnosticCharges: number;
  pharmacyCharges: number;
  consumablesCharges: number;
  otherCharges: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  insuranceCoveredAmount: number;
  patientPayable: number;
  paidAmount: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'pending';
  payments: {
    id: string;
    amount: number;
    mode: PaymentMode;
    referenceNumber?: string;
    date: string;
    receivedBy: string;
  }[];
  insuranceClaim?: InsuranceClaimRecord;
  createdAt: string;
  updatedAt: string;
}

export interface IPDDashboardKPIs {
  totalInpatients: number;
  todayAdmissions: number;
  todayDischarges: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  blockedBeds: number;
  totalOperationalBeds: number;
  bedOccupancyRate: number;
  icuOccupancyRate: number;
  generalWardOccupancyRate: number;
  patientsAwaitingBed: number;
  patientsAwaitingDischarge: number;
  emergencyAdmissions: number;
  highPriorityPatients: number;
}

// ============================================================
// NURSING MANAGEMENT MODULE EXTENDED TYPES
// ============================================================

export type NursingPatientPriority = 'normal' | 'high' | 'urgent' | 'stat';
export type NursingPatientStatus = 'stable' | 'critical' | 'improving' | 'deteriorating' | 'post_op' | 'discharge_planned';

export interface NursingAssignment {
  id: string;
  nurseId: string;
  nurseName: string;
  employeeId: string;
  shift: 'morning' | 'afternoon' | 'night';
  ward: string;
  assignedPatientIds: string[];
  patientCount: number;
  date: string;
  status: 'active' | 'completed' | 'reassigned';
}

export interface NursingShiftRoster {
  id: string;
  shift: 'morning' | 'afternoon' | 'night';
  ward: string;
  nurseId: string;
  nurseName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'on_duty' | 'completed';
}

export interface ComprehensiveVitals {
  id: string;
  admissionId: string;
  patientId: string;
  recordedAt: string;
  bloodPressure: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  bloodSugar?: number;
  painScore?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive';
  isAbnormal: boolean;
  abnormalFlags: string[];
  recordedBy: string;
  remarks?: string;
}

export interface NursingCarePlan {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  problem: string;
  nursingDiagnosis: string;
  goal: string;
  intervention: string;
  frequency: string;
  responsibleNurse: string;
  startDate: string;
  reviewDate: string;
  progressNotes?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: string;
}

export interface MARRecord {
  id: string;
  medicationId: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  medicineName: string;
  dose: string;
  route: string;
  frequency: string;
  scheduledDate: string;
  scheduledTime: string;
  administeredTime?: string;
  status: 'scheduled' | 'administered' | 'missed' | 'held' | 'refused' | 'cancelled';
  nurseName?: string;
  reasonForHoldMissed?: string;
  verifiedPatient: boolean;
  remarks?: string;
}

export interface IVInfusionRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  fluidName: string;
  volumeMl: number;
  route: string;
  flowRateMlHr: number;
  ivSite: string;
  startTime: string;
  expectedEndTime: string;
  actualEndTime?: string;
  nurseName: string;
  status: 'not_started' | 'running' | 'completed' | 'stopped' | 'cancelled';
  remarks?: string;
}

export interface IntakeOutputRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  date: string;
  time: string;
  shift: 'morning' | 'afternoon' | 'night';
  category: 'intake' | 'output';
  subType: 'oral' | 'iv_fluids' | 'tube_feeding' | 'blood_products' | 'urine' | 'vomit' | 'drain' | 'stool' | 'blood_loss' | 'other';
  amountMl: number;
  nurseName: string;
  remarks?: string;
}

export interface SystemAssessment {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  date: string;
  time: string;
  nurseName: string;
  generalCondition: string;
  consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive';
  orientation: 'oriented_x3' | 'disoriented';
  mobility: 'independent' | 'assisted' | 'bedridden';
  respiratoryCondition: string;
  oxygenSupport?: string;
  spo2: number;
  cardiovascularCondition: string;
  pulse: number;
  bloodPressure: string;
  skinCondition: string;
  bradenScore: number;
  pressureInjuryRisk: 'low' | 'moderate' | 'high' | 'severe';
  nutritionAppetite: string;
  feedingMethod: string;
  urineOutputStatus: string;
  bowelMovementStatus: string;
  remarks?: string;
  createdAt: string;
}

export interface WoundRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  location: string;
  woundType: 'surgical_incision' | 'pressure_ulcer' | 'laceration' | 'diabetic_foot' | 'burn' | 'other';
  sizeCm: string;
  condition: 'granulating' | 'slough' | 'necrotic' | 'epithelializing' | 'infected';
  drainage: 'none' | 'serous' | 'sanguineous' | 'purulent';
  dressingType: string;
  lastDressingDate: string;
  nextDressingDate: string;
  nurseName: string;
  remarks?: string;
  createdAt: string;
}

export interface WoundDressingLog {
  id: string;
  woundId: string;
  admissionId: string;
  dressingDate: string;
  dressingTime: string;
  procedureDone: string;
  dressingApplied: string;
  exudateAmount: 'none' | 'scant' | 'moderate' | 'heavy';
  painDuringDressing: number;
  nurseName: string;
  remarks?: string;
}

export interface NursingHandoverRecord {
  id: string;
  fromNurseId: string;
  fromNurseName: string;
  toNurseId: string;
  toNurseName: string;
  shift: 'morning' | 'afternoon' | 'night';
  date: string;
  time: string;
  ward: string;
  patientHandovers: {
    admissionId: string;
    patientName: string;
    bedNumber: string;
    condition: string;
    importantNotes: string;
    pendingTasks: string;
    medicationDue: string;
    doctorOrders: string;
    criticalAlerts: string;
  }[];
  generalWardNotes?: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  createdAt: string;
}

export interface NursingDoctorOrder {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  doctorId: string;
  doctorName: string;
  orderText: string;
  category: 'medication' | 'investigation' | 'procedure' | 'diet' | 'activity' | 'monitoring' | 'general';
  priority: 'routine' | 'urgent' | 'stat';
  orderDate: string;
  orderTime: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  completedBy?: string;
  completedAt?: string;
  remarks?: string;
}

export interface LabSampleCollection {
  id: string;
  testId: string;
  testName: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  sampleType: string;
  barcode: string;
  orderedDate: string;
  collectionDate?: string;
  collectionTime?: string;
  collectedBy?: string;
  status: 'pending' | 'collected' | 'sent_to_lab' | 'rejected' | 'completed';
  rejectionReason?: string;
}

export interface DischargeChecklistRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  doctorDischargeOrder: boolean;
  patientBelongingsReturned: boolean;
  medInstructionsProvided: boolean;
  followUpInstructionsProvided: boolean;
  documentsProvided: boolean;
  patientEducationCompleted: boolean;
  ivLineRemoved: boolean;
  nursingNotesCompleted: boolean;
  pendingInvestigationsChecked: boolean;
  billingClearanceChecked: boolean;
  transportArranged: boolean;
  nurseName: string;
  finalizedAt?: string;
  status: 'in_progress' | 'completed';
}

export interface PatientEducationRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  topic: 'medication' | 'diet' | 'wound_care' | 'follow_up' | 'hygiene' | 'mobility' | 'warning_signs' | 'home_care' | 'other';
  educationDetails: string;
  understandingLevel: 'good' | 'moderate' | 'needs_reinforcement';
  date: string;
  time: string;
  nurseName: string;
  caregiverPresent: string;
  remarks?: string;
}

export interface NursingIncidentReport {
  id: string;
  admissionId?: string;
  patientId?: string;
  patientName?: string;
  date: string;
  time: string;
  location: string;
  incidentType: 'fall' | 'medication_error' | 'patient_injury' | 'equipment_issue' | 'infiltration' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'sentinel';
  description: string;
  immediateActionTaken: string;
  reportedBy: string;
  supervisor: string;
  status: 'reported' | 'under_review' | 'resolved' | 'closed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface NursingAlert {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  alertType: 'critical_patient' | 'abnormal_vitals' | 'medication_due' | 'medication_overdue' | 'pending_task' | 'doctor_order' | 'investigation' | 'patient_transfer' | 'discharge' | 'handover';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggerValue?: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
}

export interface NursingDashboardKPIs {
  totalAssignedPatients: number;
  patientsRequiringAttention: number;
  vitalsDueCount: number;
  medicationDueCount: number;
  medicationOverdueCount: number;
  tasksPendingCount: number;
  doctorOrdersPendingCount: number;
  criticalPatientsCount: number;
  newAdmissionsCount: number;
  patientsForDischargeCount: number;
}

// ============================================================
// DIET CHARTS & NUTRITION MANAGEMENT MODULE TYPES
// ============================================================

export type DietType =
  | 'regular'
  | 'soft'
  | 'liquid'
  | 'full_liquid'
  | 'clear_liquid'
  | 'diabetic'
  | 'low_salt'
  | 'low_fat'
  | 'high_protein'
  | 'renal'
  | 'cardiac'
  | 'high_calorie'
  | 'low_calorie'
  | 'pediatric'
  | 'icu'
  | 'post_op'
  | 'npo'
  | 'other';

export type DietStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'active'
  | 'modified'
  | 'discontinued'
  | 'cancelled';

export type MealType =
  | 'early_morning'
  | 'breakfast'
  | 'mid_morning'
  | 'lunch'
  | 'evening_snack'
  | 'dinner'
  | 'bedtime';

export type MealStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'served'
  | 'refused'
  | 'cancelled';

export interface FoodItem {
  id: string;
  name: string;
  category: 'cereals' | 'fruits' | 'vegetables' | 'dairy' | 'protein' | 'snacks' | 'beverages' | 'supplements' | 'other';
  servingUnit: 'Portion' | 'Bowl' | 'Glass' | 'Cup' | 'Plate' | 'ml' | 'piece';
  standardPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isVegetarian: boolean;
  allergens: string[];
  preparationMethod?: string;
  isActive: boolean;
}

export interface MealScheduleFoodItem {
  foodItemId: string;
  foodName: string;
  portion: string;
  calories?: number;
  instructions?: string;
}

export interface MealScheduleItem {
  id: string;
  mealType: MealType;
  scheduledTime: string;
  foodItems: MealScheduleFoodItem[];
  specialInstructions?: string;
}

export interface ComprehensiveDietChart {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  ward: string;
  doctorName: string;
  dietitianId: string;
  dietitianName: string;
  dietType: DietType;
  dietConsistency: 'regular' | 'soft' | 'pureed' | 'liquid' | 'npo';
  feedingMethod: 'oral' | 'enteral_tube' | 'parenteral_tpn' | 'assisted' | 'npo';
  mealFrequency: string;
  estimatedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fluidRequirementMl?: number;
  mealSchedules: MealScheduleItem[];
  restrictions: string[];
  allergies: string[];
  specialInstructions?: string;
  status: DietStatus;
  version: number;
  previousVersionId?: string;
  modificationReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionAssessmentRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  date: string;
  dietitianName: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  recentWeightChange?: string;
  appetite: 'good' | 'fair' | 'poor' | 'anorexic';
  feedingAbility: 'independent' | 'assisted' | 'tube_fed' | 'npo';
  swallowingDifficulty: boolean;
  nutritionalRisk: 'low' | 'moderate' | 'high';
  dietaryHistory?: string;
  notes?: string;
  createdAt: string;
}

export interface DoctorDietOrder {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  doctorId: string;
  doctorName: string;
  requestedDietType: DietType;
  instructions?: string;
  priority: 'routine' | 'urgent' | 'stat';
  isNPO: boolean;
  npoReason?: string;
  orderDate: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface MealDeliveryRecord {
  id: string;
  dietChartId: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  ward: string;
  mealType: MealType;
  date: string;
  scheduledTime: string;
  status: MealStatus;
  deliveredTime?: string;
  kitchenStaff?: string;
  deliveryStaff?: string;
  refusalReason?: string;
  remarks?: string;
}

export interface NPOPatientRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  ward: string;
  doctorName: string;
  startDateTime: string;
  endDateTime?: string;
  reason: string;
  orderedBy: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface DietAlert {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  alertType: 'new_order' | 'pending_approval' | 'diet_modified' | 'allergy_conflict' | 'npo_patient' | 'meal_pending' | 'meal_overdue' | 'meal_refused' | 'diet_expiring' | 'review_due';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
}

export interface DietDashboardKPIs {
  totalInpatients: number;
  patientsWithDiet: number;
  dietPendingApproval: number;
  dietApproved: number;
  dietChangesToday: number;
  specialDietCount: number;
  allergyCount: number;
  mealsPending: number;
  mealsServed: number;
  mealsCancelled: number;
}

// ==========================================
// LABORATORY & LIS (LABORATORY INFORMATION SYSTEM)
// ==========================================

export type LabPriority = 'routine' | 'urgent' | 'stat';

export type LabOrderStatus =
  | 'ordered'
  | 'sample_pending'
  | 'sample_collected'
  | 'sample_received'
  | 'processing'
  | 'completed'
  | 'verified'
  | 'cancelled';

export type LabSampleStatus =
  | 'pending'
  | 'collected'
  | 'received'
  | 'accepted'
  | 'rejected'
  | 'recollection_required'
  | 'processing'
  | 'completed';

export type LabResultFlag =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical_low'
  | 'critical_high'
  | 'abnormal'
  | 'positive'
  | 'negative'
  | 'reactive'
  | 'non_reactive';

export type LabTestCategory =
  | 'hematology'
  | 'biochemistry'
  | 'clinical_pathology'
  | 'microbiology'
  | 'serology'
  | 'immunology'
  | 'histopathology'
  | 'cytology'
  | 'molecular'
  | 'hormones'
  | 'urine'
  | 'stool'
  | 'blood'
  | 'other';

export interface LabTestParameter {
  id: string;
  parameterName: string;
  unit: string;
  referenceRangeMale: string;
  referenceRangeFemale: string;
  referenceRangePediatric?: string;
  criticalLow?: number;
  criticalHigh?: number;
  defaultValue?: string;
  format: 'numeric' | 'text' | 'positive_negative' | 'selectable';
  options?: string[];
}

export interface LabTestMasterItem {
  id: string;
  testCode: string;
  testName: string;
  category: LabTestCategory;
  department: string;
  sampleType: string;
  containerType: string;
  sampleVolume: string;
  turnaroundHours: number;
  price: number;
  preparationInstructions?: string;
  fastingRequired: boolean;
  parameters: LabTestParameter[];
  isActive: boolean;
}

export interface LabPackageMasterItem {
  id: string;
  packageCode: string;
  packageName: string;
  testIds: string[];
  price: number;
  discountPercentage: number;
  isActive: boolean;
  description?: string;
}

export interface LabSampleRecord {
  id: string;
  sampleId: string; // e.g. SMP-2026-0012
  barcode: string;
  orderId: string;
  patientId: string;
  patientName: string;
  bedNumber?: string;
  ward?: string;
  sampleType: string;
  containerType: string;
  priority: LabPriority;
  status: LabSampleStatus;
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  rejectionReason?: string;
  rejectionRemarks?: string;
  recollectionSampleId?: string;
}

export interface LabParameterResult {
  parameterId: string;
  parameterName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: LabResultFlag;
  isCritical: boolean;
  technicianRemarks?: string;
}

export interface LabOrderItem {
  id: string;
  testId: string;
  testCode: string;
  testName: string;
  sampleType: string;
  containerType: string;
  price: number;
  status: 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'verified';
  results: LabParameterResult[];
  technicianName?: string;
  technicianAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ComprehensiveLabOrder {
  id: string;
  orderNumber: string; // e.g. LAB-2026-00045
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  encounterType: 'opd' | 'ipd' | 'emergency';
  admissionId?: string;
  bedNumber?: string;
  ward?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  orderDate: string;
  priority: LabPriority;
  clinicalNotes?: string;
  diagnosis?: string;
  fastingRequired: boolean;
  items: LabOrderItem[];
  sampleIds: string[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'insurance_covered';
  status: LabOrderStatus;
  sampleStatus: LabSampleStatus;
  pathologistRemarks?: string;
  aiInsight?: string;
  aiInsightApproved?: boolean;
  version: number;
  previousVersionId?: string;
  amendmentReason?: string;
  amendedBy?: string;
  amendedAt?: string;
}

export interface LabCriticalAlert {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  bedNumber?: string;
  ward?: string;
  doctorName: string;
  testName: string;
  parameterName: string;
  resultValue: string | number;
  criticalThreshold: string;
  detectedAt: string;
  status: 'new' | 'notified' | 'acknowledged';
  notifiedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface LabReportAmendment {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  testName: string;
  version: number;
  amendmentReason: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  amendedBy: string;
  amendedAt: string;
}

export interface LabDashboardKPIs {
  totalOrdersToday: number;
  pendingTests: number;
  sampleCollectionPending: number;
  samplesCollected: number;
  samplesInProcessing: number;
  testsCompleted: number;
  reportsPendingVerification: number;
  reportsVerified: number;
  criticalResultsCount: number;
  cancelledTestsCount: number;
}

// ==========================================
// RADIOLOGY & DIAGNOSTIC IMAGING (RIS)
// ==========================================

export type RadiologyModalityType =
  | 'xray'
  | 'ct'
  | 'mri'
  | 'ultrasound'
  | 'mammography'
  | 'fluoroscopy'
  | 'pet'
  | 'nuclear_medicine'
  | 'dexa'
  | 'ecg'
  | 'other';

export type RadiologyPriority = 'routine' | 'urgent' | 'stat';

export type RadiologyOrderStatus =
  | 'ordered'
  | 'pending_scheduling'
  | 'scheduled'
  | 'preparation_pending'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'report_pending'
  | 'verified'
  | 'released'
  | 'cancelled';

export type RadiologyCheckInStatus =
  | 'scheduled'
  | 'arrived'
  | 'waiting'
  | 'ready'
  | 'in_examination'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type RadiologyReportStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'released'
  | 'amended'
  | 'cancelled';

export interface RadiologySafetyChecklist {
  patientIdentityVerified: boolean;
  examinationVerified: boolean;
  consentStatus: 'not_required' | 'pending' | 'obtained' | 'declined';
  fastingConfirmed: boolean;
  metalRemoved: boolean;
  contrastAllergyChecked: boolean;
  pregnancyChecked: boolean;
  remarks?: string;
}

export interface ContrastAdministrationRecord {
  contrastRequired: boolean;
  contrastType?: string;
  agentName?: string;
  volumeMl?: number;
  route?: string;
  administeredAt?: string;
  administeredBy?: string;
  batchNumber?: string;
  serumCreatinine?: number;
  remarks?: string;
}

export interface RadiologyModalityItem {
  id: string;
  modalityCode: string;
  modalityName: string;
  modalityType: RadiologyModalityType;
  department: string;
  roomNumber: string;
  machineName: string;
  manufacturer: string;
  model: string;
  location: string;
  availabilityStatus: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  isActive: boolean;
}

export interface RadiologyExaminationItem {
  id: string;
  examCode: string;
  examName: string;
  modalityType: RadiologyModalityType;
  bodyPart: string;
  description: string;
  preparationInstructions: string;
  contrastRequired: boolean;
  fastingRequired: boolean;
  estimatedDurationMins: number;
  turnaroundHours: number;
  price: number;
  isActive: boolean;
}

export interface RadiologyPackageItem {
  id: string;
  packageCode: string;
  packageName: string;
  examIds: string[];
  price: number;
  discountPercentage: number;
  isActive: boolean;
  description?: string;
}

export interface RadiologyEquipmentItem {
  id: string;
  equipmentName: string;
  modalityType: RadiologyModalityType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  roomLocation: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  installationDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  isActive: boolean;
}

export interface ComprehensiveRadiologyOrder {
  id: string;
  orderNumber: string; // e.g. RAD-ORD-2026-00045
  accessionNumber: string; // e.g. RAD-2026-000045
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  encounterType: 'opd' | 'ipd' | 'emergency';
  admissionId?: string;
  bedNumber?: string;
  ward?: string;
  referringDoctorId: string;
  referringDoctorName: string;
  department: string;
  orderDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  priority: RadiologyPriority;
  modalityType: RadiologyModalityType;
  examId: string;
  examName: string;
  bodyPart: string;
  clinicalIndication?: string;
  clinicalNotes?: string;
  contrastRequired: boolean;
  price: number;
  paymentStatus: 'paid' | 'pending' | 'insurance_covered';
  status: RadiologyOrderStatus;
  checkInStatus: RadiologyCheckInStatus;
  safetyChecklist: RadiologySafetyChecklist;
  contrastRecord?: ContrastAdministrationRecord;
  technicianName?: string;
  technicianAt?: string;
  studyUid?: string;
  seriesCount?: number;
  imageCount?: number;
  radiologistName?: string;
  radiologistAt?: string;
  clinicalHistory?: string;
  technique?: string;
  findingsText?: string;
  impressionText?: string;
  recommendations?: string;
  reportStatus: RadiologyReportStatus;
  isCriticalFinding: boolean;
  criticalFindingRemarks?: string;
  version: number;
  amendmentReason?: string;
  amendedBy?: string;
  amendedAt?: string;
}

export interface RadiologyCriticalAlert {
  id: string;
  orderId: string;
  accessionNumber: string;
  patientId: string;
  patientName: string;
  bedNumber?: string;
  ward?: string;
  doctorName: string;
  examName: string;
  modalityType: RadiologyModalityType;
  findingDescription: string;
  detectedAt: string;
  status: 'new' | 'notified' | 'acknowledged';
  notifiedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface RadiologyReportTemplate {
  id: string;
  templateName: string;
  modalityType: RadiologyModalityType;
  bodyPart: string;
  defaultTechnique: string;
  defaultFindings: string;
  defaultImpression: string;
  defaultRecommendations?: string;
}

export interface RadiologyDashboardKPIs {
  totalOrdersToday: number;
  pendingOrders: number;
  scheduledExaminations: number;
  preparationPending: number;
  patientsWaiting: number;
  examinationsInProgress: number;
  completedExaminations: number;
  reportsPending: number;
  reportsVerified: number;
  criticalReportsCount: number;
  cancelledExaminationsCount: number;
}

// ==========================================
// PHARMACY & MEDICATION MANAGEMENT
// ==========================================

export type MedicineCategory =
  | 'antibiotics'
  | 'analgesics'
  | 'cardiovascular'
  | 'antidiabetics'
  | 'gastrointestinal'
  | 'respiratory'
  | 'dermatology'
  | 'neurology'
  | 'vitamins'
  | 'iv_fluids'
  | 'other';

export type DosageForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'suspension'
  | 'injection'
  | 'cream'
  | 'ointment'
  | 'gel'
  | 'drops'
  | 'inhaler'
  | 'powder'
  | 'iv_infusion'
  | 'other';

export type MedicineClassification =
  | 'normal'
  | 'prescription_required'
  | 'schedule_h'
  | 'schedule_h1'
  | 'narcotic_controlled';

export type BatchStatus =
  | 'available'
  | 'low_stock'
  | 'expiring_soon'
  | 'expired'
  | 'blocked'
  | 'recalled';

export type DispensingStatus =
  | 'pending'
  | 'partially_dispensed'
  | 'dispensed'
  | 'on_hold'
  | 'cancelled';

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'ordered'
  | 'partially_received'
  | 'fully_received'
  | 'cancelled';

export type StockMovementType =
  | 'stock_in'
  | 'dispense'
  | 'sale'
  | 'patient_return'
  | 'supplier_return'
  | 'adjustment'
  | 'transfer'
  | 'disposal'
  | 'recall';

export interface ComprehensiveMedicineItem {
  id: string;
  medicineCode: string;
  brandName: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: DosageForm;
  strength: string;
  unit: string;
  manufacturer: string;
  packSize: number;
  hsnCode?: string;
  gstRate: number; // e.g. 5, 12, 18%
  purchasePrice: number;
  sellingPrice: number; // MRP per unit
  reorderLevel: number;
  maxStockLevel: number;
  classification: MedicineClassification;
  prescriptionRequired: boolean;
  totalStock: number;
  isActive: boolean;
  storageLocation?: string;
}

export interface MedicineBatchItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceNo?: string;
  receivedDate: string;
  status: BatchStatus;
}

export interface StockMovementRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number; // positive for addition, negative for deduction
  previousStock: number;
  newStock: number;
  movementType: StockMovementType;
  referenceId?: string; // Prescription ID, Invoice ID, Return ID
  performedBy: string;
  performedAt: string;
  remarks?: string;
}

export interface PharmacySupplierItem {
  id: string;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  drugLicenseNo?: string;
  paymentTerms: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalAmount: number;
  }[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  createdBy: string;
  approvedBy?: string;
}

export interface ComprehensivePrescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  encounterType: 'opd' | 'ipd' | 'emergency';
  admissionId?: string;
  bedNumber?: string;
  ward?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  date: string;
  priority: 'routine' | 'urgent' | 'stat';
  medicines: {
    id: string;
    medicineId: string;
    medicineName: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    prescribedQty: number;
    dispensedQty: number;
    instructions?: string;
  }[];
  dispensingStatus: DispensingStatus;
  paymentStatus: 'paid' | 'pending' | 'credit';
  dispensedAt?: string;
  dispensedBy?: string;
}

export interface PharmacySaleRecord {
  id: string;
  saleNumber: string;
  patientId?: string;
  patientName?: string;
  prescriptionId?: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance';
  paymentStatus: 'paid' | 'pending';
  saleDate: string;
  pharmacistName: string;
}

export interface MedicineReturnRecord {
  id: string;
  returnNumber: string;
  returnType: 'patient' | 'supplier';
  patientId?: string;
  patientName?: string;
  supplierId?: string;
  supplierName?: string;
  referenceSaleOrInvoiceId?: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
    returnCondition: 'sealed_good' | 'damaged' | 'expired';
    returnReason: string;
  }[];
  totalRefundAmount: number;
  returnDate: string;
  processedBy: string;
  status: 'approved' | 'completed' | 'rejected';
}

export interface PharmacyDashboardKPIs {
  totalPrescriptionsToday: number;
  pendingPrescriptions: number;
  dispensedPrescriptions: number;
  pendingDispensing: number;
  totalMedicines: number;
  lowStockMedicines: number;
  outOfStockMedicines: number;
  nearExpiryMedicines: number;
  expiredMedicines: number;
  todaySalesAmount: number;
  pendingPurchaseOrders: number;
  totalReturnsCount: number;
}

// ==========================================
// CENTRAL BILLING & PAYMENT MANAGEMENT
// ==========================================

export type BillingDepartment =
  | 'opd'
  | 'ipd'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'emergency'
  | 'nursing'
  | 'diet'
  | 'surgery'
  | 'ambulance'
  | 'other';

export type InvoiceStatus =
  | 'draft'
  | 'generated'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

export type PaymentTender =
  | 'cash'
  | 'card'
  | 'upi'
  | 'net_banking'
  | 'cheque'
  | 'insurance'
  | 'tpa'
  | 'corporate';

export type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded';

export type RefundStatus = 'requested' | 'approved' | 'processed' | 'rejected';

export type CentralClaimStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'settled';

export interface DepartmentChargeItem {
  id: string;
  patientId: string;
  encounterId?: string;
  department: BillingDepartment;
  sourceModule: string; // 'opd' | 'ipd' | 'lab' | 'radiology' | 'pharmacy' | 'nursing' | 'diet' | 'emergency'
  sourceRecordId: string; // Lab Order ID, Accession Number, Prescription ID, Admission ID
  serviceCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number; // GST rate e.g. 0, 5, 12, 18%
  totalAmount: number;
  chargeDate: string;
  createdBy: string;
  isBilled: boolean;
  invoiceId?: string;
}

export interface CentralInvoiceItem {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  uhid: string;
  encounterType: 'opd' | 'ipd' | 'emergency';
  admissionId?: string;
  bedNumber?: string;
  ward?: string;
  doctorName?: string;
  department: string;
  invoiceDate: string;
  dueDate: string;
  items: DepartmentChargeItem[];
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  insuranceAmount: number;
  advanceAdjusted: number;
  netPayable: number;
  paidAmount: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  createdBy: string;
}

export interface BillingPaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: PaymentTender;
  transactionRef?: string;
  paymentDate: string;
  receivedBy: string;
  status: PaymentStatus;
  counterName?: string;
}

export interface PatientAdvanceRecord {
  id: string;
  advanceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: PaymentTender;
  reference?: string;
  date: string;
  receivedBy: string;
  status: 'available' | 'utilized' | 'refunded';
  utilizedInvoiceId?: string;
}

export interface BillingRefundRecord {
  id: string;
  refundNumber: string;
  invoiceId: string;
  paymentId?: string;
  patientId: string;
  patientName: string;
  amount: number;
  reason: string;
  refundMethod: PaymentTender;
  requestedBy: string;
  approvedBy: string;
  processedAt: string;
  status: RefundStatus;
}

export interface CentralInsuranceClaimRecord {
  id: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  invoiceId: string;
  insuranceProvider: string;
  policyNumber: string;
  tpaName?: string;
  claimAmount: number;
  approvedAmount: number;
  coPayAmount: number;
  status: CentralClaimStatus;
  submittedDate: string;
  settledDate?: string;
}

export interface CashCounterSession {
  id: string;
  counterName: string;
  cashierName: string;
  openingCash: number;
  cashCollected: number;
  cardCollected: number;
  upiCollected: number;
  refundsDisbursed: number;
  expectedCash: number;
  actualCash: number;
  variance: number;
  openedAt: string;
  closedAt?: string;
  status: 'open' | 'closed';
}

export interface BillingServiceItem {
  id: string;
  serviceCode: string;
  serviceName: string;
  department: BillingDepartment;
  category: string;
  basePrice: number;
  gstRate: number;
  hsnCode?: string;
  discountAllowed: boolean;
  insuranceEligible: boolean;
  isActive: boolean;
}

export interface PatientFinancialAccount {
  patientId: string;
  patientName: string;
  uhid: string;
  phone?: string;
  totalBilled: number;
  totalPaid: number;
  totalDiscount: number;
  totalAdvance: number;
  totalRefund: number;
  totalInsurance: number;
  netOutstanding: number;
  invoicesCount: number;
}

export interface CentralBillingKPIs {
  todayTotalRevenue: number;
  todayCollections: number;
  todayPendingDues: number;
  totalOutstanding: number;
  opdRevenue: number;
  ipdRevenue: number;
  labRevenue: number;
  radRevenue: number;
  pharmacyRevenue: number;
  otherRevenue: number;
  refundsToday: number;
  insuranceClaimsAmount: number;
  cashCollection: number;
  cardCollection: number;
  upiCollection: number;
  totalInvoicesToday: number;
  paidInvoicesCount: number;
  unpaidInvoicesCount: number;
}








