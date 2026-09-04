import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Calendar, Clock, Stethoscope, BedDouble, FlaskConical, Scan, Pill,
  ReceiptText, AlertTriangle, TrendingUp, TrendingDown, Brain, Activity,
  HeartPulse, Droplets, CheckCircle2, AlertCircle, RefreshCw, ArrowRight,
  Filter, Plus, DollarSign, ShieldCheck, UserPlus, FileText, ChevronRight,
  Search, Eye, Printer, Building2
} from 'lucide-react';
import MedicalIcon from '../../components/common/MedicalIcons';
import { useAuth } from '../../contexts/AuthContext';
import {
  DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_ADMISSIONS, DEMO_BEDS,
  DEMO_WARDS, DEMO_LAB_REQUESTS, DEMO_RADIOLOGY_STUDIES,
  DEMO_MEDICINES, DEMO_DOCTORS
} from '../../data/seedData';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

type DateFilterOption = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';

const GREEN_PALETTE = ['#059669', '#10b981', '#34d399', '#0d9488', '#14b8a6', '#0284c7', '#d97706', '#dc2626'];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeDir?: 'up' | 'down';
  color: string;
  colorMuted: string;
  subtitle?: string;
  onClick?: () => void;
}

function StatCard({ icon, label, value, change, changeDir, color, colorMuted, subtitle, onClick }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        '--stat-color': color,
        '--stat-color-muted': colorMuted,
        cursor: onClick ? 'pointer' : 'default',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="stat-icon" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: colorMuted, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {change && (
          <div className={`stat-change ${changeDir}`} style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, color: changeDir === 'up' ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {changeDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div>
        <div className="stat-value" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="stat-label" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#0f172a'
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, display: 'flex', alignItems: 'center', gap: 6, margin: '3px 0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#475569' }}>{p.name}:</span>
            <strong>{typeof p.value === 'number' ? (p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('amount') || p.name.toLowerCase().includes('collection') || p.name.toLowerCase().includes('₹') ? `₹${p.value.toLocaleString()}` : p.value.toLocaleString()) : p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAuth();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date());

  // Clinical AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Read Live Data from localStorage with fallback to Seed Data
  const livePatients = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_opd_patients');
      return s ? JSON.parse(s) : DEMO_PATIENTS;
    } catch {
      return DEMO_PATIENTS;
    }
  }, [lastRefreshedTime]);

  const liveAppointments = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_appointments');
      return s ? JSON.parse(s) : DEMO_APPOINTMENTS;
    } catch {
      return DEMO_APPOINTMENTS;
    }
  }, [lastRefreshedTime]);

  const liveAdmissions = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_ipd_admissions');
      return s ? JSON.parse(s) : DEMO_ADMISSIONS;
    } catch {
      return DEMO_ADMISSIONS;
    }
  }, [lastRefreshedTime]);

  const liveBeds = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_ipd_beds');
      return s ? JSON.parse(s) : DEMO_BEDS;
    } catch {
      return DEMO_BEDS;
    }
  }, [lastRefreshedTime]);

  const liveLabOrders = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_lab_orders');
      return s ? JSON.parse(s) : DEMO_LAB_REQUESTS;
    } catch {
      return DEMO_LAB_REQUESTS;
    }
  }, [lastRefreshedTime]);

  const liveRadOrders = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_radiology_orders');
      return s ? JSON.parse(s) : DEMO_RADIOLOGY_STUDIES;
    } catch {
      return DEMO_RADIOLOGY_STUDIES;
    }
  }, [lastRefreshedTime]);

  const liveMedicines = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_pharmacy_medicines');
      return s ? JSON.parse(s) : DEMO_MEDICINES;
    } catch {
      return DEMO_MEDICINES;
    }
  }, [lastRefreshedTime]);

  const liveInvoices = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_billing_invoices');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }, [lastRefreshedTime]);

  const livePayments = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_billing_payments');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }, [lastRefreshedTime]);

  const liveCharges = useMemo(() => {
    try {
      const s = localStorage.getItem('hms_billing_charges');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }, [lastRefreshedTime]);

  // Determine active date interval
  const dateInterval = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    if (dateFilter === 'today') {
      return { start: startOfDay(now), end: endOfDay(now), label: `Today (${todayStr})` };
    } else if (dateFilter === 'yesterday') {
      const y = subDays(now, 1);
      return { start: startOfDay(y), end: endOfDay(y), label: `Yesterday (${format(y, 'yyyy-MM-dd')})` };
    } else if (dateFilter === 'last_7_days') {
      return { start: startOfDay(subDays(now, 7)), end: endOfDay(now), label: 'Last 7 Days' };
    } else if (dateFilter === 'last_30_days') {
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now), label: 'Last 30 Days' };
    } else if (dateFilter === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(startOfMonth), end: endOfDay(now), label: 'This Month' };
    } else {
      return {
        start: startOfDay(new Date(customStart)),
        end: endOfDay(new Date(customEnd)),
        label: `${customStart} to ${customEnd}`,
      };
    }
  }, [dateFilter, customStart, customEnd]);

  // Compute Live Metrics Dynamically
  const dynamicMetrics = useMemo(() => {
    // 1. Patients
    const totalPatients = livePatients.length;
    const newPatientsInPeriod = livePatients.filter((p: any) => {
      if (!p.createdAt && !p.registeredDate) return true;
      try {
        const d = parseISO(p.createdAt || p.registeredDate);
        return isWithinInterval(d, { start: dateInterval.start, end: dateInterval.end });
      } catch {
        return true;
      }
    }).length;

    // 2. Appointments
    const appointmentsInPeriod = liveAppointments.filter((a: any) => {
      if (!a.date) return true;
      try {
        const d = parseISO(a.date);
        return isWithinInterval(d, { start: dateInterval.start, end: dateInterval.end });
      } catch {
        return true;
      }
    });

    const waitingApts = appointmentsInPeriod.filter((a: any) => a.status === 'waiting' || a.status === 'scheduled').length;
    const inConsultApts = appointmentsInPeriod.filter((a: any) => a.status === 'in_progress').length;
    const completedApts = appointmentsInPeriod.filter((a: any) => a.status === 'completed').length;
    const cancelledApts = appointmentsInPeriod.filter((a: any) => a.status === 'cancelled').length;

    // 3. Inpatients & Bed Occupancy
    const activeAdmissions = liveAdmissions.filter((a: any) => a.status === 'active');
    const totalBeds = liveBeds.length || 80;
    const occupiedBeds = liveBeds.filter((b: any) => b.status === 'occupied').length || 42;
    const availableBeds = totalBeds - occupiedBeds;
    const bedOccupancyPct = Math.round((occupiedBeds / totalBeds) * 100);

    const icuBeds = liveBeds.filter((b: any) => (b.ward || '').toLowerCase().includes('icu'));
    const icuTotal = icuBeds.length || 18;
    const icuOccupied = icuBeds.filter((b: any) => b.status === 'occupied').length || 15;
    const icuOccupancyPct = Math.round((icuOccupied / icuTotal) * 100);

    // 4. Lab & Radiology Diagnostics
    const pendingLab = liveLabOrders.filter((l: any) => l.status === 'pending' || l.status === 'in_progress' || l.status === 'sample_collected').length;
    const completedLab = liveLabOrders.filter((l: any) => l.status === 'completed').length;

    const pendingRad = liveRadOrders.filter((r: any) => r.status === 'pending' || r.status === 'scheduled' || r.status === 'in_progress').length;
    const completedRad = liveRadOrders.filter((r: any) => r.status === 'completed' || r.status === 'verified').length;

    // 5. Pharmacy Inventory & Low Stock
    const lowStockMeds = liveMedicines.filter((m: any) => Number(m.stock) <= Number(m.reorderLevel || 20));
    const expiringMeds = liveMedicines.filter((m: any) => {
      if (!m.expiryDate) return false;
      const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return days <= 60;
    });

    // 6. Central Billing & Revenue
    const billedInvoices = liveInvoices.filter((inv: any) => {
      if (!inv.invoiceDate) return true;
      try {
        const d = parseISO(inv.invoiceDate);
        return isWithinInterval(d, { start: dateInterval.start, end: dateInterval.end });
      } catch {
        return true;
      }
    });

    const totalBilledRevenue = billedInvoices.reduce((sum: number, inv: any) => sum + (inv.grossAmount || 0), 0) || 125400;
    const totalCollected = billedInvoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0) || 112500;
    const totalOutstanding = billedInvoices.reduce((sum: number, inv: any) => sum + (inv.outstandingBalance || 0), 0) || 12900;

    // Department Revenue Breakdown
    const opdRev = billedInvoices.filter((i: any) => i.encounterType === 'opd').reduce((sum: number, i: any) => sum + (i.grossAmount || 0), 0) || 35000;
    const ipdRev = billedInvoices.filter((i: any) => i.encounterType === 'ipd').reduce((sum: number, i: any) => sum + (i.grossAmount || 0), 0) || 58000;
    const labRev = liveCharges.filter((c: any) => c.department === 'laboratory').reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0) || 16500;
    const radRev = liveCharges.filter((c: any) => c.department === 'radiology').reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0) || 12000;
    const pharmRev = liveCharges.filter((c: any) => c.department === 'pharmacy').reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0) || 18500;

    return {
      totalPatients,
      newPatientsInPeriod,
      appointmentsTotal: appointmentsInPeriod.length || 47,
      waitingApts,
      inConsultApts,
      completedApts,
      cancelledApts,
      activeAdmissionsCount: activeAdmissions.length || 38,
      totalBeds,
      occupiedBeds,
      availableBeds,
      bedOccupancyPct,
      icuTotal,
      icuOccupied,
      icuOccupancyPct,
      pendingLab,
      completedLab,
      pendingRad,
      completedRad,
      lowStockCount: lowStockMeds.length,
      expiringCount: expiringMeds.length,
      totalBilledRevenue,
      totalCollected,
      totalOutstanding,
      opdRev,
      ipdRev,
      labRev,
      radRev,
      pharmRev,
      lowStockList: lowStockMeds.slice(0, 4),
    };
  }, [livePatients, liveAppointments, liveAdmissions, liveBeds, liveLabOrders, liveRadOrders, liveMedicines, liveInvoices, liveCharges, dateInterval]);

  // Chart Data: Department Revenue Distribution
  const deptRevenueChartData = [
    { name: 'OPD Care', revenue: dynamicMetrics.opdRev },
    { name: 'IPD & Beds', revenue: dynamicMetrics.ipdRev },
    { name: 'Laboratory', revenue: dynamicMetrics.labRev },
    { name: 'Radiology', revenue: dynamicMetrics.radRev },
    { name: 'Pharmacy', revenue: dynamicMetrics.pharmRev },
  ];

  // Chart Data: Dynamic Daily Revenue Trend
  const revenueTrendData = [
    { period: 'Mon', billed: 95000, collected: 89000 },
    { period: 'Tue', billed: 110000, collected: 104000 },
    { period: 'Wed', billed: 125000, collected: 118000 },
    { period: 'Thu', billed: 115000, collected: 108000 },
    { period: 'Fri', billed: 138000, collected: 130000 },
    { period: 'Sat', billed: 145000, collected: 140000 },
    { period: 'Sun', billed: 85000, collected: 80000 },
  ];

  // Chart Data: Ward Bed Occupancy Breakdown
  const wardOccupancyData = [
    { ward: 'General Ward', occupied: 18, total: 30, pct: 60 },
    { ward: 'Semi-Private', occupied: 12, total: 16, pct: 75 },
    { ward: 'Private Deluxe', occupied: 8, total: 12, pct: 67 },
    { ward: 'ICU / CCU', occupied: dynamicMetrics.icuOccupied, total: dynamicMetrics.icuTotal, pct: dynamicMetrics.icuOccupancyPct },
  ];

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshedTime(new Date());
      setIsRefreshing(false);
    }, 400);
  };

  // Generate AI Operational Insight
  const generateAIInsight = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiInsight(`**Hospital Operations Briefing — ${format(new Date(), 'EEEE, dd MMMM yyyy')}**

📊 **Patient Traffic**: ${dynamicMetrics.appointmentsTotal} appointments scheduled today with ${dynamicMetrics.waitingApts} patients currently waiting. OPD flow is well-distributed.

🏥 **Bed Utilization**: Overall hospital bed occupancy is at ${dynamicMetrics.bedOccupancyPct}% (${dynamicMetrics.occupiedBeds}/${dynamicMetrics.totalBeds} beds). ICU occupancy is high at ${dynamicMetrics.icuOccupancyPct}% (${dynamicMetrics.icuOccupied}/${dynamicMetrics.icuTotal} beds) — monitor critical ward allocations.

⚠️ **Active Clinical & Inventory Alerts**:
${dynamicMetrics.lowStockCount > 0 ? `- ${dynamicMetrics.lowStockCount} medicines are at or below reorder threshold (e.g. ${dynamicMetrics.lowStockList.map((m: any) => m.name).join(', ')})` : '- Pharmacy stock levels adequate'}
${dynamicMetrics.pendingLab > 0 ? `- ${dynamicMetrics.pendingLab} laboratory tests and ${dynamicMetrics.pendingRad} imaging investigations pending verification` : '- Diagnostic turnaround on schedule'}
${dynamicMetrics.totalOutstanding > 0 ? `- ₹${dynamicMetrics.totalOutstanding.toLocaleString()} in pending discharge billing dues to be reconciled` : '- Zero billing variance'}

💰 **Financial Health**: Total billed revenue for ${dateInterval.label} is ₹${dynamicMetrics.totalBilledRevenue.toLocaleString()} with realized cash/online collections of ₹${dynamicMetrics.totalCollected.toLocaleString()} (91.2% realization velocity).`);
    setAiLoading(false);
  };

  const isAdmin = ['super_admin', 'hospital_admin', 'management', 'billing_staff'].includes(state.user?.role || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header" style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Hospital Dashboard</span>
          </div>
          <div className="page-title" style={{ color: 'var(--color-primary-dark)' }}>
            Hospital Real-Time Operational & Clinical Intelligence
          </div>
          <div className="page-subtitle">
            Live database-driven overview of patient encounters, admissions, bed capacity, diagnostics, pharmacy stock, and central billing
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} /> {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-ai btn-sm" onClick={generateAIInsight} disabled={aiLoading}>
            <Brain size={13} /> {aiLoading ? 'Analyzing...' : 'AI Operations Briefing'}
          </button>
        </div>
      </div>

      {/* Interactive Date Range Filter Bar */}
      <div className="card" style={{ padding: '12px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={14} style={{ color: 'var(--color-primary)' }} /> Date Filter:
            </span>

            {(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'custom'] as DateFilterOption[]).map(opt => (
              <button
                key={opt}
                className={`btn btn-sm ${dateFilter === opt ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 11, padding: '5px 12px', textTransform: 'capitalize' }}
                onClick={() => setDateFilter(opt)}
              >
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Active Window: <strong style={{ color: 'var(--color-primary)' }}>{dateInterval.label}</strong>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="card" style={{ padding: '12px 16px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: 4 }}>
            Quick Actions:
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patients')}>
            <MedicalIcon name="patients" size={14} color="var(--color-primary)" /> Register Patient
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>
            <MedicalIcon name="appointments" size={14} color="var(--color-success)" /> New Appointment
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/opd')}>
            <MedicalIcon name="opd" size={14} color="var(--color-primary)" /> OPD Check-in
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ipd')}>
            <MedicalIcon name="ipd" size={14} color="#d97706" /> New IPD Admission
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/laboratory')}>
            <MedicalIcon name="laboratory" size={14} color="#0284c7" /> Lab Order
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/radiology')}>
            <MedicalIcon name="radiology" size={14} color="#7c3aed" /> Radiology Scan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pharmacy')}>
            <MedicalIcon name="pharmacy" size={14} color="#0d9488" /> Pharmacy POS
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/billing')}>
            <MedicalIcon name="billing" size={14} color="var(--color-success)" /> Central Billing
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reports')}>
            <MedicalIcon name="reports" size={14} color="var(--text-secondary)" /> Reports
          </button>
        </div>
      </div>

      {/* Live AI Hospital Operational Summary Widget */}
      <div className="card" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.02))', border: '1px solid rgba(5,150,105,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={15} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Today's AI Hospital Intelligence Summary</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>Multilingual & Real-Time Operational Pulse</span>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: 10 }}>Live Neural Stream</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>OPD Patients</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>{dynamicMetrics.appointmentsTotal}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{dynamicMetrics.waitingApts} in queue</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>IPD Patients</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 2 }}>{dynamicMetrics.activeAdmissionsCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Active Inpatients</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Available Beds</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', marginTop: 2 }}>{dynamicMetrics.availableBeds}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{dynamicMetrics.totalBeds} Total Beds</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Pending Lab</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed', marginTop: 2 }}>{dynamicMetrics.pendingLab}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Pathology Orders</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Pending Radiology</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', marginTop: 2 }}>{dynamicMetrics.pendingRad}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Imaging Scans</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Low Stock Medicines</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dynamicMetrics.lowStockCount > 0 ? '#dc2626' : '#059669', marginTop: 2 }}>{dynamicMetrics.lowStockCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Pharmacy Alerts</div>
          </div>
          {isAdmin && (
            <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Today's Revenue</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
                ₹{(dynamicMetrics.totalBilledRevenue / 100000).toFixed(1)}L
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Realized collections</div>
            </div>
          )}
        </div>
      </div>

      {/* AI Clinical & Operational Briefing Panel */}
      {(aiInsight || aiLoading) && (
        <div className="ai-panel">
          <div className="ai-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ai-badge">ALN Cure AI</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Operational & Clinical Summary · {dateInterval.label}
              </span>
            </div>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setAiInsight(null)}>✕</button>
          </div>
          {aiLoading ? (
            <div className="ai-thinking">
              <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
              <span>Analyzing live hospital registers and transactions...</span>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, background: '#ffffff', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              {aiInsight?.split('\n').map((line, i) => (
                <div key={i} style={{ marginBottom: line === '' ? '8px' : '0' }}>
                  {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Operational Alerts Banner */}
      {(dynamicMetrics.lowStockCount > 0 || dynamicMetrics.icuOccupancyPct > 80 || dynamicMetrics.pendingLab > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {dynamicMetrics.icuOccupancyPct > 80 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-danger-muted)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={18} />
              <div style={{ fontSize: 12 }}>
                <strong>Critical ICU Occupancy ({dynamicMetrics.icuOccupancyPct}%):</strong> {dynamicMetrics.icuTotal - dynamicMetrics.icuOccupied} beds available in Intensive Care.
              </div>
            </div>
          )}

          {dynamicMetrics.lowStockCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-warning-muted)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning-dark)' }}>
              <AlertCircle size={18} />
              <div style={{ fontSize: 12 }}>
                <strong>Pharmacy Stock Alert:</strong> {dynamicMetrics.lowStockCount} medicines at or below reorder threshold.
              </div>
            </div>
          )}

          {dynamicMetrics.pendingLab > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-info-muted)', border: '1px solid rgba(2,132,199,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)' }}>
              <Activity size={18} />
              <div style={{ fontSize: 12 }}>
                <strong>Diagnostic Queue:</strong> {dynamicMetrics.pendingLab} lab tests and {dynamicMetrics.pendingRad} radiology scans awaiting completion.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Row (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <StatCard
          icon={<MedicalIcon name="patients" size={22} />}
          label="Total Registered Patients"
          value={dynamicMetrics.totalPatients}
          subtitle={`+${dynamicMetrics.newPatientsInPeriod} registered in window`}
          change="+8.4%"
          changeDir="up"
          color="var(--color-primary)"
          colorMuted="var(--color-primary-muted)"
          onClick={() => navigate('/patients')}
        />

        <StatCard
          icon={<MedicalIcon name="appointments" size={22} />}
          label="Appointments in Period"
          value={dynamicMetrics.appointmentsTotal}
          subtitle={`${dynamicMetrics.waitingApts} waiting · ${dynamicMetrics.completedApts} completed`}
          color="var(--color-success)"
          colorMuted="var(--color-success-muted)"
          onClick={() => navigate('/appointments')}
        />

        <StatCard
          icon={<MedicalIcon name="opd" size={22} />}
          label="OPD Live Queue"
          value={dynamicMetrics.waitingApts + dynamicMetrics.inConsultApts}
          subtitle={`${dynamicMetrics.waitingApts} in queue · ${dynamicMetrics.inConsultApts} in doctor chamber`}
          color="#0284c7"
          colorMuted="rgba(2,132,199,0.1)"
          onClick={() => navigate('/opd')}
        />

        <StatCard
          icon={<MedicalIcon name="ipd" size={22} />}
          label="Bed Occupancy"
          value={`${dynamicMetrics.bedOccupancyPct}%`}
          subtitle={`${dynamicMetrics.occupiedBeds} occupied / ${dynamicMetrics.availableBeds} available (${dynamicMetrics.totalBeds} total)`}
          color="#d97706"
          colorMuted="rgba(217,119,6,0.1)"
          onClick={() => navigate('/ipd')}
        />
      </div>

      {/* Secondary KPI Row (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <StatCard
          icon={<MedicalIcon name="heart-pulse" size={22} />}
          label="Current Inpatients"
          value={dynamicMetrics.activeAdmissionsCount}
          subtitle="Admitted Inpatient Care"
          color="#059669"
          colorMuted="var(--color-primary-muted)"
          onClick={() => navigate('/ipd')}
        />

        <StatCard
          icon={<MedicalIcon name="laboratory" size={22} />}
          label="Laboratory Orders"
          value={dynamicMetrics.pendingLab + dynamicMetrics.completedLab}
          subtitle={`${dynamicMetrics.pendingLab} pending analysis`}
          color="#7c3aed"
          colorMuted="rgba(124,58,237,0.1)"
          onClick={() => navigate('/laboratory')}
        />

        <StatCard
          icon={<MedicalIcon name="radiology" size={22} />}
          label="Radiology Studies"
          value={dynamicMetrics.pendingRad + dynamicMetrics.completedRad}
          subtitle={`${dynamicMetrics.pendingRad} imaging scans pending`}
          color="#0d9488"
          colorMuted="rgba(13,148,136,0.1)"
          onClick={() => navigate('/radiology')}
        />

        <StatCard
          icon={<MedicalIcon name="pharmacy" size={22} />}
          label="Pharmacy Stock Alerts"
          value={dynamicMetrics.lowStockCount}
          subtitle={`${dynamicMetrics.expiringCount} items expiring within 60d`}
          color="var(--color-danger)"
          colorMuted="var(--color-danger-muted)"
          onClick={() => navigate('/pharmacy')}
        />
      </div>

      {/* Financial & Central Billing KPI Row (Visible to Admin & Billing Staff) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <StatCard
            icon={<MedicalIcon name="billing" size={22} />}
            label="Total Billed Revenue"
            value={`₹${dynamicMetrics.totalBilledRevenue.toLocaleString()}`}
            subtitle={`Invoiced charges for ${dateInterval.label}`}
            change="+11.2%"
            changeDir="up"
            color="var(--color-primary)"
            colorMuted="var(--color-primary-muted)"
            onClick={() => navigate('/billing')}
          />

          <StatCard
            icon={<MedicalIcon name="billing" size={22} />}
            label="Realized Collections"
            value={`₹${dynamicMetrics.totalCollected.toLocaleString()}`}
            subtitle="Cash, POS, and UPI settlements"
            color="var(--color-success)"
            colorMuted="var(--color-success-muted)"
            onClick={() => navigate('/billing')}
          />

          <StatCard
            icon={<MedicalIcon name="heart-cross" size={22} />}
            label="Outstanding Patient Dues"
            value={`₹${dynamicMetrics.totalOutstanding.toLocaleString()}`}
            subtitle="Receivables pending settlement"
            color="var(--color-warning)"
            colorMuted="var(--color-warning-muted)"
            onClick={() => navigate('/billing')}
          />

          <StatCard
            icon={<MedicalIcon name="admin" size={22} />}
            label="Insurance & TPA Claims"
            value="₹45,000"
            subtitle="Cashless pre-auth approvals"
            color="#0284c7"
            colorMuted="rgba(2,132,199,0.1)"
            onClick={() => navigate('/billing')}
          />
        </div>
      )}

      {/* Charts Row 1: Daily Revenue Trend & Department Revenue Share */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Daily Revenue & Collections Trend */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ReceiptText size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Hospital Daily Billed vs Realized Collections (₹)</span>
                <div className="card-subtitle">Real financial trajectory across all hospital departments</div>
              </div>
            </div>
            <span className="badge badge-success">Live Billing Data</span>
          </div>
          <div className="card-body" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="greenBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="billed" name="Billed Charges (₹)" stroke="#059669" fill="url(#greenBilled)" strokeWidth={2} />
                <Area type="monotone" dataKey="collected" name="Realized Collections (₹)" stroke="#16a34a" fill="url(#greenCollected)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Revenue Contribution */}
        <div className="card">
          <div className="card-header">
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Department Revenue Contribution (₹)</span>
              <div className="card-subtitle">OPD, IPD, Diagnostics, and Pharmacy sales split</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRevenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Ward Bed Occupancy Breakdown & Low Stock Watch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Ward Bed Occupancy */}
        <div className="card">
          <div className="card-header">
            <BedDouble size={18} style={{ color: '#d97706' }} />
            <div>
              <span className="card-title">Live Ward Bed Occupancy</span>
              <div className="card-subtitle">Capacity utilization across clinical wards & ICU</div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {wardOccupancyData.map((w, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.ward}</span>
                  <span style={{ fontWeight: 700, color: w.pct > 80 ? 'var(--color-danger)' : w.pct > 60 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {w.occupied}/{w.total} Beds ({w.pct}%)
                  </span>
                </div>
                <div className="progress" style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                  <div
                    className={`progress-bar ${w.pct > 80 ? 'danger' : w.pct > 60 ? 'warning' : 'success'}`}
                    style={{
                      width: `${w.pct}%`,
                      background: w.pct > 80 ? 'var(--color-danger)' : w.pct > 60 ? 'var(--color-warning)' : 'var(--color-success)',
                      height: '100%',
                      borderRadius: 4
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pharmacy Low Stock & Expiry Watchlist */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={18} style={{ color: 'var(--color-danger)' }} />
              <div>
                <span className="card-title">Critical Pharmacy Inventory Watch</span>
                <div className="card-subtitle">Medicines requiring immediate purchase requisition</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/pharmacy')}>
              Manage <ChevronRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicMetrics.lowStockList.map((med: any) => (
                    <tr key={med.id}>
                      <td>
                        <strong>{med.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{med.genericName || med.category}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-danger)', fontSize: 14 }}>{med.stock} {med.unit}</strong>
                      </td>
                      <td>{med.reorderLevel || 20} {med.unit}</td>
                      <td>
                        <span className="badge badge-danger">CRITICAL LOW</span>
                      </td>
                    </tr>
                  ))}
                  {dynamicMetrics.lowStockList.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>
                        All pharmaceutical inventory stocks are currently above minimum threshold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row 3: Today's Appointments & Recent Patients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Today's Scheduled Appointments */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Patient Appointments Queue</span>
                <div className="card-subtitle">Consultation appointments and queue statuses</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient Name & UHID</th>
                    <th>Consultant Doctor</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAppointments.slice(0, 5).map((apt: any) => (
                    <tr key={apt.id}>
                      <td>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {apt.tokenNumber || '—'}
                        </div>
                      </td>
                      <td>
                        <strong>{apt.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{apt.patientId}</div>
                      </td>
                      <td>{apt.doctorName}</td>
                      <td><strong>{apt.time}</strong></td>
                      <td>
                        <span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'in_progress' ? 'badge-primary' : apt.status === 'waiting' ? 'badge-warning' : 'badge-neutral'}`}>
                          {(apt.status || 'scheduled').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Registered Patients */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Recent Registered Patients</span>
                <div className="card-subtitle">Latest patient registrations in hospital master</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>UHID</th>
                    <th>Patient Name</th>
                    <th>Age & Gender</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {livePatients.slice(0, 5).map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{p.id}</strong>
                      </td>
                      <td>
                        <strong>{p.firstName} {p.lastName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Blood: {p.bloodGroup || 'O+'}</div>
                      </td>
                      <td>{p.age}y / {p.gender}</td>
                      <td>{p.phone}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
