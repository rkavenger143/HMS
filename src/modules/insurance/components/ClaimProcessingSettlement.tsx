// ============================================================
// ALN Cure HMS — Claim Processing & Settlement Console
// ============================================================

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  IndianRupee,
  Search,
  Filter,
  Eye,
  Edit2,
  RefreshCw,
  Send,
  ReceiptText,
  CreditCard,
  Check,
  X,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import type { InsuranceClaimRecord, ClaimStatus, SettlementRecord, SettlementStatus } from '../../../types/insurance';

export default function ClaimProcessingSettlement() {
  const {
    claims,
    settlements,
    updateClaim,
    rejectClaim,
    resubmitClaim,
    recordSettlement,
    providers,
    setActiveTab,
    logAuditAction
  } = useInsurance();

  const [activeView, setActiveView] = useState<'claims_processing' | 'settlements_ledger'>('claims_processing');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');

  // Adjudication Modal State (Approve / Reject)
  const [adjudicatingClaim, setAdjudicatingClaim] = useState<InsuranceClaimRecord | null>(null);
  const [adjudicationAction, setAdjudicationAction] = useState<'approve' | 'reject'>('approve');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approvalNumber, setApprovalNumber] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('Pre-existing condition exclusion clause.');
  const [reviewerNotes, setReviewerNotes] = useState<string>('Sanctioned as per standard TPA tariff schedule.');

  // Settlement Recording Modal State
  const [settlingClaim, setSettlingClaim] = useState<InsuranceClaimRecord | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [tdsDeducted, setTdsDeducted] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<SettlementRecord['paymentMode']>('neft');
  const [settlementDate, setSettlementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [settlementNotes, setSettlementNotes] = useState<string>('NEFT credited to hospital corporate account.');

  // Timeline Inspection Modal
  const [inspectingClaim, setInspectingClaim] = useState<InsuranceClaimRecord | null>(null);

  const filteredClaims = claims.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (c.patientName || '').toLowerCase().includes(q) ||
      (c.uhid || '').toLowerCase().includes(q) ||
      (c.claimNumber || '').toLowerCase().includes(q) ||
      c.policyNumber.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || c.providerId === providerFilter || (c.providerName || c.insuranceProvider || '').includes(providerFilter);
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const filteredSettlements = settlements.filter(s => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.patientName.toLowerCase().includes(q) ||
      s.claimNumber.toLowerCase().includes(q) ||
      s.settlementNumber.toLowerCase().includes(q) ||
      s.paymentReference.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjudicate = (claim: InsuranceClaimRecord, action: 'approve' | 'reject') => {
    setAdjudicatingClaim(claim);
    setAdjudicationAction(action);
    setApprovedAmount(claim.claimedAmount || claim.claimAmount || 0);
    setApprovalNumber(`APPR-${Date.now().toString().slice(-6)}`);
    setRejectionReason('Pre-existing condition clause invoked by TPA.');
    setReviewerNotes(action === 'approve' ? 'Sanctioned in full against submitted clinical vouchers.' : 'Claim repudiated after medical review.');
  };

  const handleSaveAdjudication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjudicatingClaim) return;

    const now = new Date().toISOString().split('T')[0];

    if (adjudicationAction === 'approve') {
      const isPartial = approvedAmount < (adjudicatingClaim.claimedAmount || adjudicatingClaim.claimAmount || 0);
      const newStatus: ClaimStatus = isPartial ? 'partially_approved' : 'approved';
      const patientPayable = Math.max(0, (adjudicatingClaim.totalHospitalBill || 0) - approvedAmount);

      updateClaim(adjudicatingClaim.id, {
        status: newStatus,
        approvedAmount,
        patientPayableAmount: patientPayable,
        approvalDate: now,
        reviewerNotes,
        updatedAt: new Date().toISOString()
      });
      logAuditAction(
        isPartial ? 'Claim Partially Approved' : 'Claim Fully Approved',
        'claim',
        adjudicatingClaim.claimNumber || adjudicatingClaim.id,
        adjudicatingClaim.status,
        newStatus,
        `Approved ₹${approvedAmount.toLocaleString()} (Ref: ${approvalNumber}). ${reviewerNotes}`
      );
    } else {
      rejectClaim(adjudicatingClaim.id, rejectionReason, adjudicatingClaim.claimedAmount || adjudicatingClaim.claimAmount || 0, reviewerNotes);
    }

    setAdjudicatingClaim(null);
  };

  const handleOpenSettlement = (claim: InsuranceClaimRecord) => {
    setSettlingClaim(claim);
    const amountToSettle = claim.approvedAmount || claim.claimedAmount || 0;
    const estTds = Math.round(amountToSettle * 0.1); // 10% TDS default
    setReceivedAmount(amountToSettle - estTds);
    setTdsDeducted(estTds);
    setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
    setSettlementDate(new Date().toISOString().split('T')[0]);
    setSettlementNotes('Payer disbursement credited via online banking.');
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingClaim) return;

    const totalSettled = receivedAmount + tdsDeducted;

    recordSettlement({
      claimId: settlingClaim.id,
      claimNumber: settlingClaim.claimNumber || settlingClaim.id,
      patientId: settlingClaim.patientId,
      patientName: settlingClaim.patientName || 'Patient',
      providerName: settlingClaim.providerName || settlingClaim.insuranceProvider || 'Payer',
      tpaName: settlingClaim.tpaName,
      totalClaimAmount: settlingClaim.claimedAmount || settlingClaim.claimAmount || 0,
      approvedAmount: settlingClaim.approvedAmount || 0,
      settledAmount: totalSettled,
      receivedAmount,
      disallowedAmount: Math.max(0, (settlingClaim.claimedAmount || 0) - (settlingClaim.approvedAmount || 0)),
      tdsDeducted,
      netDisbursedAmount: receivedAmount,
      settlementDate,
      paymentReference: paymentRef,
      paymentMode,
      status: 'settled',
      outstandingBalance: 0,
      reconciledBy: 'Accounts & Billing Desk',
      notes: settlementNotes
    });

    setSettlingClaim(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with View Toggle */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Claim Processing, Adjudication & Settlement Console
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Monitor insurer review, adjudicate claim approvals/rejections, and reconcile settlement payments with UTR tracking.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveView('claims_processing')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeView === 'claims_processing' ? '#2563eb' : 'transparent',
              color: activeView === 'claims_processing' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Claims Queue ({claims.length})
          </button>
          <button
            onClick={() => setActiveView('settlements_ledger')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeView === 'settlements_ledger' ? '#2563eb' : 'transparent',
              color: activeView === 'settlements_ledger' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Settlements Ledger ({settlements.length})
          </button>
        </div>
      </div>

      {/* Financial Pulse Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Under Review / Submitted</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
            {claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length} Claims
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Awaiting payer adjudication
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Approved Awaiting Settlement</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
            ₹{claims.filter(c => c.status === 'approved' || c.status === 'partially_approved').reduce((s, c) => s + (c.approvedAmount || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {claims.filter(c => c.status === 'approved' || c.status === 'partially_approved').length} claims ready for payment
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Settled Disbursements</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
            ₹{settlements.reduce((s, setl) => s + setl.settledAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Reconciled across {settlements.length} transactions
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Repudiated / Rejected</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
            {claims.filter(c => c.status === 'rejected').length} Claims
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Disallowed with reasons
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Search claim #, patient, UHID, UTR..."
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
              <option value="ALL">All Providers ({providers.length})</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-control"
              style={{ fontSize: '13px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Processing Statuses</option>
              <option value="submitted">Submitted to Insurer</option>
              <option value="under_review">Under Insurer Review</option>
              <option value="approved">Approved</option>
              <option value="partially_approved">Partially Approved</option>
              <option value="rejected">Rejected</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* View 1: Claims Processing Table */}
      {activeView === 'claims_processing' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Claim # & Date</th>
                  <th style={{ padding: '10px 16px' }}>Patient</th>
                  <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                  <th style={{ padding: '10px 16px' }}>Claimed Amount</th>
                  <th style={{ padding: '10px 16px' }}>Approved Amount</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No claims found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(c => {
                    const isApproved = c.status === 'approved' || c.status === 'partially_approved';
                    const isSettled = c.status === 'settled';
                    const isRejected = c.status === 'rejected';
                    const isPendingAdjudication = c.status === 'submitted' || c.status === 'under_review' || c.status === 'draft' || c.status === 'ready_for_submission';

                    return (
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
                          ₹{(c.claimedAmount || c.claimAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.approvedAmount !== undefined ? (
                            <span style={{ fontWeight: 700, color: '#059669' }}>
                              ₹{c.approvedAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: isSettled
                                ? 'rgba(124,58,237,0.12)'
                                : isApproved
                                ? 'rgba(16,185,129,0.12)'
                                : isRejected
                                ? 'rgba(239,68,68,0.12)'
                                : 'rgba(37,99,235,0.12)',
                              color: isSettled
                                ? '#7c3aed'
                                : isApproved
                                ? '#059669'
                                : isRejected
                                ? '#dc2626'
                                : '#2563eb'
                            }}
                          >
                            {(c.status || 'draft').replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setInspectingClaim(c)}
                              className="btn btn-secondary btn-sm"
                              title="View Status Timeline & Audit"
                              style={{ padding: '4px 8px' }}
                            >
                              <Eye size={13} />
                            </button>

                            {/* Action 1: Adjudicate (Approve / Reject) */}
                            {isPendingAdjudication && (
                              <>
                                <button
                                  onClick={() => handleOpenAdjudicate(c, 'approve')}
                                  className="btn btn-secondary btn-sm"
                                  title="Record Insurer Approval"
                                  style={{ padding: '4px 8px', color: '#059669' }}
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => handleOpenAdjudicate(c, 'reject')}
                                  className="btn btn-secondary btn-sm"
                                  title="Record Insurer Rejection"
                                  style={{ padding: '4px 8px', color: '#dc2626' }}
                                >
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}

                            {/* Action 2: Settle Payment */}
                            {isApproved && !isSettled && (
                              <button
                                onClick={() => handleOpenSettlement(c)}
                                className="btn btn-primary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11px' }}
                              >
                                <ReceiptText size={12} /> Settle Payment
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Settlements Ledger Table */
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Settlement # & Date</th>
                  <th style={{ padding: '10px 16px' }}>Claim #</th>
                  <th style={{ padding: '10px 16px' }}>Patient</th>
                  <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                  <th style={{ padding: '10px 16px' }}>Disbursed Amount</th>
                  <th style={{ padding: '10px 16px' }}>TDS Accounted</th>
                  <th style={{ padding: '10px 16px' }}>UTR / Reference</th>
                  <th style={{ padding: '10px 16px' }}>Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No settlement records found.
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.settlementNumber}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.settlementDate}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>
                        #{s.claimNumber}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{s.patientName}</td>
                      <td style={{ padding: '12px 16px' }}>{s.providerName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>
                        ₹{s.settledAmount.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#d97706', fontWeight: 600 }}>
                        ₹{(s.tdsDeducted || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {s.paymentReference}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                          {s.paymentMode}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Adjudication Form (Approve / Reject) */}
      {adjudicatingClaim && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {adjudicationAction === 'approve' ? (
                  <>
                    <CheckCircle2 color="#059669" size={20} /> Record Payer Approval: #{adjudicatingClaim.claimNumber}
                  </>
                ) : (
                  <>
                    <XCircle color="#dc2626" size={20} /> Record Payer Rejection: #{adjudicatingClaim.claimNumber}
                  </>
                )}
              </h3>
              <button className="close-btn" onClick={() => setAdjudicatingClaim(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjudication}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Patient: <strong>{adjudicatingClaim.patientName}</strong> ({adjudicatingClaim.uhid})</div>
                  <div>Payer: <strong>{adjudicatingClaim.providerName || adjudicatingClaim.insuranceProvider}</strong></div>
                  <div>Claimed Amount: <strong>₹{(adjudicatingClaim.claimedAmount || adjudicatingClaim.claimAmount || 0).toLocaleString()}</strong></div>
                </div>

                {adjudicationAction === 'approve' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Approved Coverage Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={approvedAmount}
                        onChange={e => setApprovedAmount(Number(e.target.value))}
                        max={adjudicatingClaim.claimedAmount || adjudicatingClaim.claimAmount || 0}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Approval Reference / Authorization Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={approvalNumber}
                        onChange={e => setApprovalNumber(e.target.value)}
                        placeholder="e.g. APPR-STAR-882190"
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Official Rejection Reason *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Specify the clause or rationale provided by the insurance TPA..."
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Reviewer Remarks / Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={reviewerNotes}
                    onChange={e => setReviewerNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAdjudicatingClaim(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: adjudicationAction === 'approve' ? '#059669' : '#dc2626',
                    borderColor: adjudicationAction === 'approve' ? '#059669' : '#dc2626'
                  }}
                >
                  {adjudicationAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Settlement Form */}
      {settlingClaim && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ReceiptText color="#2563eb" size={20} /> Record Insurance Payment Settlement
              </h3>
              <button className="close-btn" onClick={() => setSettlingClaim(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettlement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Claim: <strong>#{settlingClaim.claimNumber || settlingClaim.id}</strong> — {settlingClaim.patientName}</div>
                  <div>Approved Amount: <strong style={{ color: '#059669' }}>₹{(settlingClaim.approvedAmount || 0).toLocaleString()}</strong></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Received Credit Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={receivedAmount}
                      onChange={e => setReceivedAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>TDS Deducted (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={tdsDeducted}
                      onChange={e => setTdsDeducted(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Reference / UTR No. *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value)}
                      placeholder="e.g. UTR-HDFC-992182"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Mode</label>
                    <select
                      className="form-control"
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value as any)}
                    >
                      <option value="neft">NEFT Transfer</option>
                      <option value="rtgs">RTGS</option>
                      <option value="cheque">Cheque</option>
                      <option value="online_portal">Direct Payer Portal</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Settlement Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={settlementDate}
                    onChange={e => setSettlementDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Settlement Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={settlementNotes}
                    onChange={e => setSettlementNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSettlingClaim(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Complete Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Timeline & Audit Inspector */}
      {inspectingClaim && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                Claim Audit Timeline: #{inspectingClaim.claimNumber || inspectingClaim.id}
              </h3>
              <button className="close-btn" onClick={() => setInspectingClaim(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                <div>Patient: <strong>{inspectingClaim.patientName}</strong> | Payer: <strong>{inspectingClaim.providerName || inspectingClaim.insuranceProvider}</strong></div>
                <div>Status: <strong style={{ textTransform: 'uppercase', color: '#2563eb' }}>{inspectingClaim.status}</strong></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(inspectingClaim.timeline || []).map(tl => (
                  <div key={tl.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700 }}>
                      ✓
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{tl.action}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{tl.timestamp}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        By {tl.performedBy} ({tl.role})
                      </div>
                      {tl.notes && (
                        <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                          "{tl.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setInspectingClaim(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
