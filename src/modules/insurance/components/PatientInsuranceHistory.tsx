// ============================================================
// ALN Cure HMS — Insurance History & Audit Logs Module (Section 18)
// ============================================================

import React, { useState } from 'react';
import {
  History,
  Search,
  ShieldCheck,
  FileCheck,
  Clock,
  FileText,
  ReceiptText,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  User,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS } from '../../../data/seedData';

export default function PatientInsuranceHistory() {
  const { policies, eligibilityRecords, preAuthRequests, claims, settlements, auditLogs } = useInsurance();

  const [viewMode, setViewMode] = useState<'patient_dossier' | 'system_audit_logs'>('patient_dossier');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'policies' | 'verifications' | 'preauths' | 'claims' | 'settlements'>('all');

  // Audit Logs Search & Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const activePatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];

  // Retrieve patient history items
  const patientPolicies = policies.filter(p => p.patientId === selectedPatientId);
  const patientVerifications = eligibilityRecords.filter(v => v.patientId === selectedPatientId);
  const patientPreAuths = preAuthRequests.filter(pa => pa.patientId === selectedPatientId);
  const patientClaims = claims.filter(c => c.patientId === selectedPatientId);
  const patientSettlements = settlements.filter(s => s.patientId === selectedPatientId);

  const currentPolicy = patientPolicies.find(p => p.status === 'active');
  const pastPolicies = patientPolicies.filter(p => p.status !== 'active');

  const filteredAuditLogs = auditLogs.filter(log => {
    const q = auditSearch.toLowerCase();
    const matchesSearch =
      !auditSearch ||
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.referenceId.toLowerCase().includes(q) ||
      (log.remarks || '').toLowerCase().includes(q);
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & View Mode Switcher */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Insurance History & Complete Audit Logs
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Unified patient insurance dossier and complete system-wide compliance audit trail.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('patient_dossier')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'patient_dossier' ? '#2563eb' : 'transparent',
              color: viewMode === 'patient_dossier' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Patient Insurance Dossier
          </button>
          <button
            onClick={() => setViewMode('system_audit_logs')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'system_audit_logs' ? '#2563eb' : 'transparent',
              color: viewMode === 'system_audit_logs' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Master System Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {viewMode === 'patient_dossier' ? (
        <>
          {/* Patient Switcher Card */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                {activePatient.firstName[0]}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activePatient.firstName} {activePatient.lastName} <span style={{ fontSize: '12px', color: '#2563eb' }}>({activePatient.id})</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Gender: {activePatient.gender} · DOB: {activePatient.dateOfBirth} · Phone: {activePatient.phone}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Patient:</label>
              <select
                className="form-control"
                style={{ width: '280px', fontSize: '13px' }}
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
              >
                {DEMO_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Patient Insurance Summary Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Active Policy</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
                {currentPolicy ? currentPolicy.providerName : 'No Active Policy'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentPolicy ? `Policy #${currentPolicy.policyNumber}` : 'Patient is currently Self-Pay'}
              </div>
            </div>

            <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Remaining Annual Limit</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {currentPolicy ? `₹${currentPolicy.remainingCoverage.toLocaleString()}` : '₹0'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentPolicy ? `Of ₹${currentPolicy.sumInsured.toLocaleString()} Sum Insured` : 'N/A'}
              </div>
            </div>

            <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Lifetime Claims Filed</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                {patientClaims.length} Claims
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Total Claimed: ₹{patientClaims.reduce((s, c) => s + (c.claimedAmount || c.claimAmount || 0), 0).toLocaleString()}
              </div>
            </div>

            <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Approved Insurance Benefit</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                ₹{patientClaims.reduce((s, c) => s + (c.approvedAmount || 0), 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {patientSettlements.length} payment settlements recorded
              </div>
            </div>
          </div>

          {/* Subtabs Filter */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
            {[
              { id: 'all', label: 'Complete Timeline' },
              { id: 'policies', label: `Policies (${patientPolicies.length})` },
              { id: 'verifications', label: `Verifications (${patientVerifications.length})` },
              { id: 'preauths', label: `Pre-Authorizations (${patientPreAuths.length})` },
              { id: 'claims', label: `Claims (${patientClaims.length})` },
              { id: 'settlements', label: `Settlements (${patientSettlements.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeSubTab === tab.id ? 700 : 500,
                  background: activeSubTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  color: activeSubTab === tab.id ? '#2563eb' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  borderBottom: activeSubTab === tab.id ? '2px solid #2563eb' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dossier Chronological Timeline */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Policies */}
              {(activeSubTab === 'all' || activeSubTab === 'policies') && patientPolicies.map(pol => (
                <div key={pol.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Policy Enrollment: {pol.providerName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pol.startDate} to {pol.endDate}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Plan: {pol.planName} | Policy #{pol.policyNumber} | Sum Insured: ₹{pol.sumInsured.toLocaleString()} (Co-Pay: {pol.coPayPercentage}%)
                    </div>
                  </div>
                </div>
              ))}

              {/* Verifications */}
              {(activeSubTab === 'all' || activeSubTab === 'verifications') && patientVerifications.map(ver => (
                <div key={ver.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileCheck size={18} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Policy Eligibility Verification ({ver.status.toUpperCase()})</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ver.verificationDate}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Verified By: {ver.verifiedBy} | Policy #{ver.policyNumber} | Notes: {ver.notes}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pre-Auths */}
              {(activeSubTab === 'all' || activeSubTab === 'preauths') && patientPreAuths.map(pa => (
                <div key={pa.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Pre-Authorization Sanction: {pa.proposedTreatment}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pa.submissionDate}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Requested: ₹{pa.requestedAmount.toLocaleString()} | Approved: ₹{pa.approvedAmount.toLocaleString()} | Status: {pa.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Claims */}
              {(activeSubTab === 'all' || activeSubTab === 'claims') && patientClaims.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Hospital Insurance Claim #{c.claimNumber || c.id}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.submissionDate || c.claimDate || 'Draft'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Total Bill: ₹{(c.totalHospitalBill || 0).toLocaleString()} | Approved: ₹{(c.approvedAmount || 0).toLocaleString()} | Patient Share: ₹{(c.patientPayableAmount || 0).toLocaleString()} | Status: {(c.status || 'draft').toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Settlements */}
              {(activeSubTab === 'all' || activeSubTab === 'settlements') && patientSettlements.map(s => (
                <div key={s.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ReceiptText size={18} />
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Settlement Disbursed: #{s.settlementNumber}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.settlementDate}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Net Disbursed: ₹{s.settledAmount.toLocaleString()} | UTR: {s.paymentReference} | Mode: {s.paymentMode.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Master System Audit Logs */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                  placeholder="Search user, action, reference ID, remarks..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="form-control"
                  style={{ fontSize: '13px' }}
                  value={moduleFilter}
                  onChange={e => setModuleFilter(e.target.value)}
                >
                  <option value="ALL">All Modules</option>
                  <option value="provider">Provider Empanelment</option>
                  <option value="plan">Plan Management</option>
                  <option value="policy">Policy Registration</option>
                  <option value="verification">Eligibility Verification</option>
                  <option value="pre_auth">Pre-Authorization</option>
                  <option value="claim">Claims Processing</option>
                  <option value="document">Claim Documents</option>
                  <option value="settlement">Settlements & Finance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 16px' }}>Date & Time</th>
                    <th style={{ padding: '10px 16px' }}>Staff / User</th>
                    <th style={{ padding: '10px 16px' }}>Module</th>
                    <th style={{ padding: '10px 16px' }}>Action Performed</th>
                    <th style={{ padding: '10px 16px' }}>Reference</th>
                    <th style={{ padding: '10px 16px' }}>Status Transition</th>
                    <th style={{ padding: '10px 16px' }}>Audit Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No audit logs recorded matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>{log.date}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.time}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.userName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{log.userRole}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ textTransform: 'capitalize', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                            {log.module.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.action}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#2563eb' }}>
                          {log.referenceId}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                          {log.previousStatus && (
                            <span style={{ color: 'var(--text-muted)' }}>{log.previousStatus} → </span>
                          )}
                          <span style={{ fontWeight: 600, color: '#059669' }}>{log.newStatus || 'Executed'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                          {log.remarks || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
