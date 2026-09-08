// ============================================================
// ALN Cure HMS — Consolidated Reports & Audit History Module
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  History,
  Printer,
  Download,
  Search,
  Filter,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileText,
  AlertCircle,
  ReceiptText
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS } from '../../../data/seedData';

export default function InsuranceReportsHistory() {
  const { policies, claims, settlements, providers, auditLogs, eligibilityRecords, preAuthRequests } = useInsurance();

  const [topTab, setTopTab] = useState<'reports' | 'patient_dossier' | 'audit_logs'>('reports');

  // Reports state
  const [selectedReport, setSelectedReport] = useState<string>('claims_summary');
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');

  // Patient dossier state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const activePatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];

  const patientPolicies = policies.filter(p => p.patientId === selectedPatientId);
  const patientVerifications = eligibilityRecords.filter(v => v.patientId === selectedPatientId);
  const patientPreAuths = preAuthRequests.filter(pa => pa.patientId === selectedPatientId);
  const patientClaims = claims.filter(c => c.patientId === selectedPatientId);
  const patientSettlements = settlements.filter(s => s.patientId === selectedPatientId);

  // Filtered Claims for Reports
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (c.patientName || '').toLowerCase().includes(q) ||
        (c.uhid || '').toLowerCase().includes(q) ||
        (c.claimNumber || '').toLowerCase().includes(q);
      const matchesProvider = providerFilter === 'ALL' || c.providerId === providerFilter || (c.providerName || c.insuranceProvider || '').includes(providerFilter);
      return matchesSearch && matchesProvider;
    });
  }, [claims, search, providerFilter]);

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Claim #', 'Patient', 'UHID', 'Provider', 'Total Bill', 'Claimed Amount', 'Approved Amount', 'Patient Share', 'Status']
    ];
    filteredClaims.forEach(c => {
      rows.push([
        c.claimNumber || c.id,
        c.patientName || '',
        c.uhid || '',
        c.providerName || c.insuranceProvider || '',
        String(c.totalHospitalBill || 0),
        String(c.claimedAmount || c.claimAmount || 0),
        String(c.approvedAmount || 0),
        String(c.patientPayableAmount || 0),
        c.status || 'draft'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(v => `"${v}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Insurance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Insurance Reports, Dossier & Compliance Audit
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Unified analytics, patient-specific chronological dossiers, and system compliance logs.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setTopTab('reports')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: topTab === 'reports' ? '#2563eb' : 'transparent',
                color: topTab === 'reports' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Reports Console
            </button>
            <button
              onClick={() => setTopTab('patient_dossier')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: topTab === 'patient_dossier' ? '#2563eb' : 'transparent',
                color: topTab === 'patient_dossier' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Patient Dossier
            </button>
            <button
              onClick={() => setTopTab('audit_logs')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: topTab === 'audit_logs' ? '#2563eb' : 'transparent',
                color: topTab === 'audit_logs' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Audit Trail ({auditLogs.length})
            </button>
          </div>

          {topTab === 'reports' && (
            <>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={handleExportCSV} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={13} /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {topTab === 'reports' ? (
        /* REPORTS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search claim, patient, UHID..."
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="form-control"
                  style={{ fontSize: '13px' }}
                  value={providerFilter}
                  onChange={e => setProviderFilter(e.target.value)}
                >
                  <option value="ALL">All Insurance Providers ({providers.length})</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="form-control"
                  style={{ fontSize: '13px' }}
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value as any)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 16px' }}>Claim # & Date</th>
                    <th style={{ padding: '10px 16px' }}>Patient Details</th>
                    <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                    <th style={{ padding: '10px 16px' }}>Total Hospital Bill</th>
                    <th style={{ padding: '10px 16px' }}>Claimed Amount</th>
                    <th style={{ padding: '10px 16px' }}>Approved Amount</th>
                    <th style={{ padding: '10px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No claim records found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{c.claimNumber || c.id}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.submissionDate || c.claimDate || 'Draft'}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{c.patientName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UHID: {c.uhid}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{c.providerName || c.insuranceProvider}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          ₹{(c.totalHospitalBill || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          ₹{(c.claimedAmount || c.claimAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: c.approvedAmount ? '#059669' : 'var(--text-muted)' }}>
                          {c.approvedAmount ? `₹${c.approvedAmount.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: c.status === 'approved' || c.status === 'settled'
                                ? 'rgba(16,185,129,0.12)'
                                : c.status === 'rejected'
                                ? 'rgba(239,68,68,0.12)'
                                : 'rgba(37,99,235,0.12)',
                              color: c.status === 'approved' || c.status === 'settled'
                                ? '#059669'
                                : c.status === 'rejected'
                                ? '#dc2626'
                                : '#2563eb'
                            }}
                          >
                            {(c.status || 'draft').replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : topTab === 'patient_dossier' ? (
        /* PATIENT DOSSIER VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activePatient.firstName[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{activePatient.firstName} {activePatient.lastName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UHID: {activePatient.id} | Phone: {activePatient.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Switch Patient:</span>
              <select
                className="form-control"
                style={{ width: '240px', fontSize: '12px' }}
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
              >
                {DEMO_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Chronological Insurance Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {patientPolicies.map(pol => (
                <div key={pol.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={15} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Enrolled with {pol.providerName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{pol.startDate}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Plan: {pol.planName} | Policy #{pol.policyNumber} | Sum Insured: ₹{pol.sumInsured.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {patientClaims.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={15} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Claim #{c.claimNumber || c.id} — ₹{(c.claimedAmount || c.claimAmount || 0).toLocaleString()}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{c.submissionDate || 'Draft'}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Status: {(c.status || 'draft').toUpperCase()} | Approved: ₹{(c.approvedAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AUDIT LOGS VIEW */
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Timestamp</th>
                  <th style={{ padding: '10px 16px' }}>Staff / User</th>
                  <th style={{ padding: '10px 16px' }}>Module</th>
                  <th style={{ padding: '10px 16px' }}>Action</th>
                  <th style={{ padding: '10px 16px' }}>Reference</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 16px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td style={{ padding: '10px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {log.date} {log.time}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{log.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.userRole}</div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ textTransform: 'capitalize', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#2563eb' }}>{log.referenceId}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#059669' }}>{log.newStatus || 'Executed'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{log.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
