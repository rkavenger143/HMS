import React, { useMemo } from 'react';
import {
  Stethoscope, Clock, Users, DollarSign, Download, Printer,
  BarChart2, FileSpreadsheet, CheckCircle2, AlertTriangle, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function OPDReports() {
  const { doctors, patients, filters, exportCSV } = useReports();

  // Synthetic OPD visit dataset correlated with demo patients & doctors
  const opdVisits = useMemo(() => {
    return [
      { id: 'OPD-2026-001', token: 'T-101', patientId: 'pat-001', patientName: 'Ramesh Patel', doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology', date: '2026-09-02', time: '09:15 AM', type: 'new', waitMins: 14, fee: 800, status: 'completed' },
      { id: 'OPD-2026-002', token: 'T-102', patientId: 'pat-002', patientName: 'Sunita Sharma', doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel', department: 'General Medicine', date: '2026-09-02', time: '09:30 AM', type: 'follow_up', waitMins: 8, fee: 500, status: 'completed' },
      { id: 'OPD-2026-003', token: 'T-103', patientId: 'pat-003', patientName: 'Amit Verma', doctorId: 'doc-003', doctorName: 'Dr. Amit Singh', department: 'Orthopedics', date: '2026-09-02', time: '09:45 AM', type: 'new', waitMins: 22, fee: 750, status: 'in_consultation' },
      { id: 'OPD-2026-004', token: 'T-104', patientId: 'pat-004', patientName: 'Meera Iyer', doctorId: 'doc-004', doctorName: 'Dr. Priya Deshmukh', department: 'Obstetrics & Gynaecology', date: '2026-09-02', time: '10:00 AM', type: 'new', waitMins: 18, fee: 700, status: 'completed' },
      { id: 'OPD-2026-005', token: 'T-105', patientId: 'pat-005', patientName: 'Vikram Joshi', doctorId: 'doc-005', doctorName: 'Dr. Arvind Sharma', department: 'Pediatrics', date: '2026-09-02', time: '10:15 AM', type: 'follow_up', waitMins: 12, fee: 450, status: 'waiting' },
      { id: 'OPD-2026-006', token: 'T-106', patientId: 'pat-006', patientName: 'Ananya Gupta', doctorId: 'doc-006', doctorName: 'Dr. Sandeep Reddy', department: 'General Surgery', date: '2026-09-02', time: '10:30 AM', type: 'new', waitMins: 25, fee: 850, status: 'completed' },
      { id: 'OPD-2026-007', token: 'T-107', patientId: 'pat-007', patientName: 'Kavita Nair', doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology', date: '2026-09-01', time: '02:15 PM', type: 'follow_up', waitMins: 10, fee: 500, status: 'completed' },
      { id: 'OPD-2026-008', token: 'T-108', patientId: 'pat-008', patientName: 'Deepak Chopra', doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel', department: 'General Medicine', date: '2026-09-01', time: '02:45 PM', type: 'new', waitMins: 16, fee: 600, status: 'completed' },
      { id: 'OPD-2026-009', token: 'T-109', patientId: 'pat-009', patientName: 'Pooja Bhatt', doctorId: 'doc-003', doctorName: 'Dr. Amit Singh', department: 'Orthopedics', date: '2026-09-01', time: '03:15 PM', type: 'cancelled', waitMins: 0, fee: 0, status: 'cancelled' },
    ];
  }, []);

  const filtered = useMemo(() => {
    return opdVisits.filter(v => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || v.patientName.toLowerCase().includes(q) || v.patientId.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
      const md = filters.department === 'ALL' || v.department.toLowerCase().includes(filters.department.toLowerCase());
      const mdoc = filters.doctorId === 'ALL' || v.doctorId === filters.doctorId;
      return ms && md && mdoc;
    });
  }, [opdVisits, filters]);

  // Department Aggregation
  const deptSummary = useMemo(() => {
    const map: { [key: string]: { count: number; revenue: number } } = {};
    filtered.forEach(v => {
      if (!map[v.department]) map[v.department] = { count: 0, revenue: 0 };
      map[v.department].count++;
      if (v.status === 'completed') map[v.department].revenue += v.fee;
    });
    return Object.keys(map).map(dept => ({
      dept,
      count: map[dept].count,
      revenue: map[dept].revenue,
    }));
  }, [filtered]);

  const totalRevenue = filtered.filter(v => v.status === 'completed').reduce((acc, v) => acc + v.fee, 0);
  const avgWaitTime = filtered.length > 0 ? Math.round(filtered.reduce((acc, v) => acc + v.waitMins, 0) / filtered.length) : 0;

  const handleExportCSV = () => {
    const rows = filtered.map(v => [
      v.id,
      v.token,
      v.patientName,
      v.patientId,
      v.doctorName,
      v.department,
      v.date,
      v.time,
      v.type.toUpperCase(),
      `${v.waitMins} mins`,
      v.fee,
      v.status.toUpperCase(),
    ]);

    exportCSV(
      'OPD_Daily_Consultation_Report',
      ['Visit ID', 'Token', 'Patient Name', 'UHID', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Wait Time', 'Fee (INR)', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="OPD Consultations & Queue Performance Report"
        onExportCSV={handleExportCSV}
      />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Total OPD Encounters</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {filtered.filter(v => v.status === 'completed').length} completed visits
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            {filtered.filter(v => v.type === 'new').length}
          </div>
          <div className="stat-label">New Consultations ({filtered.length > 0 ? Math.round((filtered.filter(v => v.type === 'new').length / filtered.length) * 100) : 0}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{avgWaitTime} Mins</div>
          <div className="stat-label">Average Patient Wait Time</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Door-to-doctor interval
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">OPD Consultation Revenue</div>
        </div>
      </div>

      {/* Department Volume Chart */}
      <div className="card">
        <div className="card-header">
          <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Department-Wise OPD Consultation Load</span>
        </div>
        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="dept" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Patient Visits" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed OPD Visits Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">OPD Patient Consultations Ledger</span>
          <span className="badge badge-primary">{filtered.length} Visits</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name & UHID</th>
                  <th>Consulting Doctor</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Visit Type</th>
                  <th>Wait Time</th>
                  <th>Fee (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{v.token}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{v.id}</div>
                    </td>

                    <td>
                      <strong>{v.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{v.patientId}</div>
                    </td>

                    <td>
                      <strong>{v.doctorName}</strong>
                    </td>

                    <td>{v.department}</td>
                    <td>{v.date} · {v.time}</td>

                    <td>
                      <span className={`badge ${v.type === 'new' ? 'badge-primary' : 'badge-neutral'}`}>
                        {v.type === 'new' ? 'NEW' : 'FOLLOW-UP'}
                      </span>
                    </td>

                    <td>{v.waitMins} mins</td>

                    <td>
                      <strong>₹{v.fee}</strong>
                    </td>

                    <td>
                      <span className={`badge ${v.status === 'completed' ? 'badge-success' : v.status === 'in_consultation' ? 'badge-primary' : v.status === 'waiting' ? 'badge-warning' : 'badge-danger'}`}>
                        {v.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No OPD records matching the current criteria.
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
