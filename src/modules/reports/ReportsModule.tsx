import React from 'react';
import {
  BarChart2, Users, Stethoscope, Calendar, BedDouble,
  Activity, Heart, TestTube, Film, Pill, Droplet,
  DollarSign, CreditCard, UserCheck, AlertTriangle,
  TrendingUp, Clock, ShieldCheck, Download, Printer
} from 'lucide-react';
import { ReportsProvider, useReports, ReportTab } from './context/ReportsContext';

// Import All Tab Components
import ReportsDashboard from './components/ReportsDashboard';
import PatientReports from './components/PatientReports';
import OPDReports from './components/OPDReports';
import AppointmentReports from './components/AppointmentReports';
import IPDReports from './components/IPDReports';
import BedOccupancyReports from './components/BedOccupancyReports';
import NursingReports from './components/NursingReports';
import LaboratoryReports from './components/LaboratoryReports';
import RadiologyReports from './components/RadiologyReports';
import PharmacyReports from './components/PharmacyReports';
import BloodBankReportsTab from './components/BloodBankReportsTab';
import BillingReports from './components/BillingReports';
import PaymentCollectionReports from './components/PaymentCollectionReports';
import DoctorPerformanceReports from './components/DoctorPerformanceReports';
import EmergencyDischargeReports from './components/EmergencyDischargeReports';
import FinancialAnalytics from './components/FinancialAnalytics';
import OperationalAnalytics from './components/OperationalAnalytics';
import AuditTrailReports from './components/AuditTrailReports';

interface TabItem {
  id: ReportTab;
  label: string;
  icon: React.ElementType;
  category: 'Clinical' | 'Operations' | 'Finance' | 'Administrative';
}

const REPORT_TABS: TabItem[] = [
  { id: 'dashboard', label: 'Executive Overview', icon: BarChart2, category: 'Clinical' },
  { id: 'patient', label: 'Patient Master', icon: Users, category: 'Clinical' },
  { id: 'opd', label: 'OPD Consultations', icon: Stethoscope, category: 'Clinical' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, category: 'Clinical' },
  { id: 'ipd', label: 'IPD Inpatients', icon: BedDouble, category: 'Operations' },
  { id: 'beds', label: 'Bed Matrix', icon: Activity, category: 'Operations' },
  { id: 'nursing', label: 'Nursing Care', icon: Heart, category: 'Operations' },
  { id: 'laboratory', label: 'Diagnostic Lab', icon: TestTube, category: 'Clinical' },
  { id: 'radiology', label: 'Radiology Studies', icon: Film, category: 'Clinical' },
  { id: 'pharmacy', label: 'Pharmacy Retail', icon: Pill, category: 'Operations' },
  { id: 'blood_bank', label: 'Blood Bank', icon: Droplet, category: 'Operations' },
  { id: 'billing', label: 'Central Billing', icon: DollarSign, category: 'Finance' },
  { id: 'payments', label: 'Payment Receipts', icon: CreditCard, category: 'Finance' },
  { id: 'financial_analytics', label: 'Financial Analytics', icon: TrendingUp, category: 'Finance' },
  { id: 'doctors', label: 'Doctor Productivity', icon: UserCheck, category: 'Administrative' },
  { id: 'emergency_discharge', label: 'ER & Discharge', icon: AlertTriangle, category: 'Operations' },
  { id: 'operational_analytics', label: 'Operations & TAT', icon: Clock, category: 'Operations' },
  { id: 'audit_logs', label: 'Security & Audit', icon: ShieldCheck, category: 'Administrative' },
];

function ReportsContent() {
  const { activeTab, setActiveTab, printReport } = useReports();

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ReportsDashboard />;
      case 'patient':
        return <PatientReports />;
      case 'opd':
        return <OPDReports />;
      case 'appointments':
        return <AppointmentReports />;
      case 'ipd':
        return <IPDReports />;
      case 'beds':
        return <BedOccupancyReports />;
      case 'nursing':
        return <NursingReports />;
      case 'laboratory':
        return <LaboratoryReports />;
      case 'radiology':
        return <RadiologyReports />;
      case 'pharmacy':
        return <PharmacyReports />;
      case 'blood_bank':
        return <BloodBankReportsTab />;
      case 'billing':
        return <BillingReports />;
      case 'payments':
        return <PaymentCollectionReports />;
      case 'financial_analytics':
        return <FinancialAnalytics />;
      case 'doctors':
        return <DoctorPerformanceReports />;
      case 'emergency_discharge':
        return <EmergencyDischargeReports />;
      case 'operational_analytics':
        return <OperationalAnalytics />;
      case 'audit_logs':
        return <AuditTrailReports />;
      default:
        return <ReportsDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Hospital Administration</span>
            <span className="breadcrumb-sep">›</span>
            <span>Central Intelligence</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Reports & Analytics Hub</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart2 size={28} style={{ color: 'var(--color-primary)' }} />
            Central Reports & Hospital Analytics
          </div>
          <div className="page-subtitle">
            Real-time multi-department reporting, clinical audits, revenue reconciliation & operational benchmarks
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => printReport('Comprehensive Hospital Report')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Printer size={16} />
            Print Full Report
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-color)',
          scrollbarWidth: 'thin',
        }}
      >
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Dynamic Content */}
      <div style={{ minHeight: 600 }}>
        {renderActiveTabContent()}
      </div>
    </div>
  );
}

export default function ReportsModule() {
  return (
    <ReportsProvider>
      <ReportsContent />
    </ReportsProvider>
  );
}
