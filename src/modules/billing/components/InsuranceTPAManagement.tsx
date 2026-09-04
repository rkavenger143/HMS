import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Filter, CheckCircle2, Clock, DollarSign, Building2 } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import type { CentralClaimStatus } from '../../../types';

export default function InsuranceTPAManagement() {
  const { insuranceClaims, invoices, submitInsuranceClaim, updateClaimStatus } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || 'inv-1');
  const [insuranceProvider, setInsuranceProvider] = useState('Star Health & Allied Insurance');
  const [policyNumber, setPolicyNumber] = useState('SH-IND-2026-981241');
  const [tpaName, setTpaName] = useState('Medi Assist TPA Pvt Ltd');
  const [claimAmount, setClaimAmount] = useState(15000);
  const [approvedAmount, setApprovedAmount] = useState(12500);
  const [coPayAmount, setCoPayAmount] = useState(2500);

  const totalApprovedClaims = insuranceClaims.reduce((sum, c) => sum + c.approvedAmount, 0);

  const filtered = insuranceClaims.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.claimNumber.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.insuranceProvider.toLowerCase().includes(q) ||
      c.policyNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];

    submitInsuranceClaim({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      invoiceId,
      insuranceProvider,
      policyNumber,
      tpaName,
      claimAmount: Number(claimAmount),
      approvedAmount: Number(approvedAmount),
      coPayAmount: Number(coPayAmount),
      status: 'approved',
      submittedDate: new Date().toISOString().slice(0, 10),
      settledDate: new Date().toISOString().slice(0, 10),
    });

    alert('Insurance pre-authorization claim submitted successfully.');
    setShowNewModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(10,132,255,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Insurance / TPA Cashless Claims & Corporate Billing</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Third-Party Administrator (TPA) cashless pre-authorization, policy verification, and claim settlement tracking
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Approved Claims:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>₹{totalApprovedClaims.toLocaleString()}</strong>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowNewModal(true)}>
            <Plus size={13} /> Submit Pre-Auth Claim
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Claim #, Patient, Insurer, Policy #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Claim Statuses ({insuranceClaims.length})</option>
            <option value="approved">Approved & Pre-Authorized</option>
            <option value="submitted">Submitted (Under Review)</option>
            <option value="settled">Settled / Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Insurance Provider & TPA</th>
                  <th>Policy Number</th>
                  <th>Claim Amount (₹)</th>
                  <th>Approved Amount (₹)</th>
                  <th>Co-Pay (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{c.claimNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.submittedDate}</div>
                    </td>

                    <td>
                      <strong>{c.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.patientId}</div>
                    </td>

                    <td>
                      <strong>{c.insuranceProvider}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>TPA: {c.tpaName || 'Direct'}</div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{c.policyNumber}</span>
                    </td>

                    <td>
                      <div>₹{c.claimAmount.toLocaleString()}</div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-success)', fontSize: 14 }}>
                        ₹{c.approvedAmount.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <div>₹{c.coPayAmount.toLocaleString()}</div>
                    </td>

                    <td>
                      <span className={`badge ${c.status === 'approved' || c.status === 'settled' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {c.status === 'approved' && (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => updateClaimStatus(c.id, 'settled')}
                        >
                          <CheckCircle2 size={11} /> Mark Settled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Pre-Auth Claim Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Submit Insurance / TPA Pre-Authorization Claim</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowNewModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveClaim}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Select Patient <span className="required">*</span></label>
                    <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                      {DEMO_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} — {p.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Insurance Provider <span className="required">*</span></label>
                    <select className="form-select" value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)}>
                      <option value="Star Health & Allied Insurance">Star Health & Allied Insurance</option>
                      <option value="HDFC ERGO General Insurance">HDFC ERGO General Insurance</option>
                      <option value="Care Health Insurance">Care Health Insurance (Religare)</option>
                      <option value="ICICI Lombard General Insurance">ICICI Lombard General Insurance</option>
                      <option value="Max Bupa / Niva Bupa Health Insurance">Max Bupa / Niva Bupa Health Insurance</option>
                      <option value="Tata AIG General Insurance">Tata AIG General Insurance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Third Party Administrator (TPA)</label>
                    <input type="text" className="form-input" value={tpaName} onChange={e => setTpaName(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Policy Number <span className="required">*</span></label>
                    <input type="text" className="form-input" value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Claim Requisition (₹) <span className="required">*</span></label>
                    <input type="number" min="1" className="form-input" value={claimAmount} onChange={e => setClaimAmount(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pre-Auth Approved Amount (₹)</label>
                    <input type="number" min="0" className="form-input" value={approvedAmount} onChange={e => setApprovedAmount(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient Co-Pay Obligation (₹)</label>
                    <input type="number" min="0" className="form-input" value={coPayAmount} onChange={e => setCoPayAmount(Number(e.target.value))} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Submit Pre-Auth Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
