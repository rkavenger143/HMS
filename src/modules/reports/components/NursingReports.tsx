import React, { useMemo } from 'react';
import {
  HeartPulse, Users, Clock, Download, Printer,
  FileSpreadsheet, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function NursingReports() {
  const { filters, exportCSV, patients } = useReports();

  // Synthetic clinical nursing logs correlated with demo patients
  const nursingLogs = useMemo(() => {
    return [
      { id: 'NUR-2026-101', patientId: 'pat-001', patientName: 'Ramesh Patel', ward: 'ICU / CCU', bed: 'BED-101', nurse: 'Kavitha Nair (Staff Nurse)', shift: 'Morning', time: '08:00 AM', vitals: 'BP 128/82 · HR 74 · SpO2 98% · Temp 98.4°F', task: 'Morning vitals & IV Ceftriaxone 1g administration', status: 'completed' },
      { id: 'NUR-2026-102', patientId: 'pat-002', patientName: 'Sunita Sharma', ward: 'Medical Ward', bed: 'BED-204', nurse: 'Anjali Sharma (Staff Nurse)', shift: 'Morning', time: '08:30 AM', vitals: 'BP 118/76 · HR 68 · SpO2 99% · Temp 98.6°F', task: 'Blood sugar check (FBS: 112 mg/dL) & Insulin 6u', status: 'completed' },
      { id: 'NUR-2026-103', patientId: 'pat-003', patientName: 'Amit Verma', ward: 'Surgical Ward', bed: 'BED-302', nurse: 'Deepa Roy (Staff Nurse)', shift: 'Morning', time: '09:00 AM', vitals: 'BP 134/86 · HR 82 · SpO2 97% · Temp 99.1°F', task: 'Post-op wound dressing change & IV Tramadol', status: 'completed' },
      { id: 'NUR-2026-104', patientId: 'pat-004', patientName: 'Meera Iyer', ward: 'Maternity Ward', bed: 'BED-401', nurse: 'Pooja Hegde (Staff Nurse)', shift: 'Morning', time: '09:15 AM', vitals: 'BP 120/80 · HR 78 · SpO2 99% · Temp 98.2°F', task: 'Fetal heart monitoring (FHR 142 bpm regular)', status: 'completed' },
      { id: 'NUR-2026-105', patientId: 'pat-005', patientName: 'Vikram Joshi', ward: 'Pediatric Ward', bed: 'BED-502', nurse: 'Kavitha Nair (Staff Nurse)', shift: 'Morning', time: '09:30 AM', vitals: 'HR 96 · SpO2 98% · Temp 100.2°F', task: 'Nebulization with Salbutamol + Paracetamol syrup', status: 'completed' },
      { id: 'NUR-2026-106', patientId: 'pat-006', patientName: 'Ananya Gupta', ward: 'ICU / CCU', bed: 'BED-102', nurse: 'Deepa Roy (Staff Nurse)', shift: 'Morning', time: '10:00 AM', vitals: 'BP 110/70 · HR 88 · SpO2 96% · Temp 98.8°F', task: 'Arterial blood gas (ABG) sampling & suctioning', status: 'completed' },
    ];
  }, []);

  const filtered = useMemo(() => {
    return nursingLogs.filter(l => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || l.patientName.toLowerCase().includes(q) || l.patientId.toLowerCase().includes(q) || l.nurse.toLowerCase().includes(q);
      const md = filters.department === 'ALL' || l.ward.toLowerCase().includes(filters.department.toLowerCase());
      return ms && md;
    });
  }, [nursingLogs, filters]);

  const handleExportCSV = () => {
    const rows = filtered.map(l => [
      l.id,
      l.patientName,
      l.patientId,
      l.ward,
      l.bed,
      l.nurse,
      l.shift,
      l.time,
      l.vitals,
      l.task,
      l.status.toUpperCase(),
    ]);

    exportCSV(
      'Nursing_Clinical_Care_Report',
      ['Log ID', 'Patient Name', 'UHID', 'Ward', 'Bed', 'Nurse Name', 'Shift', 'Time', 'Vitals', 'Care Task', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Nursing Clinical Care, Vitals & Medication Administration Report"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Bedside Nursing Logs Recorded</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>100%</div>
          <div className="stat-label">Medication Adherence Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>4 Wards</div>
          <div className="stat-label">Active Monitored Units</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>0</div>
          <div className="stat-label">Critical Adverse Incidents</div>
        </div>
      </div>

      {/* Detailed Nursing Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Nursing Care & Vitals Administration Register</span>
          <span className="badge badge-primary">{filtered.length} Records</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Ward & Bed</th>
                  <th>Administering Nurse</th>
                  <th>Shift & Time</th>
                  <th>Observed Vitals</th>
                  <th>Clinical Task / Medication</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{l.id}</strong>
                    </td>
                    <td>
                      <strong>{l.patientName}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{l.patientId}</div>
                    </td>
                    <td>
                      <div>{l.ward}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{l.bed}</div>
                    </td>
                    <td>
                      <strong>{l.nurse}</strong>
                    </td>
                    <td>{l.shift} · {l.time}</td>
                    <td>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a' }}>{l.vitals}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{l.task}</div>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {l.status.toUpperCase()}
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
