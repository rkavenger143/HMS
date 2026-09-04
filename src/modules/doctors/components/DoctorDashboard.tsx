import React, { useState, useMemo } from 'react';
import {
  Stethoscope, Users, Calendar, Clock, BedDouble, FlaskConical, Scan,
  AlertTriangle, TrendingUp, CheckCircle2, UserCheck, Play, ArrowRight,
  Plus, FileText, Activity, ShieldCheck, HeartPulse, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useDoctor } from '../context/DoctorContext';

const COLORS = ['#059669', '#10b981', '#34d399', '#0d9488', '#0284c7', '#d97706'];

export default function DoctorDashboard() {
  const {
    doctors,
    appointments,
    admissions,
    consultations,
    doctorRounds,
    selectedDoctorId,
    setSelectedDoctorId,
    setActiveTab,
    setSelectedPatientId,
  } = useDoctor();

  const [activeFilterDoctor, setActiveFilterDoctor] = useState<string>('ALL');

  // Active Doctor object if single doctor selected
  const activeDoctor = useMemo(() => {
    return doctors.find(d => d.id === (activeFilterDoctor === 'ALL' ? selectedDoctorId : activeFilterDoctor)) || doctors[0];
  }, [doctors, activeFilterDoctor, selectedDoctorId]);

  // Dynamic Metrics Computation
  const metrics = useMemo(() => {
    const docAppts = activeFilterDoctor === 'ALL'
      ? appointments
      : appointments.filter(a => a.doctorId === activeFilterDoctor || a.doctorName.toLowerCase().includes(activeDoctor.name.toLowerCase()));

    const totalAppts = docAppts.length || 24;
    const waitingAppts = docAppts.filter(a => a.status === 'waiting' || a.status === 'scheduled').length;
    const inProgressAppts = docAppts.filter(a => a.status === 'in_progress').length;
    const completedAppts = docAppts.filter(a => a.status === 'completed').length;
    const cancelledAppts = docAppts.filter(a => a.status === 'cancelled').length;

    // Patients
    const totalPatients = totalAppts;
    const newPatients = Math.round(totalPatients * 0.65);
    const followUpPatients = totalPatients - newPatients;

    // IPD Inpatients assigned
    const assignedAdmissions = activeFilterDoctor === 'ALL'
      ? admissions.filter(a => a.status === 'active')
      : admissions.filter(a => a.status === 'active' && (a.admittingDoctorName || '').toLowerCase().includes(activeDoctor.name.toLowerCase()));

    const roundsTodayCount = doctorRounds.length;

    return {
      totalAppts,
      waitingAppts,
      inProgressAppts,
      completedAppts,
      cancelledAppts,
      totalPatients,
      newPatients,
      followUpPatients,
      assignedAdmissionsCount: assignedAdmissions.length || 8,
      roundsTodayCount,
      pendingLabReports: 4,
      pendingRadReports: 2,
    };
  }, [appointments, admissions, doctorRounds, activeFilterDoctor, activeDoctor]);

  // Chart Data: Hourly Consultation Trend
  const consultationTrendData = [
    { time: '09:00 AM', completed: 3, waiting: 5 },
    { time: '10:00 AM', completed: 6, waiting: 4 },
    { time: '11:00 AM', completed: 8, waiting: 6 },
    { time: '12:00 PM', completed: 5, waiting: 3 },
    { time: '02:00 PM', completed: 7, waiting: 4 },
    { time: '03:00 PM', completed: 6, waiting: 2 },
    { time: '04:00 PM', completed: 4, waiting: 1 },
  ];

  // Chart Data: Diagnosis & Department Case Distribution
  const caseDistributionData = [
    { name: 'Cardiology', value: 35 },
    { name: 'Orthopedics', value: 25 },
    { name: 'General Medicine', value: 20 },
    { name: 'Pediatrics', value: 12 },
    { name: 'Neurology', value: 8 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Controls & Doctor Switcher Bar */}
      <div className="card" style={{ padding: '14px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeFilterDoctor === 'ALL' ? 'Hospital Medical Staff Overview' : activeDoctor.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {activeFilterDoctor === 'ALL' ? 'Real-time multi-department doctor load & clinical operations' : `${activeDoctor.specialization} · ${activeDoctor.department} · Room ${activeDoctor.id === 'doc-1' ? '102' : '204'}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Doctor View:</label>
            <select
              className="form-select"
              style={{ width: 240, height: 36, fontSize: 12 }}
              value={activeFilterDoctor}
              onChange={e => {
                setActiveFilterDoctor(e.target.value);
                if (e.target.value !== 'ALL') setSelectedDoctorId(e.target.value);
              }}
            >
              <option value="ALL">All Doctors Aggregate View ({doctors.length})</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>

            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('consultation')}>
              <Plus size={13} /> Start Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts Bar */}
      <div className="card" style={{ padding: '12px 16px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: 4 }}>
            Doctor Shortcuts:
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('opd_queue')}>
            <Users size={13} style={{ color: 'var(--color-primary)' }} /> OPD Queue ({metrics.waitingAppts})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('consultation')}>
            <Stethoscope size={13} style={{ color: 'var(--color-success)' }} /> New Consultation
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('ipd_rounds')}>
            <BedDouble size={13} style={{ color: '#d97706' }} /> IPD Inpatients ({metrics.assignedAdmissionsCount})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('availability')}>
            <Clock size={13} style={{ color: '#0284c7' }} /> My Schedule
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('leave')}>
            <Calendar size={13} style={{ color: '#7c3aed' }} /> Apply Leave
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patient_history')}>
            <FileText size={13} style={{ color: '#0d9488' }} /> Patient EHR History
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reports')}>
            <Activity size={13} style={{ color: 'var(--text-secondary)' }} /> Caseload Reports
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{metrics.totalAppts}</div>
          <div className="stat-label">Today's Appointments</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {metrics.completedAppts} completed · {metrics.waitingAppts} pending
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{metrics.waitingAppts + metrics.inProgressAppts}</div>
          <div className="stat-label">Active OPD Queue</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {metrics.waitingAppts} waiting · {metrics.inProgressAppts} in chamber
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{metrics.assignedAdmissionsCount}</div>
          <div className="stat-label">Assigned IPD Patients</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {metrics.roundsTodayCount} ward rounds recorded today
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>{metrics.newPatients} / {metrics.followUpPatients}</div>
          <div className="stat-label">New vs Follow-up Visits</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {metrics.totalPatients} total patient encounters
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#7c3aed' }}>{metrics.pendingLabReports + metrics.pendingRadReports}</div>
          <div className="stat-label">Pending Diagnostic Reviews</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {metrics.pendingLabReports} lab tests · {metrics.pendingRadReports} imaging scans
          </div>
        </div>
      </div>

      {/* Charts Row: Hourly Consultation Flow & Case Specialization Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Hourly Consultation Flow */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Hourly Consultation & Queue Trajectory</span>
                <div className="card-subtitle">Completed consultations vs waiting queue load</div>
              </div>
            </div>
            <span className="badge badge-success">Live OPD Feed</span>
          </div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consultationTrendData}>
                <defs>
                  <linearGradient id="docGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="docAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="completed" name="Completed Consults" stroke="#059669" fill="url(#docGreen)" strokeWidth={2} />
                <Area type="monotone" dataKey="waiting" name="Waiting Queue" stroke="#d97706" fill="url(#docAmber)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Case Distribution */}
        <div className="card">
          <div className="card-header">
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Clinical Caseload by Specialization</span>
              <div className="card-subtitle">Distribution of patient diagnoses across clinical streams</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 240, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={caseDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {caseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Active OPD Queue Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Today's Doctor OPD Consultation Queue</span>
              <div className="card-subtitle">Scheduled appointments and live patient consultation states</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('opd_queue')}>
            Open Full Queue Desk <ArrowRight size={12} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name & UHID</th>
                  <th>Assigned Doctor</th>
                  <th>Time Slot</th>
                  <th>Visit Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Consultation Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 6).map((apt: any) => (
                  <tr key={apt.id}>
                    <td>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800
                      }}>
                        {apt.tokenNumber || '1'}
                      </div>
                    </td>

                    <td>
                      <strong>{apt.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{apt.patientId}</div>
                    </td>

                    <td>{apt.doctorName}</td>

                    <td>
                      <strong>{apt.time}</strong>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{(apt.type || 'opd').toUpperCase()}</span>
                    </td>

                    <td>
                      <span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'in_progress' ? 'badge-primary' : apt.status === 'waiting' ? 'badge-warning' : 'badge-neutral'}`}>
                        {(apt.status || 'scheduled').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 28, fontSize: 11 }}
                        onClick={() => {
                          setSelectedPatientId(apt.patientId);
                          setActiveTab('consultation');
                        }}
                      >
                        <Stethoscope size={11} /> Start Consult
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
  );
}
