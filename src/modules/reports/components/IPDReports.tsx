import React, { useMemo } from 'react';
import {
  BedDouble, Clock, Users, Download, Printer,
  BarChart2, FileSpreadsheet, CheckCircle2, AlertTriangle, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function IPDReports() {
  const { admissions, filters, exportCSV } = useReports();

  const filtered = useMemo(() => {
    return admissions.filter(a => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || a.patientName?.toLowerCase().includes(q) || a.patientId.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      const mdoc = filters.doctorId === 'ALL' || a.admittingDoctorId === filters.doctorId || a.admittingDoctorName === filters.doctorId;
      const md = filters.department === 'ALL' || a.ward?.toLowerCase().includes(filters.department.toLowerCase());
      const mdate =
        (!filters.startDate || a.admissionDate >= filters.startDate) &&
        (!filters.endDate || a.admissionDate <= filters.endDate);

      return ms && mdoc && md && mdate;
    });
  }, [admissions, filters]);

  // Calculate Length of Stay for each
  const enrichedAdmissions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return filtered.map(a => {
      const start = new Date(a.admissionDate).getTime();
      const end = a.dischargeDate ? new Date(a.dischargeDate).getTime() : new Date(today).getTime();
      const diffDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
      return {
        ...a,
        lengthOfStayDays: diffDays,
      };
    });
  }, [filtered]);

  const alos = enrichedAdmissions.length > 0
    ? (enrichedAdmissions.reduce((acc, a) => acc + a.lengthOfStayDays, 0) / enrichedAdmissions.length).toFixed(1)
    : '0';

  // Ward Distribution
  const wardData = useMemo(() => {
    const map: { [key: string]: number } = {};
    enrichedAdmissions.forEach(a => {
      const w = a.ward || 'General Ward';
      map[w] = (map[w] || 0) + 1;
    });
    return Object.keys(map).map(ward => ({
      ward,
      count: map[ward],
    }));
  }, [enrichedAdmissions]);

  const handleExportCSV = () => {
    const rows = enrichedAdmissions.map(a => [
      a.id,
      a.patientName || a.patientId,
      a.admittingDoctorName || a.admittingDoctorId,
      a.ward || 'Ward',
      a.bedNumber || 'Bed',
      a.admissionDate,
      a.dischargeDate || 'Currently Inpatient',
      `${a.lengthOfStayDays} Days`,
      Array.isArray(a.diagnosis) ? a.diagnosis.join(', ') : a.diagnosis || 'Clinical Management',
      a.status.toUpperCase(),
    ]);

    exportCSV(
      'IPD_Admissions_Discharges_Report',
      ['Admission ID', 'Patient Name', 'Doctor', 'Ward', 'Bed', 'Admission Date', 'Discharge Date', 'Length of Stay', 'Diagnosis', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="IPD Inpatient Admissions, Discharges & Length of Stay Report"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{enrichedAdmissions.length}</div>
          <div className="stat-label">Total Inpatient Admissions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            {enrichedAdmissions.filter(a => a.status === 'active').length}
          </div>
          <div className="stat-label">Currently Admitted Inpatients</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {enrichedAdmissions.filter(a => a.status === 'discharged').length}
          </div>
          <div className="stat-label">Discharged Patients</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{alos} Days</div>
          <div className="stat-label">Average Length of Stay (ALOS)</div>
        </div>
      </div>

      {/* Ward Admissions Chart */}
      <div className="card">
        <div className="card-header">
          <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Inpatient Admissions by Hospital Ward</span>
        </div>
        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="ward" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Admissions" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed IPD Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">IPD Inpatient Admissions Master Register</span>
          <span className="badge badge-primary">{enrichedAdmissions.length} Inpatients</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Patient Name & ID</th>
                  <th>Attending Doctor</th>
                  <th>Ward & Bed</th>
                  <th>Admission Date</th>
                  <th>Discharge Date</th>
                  <th>Length of Stay</th>
                  <th>Diagnosis / Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrichedAdmissions.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{a.id}</strong>
                    </td>
                    <td>
                      <strong>{a.patientName || a.patientId}</strong>
                    </td>
                    <td>{a.admittingDoctorName || a.admittingDoctorId}</td>
                    <td>
                      <div><strong>{a.ward}</strong></div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{a.bedNumber}</div>
                    </td>
                    <td>{a.admissionDate}</td>
                    <td>{a.dischargeDate || <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Inpatient</span>}</td>
                    <td>
                      <strong>{a.lengthOfStayDays} Days</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {Array.isArray(a.diagnosis) ? a.diagnosis.join(', ') : a.diagnosis || 'Under Observation'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'active' ? 'badge-primary' : a.status === 'discharged' ? 'badge-success' : 'badge-neutral'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {enrichedAdmissions.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No IPD records matching the current filters.
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
