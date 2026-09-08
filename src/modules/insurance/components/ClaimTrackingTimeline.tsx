// ============================================================
// ALN Cure HMS — Insurance Claim Tracking & Visual Timeline
// ============================================================

import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  FileText,
  Building2,
  Calendar,
  Send,
  RefreshCw,
  Eye,
  IndianRupee,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import type { InsuranceClaimRecord } from '../../../types/insurance';

export default function ClaimTrackingTimeline() {
  const { claims, providers, selectedClaimId, setSelectedClaimId } = useInsurance();

  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Currently inspected claim
  const currentClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (c.claimNumber || '').toLowerCase().includes(q) ||
      (c.patientName || '').toLowerCase().includes(q) ||
      (c.uhid || '').toLowerCase().includes(q) ||
      (c.providerName || '').toLowerCase().includes(q);

    const matchesProvider = selectedProvider === 'ALL' || c.providerId === selectedProvider;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesDateFrom = !dateFrom || (c.submissionDate && c.submissionDate >= dateFrom);
    const matchesDateTo = !dateTo || (c.submissionDate && c.submissionDate <= dateTo);

    return matchesSearch && matchesProvider && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Milestone Progress Helper
  const getMilestoneSteps = (claim: InsuranceClaimRecord) => {
    const isSubmitted = claim.status !== 'draft';
    const isUnderReview = isSubmitted && claim.status !== 'rejected';
    const isApproved = claim.status === 'approved' || claim.status === 'settled';
    const isSettled = claim.status === 'settled';
    const isRejected = claim.status === 'rejected';

    return [
      { label: 'Claim Created', date: claim.createdAt.split('T')[0], done: true, current: claim.status === 'draft' },
      { label: 'Submitted to Insurer', date: claim.submissionDate, done: isSubmitted, current: claim.status === 'submitted' },
      { label: 'TPA Medical Review', date: claim.submissionDate, done: isUnderReview, current: claim.status === 'under_review' || claim.status === 'additional_info_required' },
      {
        label: isRejected ? 'Claim Rejected' : 'Adjudication Approved',
        date: claim.approvalDate || claim.rejectionDate || 'Pending',
        done: isApproved || isRejected,
        current: claim.status === 'approved' || claim.status === 'rejected',
        error: isRejected
      },
      { label: 'Settlement Disbursed', date: claim.settledDate || 'Pending', done: isSettled, current: isSettled }
    ];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Real-Time Claim Tracking & Milestone Timeline</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Step-by-step audit lifecycle tracking from initial hospital submission to final insurer UTR settlement
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Claim #, UHID, Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
            <option value="ALL">All Insurers ({providers.length})</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.companyName}</option>
            ))}
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({claims.length})</option>
            <option value="settled">Settled</option>
            <option value="approved">Approved</option>
            <option value="submitted">Submitted</option>
            <option value="additional_info_required">Additional Info Required</option>
            <option value="rejected">Rejected</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              className="form-input"
              title="From Date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>to</span>
            <input
              type="date"
              className="form-input"
              title="To Date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Left (Claims List) / Right (Timeline Visualizer) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Column: Claims Navigator */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default)' }}>
            <span className="card-title">Claims Directory ({filtered.length})</span>
          </div>

          <div style={{ maxHeight: '640px', overflowY: 'auto' }}>
            {filtered.map(c => {
              const isSelected = currentClaim?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClaimId(c.id)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-muted)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37,99,235,0.06)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#1e40af', fontSize: '13px' }}>{c.claimNumber}</strong>
                        <span
                          className={`badge ${
                            c.status === 'settled'
                              ? 'badge-success'
                              : c.status === 'approved'
                              ? 'badge-primary'
                              : c.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: '10px' }}
                        >
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {c.patientName} <span style={{ fontSize: '11px', color: '#2563eb' }}>({c.uhid})</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {c.providerName}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>₹{c.claimedAmount.toLocaleString()}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {c.submissionDate}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Claim Timeline Visualizer */}
        {currentClaim ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '22px' }}>
            {/* Header Box */}
            <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>
                    {currentClaim.claimNumber}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {currentClaim.patientName} · {currentClaim.uhid} · Policy: {currentClaim.policyNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Insurer: <strong>{currentClaim.providerName}</strong> (TPA: {currentClaim.tpaName || 'Direct'})
                  </div>
                </div>
                <span
                  className={`badge ${
                    currentClaim.status === 'settled'
                      ? 'badge-success'
                      : currentClaim.status === 'approved'
                      ? 'badge-primary'
                      : currentClaim.status === 'rejected'
                      ? 'badge-danger'
                      : 'badge-warning'
                  }`}
                  style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 10px' }}
                >
                  {currentClaim.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Financial Snapshot Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Total Hospital Bill</div>
                  <strong style={{ fontSize: '13px' }}>₹{currentClaim.totalHospitalBill.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Claimed to Insurer</div>
                  <strong style={{ fontSize: '13px', color: '#2563eb' }}>₹{currentClaim.claimedAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Approved Amount</div>
                  <strong style={{ fontSize: '13px', color: '#059669' }}>₹{currentClaim.approvedAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Patient Share (Co-Pay)</div>
                  <strong style={{ fontSize: '13px', color: '#ea580c' }}>₹{currentClaim.patientPayableAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Adjudication Milestone Progress
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {getMilestoneSteps(currentClaim).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, zIndex: 2 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: step.error ? '#dc2626' : step.done ? '#059669' : '#e2e8f0',
                        color: step.done || step.error ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '12px',
                        boxShadow: step.current ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none'
                      }}
                    >
                      {step.error ? <XCircle size={16} /> : step.done ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)', marginTop: '6px' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{step.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Complete Audit Trail ({currentClaim.timeline?.length || 0} Events)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid var(--border-default)', marginLeft: '12px', paddingLeft: '18px' }}>
                {currentClaim.timeline?.map((evt, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Bullet marker */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: idx === currentClaim.timeline.length - 1 ? '#2563eb' : '#94a3b8'
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{evt.action}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{evt.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        By: <strong>{evt.performedBy}</strong> ({evt.role?.replace(/_/g, ' ')})
                      </div>
                      {evt.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', padding: '6px 10px', background: 'var(--bg-base)', borderRadius: '6px' }}>
                          {evt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Documents Quick Peek */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-muted)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Verified Dossier Attachments ({currentClaim.documents?.length || 0})
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentClaim.documents?.map(d => (
                  <span key={d.id} className="badge badge-neutral" style={{ fontSize: '11px', padding: '4px 8px' }}>
                    <FileText size={11} style={{ marginRight: '4px' }} /> {d.documentName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <Clock size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
            <div>Select a claim from the list to track its milestone timeline.</div>
          </div>
        )}
      </div>
    </div>
  );
}
