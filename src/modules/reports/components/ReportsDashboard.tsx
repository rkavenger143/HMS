import React from 'react';
import {
  BarChart3, Users, Stethoscope, BedDouble, FlaskConical,
  ScanLine, Pill, Droplets, DollarSign, Calendar, HeartPulse,
  TrendingUp, Activity, FileText, ArrowRight, ShieldCheck,
  Building2, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

const PIE_COLORS = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#10b981'];

export default function ReportsDashboard() {
  const { kpis, setActiveTab, exportCSV, patients, beds, admissions } = useReports();

  // Dynamic Chart Data
  const monthlyRevenueData = [
    { month: 'Apr', opd: 38000, ipd: 92000, lab: 24000, rad: 28000, pharma: 41000, blood: 12000 },
    { month: 'May', opd: 42000, ipd: 98000, lab: 26000, rad: 31000, pharma: 45000, blood: 14000 },
    { month: 'Jun', opd: 46000, ipd: 110000, lab: 29000, rad: 34000, pharma: 48000, blood: 15000 },
    { month: 'Jul', opd: 51000, ipd: 122000, lab: 32000, rad: 38000, pharma: 52000, blood: 18000 },
    { month: 'Aug', opd: 55000, ipd: 135000, lab: 36000, rad: 41000, pharma: 57000, blood: 21000 },
    { month: 'Sep', opd: 59000, ipd: 142000, lab: 39000, rad: 44000, pharma: 62000, blood: 24000 },
  ];

  const wardOccupancyData = [
    { name: 'ICU / CCU', occupied: 8, total: 10 },
    { name: 'Surgical Ward', occupied: 14, total: 18 },
    { name: 'Medical Ward', occupied: 16, total: 20 },
    { name: 'Pediatric Ward', occupied: 6, total: 10 },
    { name: 'Maternity Ward', occupied: 7, total: 12 },
  ];

  const patientVolumeTrend = [
    { date: '26 Aug', opd: 42, ipd: 8, lab: 28, pharma: 34 },
    { date: '27 Aug', opd: 48, ipd: 11, lab: 32, pharma: 40 },
    { date: '28 Aug', opd: 53, ipd: 9, lab: 35, pharma: 44 },
    { date: '29 Aug', opd: 49, ipd: 12, lab: 31, pharma: 38 },
    { date: '30 Aug', opd: 58, ipd: 14, lab: 39, pharma: 50 },
    { date: '31 Aug', opd: 62, ipd: 15, lab: 42, pharma: 54 },
    { date: '01 Sep', opd: 65, ipd: 16, lab: 45, pharma: 58 },
  ];

  const handleExportDashboardSummary = () => {
    exportCSV(
      'Hospital_Executive_KPI_Summary',
      ['KPI Metric', 'Current Value', 'Category'],
      [
        ['Total Registered Patients', kpis.totalPatients, 'Patient Management'],
        ['New Patients Today', kpis.newPatientsToday, 'Patient Management'],
        ['Active OPD Visits', kpis.opdVisitsCount, 'Clinical OPD'],
        ['Current IPD Admissions', kpis.ipdAdmissionsCount, 'Clinical IPD'],
        ['Discharged Patients', kpis.ipdDischargesCount, 'Clinical IPD'],
        ['Total Appointments', kpis.totalAppointments, 'Appointments'],
        ['Bed Occupancy Rate', `${kpis.bedOccupancyRate}%`, 'Bed Infrastructure'],
        ['Occupied Beds', `${kpis.occupiedBedsCount} / ${kpis.totalBedsCount}`, 'Bed Infrastructure'],
        ['Laboratory Tests Ordered', kpis.labTestsCount, 'Diagnostics'],
        ['Radiology Studies Ordered', kpis.radiologyStudiesCount, 'Diagnostics'],
        ['Pharmacy Sales Volume', `₹${kpis.pharmacySalesAmount.toLocaleString('en-IN')}`, 'Pharmacy'],
        ['Blood Bank Available Units', kpis.bloodBankAvailableUnits, 'Blood Bank'],
        ['Total Billing Gross', `₹${kpis.totalBillingGross.toLocaleString('en-IN')}`, 'Financials'],
        ['Total Collections', `₹${kpis.totalCollections.toLocaleString('en-IN')}`, 'Financials'],
        ['Total Outstanding Balances', `₹${kpis.totalOutstanding.toLocaleString('en-IN')}`, 'Financials'],
      ]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Executive Hospital Analytics & KPI Dashboard"
        onExportCSV={handleExportDashboardSummary}
      />

      {/* Primary KPI Grid (12 Strategic Metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* Total Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patient')}>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.totalPatients}</div>
          <div className="stat-label">Total Registered Patients</div>
          <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> +{kpis.newPatientsToday} new today
          </div>
        </div>

        {/* OPD & Appointments */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('opd')}>
          <div className="stat-value" style={{ color: '#0284c7' }}>{kpis.opdVisitsCount}</div>
          <div className="stat-label">Active OPD Consultations</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {kpis.totalAppointments} scheduled appointments
          </div>
        </div>

        {/* IPD & Bed Occupancy */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('beds')}>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{kpis.bedOccupancyRate}%</div>
          <div className="stat-label">Bed Occupancy Rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {kpis.occupiedBedsCount} of {kpis.totalBedsCount} beds occupied
          </div>
        </div>

        {/* Diagnostics (Lab + Rad) */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('laboratory')}>
          <div className="stat-value" style={{ color: '#d97706' }}>{kpis.labTestsCount + kpis.radiologyStudiesCount}</div>
          <div className="stat-label">Diagnostics Orders</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {kpis.labTestsCount} Lab · {kpis.radiologyStudiesCount} Radiology
          </div>
        </div>

        {/* Total Billing Gross */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing')}>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            ₹{(kpis.totalBillingGross / 1000).toFixed(1)}k
          </div>
          <div className="stat-label">Total Billed Gross</div>
          <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 4 }}>
            ₹{(kpis.totalCollections / 1000).toFixed(1)}k collected
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('payments')}>
          <div className="stat-value" style={{ color: '#dc2626' }}>
            ₹{(kpis.totalOutstanding / 1000).toFixed(1)}k
          </div>
          <div className="stat-label">Outstanding Receivables</div>
          <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
            Follow-up required
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 16 }}>
        {/* Department Revenue Stacked Bar Chart */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Hospital Department Revenue Trajectory</span>
                <div className="card-subtitle">6-Month revenue breakdown across all service centres</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('financial_analytics')}>
              View Details <ArrowRight size={12} />
            </button>
          </div>

          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ipd" name="IPD Inpatient" stackId="a" fill="#059669" />
                <Bar dataKey="opd" name="OPD Outpatient" stackId="a" fill="#0284c7" />
                <Bar dataKey="pharma" name="Pharmacy" stackId="a" fill="#7c3aed" />
                <Bar dataKey="lab" name="Laboratory" stackId="a" fill="#d97706" />
                <Bar dataKey="rad" name="Radiology" stackId="a" fill="#3b82f6" />
                <Bar dataKey="blood" name="Blood Bank" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Occupancy by Ward Pie / Bar Chart */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BedDouble size={18} style={{ color: '#0284c7' }} />
              <div>
                <span className="card-title">Ward-Wise Bed Occupancy Distribution</span>
                <div className="card-subtitle">Real-time bed utilization across hospital wards</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('beds')}>
              Manage Beds <ArrowRight size={12} />
            </button>
          </div>

          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardOccupancyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#059669" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" name="Total Capacity" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Clinical Volume Trajectory Line Chart */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Weekly Clinical Volume & Encounter Trajectory</span>
              <div className="card-subtitle">Daily traffic: OPD Visits, IPD Admissions, Lab tests, and Pharmacy dispensings</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('operational_analytics')}>
            Operational Deep-Dive <ArrowRight size={12} />
          </button>
        </div>

        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={patientVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="opd" name="OPD Visits" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pharma" name="Pharmacy Dispensed" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="lab" name="Lab Tests" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ipd" name="IPD Admissions" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Access Department Reports Matrix */}
      <div className="card">
        <div className="card-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Centralized Department Report Launchers</span>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { id: 'patient', title: 'Patient Demographics & Registry', icon: Users, desc: 'Registrations, age/gender distributions, patient type' },
              { id: 'opd', title: 'OPD Consultation Reports', icon: Stethoscope, desc: 'Doctor-wise consultations, wait times, token queue logs' },
              { id: 'appointments', title: 'Appointment Scheduling Logs', icon: Calendar, desc: 'Confirmed, in-consultation, cancelled & no-show trends' },
              { id: 'ipd', title: 'IPD Admissions & Length of Stay', icon: BedDouble, desc: 'Inpatient logs, discharge disposition & ALOS analysis' },
              { id: 'beds', title: 'Bed Occupancy & Matrix', icon: Building2, desc: 'Live ward capacity, maintenance & cleaning turnarounds' },
              { id: 'nursing', title: 'Nursing Clinical Notes & Tasks', icon: HeartPulse, desc: 'Bedside vitals, medication charting & shift handovers' },
              { id: 'laboratory', title: 'Laboratory Diagnostics & Orders', icon: FlaskConical, desc: 'Test turnaround time, revenue & specimen tracking' },
              { id: 'radiology', title: 'Radiology Modalities & PACS Studies', icon: ScanLine, desc: 'X-Ray, CT, MRI, USG reports & radiologist signoffs' },
              { id: 'pharmacy', title: 'Pharmacy Sales & Expiry Audits', icon: Pill, desc: 'POS itemized sales, batch inventory & near-expiry warnings' },
              { id: 'blood_bank', title: 'Blood Bank Inventory & Transfusions', icon: Droplets, desc: '8-Group stock matrix, cross-match & hemovigilance' },
              { id: 'billing', title: 'Central Billing & Daily Ledgers', icon: DollarSign, desc: 'Department-wise gross billing, discounts & net invoices' },
              { id: 'payments', title: 'Collections & Cashier Shifts', icon: ShieldCheck, desc: 'Tender breakdown (Cash/UPI/Card) & refund reconciliations' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: 'var(--bg-surface)',
                  }}
                  onClick={() => setActiveTab(item.id as any)}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block' }}>{item.title}</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
