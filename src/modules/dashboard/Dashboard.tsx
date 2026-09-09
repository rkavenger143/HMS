import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarCheck, BedDouble, Stethoscope, HeartPulse,
  Clock, AlertTriangle, Activity, ArrowUpRight, TrendingUp,
  TrendingDown, Plus, Search, RefreshCw, Filter, CheckCircle2,
  AlertCircle, ShieldAlert, Sparkles, Building2, UserPlus,
  FileText, Calendar, ArrowRight, Siren, CheckCheck, ChevronRight,
  Printer, BarChart3, FlaskConical, Pill, Check, X, Shield,
  Layers, ChevronDown, CheckCircle, Share2, Download, Bot, Brain, ShieldCheck, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { storageService, HospitalActivity, CriticalAlert } from '../../services/storageService';
import { format } from 'date-fns';

interface OverviewStatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  trend?: { text: string; positive: boolean };
  badge?: string;
  colorTheme: 'blue' | 'indigo' | 'emerald' | 'amber' | 'teal' | 'rose';
  onClick?: () => void;
}

function OverviewStatCard({
  title,
  value,
  subtext,
  icon,
  trend,
  badge,
  colorTheme,
  onClick,
}: OverviewStatCardProps) {
  const themeStyles = {
    blue: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#eff6ff',
      iconColor: '#1e40af',
    },
    indigo: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#eef2ff',
      iconColor: '#4338ca',
    },
    emerald: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#ecfdf5',
      iconColor: '#059669',
    },
    amber: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#fffbeb',
      iconColor: '#d97706',
    },
    teal: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#f0fdfa',
      iconColor: '#0f766e',
    },
    rose: {
      bg: '#ffffff',
      border: '#e2e8f0',
      iconBg: '#fff1f2',
      iconColor: '#e11d48',
    },
  }[colorTheme];

  return (
    <div
      className="card stat-hover"
      style={{
        padding: '20px 22px',
        background: themeStyles.bg,
        border: `1px solid ${themeStyles.border}`,
        borderRadius: '14px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '11px',
            background: themeStyles.iconBg,
            color: themeStyles.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        {badge ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              background: themeStyles.iconBg,
              color: themeStyles.iconColor,
              border: `1px solid ${themeStyles.border}`,
            }}
          >
            {badge}
          </span>
        ) : trend ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              color: trend.positive ? '#059669' : '#d97706',
              background: trend.positive ? '#ecfdf5' : '#fffbeb',
              padding: '2px 7px',
              borderRadius: '999px',
            }}
          >
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.text}
          </span>
        ) : null}
      </div>

      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.6px', lineHeight: 1.1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155', marginTop: 5 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: 3 }}>
          {subtext}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState(() => storageService.getDashboardMetrics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Quick Action Modal States
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [showQuickAptModal, setShowQuickAptModal] = useState(false);
  const [showQuickAdmitModal, setShowQuickAdmitModal] = useState(false);
  const [showQuickAssignBedModal, setShowQuickAssignBedModal] = useState(false);
  const [showQuickDiagModal, setShowQuickDiagModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form states
  const [patientForm, setPatientForm] = useState({ firstName: '', lastName: '', gender: 'male', phone: '', bloodGroup: 'B+' });
  const [aptForm, setAptForm] = useState({ patientName: '', doctorId: 'doc-001', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', type: 'opd' });
  const [admitForm, setAdmitForm] = useState({ patientName: '', ward: 'General Ward A', bedNumber: 'W-A-03', doctorId: 'doc-001', admissionType: 'elective' });
  const [bedAssignForm, setBedAssignForm] = useState({ patientName: '', bedNumber: 'W-A-04', ward: 'General Ward A' });
  const [diagForm, setDiagForm] = useState({ patientName: '', testName: 'Complete Blood Count (CBC)', doctorName: 'Dr. Rajesh Kumar', priority: 'routine' });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Storage updates listener
  useEffect(() => {
    const handleStorageUpdate = () => {
      setMetrics(storageService.getDashboardMetrics());
    };
    window.addEventListener('hms_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleStorageUpdate);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(storageService.getDashboardMetrics());
      setIsRefreshing(false);
      showToast('Hospital operational data synchronized in real-time', 'success');
    }, 350);
  };

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handlers
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.firstName || !patientForm.phone) {
      showToast('Please fill in patient name and mobile number', 'warning');
      return;
    }
    const created = storageService.addPatient({
      firstName: patientForm.firstName,
      lastName: patientForm.lastName,
      gender: patientForm.gender as any,
      phone: patientForm.phone,
      bloodGroup: patientForm.bloodGroup as any,
    });
    showToast(`Patient ${created.firstName} registered successfully (MRN: ${created.id})`, 'success');
    setShowQuickPatientModal(false);
    setPatientForm({ firstName: '', lastName: '', gender: 'male', phone: '', bloodGroup: 'B+' });
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptForm.patientName) {
      showToast('Please enter patient name', 'warning');
      return;
    }
    const doctors = storageService.getDoctors();
    const doc = doctors.find(d => d.id === aptForm.doctorId) || doctors[0];

    const created = storageService.addAppointment({
      patientName: aptForm.patientName,
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department,
      date: aptForm.date,
      time: aptForm.time,
      type: aptForm.type as any,
      consultationFee: doc.consultationFee,
      status: 'scheduled',
    });
    showToast(`Appointment booked for ${created.patientName} (Token #${created.tokenNumber})`, 'success');
    setShowQuickAptModal(false);
    setAptForm({ patientName: '', doctorId: 'doc-001', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', type: 'opd' });
  };

  const handleSaveAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitForm.patientName || !admitForm.bedNumber) {
      showToast('Please specify patient name and bed allocation', 'warning');
      return;
    }
    const doctors = storageService.getDoctors();
    const doc = doctors.find(d => d.id === admitForm.doctorId) || doctors[0];

    const created = storageService.addAdmission({
      patientName: admitForm.patientName,
      ward: admitForm.ward,
      bedNumber: admitForm.bedNumber,
      admittingDoctorId: doc.id,
      admittingDoctorName: doc.name,
      priority: (admitForm.admissionType === 'emergency' ? 'emergency' : 'routine') as any,
    });
    showToast(`Inpatient ${created.patientName} admitted to Bed ${created.bedNumber}`, 'success');
    setShowQuickAdmitModal(false);
    setAdmitForm({ patientName: '', ward: 'General Ward A', bedNumber: 'W-A-03', doctorId: 'doc-001', admissionType: 'elective' });
  };

  const handleSaveBedAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedAssignForm.patientName || !bedAssignForm.bedNumber) {
      showToast('Please specify patient name and bed number', 'warning');
      return;
    }
    storageService.assignBed(bedAssignForm.bedNumber, bedAssignForm.patientName, undefined, bedAssignForm.ward);
    showToast(`Bed ${bedAssignForm.bedNumber} assigned to ${bedAssignForm.patientName}`, 'success');
    setShowQuickAssignBedModal(false);
    setBedAssignForm({ patientName: '', bedNumber: 'W-A-04', ward: 'General Ward A' });
  };

  const handleSaveDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagForm.patientName) {
      showToast('Please enter patient name', 'warning');
      return;
    }
    const created = storageService.addLabRequest({
      patientName: diagForm.patientName,
      doctorName: diagForm.doctorName,
      tests: [{ testId: 't-1', testName: diagForm.testName, status: 'ordered', sampleType: 'Blood', price: 500 }],
      priority: diagForm.priority as any,
    });
    showToast(`Diagnostic investigation order ${created.id} initiated`, 'success');
    setShowQuickDiagModal(false);
    setDiagForm({ patientName: '', testName: 'Complete Blood Count (CBC)', doctorName: 'Dr. Rajesh Kumar', priority: 'routine' });
  };

  const doctors = useMemo(() => storageService.getDoctors(), [metrics]);
  const availableBedsList = useMemo(() => storageService.getBeds().filter(b => b.status === 'available'), [metrics]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 28 }}>
      {/* ============================================================
          1. PREMIUM TOP HEADER
          ============================================================ */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 55%, #2563eb 100%)',
          borderRadius: '16px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                ✦ ALN Cure Multi-Specialty Hospital
              </span>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>• NABH Accredited Facility</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '11px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  color: '#a7f3d0',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                24x7 Emergency Active
              </span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: '#ffffff' }}>
              {getGreeting()}, {state.user?.name || 'Admin'} 👋
            </h1>
            <p style={{ fontSize: '13.5px', opacity: 0.9, marginTop: 4, maxWidth: 640, lineHeight: 1.5 }}>
              Here's what's happening at your hospital today: <strong>{metrics.ipdPatients}</strong> admitted inpatients, <strong>{metrics.availableBeds}</strong> beds available, and <strong>{metrics.doctorsOnDuty}</strong> physicians on active duty.
            </p>
          </div>

          {/* Right Header Controls: Live Date & Clock + Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '10px 16px',
                borderRadius: '12px',
                textAlign: 'right',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div style={{ fontSize: '14.5px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff' }}>
                {format(currentDateTime, 'hh:mm:ss a')}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: 2 }}>
                {format(currentDateTime, 'EEEE, dd MMMM yyyy')}
              </div>
            </div>

            <button
              className="btn btn-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                background: '#ffffff',
                color: '#1e40af',
                fontWeight: 700,
                border: 'none',
                height: 42,
                padding: '0 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. CRITICAL ALERTS (High-Visibility Priority Triage)
          ============================================================ */}
      {metrics.alerts.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '14px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Siren size={16} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                  Critical Priority Hospital Alerts ({metrics.alerts.length})
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 8 }}>
                  Requires prompt medical officer or supervisor attention
                </span>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/notifications')}
              style={{ height: 30, fontSize: '11px' }}
            >
              View All Alerts ({metrics.alerts.length}) →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 10 }}>
            {metrics.alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fee2e2',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{alert.title}</span>
                    <span className="badge badge-danger" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: 3 }}>{alert.description}</div>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px', flexShrink: 0 }}
                  onClick={() => {
                    storageService.acknowledgeAlert(alert.id);
                    setMetrics(storageService.getDashboardMetrics());
                    showToast('Alert acknowledged', 'success');
                  }}
                >
                  <Check size={12} /> Ack
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          2.5 AI OPERATIONAL INSIGHTS & CLINICAL DECISION SUPPORT HUB
          ============================================================ */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(147, 51, 234, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* AI Hub Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Bot size={22} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.2px', color: '#ffffff' }}>
                  AI Operational Intelligence & Decision Support
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  Live HMS Telemetry Active
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 2 }}>
                Real-time operational anomaly detection, clinical workload balancing, and bed-turnover optimization
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              id="dash-open-ai-btn"
              className="btn btn-sm"
              onClick={() => navigate('/ai-assistant')}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Sparkles size={14} /> Open AI Assistant Console <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* AI Insight Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 16 }}>
          {/* Card 1: Operational Flow */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                <Activity size={16} style={{ color: '#38bdf8' }} /> Clinical & Bed Throughput
              </div>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{metrics.bedOccupancyRate}% Occupancy</span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              <strong>{metrics.opdPatientsToday}</strong> OPD consults active. <strong>{metrics.ipdPatients}</strong> inpatients admitted across {metrics.totalBeds} licensed beds (<strong>{metrics.availableBeds}</strong> beds available).
            </p>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} style={{ color: '#4ade80' }} /> Floor nursing capacity balanced at {metrics.nursesOnDuty} nurses on active shift.
            </div>
          </div>

          {/* Card 2: Diagnostics & Pharmacy Pulse */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                <FlaskConical size={16} style={{ color: '#a78bfa' }} /> Diagnostic & Pharmacy Watch
              </div>
              <span style={{ fontSize: '11px', color: metrics.alerts.length > 0 ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                {metrics.alerts.length} Critical Alerts
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              AI triage monitoring pathology & imaging queues in real-time. Automated panic-value escalation active for biochemistry and hematology.
            </p>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} style={{ color: '#38bdf8' }} /> Drug interaction and allergy checks enabled for all prescriber orders.
            </div>
          </div>

          {/* Card 3: AI Anomaly & Optimization Engine */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                <Zap size={16} style={{ color: '#facc15' }} /> AI Predictive Optimization
              </div>
              <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 600 }}>Operational Pulse: Normal</span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              {metrics.bedOccupancyRate > 80
                ? 'High inpatient census detected. Recommend initiating early discharge clearance in General Ward A to optimize incoming triage.'
                : 'Hospital bed throughput is optimal with adequate surge capacity across ICU and Semi-Special wards.'}
            </p>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Brain size={12} style={{ color: '#facc15' }} /> Multilingual staff query engine online (English, Telugu, Tanglish).
            </div>
          </div>
        </div>

        {/* AI Quick Query Interactive Chips */}
        <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                💡 Instant AI Staff Queries:
              </span>
              {[
                { label: "Summarize today's hospital operations", query: "Summarize today's hospital operations" },
                { label: "Show today's OPD summary", query: "Show today's OPD summary" },
                { label: "Which IPD patients have pending nursing tasks?", query: "Which IPD patients have pending nursing tasks?" },
                { label: "Show pending laboratory reports", query: "Show pending laboratory reports" },
                { label: "Show critical diagnostic results", query: "Show critical diagnostic results" },
                { label: "Which insurance claims are pending?", query: "Which insurance claims are pending?" },
              ].map(chip => (
                <button
                  key={chip.label}
                  className="btn btn-sm"
                  onClick={() => navigate('/ai-assistant', { state: { query: chip.query } })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                >
                  ⚡ {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div
            style={{
              marginTop: 12,
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Shield size={12} style={{ color: '#a5b4fc', flexShrink: 0 }} />
            <span>
              <strong>Clinical Review Notice:</strong> AI-generated information is a clinical and operational decision-support tool. All treatment, prescription, and patient care decisions must be verified and authorized by certified medical professionals.
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. HOSPITAL OVERVIEW CARDS (6 Key Healthcare Metrics)
          ============================================================ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: '#2563eb' }} />
            Hospital Vital Overview
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Live Clinical Telemetry</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {/* 1. Total Patients */}
          <OverviewStatCard
            title="Total Patients"
            value={metrics.totalPatients}
            subtext="Master Patient Index (MPI)"
            icon={<Users size={20} />}
            trend={{ text: '+12% this month', positive: true }}
            colorTheme="blue"
            onClick={() => navigate('/patients')}
          />

          {/* 2. OPD Patients Today */}
          <OverviewStatCard
            title="OPD Patients Today"
            value={metrics.opdPatientsToday}
            subtext="Outpatient Consultations"
            icon={<Stethoscope size={20} />}
            trend={{ text: '+8% vs yesterday', positive: true }}
            colorTheme="teal"
            onClick={() => navigate('/opd')}
          />

          {/* 3. Current IPD Patients */}
          <OverviewStatCard
            title="Current IPD Patients"
            value={metrics.ipdPatients}
            subtext="Active Inpatient Admissions"
            icon={<HeartPulse size={20} />}
            badge="94% Recovery"
            colorTheme="indigo"
            onClick={() => navigate('/ipd')}
          />

          {/* 4. Available Beds */}
          <OverviewStatCard
            title="Available Beds"
            value={metrics.availableBeds}
            subtext={`Out of ${metrics.totalBeds} licensed beds`}
            icon={<BedDouble size={20} />}
            badge={`${metrics.bedOccupancyRate}% Occupied`}
            colorTheme="emerald"
            onClick={() => navigate('/ipd')}
          />

          {/* 5. Doctors On Duty */}
          <OverviewStatCard
            title="Doctors On Duty"
            value={metrics.doctorsOnDuty}
            subtext={`Across 8 clinical departments`}
            icon={<Stethoscope size={20} />}
            badge="On Active Duty"
            colorTheme="blue"
            onClick={() => navigate('/doctors')}
          />

          {/* 6. Nurses On Duty */}
          <OverviewStatCard
            title="Nurses On Duty"
            value={metrics.nursesOnDuty}
            subtext={`Floor & ICU nursing roster`}
            icon={<HeartPulse size={20} />}
            badge="Shift Assigned"
            colorTheme="emerald"
            onClick={() => navigate('/nursing')}
          />
        </div>
      </div>

      {/* ============================================================
          4. QUICK ACTIONS SECTION (Clean Action Bar with 6 Actions)
          ============================================================ */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Quick Clinical Actions:
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* 1. Add New Patient */}
            <button
              id="dash-add-patient-btn"
              className="btn btn-sm btn-primary"
              onClick={() => setShowQuickPatientModal(true)}
            >
              <UserPlus size={14} /> Add New Patient
            </button>

            {/* 2. Book Appointment */}
            <button
              id="dash-book-apt-btn"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowQuickAptModal(true)}
            >
              <CalendarCheck size={14} style={{ color: '#2563eb' }} /> Book Appointment
            </button>

            {/* 3. Admit Patient */}
            <button
              id="dash-admit-patient-btn"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowQuickAdmitModal(true)}
            >
              <BedDouble size={14} style={{ color: '#0d9488' }} /> Admit Patient
            </button>

            {/* 4. Assign Bed */}
            <button
              id="dash-assign-bed-btn"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowQuickAssignBedModal(true)}
            >
              <Layers size={14} style={{ color: '#d97706' }} /> Assign Bed
            </button>

            {/* 5. Diagnostic Request */}
            <button
              id="dash-order-diag-btn"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowQuickDiagModal(true)}
            >
              <FlaskConical size={14} style={{ color: '#7c3aed' }} /> Diagnostic Request
            </button>

            {/* 6. Generate Report */}
            <button
              id="dash-view-reports-btn"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowReportModal(true)}
            >
              <FileText size={14} style={{ color: '#059669' }} /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          5. TODAY'S HOSPITAL ACTIVITY (4 Clean Visual Blocks)
          ============================================================ */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: '#2563eb' }} />
          Today's Hospital Activity
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {/* 1. New Admissions */}
          <div className="card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>New Admissions</span>
              <span className="badge badge-primary" style={{ fontSize: '10px' }}>Inpatient</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: 6 }}>
              {metrics.todayAdmissions}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <ArrowUpRight size={13} /> +2 Emergency admissions
            </div>
          </div>

          {/* 2. Patient Discharges */}
          <div className="card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Patient Discharges</span>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>Completed</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: 6 }}>
              {metrics.todayDischarges}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
              2 Planned for evening discharge
            </div>
          </div>

          {/* 3. OPD Appointments */}
          <div className="card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>OPD Appointments</span>
              <span className="badge badge-warning" style={{ fontSize: '10px' }}>Clinic</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: 6 }}>
              {metrics.opdPatientsToday}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
              24 Completed · 14 In Queue
            </div>
          </div>

          {/* 4. Emergency Cases */}
          <div className="card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Emergency Cases</span>
              <span className="badge badge-danger" style={{ fontSize: '10px' }}>Triage</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#e11d48', marginTop: 6 }}>
              {metrics.emergencyPatients}
            </div>
            <div style={{ fontSize: '12px', color: '#e11d48', marginTop: 4, fontWeight: 600 }}>
              Level 1 & 2 Trauma Triage
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          6. PATIENT FLOW OVERVIEW (Visual Journey Pipeline)
          ============================================================ */}
      <div className="card" style={{ padding: '20px 24px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: '#2563eb' }} />
            <div>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Patient Flow Overview</span>
              <div style={{ fontSize: '12px', color: '#64748b' }}>End-to-end patient journey throughout hospital clinical departments</div>
            </div>
          </div>
          <span className="badge badge-primary">Active Pipeline</span>
        </div>

        {/* Pipeline Step Sequence */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            position: 'relative',
          }}
        >
          {[
            { step: '1', title: 'Registration', count: `${metrics.totalPatients}`, sub: 'Registered Patients', color: '#2563eb', bg: '#eff6ff' },
            { step: '2', title: 'OPD Consultation', count: `${metrics.opdPatientsToday}`, sub: 'Daily Consultations', color: '#0d9488', bg: '#f0fdfa' },
            { step: '3', title: 'Admission', count: `${metrics.todayAdmissions}`, sub: 'New Inpatients', color: '#4f46e5', bg: '#eef2ff' },
            { step: '4', title: 'Treatment', count: `${metrics.ipdPatients}`, sub: 'Under Active Care', color: '#d97706', bg: '#fffbeb' },
            { step: '5', title: 'Discharge', count: `${metrics.todayDischarges}`, sub: 'Recovered & Cleared', color: '#059669', bg: '#ecfdf5' },
          ].map((stage, idx, arr) => (
            <div
              key={stage.step}
              style={{
                background: stage.bg,
                border: `1px solid ${stage.color}30`,
                borderRadius: '12px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: stage.color,
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stage.step}
                </span>
                {idx < arr.length - 1 && (
                  <ArrowRight size={14} style={{ color: stage.color, opacity: 0.6 }} />
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: stage.color }}>
                  {stage.count}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {stage.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
                  {stage.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          7. BED OCCUPANCY OVERVIEW & WARD MATRIX (2-Column Grid)
          ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Bed Occupancy Overview */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BedDouble size={18} style={{ color: '#059669' }} />
              <div>
                <span className="card-title">Bed Occupancy Overview</span>
                <div className="card-subtitle">Real-time status of hospital bed fleet</div>
              </div>
            </div>
            <span className="badge badge-success">{metrics.bedOccupancyRate}% Occupied</span>
          </div>

          <div className="card-body">
            {/* Visual Capacity Bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Overall Facility Capacity:</span>
                <span style={{ fontWeight: 800, color: metrics.bedOccupancyRate > 85 ? '#ef4444' : '#1e40af' }}>
                  {metrics.occupiedBeds} / {metrics.totalBeds} Beds ({metrics.bedOccupancyRate}%)
                </span>
              </div>
              <div style={{ height: 12, background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div
                  style={{
                    width: `${(metrics.occupiedBeds / metrics.totalBeds) * 100}%`,
                    background: '#2563eb',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Occupied: ${metrics.occupiedBeds}`}
                />
                <div
                  style={{
                    width: `${(metrics.reservedBeds / metrics.totalBeds) * 100}%`,
                    background: '#f59e0b',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Reserved: ${metrics.reservedBeds}`}
                />
                <div
                  style={{
                    width: `${(metrics.maintenanceBeds / metrics.totalBeds) * 100}%`,
                    background: '#94a3b8',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Maintenance: ${metrics.maintenanceBeds}`}
                />
              </div>
            </div>

            {/* Bed Metrics Breakdown Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Beds</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{metrics.totalBeds}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} />
              </div>

              <div style={{ padding: '10px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 600 }}>Available Beds</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#059669' }}>{metrics.availableBeds}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
              </div>

              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>Occupied Beds</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#2563eb' }}>{metrics.occupiedBeds}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
              </div>

              <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>Reserved Beds</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#d97706' }}>{metrics.reservedBeds}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
              </div>

              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Maintenance / Cleaning Beds</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>{metrics.maintenanceBeds} Beds</div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Sanitizing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ward Distribution Breakdown */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} style={{ color: '#2563eb' }} />
              <div>
                <span className="card-title">Ward Occupancy Distribution</span>
                <div className="card-subtitle">Inpatient bed density by hospital unit</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ipd')}>
              Manage Beds →
            </button>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'General Ward A (Male)', total: 20, occupied: 14, available: 4, type: 'General' },
                { name: 'General Ward B (Female)', total: 20, occupied: 12, available: 6, type: 'General' },
                { name: 'Medical ICU (MICU)', total: 10, occupied: 8, available: 2, type: 'ICU' },
                { name: 'Surgical ICU (SICU)', total: 10, occupied: 7, available: 3, type: 'ICU' },
                { name: 'Private Deluxe Rooms', total: 20, occupied: 11, available: 9, type: 'Deluxe' },
              ].map(ward => {
                const pct = Math.round((ward.occupied / ward.total) * 100);
                return (
                  <div key={ward.name} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{ward.name}</span>
                        <span className={`badge ${ward.type === 'ICU' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '9px', marginLeft: 6 }}>
                          {ward.type}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: pct > 80 ? '#e11d48' : '#2563eb' }}>
                        {ward.occupied}/{ward.total} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          background: pct > 80 ? '#e11d48' : '#2563eb',
                          height: '100%',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          8. APPOINTMENTS AND SCHEDULE + RECENT HOSPITAL ACTIVITY (2-Column Grid)
          ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Appointments and Schedule */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarCheck size={18} style={{ color: '#2563eb' }} />
              <div>
                <span className="card-title">Appointments & Today's Schedule</span>
                <div className="card-subtitle">Active OPD queue & upcoming clinical consultations</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/opd')}>
              View Full Queue →
            </button>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {metrics.todaySchedule.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '13px' }}>
                  No scheduled appointments remaining for today
                </div>
              ) : (
                metrics.todaySchedule.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#1e40af',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        #{item.tokenNumber}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {item.patientName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {item.doctorName} · {item.department}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {item.time}
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '9px', marginTop: 2 }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Hospital Activity Timeline */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} style={{ color: '#059669' }} />
              <div>
                <span className="card-title">Recent Hospital Activity</span>
                <div className="card-subtitle">Real-time event stream across all hospital wards</div>
              </div>
            </div>
            <span className="badge badge-neutral">Live Log</span>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {metrics.activities.slice(0, 6).map((act, index) => (
                <div key={act.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: act.priority === 'critical' ? '#fee2e2' : '#eff6ff',
                        color: act.priority === 'critical' ? '#ef4444' : '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        flexShrink: 0,
                      }}
                    >
                      {act.type === 'admission' ? <BedDouble size={13} /> :
                       act.type === 'appointment' ? <Calendar size={13} /> :
                       act.type === 'diagnostic' ? <FlaskConical size={13} /> :
                       act.type === 'prescription' ? <Pill size={13} /> :
                       act.type === 'bed_assigned' ? <Layers size={13} /> :
                       <CheckCircle2 size={13} />}
                    </div>
                    {index !== metrics.activities.slice(0, 6).length - 1 && (
                      <div style={{ width: 2, height: 24, background: '#e2e8f0', marginTop: 4 }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {act.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>
                      {act.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          9. MODALS (Full Dynamic Implementation of 6 Modals)
          ============================================================ */}

      {/* 1. Quick Add Patient Modal */}
      {showQuickPatientModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickPatientModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <UserPlus size={18} style={{ color: '#1e40af' }} />
              <span className="modal-title">Register New Patient</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowQuickPatientModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">First Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="e.g. Ramesh"
                      value={patientForm.firstName}
                      onChange={e => setPatientForm({ ...patientForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Yadav"
                      value={patientForm.lastName}
                      onChange={e => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="10-digit mobile"
                      type="tel"
                      value={patientForm.phone}
                      onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={patientForm.gender}
                      onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={patientForm.bloodGroup}
                      onChange={e => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickPatientModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={14} /> Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Quick Book Appointment Modal */}
      {showQuickAptModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickAptModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <CalendarCheck size={18} style={{ color: '#1e40af' }} />
              <span className="modal-title">Book OPD Appointment</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowQuickAptModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAppointment}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={aptForm.patientName}
                      onChange={e => setAptForm({ ...aptForm, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Consulting Doctor <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={aptForm.doctorId}
                      onChange={e => setAptForm({ ...aptForm, doctorId: e.target.value })}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization} (Fee: ₹{d.consultationFee})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={aptForm.date}
                      onChange={e => setAptForm({ ...aptForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Slot</label>
                    <select
                      className="form-select"
                      value={aptForm.time}
                      onChange={e => setAptForm({ ...aptForm, time: e.target.value })}
                    >
                      {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '15:00', '16:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickAptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CalendarCheck size={14} /> Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Quick Admit Patient Modal */}
      {showQuickAdmitModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickAdmitModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <BedDouble size={18} style={{ color: '#059669' }} />
              <span className="modal-title">Admit Patient to IPD</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowQuickAdmitModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAdmission}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={admitForm.patientName}
                      onChange={e => setAdmitForm({ ...admitForm, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ward</label>
                    <select
                      className="form-select"
                      value={admitForm.ward}
                      onChange={e => setAdmitForm({ ...admitForm, ward: e.target.value })}
                    >
                      <option value="General Ward A">General Ward A</option>
                      <option value="General Ward B">General Ward B</option>
                      <option value="Medical ICU (MICU)">Medical ICU (MICU)</option>
                      <option value="Surgical ICU (SICU)">Surgical ICU (SICU)</option>
                      <option value="Private Deluxe">Private Deluxe</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Bed <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={admitForm.bedNumber}
                      onChange={e => setAdmitForm({ ...admitForm, bedNumber: e.target.value })}
                    >
                      {availableBedsList.map(b => (
                        <option key={b.id} value={b.bedNumber}>{b.bedNumber} ({b.ward})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Attending Doctor</label>
                    <select
                      className="form-select"
                      value={admitForm.doctorId}
                      onChange={e => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickAdmitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <BedDouble size={14} /> Assign Bed & Admit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Quick Assign Bed Modal */}
      {showQuickAssignBedModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickAssignBedModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Layers size={18} style={{ color: '#d97706' }} />
              <span className="modal-title">Assign Vacant Bed</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowQuickAssignBedModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveBedAssign}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="e.g. Vikram Singh"
                      value={bedAssignForm.patientName}
                      onChange={e => setBedAssignForm({ ...bedAssignForm, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Ward</label>
                    <select
                      className="form-select"
                      value={bedAssignForm.ward}
                      onChange={e => setBedAssignForm({ ...bedAssignForm, ward: e.target.value })}
                    >
                      <option value="General Ward A">General Ward A</option>
                      <option value="General Ward B">General Ward B</option>
                      <option value="Medical ICU (MICU)">Medical ICU (MICU)</option>
                      <option value="Surgical ICU (SICU)">Surgical ICU (SICU)</option>
                      <option value="Private Deluxe">Private Deluxe</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Bed Number <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={bedAssignForm.bedNumber}
                      onChange={e => setBedAssignForm({ ...bedAssignForm, bedNumber: e.target.value })}
                    >
                      {availableBedsList.map(b => (
                        <option key={b.id} value={b.bedNumber}>{b.bedNumber} — {b.ward}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickAssignBedModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Layers size={14} /> Allocate Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Quick Diagnostic Request Modal */}
      {showQuickDiagModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickDiagModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FlaskConical size={18} style={{ color: '#7c3aed' }} />
              <span className="modal-title">Create Diagnostic Investigation</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowQuickDiagModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveDiagnostic}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={diagForm.patientName}
                      onChange={e => setDiagForm({ ...diagForm, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Investigation / Test</label>
                    <select
                      className="form-select"
                      value={diagForm.testName}
                      onChange={e => setDiagForm({ ...diagForm, testName: e.target.value })}
                    >
                      <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                      <option value="Lipid Profile">Lipid Profile</option>
                      <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                      <option value="Renal Function Test (KFT)">Renal Function Test (KFT)</option>
                      <option value="Troponin I Quantitative">Troponin I Quantitative (Cardiac)</option>
                      <option value="Chest X-Ray PA View">Chest X-Ray PA View</option>
                      <option value="CT Brain Plain">CT Brain Plain</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={diagForm.priority}
                      onChange={e => setDiagForm({ ...diagForm, priority: e.target.value })}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">🔴 STAT / Emergency</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickDiagModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <FlaskConical size={14} /> Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Daily Operational Report Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FileText size={18} style={{ color: '#059669' }} />
              <span className="modal-title">Daily Hospital Operational Summary Report</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>ALN Cure Multi-Specialty Hospital</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Daily Executive Operations & Census Briefing</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{format(new Date(), 'dd MMMM yyyy')}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Generated: {format(currentDateTime, 'hh:mm a')}</div>
                  </div>
                </div>
              </div>

              <div className="form-grid form-grid-3" style={{ gap: 12, marginBottom: 16 }}>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Total Registered Patients</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e40af' }}>{metrics.totalPatients}</div>
                </div>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>OPD Consultations</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0d9488' }}>{metrics.opdPatientsToday}</div>
                </div>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Active Inpatients (IPD)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#4338ca' }}>{metrics.ipdPatients}</div>
                </div>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Bed Occupancy Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{metrics.bedOccupancyRate}%</div>
                </div>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Available Vacant Beds</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{metrics.availableBeds}</div>
                </div>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Duty Medical Officers</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e40af' }}>{metrics.doctorsOnDuty}</div>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>Administrative Summary:</strong> All units are operating normally. Hospital emergency trauma triage is fully staffed. Pathology turnaround times are within 1.5 hours benchmark. Bed sanitation turnover is active in General Ward B.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                  showToast('Daily summary sent to print dialog', 'success');
                }}
              >
                <Printer size={14} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
