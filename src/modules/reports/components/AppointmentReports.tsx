import React, { useMemo } from 'react';
import {
  Calendar, CheckCircle2, XCircle, Clock, Users,
  BarChart2, Download, Printer, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

const STATUS_COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AppointmentReports() {
  const { appointments, filters, exportCSV, doctors } = useReports();

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || a.patientName?.toLowerCase().includes(q) || a.patientId.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      const mdoc = filters.doctorId === 'ALL' || a.doctorId === filters.doctorId;
      const mdate =
        (!filters.startDate || a.date >= filters.startDate) &&
        (!filters.endDate || a.date <= filters.endDate);

      return ms && mdoc && mdate;
    });
  }, [appointments, filters]);

  // Status Distribution
  const statusData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filtered.forEach(a => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return Object.keys(map).map(status => ({
      name: status.replace(/_/g, ' ').toUpperCase(),
      value: map[status],
    }));
  }, [filtered]);

  const handleExportCSV = () => {
    const rows = filtered.map(a => [
      a.id,
      a.patientName || a.patientId,
      a.doctorName || a.doctorId,
      a.department || 'General',
      a.date,
      a.time,
      a.type || 'in_person',
      a.status.toUpperCase(),
    ]);

    exportCSV(
      'Appointments_Audit_Report',
      ['Appointment ID', 'Patient Name', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Patient Appointments & Scheduling Report"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Total Appointments</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {filtered.filter(a => a.status === 'completed').length}
          </div>
          <div className="stat-label">Completed Consultations</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            {filtered.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length}
          </div>
          <div className="stat-label">Scheduled / Upcoming</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>
            {filtered.filter(a => a.status === 'cancelled' || a.status === 'no_show').length}
          </div>
          <div className="stat-label">Cancelled / No-Show</div>
        </div>
      </div>

      {/* Status Chart */}
      <div className="card">
        <div className="card-header">
          <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Appointment Status Distribution</span>
        </div>
        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                label={((e: any) => `${e.name}: ${e.value}`) as any}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Appointments Master Register</span>
          <span className="badge badge-primary">{filtered.length} Appointments</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient Name & ID</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{a.id}</strong>
                    </td>
                    <td>
                      <strong>{a.patientName || a.patientId}</strong>
                    </td>
                    <td>{a.doctorName || a.doctorId}</td>
                    <td>{a.department || 'General Practice'}</td>
                    <td>{a.date} · {a.time}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {a.type || 'In-Person'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'confirmed' ? 'badge-primary' : a.status === 'scheduled' ? 'badge-warning' : 'badge-danger'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No appointments found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
