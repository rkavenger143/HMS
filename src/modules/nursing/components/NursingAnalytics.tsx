import React from 'react';
import { TrendingUp, Users, CheckCircle2, Pill, Activity, AlertTriangle, BarChart3 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const COLORS = ['#0A84FF', '#32D74B', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

export default function NursingAnalytics() {
  const { kpis, assignments, marRecords, nursingTasks, vitalsList } = useNursing();

  const marAdministered = marRecords.filter(m => m.status === 'administered').length;
  const marTotal = marRecords.length || 1;
  const marRate = Math.round((marAdministered / marTotal) * 100);

  const tasksCompleted = nursingTasks.filter(t => t.status === 'completed').length;
  const tasksPending = nursingTasks.filter(t => t.status === 'pending').length;

  const nurseWorkloadData = assignments.map(asg => ({
    name: asg.nurseName.split(' ')[0],
    patients: asg.patientCount,
    ward: asg.ward,
  }));

  const taskStatusData = [
    { name: 'Completed Tasks', value: tasksCompleted || 4 },
    { name: 'Pending Tasks', value: tasksPending || 2 },
    { name: 'Overdue Tasks', value: 0 },
  ];

  const marStatusData = [
    { name: 'Administered', count: marAdministered || 3, color: '#32D74B' },
    { name: 'Scheduled', count: marRecords.filter(m => m.status === 'scheduled').length || 1, color: '#0A84FF' },
    { name: 'Held/Missed', count: marRecords.filter(m => m.status === 'held' || m.status === 'missed').length || 0, color: '#FF453A' },
  ];

  const vitalsTrendData = [
    { time: '06:00', compliance: 95 },
    { time: '08:00', compliance: 98 },
    { time: '10:00', compliance: 92 },
    { time: '12:00', compliance: 96 },
    { time: '14:00', compliance: 100 },
    { time: '16:00', compliance: 94 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Workload & Quality Care Analytics</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Nurse-to-patient ratios, MAR compliance rates, vitals charting timeliness, and task completion metrics
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className="stat-value">1 : 3.2</div>
          <div className="stat-label">Nurse-to-Patient Ratio (General Wards)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Pill size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{marRate}%</div>
          <div className="stat-label">Medication Administration Compliance</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>96.8%</div>
          <div className="stat-label">Timely Vitals Charting Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Activity size={20} />
          </div>
          <div className="stat-value">{tasksCompleted + tasksPending}</div>
          <div className="stat-label">Total Shift Care Tasks Handled</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Nurse Workload Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Nurse Patient Load Distribution</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nurseWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="patients" fill="#0A84FF" radius={[4, 4, 0, 0]} name="Assigned Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAR Status Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Medication Administration Status</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#32D74B" radius={[4, 4, 0, 0]} name="Doses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vitals Compliance Line Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Hourly Vital Signs Compliance Trend (%)</span>
          </div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="compliance" stroke="#32D74B" strokeWidth={3} dot={{ r: 4 }} name="Compliance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
