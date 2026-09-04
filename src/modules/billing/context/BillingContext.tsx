import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  BillingDepartment,
  InvoiceStatus,
  PaymentTender,
  PaymentStatus,
  RefundStatus,
  CentralClaimStatus,
  DepartmentChargeItem,
  CentralInvoiceItem,
  BillingPaymentRecord,
  PatientAdvanceRecord,
  BillingRefundRecord,
  CentralInsuranceClaimRecord,
  CashCounterSession,
  BillingServiceItem,
  PatientFinancialAccount,
  CentralBillingKPIs,
} from '../../../types';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';

export type BillingTab =
  | 'dashboard'
  | 'workspace'
  | 'ledger'
  | 'charge_capture'
  | 'invoices'
  | 'payments'
  | 'advances'
  | 'refunds'
  | 'discounts'
  | 'insurance_tpa'
  | 'cash_counters'
  | 'reconciliation'
  | 'services'
  | 'analytics'
  | 'reports'
  | 'settings';

interface BillingContextType {
  departmentCharges: DepartmentChargeItem[];
  invoices: CentralInvoiceItem[];
  payments: BillingPaymentRecord[];
  advances: PatientAdvanceRecord[];
  refunds: BillingRefundRecord[];
  insuranceClaims: CentralInsuranceClaimRecord[];
  cashSessions: CashCounterSession[];
  serviceMasters: BillingServiceItem[];
  activeTab: BillingTab;
  setActiveTab: (tab: BillingTab) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  kpis: CentralBillingKPIs;

  // Actions
  addDepartmentCharge: (charge: Omit<DepartmentChargeItem, 'id' | 'isBilled'>) => DepartmentChargeItem;
  createInvoice: (invoiceData: Omit<CentralInvoiceItem, 'id' | 'invoiceNumber'>) => CentralInvoiceItem;
  recordPayment: (paymentData: Omit<BillingPaymentRecord, 'id' | 'receiptNumber'>) => BillingPaymentRecord;
  recordAdvance: (advanceData: Omit<PatientAdvanceRecord, 'id' | 'advanceNumber'>) => PatientAdvanceRecord;
  applyAdvanceToInvoice: (invoiceId: string, advanceId: string, amount: number) => void;
  processRefund: (refundData: Omit<BillingRefundRecord, 'id' | 'refundNumber'>) => BillingRefundRecord;
  applyDiscount: (invoiceId: string, discountAmount: number, reason: string, approvedBy: string) => void;
  submitInsuranceClaim: (claimData: Omit<CentralInsuranceClaimRecord, 'id' | 'claimNumber'>) => CentralInsuranceClaimRecord;
  updateClaimStatus: (claimId: string, status: CentralClaimStatus, approvedAmount?: number) => void;
  openCashSession: (counterName: string, openingCash: number, cashierName: string) => CashCounterSession;
  closeCashSession: (sessionId: string, actualCash: number) => void;
  addServiceMaster: (service: Omit<BillingServiceItem, 'id'>) => BillingServiceItem;
  updateServiceMaster: (id: string, service: Partial<BillingServiceItem>) => void;
  toggleServiceStatus: (id: string) => void;
  getPatientFinancialAccount: (patientId: string) => PatientFinancialAccount;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Initial Service Master Seed
const SEED_SERVICES: BillingServiceItem[] = [
  { id: 'srv-1', serviceCode: 'OPD-CONS-GEN', serviceName: 'General OPD Physician Consultation', department: 'opd', category: 'Consultation', basePrice: 500, gstRate: 0, hsnCode: '999311', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-2', serviceCode: 'OPD-CONS-SPEC', serviceName: 'Specialist Cardiologist Consultation', department: 'opd', category: 'Consultation', basePrice: 1200, gstRate: 0, hsnCode: '999311', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-3', serviceCode: 'IPD-BED-GEN', serviceName: 'General Ward Bed Rent (Per 24 Hours)', department: 'ipd', category: 'Room/Bed', basePrice: 1500, gstRate: 0, hsnCode: '999312', discountAllowed: false, insuranceEligible: true, isActive: true },
  { id: 'srv-4', serviceCode: 'IPD-BED-ICU', serviceName: 'Intensive Care Unit (ICU) Bed & Monitoring', department: 'ipd', category: 'Room/Bed', basePrice: 6500, gstRate: 0, hsnCode: '999312', discountAllowed: false, insuranceEligible: true, isActive: true },
  { id: 'srv-5', serviceCode: 'LAB-CBC-01', serviceName: 'Complete Blood Count (CBC) with ESR', department: 'laboratory', category: 'Pathology', basePrice: 450, gstRate: 0, hsnCode: '999316', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-6', serviceCode: 'LAB-LFT-01', serviceName: 'Liver Function Test (LFT Profile)', department: 'laboratory', category: 'Biochemistry', basePrice: 850, gstRate: 0, hsnCode: '999316', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-7', serviceCode: 'RAD-CXR-01', serviceName: 'Chest Digital Radiography X-Ray (PA View)', department: 'radiology', category: 'X-Ray', basePrice: 600, gstRate: 0, hsnCode: '999317', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-8', serviceCode: 'RAD-CT-BRN', serviceName: '128-Slice NCCT Brain Contrast Scan', department: 'radiology', category: 'CT Scan', basePrice: 3800, gstRate: 0, hsnCode: '999317', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-9', serviceCode: 'RAD-MRI-SPN', serviceName: '1.5T MRI Lumbo-Sacral Spine with Contrast', department: 'radiology', category: 'MRI', basePrice: 7500, gstRate: 0, hsnCode: '999317', discountAllowed: true, insuranceEligible: true, isActive: true },
  { id: 'srv-10', serviceCode: 'NUR-DRESS-MAJ', serviceName: 'Complex Surgical Wound Dressing & Asepsis', department: 'nursing', category: 'Nursing Care', basePrice: 350, gstRate: 0, hsnCode: '999313', discountAllowed: false, insuranceEligible: true, isActive: true },
];

// Initial Department Charges Seed
const SEED_CHARGES: DepartmentChargeItem[] = [
  {
    id: 'chg-101',
    patientId: 'ALN-2026-00001',
    encounterId: 'ENC-2026-001',
    department: 'opd',
    sourceModule: 'opd',
    sourceRecordId: 'OPD-2026-8812',
    serviceCode: 'OPD-CONS-SPEC',
    description: 'Specialist Cardiology Consultation - Dr. Rajesh Sharma',
    quantity: 1,
    unitPrice: 1200,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 1200,
    chargeDate: '2026-09-02 09:30',
    createdBy: 'Dr. Rajesh Sharma',
    isBilled: true,
    invoiceId: 'inv-1',
  },
  {
    id: 'chg-102',
    patientId: 'ALN-2026-00001',
    encounterId: 'ENC-2026-001',
    department: 'laboratory',
    sourceModule: 'lab',
    sourceRecordId: 'LAB-2026-00101',
    serviceCode: 'LAB-CBC-01',
    description: 'Complete Blood Count (CBC) Automated Test',
    quantity: 1,
    unitPrice: 450,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 450,
    chargeDate: '2026-09-02 10:15',
    createdBy: 'Lab Receptionist',
    isBilled: true,
    invoiceId: 'inv-1',
  },
  {
    id: 'chg-103',
    patientId: 'ALN-2026-00001',
    encounterId: 'ENC-2026-001',
    department: 'radiology',
    sourceModule: 'radiology',
    sourceRecordId: 'RAD-2026-00101',
    serviceCode: 'RAD-CXR-01',
    description: 'Chest Digital Radiography X-Ray (PA View)',
    quantity: 1,
    unitPrice: 600,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 600,
    chargeDate: '2026-09-02 11:00',
    createdBy: 'Rad Tech Vikram',
    isBilled: true,
    invoiceId: 'inv-1',
  },
  {
    id: 'chg-104',
    patientId: 'ALN-2026-00001',
    encounterId: 'ENC-2026-001',
    department: 'pharmacy',
    sourceModule: 'pharmacy',
    sourceRecordId: 'RX-2026-00101',
    serviceCode: 'PHARM-MEDS-01',
    description: 'Prescription Medicines: Augmentin 625 Duo, Dolo 650, Pantocid 40',
    quantity: 1,
    unitPrice: 580,
    discountAmount: 0,
    taxRate: 12,
    totalAmount: 649.6,
    chargeDate: '2026-09-02 11:30',
    createdBy: 'Pharmacist Praveen',
    isBilled: true,
    invoiceId: 'inv-1',
  },
  {
    id: 'chg-105',
    patientId: 'ALN-2026-00002',
    encounterId: 'ADM-2026-001',
    department: 'ipd',
    sourceModule: 'ipd',
    sourceRecordId: 'ADM-2026-001',
    serviceCode: 'IPD-BED-GEN',
    description: 'General Ward Bed Rent (2 Days - Bed 101-A)',
    quantity: 2,
    unitPrice: 1500,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 3000,
    chargeDate: '2026-09-01 14:00',
    createdBy: 'IPD Admissions Desk',
    isBilled: true,
    invoiceId: 'inv-2',
  },
  {
    id: 'chg-106',
    patientId: 'ALN-2026-00002',
    encounterId: 'ADM-2026-001',
    department: 'nursing',
    sourceModule: 'nursing',
    sourceRecordId: 'NUR-2026-081',
    serviceCode: 'NUR-DRESS-MAJ',
    description: 'Post-Operative Nursing Care & Daily Dressing',
    quantity: 2,
    unitPrice: 350,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 700,
    chargeDate: '2026-09-01 18:00',
    createdBy: 'Nurse Incharge Anjali',
    isBilled: true,
    invoiceId: 'inv-2',
  },
  {
    id: 'chg-107',
    patientId: 'ALN-2026-00002',
    encounterId: 'ADM-2026-001',
    department: 'laboratory',
    sourceModule: 'lab',
    sourceRecordId: 'LAB-2026-00102',
    serviceCode: 'LAB-LFT-01',
    description: 'Liver Function Test (LFT) Profile',
    quantity: 1,
    unitPrice: 850,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 850,
    chargeDate: '2026-09-02 08:00',
    createdBy: 'Lab Technician',
    isBilled: true,
    invoiceId: 'inv-2',
  },
  {
    id: 'chg-108',
    patientId: 'ALN-2026-00003',
    encounterId: 'ENC-2026-003',
    department: 'radiology',
    sourceModule: 'radiology',
    sourceRecordId: 'RAD-2026-00103',
    serviceCode: 'RAD-CT-BRN',
    description: '128-Slice NCCT Brain Plain & Contrast Scan',
    quantity: 1,
    unitPrice: 3800,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 3800,
    chargeDate: '2026-09-02 12:00',
    createdBy: 'Radiology Reception',
    isBilled: false,
  },
  {
    id: 'chg-109',
    patientId: 'ALN-2026-00003',
    encounterId: 'ENC-2026-003',
    department: 'emergency',
    sourceModule: 'emergency',
    sourceRecordId: 'EMR-2026-042',
    serviceCode: 'EMR-TRIAGE-01',
    description: 'Emergency Casualty Registration & Resuscitation Observation',
    quantity: 1,
    unitPrice: 1500,
    discountAmount: 0,
    taxRate: 0,
    totalAmount: 1500,
    chargeDate: '2026-09-02 11:30',
    createdBy: 'Emergency Medical Officer',
    isBilled: false,
  },
];

// Initial Invoices Seed
const SEED_INVOICES: CentralInvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-00101',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Patel',
    uhid: 'ALN-2026-00001',
    encounterType: 'opd',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    invoiceDate: '2026-09-02',
    dueDate: '2026-09-02',
    items: [
      SEED_CHARGES[0],
      SEED_CHARGES[1],
      SEED_CHARGES[2],
      SEED_CHARGES[3],
    ],
    grossAmount: 2830,
    discountAmount: 100,
    taxAmount: 69.6,
    insuranceAmount: 0,
    advanceAdjusted: 0,
    netPayable: 2799.6,
    paidAmount: 2799.6,
    outstandingBalance: 0,
    status: 'paid',
    createdBy: 'Cashier Ananya',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-00102',
    patientId: 'ALN-2026-00002',
    patientName: 'Priya Sharma',
    uhid: 'ALN-2026-00002',
    encounterType: 'ipd',
    admissionId: 'ADM-2026-001',
    bedNumber: '101-A',
    ward: 'General Ward',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Internal Medicine',
    invoiceDate: '2026-09-02',
    dueDate: '2026-09-05',
    items: [
      SEED_CHARGES[4],
      SEED_CHARGES[5],
      SEED_CHARGES[6],
    ],
    grossAmount: 4550,
    discountAmount: 0,
    taxAmount: 0,
    insuranceAmount: 0,
    advanceAdjusted: 2000,
    netPayable: 2550,
    paidAmount: 2550,
    outstandingBalance: 0,
    status: 'paid',
    createdBy: 'Cashier Ananya',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-00103',
    patientId: 'ALN-2026-00004',
    patientName: 'Sunita Rao',
    uhid: 'ALN-2026-00004',
    encounterType: 'ipd',
    admissionId: 'ADM-2026-002',
    bedNumber: 'ICU-02',
    ward: 'Intensive Care Unit',
    doctorName: 'Dr. Arun Kumar',
    department: 'Critical Care',
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-04',
    items: [],
    grossAmount: 24500,
    discountAmount: 1500,
    taxAmount: 0,
    insuranceAmount: 15000,
    advanceAdjusted: 5000,
    netPayable: 3000,
    paidAmount: 0,
    outstandingBalance: 3000,
    status: 'partially_paid',
    createdBy: 'Billing Supervisor Rakesh',
  },
];

// Initial Payments Seed
const SEED_PAYMENTS: BillingPaymentRecord[] = [
  {
    id: 'pay-1',
    receiptNumber: 'RCPT-2026-00101',
    invoiceId: 'inv-1',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Patel',
    amount: 2799.6,
    paymentMethod: 'upi',
    transactionRef: 'UPI/98124481921/HDFC',
    paymentDate: '2026-09-02 11:45',
    receivedBy: 'Cashier Ananya',
    status: 'successful',
    counterName: 'Main OPD Cash Counter 1',
  },
  {
    id: 'pay-2',
    receiptNumber: 'RCPT-2026-00102',
    invoiceId: 'inv-2',
    patientId: 'ALN-2026-00002',
    patientName: 'Priya Sharma',
    amount: 2550,
    paymentMethod: 'card',
    transactionRef: 'POS-TXN-884129',
    paymentDate: '2026-09-02 14:15',
    receivedBy: 'Cashier Ananya',
    status: 'successful',
    counterName: 'IPD Discharge Billing Counter',
  },
];

// Initial Advances Seed
const SEED_ADVANCES: PatientAdvanceRecord[] = [
  {
    id: 'adv-1',
    advanceNumber: 'ADV-2026-00101',
    patientId: 'ALN-2026-00002',
    patientName: 'Priya Sharma',
    amount: 2000,
    paymentMethod: 'cash',
    reference: 'Inpatient Admission Deposit',
    date: '2026-09-01 14:00',
    receivedBy: 'Cashier Ananya',
    status: 'utilized',
    utilizedInvoiceId: 'inv-2',
  },
  {
    id: 'adv-2',
    advanceNumber: 'ADV-2026-00102',
    patientId: 'ALN-2026-00004',
    patientName: 'Sunita Rao',
    amount: 5000,
    paymentMethod: 'upi',
    reference: 'ICU Booking Deposit',
    date: '2026-09-01 10:00',
    receivedBy: 'Cashier Rakesh',
    status: 'utilized',
    utilizedInvoiceId: 'inv-3',
  },
  {
    id: 'adv-3',
    advanceNumber: 'ADV-2026-00103',
    patientId: 'ALN-2026-00005',
    patientName: 'Vikram Malhotra',
    amount: 10000,
    paymentMethod: 'net_banking',
    reference: 'Elective Knee Arthroplasty Advance',
    date: '2026-09-02 09:00',
    receivedBy: 'Cashier Ananya',
    status: 'available',
  },
];

// Initial Refunds Seed
const SEED_REFUNDS: BillingRefundRecord[] = [
  {
    id: 'ref-1',
    refundNumber: 'REF-2026-00101',
    invoiceId: 'inv-1',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Patel',
    amount: 450,
    reason: 'Cancelled duplicate ultrasound scan requested in error',
    refundMethod: 'upi',
    requestedBy: 'Dr. Rajesh Sharma',
    approvedBy: 'Dr. Anil Mehta (Medical Superintendent)',
    processedAt: '2026-09-02 12:30',
    status: 'processed',
  },
];

// Initial Insurance Claims Seed
const SEED_CLAIMS: CentralInsuranceClaimRecord[] = [
  {
    id: 'claim-1',
    claimNumber: 'CLM-2026-00101',
    patientId: 'ALN-2026-00004',
    patientName: 'Sunita Rao',
    invoiceId: 'inv-3',
    insuranceProvider: 'Star Health & Allied Insurance',
    policyNumber: 'SH-IND-2026-881924',
    tpaName: 'Medi Assist TPA Pvt Ltd',
    claimAmount: 18000,
    approvedAmount: 15000,
    coPayAmount: 3000,
    status: 'approved',
    submittedDate: '2026-09-01',
    settledDate: '2026-09-02',
  },
];

// Initial Cash Sessions Seed
const SEED_SESSIONS: CashCounterSession[] = [
  {
    id: 'sess-1',
    counterName: 'Main OPD Cash Counter 1',
    cashierName: 'Ananya Deshmukh',
    openingCash: 5000,
    cashCollected: 14500,
    cardCollected: 22000,
    upiCollected: 18500,
    refundsDisbursed: 450,
    expectedCash: 19050,
    actualCash: 19050,
    variance: 0,
    openedAt: '2026-09-02 08:00',
    status: 'open',
  },
  {
    id: 'sess-2',
    counterName: 'IPD Discharge Billing Counter',
    cashierName: 'Rakesh Verma',
    openingCash: 5000,
    cashCollected: 38000,
    cardCollected: 45000,
    upiCollected: 29000,
    refundsDisbursed: 0,
    expectedCash: 43000,
    actualCash: 43000,
    variance: 0,
    openedAt: '2026-09-02 08:30',
    status: 'open',
  },
];

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departmentCharges, setDepartmentCharges] = useState<DepartmentChargeItem[]>(() => {
    const saved = localStorage.getItem('hms_billing_charges');
    return saved ? JSON.parse(saved) : SEED_CHARGES;
  });

  const [invoices, setInvoices] = useState<CentralInvoiceItem[]>(() => {
    const saved = localStorage.getItem('hms_billing_invoices');
    return saved ? JSON.parse(saved) : SEED_INVOICES;
  });

  const [payments, setPayments] = useState<BillingPaymentRecord[]>(() => {
    const saved = localStorage.getItem('hms_billing_payments');
    return saved ? JSON.parse(saved) : SEED_PAYMENTS;
  });

  const [advances, setAdvances] = useState<PatientAdvanceRecord[]>(() => {
    const saved = localStorage.getItem('hms_billing_advances');
    return saved ? JSON.parse(saved) : SEED_ADVANCES;
  });

  const [refunds, setRefunds] = useState<BillingRefundRecord[]>(() => {
    const saved = localStorage.getItem('hms_billing_refunds');
    return saved ? JSON.parse(saved) : SEED_REFUNDS;
  });

  const [insuranceClaims, setInsuranceClaims] = useState<CentralInsuranceClaimRecord[]>(() => {
    const saved = localStorage.getItem('hms_billing_claims');
    return saved ? JSON.parse(saved) : SEED_CLAIMS;
  });

  const [cashSessions, setCashSessions] = useState<CashCounterSession[]>(() => {
    const saved = localStorage.getItem('hms_billing_sessions');
    return saved ? JSON.parse(saved) : SEED_SESSIONS;
  });

  const [serviceMasters, setServiceMasters] = useState<BillingServiceItem[]>(() => {
    const saved = localStorage.getItem('hms_billing_services');
    return saved ? JSON.parse(saved) : SEED_SERVICES;
  });

  const [activeTab, setActiveTab] = useState<BillingTab>('dashboard');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hms_billing_charges', JSON.stringify(departmentCharges));
  }, [departmentCharges]);

  useEffect(() => {
    localStorage.setItem('hms_billing_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('hms_billing_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('hms_billing_advances', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem('hms_billing_refunds', JSON.stringify(refunds));
  }, [refunds]);

  useEffect(() => {
    localStorage.setItem('hms_billing_claims', JSON.stringify(insuranceClaims));
  }, [insuranceClaims]);

  useEffect(() => {
    localStorage.setItem('hms_billing_sessions', JSON.stringify(cashSessions));
  }, [cashSessions]);

  useEffect(() => {
    localStorage.setItem('hms_billing_services', JSON.stringify(serviceMasters));
  }, [serviceMasters]);

  // Actions
  const addDepartmentCharge = (charge: Omit<DepartmentChargeItem, 'id' | 'isBilled'>): DepartmentChargeItem => {
    // Idempotency: Check if charge already exists from the same source
    const existing = departmentCharges.find(
      c => c.sourceModule === charge.sourceModule && c.sourceRecordId === charge.sourceRecordId && c.serviceCode === charge.serviceCode
    );
    if (existing) {
      return existing;
    }

    const newCharge: DepartmentChargeItem = {
      ...charge,
      id: `chg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isBilled: false,
    };
    setDepartmentCharges(prev => [newCharge, ...prev]);
    return newCharge;
  };

  const createInvoice = (invoiceData: Omit<CentralInvoiceItem, 'id' | 'invoiceNumber'>): CentralInvoiceItem => {
    const seq = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-2026-00${seq}`;
    const newInvoice: CentralInvoiceItem = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
    };

    // Mark included items as billed
    const itemIds = newInvoice.items.map(i => i.id);
    setDepartmentCharges(prev =>
      prev.map(c => (itemIds.includes(c.id) ? { ...c, isBilled: true, invoiceId: newInvoice.id } : c))
    );

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const recordPayment = (paymentData: Omit<BillingPaymentRecord, 'id' | 'receiptNumber'>): BillingPaymentRecord => {
    const seq = Math.floor(100 + Math.random() * 900);
    const receiptNumber = `RCPT-2026-00${seq}`;
    const newPayment: BillingPaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber,
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update Invoice status and balance
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === paymentData.invoiceId) {
          const newPaid = inv.paidAmount + paymentData.amount;
          const newOutstanding = Math.max(0, inv.netPayable - newPaid);
          const newStatus: InvoiceStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paidAmount: newPaid,
            outstandingBalance: newOutstanding,
            status: newStatus,
          };
        }
        return inv;
      })
    );

    // Update active cash session if matching cashier/counter
    setCashSessions(prev =>
      prev.map(sess => {
        if (sess.status === 'open') {
          if (paymentData.paymentMethod === 'cash') {
            return {
              ...sess,
              cashCollected: sess.cashCollected + paymentData.amount,
              expectedCash: sess.expectedCash + paymentData.amount,
            };
          } else if (paymentData.paymentMethod === 'card') {
            return { ...sess, cardCollected: sess.cardCollected + paymentData.amount };
          } else if (paymentData.paymentMethod === 'upi') {
            return { ...sess, upiCollected: sess.upiCollected + paymentData.amount };
          }
        }
        return sess;
      })
    );

    return newPayment;
  };

  const recordAdvance = (advanceData: Omit<PatientAdvanceRecord, 'id' | 'advanceNumber'>): PatientAdvanceRecord => {
    const seq = Math.floor(100 + Math.random() * 900);
    const advanceNumber = `ADV-2026-00${seq}`;
    const newAdvance: PatientAdvanceRecord = {
      ...advanceData,
      id: `adv-${Date.now()}`,
      advanceNumber,
    };
    setAdvances(prev => [newAdvance, ...prev]);
    return newAdvance;
  };

  const applyAdvanceToInvoice = (invoiceId: string, advanceId: string, amount: number) => {
    setAdvances(prev =>
      prev.map(adv => (adv.id === advanceId ? { ...adv, status: 'utilized', utilizedInvoiceId: invoiceId } : adv))
    );

    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newAdvanceAdjusted = inv.advanceAdjusted + amount;
          const newNetPayable = Math.max(0, inv.grossAmount - inv.discountAmount - inv.insuranceAmount - newAdvanceAdjusted + inv.taxAmount);
          const newOutstanding = Math.max(0, newNetPayable - inv.paidAmount);
          const newStatus: InvoiceStatus = newOutstanding <= 0 ? 'paid' : inv.paidAmount > 0 ? 'partially_paid' : 'generated';
          return {
            ...inv,
            advanceAdjusted: newAdvanceAdjusted,
            netPayable: newNetPayable,
            outstandingBalance: newOutstanding,
            status: newStatus,
          };
        }
        return inv;
      })
    );
  };

  const processRefund = (refundData: Omit<BillingRefundRecord, 'id' | 'refundNumber'>): BillingRefundRecord => {
    const seq = Math.floor(100 + Math.random() * 900);
    const refundNumber = `REF-2026-00${seq}`;
    const newRefund: BillingRefundRecord = {
      ...refundData,
      id: `ref-${Date.now()}`,
      refundNumber,
    };

    setRefunds(prev => [newRefund, ...prev]);

    // Update cash session refunds if cash refund
    if (refundData.refundMethod === 'cash') {
      setCashSessions(prev =>
        prev.map(sess => (sess.status === 'open' ? {
          ...sess,
          refundsDisbursed: sess.refundsDisbursed + refundData.amount,
          expectedCash: sess.expectedCash - refundData.amount,
        } : sess))
      );
    }

    return newRefund;
  };

  const applyDiscount = (invoiceId: string, discountAmount: number, reason: string, approvedBy: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newNet = Math.max(0, inv.grossAmount - discountAmount - inv.insuranceAmount - inv.advanceAdjusted + inv.taxAmount);
          const newOutstanding = Math.max(0, newNet - inv.paidAmount);
          return {
            ...inv,
            discountAmount,
            netPayable: newNet,
            outstandingBalance: newOutstanding,
          };
        }
        return inv;
      })
    );
  };

  const submitInsuranceClaim = (claimData: Omit<CentralInsuranceClaimRecord, 'id' | 'claimNumber'>): CentralInsuranceClaimRecord => {
    const seq = Math.floor(100 + Math.random() * 900);
    const claimNumber = `CLM-2026-00${seq}`;
    const newClaim: CentralInsuranceClaimRecord = {
      ...claimData,
      id: `claim-${Date.now()}`,
      claimNumber,
    };
    setInsuranceClaims(prev => [newClaim, ...prev]);
    return newClaim;
  };

  const updateClaimStatus = (claimId: string, status: CentralClaimStatus, approvedAmount?: number) => {
    setInsuranceClaims(prev =>
      prev.map(c => (c.id === claimId ? { ...c, status, approvedAmount: approvedAmount !== undefined ? approvedAmount : c.approvedAmount } : c))
    );
  };

  const openCashSession = (counterName: string, openingCash: number, cashierName: string): CashCounterSession => {
    const newSession: CashCounterSession = {
      id: `sess-${Date.now()}`,
      counterName,
      cashierName,
      openingCash,
      cashCollected: 0,
      cardCollected: 0,
      upiCollected: 0,
      refundsDisbursed: 0,
      expectedCash: openingCash,
      actualCash: openingCash,
      variance: 0,
      openedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'open',
    };
    setCashSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const closeCashSession = (sessionId: string, actualCash: number) => {
    setCashSessions(prev =>
      prev.map(sess => {
        if (sess.id === sessionId) {
          const variance = actualCash - sess.expectedCash;
          return {
            ...sess,
            actualCash,
            variance,
            closedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            status: 'closed',
          };
        }
        return sess;
      })
    );
  };

  const addServiceMaster = (service: Omit<BillingServiceItem, 'id'>): BillingServiceItem => {
    const newService: BillingServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
    };
    setServiceMasters(prev => [newService, ...prev]);
    return newService;
  };

  const updateServiceMaster = (id: string, service: Partial<BillingServiceItem>) => {
    setServiceMasters(prev => prev.map(s => (s.id === id ? { ...s, ...service } : s)));
  };

  const toggleServiceStatus = (id: string) => {
    setServiceMasters(prev => prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const getPatientFinancialAccount = (patientId: string): PatientFinancialAccount => {
    const patient = DEMO_PATIENTS.find(p => p.id === patientId);
    const patInvoices = invoices.filter(i => i.patientId === patientId);
    const patPayments = payments.filter(p => p.patientId === patientId);
    const patAdvances = advances.filter(a => a.patientId === patientId);
    const patRefunds = refunds.filter(r => r.patientId === patientId);
    const patClaims = insuranceClaims.filter(c => c.patientId === patientId);

    const totalBilled = patInvoices.reduce((sum, i) => sum + i.grossAmount, 0);
    const totalPaid = patPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalDiscount = patInvoices.reduce((sum, i) => sum + i.discountAmount, 0);
    const totalAdvance = patAdvances.reduce((sum, a) => sum + a.amount, 0);
    const totalRefund = patRefunds.reduce((sum, r) => sum + r.amount, 0);
    const totalInsurance = patClaims.reduce((sum, c) => sum + c.approvedAmount, 0);
    const netOutstanding = patInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);

    return {
      patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
      uhid: patientId,
      phone: patient?.phone,
      totalBilled,
      totalPaid,
      totalDiscount,
      totalAdvance,
      totalRefund,
      totalInsurance,
      netOutstanding,
      invoicesCount: patInvoices.length,
    };
  };

  // Compute Real-Time Dashboard KPIs
  const kpis = useMemo<CentralBillingKPIs>(() => {
    const today = new Date().toISOString().slice(0, 10);

    const todayInvoices = invoices.filter(i => i.invoiceDate.startsWith(today));
    const todayPayments = payments.filter(p => p.paymentDate.startsWith(today));
    const todayRefunds = refunds.filter(r => r.processedAt.startsWith(today));

    const todayTotalRevenue = todayInvoices.reduce((sum, i) => sum + i.grossAmount, 0);
    const todayCollections = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const todayPendingDues = todayInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingBalance, 0);

    // Department Breakdown
    let opdRevenue = 0;
    let ipdRevenue = 0;
    let labRevenue = 0;
    let radRevenue = 0;
    let pharmacyRevenue = 0;
    let otherRevenue = 0;

    departmentCharges.forEach(c => {
      if (c.department === 'opd') opdRevenue += c.totalAmount;
      else if (c.department === 'ipd') ipdRevenue += c.totalAmount;
      else if (c.department === 'laboratory') labRevenue += c.totalAmount;
      else if (c.department === 'radiology') radRevenue += c.totalAmount;
      else if (c.department === 'pharmacy') pharmacyRevenue += c.totalAmount;
      else otherRevenue += c.totalAmount;
    });

    const refundsToday = todayRefunds.reduce((sum, r) => sum + r.amount, 0);
    const insuranceClaimsAmount = insuranceClaims.reduce((sum, c) => sum + c.approvedAmount, 0);

    const cashCollection = todayPayments
      .filter(p => p.paymentMethod === 'cash')
      .reduce((sum, p) => sum + p.amount, 0);
    const cardCollection = todayPayments
      .filter(p => p.paymentMethod === 'card')
      .reduce((sum, p) => sum + p.amount, 0);
    const upiCollection = todayPayments
      .filter(p => p.paymentMethod === 'upi')
      .reduce((sum, p) => sum + p.amount, 0);

    const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
    const unpaidInvoicesCount = invoices.filter(i => i.status === 'generated' || i.status === 'partially_paid' || i.status === 'overdue').length;

    return {
      todayTotalRevenue,
      todayCollections,
      todayPendingDues,
      totalOutstanding,
      opdRevenue,
      ipdRevenue,
      labRevenue,
      radRevenue,
      pharmacyRevenue,
      otherRevenue,
      refundsToday,
      insuranceClaimsAmount,
      cashCollection,
      cardCollection,
      upiCollection,
      totalInvoicesToday: todayInvoices.length,
      paidInvoicesCount,
      unpaidInvoicesCount,
    };
  }, [invoices, payments, refunds, insuranceClaims, departmentCharges]);

  return (
    <BillingContext.Provider
      value={{
        departmentCharges,
        invoices,
        payments,
        advances,
        refunds,
        insuranceClaims,
        cashSessions,
        serviceMasters,
        activeTab,
        setActiveTab,
        selectedInvoiceId,
        setSelectedInvoiceId,
        selectedPatientId,
        setSelectedPatientId,
        kpis,

        addDepartmentCharge,
        createInvoice,
        recordPayment,
        recordAdvance,
        applyAdvanceToInvoice,
        processRefund,
        applyDiscount,
        submitInsuranceClaim,
        updateClaimStatus,
        openCashSession,
        closeCashSession,
        addServiceMaster,
        updateServiceMaster,
        toggleServiceStatus,
        getPatientFinancialAccount,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
