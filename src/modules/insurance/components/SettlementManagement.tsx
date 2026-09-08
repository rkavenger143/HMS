// ============================================================
// ALN Cure HMS — Insurance Settlement & UTR Reconciliation
// ============================================================

import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  CreditCard,
  ReceiptText,
  FileCheck,
  Eye,
  IndianRupee,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import type { SettlementRecord, SettlementStatus } from '../../../types/insurance';

export default function SettlementManagement() {
  const { settlements, claims, recordSettlement } = useInsurance();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [settledAmount, setSettledAmount] = useState<number>(105000);
  const [disallowedAmount, setDisallowedAmount] = useState<number>(0);
  const [tdsDeducted, setTdsDeducted] = useState<number>(0);
  const [paymentReference, setPaymentReference] = useState('HDFCN2624098124');
  const [paymentMode, setPaymentMode] = useState<SettlementRecord['paymentMode']>('neft');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Payment disbursed directly to ALN Cure hospital bank account via NEFT.');

  // Approved claims ready for settlement
  const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'settled');

  const filtered = settlements.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.settlementNumber.toLowerCase().includes(q) ||
      s.claimNumber.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      s.paymentReference.toLowerCase().includes(q) ||
      s.providerName.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSettled = settlements.reduce((sum, s) => sum + s.settledAmount, 0);
  const totalDisallowed = settlements.reduce((sum, s) => sum + s.disallowedAmount, 0);

  const handleOpenModal = () => {
    const targetClaim = claims.find(c => c.status === 'approved') || claims[0];
    if (targetClaim) {
      setSelectedClaimId(targetClaim.id);
      setSettledAmount(targetClaim.approvedAmount || targetClaim.claimedAmount);
      setDisallowedAmount(targetClaim.disallowedAmount || 0);
    }
    setPaymentReference(`UTR-${Date.now().toString().slice(-8)}`);
    setSettlementDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleClaimSelect = (cid: string) => {
    setSelectedClaimId(cid);
    const target = claims.find(c => c.id === cid);
    if (target) {
      setSettledAmount(target.approvedAmount || target.claimedAmount);
      setDisallowedAmount(target.disallowedAmount || 0);
    }
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClaim = claims.find(c => c.id === selectedClaimId);
    if (!targetClaim) {
      alert('Please select a valid claim.');
      return;
    }

    const netDisbursed = settledAmount - tdsDeducted;
    const outstanding = Math.max(0, targetClaim.approvedAmount - settledAmount);

    recordSettlement({
      claimId: targetClaim.id,
      claimNumber: targetClaim.claimNumber,
      patientId: targetClaim.patientId,
      patientName: targetClaim.patientName,
      providerName: targetClaim.providerName,
      tpaName: targetClaim.tpaName,
      totalClaimAmount: targetClaim.claimedAmount,
      approvedAmount: targetClaim.approvedAmount,
      settledAmount: Number(settledAmount),
      disallowedAmount: Number(disallowedAmount),
      tdsDeducted: Number(tdsDeducted),
      netDisbursedAmount: netDisbursed,
      settlementDate,
      paymentReference,
      paymentMode,
      status: outstanding === 0 ? 'settled' : 'partially_settled',
      outstandingBalance: outstanding,
      reconciledBy: 'Anita Verma (Accounts & Billing)',
      notes
    });

    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Insurance Settlement & Payment Reconciliation</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Record insurer UTR numbers, NEFT payment advices, TDS deductions, and auto-update hospital accounts ledger
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={15} /> Record Settlement Advice
        </button>
      </div>

      {/* Summary KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Total Settled Amount
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalSettled.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Reconciled across {settlements.length} payment vouchers
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Total Disallowances / Deductions
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            ₹{totalDisallowed.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Non-medical consumables and non-payable schedule items
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Approved Pending Settlement
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
            ₹{claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.approvedAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Awaiting bank credit advice from insurance desk
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Settlement #, Claim #, UTR Reference..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Settlement Statuses</option>
            <option value="settled">Fully Settled</option>
            <option value="partially_settled">Partially Settled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Settlement # & Date</th>
                  <th>Claim # & Patient</th>
                  <th>Insurance Provider</th>
                  <th>Claim Amount</th>
                  <th>Approved Amount</th>
                  <th>Settled (Disbursed)</th>
                  <th>UTR / Payment Ref</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '13px' }}>{s.settlementNumber}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{s.settlementDate}</div>
                    </td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>{s.claimNumber}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>{s.patientName}</div>
                    </td>

                    <td>
                      <strong>{s.providerName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>TPA: {s.tpaName || 'Direct'}</div>
                    </td>

                    <td>₹{s.totalClaimAmount.toLocaleString()}</td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>₹{s.approvedAmount.toLocaleString()}</strong>
                    </td>

                    <td>
                      <strong style={{ color: '#059669', fontSize: '13px' }}>₹{s.settledAmount.toLocaleString()}</strong>
                      {s.disallowedAmount > 0 && (
                        <div style={{ fontSize: '11px', color: '#dc2626' }}>Disallow: ₹{s.disallowedAmount}</div>
                      )}
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                        {s.paymentReference}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {s.paymentMode}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <ReceiptText size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>No settlements recorded</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Record an incoming payment advice to reconcile approved insurance claims.
          </div>
        </div>
      )}

      {/* Modal: Record Settlement */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ReceiptText size={20} color="#059669" />
                <span className="modal-title">Record Insurance Settlement Payment</span>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveSettlement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Approved Claim *</label>
                  <select
                    className="form-select"
                    value={selectedClaimId}
                    onChange={e => handleClaimSelect(e.target.value)}
                  >
                    {approvedClaims.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.claimNumber} — {c.patientName} (Approved: ₹{c.approvedAmount.toLocaleString()} / {c.providerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Settled / Disbursed Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1"
                      value={settledAmount}
                      onChange={e => setSettledAmount(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Disallowed Deductions (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={disallowedAmount}
                      onChange={e => setDisallowedAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">UTR Number / Bank Reference *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. HDFCN2624098124"
                      value={paymentReference}
                      onChange={e => setPaymentReference(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <select
                      className="form-select"
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value as any)}
                    >
                      <option value="neft">NEFT Bank Transfer</option>
                      <option value="rtgs">RTGS Real Time Gross</option>
                      <option value="cheque">Cheque / Demand Draft</option>
                      <option value="online_portal">Online Provider Gateway</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Settlement Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={settlementDate}
                    onChange={e => setSettlementDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reconciliation Audit Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reconcile & Settle Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
