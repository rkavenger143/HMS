import React, { useMemo, useState } from 'react';
import {
  ShieldCheck, AlertCircle, FileText, Lock, UserCheck,
  Download, Printer, Filter, Eye, CheckCircle2, Clock
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function AuditTrailReports() {
  const { filters, exportCSV } = useReports();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Comprehensive System Audit Trail Logs
  const auditLogs = useMemo(() => [
    { id: 'AUD-9901', timestamp: '2026-03-04 19:45:12', user: 'Dr. Sarah Jenkins', role: 'Chief Physician', category: 'Clinical', action: 'Approved IPD Bedside Consultation Note & Medication Plan for Patient P-001', ipAddress: '192.168.1.104', severity: 'Info' },
    { id: 'AUD-9902', timestamp: '2026-03-04 18:32:00', user: 'Sneha Sharma', role: 'Billing Executive', category: 'Financial', action: 'Recorded Payment of ₹12,600 via UPI for Invoice INV-2026-001', ipAddress: '192.168.1.120', severity: 'Info' },
    { id: 'AUD-9903', timestamp: '2026-03-04 17:15:45', user: 'Admin User', role: 'System Admin', category: 'Financial', action: 'Authorized Discount of ₹500 on Invoice INV-2026-001 (Reason: Senior Citizen Concession)', ipAddress: '192.168.1.100', severity: 'Warning' },
    { id: 'AUD-9904', timestamp: '2026-03-04 16:50:22', user: 'Rohan Deshmukh', role: 'Blood Bank Officer', category: 'Blood Bank', action: 'Completed 8-Point Cross-Match Safety Checklist for Unit BB-PRBC-001 (Patient: P-001)', ipAddress: '192.168.1.115', severity: 'Info' },
    { id: 'AUD-9905', timestamp: '2026-03-04 15:10:04', user: 'Nurse Priya', role: 'Head Nurse', category: 'Clinical', action: 'Administered 500mg Paracetamol IV to Patient P-002 in Ward ICU-A Bed 02', ipAddress: '192.168.1.142', severity: 'Info' },
    { id: 'AUD-9906', timestamp: '2026-03-04 14:02:18', user: 'Pharmacist Ankit', role: 'Chief Pharmacist', category: 'Inventory', action: 'Dispensed Prescription RX-2026-104 (Amoxicillin 500mg, 10 tabs)', ipAddress: '192.168.1.130', severity: 'Info' },
    { id: 'AUD-9907', timestamp: '2026-03-04 12:44:50', user: 'Security System', role: 'System Daemon', category: 'Security', action: 'Failed login attempt for user "dr_kunal" from IP 192.168.1.205 (Reason: Invalid Password)', ipAddress: '192.168.1.205', severity: 'Danger' },
    { id: 'AUD-9908', timestamp: '2026-03-04 11:20:10', user: 'Dr. Michael Chang', role: 'Cardiologist', category: 'Clinical', action: 'Discharged Patient P-003 with final discharge summary and follow-up regimen', ipAddress: '192.168.1.108', severity: 'Info' },
    { id: 'AUD-9909', timestamp: '2026-03-04 09:15:33', user: 'Receptionist Pooja', role: 'Front Desk', category: 'Patient', action: 'Registered new outpatient patient Ramesh Gupta (MRN: P-009)', ipAddress: '192.168.1.102', severity: 'Info' },
  ], []);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }
      if (filters.patientSearch) {
        const q = filters.patientSearch.toLowerCase();
        if (
          !log.user.toLowerCase().includes(q) &&
          !log.action.toLowerCase().includes(q) &&
          !log.role.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedCategory, filters]);

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.user,
      l.role,
      l.category,
      l.action,
      l.ipAddress,
      l.severity.toUpperCase(),
    ]);

    exportCSV(
      'HMS_Security_and_Compliance_Audit_Trail_Report',
      ['Audit ID', 'Timestamp', 'User Name', 'Role', 'Category', 'Action / Event Description', 'IP Address', 'Severity'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="System Security, Clinical Compliance & Financial Audit Trail"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
        showDepartmentFilter={false}
      />

      {/* Category Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Audit Domain:</span>
        {['ALL', 'Clinical', 'Financial', 'Blood Bank', 'Inventory', 'Patient', 'Security'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              borderRadius: 20,
              backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-card)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {cat === 'ALL' ? 'All Audit Domains' : cat}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filteredLogs.length}</div>
          <div className="stat-label">Audit Events Recorded</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>100%</div>
          <div className="stat-label">HIPAA / NABH Traceability</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>1 Event</div>
          <div className="stat-label">Financial Overrides / Discounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>1 Incident</div>
          <div className="stat-label">Flagged Security Anomalies</div>
        </div>
      </div>

      {/* Audit Trail Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Immutable Security & Clinical Event Audit Log</span>
          <span className="badge badge-primary">{filteredLogs.length} Events Logged</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Domain</th>
                  <th>Event / Action Description</th>
                  <th>IP Address</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const isDanger = log.severity === 'Danger';
                  const isWarning = log.severity === 'Warning';

                  return (
                    <tr key={log.id} style={{ background: isDanger ? '#fef2f2' : undefined }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {log.id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{log.timestamp}</div>
                      </td>
                      <td>
                        <strong>{log.user}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.role}</div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{log.category}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>{log.action}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.ipAddress}</span>
                      </td>
                      <td>
                        <span className={`badge ${isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
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
