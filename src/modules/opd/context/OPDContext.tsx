import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  OPDVisit,
  OPDQueueItem,
  OPDDiagnosisItem,
  OPDMedicineItem,
  OPDFollowUp,
  OPDBillingSummary,
  OPDDashboardKPIs,
  OPDVisitStatus,
  OPDVisitType,
  OPDQueuePriority,
  Patient,
  Doctor,
  Department,
  Appointment,
  Consultation,
  LabRequest,
  RadiologyStudy,
  Bill,
  PaymentMode,
  Vitals,
} from '../../../types';
import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_DEPARTMENTS,
  DEMO_APPOINTMENTS,
  DEMO_CONSULTATIONS,
  DEMO_LAB_REQUESTS,
  DEMO_RADIOLOGY_STUDIES,
  DEMO_BILLS,
  DEMO_PRESCRIPTIONS,
} from '../../../data/seedData';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export type OPDTab =
  | 'dashboard'
  | 'patients'
  | 'registration'
  | 'appointments'
  | 'billing'
  | 'queue'
  | 'todays_patients'
  | 'consultation'
  | 'vitals'
  | 'prescriptions'
  | 'follow_ups'
  | 'history'
  | 'reports'
  | 'settings';

export interface OPDContextType {
  // Navigation
  activeTab: OPDTab;
  setActiveTab: (tab: OPDTab) => void;

  // Master Data
  visits: OPDVisit[];
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: any[];
  labRequests: LabRequest[];
  radiologyOrders: RadiologyStudy[];
  bills: Bill[];
  followUps: OPDFollowUp[];

  // Selected State
  selectedVisit: OPDVisit | null;
  setSelectedVisit: (visit: OPDVisit | null) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (patientId: string | null) => void;

  // Queue & Token
  currentToken: number;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  kpis: OPDDashboardKPIs;

  // Actions
  registerPatientAndVisit: (patientData: Partial<Patient>, visitData: Partial<OPDVisit>) => { patient: Patient; visit: OPDVisit };
  registerExistingPatientVisit: (patientId: string, visitData: Partial<OPDVisit>) => OPDVisit;
  updateVisitStatus: (visitId: string, status: OPDVisitStatus) => void;
  updateVisitVitals: (visitId: string, vitals: Vitals) => void;
  callToken: (tokenNumber: number) => void;
  callNextInQueue: (doctorId?: string) => void;
  holdVisit: (visitId: string) => void;
  skipVisit: (visitId: string) => void;
  startConsultationForVisit: (visit: OPDVisit) => void;
  completeConsultation: (visitId: string, consultationData: Partial<Consultation>) => Consultation;
  savePrescription: (prescriptionData: any) => any;
  createLabOrder: (labData: any) => LabRequest;
  createDiagnosticOrder: (diagData: any) => RadiologyStudy;
  generateOPDBill: (billData: Partial<Bill>) => Bill;
  recordBillPayment: (billId: string, amount: number, mode: PaymentMode, ref?: string) => void;
  createFollowUp: (followUpData: Partial<OPDFollowUp>) => OPDFollowUp;
  updateFollowUpStatus: (id: string, status: OPDFollowUp['status']) => void;
  playChime: () => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;
}

const OPDContext = createContext<OPDContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VISITS: 'aln_hms_opd_visits_v1',
  PATIENTS: 'aln_hms_patients_v1',
  FOLLOW_UPS: 'aln_hms_opd_follow_ups_v1',
  CURRENT_TOKEN: 'aln_hms_opd_current_token_v1',
};

// Seed visits for realistic OPD flow
const INITIAL_OPD_VISITS: OPDVisit[] = [
  {
    id: 'OPD-2026-00101',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    patientAge: 48,
    patientGender: 'male',
    patientPhone: '9123456781',
    patientBloodGroup: 'B+',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    department: 'Cardiology',
    visitDate: '2026-08-31',
    visitTime: '09:00',
    visitType: 'new',
    tokenNumber: 1,
    priority: 'normal',
    status: 'completed',
    reasonForVisit: 'Exertional chest tightness and shortness of breath for 3 days',
    referralSource: 'Direct Walk-in',
    consultationFee: 800,
    paymentStatus: 'paid',
    consultationId: 'cons-001',
    vitals: {
      bloodPressure: '138/88',
      pulse: 78,
      temperature: 98.4,
      spo2: 98,
      respiratoryRate: 18,
      height: 172,
      weight: 76,
      bmi: 25.7,
    },
    createdAt: '2026-08-31T08:30:00',
    updatedAt: '2026-08-31T09:45:00',
  },
  {
    id: 'OPD-2026-00102',
    patientId: 'ALN-2026-00002',
    patientName: 'Sunita Mehra',
    patientAge: 38,
    patientGender: 'female',
    patientPhone: '9123456783',
    patientBloodGroup: 'O+',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sneha Patel',
    department: 'General Medicine',
    visitDate: '2026-08-31',
    visitTime: '09:30',
    visitType: 'new',
    tokenNumber: 2,
    priority: 'normal',
    status: 'in_consultation',
    reasonForVisit: 'High grade fever with chills and severe body ache for 2 days',
    referralSource: 'Direct Walk-in',
    consultationFee: 600,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '118/78',
      pulse: 92,
      temperature: 101.2,
      spo2: 97,
      respiratoryRate: 20,
      height: 158,
      weight: 58,
      bmi: 23.2,
    },
    createdAt: '2026-08-31T08:45:00',
    updatedAt: '2026-08-31T09:35:00',
  },
  {
    id: 'OPD-2026-00103',
    patientId: 'ALN-2026-00003',
    patientName: 'Anita Gupta',
    patientAge: 68,
    patientGender: 'female',
    patientPhone: '9123456785',
    patientBloodGroup: 'A+',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Singh',
    department: 'Orthopedics',
    visitDate: '2026-08-31',
    visitTime: '10:00',
    visitType: 'new',
    tokenNumber: 3,
    priority: 'senior',
    status: 'called',
    reasonForVisit: 'Severe bilateral knee pain with difficulty in weight bearing',
    referralSource: 'Direct Walk-in',
    consultationFee: 700,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '142/90',
      pulse: 74,
      temperature: 98.6,
      spo2: 96,
      respiratoryRate: 16,
      height: 152,
      weight: 64,
      bmi: 27.7,
    },
    createdAt: '2026-08-31T09:10:00',
    updatedAt: '2026-08-31T10:00:00',
  },
  {
    id: 'OPD-2026-00104',
    patientId: 'ALN-2026-00004',
    patientName: 'Priya Sharma',
    patientAge: 29,
    patientGender: 'female',
    patientPhone: '9123456787',
    patientBloodGroup: 'B-',
    doctorId: 'doc-004',
    doctorName: 'Dr. Kavita Verma',
    department: 'Gynecology',
    visitDate: '2026-08-31',
    visitTime: '10:30',
    visitType: 'follow_up',
    tokenNumber: 4,
    priority: 'normal',
    status: 'waiting',
    reasonForVisit: 'Antenatal second trimester routine check-up & ultrasound review',
    referralSource: 'Direct Walk-in',
    consultationFee: 650,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '110/70',
      pulse: 80,
      temperature: 98.4,
      spo2: 99,
      respiratoryRate: 18,
      height: 160,
      weight: 62,
      bmi: 24.2,
    },
    createdAt: '2026-08-31T09:40:00',
    updatedAt: '2026-08-31T09:40:00',
  },
  {
    id: 'OPD-2026-00105',
    patientId: 'ALN-2026-00005',
    patientName: 'Mohan Das',
    patientAge: 55,
    patientGender: 'male',
    patientPhone: '9876543210',
    patientBloodGroup: 'O-',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    department: 'Cardiology',
    visitDate: '2026-08-31',
    visitTime: '11:00',
    visitType: 'follow_up',
    tokenNumber: 5,
    priority: 'priority',
    status: 'waiting',
    reasonForVisit: 'Hypertension titration and fasting lipid profile review',
    referralSource: 'Direct Walk-in',
    consultationFee: 800,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '148/94',
      pulse: 84,
      temperature: 98.6,
      spo2: 98,
      respiratoryRate: 16,
      height: 168,
      weight: 82,
      bmi: 29.1,
    },
    createdAt: '2026-08-31T10:00:00',
    updatedAt: '2026-08-31T10:00:00',
  },
  {
    id: 'OPD-2026-00106',
    patientId: 'ALN-2026-00006',
    patientName: 'Aarav Patel',
    patientAge: 7,
    patientGender: 'male',
    patientPhone: '9123456790',
    patientBloodGroup: 'A+',
    doctorId: 'doc-005',
    doctorName: 'Dr. Vikram Shah',
    department: 'Pediatrics',
    visitDate: '2026-08-31',
    visitTime: '11:30',
    visitType: 'new',
    tokenNumber: 6,
    priority: 'normal',
    status: 'waiting',
    reasonForVisit: 'Persistent dry cough and wheezing at night',
    referralSource: 'Direct Walk-in',
    consultationFee: 600,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '95/60',
      pulse: 98,
      temperature: 99.1,
      spo2: 96,
      respiratoryRate: 24,
      height: 120,
      weight: 22,
      bmi: 15.3,
    },
    createdAt: '2026-08-31T10:15:00',
    updatedAt: '2026-08-31T10:15:00',
  },
  {
    id: 'OPD-2026-00107',
    patientId: 'ALN-2026-00007',
    patientName: 'Vikram Joshi',
    patientAge: 42,
    patientGender: 'male',
    patientPhone: '9123456792',
    patientBloodGroup: 'B+',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sneha Patel',
    department: 'General Medicine',
    visitDate: '2026-08-31',
    visitTime: '12:00',
    visitType: 'emergency',
    tokenNumber: 7,
    priority: 'emergency',
    status: 'waiting',
    reasonForVisit: 'Acute severe epigastric pain radiating to back with vomiting',
    referralSource: 'Emergency Triage',
    consultationFee: 600,
    paymentStatus: 'paid',
    vitals: {
      bloodPressure: '100/65',
      pulse: 104,
      temperature: 99.8,
      spo2: 95,
      respiratoryRate: 22,
      height: 175,
      weight: 70,
      bmi: 22.9,
    },
    createdAt: '2026-08-31T10:30:00',
    updatedAt: '2026-08-31T10:30:00',
  },
  {
    id: 'OPD-2026-00108',
    patientId: 'ALN-2026-00008',
    patientName: 'Meera Nair',
    patientAge: 51,
    patientGender: 'female',
    patientPhone: '9123456794',
    patientBloodGroup: 'AB-',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sneha Patel',
    department: 'General Medicine',
    visitDate: '2026-08-31',
    visitTime: '14:00',
    visitType: 'follow_up',
    tokenNumber: 8,
    priority: 'normal',
    status: 'cancelled',
    reasonForVisit: 'Thyroid profile titration',
    referralSource: 'Direct Walk-in',
    consultationFee: 600,
    paymentStatus: 'pending',
    createdAt: '2026-08-29T14:00:00',
    updatedAt: '2026-08-31T08:00:00',
  },
];

const INITIAL_FOLLOW_UPS: OPDFollowUp[] = [
  {
    id: 'fu-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    patientPhone: '9123456781',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    department: 'Cardiology',
    previousVisitId: 'OPD-2026-00101',
    followUpDate: '2026-09-07',
    reason: 'Repeat lipid profile and resting 12-lead ECG review',
    instructions: 'Strict low salt, low saturated fat diet. Report immediately if chest tightness recurs.',
    status: 'upcoming',
    createdAt: '2026-08-31T10:15:00',
  },
  {
    id: 'fu-002',
    patientId: 'ALN-2026-00005',
    patientName: 'Mohan Das',
    patientPhone: '9876543210',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sneha Patel',
    department: 'General Medicine',
    previousVisitId: 'OPD-2026-00106',
    followUpDate: '2026-09-02',
    reason: 'Fasting and Post Prandial blood glucose check',
    instructions: 'Overnight 10 hours fast required for fasting sample.',
    status: 'upcoming',
    createdAt: '2026-08-28T11:00:00',
  },
  {
    id: 'fu-003',
    patientId: 'ALN-2026-00004',
    patientName: 'Priya Sharma',
    patientPhone: '9123456787',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Singh',
    department: 'Orthopedics',
    previousVisitId: 'OPD-2026-00105',
    followUpDate: '2026-08-30',
    reason: 'Review knee joint X-ray and mobility check',
    instructions: 'Avoid prolonged cross-legged sitting.',
    status: 'missed',
    createdAt: '2026-08-20T10:00:00',
  },
];

export const STANDARD_ICD_DIAGNOSES: OPDDiagnosisItem[] = [
  { id: 'icd-1', code: 'I10', name: 'Essential (primary) hypertension', type: 'primary' },
  { id: 'icd-2', code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', type: 'primary' },
  { id: 'icd-3', code: 'J06.9', name: 'Acute upper respiratory infection, unspecified', type: 'primary' },
  { id: 'icd-4', code: 'I20.9', name: 'Angina pectoris, unspecified', type: 'primary' },
  { id: 'icd-5', code: 'M17.9', name: 'Osteoarthritis of knee, unspecified', type: 'primary' },
  { id: 'icd-6', code: 'A09', name: 'Infectious gastroenteritis and colitis, unspecified', type: 'primary' },
  { id: 'icd-7', code: 'J45.909', name: 'Unspecified asthma, uncomplicated', type: 'primary' },
  { id: 'icd-8', code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis', type: 'primary' },
  { id: 'icd-9', code: 'E03.9', name: 'Hypothyroidism, unspecified', type: 'primary' },
  { id: 'icd-10', code: 'N39.0', name: 'Urinary tract infection, site not specified', type: 'primary' },
  { id: 'icd-11', code: 'R51', name: 'Headache', type: 'secondary' },
  { id: 'icd-12', code: 'R10.9', name: 'Abdominal pain, unspecified', type: 'secondary' },
  { id: 'icd-13', code: 'K30', name: 'Functional dyspepsia', type: 'primary' },
  { id: 'icd-14', code: 'L20.9', name: 'Atopic dermatitis, unspecified', type: 'primary' },
  { id: 'icd-15', code: 'M54.5', name: 'Low back pain', type: 'primary' },
];

export const COMMON_OPD_RADIOLOGY = [
  { id: 'rad-1', name: 'Chest X-Ray (PA View)', modality: 'xray', price: 450 },
  { id: 'rad-2', name: 'Bilateral Knee X-Ray (AP/Lat)', modality: 'xray', price: 600 },
  { id: 'rad-3', name: 'Ultrasound Whole Abdomen', modality: 'ultrasound', price: 1200 },
  { id: 'rad-4', name: '12-Lead Electrocardiogram (ECG)', modality: 'ecg', price: 300 },
  { id: 'rad-5', name: '2D Echocardiography', modality: 'ultrasound', price: 2000 },
  { id: 'rad-6', name: 'Non-contrast CT Brain', modality: 'ct', price: 3500 },
  { id: 'rad-7', name: 'MRI Lumbar Spine', modality: 'mri', price: 6500 },
];

export function OPDProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<OPDTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return saved ? JSON.parse(saved) : DEMO_PATIENTS;
    } catch {
      return DEMO_PATIENTS;
    }
  });

  const [visits, setVisits] = useState<OPDVisit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
      return saved ? JSON.parse(saved) : INITIAL_OPD_VISITS;
    } catch {
      return INITIAL_OPD_VISITS;
    }
  });

  const [followUps, setFollowUps] = useState<OPDFollowUp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
    } catch {
      return INITIAL_FOLLOW_UPS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [consultations, setConsultations] = useState<Consultation[]>(DEMO_CONSULTATIONS);
  const [prescriptions, setPrescriptions] = useState<any[]>(DEMO_PRESCRIPTIONS);
  const [labRequests, setLabRequests] = useState<LabRequest[]>(DEMO_LAB_REQUESTS);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyStudy[]>(DEMO_RADIOLOGY_STUDIES);
  const [bills, setBills] = useState<Bill[]>(DEMO_BILLS);

  const [selectedVisit, setSelectedVisit] = useState<OPDVisit | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN);
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [visits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [followUps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TOKEN, currentToken.toString());
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [currentToken]);

  // Audio synthesizer chime for token calling
  const playChime = useCallback(() => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // AudioContext unavailable or blocked by browser gesture policies
    }
  }, [audioEnabled]);

  // Computed KPIs
  const kpis: OPDDashboardKPIs = useMemo(() => {
    const today = '2026-08-31';
    const todayVisits = visits.filter(v => v.visitDate === today);

    const totalPatientsToday = todayVisits.length;
    const newPatients = todayVisits.filter(v => v.visitType === 'new').length;
    const followUpPatients = todayVisits.filter(v => v.visitType === 'follow_up').length;
    const waitingPatients = todayVisits.filter(v => v.status === 'waiting' || v.status === 'called').length;
    const inConsultation = todayVisits.filter(v => v.status === 'in_consultation').length;
    const completedConsultations = todayVisits.filter(v => v.status === 'completed').length;
    const cancelledAppointments = todayVisits.filter(v => v.status === 'cancelled' || v.status === 'no_show').length;

    // Revenue calculation
    const todayRevenue = todayVisits.reduce((acc, v) => {
      if (v.paymentStatus === 'paid') return acc + (v.consultationFee || 0);
      return acc;
    }, 0);

    return {
      totalPatientsToday,
      newPatients,
      followUpPatients,
      waitingPatients,
      inConsultation,
      completedConsultations,
      cancelledAppointments,
      revenueToday: todayRevenue,
    };
  }, [visits]);

  // Register New Patient & Visit
  const registerPatientAndVisit = useCallback((patientData: Partial<Patient>, visitData: Partial<OPDVisit>) => {
    const nextUHIDNum = patients.length + 1;
    const paddedNum = String(nextUHIDNum).padStart(5, '0');
    const newUHID = patientData.id || `ALN-2026-${paddedNum}`;

    const newPatient: Patient = {
      id: newUHID,
      firstName: patientData.firstName || 'Unknown',
      lastName: patientData.lastName || '',
      dateOfBirth: patientData.dateOfBirth || '1990-01-01',
      gender: patientData.gender || 'male',
      phone: patientData.phone || '',
      email: patientData.email || '',
      address: patientData.address || '',
      city: patientData.city || 'Noida',
      state: patientData.state || 'Uttar Pradesh',
      pincode: patientData.pincode || '201301',
      bloodGroup: patientData.bloodGroup || 'O+',
      allergies: patientData.allergies || [],
      emergencyContact: patientData.emergencyContact || { name: '', relationship: '', phone: '' },
      registrationDate: new Date().toISOString().split('T')[0],
      isActive: true,
      aadhaar: patientData.aadhaar,
    };

    const nextToken = visits.filter(v => v.visitDate === (visitData.visitDate || '2026-08-31')).length + 1;
    const nextVisitNum = visits.length + 101;
    const newVisitId = `OPD-2026-${String(nextVisitNum).padStart(5, '0')}`;

    const doctor = DEMO_DOCTORS.find(d => d.id === visitData.doctorId) || DEMO_DOCTORS[0];

    const age = new Date().getFullYear() - new Date(newPatient.dateOfBirth).getFullYear();

    const newVisit: OPDVisit = {
      id: newVisitId,
      patientId: newPatient.id,
      patientName: `${newPatient.firstName} ${newPatient.lastName}`.trim(),
      patientAge: age,
      patientGender: newPatient.gender,
      patientPhone: newPatient.phone,
      patientBloodGroup: newPatient.bloodGroup,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: visitData.department || doctor.department,
      visitDate: visitData.visitDate || '2026-08-31',
      visitTime: visitData.visitTime || '10:00',
      visitType: visitData.visitType || 'new',
      tokenNumber: nextToken,
      priority: visitData.priority || 'normal',
      status: 'waiting',
      reasonForVisit: visitData.reasonForVisit || 'General OPD Consultation',
      referralSource: visitData.referralSource || 'Direct Walk-in',
      idType: visitData.idType,
      idNumber: visitData.idNumber,
      consultationFee: doctor.consultationFee || 600,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPatients(prev => [newPatient, ...prev]);
    setVisits(prev => [newVisit, ...prev]);

    // Also add to appointments list for unified calendar
    const newApt: Appointment = {
      id: `apt-opd-${Date.now().toString().slice(-4)}`,
      patientId: newPatient.id,
      patientName: newVisit.patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: newVisit.department,
      date: newVisit.visitDate,
      time: newVisit.visitTime,
      type: newVisit.visitType === 'follow_up' ? 'follow_up' : newVisit.visitType === 'emergency' ? 'emergency' : 'opd',
      status: 'waiting',
      tokenNumber: newVisit.tokenNumber,
      consultationFee: newVisit.consultationFee,
      chiefComplaint: newVisit.reasonForVisit,
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [newApt, ...prev]);

    toast.success('OPD Registration Successful', `Registered ${newVisit.patientName} (Token #${newVisit.tokenNumber}) in ${newVisit.department}`);

    return { patient: newPatient, visit: newVisit };
  }, [patients, visits, toast]);

  // Register Repeat / Existing Patient Visit
  const registerExistingPatientVisit = useCallback((patientId: string, visitData: Partial<OPDVisit>) => {
    const existingPatient = patients.find(p => p.id === patientId);
    if (!existingPatient) throw new Error('Patient not found');

    const nextToken = visits.filter(v => v.visitDate === (visitData.visitDate || '2026-08-31')).length + 1;
    const nextVisitNum = visits.length + 101;
    const newVisitId = `OPD-2026-${String(nextVisitNum).padStart(5, '0')}`;
    const doctor = DEMO_DOCTORS.find(d => d.id === visitData.doctorId) || DEMO_DOCTORS[0];

    const age = new Date().getFullYear() - new Date(existingPatient.dateOfBirth).getFullYear();

    const newVisit: OPDVisit = {
      id: newVisitId,
      patientId: existingPatient.id,
      patientName: `${existingPatient.firstName} ${existingPatient.lastName}`.trim(),
      patientAge: age,
      patientGender: existingPatient.gender,
      patientPhone: existingPatient.phone,
      patientBloodGroup: existingPatient.bloodGroup,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: visitData.department || doctor.department,
      visitDate: visitData.visitDate || '2026-08-31',
      visitTime: visitData.visitTime || '10:00',
      visitType: visitData.visitType || 'follow_up',
      tokenNumber: nextToken,
      priority: visitData.priority || 'normal',
      status: 'waiting',
      reasonForVisit: visitData.reasonForVisit || 'Follow-up Consultation',
      referralSource: visitData.referralSource || 'Follow-up OPD',
      consultationFee: doctor.consultationFee || 600,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVisits(prev => [newVisit, ...prev]);

    const newApt: Appointment = {
      id: `apt-opd-${Date.now().toString().slice(-4)}`,
      patientId: existingPatient.id,
      patientName: newVisit.patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: newVisit.department,
      date: newVisit.visitDate,
      time: newVisit.visitTime,
      type: 'follow_up',
      status: 'waiting',
      tokenNumber: newVisit.tokenNumber,
      consultationFee: newVisit.consultationFee,
      chiefComplaint: newVisit.reasonForVisit,
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [newApt, ...prev]);

    toast.success('Encounter Registered', `Allocated Token #${newVisit.tokenNumber} for ${existingPatient.firstName} ${existingPatient.lastName}`);

    return newVisit;
  }, [patients, visits, toast]);

  // Update Visit Status
  const updateVisitStatus = useCallback((visitId: string, status: OPDVisitStatus) => {
    setVisits(prev =>
      prev.map(v => (v.id === visitId ? { ...v, status, updatedAt: new Date().toISOString() } : v))
    );
  }, []);

  // Update Vitals for Visit
  const updateVisitVitals = useCallback((visitId: string, vitals: Vitals) => {
    setVisits(prev =>
      prev.map(v => (v.id === visitId ? { ...v, vitals, updatedAt: new Date().toISOString() } : v))
    );
    toast.info('Patient Vitals Recorded', 'Vitals and BMI updated successfully');
  }, [toast]);

  // Call Specific Token
  const callToken = useCallback((tokenNumber: number) => {
    setCurrentToken(tokenNumber);
    playChime();
    setVisits(prev =>
      prev.map(v => {
        if (v.tokenNumber === tokenNumber && v.visitDate === '2026-08-31') {
          return { ...v, status: 'called', updatedAt: new Date().toISOString() };
        }
        return v;
      })
    );
    toast.info('Token Called', `Calling Token #${tokenNumber} to Consultation Chamber`);
  }, [playChime, toast]);

  // Call Next Token in Queue
  const callNextInQueue = useCallback((doctorId?: string) => {
    const today = '2026-08-31';
    const waitingList = visits
      .filter(v => v.visitDate === today && (v.status === 'waiting' || v.status === 'on_hold') && (!doctorId || v.doctorId === doctorId))
      .sort((a, b) => {
        const priorityWeight = { emergency: 4, senior: 3, priority: 2, normal: 1 };
        return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1) || a.tokenNumber - b.tokenNumber;
      });

    if (waitingList.length === 0) {
      toast.warning('No Patients in Queue', 'All registered patients for today have been attended.');
      return;
    }

    const nextVisit = waitingList[0];
    callToken(nextVisit.tokenNumber);
  }, [visits, callToken, toast]);

  // Hold Visit
  const holdVisit = useCallback((visitId: string) => {
    updateVisitStatus(visitId, 'on_hold');
    toast.warning('Patient Placed on Hold', 'Encounter moved to on-hold queue');
  }, [updateVisitStatus, toast]);

  // Skip Visit
  const skipVisit = useCallback((visitId: string) => {
    updateVisitStatus(visitId, 'skipped');
    toast.info('Patient Skipped', 'Patient moved to skipped roster');
  }, [updateVisitStatus, toast]);

  // Start Consultation
  const startConsultationForVisit = useCallback((visit: OPDVisit) => {
    setSelectedVisit(visit);
    setSelectedPatientId(visit.patientId);
    updateVisitStatus(visit.id, 'in_consultation');
    setActiveTab('consultation');
  }, [updateVisitStatus]);

  // Complete Consultation
  const completeConsultation = useCallback((visitId: string, consultationData: Partial<Consultation>) => {
    const visit = visits.find(v => v.id === visitId);
    const newConsultation: Consultation = {
      id: `cons-${Date.now().toString().slice(-5)}`,
      appointmentId: visitId,
      patientId: visit?.patientId || '',
      doctorId: visit?.doctorId || 'doc-001',
      date: visit?.visitDate || '2026-08-31',
      chiefComplaint: consultationData.chiefComplaint || visit?.reasonForVisit || '',
      history: consultationData.history,
      examination: consultationData.examination,
      diagnosis: consultationData.diagnosis || ['General Examination'],
      prescription: consultationData.prescription || [],
      labOrders: consultationData.labOrders || [],
      radiologyOrders: consultationData.radiologyOrders || [],
      notes: consultationData.notes,
      followUpDate: consultationData.followUpDate,
      followUpInstructions: consultationData.followUpInstructions,
      vitals: consultationData.vitals || visit?.vitals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConsultations(prev => [newConsultation, ...prev]);

    // Mark visit completed
    setVisits(prev =>
      prev.map(v => (v.id === visitId ? { ...v, status: 'completed', consultationId: newConsultation.id, updatedAt: new Date().toISOString() } : v))
    );

    // If follow-up date is provided, create follow-up item
    if (consultationData.followUpDate && visit) {
      const newFu: OPDFollowUp = {
        id: `fu-${Date.now().toString().slice(-4)}`,
        patientId: visit.patientId,
        patientName: visit.patientName,
        patientPhone: visit.patientPhone || '9876543210',
        doctorId: visit.doctorId,
        doctorName: visit.doctorName,
        department: visit.department,
        previousVisitId: visit.id,
        followUpDate: consultationData.followUpDate,
        reason: `Review after ${consultationData.diagnosis?.join(', ') || 'Consultation'}`,
        instructions: consultationData.followUpInstructions || 'Standard review precautions',
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };
      setFollowUps(prev => [newFu, ...prev]);
    }

    toast.success('Consultation Completed', `Encounter finalized for ${visit?.patientName || 'Patient'}`);

    return newConsultation;
  }, [visits, toast]);

  // Save Prescription
  const savePrescription = useCallback((prescriptionData: any) => {
    const newRx = {
      id: `rx-${Date.now().toString().slice(-4)}`,
      date: '2026-08-31',
      patientId: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      doctorId: prescriptionData.doctorId,
      doctorName: prescriptionData.doctorName,
      diagnosis: prescriptionData.diagnosis || 'OPD Clinical Evaluation',
      medicines: prescriptionData.medicines || [],
      notes: prescriptionData.notes || '',
      createdAt: new Date().toISOString(),
    };
    setPrescriptions(prev => [newRx, ...prev]);
    toast.success('Prescription Saved', `Generated digital prescription #${newRx.id}`);
    return newRx;
  }, [toast]);

  // Create Lab Order
  const createLabOrder = useCallback((labData: any) => {
    const newOrder: LabRequest = {
      id: `lr-${Date.now().toString().slice(-4)}`,
      patientId: labData.patientId,
      patientName: labData.patientName,
      doctorId: labData.doctorId,
      doctorName: labData.doctorName,
      requestDate: '2026-08-31',
      status: 'ordered',
      priority: labData.priority || 'routine',
      tests: labData.tests || [],
      totalAmount: labData.totalAmount || 0,
      aiInsight: labData.aiInsight,
    };
    setLabRequests(prev => [newOrder, ...prev]);
    toast.success('Lab Requisition Created', `Ordered ${newOrder.tests.length} tests for ${newOrder.patientName}`);
    return newOrder;
  }, [toast]);

  // Create Diagnostic / Radiology Order
  const createDiagnosticOrder = useCallback((diagData: any) => {
    const newStudy: RadiologyStudy = {
      id: `rad-${Date.now().toString().slice(-4)}`,
      patientId: diagData.patientId,
      patientName: diagData.patientName,
      doctorId: diagData.doctorId,
      doctorName: diagData.doctorName,
      modality: diagData.modality,
      bodyPart: diagData.bodyPart,
      scheduledDate: diagData.scheduledDate || '2026-08-31',
      scheduledTime: diagData.scheduledTime || '12:00',
      status: 'scheduled',
      priority: diagData.priority || 'routine',
      price: diagData.price || 500,
      clinicalHistory: diagData.clinicalHistory,
      createdAt: new Date().toISOString(),
    };
    setRadiologyOrders(prev => [newStudy, ...prev]);
    toast.success('Radiology Order Placed', `Scheduled ${newStudy.bodyPart} (${newStudy.modality.toUpperCase()})`);
    return newStudy;
  }, [toast]);

  // Generate OPD Bill
  const generateOPDBill = useCallback((billData: Partial<Bill>) => {
    const nextBillNum = bills.length + 101;
    const newBill: Bill = {
      id: `bill-${Date.now().toString().slice(-4)}`,
      billNumber: `ALN-BILL-2026-${String(nextBillNum).padStart(4, '0')}`,
      patientId: billData.patientId || '',
      patientName: billData.patientName || '',
      consultationId: billData.consultationId,
      date: '2026-08-31',
      dueDate: '2026-08-31',
      items: billData.items || [],
      subtotal: billData.subtotal || 0,
      discount: billData.discount || 0,
      tax: billData.tax || 0,
      total: billData.total || billData.totalAmount || 0,
      totalAmount: billData.total || billData.totalAmount || 0,
      paidAmount: billData.paidAmount || 0,
      balanceDue: billData.balanceDue || 0,
      status: billData.status || 'paid',
      payments: billData.payments || [],
      createdBy: authState.user?.id || 'u-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBills(prev => [newBill, ...prev]);
    toast.success('Invoice Generated', `Created Bill #${newBill.billNumber} for ₹${newBill.total}`);
    return newBill;
  }, [bills, authState.user, toast]);

  // Record Payment
  const recordBillPayment = useCallback((billId: string, amount: number, mode: PaymentMode, ref?: string) => {
    setBills(prev =>
      prev.map(b => {
        if (b.id === billId) {
          const newPaid = b.paidAmount + amount;
          const newBalance = Math.max(0, b.total - newPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'partial';
          const newPayment = {
            id: `pay-${Date.now().toString().slice(-4)}`,
            amount,
            mode,
            referenceNumber: ref,
            date: new Date().toISOString().split('T')[0],
            receivedBy: authState.user?.name || 'Cashier Desk',
          };
          return {
            ...b,
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
            payments: [...(b.payments || []), newPayment],
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
    toast.success('Payment Received', `Recorded payment of ₹${amount} via ${mode.toUpperCase()}`);
  }, [authState.user, toast]);

  // Create Follow-Up
  const createFollowUp = useCallback((followUpData: Partial<OPDFollowUp>) => {
    const newFu: OPDFollowUp = {
      id: followUpData.id || `fu-${Date.now().toString().slice(-4)}`,
      patientId: followUpData.patientId || '',
      patientName: followUpData.patientName || '',
      patientPhone: followUpData.patientPhone || '',
      doctorId: followUpData.doctorId || 'doc-001',
      doctorName: followUpData.doctorName || 'Dr. Sneha Patel',
      department: followUpData.department || 'General Medicine',
      previousVisitId: followUpData.previousVisitId || '',
      followUpDate: followUpData.followUpDate || '2026-09-07',
      reason: followUpData.reason || 'Outpatient Review',
      instructions: followUpData.instructions,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    setFollowUps(prev => [newFu, ...prev]);
    toast.success('Follow-Up Scheduled', `Follow-up on ${newFu.followUpDate} for ${newFu.patientName}`);
    return newFu;
  }, [toast]);

  // Update Follow-up Status
  const updateFollowUpStatus = useCallback((id: string, status: OPDFollowUp['status']) => {
    setFollowUps(prev => prev.map(f => (f.id === id ? { ...f, status } : f)));
  }, []);

  return (
    <OPDContext.Provider
      value={{
        activeTab,
        setActiveTab,
        visits,
        patients,
        doctors: DEMO_DOCTORS,
        departments: DEMO_DEPARTMENTS,
        appointments,
        consultations,
        prescriptions,
        labRequests,
        radiologyOrders,
        bills,
        followUps,
        selectedVisit,
        setSelectedVisit,
        selectedPatientId,
        setSelectedPatientId,
        currentToken,
        audioEnabled,
        setAudioEnabled,
        kpis,
        registerPatientAndVisit,
        registerExistingPatientVisit,
        updateVisitStatus,
        updateVisitVitals,
        callToken,
        callNextInQueue,
        holdVisit,
        skipVisit,
        startConsultationForVisit,
        completeConsultation,
        savePrescription,
        createLabOrder,
        createDiagnosticOrder,
        generateOPDBill,
        recordBillPayment,
        createFollowUp,
        updateFollowUpStatus,
        playChime,
        searchFilter,
        setSearchFilter,
      }}
    >
      {children}
    </OPDContext.Provider>
  );
}

export function useOPD() {
  const context = useContext(OPDContext);
  if (!context) {
    throw new Error('useOPD must be used within an OPDProvider');
  }
  return context;
}
