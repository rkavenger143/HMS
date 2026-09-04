import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { BloodGroup, Patient, Doctor } from '../../../types';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';

export type { BloodGroup };

export type BloodBankTab =
  | 'dashboard'
  | 'donors'
  | 'donations'
  | 'screening'
  | 'components'
  | 'inventory'
  | 'requests'
  | 'crossmatch'
  | 'issue'
  | 'transfusion'
  | 'returns_discards'
  | 'storage_temp'
  | 'billing'
  | 'reports';

export type BloodComponentType =
  | 'whole_blood'
  | 'packed_rbc'
  | 'fresh_frozen_plasma'
  | 'platelets'
  | 'cryoprecipitate';

export type BloodBagStatus =
  | 'quarantine'
  | 'available'
  | 'reserved'
  | 'issued'
  | 'transfused'
  | 'returned'
  | 'discarded'
  | 'expired'
  | 'rejected';

export interface BloodDonorRecord {
  id: string; // e.g. DNR-2026-001
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address: string;
  bloodGroup: BloodGroup;
  rhFactor: '+' | '-';
  donorType: 'voluntary' | 'replacement' | 'directed';
  lastDonationDate?: string;
  totalDonations: number;
  isEligible: boolean;
  deferralStatus?: 'none' | 'temporary' | 'permanent';
  deferralReason?: string;
  deferralUntil?: string;
  weightKg: number;
  hemoglobinGdl: number;
  registeredAt: string;
}

export interface BloodDonationRecord {
  id: string; // e.g. DON-2026-001
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  donationDate: string;
  donationTime: string;
  donationType: 'voluntary' | 'replacement' | 'directed';
  collectionVolumeMl: number;
  assignedBagId: string;
  phlebotomistName: string;
  screeningStatus: 'pending' | 'passed' | 'failed';
  status: 'collected' | 'processing' | 'completed' | 'discarded';
  vitals: {
    bp: string;
    pulse: number;
    temp: number;
    hb: number;
  };
  remarks?: string;
}

export interface BloodBagRecord {
  id: string; // e.g. BAG-2026-00101
  donationId: string;
  donorId: string;
  bloodGroup: BloodGroup;
  component: BloodComponentType;
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  storageUnitId: string;
  storageLocation: string; // e.g. "Fridge 01 - Rack A - Shelf 2"
  screeningStatus: 'quarantine' | 'tested_passed' | 'tested_failed';
  status: BloodBagStatus;
  batchNumber: string;
  reservedForPatientId?: string;
  reservedForPatientName?: string;
  reservedRequestId?: string;
}

export interface BloodRequestRecord {
  id: string; // e.g. BR-2026-001
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: BloodGroup;
  department: string;
  ward: string;
  bed: string;
  doctorName: string;
  component: BloodComponentType;
  unitsRequested: number;
  unitsAllocated: number;
  priority: 'routine' | 'urgent' | 'emergency';
  clinicalIndication: string;
  requiredDateTime: string;
  status:
    | 'requested'
    | 'approved'
    | 'crossmatch_pending'
    | 'reserved'
    | 'ready_for_issue'
    | 'issued'
    | 'completed'
    | 'rejected'
    | 'cancelled';
  createdAt: string;
  approvedBy?: string;
}

export interface CrossMatchRecord {
  id: string; // e.g. XM-2026-001
  requestId: string;
  patientId: string;
  patientName: string;
  patientBloodGroup: BloodGroup;
  bagId: string;
  bagBloodGroup: BloodGroup;
  component: BloodComponentType;
  majorCrossmatch: 'compatible' | 'incompatible' | 'pending';
  minorCrossmatch: 'compatible' | 'incompatible' | 'pending';
  coombsTest: 'negative' | 'positive' | 'not_done';
  overallResult: 'compatible' | 'incompatible' | 'pending';
  testedBy: string;
  verifiedBy: string;
  testDate: string;
  status: 'completed' | 'in_progress';
  remarks?: string;
}

export interface BloodIssueRecord {
  id: string; // e.g. ISS-2026-001
  requestId: string;
  patientId: string;
  patientName: string;
  bagId: string;
  component: BloodComponentType;
  bloodGroup: BloodGroup;
  issuedAt: string;
  issuedBy: string;
  receivedBy: string;
  receiverRole: string; // e.g. Staff Nurse
  ward: string;
  bed: string;
  doctorName: string;
  safetyCheckVerified: boolean;
  status: 'issued' | 'transfused' | 'returned' | 'discarded';
}

export interface TransfusionRecord {
  id: string; // e.g. TRF-2026-001
  issueId: string;
  bagId: string;
  patientId: string;
  patientName: string;
  component: BloodComponentType;
  startTime: string;
  endTime?: string;
  administeredBy: string;
  preTransfusionVitals: { bp: string; pulse: number; temp: number };
  postTransfusionVitals?: { bp: string; pulse: number; temp: number };
  reactionObserved: boolean;
  status: 'in_progress' | 'completed' | 'stopped_reaction';
  notes?: string;
}

export interface TransfusionReactionRecord {
  id: string; // e.g. RXN-2026-001
  transfusionId: string;
  patientId: string;
  patientName: string;
  bagId: string;
  component: BloodComponentType;
  reactionType: 'febrile' | 'allergic' | 'hemolytic' | 'taco' | 'trali' | 'septic';
  symptoms: string;
  immediateIntervention: string;
  reportedAt: string;
  reportedBy: string;
  doctorNotified: string;
  investigationStatus: 'reported' | 'investigating' | 'reviewed' | 'closed';
  resolution?: string;
}

export interface BloodDiscardRecord {
  id: string; // e.g. DISC-2026-001
  bagId: string;
  bloodGroup: BloodGroup;
  component: BloodComponentType;
  reason: 'expired' | 'failed_screening' | 'hemolysis' | 'clot' | 'broken_bag' | 'temperature_excursion' | 'unsuitable_donor';
  discardDate: string;
  discardedBy: string;
  authorizedBy: string;
  method: 'autoclave_incineration' | 'biohazard_shredding';
  remarks?: string;
}

export interface StorageUnitRecord {
  id: string;
  name: string;
  type: 'refrigerator_2_6' | 'freezer_minus_30' | 'platelet_agitator_22' | 'ultra_low_minus_80';
  targetTempC: string;
  currentTempC: number;
  tempStatus: 'normal' | 'warning' | 'alert';
  capacityUnits: number;
  currentUtilization: number;
  location: string;
}

export interface TemperatureLogRecord {
  id: string;
  storageUnitId: string;
  storageUnitName: string;
  timestamp: string;
  temperatureC: number;
  status: 'normal' | 'warning' | 'alert';
  recordedBy: string;
}

interface BloodBankContextType {
  activeTab: BloodBankTab;
  setActiveTab: (tab: BloodBankTab) => void;
  selectedBagId: string | null;
  setSelectedBagId: (id: string | null) => void;
  selectedDonorId: string | null;
  setSelectedDonorId: (id: string | null) => void;

  // Collections
  donors: BloodDonorRecord[];
  donations: BloodDonationRecord[];
  bloodBags: BloodBagRecord[];
  bloodRequests: BloodRequestRecord[];
  crossMatches: CrossMatchRecord[];
  issues: BloodIssueRecord[];
  transfusions: TransfusionRecord[];
  reactions: TransfusionReactionRecord[];
  discards: BloodDiscardRecord[];
  storageUnits: StorageUnitRecord[];
  temperatureLogs: TemperatureLogRecord[];

  // Computed Summaries
  stockByGroup: Record<BloodGroup, number>;
  totalUnitsCount: number;
  availableUnitsCount: number;
  reservedUnitsCount: number;
  quarantineUnitsCount: number;
  expiringSoonCount: number;
  expiredUnitsCount: number;
  emergencyRequestsCount: number;

  // Actions
  addDonor: (donor: Omit<BloodDonorRecord, 'id' | 'registeredAt' | 'totalDonations'>) => BloodDonorRecord;
  updateDonor: (id: string, data: Partial<BloodDonorRecord>) => void;
  recordDonation: (donation: Omit<BloodDonationRecord, 'id'>) => BloodDonationRecord;
  approveScreeningAndRelease: (bagId: string, verifiedBy: string) => void;
  rejectScreeningAndDiscard: (bagId: string, reason: string, authorizedBy: string) => void;
  processComponents: (parentBagId: string, components: { type: BloodComponentType; volumeMl: number; daysValid: number }[]) => void;
  createBloodRequest: (request: Omit<BloodRequestRecord, 'id' | 'createdAt' | 'status' | 'unitsAllocated'>) => BloodRequestRecord;
  approveBloodRequest: (requestId: string, approvedBy: string) => void;
  recordCrossMatch: (xm: Omit<CrossMatchRecord, 'id'>) => CrossMatchRecord;
  reserveBloodBag: (bagId: string, requestId: string, patientId: string, patientName: string) => void;
  issueBloodBag: (issue: Omit<BloodIssueRecord, 'id' | 'issuedAt' | 'status'>) => BloodIssueRecord;
  recordTransfusionStart: (transfusion: Omit<TransfusionRecord, 'id' | 'status'>) => TransfusionRecord;
  recordTransfusionComplete: (transfusionId: string, postVitals: { bp: string; pulse: number; temp: number }) => void;
  reportTransfusionReaction: (reaction: Omit<TransfusionReactionRecord, 'id' | 'reportedAt' | 'investigationStatus'>) => TransfusionReactionRecord;
  discardBloodBag: (discard: Omit<BloodDiscardRecord, 'id' | 'discardDate'>) => void;
  recordTemperatureLog: (log: Omit<TemperatureLogRecord, 'id' | 'timestamp'>) => void;
}

const BloodBankContext = createContext<BloodBankContextType | undefined>(undefined);

// Initial Seed Data
const INITIAL_DONORS: BloodDonorRecord[] = [
  {
    id: 'DNR-2026-001',
    name: 'Amitabh Sen',
    gender: 'male',
    age: 32,
    dateOfBirth: '1994-04-12',
    phone: '+91 98451 11223',
    email: 'amitabh.sen@gmail.com',
    address: '42 Indiranagar, Bengaluru',
    bloodGroup: 'O+',
    rhFactor: '+',
    donorType: 'voluntary',
    lastDonationDate: '2026-06-15',
    totalDonations: 4,
    isEligible: true,
    deferralStatus: 'none',
    weightKg: 74,
    hemoglobinGdl: 14.5,
    registeredAt: '2025-01-10',
  },
  {
    id: 'DNR-2026-002',
    name: 'Pooja Hegde',
    gender: 'female',
    age: 28,
    dateOfBirth: '1998-08-20',
    phone: '+91 98765 43210',
    email: 'pooja.hegde@outlook.com',
    address: '18 Koramangala 4th Block, Bengaluru',
    bloodGroup: 'A+',
    rhFactor: '+',
    donorType: 'voluntary',
    lastDonationDate: '2026-07-02',
    totalDonations: 2,
    isEligible: true,
    deferralStatus: 'none',
    weightKg: 58,
    hemoglobinGdl: 13.2,
    registeredAt: '2025-03-14',
  },
  {
    id: 'DNR-2026-003',
    name: 'Vikas Rao',
    gender: 'male',
    age: 41,
    dateOfBirth: '1985-11-05',
    phone: '+91 94480 88776',
    email: 'vikas.rao@gmail.com',
    address: '102 Jayanagar 7th Block, Bengaluru',
    bloodGroup: 'B+',
    rhFactor: '+',
    donorType: 'replacement',
    lastDonationDate: '2026-05-10',
    totalDonations: 6,
    isEligible: true,
    deferralStatus: 'none',
    weightKg: 80,
    hemoglobinGdl: 15.0,
    registeredAt: '2024-08-20',
  },
  {
    id: 'DNR-2026-004',
    name: 'Meenakshi Iyer',
    gender: 'female',
    age: 35,
    dateOfBirth: '1991-02-18',
    phone: '+91 99001 22334',
    email: 'meenakshi.iyer@gmail.com',
    address: '89 Malleshwaram, Bengaluru',
    bloodGroup: 'O-',
    rhFactor: '-',
    donorType: 'voluntary',
    lastDonationDate: '2026-04-18',
    totalDonations: 5,
    isEligible: true,
    deferralStatus: 'none',
    weightKg: 62,
    hemoglobinGdl: 12.8,
    registeredAt: '2024-05-12',
  },
  {
    id: 'DNR-2026-005',
    name: 'Karthik Nambiar',
    gender: 'male',
    age: 24,
    dateOfBirth: '2002-09-14',
    phone: '+91 98860 77112',
    email: 'karthik.n@gmail.com',
    address: '55 HSR Layout Sector 2, Bengaluru',
    bloodGroup: 'AB-',
    rhFactor: '-',
    donorType: 'voluntary',
    lastDonationDate: '2026-01-20',
    totalDonations: 1,
    isEligible: true,
    deferralStatus: 'none',
    weightKg: 69,
    hemoglobinGdl: 14.1,
    registeredAt: '2026-01-20',
  },
];

const INITIAL_DONATIONS: BloodDonationRecord[] = [
  {
    id: 'DON-2026-001',
    donorId: 'DNR-2026-001',
    donorName: 'Amitabh Sen',
    bloodGroup: 'O+',
    donationDate: '2026-09-01',
    donationTime: '10:30 AM',
    donationType: 'voluntary',
    collectionVolumeMl: 450,
    assignedBagId: 'BAG-2026-00101',
    phlebotomistName: 'Nurse Sunita Rao',
    screeningStatus: 'passed',
    status: 'completed',
    vitals: { bp: '120/80', pulse: 74, temp: 98.4, hb: 14.5 },
  },
  {
    id: 'DON-2026-002',
    donorId: 'DNR-2026-002',
    donorName: 'Pooja Hegde',
    bloodGroup: 'A+',
    donationDate: '2026-09-02',
    donationTime: '11:15 AM',
    donationType: 'voluntary',
    collectionVolumeMl: 350,
    assignedBagId: 'BAG-2026-00102',
    phlebotomistName: 'Nurse Sunita Rao',
    screeningStatus: 'pending',
    status: 'collected',
    vitals: { bp: '116/76', pulse: 78, temp: 98.6, hb: 13.2 },
  },
];

const INITIAL_BAGS: BloodBagRecord[] = [
  {
    id: 'BAG-2026-00101',
    donationId: 'DON-2026-001',
    donorId: 'DNR-2026-001',
    bloodGroup: 'O+',
    component: 'packed_rbc',
    volumeMl: 280,
    collectionDate: '2026-09-01',
    expiryDate: '2026-10-13', // 42 days for PRBC
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Shelf A2',
    screeningStatus: 'tested_passed',
    status: 'available',
    batchNumber: 'LOT-2026-09-01-O-PRBC',
  },
  {
    id: 'BAG-2026-00102',
    donationId: 'DON-2026-002',
    donorId: 'DNR-2026-002',
    bloodGroup: 'A+',
    component: 'whole_blood',
    volumeMl: 350,
    collectionDate: '2026-09-02',
    expiryDate: '2026-10-07',
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Quarantine Bay',
    screeningStatus: 'quarantine',
    status: 'quarantine',
    batchNumber: 'LOT-2026-09-02-A-WB',
  },
  {
    id: 'BAG-2026-00088',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-003',
    bloodGroup: 'B+',
    component: 'packed_rbc',
    volumeMl: 300,
    collectionDate: '2026-08-20',
    expiryDate: '2026-10-01',
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Shelf B1',
    screeningStatus: 'tested_passed',
    status: 'available',
    batchNumber: 'LOT-2026-08-20-B-PRBC',
  },
  {
    id: 'BAG-2026-00075',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-004',
    bloodGroup: 'O-',
    component: 'packed_rbc',
    volumeMl: 290,
    collectionDate: '2026-08-15',
    expiryDate: '2026-09-26',
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Shelf O-Neg',
    screeningStatus: 'tested_passed',
    status: 'available',
    batchNumber: 'LOT-2026-08-15-ONEG-PRBC',
  },
  {
    id: 'BAG-2026-00062',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-005',
    bloodGroup: 'AB-',
    component: 'fresh_frozen_plasma',
    volumeMl: 220,
    collectionDate: '2026-08-10',
    expiryDate: '2027-08-10', // 1 year for FFP
    storageUnitId: 'ST-FREEZER-01',
    storageLocation: 'Deep Plasma Freezer -30°C · Rack 1',
    screeningStatus: 'tested_passed',
    status: 'available',
    batchNumber: 'LOT-2026-08-10-AB-FFP',
  },
  {
    id: 'BAG-2026-00055',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-001',
    bloodGroup: 'O+',
    component: 'platelets',
    volumeMl: 60,
    collectionDate: '2026-08-30',
    expiryDate: '2026-09-04', // 5 days for Platelets (Expiring soon)
    storageUnitId: 'ST-AGITATOR-01',
    storageLocation: 'Platelet Agitator Incubator 22°C',
    screeningStatus: 'tested_passed',
    status: 'available',
    batchNumber: 'LOT-2026-08-30-O-PLT',
  },
  {
    id: 'BAG-2026-00040',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-002',
    bloodGroup: 'A-',
    component: 'packed_rbc',
    volumeMl: 280,
    collectionDate: '2026-07-20',
    expiryDate: '2026-08-31', // Expired unit
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Expired Bay',
    screeningStatus: 'tested_passed',
    status: 'expired',
    batchNumber: 'LOT-2026-07-20-ANEG-PRBC',
  },
  {
    id: 'BAG-2026-00030',
    donationId: 'DON-2026-000',
    donorId: 'DNR-2026-003',
    bloodGroup: 'AB+',
    component: 'packed_rbc',
    volumeMl: 290,
    collectionDate: '2026-08-25',
    expiryDate: '2026-10-06',
    storageUnitId: 'ST-FRIDGE-01',
    storageLocation: 'Blood Refrigerator 01 · Shelf AB',
    screeningStatus: 'tested_passed',
    status: 'reserved',
    batchNumber: 'LOT-2026-08-25-AB-PRBC',
    reservedForPatientId: 'pat-001',
    reservedForPatientName: 'Ramesh Kumar',
    reservedRequestId: 'BR-2026-001',
  },
];

const INITIAL_REQUESTS: BloodRequestRecord[] = [
  {
    id: 'BR-2026-001',
    patientId: 'pat-001',
    patientName: 'Ramesh Kumar',
    age: 48,
    gender: 'Male',
    bloodGroup: 'AB+',
    department: 'Cardiology',
    ward: 'ICU-1',
    bed: 'ICU-102',
    doctorName: 'Dr. Rajesh Sharma',
    component: 'packed_rbc',
    unitsRequested: 1,
    unitsAllocated: 1,
    priority: 'urgent',
    clinicalIndication: 'Emergency CABG surgery transfusion support',
    requiredDateTime: '2026-09-02 02:00 PM',
    status: 'reserved',
    createdAt: '2026-09-02 08:30 AM',
    approvedBy: 'Dr. V. K. Murthy (Blood Bank Officer)',
  },
  {
    id: 'BR-2026-002',
    patientId: 'pat-002',
    patientName: 'Sunita Patel',
    age: 52,
    gender: 'Female',
    bloodGroup: 'O+',
    department: 'Orthopedics',
    ward: 'General Surgical Ward',
    bed: 'GW-204',
    doctorName: 'Dr. Anita Desai',
    component: 'packed_rbc',
    unitsRequested: 2,
    unitsAllocated: 0,
    priority: 'routine',
    clinicalIndication: 'Post-operative total knee arthroplasty anemia (Hb 7.8 g/dL)',
    requiredDateTime: '2026-09-03 10:00 AM',
    status: 'approved',
    createdAt: '2026-09-02 09:15 AM',
    approvedBy: 'Dr. V. K. Murthy',
  },
  {
    id: 'BR-2026-003',
    patientId: 'pat-003',
    patientName: 'Ananya Roy',
    age: 29,
    gender: 'Female',
    bloodGroup: 'O-',
    department: 'Emergency & Trauma',
    ward: 'Trauma Resuscitation Bay',
    bed: 'ER-BAY-01',
    doctorName: 'Dr. Priya Mani',
    component: 'packed_rbc',
    unitsRequested: 2,
    unitsAllocated: 0,
    priority: 'emergency',
    clinicalIndication: '🚨 Severe hemorrhagic shock secondary to road traffic accident (RTA). Active internal bleeding.',
    requiredDateTime: '2026-09-02 STAT',
    status: 'requested',
    createdAt: '2026-09-02 11:45 AM',
  },
];

const INITIAL_CROSSMATCHES: CrossMatchRecord[] = [
  {
    id: 'XM-2026-001',
    requestId: 'BR-2026-001',
    patientId: 'pat-001',
    patientName: 'Ramesh Kumar',
    patientBloodGroup: 'AB+',
    bagId: 'BAG-2026-00030',
    bagBloodGroup: 'AB+',
    component: 'packed_rbc',
    majorCrossmatch: 'compatible',
    minorCrossmatch: 'compatible',
    coombsTest: 'negative',
    overallResult: 'compatible',
    testedBy: 'Lab Technologist Deepak Verma',
    verifiedBy: 'Dr. V. K. Murthy (Blood Bank Officer)',
    testDate: '2026-09-02',
    status: 'completed',
    remarks: 'No agglutination or hemolysis observed. Compatible for transfusion.',
  },
];

const INITIAL_STORAGE_UNITS: StorageUnitRecord[] = [
  {
    id: 'ST-FRIDGE-01',
    name: 'Blood Bank Main Refrigerator 01',
    type: 'refrigerator_2_6',
    targetTempC: '2°C to 6°C',
    currentTempC: 4.2,
    tempStatus: 'normal',
    capacityUnits: 150,
    currentUtilization: 48,
    location: 'Blood Storage Area · Room BB-101',
  },
  {
    id: 'ST-FREEZER-01',
    name: 'Deep Plasma Cryo Freezer (-30°C)',
    type: 'freezer_minus_30',
    targetTempC: '-30°C to -25°C',
    currentTempC: -28.5,
    tempStatus: 'normal',
    capacityUnits: 100,
    currentUtilization: 32,
    location: 'Plasma Processing Lab · Room BB-103',
  },
  {
    id: 'ST-AGITATOR-01',
    name: 'Platelet Agitator & Incubator',
    type: 'platelet_agitator_22',
    targetTempC: '20°C to 24°C',
    currentTempC: 22.1,
    tempStatus: 'normal',
    capacityUnits: 40,
    currentUtilization: 14,
    location: 'Component Storage · Room BB-102',
  },
];

const INITIAL_TEMPERATURE_LOGS: TemperatureLogRecord[] = [
  {
    id: 'TLOG-001',
    storageUnitId: 'ST-FRIDGE-01',
    storageUnitName: 'Blood Bank Main Refrigerator 01',
    timestamp: '2026-09-02 08:00 AM',
    temperatureC: 4.1,
    status: 'normal',
    recordedBy: 'Deepak Verma (Tech)',
  },
  {
    id: 'TLOG-002',
    storageUnitId: 'ST-FREEZER-01',
    storageUnitName: 'Deep Plasma Cryo Freezer (-30°C)',
    timestamp: '2026-09-02 08:00 AM',
    temperatureC: -28.4,
    status: 'normal',
    recordedBy: 'Deepak Verma (Tech)',
  },
  {
    id: 'TLOG-003',
    storageUnitId: 'ST-AGITATOR-01',
    storageUnitName: 'Platelet Agitator & Incubator',
    timestamp: '2026-09-02 08:00 AM',
    temperatureC: 22.0,
    status: 'normal',
    recordedBy: 'Deepak Verma (Tech)',
  },
];

export function BloodBankProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<BloodBankTab>('dashboard');
  const [selectedBagId, setSelectedBagId] = useState<string | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  // Donors
  const [donors, setDonors] = useState<BloodDonorRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_donors');
      return s ? JSON.parse(s) : INITIAL_DONORS;
    } catch {
      return INITIAL_DONORS;
    }
  });

  // Donations
  const [donations, setDonations] = useState<BloodDonationRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_donations');
      return s ? JSON.parse(s) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  // Blood Bags (Inventory)
  const [bloodBags, setBloodBags] = useState<BloodBagRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_bags');
      return s ? JSON.parse(s) : INITIAL_BAGS;
    } catch {
      return INITIAL_BAGS;
    }
  });

  // Requests
  const [bloodRequests, setBloodRequests] = useState<BloodRequestRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_requests');
      return s ? JSON.parse(s) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  // Cross-Matches
  const [crossMatches, setCrossMatches] = useState<CrossMatchRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_crossmatches');
      return s ? JSON.parse(s) : INITIAL_CROSSMATCHES;
    } catch {
      return INITIAL_CROSSMATCHES;
    }
  });

  // Issues
  const [issues, setIssues] = useState<BloodIssueRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_issues');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Transfusions
  const [transfusions, setTransfusions] = useState<TransfusionRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_transfusions');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Reactions
  const [reactions, setReactions] = useState<TransfusionReactionRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_reactions');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Discards
  const [discards, setDiscards] = useState<BloodDiscardRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_discards');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Storage Units & Logs
  const [storageUnits, setStorageUnits] = useState<StorageUnitRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_storage_units');
      return s ? JSON.parse(s) : INITIAL_STORAGE_UNITS;
    } catch {
      return INITIAL_STORAGE_UNITS;
    }
  });

  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLogRecord[]>(() => {
    try {
      const s = localStorage.getItem('hms_blood_temp_logs');
      return s ? JSON.parse(s) : INITIAL_TEMPERATURE_LOGS;
    } catch {
      return INITIAL_TEMPERATURE_LOGS;
    }
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('hms_blood_donors', JSON.stringify(donors)); }, [donors]);
  useEffect(() => { localStorage.setItem('hms_blood_donations', JSON.stringify(donations)); }, [donations]);
  useEffect(() => { localStorage.setItem('hms_blood_bags', JSON.stringify(bloodBags)); }, [bloodBags]);
  useEffect(() => { localStorage.setItem('hms_blood_requests', JSON.stringify(bloodRequests)); }, [bloodRequests]);
  useEffect(() => { localStorage.setItem('hms_blood_crossmatches', JSON.stringify(crossMatches)); }, [crossMatches]);
  useEffect(() => { localStorage.setItem('hms_blood_issues', JSON.stringify(issues)); }, [issues]);
  useEffect(() => { localStorage.setItem('hms_blood_transfusions', JSON.stringify(transfusions)); }, [transfusions]);
  useEffect(() => { localStorage.setItem('hms_blood_reactions', JSON.stringify(reactions)); }, [reactions]);
  useEffect(() => { localStorage.setItem('hms_blood_discards', JSON.stringify(discards)); }, [discards]);
  useEffect(() => { localStorage.setItem('hms_blood_storage_units', JSON.stringify(storageUnits)); }, [storageUnits]);
  useEffect(() => { localStorage.setItem('hms_blood_temp_logs', JSON.stringify(temperatureLogs)); }, [temperatureLogs]);

  // Computed Summaries
  const stockByGroup = useMemo(() => {
    const counts: Record<BloodGroup, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
    bloodBags.forEach(b => {
      if (b.status === 'available' && b.bloodGroup in counts) {
        counts[b.bloodGroup]++;
      }
    });
    return counts;
  }, [bloodBags]);

  const totalUnitsCount = bloodBags.length;
  const availableUnitsCount = bloodBags.filter(b => b.status === 'available').length;
  const reservedUnitsCount = bloodBags.filter(b => b.status === 'reserved').length;
  const quarantineUnitsCount = bloodBags.filter(b => b.status === 'quarantine').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const expiringSoonCount = bloodBags.filter(b =>
    b.status === 'available' && b.expiryDate >= todayStr && b.expiryDate <= sevenDaysLater
  ).length;

  const expiredUnitsCount = bloodBags.filter(b =>
    b.status === 'expired' || (b.status === 'available' && b.expiryDate < todayStr)
  ).length;

  const emergencyRequestsCount = bloodRequests.filter(r =>
    r.priority === 'emergency' && r.status !== 'completed' && r.status !== 'cancelled'
  ).length;

  // Actions
  const addDonor = (donor: Omit<BloodDonorRecord, 'id' | 'registeredAt' | 'totalDonations'>): BloodDonorRecord => {
    const newDonor: BloodDonorRecord = {
      ...donor,
      id: `DNR-2026-${String(donors.length + 1).padStart(3, '0')}`,
      totalDonations: 0,
      registeredAt: new Date().toISOString().slice(0, 10),
    };
    setDonors(prev => [newDonor, ...prev]);
    return newDonor;
  };

  const updateDonor = (id: string, data: Partial<BloodDonorRecord>) => {
    setDonors(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const recordDonation = (donation: Omit<BloodDonationRecord, 'id'>): BloodDonationRecord => {
    const newDonation: BloodDonationRecord = {
      ...donation,
      id: `DON-2026-${String(donations.length + 1).padStart(3, '0')}`,
    };

    // Calculate standard whole blood expiry (35 days)
    const expDate = new Date(Date.now() + 35 * 86400000).toISOString().slice(0, 10);

    // Create blood bag immediately in Quarantine
    const newBag: BloodBagRecord = {
      id: donation.assignedBagId,
      donationId: newDonation.id,
      donorId: donation.donorId,
      bloodGroup: donation.bloodGroup,
      component: 'whole_blood',
      volumeMl: donation.collectionVolumeMl,
      collectionDate: donation.donationDate,
      expiryDate: expDate,
      storageUnitId: 'ST-FRIDGE-01',
      storageLocation: 'Blood Refrigerator 01 · Quarantine Bay',
      screeningStatus: 'quarantine',
      status: 'quarantine',
      batchNumber: `LOT-${donation.donationDate}-${donation.bloodGroup.replace('+', 'POS').replace('-', 'NEG')}-WB`,
    };

    setDonations(prev => [newDonation, ...prev]);
    setBloodBags(prev => [newBag, ...prev]);

    // Update donor donation count & last donation date
    setDonors(prev => prev.map(d => {
      if (d.id === donation.donorId) {
        return {
          ...d,
          totalDonations: d.totalDonations + 1,
          lastDonationDate: donation.donationDate,
        };
      }
      return d;
    }));

    return newDonation;
  };

  const approveScreeningAndRelease = (bagId: string, verifiedBy: string) => {
    setBloodBags(prev => prev.map(b => {
      if (b.id === bagId) {
        return {
          ...b,
          screeningStatus: 'tested_passed',
          status: 'available',
          storageLocation: `Blood Refrigerator 01 · Shelf ${b.bloodGroup}`,
        };
      }
      return b;
    }));

    setDonations(prev => prev.map(d => {
      if (d.assignedBagId === bagId) {
        return { ...d, screeningStatus: 'passed', status: 'completed' };
      }
      return d;
    }));
  };

  const rejectScreeningAndDiscard = (bagId: string, reason: string, authorizedBy: string) => {
    const targetBag = bloodBags.find(b => b.id === bagId);

    setBloodBags(prev => prev.map(b => {
      if (b.id === bagId) {
        return {
          ...b,
          screeningStatus: 'tested_failed',
          status: 'rejected',
          storageLocation: 'Biohazard Discard Bay',
        };
      }
      return b;
    }));

    setDonations(prev => prev.map(d => {
      if (d.assignedBagId === bagId) {
        return { ...d, screeningStatus: 'failed', status: 'discarded' };
      }
      return d;
    }));

    if (targetBag) {
      const discardRecord: BloodDiscardRecord = {
        id: `DISC-2026-${Date.now()}`,
        bagId,
        bloodGroup: targetBag.bloodGroup,
        component: targetBag.component,
        reason: 'failed_screening',
        discardDate: new Date().toISOString().slice(0, 10),
        discardedBy: authorizedBy,
        authorizedBy,
        method: 'autoclave_incineration',
        remarks: `Screening test failed: ${reason}`,
      };
      setDiscards(prev => [discardRecord, ...prev]);
    }
  };

  const processComponents = (parentBagId: string, componentsList: { type: BloodComponentType; volumeMl: number; daysValid: number }[]) => {
    const parent = bloodBags.find(b => b.id === parentBagId);
    if (!parent) return;

    // Remove or mark parent whole blood bag as processed
    const newComponentBags: BloodBagRecord[] = componentsList.map((comp, idx) => {
      const expDate = new Date(Date.now() + comp.daysValid * 86400000).toISOString().slice(0, 10);
      let loc = 'Blood Refrigerator 01 · Shelf ' + parent.bloodGroup;
      let unit = 'ST-FRIDGE-01';

      if (comp.type === 'fresh_frozen_plasma' || comp.type === 'cryoprecipitate') {
        loc = 'Deep Plasma Cryo Freezer -30°C · Rack 1';
        unit = 'ST-FREEZER-01';
      } else if (comp.type === 'platelets') {
        loc = 'Platelet Agitator Incubator 22°C';
        unit = 'ST-AGITATOR-01';
      }

      return {
        id: `${parent.id}-C${idx + 1}`,
        donationId: parent.donationId,
        donorId: parent.donorId,
        bloodGroup: parent.bloodGroup,
        component: comp.type,
        volumeMl: comp.volumeMl,
        collectionDate: parent.collectionDate,
        expiryDate: expDate,
        storageUnitId: unit,
        storageLocation: loc,
        screeningStatus: parent.screeningStatus,
        status: 'available',
        batchNumber: `LOT-${parent.collectionDate}-${parent.bloodGroup}-${comp.type.toUpperCase()}`,
      };
    });

    setBloodBags(prev => [
      ...newComponentBags,
      ...prev.filter(b => b.id !== parentBagId),
    ]);
  };

  const createBloodRequest = (request: Omit<BloodRequestRecord, 'id' | 'createdAt' | 'status' | 'unitsAllocated'>): BloodRequestRecord => {
    const newReq: BloodRequestRecord = {
      ...request,
      id: `BR-2026-${String(bloodRequests.length + 1).padStart(3, '0')}`,
      unitsAllocated: 0,
      status: request.priority === 'emergency' ? 'approved' : 'requested',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    };
    setBloodRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  const approveBloodRequest = (requestId: string, approvedBy: string) => {
    setBloodRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved', approvedBy } : r));
  };

  const recordCrossMatch = (xm: Omit<CrossMatchRecord, 'id'>): CrossMatchRecord => {
    const newXM: CrossMatchRecord = {
      ...xm,
      id: `XM-2026-${Date.now()}`,
    };
    setCrossMatches(prev => [newXM, ...prev]);

    // If compatible, update request status to ready_for_issue
    if (xm.overallResult === 'compatible') {
      setBloodRequests(prev => prev.map(r => r.id === xm.requestId ? { ...r, status: 'ready_for_issue' } : r));
    }
    return newXM;
  };

  const reserveBloodBag = (bagId: string, requestId: string, patientId: string, patientName: string) => {
    setBloodBags(prev => prev.map(b => {
      if (b.id === bagId) {
        return {
          ...b,
          status: 'reserved',
          reservedForPatientId: patientId,
          reservedForPatientName: patientName,
          reservedRequestId: requestId,
        };
      }
      return b;
    }));

    setBloodRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'reserved',
          unitsAllocated: r.unitsAllocated + 1,
        };
      }
      return r;
    }));
  };

  const issueBloodBag = (issue: Omit<BloodIssueRecord, 'id' | 'issuedAt' | 'status'>): BloodIssueRecord => {
    const newIssue: BloodIssueRecord = {
      ...issue,
      id: `ISS-2026-${Date.now()}`,
      issuedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'issued',
    };

    setIssues(prev => [newIssue, ...prev]);

    // Update bag status to issued
    setBloodBags(prev => prev.map(b => b.id === issue.bagId ? { ...b, status: 'issued' } : b));

    // Update blood request status to issued / completed
    setBloodRequests(prev => prev.map(r => r.id === issue.requestId ? { ...r, status: 'issued' } : r));

    return newIssue;
  };

  const recordTransfusionStart = (transfusion: Omit<TransfusionRecord, 'id' | 'status'>): TransfusionRecord => {
    const newTransfusion: TransfusionRecord = {
      ...transfusion,
      id: `TRF-2026-${Date.now()}`,
      status: 'in_progress',
    };
    setTransfusions(prev => [newTransfusion, ...prev]);
    return newTransfusion;
  };

  const recordTransfusionComplete = (transfusionId: string, postVitals: { bp: string; pulse: number; temp: number }) => {
    setTransfusions(prev => prev.map(t => {
      if (t.id === transfusionId) {
        return {
          ...t,
          status: 'completed',
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          postTransfusionVitals: postVitals,
        };
      }
      return t;
    }));

    // Mark blood bag as transfused
    const trans = transfusions.find(t => t.id === transfusionId);
    if (trans) {
      setBloodBags(prev => prev.map(b => b.id === trans.bagId ? { ...b, status: 'transfused' } : b));
    }
  };

  const reportTransfusionReaction = (reaction: Omit<TransfusionReactionRecord, 'id' | 'reportedAt' | 'investigationStatus'>): TransfusionReactionRecord => {
    const newReaction: TransfusionReactionRecord = {
      ...reaction,
      id: `RXN-2026-${Date.now()}`,
      reportedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      investigationStatus: 'reported',
    };

    setReactions(prev => [newReaction, ...prev]);

    // Stop transfusion
    setTransfusions(prev => prev.map(t => t.id === reaction.transfusionId ? { ...t, status: 'stopped_reaction', reactionObserved: true } : t));

    return newReaction;
  };

  const discardBloodBag = (discard: Omit<BloodDiscardRecord, 'id' | 'discardDate'>) => {
    const newDiscard: BloodDiscardRecord = {
      ...discard,
      id: `DISC-2026-${Date.now()}`,
      discardDate: new Date().toISOString().slice(0, 10),
    };

    setDiscards(prev => [newDiscard, ...prev]);
    setBloodBags(prev => prev.map(b => b.id === discard.bagId ? { ...b, status: 'discarded' } : b));
  };

  const recordTemperatureLog = (log: Omit<TemperatureLogRecord, 'id' | 'timestamp'>) => {
    const newLog: TemperatureLogRecord = {
      ...log,
      id: `TLOG-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setTemperatureLogs(prev => [newLog, ...prev]);

    // Update storage unit current temp & status
    setStorageUnits(prev => prev.map(u => {
      if (u.id === log.storageUnitId) {
        return {
          ...u,
          currentTempC: log.temperatureC,
          tempStatus: log.status,
        };
      }
      return u;
    }));
  };

  return (
    <BloodBankContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedBagId,
        setSelectedBagId,
        selectedDonorId,
        setSelectedDonorId,
        donors,
        donations,
        bloodBags,
        bloodRequests,
        crossMatches,
        issues,
        transfusions,
        reactions,
        discards,
        storageUnits,
        temperatureLogs,
        stockByGroup,
        totalUnitsCount,
        availableUnitsCount,
        reservedUnitsCount,
        quarantineUnitsCount,
        expiringSoonCount,
        expiredUnitsCount,
        emergencyRequestsCount,
        addDonor,
        updateDonor,
        recordDonation,
        approveScreeningAndRelease,
        rejectScreeningAndDiscard,
        processComponents,
        createBloodRequest,
        approveBloodRequest,
        recordCrossMatch,
        reserveBloodBag,
        issueBloodBag,
        recordTransfusionStart,
        recordTransfusionComplete,
        reportTransfusionReaction,
        discardBloodBag,
        recordTemperatureLog,
      }}
    >
      {children}
    </BloodBankContext.Provider>
  );
}

export function useBloodBank() {
  const context = useContext(BloodBankContext);
  if (!context) {
    throw new Error('useBloodBank must be used within a BloodBankProvider');
  }
  return context;
}
