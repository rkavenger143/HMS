import React, { useMemo } from 'react';
import {
  Users, Search, Filter, Download, Printer, PieChart as PieIcon,
  BarChart2, ShieldCheck, FileSpreadsheet, Calendar
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

const GENDER_COLORS = ['#0284c7', '#ec4899', '#8b5cf6'];
const AGE_COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PatientReports() {
  const { patients, filters, exportCSV } = useReports();

  // Filtered Patients
  const filtered = useMemo(() => {
    return patients.filter(p => {
      const q = (filters.patientSearch || '').toLowerCase();
      const matchSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.city.toLowerCase().includes(q);

      const matchDate =
        (!filters.startDate || p.registrationDate >= filters.startDate) &&
        (!filters.endDate || p.registrationDate <= filters.endDate);

      return matchSearch && matchDate;
    });
  }, [patients, filters]);

  // Gender Chart Data
  const genderData = useMemo(() => {
    const male = filtered.filter(p => p.gender === 'male').length;
    const female = filtered.filter(p => p.gender === 'female').length;
    const other = filtered.filter(p => p.gender === 'other').length;
    return [
      { name: 'Male', value: male },
      { name: 'Female', value: female },
      { name: 'Other', value: other },
    ].filter(d => d.value > 0);
  }, [filtered]);

  // Age Group Distribution
  const ageData = useMemo(() => {
    const today = new Date().getFullYear();
    const groups: { [key: string]: number } = {
      '0-18 yrs': 0,
      '19-35 yrs': 0,
      '36-50 yrs': 0,
      '51-65 yrs': 0,
      '65+ yrs': 0,
    };

    filtered.forEach(p => {
      const age = today - new Date(p.dateOfBirth).getFullYear();
      if (age <= 18) groups['0-18 yrs']++;
      else if (age <= 35) groups['19-35 yrs']++;
      else if (age <= 50) groups['36-50 yrs']++;
      else if (age <= 65) groups['51-65 yrs']++;
      else groups['65+ yrs']++;
    });

    return Object.keys(groups).map(k => ({ bracket: k, count: groups[k] }));
  }, [filtered]);

  const handleExportCSV = () => {
    const rows = filtered.map(p => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return [
        p.id,
        `${p.firstName} ${p.lastName}`,
        age,
        p.gender.toUpperCase(),
        p.bloodGroup,
        p.phone,
        p.city,
        p.registrationDate,
        p.insurance?.provider || 'Self Pay',
        p.allergies.join('; ') || 'None',
      ];
    });

    exportCSV(
      'Patient_Registration_Master_Report',
      ['UHID', 'Patient Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'City', 'Registration Date', 'Insurance', 'Allergies'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Patient Demographics & Registration Report"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
        showDepartmentFilter={false}
      />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Filtered Patient Records</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Total in current criteria
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            {filtered.filter(p => p.gender === 'male').length}
          </div>
          <div className="stat-label">Male Patients ({filtered.length > 0 ? Math.round((filtered.filter(p => p.gender === 'male').length / filtered.length) * 100) : 0}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ec4899' }}>
            {filtered.filter(p => p.gender === 'female').length}
          </div>
          <div className="stat-label">Female Patients ({filtered.length > 0 ? Math.round((filtered.filter(p => p.gender === 'female').length / filtered.length) * 100) : 0}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#059669' }}>
            {filtered.filter(p => p.insurance !== undefined).length}
          </div>
          <div className="stat-label">Insured / TPA Enrolled</div>
        </div>
      </div>

      {/* Demographics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        {/* Gender Distribution */}
        <div className="card">
          <div className="card-header">
            <PieIcon size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Patient Gender Demographic Distribution</span>
          </div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  label={((e: any) => `${e.name}: ${e.value}`) as any}
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Bracket Distribution */}
        <div className="card">
          <div className="card-header">
            <BarChart2 size={16} style={{ color: '#0284c7' }} />
            <span className="card-title">Patient Age Group Stratification</span>
          </div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Patients" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Patient Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Patient Registration Master Ledger</span>
          <span className="badge badge-primary">{filtered.length} Patients</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Contact Phone</th>
                  <th>City / State</th>
                  <th>Registration Date</th>
                  <th>Insurance Status</th>
                  <th>Allergies</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{p.id}</strong>
                      </td>
                      <td>
                        <strong>{p.firstName} {p.lastName}</strong>
                        {p.email && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{p.email}</div>}
                      </td>
                      <td>
                        {age} yrs · <span style={{ textTransform: 'capitalize' }}>{p.gender}</span>
                      </td>
                      <td>
                        <span className="badge badge-danger" style={{ fontWeight: 800 }}>{p.bloodGroup}</span>
                      </td>
                      <td>{p.phone}</td>
                      <td>{p.city}, {p.state}</td>
                      <td>{p.registrationDate}</td>
                      <td>
                        {p.insurance ? (
                          <span className="badge badge-success">{p.insurance.provider}</span>
                        ) : (
                          <span className="badge badge-neutral">Self Pay</span>
                        )}
                      </td>
                      <td>
                        {p.allergies.length > 0 ? (
                          <span className="badge badge-danger">⚠ {p.allergies.join(', ')}</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No patients matching the specified filter criteria.
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
