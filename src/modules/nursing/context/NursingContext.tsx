import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Admission,
  Patient,
  Doctor,
  Bed,
  Ward,
  NursingAssignment,
  NursingShiftRoster,
  ComprehensiveVitals,
  NursingCarePlan,
  MARRecord,
  IVInfusionRecord,
  IntakeOutputRecord,
  SystemAssessment,
  WoundRecord,
  WoundDressingLog,
  NursingHandoverRecord,
  NursingDoctorOrder,
  LabSampleCollection,
  DischargeChecklistRecord,
  PatientEducationRecord,
  NursingIncidentReport,
  NursingAlert,
  NursingDashboardKPIs,
  IPDNursingNote,
  IPDNursingTask,
  Vitals,
} from '../../../types';
import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_WARDS,
  DEMO_BEDS,
  DEMO_ADMISSIONS,
} from '../../../data/seedData';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export type NursingTab =
  | 'dashboard'
  | 'patients'
  | 'patient_profile'
  | 'vitals'
  | 'notes'
  | 'care_plans'
  | 'tasks'
  | 'mar'
  | 'iv_infusion'
  | 'intake_output'
  | 'assessment'
  | 'wound_care'
  | 'handover'
  | 'shifts'
  | 'doctor_orders'
  | 'sample_collection'
  | 'discharge_checklist'
  | 'patient_education'
  | 'incidents'
  | 'alerts'
  | 'analytics'
  | 'reports';

export interface NursingContextType {
  activeTab: NursingTab;
  setActiveTab: (tab: NursingTab) => void;

  // Selected Inpatient
  selectedAdmissionId: string | null;
  setSelectedAdmissionId: (id: string | null) => void;
  selectedAdmission: Admission | null;
  selectedPatient: Patient | null;

  // Master Data
  admissions: Admission[];
  patients: Patient[];
  doctors: Doctor[];
  beds: Bed[];
  wards: Ward[];

  // Nursing State Data
  assignments: NursingAssignment[];
  shiftRosters: NursingShiftRoster[];
  vitalsList: ComprehensiveVitals[];
  carePlans: NursingCarePlan[];
  nursingTasks: IPDNursingTask[];
  marRecords: MARRecord[];
  ivInfusions: IVInfusionRecord[];
  intakeOutputLogs: IntakeOutputRecord[];
  assessments: SystemAssessment[];
  wounds: WoundRecord[];
  woundDressingLogs: WoundDressingLog[];
  handovers: NursingHandoverRecord[];
  doctorOrders: NursingDoctorOrder[];
  sampleCollections: LabSampleCollection[];
  dischargeChecklists: Record<string, DischargeChecklistRecord>;
  patientEducationLogs: PatientEducationRecord[];
  incidentReports: NursingIncidentReport[];
  nursingAlerts: NursingAlert[];
  nursingNotes: IPDNursingNote[];

  // Computed KPIs
  kpis: NursingDashboardKPIs;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  recordVitals: (vitalsData: {
    admissionId: string;
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
    consciousness?: 'alert' | 'voice' | 'pain' | 'unresponsive';
    remarks?: string;
  }) => ComprehensiveVitals;

  recordNursingNote: (noteData: Partial<IPDNursingNote>) => IPDNursingNote;

  saveCarePlan: (planData: Partial<NursingCarePlan>) => NursingCarePlan;
  updateCarePlanStatus: (planId: string, status: NursingCarePlan['status'], progressNotes?: string) => void;

  createNursingTask: (taskData: Partial<IPDNursingTask>) => IPDNursingTask;
  updateTaskStatus: (taskId: string, status: IPDNursingTask['status']) => void;

  administerMARMedication: (data: {
    recordId: string;
    verifiedPatient: boolean;
    remarks?: string;
  }) => void;
  holdMARMedication: (recordId: string, reason: string) => void;
  markMARMissed: (recordId: string, reason: string) => void;

  recordIVInfusion: (data: Partial<IVInfusionRecord>) => IVInfusionRecord;
  updateIVInfusionStatus: (infusionId: string, status: IVInfusionRecord['status']) => void;

  recordIntakeOutput: (data: Partial<IntakeOutputRecord>) => IntakeOutputRecord;

  recordSystemAssessment: (data: Partial<SystemAssessment>) => SystemAssessment;

  recordWound: (data: Partial<WoundRecord>) => WoundRecord;
  recordWoundDressing: (data: Partial<WoundDressingLog>) => WoundDressingLog;

  createShiftHandover: (data: Partial<NursingHandoverRecord>) => NursingHandoverRecord;
  acknowledgeHandover: (handoverId: string) => void;

  assignNurseToPatients: (assignment: Partial<NursingAssignment>) => NursingAssignment;
  updateShiftRoster: (roster: Partial<NursingShiftRoster>) => NursingShiftRoster;

  acknowledgeDoctorOrder: (orderId: string) => void;
  completeDoctorOrder: (orderId: string, remarks?: string) => void;
  createDoctorOrder: (order: Partial<NursingDoctorOrder>) => NursingDoctorOrder;

  collectLabSample: (sampleId: string) => void;
  sendSampleToLab: (sampleId: string) => void;

  updateDischargeChecklist: (admissionId: string, checklist: Partial<DischargeChecklistRecord>) => DischargeChecklistRecord;

  recordPatientEducation: (education: Partial<PatientEducationRecord>) => PatientEducationRecord;

  reportIncident: (incident: Partial<NursingIncidentReport>) => NursingIncidentReport;
  resolveIncident: (incidentId: string, notes: string) => void;

  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
}

const NursingContext = createContext<NursingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ASSIGNMENTS: 'aln_hms_nursing_assignments_v1',
  SHIFTS: 'aln_hms_nursing_shifts_v1',
  VITALS: 'aln_hms_nursing_vitals_v1',
  CARE_PLANS: 'aln_hms_nursing_care_plans_v1',
  TASKS: 'aln_hms_nursing_tasks_v1',
  MAR: 'aln_hms_nursing_mar_v1',
  IV_INFUSIONS: 'aln_hms_nursing_iv_infusions_v1',
  INTAKE_OUTPUT: 'aln_hms_nursing_intake_output_v1',
  ASSESSMENTS: 'aln_hms_nursing_assessments_v1',
  WOUNDS: 'aln_hms_nursing_wounds_v1',
  WOUND_LOGS: 'aln_hms_nursing_wound_logs_v1',
  HANDOVERS: 'aln_hms_nursing_handovers_v1',
  DOCTOR_ORDERS: 'aln_hms_nursing_doctor_orders_v1',
  SAMPLES: 'aln_hms_nursing_samples_v1',
  DISCHARGE_CHECKLISTS: 'aln_hms_nursing_discharge_checklists_v1',
  EDUCATION: 'aln_hms_nursing_education_v1',
  INCIDENTS: 'aln_hms_nursing_incidents_v1',
  ALERTS: 'aln_hms_nursing_alerts_v1',
  NOTES: 'aln_hms_nursing_notes_v1',
};

// Initial Seed Data for Nursing
const INITIAL_ASSIGNMENTS: NursingAssignment[] = [
  {
    id: 'asg-001',
    nurseId: 'u-006',
    nurseName: 'Kavitha Nair',
    employeeId: 'EMP-NUR-101',
    shift: 'morning',
    ward: 'General Ward A',
    assignedPatientIds: ['ALN-2026-00001', 'ALN-2026-00003'],
    patientCount: 2,
    date: '2026-08-31',
    status: 'active',
  },
  {
    id: 'asg-002',
    nurseId: 'u-007',
    nurseName: 'Rekha Sharma',
    employeeId: 'EMP-NUR-102',
    shift: 'morning',
    ward: 'Medical ICU',
    assignedPatientIds: ['ALN-2026-00004', 'ALN-2026-00007'],
    patientCount: 2,
    date: '2026-08-31',
    status: 'active',
  },
  {
    id: 'asg-003',
    nurseId: 'u-008',
    nurseName: 'Suman Lata',
    employeeId: 'EMP-NUR-103',
    shift: 'morning',
    ward: 'Private Ward',
    assignedPatientIds: ['ALN-2026-00002'],
    patientCount: 1,
    date: '2026-08-31',
    status: 'active',
  },
];

const INITIAL_SHIFTS: NursingShiftRoster[] = [
  { id: 'shf-001', shift: 'morning', ward: 'General Ward A', nurseId: 'u-006', nurseName: 'Kavitha Nair', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-002', shift: 'morning', ward: 'Medical ICU', nurseId: 'u-007', nurseName: 'Rekha Sharma', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-003', shift: 'morning', ward: 'Private Ward', nurseId: 'u-008', nurseName: 'Suman Lata', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-004', shift: 'afternoon', ward: 'General Ward A', nurseId: 'u-009', nurseName: 'Preethi Mathew', startTime: '15:00', endTime: '23:00', date: '2026-08-31', status: 'scheduled' },
  { id: 'shf-005', shift: 'night', ward: 'General Ward A', nurseId: 'u-010', nurseName: 'Anitha Varma', startTime: '23:00', endTime: '07:00', date: '2026-08-31', status: 'scheduled' },
];

const INITIAL_COMPREHENSIVE_VITALS: ComprehensiveVitals[] = [
  {
    id: 'cv-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    recordedAt: '2026-08-31 08:00',
    bloodPressure: '128/84',
    systolic: 128,
    diastolic: 84,
    pulse: 74,
    temperature: 98.4,
    spo2: 98,
    respiratoryRate: 16,
    bloodSugar: 118,
    painScore: 1,
    weight: 76,
    height: 172,
    bmi: 25.7,
    consciousness: 'alert',
    isAbnormal: false,
    abnormalFlags: [],
    recordedBy: 'Kavitha Nair',
    remarks: 'Patient resting comfortably, no chest discomfort.',
  },
  {
    id: 'cv-002',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    recordedAt: '2026-08-31 08:30',
    bloodPressure: '148/96',
    systolic: 148,
    diastolic: 96,
    pulse: 108,
    temperature: 100.8,
    spo2: 93,
    respiratoryRate: 24,
    bloodSugar: 220,
    painScore: 7,
    consciousness: 'alert',
    isAbnormal: true,
    abnormalFlags: ['High BP (148/96)', 'Tachycardia (108 bpm)', 'Fever (100.8°F)', 'Low SpO2 (93%)', 'Hyperglycemia (220 mg/dL)', 'Severe Pain (7/10)'],
    recordedBy: 'Rekha Sharma',
    remarks: 'Critical reading: oxygen mask adjusted, urgent doctor notified.',
  },
];

const INITIAL_CARE_PLANS: NursingCarePlan[] = [
  {
    id: 'cp-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    problem: 'Acute Chest Discomfort & Reduced Activity Tolerance',
    nursingDiagnosis: 'Decreased cardiac output related to myocardial ischemia',
    goal: 'Patient will maintain stable vitals (BP < 130/85, HR 60-90) and report zero chest pain.',
    intervention: 'Monitor cardiac rhythm continuously, administer DAPT and statins on time, maintain low-sodium diet, assist with gentle mobilization.',
    frequency: 'Q4H Vitals & QShift Assessment',
    responsibleNurse: 'Kavitha Nair',
    startDate: '2026-08-28',
    reviewDate: '2026-09-01',
    progressNotes: 'Chest pain resolved. Patient ambulating comfortably without shortness of breath.',
    status: 'active',
    createdAt: '2026-08-28T10:00:00',
  },
  {
    id: 'cp-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    problem: 'Hyperthermia & General Body Weakness',
    nursingDiagnosis: 'Hyperthermia related to systemic bacterial infection',
    goal: 'Body temperature will stabilize between 98.0°F - 98.6°F within 48 hours.',
    intervention: 'Tepid sponging as needed, administer prescribed IV Ceftriaxone, encourage oral hydration (2-3 L/day), monitor fluid balance.',
    frequency: 'Q2H Temperature monitoring',
    responsibleNurse: 'Suman Lata',
    startDate: '2026-08-29',
    reviewDate: '2026-09-02',
    progressNotes: 'Temperature declining steadily (99.2°F). Oral intake improved.',
    status: 'active',
    createdAt: '2026-08-29T11:00:00',
  },
];

const INITIAL_MAR: MARRecord[] = [
  {
    id: 'mar-001',
    medicationId: 'med-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    medicineName: 'Inj. Enoxaparin 60mg',
    dose: '0.6 ml',
    route: 'Subcutaneous (SC)',
    frequency: 'Twice Daily (BD)',
    scheduledDate: '2026-08-31',
    scheduledTime: '08:00',
    administeredTime: '08:05',
    status: 'administered',
    nurseName: 'Kavitha Nair',
    verifiedPatient: true,
    remarks: 'Administered in right lower abdominal wall. No hematoma.',
  },
  {
    id: 'mar-002',
    medicationId: 'med-002',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    medicineName: 'Tab. Atorvastatin 40mg',
    dose: '1 Tablet',
    route: 'Oral',
    frequency: 'At Bedtime (HS)',
    scheduledDate: '2026-08-31',
    scheduledTime: '21:00',
    status: 'scheduled',
    verifiedPatient: false,
  },
  {
    id: 'mar-003',
    medicationId: 'med-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    medicineName: 'Inj. Furosemide 20mg',
    dose: '2 ml (20mg)',
    route: 'Slow IV Push',
    frequency: 'STAT / Immediate',
    scheduledDate: '2026-08-31',
    scheduledTime: '09:00',
    administeredTime: '09:02',
    status: 'administered',
    nurseName: 'Rekha Sharma',
    verifiedPatient: true,
    remarks: 'Given over 2 mins IV push. Urine output tracking initiated.',
  },
  {
    id: 'mar-004',
    medicationId: 'med-004',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    bedNumber: 'PR-01',
    medicineName: 'Inj. Ceftriaxone 1g',
    dose: '1 Vial in 100ml NS',
    route: 'IV Infusion',
    frequency: 'Twice Daily (BD)',
    scheduledDate: '2026-08-31',
    scheduledTime: '10:00',
    administeredTime: '10:10',
    status: 'administered',
    nurseName: 'Suman Lata',
    verifiedPatient: true,
    remarks: 'Infused over 30 mins. No allergic reaction.',
  },
];

const INITIAL_IV_INFUSIONS: IVInfusionRecord[] = [
  {
    id: 'iv-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    fluidName: 'Normal Saline 0.9%',
    volumeMl: 500,
    route: 'Peripheral IV',
    flowRateMlHr: 75,
    ivSite: 'Left Forearm (18G Cannula)',
    startTime: '2026-08-31 08:00',
    expectedEndTime: '2026-08-31 14:40',
    nurseName: 'Kavitha Nair',
    status: 'running',
    remarks: 'Cannula site healthy, no swelling or redness.',
  },
  {
    id: 'iv-002',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    fluidName: 'Dextrose 5% + Potassium Chloride 20mEq',
    volumeMl: 1000,
    route: 'Central Line',
    flowRateMlHr: 100,
    ivSite: 'Right Subclavian CVC',
    startTime: '2026-08-31 06:00',
    expectedEndTime: '2026-08-31 16:00',
    nurseName: 'Rekha Sharma',
    status: 'running',
    remarks: 'Central line dressing intact, aseptic technique maintained.',
  },
];

const INITIAL_INTAKE_OUTPUT: IntakeOutputRecord[] = [
  { id: 'io-001', admissionId: 'adm-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav', bedNumber: 'GA-01', date: '2026-08-31', time: '08:00', shift: 'morning', category: 'intake', subType: 'oral', amountMl: 250, nurseName: 'Kavitha Nair', remarks: 'Tea and water' },
  { id: 'io-002', admissionId: 'adm-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav', bedNumber: 'GA-01', date: '2026-08-31', time: '09:00', shift: 'morning', category: 'intake', subType: 'iv_fluids', amountMl: 150, nurseName: 'Kavitha Nair', remarks: '0.9% Normal Saline' },
  { id: 'io-003', admissionId: 'adm-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav', bedNumber: 'GA-01', date: '2026-08-31', time: '10:00', shift: 'morning', category: 'output', subType: 'urine', amountMl: 350, nurseName: 'Kavitha Nair', remarks: 'Clear straw colored' },
];

const INITIAL_ASSESSMENTS: SystemAssessment[] = [
  {
    id: 'asmt-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    date: '2026-08-31',
    time: '07:30',
    nurseName: 'Kavitha Nair',
    generalCondition: 'Conscious, oriented, resting in bed, comfortable.',
    consciousness: 'alert',
    orientation: 'oriented_x3',
    mobility: 'assisted',
    respiratoryCondition: 'Bilateral air entry equal, no wheeze or crepitations. Room air SpO2 98%.',
    spo2: 98,
    cardiovascularCondition: 'S1 S2 normal, pulse regular at 74 bpm, peripheral pulses palpable.',
    pulse: 74,
    bloodPressure: '128/84',
    skinCondition: 'Warm, dry, intact skin. No pressure injury noted.',
    bradenScore: 18,
    pressureInjuryRisk: 'low',
    nutritionAppetite: 'Good, low-salt cardiac diet tolerated.',
    feedingMethod: 'Oral Self',
    urineOutputStatus: 'Adequate, voluntary voiding.',
    bowelMovementStatus: 'Regular, soft stool passed yesterday.',
    remarks: 'Patient educated on fall precautions and call bell usage.',
    createdAt: '2026-08-31T07:45:00',
  },
];

const INITIAL_WOUNDS: WoundRecord[] = [
  {
    id: 'wnd-001',
    admissionId: 'adm-002',
    patientId: 'ALN-2026-00003',
    patientName: 'Vijay Malhotra',
    bedNumber: 'GA-03',
    location: 'Right Knee — Anterior aspect (Post Total Knee Replacement)',
    woundType: 'surgical_incision',
    sizeCm: '12cm linear',
    condition: 'granulating',
    drainage: 'serous',
    dressingType: 'Sterile Hydrocolloid Waterproof Dressing',
    lastDressingDate: '2026-08-30',
    nextDressingDate: '2026-09-01',
    nurseName: 'Kavitha Nair',
    remarks: 'Surgical clips in situ, margins well apposed, minimal serous soakage.',
    createdAt: '2026-08-29T14:00:00',
  },
];

const INITIAL_DOCTOR_ORDERS: NursingDoctorOrder[] = [
  {
    id: 'do-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    orderText: 'Strictly maintain 24-hour Fluid Intake & Output chart. Repeat Troponin I at 06:00 AM tomorrow.',
    category: 'monitoring',
    priority: 'urgent',
    orderDate: '2026-08-31',
    orderTime: '09:00',
    status: 'acknowledged',
    acknowledgedBy: 'Kavitha Nair',
    acknowledgedAt: '2026-08-31T09:15:00',
  },
  {
    id: 'do-002',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    orderText: 'Arterial blood gas (ABG) analysis stat. Titrate Noradrenaline to maintain MAP > 65 mmHg.',
    category: 'monitoring',
    priority: 'stat',
    orderDate: '2026-08-31',
    orderTime: '08:45',
    status: 'in_progress',
    acknowledgedBy: 'Rekha Sharma',
    acknowledgedAt: '2026-08-31T08:50:00',
  },
];

const INITIAL_SAMPLES: LabSampleCollection[] = [
  {
    id: 'spl-001',
    testId: 'lt-012',
    testName: 'Troponin I (High Sensitivity)',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    sampleType: 'Blood (Serum Clot Activator)',
    barcode: 'BAR-20260831-01',
    orderedDate: '2026-08-31',
    collectionDate: '2026-08-31',
    collectionTime: '07:00',
    collectedBy: 'Kavitha Nair',
    status: 'sent_to_lab',
  },
  {
    id: 'spl-002',
    testId: 'lt-001',
    testName: 'Complete Blood Count (CBC)',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    bedNumber: 'PR-01',
    sampleType: 'Blood (EDTA Lavender)',
    barcode: 'BAR-20260831-02',
    orderedDate: '2026-08-31',
    status: 'pending',
  },
];

const INITIAL_ALERTS: NursingAlert[] = [
  {
    id: 'alt-001',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    alertType: 'abnormal_vitals',
    priority: 'critical',
    message: 'Abnormal SpO2 (93%) and Tachycardia (108 bpm) recorded.',
    triggerValue: 'SpO2: 93%, HR: 108',
    timestamp: '2026-08-31 08:30',
    status: 'new',
  },
  {
    id: 'alt-002',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    alertType: 'medication_due',
    priority: 'medium',
    message: 'Tab. Atorvastatin 40mg due at 21:00 (Bedtime).',
    timestamp: '2026-08-31 09:00',
    status: 'new',
  },
];

export function NursingProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<NursingTab>('dashboard');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>('adm-001');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State with LocalStorage Persistence
  const [assignments, setAssignments] = useState<NursingAssignment[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS); return s ? JSON.parse(s) : INITIAL_ASSIGNMENTS; } catch { return INITIAL_ASSIGNMENTS; }
  });

  const [shiftRosters, setShiftRosters] = useState<NursingShiftRoster[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.SHIFTS); return s ? JSON.parse(s) : INITIAL_SHIFTS; } catch { return INITIAL_SHIFTS; }
  });

  const [vitalsList, setVitalsList] = useState<ComprehensiveVitals[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.VITALS); return s ? JSON.parse(s) : INITIAL_COMPREHENSIVE_VITALS; } catch { return INITIAL_COMPREHENSIVE_VITALS; }
  });

  const [carePlans, setCarePlans] = useState<NursingCarePlan[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.CARE_PLANS); return s ? JSON.parse(s) : INITIAL_CARE_PLANS; } catch { return INITIAL_CARE_PLANS; }
  });

  const [nursingTasks, setNursingTasks] = useState<IPDNursingTask[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.TASKS); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [marRecords, setMarRecords] = useState<MARRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.MAR); return s ? JSON.parse(s) : INITIAL_MAR; } catch { return INITIAL_MAR; }
  });

  const [ivInfusions, setIvInfusions] = useState<IVInfusionRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.IV_INFUSIONS); return s ? JSON.parse(s) : INITIAL_IV_INFUSIONS; } catch { return INITIAL_IV_INFUSIONS; }
  });

  const [intakeOutputLogs, setIntakeOutputLogs] = useState<IntakeOutputRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.INTAKE_OUTPUT); return s ? JSON.parse(s) : INITIAL_INTAKE_OUTPUT; } catch { return INITIAL_INTAKE_OUTPUT; }
  });

  const [assessments, setAssessments] = useState<SystemAssessment[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS); return s ? JSON.parse(s) : INITIAL_ASSESSMENTS; } catch { return INITIAL_ASSESSMENTS; }
  });

  const [wounds, setWounds] = useState<WoundRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.WOUNDS); return s ? JSON.parse(s) : INITIAL_WOUNDS; } catch { return INITIAL_WOUNDS; }
  });

  const [woundDressingLogs, setWoundDressingLogs] = useState<WoundDressingLog[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.WOUND_LOGS); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [handovers, setHandovers] = useState<NursingHandoverRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.HANDOVERS); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [doctorOrders, setDoctorOrders] = useState<NursingDoctorOrder[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.DOCTOR_ORDERS); return s ? JSON.parse(s) : INITIAL_DOCTOR_ORDERS; } catch { return INITIAL_DOCTOR_ORDERS; }
  });

  const [sampleCollections, setSampleCollections] = useState<LabSampleCollection[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.SAMPLES); return s ? JSON.parse(s) : INITIAL_SAMPLES; } catch { return INITIAL_SAMPLES; }
  });

  const [dischargeChecklists, setDischargeChecklists] = useState<Record<string, DischargeChecklistRecord>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.DISCHARGE_CHECKLISTS); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [patientEducationLogs, setPatientEducationLogs] = useState<PatientEducationRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.EDUCATION); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [incidentReports, setIncidentReports] = useState<NursingIncidentReport[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.INCIDENTS); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [nursingAlerts, setNursingAlerts] = useState<NursingAlert[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.ALERTS); return s ? JSON.parse(s) : INITIAL_ALERTS; } catch { return INITIAL_ALERTS; }
  });

  const [nursingNotes, setNursingNotes] = useState<IPDNursingNote[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.NOTES); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Persistence Effects
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); } catch (e) { console.warn(e); } }, [assignments]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shiftRosters)); } catch (e) { console.warn(e); } }, [shiftRosters]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitalsList)); } catch (e) { console.warn(e); } }, [vitalsList]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.CARE_PLANS, JSON.stringify(carePlans)); } catch (e) { console.warn(e); } }, [carePlans]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(nursingTasks)); } catch (e) { console.warn(e); } }, [nursingTasks]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.MAR, JSON.stringify(marRecords)); } catch (e) { console.warn(e); } }, [marRecords]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.IV_INFUSIONS, JSON.stringify(ivInfusions)); } catch (e) { console.warn(e); } }, [ivInfusions]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.INTAKE_OUTPUT, JSON.stringify(intakeOutputLogs)); } catch (e) { console.warn(e); } }, [intakeOutputLogs]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments)); } catch (e) { console.warn(e); } }, [assessments]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.WOUNDS, JSON.stringify(wounds)); } catch (e) { console.warn(e); } }, [wounds]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.DOCTOR_ORDERS, JSON.stringify(doctorOrders)); } catch (e) { console.warn(e); } }, [doctorOrders]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(sampleCollections)); } catch (e) { console.warn(e); } }, [sampleCollections]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.DISCHARGE_CHECKLISTS, JSON.stringify(dischargeChecklists)); } catch (e) { console.warn(e); } }, [dischargeChecklists]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(nursingAlerts)); } catch (e) { console.warn(e); } }, [nursingAlerts]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(nursingNotes)); } catch (e) { console.warn(e); } }, [nursingNotes]);

  // Selected Inpatient
  const selectedAdmission = useMemo(() => {
    if (!selectedAdmissionId) return DEMO_ADMISSIONS[0];
    return DEMO_ADMISSIONS.find(a => a.id === selectedAdmissionId) || DEMO_ADMISSIONS[0];
  }, [selectedAdmissionId]);

  const selectedPatient = useMemo(() => {
    if (!selectedAdmission) return DEMO_PATIENTS[0];
    return DEMO_PATIENTS.find(p => p.id === selectedAdmission.patientId) || DEMO_PATIENTS[0];
  }, [selectedAdmission]);

  // Computed KPIs
  const kpis: NursingDashboardKPIs = useMemo(() => {
    const activeAdmissions = DEMO_ADMISSIONS.filter(a => a.status === 'active');
    const totalAssignedPatients = activeAdmissions.length;
    const criticalPatientsCount = activeAdmissions.filter(a => a.ward.toLowerCase().includes('icu') || a.diagnosis.some(d => d.toLowerCase().includes('shock') || d.toLowerCase().includes('infarction'))).length;
    const patientsRequiringAttention = vitalsList.filter(v => v.isAbnormal).length + criticalPatientsCount;
    const vitalsDueCount = 3;
    const medicationDueCount = marRecords.filter(m => m.status === 'scheduled').length;
    const medicationOverdueCount = marRecords.filter(m => m.status === 'missed').length;
    const tasksPendingCount = nursingTasks.filter(t => t.status === 'pending').length;
    const doctorOrdersPendingCount = doctorOrders.filter(o => o.status === 'new' || o.status === 'acknowledged').length;
    const newAdmissionsCount = activeAdmissions.filter(a => a.admissionDate === '2026-08-31').length;
    const patientsForDischargeCount = activeAdmissions.filter(a => a.dischargeType === 'normal').length;

    return {
      totalAssignedPatients,
      patientsRequiringAttention,
      vitalsDueCount,
      medicationDueCount,
      medicationOverdueCount,
      tasksPendingCount,
      doctorOrdersPendingCount,
      criticalPatientsCount,
      newAdmissionsCount,
      patientsForDischargeCount,
    };
  }, [vitalsList, marRecords, nursingTasks, doctorOrders]);

  // RECORD VITALS WITH ABNORMAL THRESHOLD ALERTS
  const recordVitals = useCallback((vitalsData: {
    admissionId: string;
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
    consciousness?: 'alert' | 'voice' | 'pain' | 'unresponsive';
    remarks?: string;
  }) => {
    const adm = DEMO_ADMISSIONS.find(a => a.id === vitalsData.admissionId) || DEMO_ADMISSIONS[0];
    const hM = (vitalsData.height || 170) / 100;
    const wKg = vitalsData.weight || 70;
    const bmi = hM > 0 && wKg > 0 ? parseFloat((wKg / (hM * hM)).toFixed(1)) : undefined;

    // Abnormal Flags Calculation
    const abnormalFlags: string[] = [];
    if (vitalsData.temperature > 100.4) abnormalFlags.push(`High Temp (${vitalsData.temperature}°F)`);
    if (vitalsData.temperature < 96.0) abnormalFlags.push(`Hypothermia (${vitalsData.temperature}°F)`);
    if (vitalsData.spo2 < 95) abnormalFlags.push(`Low SpO2 (${vitalsData.spo2}%)`);
    if (vitalsData.systolic > 140 || vitalsData.diastolic > 90) abnormalFlags.push(`High BP (${vitalsData.systolic}/${vitalsData.diastolic})`);
    if (vitalsData.systolic < 90 || vitalsData.diastolic < 60) abnormalFlags.push(`Low BP (${vitalsData.systolic}/${vitalsData.diastolic})`);
    if (vitalsData.pulse > 100) abnormalFlags.push(`Tachycardia (${vitalsData.pulse} bpm)`);
    if (vitalsData.pulse < 60) abnormalFlags.push(`Bradycardia (${vitalsData.pulse} bpm)`);
    if (vitalsData.bloodSugar && vitalsData.bloodSugar > 200) abnormalFlags.push(`Hyperglycemia (${vitalsData.bloodSugar} mg/dL)`);
    if (vitalsData.painScore && vitalsData.painScore >= 7) abnormalFlags.push(`Severe Pain (${vitalsData.painScore}/10)`);

    const isAbnormal = abnormalFlags.length > 0;

    const newVitals: ComprehensiveVitals = {
      id: `cv-${Date.now().toString().slice(-4)}`,
      admissionId: vitalsData.admissionId,
      patientId: adm.patientId,
      recordedAt: `2026-08-31 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      bloodPressure: `${vitalsData.systolic}/${vitalsData.diastolic}`,
      systolic: vitalsData.systolic,
      diastolic: vitalsData.diastolic,
      pulse: vitalsData.pulse,
      temperature: vitalsData.temperature,
      spo2: vitalsData.spo2,
      respiratoryRate: vitalsData.respiratoryRate,
      bloodSugar: vitalsData.bloodSugar,
      painScore: vitalsData.painScore || 0,
      weight: vitalsData.weight,
      height: vitalsData.height,
      bmi,
      consciousness: vitalsData.consciousness || 'alert',
      isAbnormal,
      abnormalFlags,
      recordedBy: authState.user?.name || 'Staff Nurse',
      remarks: vitalsData.remarks,
    };

    setVitalsList(prev => [newVitals, ...prev]);

    // If abnormal, trigger immediate alert
    if (isAbnormal) {
      const newAlert: NursingAlert = {
        id: `alt-${Date.now().toString().slice(-4)}`,
        admissionId: adm.id,
        patientId: adm.patientId,
        patientName: adm.patientName,
        bedNumber: adm.bedNumber,
        alertType: 'abnormal_vitals',
        priority: 'critical',
        message: `Abnormal vitals for ${adm.patientName}: ${abnormalFlags.join(', ')}`,
        triggerValue: abnormalFlags.join('; '),
        timestamp: newVitals.recordedAt,
        status: 'new',
      };
      setNursingAlerts(prev => [newAlert, ...prev]);
      toast.error('⚠️ Critical Vitals Alert Triggered', abnormalFlags.join(', '));
    } else {
      toast.success('Bedside Vitals Charted', `Recorded BP ${newVitals.bloodPressure}, SpO2 ${newVitals.spo2}%`);
    }

    return newVitals;
  }, [authState.user, toast]);

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
      observations: noteData.observations || '',
      nursingProcedures: noteData.nursingProcedures,
      careInstructions: noteData.careInstructions,
      createdAt: new Date().toISOString(),
    };
    setNursingNotes(prev => [newNote, ...prev]);
    toast.success('Nursing Note Saved', 'Clinical note recorded on inpatient chart');
    return newNote;
  }, [authState.user, toast]);

  // SAVE CARE PLAN
  const saveCarePlan = useCallback((planData: Partial<NursingCarePlan>) => {
    const newPlan: NursingCarePlan = {
      id: `cp-${Date.now().toString().slice(-4)}`,
      admissionId: planData.admissionId || '',
      patientId: planData.patientId || '',
      patientName: planData.patientName || '',
      problem: planData.problem || 'Patient Care Need',
      nursingDiagnosis: planData.nursingDiagnosis || 'Nursing Diagnosis',
      goal: planData.goal || 'Measurable clinical outcome',
      intervention: planData.intervention || 'Nursing actions',
      frequency: planData.frequency || 'QShift',
      responsibleNurse: authState.user?.name || 'Staff Nurse',
      startDate: planData.startDate || '2026-08-31',
      reviewDate: planData.reviewDate || '2026-09-03',
      progressNotes: planData.progressNotes,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setCarePlans(prev => [newPlan, ...prev]);
    toast.success('Care Plan Created', `Added care plan for ${newPlan.patientName}`);
    return newPlan;
  }, [authState.user, toast]);

  const updateCarePlanStatus = useCallback((planId: string, status: NursingCarePlan['status'], progressNotes?: string) => {
    setCarePlans(prev => prev.map(p => p.id === planId ? {
      ...p,
      status,
      progressNotes: progressNotes || p.progressNotes,
    } : p));
    toast.info('Care Plan Updated', `Status changed to ${status.toUpperCase()}`);
  }, [toast]);

  // NURSING TASKS
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
      assignedNurse: taskData.assignedNurse || authState.user?.name || 'Staff Nurse',
    };
    setNursingTasks(prev => [newTask, ...prev]);
    toast.info('Nursing Task Added', newTask.title);
    return newTask;
  }, [authState.user, toast]);

  const updateTaskStatus = useCallback((taskId: string, status: IPDNursingTask['status']) => {
    setNursingTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : t));
    toast.success('Task Updated', `Task marked as ${status.toUpperCase()}`);
  }, [toast]);

  // MAR 5-RIGHTS MEDICATION ADMINISTRATION
  const administerMARMedication = useCallback((data: { recordId: string; verifiedPatient: boolean; remarks?: string }) => {
    setMarRecords(prev => prev.map(m => m.id === data.recordId ? {
      ...m,
      status: 'administered',
      administeredTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      nurseName: authState.user?.name || 'Staff Nurse',
      verifiedPatient: data.verifiedPatient,
      remarks: data.remarks || m.remarks,
    } : m));
    toast.success('Medication Administered (MAR)', '5 Rights verified and logged to patient drug record.');
  }, [authState.user, toast]);

  const holdMARMedication = useCallback((recordId: string, reason: string) => {
    if (!reason) throw new Error('Mandatory clinical reason required to hold medication.');
    setMarRecords(prev => prev.map(m => m.id === recordId ? {
      ...m,
      status: 'held',
      reasonForHoldMissed: reason,
      nurseName: authState.user?.name || 'Staff Nurse',
    } : m));
    toast.warning('Medication Held', `Dose held: ${reason}`);
  }, [authState.user, toast]);

  const markMARMissed = useCallback((recordId: string, reason: string) => {
    if (!reason) throw new Error('Mandatory clinical reason required for missed medication.');
    setMarRecords(prev => prev.map(m => m.id === recordId ? {
      ...m,
      status: 'missed',
      reasonForHoldMissed: reason,
      nurseName: authState.user?.name || 'Staff Nurse',
    } : m));
    toast.error('Medication Missed', `Logged missed dose: ${reason}`);
  }, [authState.user, toast]);

  // IV INFUSION MONITORING
  const recordIVInfusion = useCallback((data: Partial<IVInfusionRecord>) => {
    const newInfusion: IVInfusionRecord = {
      id: `iv-${Date.now().toString().slice(-4)}`,
      admissionId: data.admissionId || '',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      bedNumber: data.bedNumber || '',
      fluidName: data.fluidName || 'Normal Saline 0.9%',
      volumeMl: data.volumeMl || 500,
      route: data.route || 'Peripheral IV',
      flowRateMlHr: data.flowRateMlHr || 75,
      ivSite: data.ivSite || 'Forearm',
      startTime: `2026-08-31 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      expectedEndTime: '2026-08-31 16:00',
      nurseName: authState.user?.name || 'Staff Nurse',
      status: 'running',
      remarks: data.remarks,
    };
    setIvInfusions(prev => [newInfusion, ...prev]);
    toast.success('IV Infusion Started', `${newInfusion.fluidName} at ${newInfusion.flowRateMlHr} ml/hr`);
    return newInfusion;
  }, [authState.user, toast]);

  const updateIVInfusionStatus = useCallback((infusionId: string, status: IVInfusionRecord['status']) => {
    setIvInfusions(prev => prev.map(i => i.id === infusionId ? { ...i, status, actualEndTime: status === 'completed' ? new Date().toLocaleTimeString() : undefined } : i));
    toast.info('IV Infusion Updated', `Status: ${status.toUpperCase()}`);
  }, [toast]);

  // INTAKE & OUTPUT LOG
  const recordIntakeOutput = useCallback((data: Partial<IntakeOutputRecord>) => {
    const newLog: IntakeOutputRecord = {
      id: `io-${Date.now().toString().slice(-4)}`,
      admissionId: data.admissionId || '',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      bedNumber: data.bedNumber || '',
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      shift: data.shift || 'morning',
      category: data.category || 'intake',
      subType: data.subType || 'oral',
      amountMl: data.amountMl || 0,
      nurseName: authState.user?.name || 'Staff Nurse',
      remarks: data.remarks,
    };
    setIntakeOutputLogs(prev => [newLog, ...prev]);
    toast.success('Fluid Chart Updated', `${newLog.category.toUpperCase()}: ${newLog.amountMl} ml (${newLog.subType})`);
    return newLog;
  }, [authState.user, toast]);

  // SYSTEM ASSESSMENT
  const recordSystemAssessment = useCallback((data: Partial<SystemAssessment>) => {
    const newAsmt: SystemAssessment = {
      id: `asmt-${Date.now().toString().slice(-4)}`,
      admissionId: data.admissionId || '',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      bedNumber: data.bedNumber || '',
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      nurseName: authState.user?.name || 'Staff Nurse',
      generalCondition: data.generalCondition || 'Stable',
      consciousness: data.consciousness || 'alert',
      orientation: data.orientation || 'oriented_x3',
      mobility: data.mobility || 'independent',
      respiratoryCondition: data.respiratoryCondition || 'Clear bilateral air entry',
      oxygenSupport: data.oxygenSupport,
      spo2: data.spo2 || 98,
      cardiovascularCondition: data.cardiovascularCondition || 'Normal S1 S2',
      pulse: data.pulse || 72,
      bloodPressure: data.bloodPressure || '120/80',
      skinCondition: data.skinCondition || 'Intact',
      bradenScore: data.bradenScore || 18,
      pressureInjuryRisk: data.pressureInjuryRisk || 'low',
      nutritionAppetite: data.nutritionAppetite || 'Normal',
      feedingMethod: data.feedingMethod || 'Oral Self',
      urineOutputStatus: data.urineOutputStatus || 'Adequate',
      bowelMovementStatus: data.bowelMovementStatus || 'Normal',
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
    };
    setAssessments(prev => [newAsmt, ...prev]);
    toast.success('Systems Assessment Saved', `Head-to-toe assessment recorded for ${newAsmt.patientName}`);
    return newAsmt;
  }, [authState.user, toast]);

  // WOUND & DRESSING CARE
  const recordWound = useCallback((data: Partial<WoundRecord>) => {
    const newWound: WoundRecord = {
      id: `wnd-${Date.now().toString().slice(-4)}`,
      admissionId: data.admissionId || '',
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      bedNumber: data.bedNumber || '',
      location: data.location || 'Surgical Site',
      woundType: data.woundType || 'surgical_incision',
      sizeCm: data.sizeCm || '10cm',
      condition: data.condition || 'granulating',
      drainage: data.drainage || 'none',
      dressingType: data.dressingType || 'Sterile Gauze',
      lastDressingDate: '2026-08-31',
      nextDressingDate: data.nextDressingDate || '2026-09-02',
      nurseName: authState.user?.name || 'Staff Nurse',
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
    };
    setWounds(prev => [newWound, ...prev]);
    toast.success('Wound Documented', `Added ${newWound.location} wound record`);
    return newWound;
  }, [authState.user, toast]);

  const recordWoundDressing = useCallback((data: Partial<WoundDressingLog>) => {
    const newLog: WoundDressingLog = {
      id: `wdl-${Date.now().toString().slice(-4)}`,
      woundId: data.woundId || '',
      admissionId: data.admissionId || '',
      dressingDate: '2026-08-31',
      dressingTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      procedureDone: data.procedureDone || 'Cleaned with Betadine and sterile saline',
      dressingApplied: data.dressingApplied || 'Dry sterile dressing',
      exudateAmount: data.exudateAmount || 'scant',
      painDuringDressing: data.painDuringDressing || 2,
      nurseName: authState.user?.name || 'Staff Nurse',
      remarks: data.remarks,
    };
    setWoundDressingLogs(prev => [newLog, ...prev]);
    toast.success('Dressing Logged', 'Aseptic wound dressing procedure recorded');
    return newLog;
  }, [authState.user, toast]);

  // SHIFT HANDOVER
  const createShiftHandover = useCallback((data: Partial<NursingHandoverRecord>) => {
    const newHandover: NursingHandoverRecord = {
      id: `hnd-${Date.now().toString().slice(-4)}`,
      fromNurseId: authState.user?.id || 'u-006',
      fromNurseName: authState.user?.name || 'Relieving Nurse',
      toNurseId: data.toNurseId || 'u-009',
      toNurseName: data.toNurseName || 'Incoming Nurse',
      shift: data.shift || 'morning',
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      ward: data.ward || 'General Ward A',
      patientHandovers: data.patientHandovers || [],
      generalWardNotes: data.generalWardNotes,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    setHandovers(prev => [newHandover, ...prev]);
    toast.success('Shift Handover Submitted', `Handover report ready for ${newHandover.toNurseName}`);
    return newHandover;
  }, [authState.user, toast]);

  const acknowledgeHandover = useCallback((handoverId: string) => {
    setHandovers(prev => prev.map(h => h.id === handoverId ? { ...h, status: 'acknowledged' } : h));
    toast.success('Handover Acknowledged', 'Incoming duty nurse signed off on shift handoff.');
  }, [toast]);

  // NURSE ASSIGNMENT
  const assignNurseToPatients = useCallback((assignment: Partial<NursingAssignment>) => {
    const newAsg: NursingAssignment = {
      id: `asg-${Date.now().toString().slice(-4)}`,
      nurseId: assignment.nurseId || 'u-006',
      nurseName: assignment.nurseName || 'Kavitha Nair',
      employeeId: assignment.employeeId || 'EMP-NUR-101',
      shift: assignment.shift || 'morning',
      ward: assignment.ward || 'General Ward A',
      assignedPatientIds: assignment.assignedPatientIds || [],
      patientCount: assignment.assignedPatientIds?.length || 0,
      date: '2026-08-31',
      status: 'active',
    };
    setAssignments(prev => [newAsg, ...prev]);
    toast.success('Nurse Assignment Updated', `Assigned ${newAsg.patientCount} patients to ${newAsg.nurseName}`);
    return newAsg;
  }, [toast]);

  const updateShiftRoster = useCallback((roster: Partial<NursingShiftRoster>) => {
    const newRoster: NursingShiftRoster = {
      id: `shf-${Date.now().toString().slice(-4)}`,
      shift: roster.shift || 'morning',
      ward: roster.ward || 'General Ward A',
      nurseId: roster.nurseId || 'u-006',
      nurseName: roster.nurseName || 'Kavitha Nair',
      startTime: roster.startTime || '07:00',
      endTime: roster.endTime || '15:00',
      date: '2026-08-31',
      status: roster.status || 'scheduled',
    };
    setShiftRosters(prev => [newRoster, ...prev]);
    toast.success('Shift Roster Updated', `Scheduled ${newRoster.nurseName} for ${newRoster.shift.toUpperCase()}`);
    return newRoster;
  }, [toast]);

  // DOCTOR ORDERS
  const acknowledgeDoctorOrder = useCallback((orderId: string) => {
    setDoctorOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'acknowledged',
      acknowledgedBy: authState.user?.name || 'Staff Nurse',
      acknowledgedAt: new Date().toISOString(),
    } : o));
    toast.info('Doctor Order Acknowledged', 'Order marked for execution');
  }, [authState.user, toast]);

  const completeDoctorOrder = useCallback((orderId: string, remarks?: string) => {
    setDoctorOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'completed',
      completedBy: authState.user?.name || 'Staff Nurse',
      completedAt: new Date().toISOString(),
      remarks: remarks || o.remarks,
    } : o));
    toast.success('Doctor Order Completed', 'Execution logged in clinical chart');
  }, [authState.user, toast]);

  const createDoctorOrder = useCallback((order: Partial<NursingDoctorOrder>) => {
    const newOrder: NursingDoctorOrder = {
      id: `do-${Date.now().toString().slice(-4)}`,
      admissionId: order.admissionId || '',
      patientId: order.patientId || '',
      patientName: order.patientName || '',
      bedNumber: order.bedNumber || '',
      doctorId: order.doctorId || 'doc-001',
      doctorName: order.doctorName || 'Dr. Attending Consultant',
      orderText: order.orderText || 'Doctor Order',
      category: order.category || 'monitoring',
      priority: order.priority || 'routine',
      orderDate: '2026-08-31',
      orderTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'new',
    };
    setDoctorOrders(prev => [newOrder, ...prev]);
    toast.success('Doctor Order Placed', newOrder.orderText);
    return newOrder;
  }, [toast]);

  // LAB SAMPLE PHLEBOTOMY
  const collectLabSample = useCallback((sampleId: string) => {
    setSampleCollections(prev => prev.map(s => s.id === sampleId ? {
      ...s,
      status: 'collected',
      collectionDate: '2026-08-31',
      collectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      collectedBy: authState.user?.name || 'Staff Nurse',
    } : s));
    toast.success('Sample Collected', 'Specimen collected and labeled with barcode.');
  }, [authState.user, toast]);

  const sendSampleToLab = useCallback((sampleId: string) => {
    setSampleCollections(prev => prev.map(s => s.id === sampleId ? { ...s, status: 'sent_to_lab' } : s));
    toast.info('Dispatched to Lab', 'Specimen transported to Diagnostic Laboratory.');
  }, [toast]);

  // DISCHARGE CHECKLIST
  const updateDischargeChecklist = useCallback((admissionId: string, checklist: Partial<DischargeChecklistRecord>) => {
    const adm = DEMO_ADMISSIONS.find(a => a.id === admissionId) || DEMO_ADMISSIONS[0];
    const updated: DischargeChecklistRecord = {
      id: `dcl-${Date.now().toString().slice(-4)}`,
      admissionId,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      doctorDischargeOrder: checklist.doctorDischargeOrder ?? true,
      patientBelongingsReturned: checklist.patientBelongingsReturned ?? true,
      medInstructionsProvided: checklist.medInstructionsProvided ?? true,
      followUpInstructionsProvided: checklist.followUpInstructionsProvided ?? true,
      documentsProvided: checklist.documentsProvided ?? true,
      patientEducationCompleted: checklist.patientEducationCompleted ?? true,
      ivLineRemoved: checklist.ivLineRemoved ?? true,
      nursingNotesCompleted: checklist.nursingNotesCompleted ?? true,
      pendingInvestigationsChecked: checklist.pendingInvestigationsChecked ?? true,
      billingClearanceChecked: checklist.billingClearanceChecked ?? true,
      transportArranged: checklist.transportArranged ?? true,
      nurseName: authState.user?.name || 'Staff Nurse',
      finalizedAt: new Date().toISOString(),
      status: 'completed',
    };
    setDischargeChecklists(prev => ({ ...prev, [admissionId]: updated }));
    toast.success('Discharge Checklist Verified', 'All 11 mandatory nursing criteria cleared.');
    return updated;
  }, [authState.user, toast]);

  // PATIENT EDUCATION
  const recordPatientEducation = useCallback((education: Partial<PatientEducationRecord>) => {
    const newEdu: PatientEducationRecord = {
      id: `edu-${Date.now().toString().slice(-4)}`,
      admissionId: education.admissionId || '',
      patientId: education.patientId || '',
      patientName: education.patientName || '',
      topic: education.topic || 'medication',
      educationDetails: education.educationDetails || 'Patient and family instructed on home care precautions.',
      understandingLevel: education.understandingLevel || 'good',
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      nurseName: authState.user?.name || 'Staff Nurse',
      caregiverPresent: education.caregiverPresent || 'Spouse',
      remarks: education.remarks,
    };
    setPatientEducationLogs(prev => [newEdu, ...prev]);
    toast.success('Patient Education Documented', `Topic: ${newEdu.topic.toUpperCase()}`);
    return newEdu;
  }, [authState.user, toast]);

  // INCIDENT REPORTING
  const reportIncident = useCallback((incident: Partial<NursingIncidentReport>) => {
    const newInc: NursingIncidentReport = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      admissionId: incident.admissionId,
      patientId: incident.patientId,
      patientName: incident.patientName,
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      location: incident.location || 'General Ward A',
      incidentType: incident.incidentType || 'fall',
      severity: incident.severity || 'minor',
      description: incident.description || 'Incident reported during shift.',
      immediateActionTaken: incident.immediateActionTaken || 'Patient evaluated by doctor immediately.',
      reportedBy: authState.user?.name || 'Staff Nurse',
      supervisor: incident.supervisor || 'Head Nurse Rekha',
      status: 'reported',
      createdAt: new Date().toISOString(),
    };
    setIncidentReports(prev => [newInc, ...prev]);
    toast.warning('⚠️ Incident Report Submitted', `Incident #${newInc.id} logged for supervisor audit.`);
    return newInc;
  }, [authState.user, toast]);

  const resolveIncident = useCallback((incidentId: string, notes: string) => {
    setIncidentReports(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'resolved', resolutionNotes: notes } : i));
    toast.success('Incident Resolved', 'Incident marked resolved by supervisor.');
  }, [toast]);

  // ALERT ACTIONS
  const acknowledgeAlert = useCallback((alertId: string) => {
    setNursingAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy: authState.user?.name } : a));
    toast.info('Alert Acknowledged', 'Nursing staff acknowledged alert.');
  }, [authState.user, toast]);

  const resolveAlert = useCallback((alertId: string) => {
    setNursingAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    toast.success('Alert Resolved', 'Alert resolved successfully.');
  }, [toast]);

  return (
    <NursingContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedAdmissionId,
        setSelectedAdmissionId,
        selectedAdmission,
        selectedPatient,
        admissions: DEMO_ADMISSIONS,
        patients: DEMO_PATIENTS,
        doctors: DEMO_DOCTORS,
        beds: DEMO_BEDS,
        wards: DEMO_WARDS,
        assignments,
        shiftRosters,
        vitalsList,
        carePlans,
        nursingTasks,
        marRecords,
        ivInfusions,
        intakeOutputLogs,
        assessments,
        wounds,
        woundDressingLogs,
        handovers,
        doctorOrders,
        sampleCollections,
        dischargeChecklists,
        patientEducationLogs,
        incidentReports,
        nursingAlerts,
        nursingNotes,
        kpis,
        searchQuery,
        setSearchQuery,
        recordVitals,
        recordNursingNote,
        saveCarePlan,
        updateCarePlanStatus,
        createNursingTask,
        updateTaskStatus,
        administerMARMedication,
        holdMARMedication,
        markMARMissed,
        recordIVInfusion,
        updateIVInfusionStatus,
        recordIntakeOutput,
        recordSystemAssessment,
        recordWound,
        recordWoundDressing,
        createShiftHandover,
        acknowledgeHandover,
        assignNurseToPatients,
        updateShiftRoster,
        acknowledgeDoctorOrder,
        completeDoctorOrder,
        createDoctorOrder,
        collectLabSample,
        sendSampleToLab,
        updateDischargeChecklist,
        recordPatientEducation,
        reportIncident,
        resolveIncident,
        acknowledgeAlert,
        resolveAlert,
      }}
    >
      {children}
    </NursingContext.Provider>
  );
}

export function useNursing() {
  const context = useContext(NursingContext);
  if (!context) {
    throw new Error('useNursing must be used within a NursingProvider');
  }
  return context;
}
