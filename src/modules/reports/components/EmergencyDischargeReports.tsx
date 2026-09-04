import React, { useMemo } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, UserX, Clock,
  TrendingUp, Download, Printer, HeartPulse, FileText, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function EmergencyDischargeReports() {
  const { admissions, patients, filters, exportCSV } = useReports();

  // Emergency cases dataset
  const emergencyCases = useMemo(() => {
    return [
      { id: 'ER-2026-091', patientName: 'Vikram Singh', age: 48, gender: 'Male', arrivalTime: '2026-03-04 14:15', triage: 'Red (Resuscitation)', condition: 'Acute Myocardial Infarction', doorToDoctorMin: 4, disposition: 'Admitted to CCU', doctor: 'Dr. Sarah Jenkins' },
      { id: 'ER-2026-092', patientName: 'Pooja Verma', age: 29, gender: 'Female', arrivalTime: '2026-03-04 15:30', triage: 'Yellow (Emergent)', condition: 'Severe Asthmatic Attack', doorToDoctorMin: 12, disposition: 'Discharged after Nebulization', doctor: 'Dr. Michael Chang' },
      { id: 'ER-2026-093', patientName: 'Harish Patel', age: 62, gender: 'Male', arrivalTime: '2026-03-04 16:45', triage: 'Red (Resuscitation)', condition: 'Multiple Trauma (RTA)', doorToDoctorMin: 3, disposition: 'Emergency Surgery (OT-2)', doctor: 'Dr. Emily Rodriguez' },
      { id: 'ER-2026-094', patientName: 'Anita Nair', age: 34, gender: 'Female', arrivalTime: '2026-03-04 17:10', triage: 'Green (Non-Urgent)', condition: 'Ankle Sprain & Contusion', doorToDoctorMin: 22, disposition: 'Discharged with Splint', doctor: 'Dr. Marcus Vance' },
      { id: 'ER-2026-095', patientName: 'Kunal Sharma', age: 51, gender: 'Male', arrivalTime: '2026-03-04 18:05', triage: 'Yellow (Emergent)', condition: 'Acute Appendicitis', doorToDoctorMin: 10, disposition: 'Admitted to General Surgery', doctor: 'Dr. David Kim' },
      { id: 'ER-2026-096', patientName: 'Deepa Roy', age: 70, gender: 'Female', arrivalTime: '2026-03-04 19:20', triage: 'Red (Resuscitation)', condition: 'Cerebrovascular Accident (Stroke)', doorToDoctorMin: 5, disposition: 'Admitted to Stroke ICU', doctor: 'Dr. Sarah Jenkins' },
    ];
  }, []);

  // Discharge analytics
  const dischargeTypes = useMemo(() => {
    return [
      { name: 'Normal / Routine Discharge', value: 38, color: '#10b981' },
      { name: 'LAMA (Against Medical Advice)', value: 3, color: '#f59e0b' },
      { name: 'Tertiary Transfer', value: 2, color: '#3b82f6' },
      { name: 'Mortality / Expired', value: 1, color: '#ef4444' },
    ];
  }, []);

  const triageBreakdown = useMemo(() => {
    return [
      { name: 'Red (Immediate/Resus)', count: 3, color: '#ef4444' },
      { name: 'Yellow (Emergent <15m)', count: 2, color: '#f59e0b' },
      { name: 'Green (Non-Urgent)', count: 1, color: '#10b981' },
    ];
  }, []);

  const handleExportCSV = () => {
    const rows = emergencyCases.map(er => [
      er.id,
      er.patientName,
      `${er.age} / ${er.gender}`,
      er.arrivalTime,
      er.triage,
      er.condition,
      `${er.doorToDoctorMin} mins`,
      er.disposition,
      er.doctor,
    ]);

    exportCSV(
      'HMS_Emergency_Triage_and_Discharge_Report',
      ['ER Episode #', 'Patient Name', 'Age/Gender', 'Arrival Time', 'Triage Category', 'Primary Clinical Presentation', 'Door-to-Doctor Time', 'Disposition / Outcome', 'Attending ER Physician'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Emergency Department Triage, ER Admissions & Discharge Analysis"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>{emergencyCases.length}</div>
          <div className="stat-label">ER Episodes (Active Shift)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>6.8 min</div>
          <div className="stat-label">Avg Door-to-Doctor Time</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>50%</div>
          <div className="stat-label">ER to IPD Conversion Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>95.2%</div>
          <div className="stat-label">Successful Routine Discharge</div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Triage Stratification */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Emergency Triage Severity Acuity</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triageBreakdown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip />
                <Bar dataKey="count" name="Patient Count" radius={[4, 4, 0, 0]}>
                  {triageBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discharge Outcomes */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Discharge Type Stratification</span>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dischargeTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {dischargeTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emergency Registry Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Emergency Room Patient Arrivals & Disposition Log</span>
          <span className="badge badge-danger">High Priority ER Desk</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Episode #</th>
                  <th>Patient Name & Demographics</th>
                  <th>Arrival</th>
                  <th>Triage Acuity</th>
                  <th>Condition</th>
                  <th>Door-to-Doc</th>
                  <th>Disposition / Plan</th>
                  <th>Attending ER Doctor</th>
                </tr>
              </thead>
              <tbody>
                {emergencyCases.map(er => {
                  const isRed = er.triage.includes('Red');
                  const isYellow = er.triage.includes('Yellow');

                  return (
                    <tr key={er.id} style={{ background: isRed ? '#fef2f2' : undefined }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: isRed ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                          {er.id}
                        </strong>
                      </td>
                      <td>
                        <strong>{er.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{er.age} yrs • {er.gender}</div>
                      </td>
                      <td>{er.arrivalTime}</td>
                      <td>
                        <span className={`badge ${isRed ? 'badge-danger' : isYellow ? 'badge-warning' : 'badge-success'}`}>
                          {er.triage}
                        </span>
                      </td>
                      <td><strong>{er.condition}</strong></td>
                      <td>
                        <strong style={{ color: er.doorToDoctorMin <= 5 ? '#10b981' : '#f59e0b' }}>
                          {er.doorToDoctorMin} mins
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{er.disposition}</span>
                      </td>
                      <td>{er.doctor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
