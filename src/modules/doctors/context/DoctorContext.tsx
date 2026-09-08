import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Doctor, DoctorSchedule, Patient, Appointment, Admission } from '../../../types';
import { DEMO_DOCTORS, DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_ADMISSIONS } from '../../../data/seedData';

export type DoctorTab =
  | 'dashboard'
  | 'directory'
  | 'availability'
  | 'leave'
  | 'opd_queue'
  | 'consultation'
  | 'ipd_rounds'
  | 'patient_history'
  | 'reports'
  | 'settings';

export interface DoctorLeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  department: string;
  leaveType: 'casual' | 'medical' | 'conference' | 'emergency' | 'annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  createdAt: string;
}

export interface DoctorRoundNoteRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  ward: string;
  doctorId: string;
  doctorName: string;
  roundDate: string;
  roundTime: string;
  clinicalStatus: 'improving' | 'stable' | 'critical' | 'deteriorating' | 'ready_for_discharge';
  vitalsSummary?: string;
  examinationNotes: string;
  assessmentAndPlan: string;
  nursingInstructions: string;
  dietInstructions?: string;
  medicationChanges?: string;
  isDischargePlanned: boolean;
  plannedDischargeDate?: string;
}

export interface DoctorConsultationRecord {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  doctorId: string;
  doctorName: string;
  department: string;
  consultationDate: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  examinationFindings: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
    sugar?: number;
  };
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  icdCode?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  labOrders: string[];
  radiologyOrders: string[];
  proceduresOrdered?: string[];
  followUpDate?: string;
  followUpInstructions?: string;
  consultationFee: number;
  paymentStatus: 'paid' | 'pending' | 'free_follow_up';
  status: 'completed' | 'in_progress';
}

interface DoctorContextType {
  activeTab: DoctorTab;
  setActiveTab: (tab: DoctorTab) => void;
  selectedDoctorId: string;
  setSelectedDoctorId: (id: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;

  // Collections
  doctors: Doctor[];
  doctorLeaves: DoctorLeaveRecord[];
  doctorRounds: DoctorRoundNoteRecord[];
  consultations: DoctorConsultationRecord[];
  patients: Patient[];
  appointments: Appointment[];
  admissions: Admission[];

  // Actions
  addDoctor: (data: Omit<Doctor, 'id'>) => Doctor;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  toggleDoctorAvailability: (id: string) => void;
  applyDoctorLeave: (leave: Omit<DoctorLeaveRecord, 'id' | 'createdAt' | 'status'>) => void;
  approveDoctorLeave: (leaveId: string, approvedBy: string) => void;
  rejectDoctorLeave: (leaveId: string) => void;
  addDoctorRoundNote: (note: Omit<DoctorRoundNoteRecord, 'id'>) => DoctorRoundNoteRecord;
  saveConsultation: (consultation: Omit<DoctorConsultationRecord, 'id'>) => DoctorConsultationRecord;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

const INITIAL_LEAVES: DoctorLeaveRecord[] = [
  {
    id: 'leave-1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    leaveType: 'conference',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    reason: 'National Cardiology Summit & Workshop',
    status: 'approved',
    approvedBy: 'Dr. Anil Mehta (Medical Superintendent)',
    createdAt: '2026-09-01',
  },
  {
    id: 'leave-2',
    doctorId: 'doc-2',
    doctorName: 'Dr. Anita Desai',
    department: 'Orthopedics',
    leaveType: 'casual',
    startDate: '2026-09-15',
    endDate: '2026-09-16',
    reason: 'Personal family emergency',
    status: 'pending',
    createdAt: '2026-09-02',
  },
];

const INITIAL_ROUNDS: DoctorRoundNoteRecord[] = [
  {
    id: 'rnd-1',
    admissionId: 'adm-001',
    patientId: 'pat-001',
    patientName: 'Ramesh Kumar',
    bedNumber: 'GW-101',
    ward: 'General Medical Ward',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rajesh Sharma',
    roundDate: '2026-09-02',
    roundTime: '09:30 AM',
    clinicalStatus: 'improving',
    vitalsSummary: 'BP: 124/82 mmHg · Pulse: 74 bpm · SpO2: 98%',
    examinationNotes: 'Chest clear bilaterally. No peripheral edema. Pain score 2/10.',
    assessmentAndPlan: 'Post-angioplasty recovery on track. Continue Dual Antiplatelet Therapy.',
    nursingInstructions: 'Monitor vitals 4-hourly. Mobilize patient in ward corridor under supervision.',
    dietInstructions: 'Low salt, low fat diabetic diet.',
    isDischargePlanned: true,
    plannedDischargeDate: '2026-09-04',
  },
  {
    id: 'rnd-2',
    admissionId: 'adm-002',
    patientId: 'pat-002',
    patientName: 'Sunita Patel',
    bedNumber: 'SP-204',
    ward: 'Semi-Private Surgical Ward',
    doctorId: 'doc-2',
    doctorName: 'Dr. Anita Desai',
    roundDate: '2026-09-02',
    roundTime: '10:15 AM',
    clinicalStatus: 'stable',
    vitalsSummary: 'BP: 118/76 mmHg · Pulse: 78 bpm · SpO2: 99%',
    examinationNotes: 'Surgical wound clean and dry. No signs of infection. Drain output minimal (15ml).',
    assessmentAndPlan: 'Post-total knee replacement Day 2. Continue physiotherapy protocol.',
    nursingInstructions: 'Wound dressing change tomorrow morning. Administer analgesics SOS.',
    isDischargePlanned: false,
  },
];

const INITIAL_CONSULTATIONS: DoctorConsultationRecord[] = [
  {
    id: 'con-001',
    appointmentId: 'apt-001',
    patientId: 'pat-001',
    patientName: 'Ramesh Kumar',
    age: 48,
    gender: 'Male',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    consultationDate: '2026-09-01',
    chiefComplaint: 'Chest heaviness on exertion for 2 weeks',
    historyOfPresentIllness: 'Patient reports retrosternal burning and heaviness on brisk walking.',
    examinationFindings: 'S1 S2 normal. No murmurs. Bilateral vesicular breath sounds.',
    vitals: { bp: '138/88', pulse: 82, temp: 98.4, spo2: 98, weight: 74 },
    primaryDiagnosis: 'Stable Angina Pectoris / Essential Hypertension',
    icdCode: 'I20.9',
    medicines: [
      { name: 'Tab. Aspirin 75mg', dosage: '75mg', frequency: '0-1-0', duration: '30 Days', instructions: 'After lunch' },
      { name: 'Tab. Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1', duration: '30 Days', instructions: 'At bedtime' },
      { name: 'Tab. Telmisartan 40mg', dosage: '40mg', frequency: '1-0-0', duration: '30 Days', instructions: 'Morning after breakfast' },
    ],
    labOrders: ['Lipid Profile', 'HbA1c', 'Serum Creatinine'],
    radiologyOrders: ['ECG 12-Lead', '2D Echocardiography with Doppler'],
    followUpDate: '2026-09-15',
    followUpInstructions: 'Review with ECG and Lipid profile report.',
    consultationFee: 800,
    paymentStatus: 'paid',
    status: 'completed',
  },
];

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<DoctorTab>('dashboard');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-1');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Doctors State
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const s = localStorage.getItem('hms_doctors');
      return s ? JSON.parse(s) : DEMO_DOCTORS;
    } catch {
      return DEMO_DOCTORS;
    }
  });

  // Leaves State
  const [doctorLeaves, setDoctorLeaves] = useState<DoctorLeaveRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_doctor_leaves');
      return s ? JSON.parse(s) : INITIAL_LEAVES;
    } catch {
      return INITIAL_LEAVES;
    }
  });

  // Ward Rounds State
  const [doctorRounds, setDoctorRounds] = useState<DoctorRoundNoteRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_doctor_rounds');
      return s ? JSON.parse(s) : INITIAL_ROUNDS;
    } catch {
      return INITIAL_ROUNDS;
    }
  });

  // Consultations State
  const [consultations, setConsultations] = useState<DoctorConsultationRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_doctor_consultations');
      return s ? JSON.parse(s) : INITIAL_CONSULTATIONS;
    } catch {
      return INITIAL_CONSULTATIONS;
    }
  });

  // Patients, Appointments, Admissions
  const patients = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_opd_patients');
      return s ? JSON.parse(s) : DEMO_PATIENTS;
    } catch {
      return DEMO_PATIENTS;
    }
  }, []);

  const appointments = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_appointments');
      return s ? JSON.parse(s) : DEMO_APPOINTMENTS;
    } catch {
      return DEMO_APPOINTMENTS;
    }
  }, []);

  const admissions = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_ipd_admissions');
      return s ? JSON.parse(s) : DEMO_ADMISSIONS;
    } catch {
      return DEMO_ADMISSIONS;
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('hms_doctors', JSON.stringify(doctors));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('hms_doctor_leaves', JSON.stringify(doctorLeaves));
  }, [doctorLeaves]);

  useEffect(() => {
    localStorage.setItem('hms_doctor_rounds', JSON.stringify(doctorRounds));
  }, [doctorRounds]);

  useEffect(() => {
    localStorage.setItem('hms_doctor_consultations', JSON.stringify(consultations));
  }, [consultations]);

  // Actions
  const addDoctor = (data: Omit<Doctor, 'id'>): Doctor => {
    const newDoc: Doctor = {
      ...data,
      id: `doc-${Date.now()}`,
    };
    setDoctors(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDoctor = (id: string, data: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const toggleDoctorAvailability = (id: string) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, isAvailable: !d.isAvailable } : d));
  };

  const applyDoctorLeave = (leave: Omit<DoctorLeaveRecord, 'id' | 'createdAt' | 'status'>) => {
    const newLeave: DoctorLeaveRecord = {
      ...leave,
      id: `leave-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDoctorLeaves(prev => [newLeave, ...prev]);
  };

  const approveDoctorLeave = (leaveId: string, approvedBy: string) => {
    setDoctorLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'approved', approvedBy } : l));
  };

  const rejectDoctorLeave = (leaveId: string) => {
    setDoctorLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'rejected' } : l));
  };

  const addDoctorRoundNote = (note: Omit<DoctorRoundNoteRecord, 'id'>): DoctorRoundNoteRecord => {
    const newRound: DoctorRoundNoteRecord = {
      ...note,
      id: `rnd-${Date.now()}`,
    };
    setDoctorRounds(prev => [newRound, ...prev]);
    return newRound;
  };

  const saveConsultation = (consultation: Omit<DoctorConsultationRecord, 'id'>): DoctorConsultationRecord => {
    const newConsultation: DoctorConsultationRecord = {
      ...consultation,
      id: `con-${Date.now()}`,
    };
    setConsultations(prev => [newConsultation, ...prev]);
    return newConsultation;
  };

  return (
    <DoctorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDoctorId,
        setSelectedDoctorId,
        selectedPatientId,
        setSelectedPatientId,
        doctors,
        doctorLeaves,
        doctorRounds,
        consultations,
        patients,
        appointments,
        admissions,
        addDoctor,
        updateDoctor,
        toggleDoctorAvailability,
        applyDoctorLeave,
        approveDoctorLeave,
        rejectDoctorLeave,
        addDoctorRoundNote,
        saveConsultation,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
}
