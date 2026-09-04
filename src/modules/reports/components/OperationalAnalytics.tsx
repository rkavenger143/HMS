import React, { useMemo } from 'react';
import {
  Activity, Clock, Users, Building2, TrendingUp,
  Download, Printer, CheckCircle2, AlertTriangle, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function OperationalAnalytics() {
  const { kpis, exportCSV } = useReports();

  // Hourly patient traffic distribution (8:00 AM - 8:00 PM)
  const hourlyTrafficData = useMemo(() => [
    { hour: '08:00 AM', opd: 8, er: 4, lab: 12 },
    { hour: '09:00 AM', opd: 22, er: 6, lab: 28 },
    { hour: '10:00 AM', opd: 38, er: 5, lab: 35 },
    { hour: '11:00 AM', opd: 45, er: 8, lab: 40 },
    { hour: '12:00 PM', opd: 35, er: 7, lab: 24 },
    { hour: '01:00 PM', opd: 15, er: 9, lab: 10 },
    { hour: '02:00 PM', opd: 20, er: 6, lab: 14 },
    { hour: '03:00 PM', opd: 32, er: 8, lab: 22 },
    { hour: '04:00 PM', opd: 28, er: 10, lab: 18 },
    { hour: '05:00 PM', opd: 18, er: 12, lab: 10 },
    { hour: '06:00 PM', opd: 12, er: 14, lab: 6 },
    { hour: '07:00 PM', opd: 6, er: 11, lab: 4 },
  ], []);

  // Department Turnaround Time & Operational Benchmarks
  const operationalBenchmarks = useMemo(() => [
    { department: 'Outpatient (OPD)', metric: 'Avg Patient Wait Time', target: '< 20 mins', actual: '16.5 mins', compliance: '94%', status: 'optimal' },
    { department: 'Inpatient (IPD)', metric: 'Average Length of Stay (ALOS)', target: '3.5 - 4.5 days', actual: '3.8 days', compliance: '96%', status: 'optimal' },
    { department: 'Emergency Room', metric: 'Door-to-Doctor Time', target: '< 10 mins', actual: '6.8 mins', compliance: '98%', status: 'optimal' },
    { department: 'Central Laboratory', metric: 'Routine Routine TAT', target: '< 120 mins', actual: '78 mins', compliance: '92%', status: 'optimal' },
    { department: 'Radiology Imaging', metric: 'Report Verification TAT', target: '< 180 mins', actual: '110 mins', compliance: '89%', status: 'warning' },
    { department: 'Pharmacy Retail', metric: 'Dispensing & Billing Time', target: '< 5 mins', actual: '3.8 mins', compliance: '97%', status: 'optimal' },
    { department: 'Blood Bank', metric: 'STAT Cross-Match Delivery', target: '< 30 mins', actual: '21 mins', compliance: '95%', status: 'optimal' },
  ], []);

  const handleExportCSV = () => {
    const rows = operationalBenchmarks.map(b => [
      b.department,
      b.metric,
      b.target,
      b.actual,
      b.compliance,
      b.status.toUpperCase(),
    ]);

    exportCSV(
      'HMS_Hospital_Operational_Efficiency_Benchmarks',
      ['Department', 'Key Operational Metric', 'Target Standard', 'Current Performance', 'SLA Compliance Rate', 'Performance Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Hospital Operations, Patient Throughput & Turnaround Time (TAT) Analytics"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>3.8 Days</div>
          <div className="stat-label">Hospital ALOS (Inpatient)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>{kpis.bedOccupancyRate}%</div>
          <div className="stat-label">Bed Utilization Index</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>94.6%</div>
          <div className="stat-label">Overall SLA Compliance</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>16.5 Min</div>
          <div className="stat-label">Avg OPD Wait Time</div>
        </div>
      </div>

      {/* Hourly Patient Footfall Distribution */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Hourly Patient Footfall & Department Load Profile</span>
        </div>
        <div className="card-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyTrafficData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="opd" name="OPD Clinic Footfall" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lab" name="Diagnostic Phlebotomy" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="er" name="Emergency Arrivals" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SLA Benchmarks Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Hospital Department Turnaround Time (TAT) & SLA Scorecard</span>
          <span className="badge badge-success">7 Core Services Monitored</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department / Care Wing</th>
                  <th>Key Efficiency Metric</th>
                  <th>Hospital Benchmark</th>
                  <th>Actual Performance</th>
                  <th>SLA Compliance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {operationalBenchmarks.map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{b.department}</strong>
                    </td>
                    <td>{b.metric}</td>
                    <td><span style={{ fontFamily: 'monospace' }}>{b.target}</span></td>
                    <td>
                      <strong>{b.actual}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 60,
                            height: 6,
                            backgroundColor: 'var(--border-color)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: b.compliance,
                              height: '100%',
                              backgroundColor: b.status === 'optimal' ? '#10b981' : '#f59e0b',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{b.compliance}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'optimal' ? 'badge-success' : 'badge-warning'}`}>
                        {b.status === 'optimal' ? 'TARGET MET' : 'ATTENTION REQ'}
                      </span>
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
