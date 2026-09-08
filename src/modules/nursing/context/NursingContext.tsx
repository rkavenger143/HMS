import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Admission,
  Patient,
  Doctor,
  Bed,
  Ward,
  Nurse,
  NursingEmergencyAlert,
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
  DEMO_NURSES,
} from '../../../data/seedData';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export type NursingTab =
  // Core 9 tabs
  | 'dashboard'
  | 'nurses'
  | 'shifts'
  | 'patients'
  | 'tasks'
  | 'medication'
  | 'vitals'
  | 'notes'
  | 'handover'
  // Backward compatibility aliases
  | 'mar'
  | 'patient_profile'
  | 'care_plans'
  | 'iv_infusion'
  | 'intake_output'
  | 'assessment'
  | 'wound_care'
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
  nurses: Nurse[];
  emergencies: NursingEmergencyAlert[];

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

  // Nurse Management Actions
  addNurse: (nurseData: Omit<Nurse, 'id'>) => Nurse;
  updateNurse: (nurseId: string, updates: Partial<Nurse>) => void;
  deleteNurse: (nurseId: string) => void;

  // Emergency Reporting Actions
  reportEmergency: (data: {
    type: NursingEmergencyAlert['type'];
    patientId?: string;
    patientName?: string;
    admissionId?: string;
    bedNumber?: string;
    ward: string;
    description: string;
  }) => NursingEmergencyAlert;
  resolveEmergency: (emergencyId: string) => void;

  // Vitals Actions
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

  // Notes Actions
  recordNursingNote: (noteData: Partial<IPDNursingNote>) => IPDNursingNote;

  // Care Plan Actions
  saveCarePlan: (planData: Partial<NursingCarePlan>) => NursingCarePlan;
  updateCarePlanStatus: (planId: string, status: NursingCarePlan['status'], progressNotes?: string) => void;

  // Task Actions
  createNursingTask: (taskData: Partial<IPDNursingTask>) => IPDNursingTask;
  updateTaskStatus: (taskId: string, status: IPDNursingTask['status']) => void;

  // MAR Actions
  administerMARMedication: (data: {
    recordId: string;
    verifiedPatient: boolean;
    remarks?: string;
  }) => void;
  holdMARMedication: (recordId: string, reason: string) => void;
  markMARMissed: (recordId: string, reason: string) => void;

  // Shift & Handover Actions
  createShiftHandover: (data: Partial<NursingHandoverRecord>) => NursingHandoverRecord;
  acknowledgeHandover: (handoverId: string) => void;
  assignNurseToPatients: (assignment: Partial<NursingAssignment>) => NursingAssignment;
  updateShiftRoster: (roster: Partial<NursingShiftRoster>) => NursingShiftRoster;

  // Legacy Helpers preserved for compatibility
  recordIVInfusion: (data: Partial<IVInfusionRecord>) => IVInfusionRecord;
  updateIVInfusionStatus: (infusionId: string, status: IVInfusionRecord['status']) => void;
  recordIntakeOutput: (data: Partial<IntakeOutputRecord>) => IntakeOutputRecord;
  recordSystemAssessment: (data: Partial<SystemAssessment>) => SystemAssessment;
  recordWound: (data: Partial<WoundRecord>) => WoundRecord;
  recordWoundDressing: (data: Partial<WoundDressingLog>) => WoundDressingLog;
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
  NURSES: 'aln_hms_nursing_nurses_v1',
  EMERGENCIES: 'aln_hms_nursing_emergencies_v1',
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
    nurseId: 'nur-001',
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
    nurseId: 'nur-002',
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
    nurseId: 'nur-003',
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
  { id: 'shf-001', shift: 'morning', ward: 'General Ward A', nurseId: 'nur-001', nurseName: 'Kavitha Nair', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-002', shift: 'morning', ward: 'Medical ICU', nurseId: 'nur-002', nurseName: 'Rekha Sharma', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-003', shift: 'morning', ward: 'Private Ward', nurseId: 'nur-003', nurseName: 'Suman Lata', startTime: '07:00', endTime: '15:00', date: '2026-08-31', status: 'on_duty' },
  { id: 'shf-004', shift: 'afternoon', ward: 'General Ward A', nurseId: 'nur-004', nurseName: 'Preethi Mathew', startTime: '15:00', endTime: '23:00', date: '2026-08-31', status: 'scheduled' },
  { id: 'shf-005', shift: 'night', ward: 'General Ward B', nurseId: 'nur-005', nurseName: 'Anitha Varma', startTime: '23:00', endTime: '07:00', date: '2026-08-31', status: 'scheduled' },
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
    recordedBy: 'Nurse Kavitha',
    remarks: 'Patient resting comfortably. Post-op Day 1.',
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
    temperature: 101.2,
    spo2: 93,
    respiratoryRate: 24,
    bloodSugar: 210,
    painScore: 6,
    weight: 82,
    height: 168,
    bmi: 29.1,
    consciousness: 'alert',
    isAbnormal: true,
    abnormalFlags: ['High BP (148/96)', 'Tachycardia (108 bpm)', 'High Temp (101.2°F)', 'Low SpO2 (93%)'],
    recordedBy: 'Nurse Rekha',
    remarks: 'Patient complaining of acute shortness of breath. Oxygen started at 4L/min.',
  },
  {
    id: 'cv-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    recordedAt: '2026-08-31 08:15',
    bloodPressure: '116/74',
    systolic: 116,
    diastolic: 74,
    pulse: 82,
    temperature: 99.1,
    spo2: 99,
    respiratoryRate: 18,
    bloodSugar: 98,
    painScore: 2,
    weight: 64,
    height: 160,
    bmi: 25.0,
    consciousness: 'alert',
    isAbnormal: false,
    abnormalFlags: [],
    recordedBy: 'Nurse Suman',
    remarks: 'Morning vitals recorded. Tolerating oral fluids well.',
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
    medicineName: 'Inj. Ceftriaxone 1g',
    dose: '1g IV',
    route: 'IV',
    frequency: 'Twice Daily (BD)',
    scheduledDate: '2026-08-31',
    scheduledTime: '08:00',
    administeredTime: '2026-08-31 08:05',
    status: 'administered',
    nurseName: 'Kavitha Nair',
    verifiedPatient: true,
    remarks: 'Infused over 30 mins in 100ml NS. No adverse reaction.',
  },
  {
    id: 'mar-002',
    medicationId: 'med-002',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    medicineName: 'Tab. Pantoprazole 40mg',
    dose: '40mg Oral',
    route: 'Oral',
    frequency: 'Once Daily (OD)',
    scheduledDate: '2026-08-31',
    scheduledTime: '07:00',
    administeredTime: '2026-08-31 07:10',
    status: 'administered',
    nurseName: 'Kavitha Nair',
    verifiedPatient: true,
    remarks: 'Given before breakfast.',
  },
  {
    id: 'mar-003',
    medicationId: 'med-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    medicineName: 'Inj. Meropenem 1g',
    dose: '1g IV',
    route: 'IV',
    frequency: 'Thrice Daily (TDS)',
    scheduledDate: '2026-08-31',
    scheduledTime: '14:00',
    status: 'scheduled',
    verifiedPatient: false,
    remarks: 'Scheduled afternoon dose.',
  },
  {
    id: 'mar-004',
    medicationId: 'med-004',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    medicineName: 'Inj. Enoxaparin 40mg (Clexane)',
    dose: '40mg SC',
    route: 'Subcutaneous',
    frequency: 'Once Daily (OD)',
    scheduledDate: '2026-08-31',
    scheduledTime: '10:00',
    administeredTime: '2026-08-31 10:05',
    status: 'administered',
    nurseName: 'Rekha Sharma',
    verifiedPatient: true,
    remarks: 'Injected in left abdominal flank.',
  },
  {
    id: 'mar-005',
    medicationId: 'med-005',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    bedNumber: 'PR-01',
    medicineName: 'Tab. Paracetamol 650mg',
    dose: '650mg Oral',
    route: 'Oral',
    frequency: 'As Needed (SOS)',
    scheduledDate: '2026-08-31',
    scheduledTime: '12:00',
    status: 'scheduled',
    verifiedPatient: false,
    remarks: 'For post-op pain > 4/10.',
  },
];

const INITIAL_TASKS: IPDNursingTask[] = [
  {
    id: 'tsk-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'GA-01',
    taskType: 'vitals_due',
    title: 'Q4H Vitals Check & SpO2 Monitoring',
    description: 'Check BP, Pulse, SpO2, and surgical site dressing integrity.',
    dueTime: '12:00',
    priority: 'routine',
    status: 'pending',
    assignedNurse: 'Kavitha Nair',
    createdAt: '2026-08-31 07:30',
  },
  {
    id: 'tsk-002',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-01',
    taskType: 'medication_due',
    title: 'Administer Inj. Meropenem 1g IV Infusion',
    description: 'Reconstitute in 100ml NS and infuse over 30 mins.',
    dueTime: '14:00',
    priority: 'urgent',
    status: 'pending',
    assignedNurse: 'Rekha Sharma',
    createdAt: '2026-08-31 08:00',
  },
  {
    id: 'tsk-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00002',
    patientName: 'Lakshmi Krishnan',
    bedNumber: 'PR-01',
    taskType: 'dressing_changes',
    title: 'Sterile Laparoscopic Wound Dressing',
    description: 'Clean port sites with Betadine and apply waterproof Opsite dressing.',
    dueTime: '11:00',
    priority: 'routine',
    status: 'completed',
    completedAt: '2026-08-31 11:15',
    assignedNurse: 'Suman Lata',
    createdAt: '2026-08-31 07:00',
  },
];

const INITIAL_EMERGENCIES: NursingEmergencyAlert[] = [
  {
    id: 'emg-001',
    type: 'critical_patient',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    admissionId: 'adm-004',
    bedNumber: 'MICU-01',
    ward: 'Medical ICU',
    reportedBy: 'Nurse Rekha Sharma',
    reportedAt: '2026-08-31 08:32',
    description: 'Acute desaturation to 93% on room air with tachycardia 108 bpm. Attending doctor alerted.',
    status: 'active',
  },
];

const INITIAL_HANDOVERS: NursingHandoverRecord[] = [
  {
    id: 'hnd-001',
    fromNurseId: 'nur-005',
    fromNurseName: 'Anitha Varma',
    toNurseId: 'nur-001',
    toNurseName: 'Kavitha Nair',
    shift: 'morning',
    date: '2026-08-31',
    time: '07:00',
    ward: 'General Ward A',
    patientHandovers: [
      {
        admissionId: 'adm-001',
        patientName: 'Ramesh Yadav',
        bedNumber: 'GA-01',
        condition: 'Stable & Resting',
        importantNotes: 'Post-op Lap Chole Day 1. Slept well. No active bleeding.',
        pendingTasks: 'Morning CBC sample pending collection.',
        medicationDue: 'Inj. Ceftriaxone 1g at 08:00',
        doctorOrders: 'Start clear liquids after rounds',
      },
    ],
    generalWardNotes: 'All emergency oxygen cylinders verified. Ward inventory complete.',
    status: 'acknowledged',
    acknowledgedBy: 'Kavitha Nair',
    acknowledgedAt: '2026-08-31 07:15',
    createdAt: '2026-08-31 07:00',
  },
];

export function NursingProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<NursingTab>('dashboard');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>('adm-001');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Nurses Master State
  const [nurses, setNurses] = useState<Nurse[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.NURSES);
      return s ? JSON.parse(s) : DEMO_NURSES;
    } catch {
      return DEMO_NURSES;
    }
  });

  // 2. Emergency Alerts State
  const [emergencies, setEmergencies] = useState<NursingEmergencyAlert[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.EMERGENCIES);
      return s ? JSON.parse(s) : INITIAL_EMERGENCIES;
    } catch {
      return INITIAL_EMERGENCIES;
    }
  });

  // 3. Shifts & Allocations
  const [assignments, setAssignments] = useState<NursingAssignment[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS); return s ? JSON.parse(s) : INITIAL_ASSIGNMENTS; } catch { return INITIAL_ASSIGNMENTS; }
  });

  const [shiftRosters, setShiftRosters] = useState<NursingShiftRoster[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.SHIFTS); return s ? JSON.parse(s) : INITIAL_SHIFTS; } catch { return INITIAL_SHIFTS; }
  });

  // 4. Vitals & MAR
  const [vitalsList, setVitalsList] = useState<ComprehensiveVitals[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.VITALS); return s ? JSON.parse(s) : INITIAL_COMPREHENSIVE_VITALS; } catch { return INITIAL_COMPREHENSIVE_VITALS; }
  });

  const [marRecords, setMarRecords] = useState<MARRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.MAR); return s ? JSON.parse(s) : INITIAL_MAR; } catch { return INITIAL_MAR; }
  });

  // 5. Tasks & Notes
  const [nursingTasks, setNursingTasks] = useState<IPDNursingTask[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.TASKS); return s ? JSON.parse(s) : INITIAL_TASKS; } catch { return INITIAL_TASKS; }
  });

  const [nursingNotes, setNursingNotes] = useState<IPDNursingNote[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.NOTES); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // 6. Handovers
  const [handovers, setHandovers] = useState<NursingHandoverRecord[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.HANDOVERS); return s ? JSON.parse(s) : INITIAL_HANDOVERS; } catch { return INITIAL_HANDOVERS; }
  });

  // Compatibility states
  const [carePlans, setCarePlans] = useState<NursingCarePlan[]>([]);
  const [ivInfusions, setIvInfusions] = useState<IVInfusionRecord[]>([]);
  const [intakeOutputLogs, setIntakeOutputLogs] = useState<IntakeOutputRecord[]>([]);
  const [assessments, setAssessments] = useState<SystemAssessment[]>([]);
  const [wounds, setWounds] = useState<WoundRecord[]>([]);
  const [woundDressingLogs, setWoundDressingLogs] = useState<WoundDressingLog[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<NursingDoctorOrder[]>([]);
  const [sampleCollections, setSampleCollections] = useState<LabSampleCollection[]>([]);
  const [dischargeChecklists, setDischargeChecklists] = useState<Record<string, DischargeChecklistRecord>>({});
  const [patientEducationLogs, setPatientEducationLogs] = useState<PatientEducationRecord[]>([]);
  const [incidentReports, setIncidentReports] = useState<NursingIncidentReport[]>([]);
  const [nursingAlerts, setNursingAlerts] = useState<NursingAlert[]>([]);

  // Persistent storage synchronizers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NURSES, JSON.stringify(nurses));
      window.dispatchEvent(new CustomEvent('hms_storage_updated'));
    } catch (e) { console.warn(e); }
  }, [nurses]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCIES, JSON.stringify(emergencies));
      window.dispatchEvent(new CustomEvent('hms_storage_updated'));
    } catch (e) { console.warn(e); }
  }, [emergencies]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); } catch (e) { console.warn(e); } }, [assignments]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shiftRosters)); } catch (e) { console.warn(e); } }, [shiftRosters]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitalsList)); } catch (e) { console.warn(e); } }, [vitalsList]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.MAR, JSON.stringify(marRecords)); } catch (e) { console.warn(e); } }, [marRecords]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(nursingTasks)); } catch (e) { console.warn(e); } }, [nursingTasks]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(nursingNotes)); } catch (e) { console.warn(e); } }, [nursingNotes]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.HANDOVERS, JSON.stringify(handovers)); } catch (e) { console.warn(e); } }, [handovers]);

  // Selected Inpatient
  const selectedAdmission = useMemo(() => {
    if (!selectedAdmissionId) return DEMO_ADMISSIONS[0];
    return DEMO_ADMISSIONS.find(a => a.id === selectedAdmissionId) || DEMO_ADMISSIONS[0];
  }, [selectedAdmissionId]);

  const selectedPatient = useMemo(() => {
    if (!selectedAdmission) return DEMO_PATIENTS[0];
    return DEMO_PATIENTS.find(p => p.id === selectedAdmission.patientId) || DEMO_PATIENTS[0];
  }, [selectedAdmission]);

  // Determine current active shift dynamically based on time
  const currentShift = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 15) return 'Morning Shift (07:00 - 15:00)';
    if (hour >= 15 && hour < 23) return 'Evening Shift (15:00 - 23:00)';
    return 'Night Shift (23:00 - 07:00)';
  }, []);

  // Computed 7-Stat Core KPIs
  const kpis: NursingDashboardKPIs = useMemo(() => {
    const activeAdmissions = DEMO_ADMISSIONS.filter(a => a.status === 'active');
    const totalAssignedPatients = activeAdmissions.length;
    const assignedPatientsCount = totalAssignedPatients;
    const onDutyNursesCount = nurses.filter(n => n.status === 'on_duty').length;
    const criticalPatientsCount = activeAdmissions.filter(a =>
      a.ward.toLowerCase().includes('icu') ||
      a.condition === 'critical' ||
      a.condition === 'serious' ||
      a.priority === 'emergency' ||
      a.priority === 'critical'
    ).length;
    const patientsRequiringAttention = vitalsList.filter(v => v.isAbnormal).length + criticalPatientsCount;
    const vitalsDueCount = activeAdmissions.filter(a => !vitalsList.some(v => v.admissionId === a.id && v.recordedAt.includes('2026-08-31'))).length || 2;
    const medicationDueCount = marRecords.filter(m => m.status === 'scheduled').length;
    const medicationOverdueCount = marRecords.filter(m => m.status === 'missed').length;
    const tasksPendingCount = nursingTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const doctorOrdersPendingCount = 0;
    const newAdmissionsCount = activeAdmissions.filter(a => a.admissionDate === '2026-08-31').length;
    const patientsForDischargeCount = activeAdmissions.filter(a => a.dischargeReadiness === 'ready_for_discharge').length;

    return {
      totalAssignedPatients,
      assignedPatientsCount,
      onDutyNursesCount,
      currentShift,
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
  }, [nurses, vitalsList, marRecords, nursingTasks, currentShift]);

  // 1. NURSE MANAGEMENT ACTIONS
  const addNurse = useCallback((nurseData: Omit<Nurse, 'id'>) => {
    const newId = `nur-${String(nurses.length + 1).padStart(3, '0')}`;
    const newNurse: Nurse = {
      ...nurseData,
      id: newId,
      joinedDate: nurseData.joinedDate || new Date().toISOString().slice(0, 10),
    };
    setNurses(prev => [newNurse, ...prev]);
    toast.success('Nurse Added', `Registered ${newNurse.name} (${newNurse.employeeId}) to ${newNurse.ward}`);
    return newNurse;
  }, [nurses.length, toast]);

  const updateNurse = useCallback((nurseId: string, updates: Partial<Nurse>) => {
    setNurses(prev => prev.map(n => n.id === nurseId ? { ...n, ...updates } : n));
    toast.info('Nurse Profile Updated', 'Nurse details updated successfully.');
  }, [toast]);

  const deleteNurse = useCallback((nurseId: string) => {
    setNurses(prev => prev.filter(n => n.id !== nurseId));
    toast.warning('Nurse Removed', 'Nurse record removed from hospital roster.');
  }, [toast]);

  // 2. EMERGENCY REPORTING ACTIONS
  const reportEmergency = useCallback((data: {
    type: NursingEmergencyAlert['type'];
    patientId?: string;
    patientName?: string;
    admissionId?: string;
    bedNumber?: string;
    ward: string;
    description: string;
  }) => {
    const newEmergency: NursingEmergencyAlert = {
      id: `emg-${Date.now().toString().slice(-4)}`,
      type: data.type,
      patientId: data.patientId,
      patientName: data.patientName,
      admissionId: data.admissionId,
      bedNumber: data.bedNumber,
      ward: data.ward,
      reportedBy: authState.user?.name || 'Duty Nurse',
      reportedAt: `2026-08-31 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      description: data.description,
      status: 'active',
    };

    setEmergencies(prev => [newEmergency, ...prev]);
    toast.error('🚨 EMERGENCY BROADCAST ACTIVATED', `${data.type.toUpperCase()}: Bed ${data.bedNumber || 'N/A'} (${data.ward})`);
    return newEmergency;
  }, [authState.user, toast]);

  const resolveEmergency = useCallback((emergencyId: string) => {
    setEmergencies(prev => prev.map(e => e.id === emergencyId ? {
      ...e,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      respondedBy: authState.user?.name || 'Duty Team',
    } : e));
    toast.success('Emergency Resolved', 'Emergency alert marked as resolved.');
  }, [authState.user, toast]);

  // 3. RAPID VITALS RECORDING
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

    // Detect abnormal values
    const abnormalFlags: string[] = [];
    if (vitalsData.temperature > 100.4) abnormalFlags.push(`High Temp (${vitalsData.temperature}°F)`);
    if (vitalsData.temperature < 96.0) abnormalFlags.push(`Low Temp (${vitalsData.temperature}°F)`);
    if (vitalsData.spo2 < 95) abnormalFlags.push(`Low SpO2 (${vitalsData.spo2}%)`);
    if (vitalsData.systolic > 140 || vitalsData.diastolic > 90) abnormalFlags.push(`High BP (${vitalsData.systolic}/${vitalsData.diastolic})`);
    if (vitalsData.systolic < 90 || vitalsData.diastolic < 60) abnormalFlags.push(`Low BP (${vitalsData.systolic}/${vitalsData.diastolic})`);
    if (vitalsData.pulse > 100) abnormalFlags.push(`High HR (${vitalsData.pulse} bpm)`);
    if (vitalsData.pulse < 60) abnormalFlags.push(`Low HR (${vitalsData.pulse} bpm)`);

    const isAbnormal = abnormalFlags.length > 0;

    const newReading: ComprehensiveVitals = {
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
      painScore: vitalsData.painScore,
      weight: vitalsData.weight,
      height: vitalsData.height,
      bmi,
      consciousness: vitalsData.consciousness || 'alert',
      isAbnormal,
      abnormalFlags,
      recordedBy: authState.user?.name || 'Staff Nurse',
      remarks: vitalsData.remarks,
    };

    setVitalsList(prev => [newReading, ...prev]);

    if (isAbnormal) {
      toast.warning('⚠️ Abnormal Vitals Recorded', `${adm.patientName}: ${abnormalFlags.join(', ')}`);
    } else {
      toast.success('Vitals Charted Successfully', `Recorded BP ${newReading.bloodPressure}, SpO2 ${newReading.spo2}% for ${adm.patientName}`);
    }

    return newReading;
  }, [authState.user, toast]);

  // 4. NURSING CLINICAL NOTES
  const recordNursingNote = useCallback((noteData: Partial<IPDNursingNote>) => {
    const adm = DEMO_ADMISSIONS.find(a => a.id === noteData.admissionId) || selectedAdmission;

    const newNote: IPDNursingNote = {
      id: `nt-${Date.now().toString().slice(-4)}`,
      admissionId: noteData.admissionId || adm.id,
      patientId: noteData.patientId || adm.patientId,
      patientName: noteData.patientName || adm.patientName,
      nurseId: authState.user?.id || 'nur-001',
      nurseName: authState.user?.name || 'Kavitha Nair',
      shift: noteData.shift || 'morning',
      noteDate: '2026-08-31',
      noteTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      observations: noteData.observations || 'Patient evaluated. Routine nursing care provided.',
      nursingProcedures: noteData.nursingProcedures,
      careInstructions: noteData.careInstructions,
      createdAt: new Date().toISOString(),
    };

    setNursingNotes(prev => [newNote, ...prev]);
    toast.success('Clinical Note Saved', `Documented shift notes for ${newNote.patientName}`);
    return newNote;
  }, [selectedAdmission, authState.user, toast]);

  // 5. NURSING TASKS
  const createNursingTask = useCallback((taskData: Partial<IPDNursingTask>) => {
    const adm = DEMO_ADMISSIONS.find(a => a.id === taskData.admissionId) || selectedAdmission;

    const newTask: IPDNursingTask = {
      id: `tsk-${Date.now().toString().slice(-4)}`,
      admissionId: taskData.admissionId || adm.id,
      patientId: taskData.patientId || adm.patientId,
      patientName: taskData.patientName || adm.patientName,
      bedNumber: taskData.bedNumber || adm.bedNumber,
      taskType: taskData.taskType || 'patient_monitoring',
      title: taskData.title || 'Bedside Care Task',
      description: taskData.description || 'Routine nursing monitoring',
      dueTime: taskData.dueTime || '14:00',
      priority: taskData.priority || 'routine',
      status: 'pending',
      assignedNurse: taskData.assignedNurse || authState.user?.name || 'Duty Nurse',
      createdAt: new Date().toISOString(),
    };

    setNursingTasks(prev => [newTask, ...prev]);
    toast.success('Nursing Task Added', `Created task "${newTask.title}" for ${newTask.patientName}`);
    return newTask;
  }, [selectedAdmission, authState.user, toast]);

  const updateTaskStatus = useCallback((taskId: string, status: IPDNursingTask['status']) => {
    setNursingTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    } : t));
    toast.info('Task Status Updated', `Task marked as ${status.replace('_', ' ').toUpperCase()}`);
  }, [toast]);

  // 6. MEDICATION ADMINISTRATION (MAR)
  const administerMARMedication = useCallback((data: {
    recordId: string;
    verifiedPatient: boolean;
    remarks?: string;
  }) => {
    const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const currentNurse = authState.user?.name || 'Kavitha Nair';

    setMarRecords(prev => prev.map(m => m.id === data.recordId ? {
      ...m,
      status: 'administered',
      administeredTime: `2026-08-31 ${timeNow}`,
      nurseName: currentNurse,
      verifiedPatient: data.verifiedPatient,
      remarks: data.remarks || m.remarks,
    } : m));

    const rec = marRecords.find(m => m.id === data.recordId);
    toast.success('Medication Administered', `Recorded dose for ${rec?.medicineName} (${rec?.patientName})`);
  }, [marRecords, authState.user, toast]);

  const holdMARMedication = useCallback((recordId: string, reason: string) => {
    setMarRecords(prev => prev.map(m => m.id === recordId ? {
      ...m,
      status: 'held',
      reasonForHoldMissed: reason,
      nurseName: authState.user?.name || 'Duty Nurse',
    } : m));
    toast.warning('Medication Held', `Medication placed on clinical hold: ${reason}`);
  }, [authState.user, toast]);

  const markMARMissed = useCallback((recordId: string, reason: string) => {
    setMarRecords(prev => prev.map(m => m.id === recordId ? {
      ...m,
      status: 'missed',
      reasonForHoldMissed: reason,
      nurseName: authState.user?.name || 'Duty Nurse',
    } : m));
    toast.error('Medication Missed', `Dose marked as missed: ${reason}`);
  }, [authState.user, toast]);

  // 7. SHIFT HANDOVER
  const createShiftHandover = useCallback((data: Partial<NursingHandoverRecord>) => {
    const newHandover: NursingHandoverRecord = {
      id: `hnd-${Date.now().toString().slice(-4)}`,
      fromNurseId: authState.user?.id || 'nur-001',
      fromNurseName: authState.user?.name || 'Kavitha Nair',
      toNurseId: data.toNurseId || 'nur-004',
      toNurseName: data.toNurseName || 'Preethi Mathew',
      shift: data.shift || 'morning',
      date: '2026-08-31',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      ward: data.ward || 'General Ward A',
      patientHandovers: data.patientHandovers || [],
      generalWardNotes: data.generalWardNotes || 'Ward equipment and crash cart verified.',
      status: 'pending_acknowledgement',
      createdAt: new Date().toISOString(),
    };

    setHandovers(prev => [newHandover, ...prev]);
    toast.success('Shift Handover Generated', `Handoff created for ${newHandover.ward} (${newHandover.shift.toUpperCase()})`);
    return newHandover;
  }, [authState.user, toast]);

  const acknowledgeHandover = useCallback((handoverId: string) => {
    setHandovers(prev => prev.map(h => h.id === handoverId ? {
      ...h,
      status: 'acknowledged',
      acknowledgedBy: authState.user?.name || 'Incoming Nurse',
      acknowledgedAt: `2026-08-31 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
    } : h));
    toast.success('Handover Acknowledged', 'Shift handoff signed off and accepted.');
  }, [authState.user, toast]);

  // 8. SHIFT ASSIGNMENT
  const assignNurseToPatients = useCallback((assignment: Partial<NursingAssignment>) => {
    const newAssignment: NursingAssignment = {
      id: `asg-${Date.now().toString().slice(-4)}`,
      nurseId: assignment.nurseId || 'nur-001',
      nurseName: assignment.nurseName || 'Kavitha Nair',
      employeeId: assignment.employeeId || 'EMP-NUR-101',
      shift: assignment.shift || 'morning',
      ward: assignment.ward || 'General Ward A',
      assignedPatientIds: assignment.assignedPatientIds || [],
      patientCount: assignment.assignedPatientIds?.length || 0,
      date: '2026-08-31',
      status: 'active',
    };
    setAssignments(prev => [newAssignment, ...prev]);
    toast.success('Patients Assigned', `Mapped ${newAssignment.patientCount} patients to Nurse ${newAssignment.nurseName}`);
    return newAssignment;
  }, [toast]);

  const updateShiftRoster = useCallback((roster: Partial<NursingShiftRoster>) => {
    const newRoster: NursingShiftRoster = {
      id: `shf-${Date.now().toString().slice(-4)}`,
      shift: roster.shift || 'morning',
      ward: roster.ward || 'General Ward A',
      nurseId: roster.nurseId || 'nur-001',
      nurseName: roster.nurseName || 'Kavitha Nair',
      startTime: roster.startTime || '07:00',
      endTime: roster.endTime || '15:00',
      date: roster.date || '2026-08-31',
      status: roster.status || 'on_duty',
    };
    setShiftRosters(prev => [newRoster, ...prev]);
    toast.success('Shift Schedule Updated', `Assigned ${newRoster.nurseName} to ${newRoster.shift.toUpperCase()} Shift`);
    return newRoster;
  }, [toast]);

  // Compatibility helpers
  const saveCarePlan = useCallback((p: Partial<NursingCarePlan>) => ({ id: 'cp-001', ...p } as NursingCarePlan), []);
  const updateCarePlanStatus = useCallback(() => {}, []);
  const recordIVInfusion = useCallback((iv: Partial<IVInfusionRecord>) => ({ id: 'iv-001', ...iv } as IVInfusionRecord), []);
  const updateIVInfusionStatus = useCallback(() => {}, []);
  const recordIntakeOutput = useCallback((io: Partial<IntakeOutputRecord>) => ({ id: 'io-001', ...io } as IntakeOutputRecord), []);
  const recordSystemAssessment = useCallback((sa: Partial<SystemAssessment>) => ({ id: 'sa-001', ...sa } as SystemAssessment), []);
  const recordWound = useCallback((w: Partial<WoundRecord>) => ({ id: 'w-001', ...w } as WoundRecord), []);
  const recordWoundDressing = useCallback((wd: Partial<WoundDressingLog>) => ({ id: 'wd-001', ...wd } as WoundDressingLog), []);
  const acknowledgeDoctorOrder = useCallback(() => {}, []);
  const completeDoctorOrder = useCallback(() => {}, []);
  const createDoctorOrder = useCallback((o: Partial<NursingDoctorOrder>) => ({ id: 'do-001', ...o } as NursingDoctorOrder), []);
  const collectLabSample = useCallback(() => {}, []);
  const sendSampleToLab = useCallback(() => {}, []);
  const updateDischargeChecklist = useCallback((_id: string, c: Partial<DischargeChecklistRecord>) => (c as DischargeChecklistRecord), []);
  const recordPatientEducation = useCallback((pe: Partial<PatientEducationRecord>) => ({ id: 'pe-001', ...pe } as PatientEducationRecord), []);
  const reportIncident = useCallback((i: Partial<NursingIncidentReport>) => ({ id: 'inc-001', ...i } as NursingIncidentReport), []);
  const resolveIncident = useCallback(() => {}, []);
  const acknowledgeAlert = useCallback(() => {}, []);
  const resolveAlert = useCallback(() => {}, []);

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
        nurses,
        emergencies,
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
        addNurse,
        updateNurse,
        deleteNurse,
        reportEmergency,
        resolveEmergency,
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
