// ============================================================
// ALN Cure HMS — Insurance Policy Verification Module
// ============================================================

import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Building2,
  Check,
  X,
  Eye,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import type { PatientInsurancePolicy, PolicyStatus } from '../../../types/insurance';

export default function PolicyVerification() {
  const { policies, updatePolicy, verifyPolicy, expirePolicy, setActiveTab } = useInsurance();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<PatientInsurancePolicy | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifierNotes, setVerifierNotes] = useState('Confirmed active policy validity and coverage benefits with insurer TPA portal.');
  const [newStatus, setNewStatus] = useState<PolicyStatus>('active');

  const filtered = policies.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.patientName.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.policyNumber.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenVerify = (p: PatientInsurancePolicy) => {
    setSelectedPolicy(p);
    setNewStatus('active');
    setVerifierNotes(`Policy verified for ${p.patientName} (${p.providerName}) with available coverage of ₹${p.sumInsured.toLocaleString()}.`);
    setShowVerifyModal(true);
  };

  const handleConfirmVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    if (newStatus === 'active') {
      verifyPolicy(selectedPolicy.id, 'Insurance Verification Desk', verifierNotes);
    } else {
      updatePolicy(selectedPolicy.id, {
        status: newStatus,
        verificationNotes: verifierNotes
      });
    }

    setShowVerifyModal(false);
    setSelectedPolicy(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Insurance Policy Verification & Validity Registry</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Verify policy number, patient eligibility, coverage availability, sum insured validity, and expiry status
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patient-policies')}>
          + Link New Patient Policy
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Policy #, UHID, Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Verification Statuses ({policies.length})</option>
            <option value="active">Verified & Active</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended / Invalid</option>
          </select>
        </div>
      </div>

      {/* Policies Verification Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient & UHID</th>
                <th>Insurance Provider</th>
                <th>Policy & Member ID</th>
                <th>Sum Insured & Remaining</th>
                <th>Validity Period</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isExpired = new Date(p.endDate) < new Date();
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.patientName}</div>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>{p.uhid}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.providerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.tpaName || 'Direct Cashless'}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>{p.policyNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Member ID: {p.memberId}</div>
                    </td>
                    <td>
                      <div>Sum Insured: <strong>₹{p.sumInsured.toLocaleString()}</strong></div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        Remaining: ₹{p.remainingCoverage.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{p.startDate} to {p.endDate}</div>
                      {isExpired && (
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>⚠ Expired</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'pending_verification' ? 'badge-warning' : 'badge-danger'}`}>
                        {p.status === 'active' ? 'VERIFIED' : p.status === 'pending_verification' ? 'PENDING' : p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenVerify(p)}
                        >
                          <UserCheck size={12} /> Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    No policies found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Adjudication Modal */}
      {showVerifyModal && selectedPolicy && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={20} color="#2563eb" />
                <span className="modal-title">Verify Policy: {selectedPolicy.policyNumber}</span>
              </div>
              <button className="btn-icon" onClick={() => setShowVerifyModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmVerify}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '12px' }}>
                  <div><strong>Patient:</strong> {selectedPolicy.patientName} ({selectedPolicy.uhid})</div>
                  <div><strong>Provider:</strong> {selectedPolicy.providerName}</div>
                  <div><strong>Plan:</strong> {selectedPolicy.planName} · Sum Insured: ₹{selectedPolicy.sumInsured.toLocaleString()}</div>
                  <div><strong>Valid Until:</strong> {selectedPolicy.endDate}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Verification Outcome *</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as PolicyStatus)}
                  >
                    <option value="active">Verified & Valid (Active)</option>
                    <option value="pending_verification">Pending Further Documents</option>
                    <option value="expired">Expired Policy</option>
                    <option value="suspended">Invalid / Suspended Policy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Verification Notes & Remarks *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    required
                    value={verifierNotes}
                    onChange={e => setVerifierNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
