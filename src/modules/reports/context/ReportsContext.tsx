import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_APPOINTMENTS,
  DEMO_ADMISSIONS,
  DEMO_BEDS,
  DEMO_LAB_REQUESTS,
  DEMO_RADIOLOGY_STUDIES,
  DEMO_MEDICINES,
  DEMO_DISPENSINGS,
  DEMO_BILLS,
  DEMO_USERS,
} from '../../../data/seedData';
import type { Patient, Doctor, Appointment, Admission, Bed, LabRequest, RadiologyStudy, Medicine, Dispensing } from '../../../types';

export type ReportTab =
  | 'dashboard'
  | 'patient'
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
  | 'doctors'
  | 'emergency_discharge'
  | 'financial_analytics'
  | 'operational_analytics'
  | 'audit_logs';

export type DateFilterPreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'previous_month'
  | 'this_year'
  | 'custom';

export interface GlobalFilterState {
  datePreset: DateFilterPreset;
  startDate: string;
  endDate: string;
  department: string;
  doctorId: string;
  patientSearch: string;
  status: string;
}

export interface ReportsKPIs {
  totalPatients: number;
  newPatientsToday: number;
  opdVisitsCount: number;
  ipdAdmissionsCount: number;
  ipdDischargesCount: number;
  totalAppointments: number;
  bedOccupancyRate: number;
  totalBedsCount: number;
  occupiedBedsCount: number;
  labTestsCount: number;
  labPendingCount: number;
  radiologyStudiesCount: number;
  pharmacySalesAmount: number;
  bloodBankAvailableUnits: number;
  bloodBankIssuesCount: number;
  totalBillingGross: number;
  totalCollections: number;
  totalOutstanding: number;
  totalRefunds: number;
}

interface ReportsContextType {
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  updateFilter: (key: keyof GlobalFilterState, value: string) => void;
  resetFilters: () => void;
  kpis: ReportsKPIs;

  // Raw and computed datasets
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  admissions: Admission[];
  beds: Bed[];
  labRequests: LabRequest[];
  radiologyStudies: RadiologyStudy[];
  medicines: Medicine[];
  dispensings: Dispensing[];
  invoices: any[];
  payments: any[];
  bloodBags: any[];
  bloodDonations: any[];
  bloodIssues: any[];
  bloodRequests: any[];

  // Utility export and print
  exportCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;
  printReport: (reportTitle: string) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const DEFAULT_FILTERS: GlobalFilterState = {
  datePreset: 'this_month',
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  department: 'ALL',
  doctorId: 'ALL',
  patientSearch: '',
  status: 'ALL',
};

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [filters, setFilters] = useState<GlobalFilterState>(DEFAULT_FILTERS);

  // Invoices & Payments from central billing localStorage
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [bloodBags, setBloodBags] = useState<any[]>([]);
  const [bloodDonations, setBloodDonations] = useState<any[]>([]);
  const [bloodIssues, setBloodIssues] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);

  useEffect(() => {
    try {
      const invData = localStorage.getItem('hms_central_invoices');
      if (invData) setInvoices(JSON.parse(invData));

      const payData = localStorage.getItem('hms_billing_payments');
      if (payData) setPayments(JSON.parse(payData));

      const bbData = localStorage.getItem('hms_blood_bags');
      if (bbData) setBloodBags(JSON.parse(bbData));

      const bdData = localStorage.getItem('hms_blood_donations');
      if (bdData) setBloodDonations(JSON.parse(bdData));

      const biData = localStorage.getItem('hms_blood_issues');
      if (biData) setBloodIssues(JSON.parse(biData));

      const brData = localStorage.getItem('hms_blood_requests');
      if (brData) setBloodRequests(JSON.parse(brData));
    } catch {
      // fallback
    }
  }, []);

  const updateFilter = (key: keyof GlobalFilterState, value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };

      if (key === 'datePreset') {
        const today = new Date();
        if (value === 'today') {
          const tStr = today.toISOString().slice(0, 10);
          updated.startDate = tStr;
          updated.endDate = tStr;
        } else if (value === 'yesterday') {
          const y = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
          updated.startDate = y;
          updated.endDate = y;
        } else if (value === 'last_7_days') {
          updated.startDate = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);
          updated.endDate = today.toISOString().slice(0, 10);
        } else if (value === 'last_30_days') {
          updated.startDate = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
          updated.endDate = today.toISOString().slice(0, 10);
        } else if (value === 'this_month') {
          updated.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
          updated.endDate = today.toISOString().slice(0, 10);
        } else if (value === 'previous_month') {
          updated.startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
          updated.endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
        } else if (value === 'this_year') {
          updated.startDate = `${today.getFullYear()}-01-01`;
          updated.endDate = today.toISOString().slice(0, 10);
        }
      }

      return updated;
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Aggregated KPIs
  const kpis = useMemo<ReportsKPIs>(() => {
    const totalPatients = DEMO_PATIENTS.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const newPatientsToday = DEMO_PATIENTS.filter(p => p.registrationDate === todayStr).length || 2;

    const opdVisitsCount = 28; // Active demo OPD visits
    const ipdAdmissionsCount = DEMO_ADMISSIONS.length;
    const ipdDischargesCount = DEMO_ADMISSIONS.filter(a => a.status === 'discharged').length;

    const totalAppointments = DEMO_APPOINTMENTS.length;

    const totalBedsCount = DEMO_BEDS.length;
    const occupiedBedsCount = DEMO_BEDS.filter(b => b.status === 'occupied').length;
    const bedOccupancyRate = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

    const labTestsCount = DEMO_LAB_REQUESTS.length;
    const labPendingCount = DEMO_LAB_REQUESTS.filter(l => l.status === 'ordered' || l.status === 'sample_collected' || l.status === 'processing').length;

    const radiologyStudiesCount = DEMO_RADIOLOGY_STUDIES.length;

    const pharmacySalesAmount = DEMO_DISPENSINGS.reduce((acc, d) => acc + (d.totalAmount || 0), 0) || 45200;

    const bloodBankAvailableUnits = bloodBags.filter(b => b.status === 'available').length || 18;
    const bloodBankIssuesCount = bloodIssues.length || 6;

    // Billing & Collections
    const effectiveInvoices = invoices.length > 0 ? invoices : DEMO_BILLS.map(b => ({
      id: b.id,
      netPayable: b.total || b.totalAmount || b.subtotal,
      paidAmount: b.paidAmount,
      outstandingBalance: (b.total || b.totalAmount || b.subtotal) - b.paidAmount,
      status: b.status,
    }));

    const totalBillingGross = effectiveInvoices.reduce((acc, i) => acc + (Number(i.netPayable || i.totalAmount) || 0), 0);
    const totalCollections = effectiveInvoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
    const totalOutstanding = effectiveInvoices.reduce((acc, i) => acc + Math.max(0, (Number(i.netPayable || i.totalAmount) || 0) - (Number(i.paidAmount) || 0)), 0);
    const totalRefunds = 4500;

    return {
      totalPatients,
      newPatientsToday,
      opdVisitsCount,
      ipdAdmissionsCount,
      ipdDischargesCount,
      totalAppointments,
      bedOccupancyRate,
      totalBedsCount,
      occupiedBedsCount,
      labTestsCount,
      labPendingCount,
      radiologyStudiesCount,
      pharmacySalesAmount,
      bloodBankAvailableUnits,
      bloodBankIssuesCount,
      totalBillingGross,
      totalCollections,
      totalOutstanding,
      totalRefunds,
    };
  }, [invoices, bloodBags, bloodIssues]);

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

  // Print Utility
  const printReport = (reportTitle: string) => {
    const originalTitle = document.title;
    document.title = `ALN Cure Hospital — ${reportTitle} (${new Date().toLocaleDateString('en-IN')})`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <ReportsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        kpis,
        patients: DEMO_PATIENTS,
        doctors: DEMO_DOCTORS,
        appointments: DEMO_APPOINTMENTS,
        admissions: DEMO_ADMISSIONS,
        beds: DEMO_BEDS,
        labRequests: DEMO_LAB_REQUESTS,
        radiologyStudies: DEMO_RADIOLOGY_STUDIES,
        medicines: DEMO_MEDICINES,
        dispensings: DEMO_DISPENSINGS,
        invoices,
        payments,
        bloodBags,
        bloodDonations,
        bloodIssues,
        bloodRequests,
        exportCSV,
        printReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
