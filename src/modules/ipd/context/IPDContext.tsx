import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Bed,
  Ward,
  Admission,
  Patient,
  Doctor,
  Department,
  BedStatus,
  BedType,
  AdmissionStatus,
  AdmissionType,
  DischargeType,
  InpatientStatus,
  BedTransferRecord,
  IPDDoctorRound,
  IPDNursingNote,
  IPDNursingTask,
  IPDVitalReading,
  InpatientMedication,
  MedicationAdministrationRecord,
  IPDProcedure,
  IPDDischargeRecord,
  IPDBill,
  InsuranceClaimRecord,
  IPDDashboardKPIs,
  LabRequest,
  RadiologyStudy,
  PaymentMode,
  Vitals,
} from '../../../types';
import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_DEPARTMENTS,
  DEMO_WARDS,
  DEMO_BEDS,
  DEMO_ADMISSIONS,
  DEMO_LAB_REQUESTS,
  DEMO_RADIOLOGY_STUDIES,
  DEMO_BILLS,
} from '../../../data/seedData';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export type IPDTab =
  | 'dashboard'
  | 'admission'
  | 'inpatients'
  | 'bed_management'
  | 'bed_allocation'
  | 'transfers'
  | 'wards'
  | 'rooms'
  | 'discharge'
  | 'history'
  | 'billing'
  | 'reports'
  | 'settings'
  | 'bed_board'
  | 'inpatient_profile'
  | 'nursing'
  | 'doctor_rounds'
  | 'medications'
  | 'analytics';

export interface IPDContextType {
  // Navigation
  activeTab: IPDTab;
  setActiveTab: (tab: IPDTab) => void;

  // Master Data
  admissions: Admission[];
  beds: Bed[];
  wards: Ward[];
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  transfers: BedTransferRecord[];
  doctorRounds: IPDDoctorRound[];
  nursingNotes: IPDNursingNote[];
  nursingTasks: IPDNursingTask[];
  vitalsHistory: Record<string, IPDVitalReading[]>;
  inpatientMedications: InpatientMedication[];
  medicationAdministrations: MedicationAdministrationRecord[];
  procedures: IPDProcedure[];
  dischargeRecords: IPDDischargeRecord[];
  ipdBills: IPDBill[];
  insuranceClaims: InsuranceClaimRecord[];
  labRequests: LabRequest[];
  radiologyOrders: RadiologyStudy[];

  // Selected State
  selectedAdmissionId: string | null;
  setSelectedAdmissionId: (id: string | null) => void;
  selectedAdmission: Admission | null;
  selectedBedId: string | null;
  setSelectedBedId: (id: string | null) => void;

  // Computed KPIs
  kpis: IPDDashboardKPIs;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  admitPatient: (data: {
    patientId: string;
    bedId: string;
    admittingDoctorId: string;
    admissionType: AdmissionType;
    admissionDate: string;
    admissionTime: string;
    diagnosis: string[];
    admissionNotes: string;
    attendantName?: string;
    attendantPhone?: string;
    attendantRelation?: string;
    referredBy?: string;
    mlc?: boolean;
    insuranceProvider?: string;
    policyNumber?: string;
    tpaName?: string;
  }) => Admission;

  admitEmergencyPatient: (data: {
    patientName: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    phone?: string;
    bedId: string;
    admittingDoctorId: string;
    emergencyDiagnosis: string;
    admissionNotes: string;
    attendantName?: string;
    attendantPhone?: string;
    mlc?: boolean;
  }) => Admission;

  transferPatient: (data: {
    admissionId: string;
    toBedId: string;
    reason: string;
    requestedBy: string;
    approvedBy?: string;
  }) => BedTransferRecord;

  updateBedStatus: (bedId: string, status: BedStatus) => void;

  markBedCleaned: (bedId: string) => void;

  recordDoctorRound: (data: {
    admissionId: string;
    doctorId: string;
    progressNotes: string;
    clinicalFindings: string;
    diagnosisUpdates?: string[];
    treatmentPlan: string;
    condition: 'stable' | 'improving' | 'critical' | 'deteriorating';
    vitals?: Vitals;
    medicationChanges?: string;
    investigationOrders?: string;
    procedureOrders?: string;
    followUpInstructions?: string;
  }) => IPDDoctorRound;

  recordNursingVitals: (admissionId: string, vitals: {
    bloodPressure: string;
    pulse: number;
    temperature: number;
    spo2: number;
    respiratoryRate: number;
    bloodSugar?: number;
    painScore?: number;
    weight?: number;
    height?: number;
    notes?: string;
  }) => IPDVitalReading;

  recordNursingNote: (noteData: Partial<IPDNursingNote>) => IPDNursingNote;

  createNursingTask: (taskData: Partial<IPDNursingTask>) => IPDNursingTask;

  completeNursingTask: (taskId: string) => void;

  addInpatientMedication: (medData: Partial<InpatientMedication>) => InpatientMedication;

  administerMedication: (data: {
    medicationId: string;
    admissionId: string;
    status: 'administered' | 'missed' | 'held' | 'cancelled';
    remarks?: string;
  }) => MedicationAdministrationRecord;

  recordProcedure: (procData: Partial<IPDProcedure>) => IPDProcedure;

  orderIPDLab: (labData: any) => LabRequest;

  orderIPDRadiology: (radData: any) => RadiologyStudy;

  processDischarge: (dischargeData: {
    admissionId: string;
    dischargeDate: string;
    dischargeTime: string;
    dischargeType: DischargeType;
    finalDiagnosis: string[];
    clinicalSummary: string;
    hospitalCourse: string;
    treatmentGiven: string;
    conditionAtDischarge: 'cured' | 'improved' | 'stable' | 'relieved' | 'critical' | 'expired';
    dischargeMedications: {
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    followUpDate: string;
    followUpDoctor: string;
    followUpInstructions: string;
  }) => IPDDischargeRecord;

  generateIPDBill: (billData: Partial<IPDBill>) => IPDBill;

  recordIPDPayment: (billId: string, amount: number, mode: PaymentMode, ref?: string) => void;

  processInsuranceClaim: (claimData: Partial<InsuranceClaimRecord>) => InsuranceClaimRecord;
}

const IPDContext = createContext<IPDContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADMISSIONS: 'aln_hms_ipd_admissions_v2',
  BEDS: 'aln_hms_ipd_beds_v2',
  WARDS: 'aln_hms_ipd_wards_v2',
  TRANSFERS: 'aln_hms_ipd_transfers_v2',
  ROUNDS: 'aln_hms_ipd_rounds_v2',
  NURSING_NOTES: 'aln_hms_ipd_nursing_notes_v2',
  NURSING_TASKS: 'aln_hms_ipd_nursing_tasks_v2',
  VITALS: 'aln_hms_ipd_vitals_v2',
  MEDICATIONS: 'aln_hms_ipd_meds_v2',
  MAR: 'aln_hms_ipd_mar_v2',
  PROCEDURES: 'aln_hms_ipd_procedures_v2',
  DISCHARGES: 'aln_hms_ipd_discharges_v2',
  BILLS: 'aln_hms_ipd_bills_v2',
  CLAIMS: 'aln_hms_ipd_claims_v2',
};

// Initial Detailed Inpatient Beds Hierarchy
const INITIAL_DETAILED_BEDS: Bed[] = [
  // Building A — Ground Floor — Emergency Ward
  { id: 'bed-em-01', bedNumber: 'EM-01', ward: 'Emergency Ward', wardId: 'w-008', building: 'Building A', roomNumber: 'ER-101', floor: 0, type: 'emergency', status: 'occupied', currentPatientId: 'ALN-2026-00007', currentPatientName: 'Deepak Mehta', currentAdmissionId: 'adm-004', admittingDoctorName: 'Dr. Rajesh Kumar', admissionDate: '2026-08-31', dailyRate: 1500, features: ['Emergency Crash Cart', 'Multi-para Monitor', 'Oxygen Supply', 'Defibrillator'] },
  { id: 'bed-em-02', bedNumber: 'EM-02', ward: 'Emergency Ward', wardId: 'w-008', building: 'Building A', roomNumber: 'ER-101', floor: 0, type: 'emergency', status: 'available', dailyRate: 1500, features: ['Multi-para Monitor', 'Oxygen Supply'] },
  { id: 'bed-em-03', bedNumber: 'EM-03', ward: 'Emergency Ward', wardId: 'w-008', building: 'Building A', roomNumber: 'ER-102', floor: 0, type: 'emergency', status: 'cleaning', dailyRate: 1500, features: ['Oxygen Supply', 'Suction Unit'] },
  { id: 'bed-em-04', bedNumber: 'EM-04', ward: 'Emergency Ward', wardId: 'w-008', building: 'Building A', roomNumber: 'ER-102', floor: 0, type: 'emergency', status: 'available', dailyRate: 1500, features: ['Multi-para Monitor', 'Oxygen Supply'] },

  // Building A — 1st Floor — General Ward A
  { id: 'bed-001', bedNumber: 'GA-01', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-101', floor: 1, type: 'general', status: 'occupied', currentPatientId: 'ALN-2026-00001', currentPatientName: 'Ramesh Yadav', currentAdmissionId: 'adm-001', admittingDoctorName: 'Dr. Rajesh Kumar', admissionDate: '2026-08-28', dailyRate: 800, features: ['Central Oxygen', 'Nurse Call Bell', 'Bedside Locker'] },
  { id: 'bed-002', bedNumber: 'GA-02', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-101', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['Nurse Call Bell', 'Bedside Locker'] },
  { id: 'bed-003', bedNumber: 'GA-03', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-102', floor: 1, type: 'general', status: 'occupied', currentPatientId: 'ALN-2026-00003', currentPatientName: 'Vijay Malhotra', currentAdmissionId: 'adm-002', admittingDoctorName: 'Dr. Amit Singh', admissionDate: '2026-08-29', dailyRate: 800, features: ['Nurse Call Bell', 'Bedside Locker'] },
  { id: 'bed-004', bedNumber: 'GA-04', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-102', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['Nurse Call Bell', 'Bedside Locker'] },
  { id: 'bed-005', bedNumber: 'GA-05', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-103', floor: 1, type: 'general', status: 'maintenance', dailyRate: 800, features: ['Undergoing Electrical Repairs'] },
  { id: 'bed-006', bedNumber: 'GA-06', ward: 'General Ward A', wardId: 'w-001', building: 'Building A', roomNumber: 'GW-103', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['Nurse Call Bell', 'Bedside Locker'] },

  // Building A — 1st Floor — General Ward B
  { id: 'bed-gb-01', bedNumber: 'GB-01', ward: 'General Ward B', wardId: 'w-002', building: 'Building A', roomNumber: 'GW-104', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['Central Oxygen', 'Nurse Call Bell'] },
  { id: 'bed-gb-02', bedNumber: 'GB-02', ward: 'General Ward B', wardId: 'w-002', building: 'Building A', roomNumber: 'GW-104', floor: 1, type: 'general', status: 'occupied', currentPatientId: 'ALN-2026-00005', currentPatientName: 'Mohan Das', currentAdmissionId: 'adm-005', admittingDoctorName: 'Dr. Sneha Patel', admissionDate: '2026-08-30', dailyRate: 800, features: ['Central Oxygen', 'Nurse Call Bell'] },
  { id: 'bed-gb-03', bedNumber: 'GB-03', ward: 'General Ward B', wardId: 'w-002', building: 'Building A', roomNumber: 'GW-105', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['Nurse Call Bell'] },
  { id: 'bed-gb-04', bedNumber: 'GB-04', ward: 'General Ward B', wardId: 'w-002', building: 'Building A', roomNumber: 'GW-105', floor: 1, type: 'general', status: 'cleaning', dailyRate: 800, features: ['Disinfected — Ready for Bedmaking'] },

  // Building A — 2nd Floor — Private & Semi-Private Wards
  { id: 'bed-010', bedNumber: 'PR-01', ward: 'Private Ward', wardId: 'w-003', building: 'Building A', roomNumber: 'PVT-201', floor: 2, type: 'private', status: 'occupied', currentPatientId: 'ALN-2026-00002', currentPatientName: 'Lakshmi Krishnan', currentAdmissionId: 'adm-003', admittingDoctorName: 'Dr. Sneha Patel', admissionDate: '2026-08-29', dailyRate: 3500, features: ['Smart TV', 'Air Conditioned', 'Attendant Recliner', 'Mini Refrigerator', 'Ensuite Bathroom', 'High-Speed WiFi'] },
  { id: 'bed-011', bedNumber: 'PR-02', ward: 'Private Ward', wardId: 'w-003', building: 'Building A', roomNumber: 'PVT-202', floor: 2, type: 'private', status: 'available', dailyRate: 3500, features: ['Smart TV', 'Air Conditioned', 'Attendant Recliner', 'Ensuite Bathroom', 'High-Speed WiFi'] },
  { id: 'bed-012', bedNumber: 'PR-03', ward: 'Private Ward', wardId: 'w-003', building: 'Building A', roomNumber: 'PVT-203', floor: 2, type: 'private', status: 'reserved', dailyRate: 3500, features: ['Smart TV', 'Air Conditioned', 'Attendant Recliner', 'Ensuite Bathroom'] },
  { id: 'bed-sp-01', bedNumber: 'SP-01', ward: 'Semi-Private Ward', wardId: 'w-004', building: 'Building A', roomNumber: 'SP-204', floor: 2, type: 'semi_private', status: 'available', dailyRate: 1800, features: ['Air Conditioned', 'Privacy Curtain', 'Attached Bath'] },
  { id: 'bed-sp-02', bedNumber: 'SP-02', ward: 'Semi-Private Ward', wardId: 'w-004', building: 'Building A', roomNumber: 'SP-204', floor: 2, type: 'semi_private', status: 'occupied', currentPatientId: 'ALN-2026-00008', currentPatientName: 'Sunita Agarwal', currentAdmissionId: 'adm-006', admittingDoctorName: 'Dr. Amit Singh', admissionDate: '2026-08-30', dailyRate: 1800, features: ['Air Conditioned', 'Privacy Curtain', 'Attached Bath'] },

  // Building B — 3rd Floor — Intensive Care Unit (ICU & HDU)
  { id: 'bed-020', bedNumber: 'MICU-01', ward: 'Medical ICU', wardId: 'w-005', building: 'Building B', roomNumber: 'ICU-301', floor: 3, type: 'icu', status: 'occupied', currentPatientId: 'ALN-2026-00004', currentPatientName: 'Priya Sharma', currentAdmissionId: 'adm-007', admittingDoctorName: 'Dr. Rajesh Kumar', admissionDate: '2026-08-31', dailyRate: 8500, features: ['Invasive Mechanical Ventilator', 'Arterial Line Monitor', 'Central Line Monitoring', 'Syringe Infusion Pumps (x4)', 'Defibrillator'] },
  { id: 'bed-021', bedNumber: 'MICU-02', ward: 'Medical ICU', wardId: 'w-005', building: 'Building B', roomNumber: 'ICU-302', floor: 3, type: 'icu', status: 'available', dailyRate: 8500, features: ['Mechanical Ventilator', 'Multi-channel Monitor', 'Dialysis Port'] },
  { id: 'bed-022', bedNumber: 'MICU-03', ward: 'Medical ICU', wardId: 'w-005', building: 'Building B', roomNumber: 'ICU-303', floor: 3, type: 'icu', status: 'available', dailyRate: 8500, features: ['Mechanical Ventilator', 'Multi-channel Monitor', 'Oxygen Unit'] },
  { id: 'bed-hdu-01', bedNumber: 'HDU-01', ward: 'Medical ICU', wardId: 'w-005', building: 'Building B', roomNumber: 'HDU-304', floor: 3, type: 'hdu', status: 'available', dailyRate: 5000, features: ['BiPAP Support', 'Multi-para Monitor', 'Central Monitoring Station'] },
];

const INITIAL_TRANSFERS: BedTransferRecord[] = [
  {
    id: 'trf-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    fromWard: 'Emergency Ward',
    fromRoom: 'ER-101',
    fromBedId: 'bed-em-01',
    fromBedNumber: 'EM-01',
    toWard: 'General Ward A',
    toRoom: 'GW-101',
    toBedId: 'bed-001',
    toBedNumber: 'GA-01',
    reason: 'Hemodynamically stable post stabilization in Emergency',
    requestedBy: 'Dr. Emergency Incharge',
    approvedBy: 'Dr. Rajesh Kumar',
    transferDate: '2026-08-28',
    transferTime: '14:30',
    status: 'completed',
    createdAt: '2026-08-28T14:30:00',
  },
];

const INITIAL_ROUNDS: IPDDoctorRound[] = [
  {
    id: 'rnd-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    department: 'Cardiology',
    roundDate: '2026-08-31',
    roundTime: '09:00',
    progressNotes: 'Patient is comfortable. Chest discomfort subsided. S1 S2 normal, no murmurs. B/L chest clear. Stable vitals.',
    clinicalFindings: 'No peripheral edema, jugular venous pressure normal, pulse regular.',
    diagnosisUpdates: ['Unstable Angina (Resolved)', 'Essential Hypertension'],
    treatmentPlan: 'Continue Dual Antiplatelet Therapy (DAPT), Statin, and ACE-I. Plan for discharge in 24 hours if repeat troponin remains negative.',
    condition: 'improving',
    vitals: { bloodPressure: '124/82', pulse: 72, temperature: 98.4, spo2: 98, respiratoryRate: 16 },
    createdAt: '2026-08-31T09:15:00',
  },
  {
    id: 'rnd-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sneha Patel',
    department: 'General Medicine',
    roundDate: '2026-08-31',
    roundTime: '09:45',
    progressNotes: 'Fever defervescing on IV Ceftriaxone. Appetite improving. Bowel habits normal.',
    clinicalFindings: 'P/A soft, mild epigastric tenderness, no organomegaly.',
    treatmentPlan: 'Continue IV Antibiotics for 48 hours more. Switch to oral Cefixime once afebrile for 24h.',
    condition: 'improving',
    vitals: { bloodPressure: '116/74', pulse: 80, temperature: 99.2, spo2: 99, respiratoryRate: 18 },
    createdAt: '2026-08-31T10:00:00',
  },
];

const INITIAL_NURSING_TASKS: IPDNursingTask[] = [
  {
    id: 'ntk-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    taskType: 'medication_due',
    title: 'Administer Atorvastatin 40mg + Aspirin 75mg',
    dueTime: '14:00',
    priority: 'routine',
    status: 'pending',
    assignedNurse: 'Nurse Kavitha',
  },
  {
    id: 'ntk-002',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'EM-01',
    taskType: 'vitals_due',
    title: 'Hourly ICU Vitals & Arterial Line Check',
    dueTime: '13:00',
    priority: 'stat',
    status: 'pending',
    assignedNurse: 'ICU Nurse Rekha',
  },
  {
    id: 'ntk-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    bedNumber: 'PR-01',
    taskType: 'investigation_pending',
    title: 'Collect post-antibiotic Repeat CBC Sample',
    dueTime: '16:00',
    priority: 'urgent',
    status: 'pending',
    assignedNurse: 'Nurse Suman',
  },
];

const INITIAL_MEDICATIONS: InpatientMedication[] = [
  {
    id: 'in-med-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    medicineName: 'Inj. Enoxaparin 60mg',
    strength: '60mg / 0.6ml',
    route: 'SC',
    dose: '0.6 ml',
    frequency: 'Twice Daily (BD)',
    startDate: '2026-08-28',
    endDate: '2026-09-01',
    instructions: 'Subcutaneous injection into anterior abdominal wall',
    prescribingDoctor: 'Dr. Rajesh Kumar',
    status: 'active',
  },
  {
    id: 'in-med-002',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    medicineName: 'Tab. Atorvastatin 40mg',
    strength: '40mg',
    route: 'Oral',
    dose: '1 Tablet',
    frequency: 'Once Daily at Bedtime (HS)',
    startDate: '2026-08-28',
    instructions: 'Take after dinner',
    prescribingDoctor: 'Dr. Rajesh Kumar',
    status: 'active',
  },
  {
    id: 'in-med-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    medicineName: 'Inj. Ceftriaxone 1g',
    strength: '1000mg',
    route: 'IV',
    dose: '1 Vial in 100ml NS',
    frequency: 'Twice Daily (BD)',
    startDate: '2026-08-29',
    endDate: '2026-09-03',
    instructions: 'Slow IV infusion over 30 minutes',
    prescribingDoctor: 'Dr. Sneha Patel',
    status: 'active',
  },
];

const INITIAL_VITALS_MAP: Record<string, IPDVitalReading[]> = {
  'adm-001': [
    {
      id: 'vr-001',
      admissionId: 'adm-001',
      patientId: 'ALN-2026-00001',
      recordedAt: '2026-08-31 08:00',
      bloodPressure: '128/84',
      pulse: 74,
      temperature: 98.4,
      spo2: 98,
      respiratoryRate: 16,
      bloodSugar: 118,
      painScore: 1,
      weight: 76,
      height: 172,
      bmi: 25.7,
      recordedBy: 'Nurse Kavitha',
    },
    {
      id: 'vr-002',
      admissionId: 'adm-001',
      patientId: 'ALN-2026-00001',
      recordedAt: '2026-08-30 20:00',
      bloodPressure: '132/86',
      pulse: 78,
      temperature: 98.6,
      spo2: 97,
      respiratoryRate: 18,
      bloodSugar: 142,
      painScore: 2,
      recordedBy: 'Nurse Suman',
    },
  ],
  'adm-003': [
    {
      id: 'vr-003',
      admissionId: 'adm-003',
      patientId: 'ALN-2026-00002',
      recordedAt: '2026-08-31 08:30',
      bloodPressure: '116/74',
      pulse: 82,
      temperature: 99.4,
      spo2: 99,
      respiratoryRate: 18,
      bloodSugar: 98,
      painScore: 3,
      recordedBy: 'Nurse Rekha',
    },
  ],
};

export function IPDProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<IPDTab>('dashboard');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>('adm-001');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admissions
  const [admissions, setAdmissions] = useState<Admission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMISSIONS);
      return saved ? JSON.parse(saved) : DEMO_ADMISSIONS;
    } catch {
      return DEMO_ADMISSIONS;
    }
  });

  // Beds
  const [beds, setBeds] = useState<Bed[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEDS);
      return saved ? JSON.parse(saved) : INITIAL_DETAILED_BEDS;
    } catch {
      return INITIAL_DETAILED_BEDS;
    }
  });

  // Wards
  const [wards, setWards] = useState<Ward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WARDS);
      return saved ? JSON.parse(saved) : DEMO_WARDS;
    } catch {
      return DEMO_WARDS;
    }
  });

  // Transfers
  const [transfers, setTransfers] = useState<BedTransferRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  });

  // Doctor Rounds
  const [doctorRounds, setDoctorRounds] = useState<IPDDoctorRound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUNDS);
      return saved ? JSON.parse(saved) : INITIAL_ROUNDS;
    } catch {
      return INITIAL_ROUNDS;
    }
  });

  // Nursing Notes
  const [nursingNotes, setNursingNotes] = useState<IPDNursingNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NURSING_NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Nursing Tasks
  const [nursingTasks, setNursingTasks] = useState<IPDNursingTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NURSING_TASKS);
      return saved ? JSON.parse(saved) : INITIAL_NURSING_TASKS;
    } catch {
      return INITIAL_NURSING_TASKS;
    }
  });

  // Vitals
  const [vitalsHistory, setVitalsHistory] = useState<Record<string, IPDVitalReading[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VITALS);
      return saved ? JSON.parse(saved) : INITIAL_VITALS_MAP;
    } catch {
      return INITIAL_VITALS_MAP;
    }
  });

  // Inpatient Medications
  const [inpatientMedications, setInpatientMedications] = useState<InpatientMedication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
    } catch {
      return INITIAL_MEDICATIONS;
    }
  });

  // MAR
  const [medicationAdministrations, setMedicationAdministrations] = useState<MedicationAdministrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAR);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Procedures
  const [procedures, setProcedures] = useState<IPDProcedure[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Discharges
  const [dischargeRecords, setDischargeRecords] = useState<IPDDischargeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCHARGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // IPD Bills
  const [ipdBills, setIpdBills] = useState<IPDBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Insurance Claims
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaimRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [labRequests, setLabRequests] = useState<LabRequest[]>(DEMO_LAB_REQUESTS);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyStudy[]>(DEMO_RADIOLOGY_STUDIES);

  // Persistence Effects
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ADMISSIONS, JSON.stringify(admissions)); } catch (e) { console.warn(e); }
  }, [admissions]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds)); } catch (e) { console.warn(e); }
  }, [beds]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers)); } catch (e) { console.warn(e); }
  }, [transfers]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(doctorRounds)); } catch (e) { console.warn(e); }
  }, [doctorRounds]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NURSING_TASKS, JSON.stringify(nursingTasks)); } catch (e) { console.warn(e); }
  }, [nursingTasks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitalsHistory)); } catch (e) { console.warn(e); }
  }, [vitalsHistory]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(inpatientMedications)); } catch (e) { console.warn(e); }
  }, [inpatientMedications]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.DISCHARGES, JSON.stringify(dischargeRecords)); } catch (e) { console.warn(e); }
  }, [dischargeRecords]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(ipdBills)); } catch (e) { console.warn(e); }
  }, [ipdBills]);

  // Selected Admission helper
  const selectedAdmission = useMemo(() => {
    if (!selectedAdmissionId) return null;
    return admissions.find(a => a.id === selectedAdmissionId) || null;
  }, [admissions, selectedAdmissionId]);

  // Computed KPIs
  const kpis: IPDDashboardKPIs = useMemo(() => {
    const today = '2026-08-31';
    const activeAdmissions = admissions.filter(a => a.status === 'active');
    const totalInpatients = activeAdmissions.length;
    const todayAdmissions = admissions.filter(a => a.admissionDate === today).length;
    const todayDischarges = admissions.filter(a => a.dischargeDate === today).length;

    const availableBeds = beds.filter(b => b.status === 'available').length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const reservedBeds = beds.filter(b => b.status === 'reserved').length;
    const cleaningBeds = beds.filter(b => b.status === 'cleaning').length;
    const maintenanceBeds = beds.filter(b => b.status === 'maintenance').length;
    const blockedBeds = beds.filter(b => b.status === 'blocked').length;

    const totalOperationalBeds = beds.length;
    const bedOccupancyRate = totalOperationalBeds > 0 ? Math.round((occupiedBeds / totalOperationalBeds) * 100) : 0;

    const icuBeds = beds.filter(b => b.type === 'icu' || b.type === 'nicu' || b.type === 'picu');
    const icuOccupied = icuBeds.filter(b => b.status === 'occupied').length;
    const icuOccupancyRate = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

    const gwBeds = beds.filter(b => b.type === 'general');
    const gwOccupied = gwBeds.filter(b => b.status === 'occupied').length;
    const generalWardOccupancyRate = gwBeds.length > 0 ? Math.round((gwOccupied / gwBeds.length) * 100) : 0;

    const patientsAwaitingBed = 2; // Simulated triage queue
    const patientsAwaitingDischarge = activeAdmissions.filter(a => a.dischargeType === 'normal').length;
    const emergencyAdmissions = admissions.filter(a => a.referredBy === 'Emergency' || a.bedNumber?.startsWith('EM')).length;
    const highPriorityPatients = activeAdmissions.filter(a => a.ward.toLowerCase().includes('icu') || a.diagnosis.some(d => d.toLowerCase().includes('shock') || d.toLowerCase().includes('infarction'))).length;

    return {
      totalInpatients,
      todayAdmissions,
      todayDischarges,
      availableBeds,
      occupiedBeds,
      reservedBeds,
      cleaningBeds,
      maintenanceBeds,
      blockedBeds,
      totalOperationalBeds,
      bedOccupancyRate,
      icuOccupancyRate,
      generalWardOccupancyRate,
      patientsAwaitingBed,
      patientsAwaitingDischarge,
      emergencyAdmissions,
      highPriorityPatients,
    };
  }, [admissions, beds]);

  // ADMISSION WORKFLOW
  const admitPatient = useCallback((data: {
    patientId: string;
    bedId: string;
    admittingDoctorId: string;
    admissionType: AdmissionType;
    admissionDate: string;
    admissionTime: string;
    diagnosis: string[];
    admissionNotes: string;
    attendantName?: string;
    attendantPhone?: string;
    attendantRelation?: string;
    referredBy?: string;
    mlc?: boolean;
    insuranceProvider?: string;
    policyNumber?: string;
    tpaName?: string;
  }) => {
    // 1. Verify target bed availability
    const targetBed = beds.find(b => b.id === data.bedId);
    if (!targetBed) throw new Error('Bed not found');
    if (targetBed.status !== 'available') {
      toast.error('Bed Unavailable', `Bed ${targetBed.bedNumber} is currently ${targetBed.status.toUpperCase()}. Please select an available bed.`);
      throw new Error(`Bed ${targetBed.bedNumber} is not available.`);
    }

    const patient = DEMO_PATIENTS.find(p => p.id === data.patientId);
    const doctor = DEMO_DOCTORS.find(d => d.id === data.admittingDoctorId) || DEMO_DOCTORS[0];

    const nextAdmNum = admissions.length + 101;
    const newAdmissionId = `ADM-2026-${String(nextAdmNum).padStart(4, '0')}`;

    const newAdmission: Admission = {
      id: newAdmissionId,
      patientId: data.patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient',
      admittingDoctorId: doctor.id,
      admittingDoctorName: doctor.name,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      ward: targetBed.ward,
      admissionDate: data.admissionDate || '2026-08-31',
      admissionTime: data.admissionTime || '10:00',
      status: 'active',
      diagnosis: data.diagnosis && data.diagnosis.length > 0 ? data.diagnosis : ['Clinical Inpatient Evaluation'],
      admissionNotes: data.admissionNotes || 'Standard Inpatient Admission',
      attendantName: data.attendantName,
      attendantPhone: data.attendantPhone,
      attendantRelation: data.attendantRelation,
      referredBy: data.referredBy || 'Direct OPD',
      mlc: !!data.mlc,
      dailyNotes: [],
      createdAt: new Date().toISOString(),
    };

    // 2. Mark bed as OCCUPIED with patient details
    setBeds(prev => prev.map(b => b.id === targetBed.id ? {
      ...b,
      status: 'occupied',
      currentPatientId: data.patientId,
      currentPatientName: newAdmission.patientName,
      currentAdmissionId: newAdmission.id,
      admittingDoctorName: doctor.name,
      admissionDate: newAdmission.admissionDate,
    } : b));

    // 3. Add admission record
    setAdmissions(prev => [newAdmission, ...prev]);
    setSelectedAdmissionId(newAdmission.id);

    // 4. If insurance provided, create initial claim
    if (data.insuranceProvider) {
      const newClaim: InsuranceClaimRecord = {
        id: `clm-${Date.now().toString().slice(-4)}`,
        admissionId: newAdmission.id,
        patientId: data.patientId,
        insuranceProvider: data.insuranceProvider,
        policyNumber: data.policyNumber || 'POL-998822',
        memberId: data.patientId,
        tpaName: data.tpaName,
        preAuthAmount: 25000,
        claimedAmount: 0,
        approvedAmount: 25000,
        copayAmount: 0,
        deductibleAmount: 0,
        approvalStatus: 'approved',
        claimStatus: 'submitted',
      };
      setInsuranceClaims(prev => [newClaim, ...prev]);
    }

    toast.success('Inpatient Admitted Successfully', `Allocated ${targetBed.bedNumber} (${targetBed.ward}) for ${newAdmission.patientName}`);

    return newAdmission;
  }, [beds, admissions, toast]);

  // EMERGENCY ADMISSION WORKFLOW
  const admitEmergencyPatient = useCallback((data: {
    patientName: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    phone?: string;
    bedId: string;
    admittingDoctorId: string;
    emergencyDiagnosis: string;
    admissionNotes: string;
    attendantName?: string;
    attendantPhone?: string;
    mlc?: boolean;
  }) => {
    const targetBed = beds.find(b => b.id === data.bedId) || beds.find(b => b.type === 'emergency' && b.status === 'available') || beds[0];
    const doctor = DEMO_DOCTORS.find(d => d.id === data.admittingDoctorId) || DEMO_DOCTORS[0];

    const tempPatientId = `ALN-EM-${Date.now().toString().slice(-5)}`;
    const nextAdmNum = admissions.length + 101;
    const newAdmissionId = `ADM-EM-${String(nextAdmNum).padStart(4, '0')}`;

    const newAdmission: Admission = {
      id: newAdmissionId,
      patientId: tempPatientId,
      patientName: data.patientName || 'Emergency Patient',
      admittingDoctorId: doctor.id,
      admittingDoctorName: doctor.name,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      ward: targetBed.ward,
      admissionDate: '2026-08-31',
      admissionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'active',
      diagnosis: [data.emergencyDiagnosis || 'Acute Emergency Condition'],
      admissionNotes: data.admissionNotes || 'Emergency Triage Admission',
      attendantName: data.attendantName,
      attendantPhone: data.attendantPhone,
      referredBy: 'Emergency',
      mlc: data.mlc !== undefined ? data.mlc : true,
      dailyNotes: [],
      createdAt: new Date().toISOString(),
    };

    setBeds(prev => prev.map(b => b.id === targetBed.id ? {
      ...b,
      status: 'occupied',
      currentPatientId: tempPatientId,
      currentPatientName: newAdmission.patientName,
      currentAdmissionId: newAdmission.id,
      admittingDoctorName: doctor.name,
      admissionDate: newAdmission.admissionDate,
    } : b));

    setAdmissions(prev => [newAdmission, ...prev]);
    setSelectedAdmissionId(newAdmission.id);

    toast.warning('🚨 Emergency Inpatient Admitted', `Allocated ${targetBed.bedNumber} for ${newAdmission.patientName}`);

    return newAdmission;
  }, [beds, admissions, toast]);

  // BED TRANSFER WORKFLOW
  const transferPatient = useCallback((data: {
    admissionId: string;
    toBedId: string;
    reason: string;
    requestedBy: string;
    approvedBy?: string;
  }) => {
    const admission = admissions.find(a => a.id === data.admissionId);
    if (!admission) throw new Error('Admission record not found');

    const oldBed = beds.find(b => b.id === admission.bedId);
    const newBed = beds.find(b => b.id === data.toBedId);

    if (!newBed) throw new Error('Target bed not found');
    if (newBed.status !== 'available') {
      toast.error('Cannot Transfer', `Selected bed ${newBed.bedNumber} is currently ${newBed.status.toUpperCase()}.`);
      throw new Error(`Target bed ${newBed.bedNumber} is not available.`);
    }

    const transferRecord: BedTransferRecord = {
      id: `trf-${Date.now().toString().slice(-4)}`,
      admissionId: admission.id,
      patientId: admission.patientId,
      patientName: admission.patientName,
      fromWard: oldBed?.ward || admission.ward,
      fromRoom: oldBed?.roomNumber,
      fromBedId: oldBed?.id || admission.bedId,
      fromBedNumber: oldBed?.bedNumber || admission.bedNumber,
      toWard: newBed.ward,
      toRoom: newBed.roomNumber,
      toBedId: newBed.id,
      toBedNumber: newBed.bedNumber,
      reason: data.reason || 'Clinical Step-down / Room Upgrade',
      requestedBy: data.requestedBy || 'Attending Physician',
      approvedBy: data.approvedBy || authState.user?.name || 'Dr. Medical Superintendent',
      transferDate: '2026-08-31',
      transferTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // 1. Update Bed Statuses: Old bed becomes CLEANING, New bed becomes OCCUPIED
    setBeds(prev => prev.map(b => {
      if (b.id === oldBed?.id) {
        return {
          ...b,
          status: 'cleaning',
          currentPatientId: undefined,
          currentPatientName: undefined,
          currentAdmissionId: undefined,
          admittingDoctorName: undefined,
          admissionDate: undefined,
        };
      }
      if (b.id === newBed.id) {
        return {
          ...b,
          status: 'occupied',
          currentPatientId: admission.patientId,
          currentPatientName: admission.patientName,
          currentAdmissionId: admission.id,
          admittingDoctorName: admission.admittingDoctorName,
          admissionDate: admission.admissionDate,
        };
      }
      return b;
    }));

    // 2. Update Admission Record with new location
    setAdmissions(prev => prev.map(a => a.id === admission.id ? {
      ...a,
      bedId: newBed.id,
      bedNumber: newBed.bedNumber,
      ward: newBed.ward,
    } : a));

    // 3. Log Transfer Audit
    setTransfers(prev => [transferRecord, ...prev]);

    toast.success('Patient Transferred Successfully', `Moved ${admission.patientName} from ${transferRecord.fromBedNumber} to ${transferRecord.toBedNumber}. Old bed set to Cleaning.`);

    return transferRecord;
  }, [admissions, beds, authState.user, toast]);

  // BED STATUS MANAGEMENT
  const updateBedStatus = useCallback((bedId: string, status: BedStatus) => {
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status } : b));
    toast.info('Bed Status Updated', `Bed status changed to ${status.toUpperCase()}`);
  }, [toast]);

  // MARK BED CLEANED -> AVAILABLE
  const markBedCleaned = useCallback((bedId: string) => {
    setBeds(prev => prev.map(b => b.id === bedId ? {
      ...b,
      status: 'available',
      currentPatientId: undefined,
      currentPatientName: undefined,
      currentAdmissionId: undefined,
    } : b));
    toast.success('Bed Ready for Admission', 'Cleaning and sanitization verified. Bed is now AVAILABLE.');
  }, [toast]);

  // RECORD DOCTOR ROUND
  const recordDoctorRound = useCallback((data: {
    admissionId: string;
    doctorId: string;
    progressNotes: string;
    clinicalFindings: string;
    diagnosisUpdates?: string[];
    treatmentPlan: string;
    condition: 'stable' | 'improving' | 'critical' | 'deteriorating';
    vitals?: Vitals;
    medicationChanges?: string;
    investigationOrders?: string;
    procedureOrders?: string;
    followUpInstructions?: string;
  }) => {
    const admission = admissions.find(a => a.id === data.admissionId);
    const doctor = DEMO_DOCTORS.find(d => d.id === data.doctorId) || DEMO_DOCTORS[0];

    const newRound: IPDDoctorRound = {
      id: `rnd-${Date.now().toString().slice(-4)}`,
      admissionId: data.admissionId,
      patientId: admission?.patientId || '',
      patientName: admission?.patientName || '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      roundDate: '2026-08-31',
      roundTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      progressNotes: data.progressNotes,
      clinicalFindings: data.clinicalFindings,
      diagnosisUpdates: data.diagnosisUpdates,
      treatmentPlan: data.treatmentPlan,
      medicationChanges: data.medicationChanges,
      investigationOrders: data.investigationOrders,
      procedureOrders: data.procedureOrders,
      followUpInstructions: data.followUpInstructions,
      condition: data.condition,
      vitals: data.vitals,
      createdAt: new Date().toISOString(),
    };

    setDoctorRounds(prev => [newRound, ...prev]);

    // Update admission diagnosis if modified
    if (data.diagnosisUpdates && data.diagnosisUpdates.length > 0 && admission) {
      setAdmissions(prev => prev.map(a => a.id === admission.id ? {
        ...a,
        diagnosis: Array.from(new Set([...a.diagnosis, ...data.diagnosisUpdates!])),
      } : a));
    }

    toast.success('Doctor Round Recorded', `Clinical progress notes saved for ${admission?.patientName}`);

    return newRound;
  }, [admissions, toast]);

  // RECORD NURSING VITALS
  const recordNursingVitals = useCallback((admissionId: string, vitals: {
    bloodPressure: string;
    pulse: number;
    temperature: number;
    spo2: number;
    respiratoryRate: number;
    bloodSugar?: number;
    painScore?: number;
    weight?: number;
    height?: number;
    notes?: string;
  }) => {
    const admission = admissions.find(a => a.id === admissionId);
    const hM = (vitals.height || 170) / 100;
    const wKg = vitals.weight || 70;
    const bmi = hM > 0 && wKg > 0 ? parseFloat((wKg / (hM * hM)).toFixed(1)) : undefined;

    const newReading: IPDVitalReading = {
      id: `vr-${Date.now().toString().slice(-4)}`,
      admissionId,
      patientId: admission?.patientId || '',
      recordedAt: `2026-08-31 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      bloodPressure: vitals.bloodPressure,
      pulse: vitals.pulse,
      temperature: vitals.temperature,
      spo2: vitals.spo2,
      respiratoryRate: vitals.respiratoryRate,
      bloodSugar: vitals.bloodSugar,
      painScore: vitals.painScore,
      weight: vitals.weight,
      height: vitals.height,
      bmi,
      recordedBy: authState.user?.name || 'Staff Nurse',
      notes: vitals.notes,
    };

    setVitalsHistory(prev => ({
      ...prev,
      [admissionId]: [newReading, ...(prev[admissionId] || [])],
    }));

    toast.info('Vitals Charted', `Recorded BP ${vitals.bloodPressure}, SpO2 ${vitals.spo2}%`);

    return newReading;
  }, [admissions, authState.user, toast]);

  // RECORD NURSING NOTE
  const recordNursingNote = useCallback((noteData: Partial<IPDNursingNote>) => {
    const newNote: IPDNursingNote = {
      id: `nt-${Date.now().toString().slice(-4)}`,
      admissionId: noteData.admissionId || '',
      patientId: noteData.patientId || '',
      patientName: noteData.patientName || '',
      nurseId: authState.user?.id || 'u-006',
      nurseName: authState.user?.name || 'Staff Nurse',
      shift: noteData.shift || 'morning',
      noteDate: '2026-08-31',
      noteTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      intakeOral: noteData.intakeOral,
      intakeIV: noteData.intakeIV,
      outputUrine: noteData.outputUrine,
      outputDrain: noteData.outputDrain,
      observations: noteData.observations || '',
      nursingProcedures: noteData.nursingProcedures,
      careInstructions: noteData.careInstructions,
      vitals: noteData.vitals,
      createdAt: new Date().toISOString(),
    };

    setNursingNotes(prev => [newNote, ...prev]);
    toast.success('Nursing Note Saved', 'Inpatient chart updated successfully');
    return newNote;
  }, [authState.user, toast]);

  // CREATE NURSING TASK
  const createNursingTask = useCallback((taskData: Partial<IPDNursingTask>) => {
    const newTask: IPDNursingTask = {
      id: `ntk-${Date.now().toString().slice(-4)}`,
      admissionId: taskData.admissionId || '',
      patientId: taskData.patientId || '',
      patientName: taskData.patientName || '',
      bedNumber: taskData.bedNumber || '',
      taskType: taskData.taskType || 'medication_due',
      title: taskData.title || 'Inpatient Nursing Task',
      description: taskData.description,
      dueTime: taskData.dueTime || '14:00',
      priority: taskData.priority || 'routine',
      status: 'pending',
      assignedNurse: taskData.assignedNurse || authState.user?.name || 'Assigned Nurse',
    };

    setNursingTasks(prev => [newTask, ...prev]);
    toast.info('Nursing Task Added', newTask.title);
    return newTask;
  }, [authState.user, toast]);

  // COMPLETE NURSING TASK
  const completeNursingTask = useCallback((taskId: string) => {
    setNursingTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: authState.user?.name || 'Staff Nurse',
    } : t));
    toast.success('Task Completed', 'Task logged as done');
  }, [authState.user, toast]);

  // ADD INPATIENT MEDICATION
  const addInpatientMedication = useCallback((medData: Partial<InpatientMedication>) => {
    const newMed: InpatientMedication = {
      id: `in-med-${Date.now().toString().slice(-4)}`,
      admissionId: medData.admissionId || '',
      patientId: medData.patientId || '',
      medicineName: medData.medicineName || 'Medication',
      genericName: medData.genericName,
      strength: medData.strength || '500mg',
      route: medData.route || 'Oral',
      dose: medData.dose || '1 Unit',
      frequency: medData.frequency || 'Once Daily (OD)',
      startDate: medData.startDate || '2026-08-31',
      endDate: medData.endDate,
      instructions: medData.instructions || 'As advised',
      prescribingDoctor: medData.prescribingDoctor || authState.user?.name || 'Attending Consultant',
      status: 'active',
    };

    setInpatientMedications(prev => [newMed, ...prev]);
    toast.success('Medication Prescribed', `Added ${newMed.medicineName} to patient MAR chart`);
    return newMed;
  }, [authState.user, toast]);

  // ADMINISTER MEDICATION (MAR)
  const administerMedication = useCallback((data: {
    medicationId: string;
    admissionId: string;
    status: 'administered' | 'missed' | 'held' | 'cancelled';
    remarks?: string;
  }) => {
    const med = inpatientMedications.find(m => m.id === data.medicationId);
    const admission = admissions.find(a => a.id === data.admissionId);

    const newMAR: MedicationAdministrationRecord = {
      id: `mar-${Date.now().toString().slice(-4)}`,
      medicationId: data.medicationId,
      admissionId: data.admissionId,
      patientId: admission?.patientId || '',
      medicineName: med?.medicineName || 'Medication',
      dose: med?.dose || '1 dose',
      route: med?.route || 'Oral',
      scheduledDate: '2026-08-31',
      scheduledTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      administeredTime: data.status === 'administered' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
      status: data.status,
      nurseName: authState.user?.name || 'Staff Nurse',
      remarks: data.remarks,
    };

    setMedicationAdministrations(prev => [newMAR, ...prev]);
    toast.info('MAR Record Logged', `Medication ${data.status.toUpperCase()}`);
    return newMAR;
  }, [inpatientMedications, admissions, authState.user, toast]);

  // RECORD PROCEDURE
  const recordProcedure = useCallback((procData: Partial<IPDProcedure>) => {
    const newProc: IPDProcedure = {
      id: `proc-${Date.now().toString().slice(-4)}`,
      admissionId: procData.admissionId || '',
      patientId: procData.patientId || '',
      procedureName: procData.procedureName || 'Clinical Procedure',
      category: procData.category || 'therapeutic',
      procedureDate: procData.procedureDate || '2026-08-31',
      procedureTime: procData.procedureTime || '11:00',
      doctorId: procData.doctorId || 'doc-001',
      doctorName: procData.doctorName || 'Attending Surgeon',
      assistingStaff: procData.assistingStaff,
      notes: procData.notes || '',
      findings: procData.findings,
      price: procData.price || 1500,
      status: procData.status || 'completed',
    };

    setProcedures(prev => [newProc, ...prev]);
    toast.success('Procedure Logged', `Recorded ${newProc.procedureName}`);
    return newProc;
  }, [toast]);

  // ORDER IPD LAB
  const orderIPDLab = useCallback((labData: any) => {
    const newOrder: LabRequest = {
      id: `lr-ipd-${Date.now().toString().slice(-4)}`,
      patientId: labData.patientId,
      patientName: labData.patientName,
      doctorId: labData.doctorId,
      doctorName: labData.doctorName,
      admissionId: labData.admissionId,
      requestDate: '2026-08-31',
      status: 'ordered',
      priority: labData.priority || 'routine',
      tests: labData.tests || [],
      totalAmount: labData.totalAmount || 0,
      aiInsight: labData.aiInsight,
    };
    setLabRequests(prev => [newOrder, ...prev]);
    toast.success('IPD Lab Order Sent', `Requisition sent for ${newOrder.tests.length} tests`);
    return newOrder;
  }, [toast]);

  // ORDER IPD RADIOLOGY
  const orderIPDRadiology = useCallback((radData: any) => {
    const newStudy: RadiologyStudy = {
      id: `rad-ipd-${Date.now().toString().slice(-4)}`,
      patientId: radData.patientId,
      patientName: radData.patientName,
      doctorId: radData.doctorId,
      doctorName: radData.doctorName,
      admissionId: radData.admissionId,
      modality: radData.modality,
      bodyPart: radData.bodyPart,
      scheduledDate: radData.scheduledDate || '2026-08-31',
      scheduledTime: radData.scheduledTime || '14:00',
      status: 'scheduled',
      priority: radData.priority || 'routine',
      price: radData.price || 800,
      clinicalHistory: radData.clinicalHistory,
      createdAt: new Date().toISOString(),
    };
    setRadiologyOrders(prev => [newStudy, ...prev]);
    toast.success('IPD Radiology Scheduled', `Ordered ${newStudy.bodyPart}`);
    return newStudy;
  }, [toast]);

  // DISCHARGE WORKFLOW
  const processDischarge = useCallback((dischargeData: {
    admissionId: string;
    dischargeDate: string;
    dischargeTime: string;
    dischargeType: DischargeType;
    finalDiagnosis: string[];
    clinicalSummary: string;
    hospitalCourse: string;
    treatmentGiven: string;
    conditionAtDischarge: 'cured' | 'improved' | 'stable' | 'relieved' | 'critical' | 'expired';
    dischargeMedications: {
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    followUpDate: string;
    followUpDoctor: string;
    followUpInstructions: string;
  }) => {
    const admission = admissions.find(a => a.id === dischargeData.admissionId);
    if (!admission) throw new Error('Admission not found');

    const allocatedBed = beds.find(b => b.id === admission.bedId);

    const dischargeRecord: IPDDischargeRecord = {
      id: `dis-${Date.now().toString().slice(-4)}`,
      admissionId: admission.id,
      patientId: admission.patientId,
      patientName: admission.patientName,
      uhid: admission.patientId,
      admissionDate: admission.admissionDate,
      admissionTime: admission.admissionTime,
      dischargeDate: dischargeData.dischargeDate || '2026-08-31',
      dischargeTime: dischargeData.dischargeTime || '12:00',
      dischargeType: dischargeData.dischargeType,
      finalDiagnosis: dischargeData.finalDiagnosis,
      clinicalSummary: dischargeData.clinicalSummary,
      hospitalCourse: dischargeData.hospitalCourse,
      proceduresDone: procedures.filter(p => p.admissionId === admission.id).map(p => p.procedureName),
      treatmentGiven: dischargeData.treatmentGiven,
      conditionAtDischarge: dischargeData.conditionAtDischarge,
      dischargeMedications: dischargeData.dischargeMedications,
      followUpDate: dischargeData.followUpDate,
      followUpDoctor: dischargeData.followUpDoctor,
      followUpInstructions: dischargeData.followUpInstructions,
      consultantId: admission.admittingDoctorId,
      consultantName: admission.admittingDoctorName,
      status: 'finalized',
      createdAt: new Date().toISOString(),
    };

    // 1. Update Admission status to DISCHARGED
    setAdmissions(prev => prev.map(a => a.id === admission.id ? {
      ...a,
      status: 'discharged',
      dischargeDate: dischargeRecord.dischargeDate,
      dischargeTime: dischargeRecord.dischargeTime,
      dischargeType: dischargeData.dischargeType === 'normal' ? 'normal' : 'ama',
    } : a));

    // 2. Mark bed as CLEANING (NOT available immediately until cleaned)
    if (allocatedBed) {
      setBeds(prev => prev.map(b => b.id === allocatedBed.id ? {
        ...b,
        status: 'cleaning',
        currentPatientId: undefined,
        currentPatientName: undefined,
        currentAdmissionId: undefined,
        admittingDoctorName: undefined,
        admissionDate: undefined,
      } : b));
    }

    // 3. Save Discharge Record
    setDischargeRecords(prev => [dischargeRecord, ...prev]);

    toast.success('Patient Discharged Successfully', `Generated Discharge Summary. Bed ${allocatedBed?.bedNumber} is now in CLEANING queue.`);

    return dischargeRecord;
  }, [admissions, beds, procedures, toast]);

  // GENERATE IPD BILL
  const generateIPDBill = useCallback((billData: Partial<IPDBill>) => {
    const nextBillNum = ipdBills.length + 101;
    const newBill: IPDBill = {
      id: `ipd-bill-${Date.now().toString().slice(-4)}`,
      billNumber: `ALN-IPD-2026-${String(nextBillNum).padStart(4, '0')}`,
      admissionId: billData.admissionId || '',
      patientId: billData.patientId || '',
      patientName: billData.patientName || '',
      uhid: billData.uhid || billData.patientId || '',
      ward: billData.ward || 'General Ward',
      bedNumber: billData.bedNumber || '',
      admissionDate: billData.admissionDate || '2026-08-28',
      dischargeDate: billData.dischargeDate,
      totalDays: billData.totalDays || 3,
      dailyBedRate: billData.dailyBedRate || 800,
      roomCharges: billData.roomCharges || 2400,
      doctorVisitCharges: billData.doctorVisitCharges || 1500,
      nursingCharges: billData.nursingCharges || 600,
      procedureCharges: billData.procedureCharges || 0,
      labCharges: billData.labCharges || 2600,
      diagnosticCharges: billData.diagnosticCharges || 500,
      pharmacyCharges: billData.pharmacyCharges || 1200,
      consumablesCharges: billData.consumablesCharges || 400,
      otherCharges: billData.otherCharges || 0,
      subtotal: billData.subtotal || 9200,
      discount: billData.discount || 0,
      tax: billData.tax || 0,
      total: billData.total || 9200,
      insuranceCoveredAmount: billData.insuranceCoveredAmount || 0,
      patientPayable: billData.patientPayable || billData.total || 9200,
      paidAmount: billData.paidAmount || 0,
      balanceDue: billData.balanceDue || billData.total || 9200,
      status: billData.status || 'pending',
      payments: billData.payments || [],
      insuranceClaim: billData.insuranceClaim,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIpdBills(prev => [newBill, ...prev]);
    toast.success('IPD Invoice Generated', `Invoice #${newBill.billNumber} created for ₹${newBill.total}`);
    return newBill;
  }, [ipdBills, toast]);

  // RECORD IPD PAYMENT
  const recordIPDPayment = useCallback((billId: string, amount: number, mode: PaymentMode, ref?: string) => {
    setIpdBills(prev => prev.map(b => {
      if (b.id === billId) {
        const newPaid = b.paidAmount + amount;
        const newBalance = Math.max(0, b.patientPayable - newPaid);
        const newStatus = newBalance === 0 ? 'paid' : 'partial';
        const newPayment = {
          id: `pay-${Date.now().toString().slice(-4)}`,
          amount,
          mode,
          referenceNumber: ref,
          date: '2026-08-31',
          receivedBy: authState.user?.name || 'IPD Cashier Desk',
        };
        return {
          ...b,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
          payments: [...b.payments, newPayment],
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    }));
    toast.success('Payment Received', `Recorded payment of ₹${amount} via ${mode.toUpperCase()}`);
  }, [authState.user, toast]);

  // PROCESS INSURANCE / TPA CLAIM
  const processInsuranceClaim = useCallback((claimData: Partial<InsuranceClaimRecord>) => {
    const newClaim: InsuranceClaimRecord = {
      id: `clm-${Date.now().toString().slice(-4)}`,
      admissionId: claimData.admissionId || '',
      patientId: claimData.patientId || '',
      insuranceProvider: claimData.insuranceProvider || 'Star Health',
      policyNumber: claimData.policyNumber || 'SH-992200',
      memberId: claimData.memberId || '',
      tpaName: claimData.tpaName,
      authorizationNumber: claimData.authorizationNumber || `AUTH-${Date.now().toString().slice(-6)}`,
      preAuthAmount: claimData.preAuthAmount || 30000,
      claimedAmount: claimData.claimedAmount || 25000,
      approvedAmount: claimData.approvedAmount || 22000,
      copayAmount: claimData.copayAmount || 3000,
      deductibleAmount: claimData.deductibleAmount || 0,
      approvalStatus: claimData.approvalStatus || 'approved',
      claimStatus: claimData.claimStatus || 'settled',
      settledDate: '2026-08-31',
    };

    setInsuranceClaims(prev => [newClaim, ...prev]);
    toast.success('TPA / Insurance Claim Processed', `Claim approved for ₹${newClaim.approvedAmount}`);
    return newClaim;
  }, [toast]);

  return (
    <IPDContext.Provider
      value={{
        activeTab,
        setActiveTab,
        admissions,
        beds,
        wards,
        patients: DEMO_PATIENTS,
        doctors: DEMO_DOCTORS,
        departments: DEMO_DEPARTMENTS,
        transfers,
        doctorRounds,
        nursingNotes,
        nursingTasks,
        vitalsHistory,
        inpatientMedications,
        medicationAdministrations,
        procedures,
        dischargeRecords,
        ipdBills,
        insuranceClaims,
        labRequests,
        radiologyOrders,
        selectedAdmissionId,
        setSelectedAdmissionId,
        selectedAdmission,
        selectedBedId,
        setSelectedBedId,
        kpis,
        searchQuery,
        setSearchQuery,
        admitPatient,
        admitEmergencyPatient,
        transferPatient,
        updateBedStatus,
        markBedCleaned,
        recordDoctorRound,
        recordNursingVitals,
        recordNursingNote,
        createNursingTask,
        completeNursingTask,
        addInpatientMedication,
        administerMedication,
        recordProcedure,
        orderIPDLab,
        orderIPDRadiology,
        processDischarge,
        generateIPDBill,
        recordIPDPayment,
        processInsuranceClaim,
      }}
    >
      {children}
    </IPDContext.Provider>
  );
}

export function useIPD() {
  const context = useContext(IPDContext);
  if (!context) {
    throw new Error('useIPD must be used within an IPDProvider');
  }
  return context;
}
