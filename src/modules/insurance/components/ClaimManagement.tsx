// ============================================================
// ALN Cure HMS — Insurance Claim Creation & Document Management
// ============================================================

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Eye,
  Edit2,
  Send,
  FileCheck,
  Paperclip,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS, DEMO_ADMISSIONS, DEMO_BILLS } from '../../../data/seedData';
import type { InsuranceClaimRecord, ClaimStatus, ClaimDocument } from '../../../types/insurance';

export default function ClaimManagement() {
  const {
    claims,
    policies,
    preAuthRequests,
    createClaim,
    updateClaim,
    submitClaim,
    uploadClaimDocument,
    verifyClaimDocument,
    rejectClaim,
    resubmitClaim,
    setSelectedClaimId,
    setActiveTab
  } = useInsurance();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [activeClaim, setActiveClaim] = useState<InsuranceClaimRecord | null>(null);

  // Create Form State
  const [newPatientId, setNewPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [claimType, setClaimType] = useState<'cashless' | 'reimbursement'>('cashless');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentDetails, setTreatmentDetails] = useState('');
  const [totalHospitalBill, setTotalHospitalBill] = useState(135000);
  const [claimedAmount, setClaimedAmount] = useState(110000);

  // Document Upload State
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<ClaimDocument['documentType']>('discharge_summary');

  // Rejection & Resubmission States
  const [rejectionReason, setRejectionReason] = useState('Missing detailed surgical operative notes and consumable breakdown');
  const [rejectedAmount, setRejectedAmount] = useState(0);
  const [correctionNotes, setCorrectionNotes] = useState('Attached detailed surgeon operative chart with implant barcodes.');

  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.claimNumber.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.uhid.toLowerCase().includes(q) ||
      c.providerName.toLowerCase().includes(q) ||
      c.policyNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || c.claimType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenCreate = () => {
    const pt = DEMO_PATIENTS[0];
    const preAuth = preAuthRequests.find(pa => pa.patientId === pt.id);

    setNewPatientId(pt.id);
    setClaimType('cashless');
    setDiagnosis(preAuth?.diagnosis || 'Coronary Artery Disease with Angina');
    setTreatmentDetails(preAuth?.proposedTreatment || 'Coronary Angiography + PTCA Stenting');
    setTotalHospitalBill(preAuth?.estimatedCost || 135000);
    setClaimedAmount(preAuth?.approvedAmount || preAuth?.requestedAmount || 110000);
    setShowCreateModal(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = DEMO_PATIENTS.find(p => p.id === newPatientId) || DEMO_PATIENTS[0];
    const policy = policies.find(p => p.patientId === newPatientId) || policies[0];
    const preAuth = preAuthRequests.find(pa => pa.patientId === newPatientId);

    const copayPct = policy.coPayPercentage || 10;
    const copayVal = Math.round((claimedAmount * copayPct) / 100);
    const patientPay = Math.max(0, totalHospitalBill - claimedAmount + copayVal);

    createClaim({
      claimType,
      patientId: pt.id,
      patientName: `${pt.firstName} ${pt.lastName}`,
      uhid: pt.id,
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      providerId: policy.providerId,
      providerName: policy.providerName,
      tpaName: policy.tpaName,
      memberId: policy.memberId,
      preAuthId: preAuth?.id,
      preAuthNumber: preAuth?.requestNumber,
      admissionId: 'adm-001',
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: new Date().toISOString().split('T')[0],
      diagnosis,
      treatmentDetails,
      totalHospitalBill: Number(totalHospitalBill),
      claimedAmount: Number(claimedAmount),
      approvedAmount: Number(claimedAmount),
      coPayAmount: copayVal,
      deductibleAmount: policy.deductible || 0,
      patientPayableAmount: patientPay,
      pendingInsuranceAmount: Number(claimedAmount),
      settledAmount: 0,
      disallowedAmount: 0,
      status: 'draft',
      submissionDate: new Date().toISOString().split('T')[0],
      documents: [
        { id: `DOC-${Date.now()}-1`, documentName: `Discharge Summary - ${pt.firstName}.pdf`, documentType: 'discharge_summary', uploadDate: new Date().toISOString().split('T')[0], uploadedBy: 'Attending Doctor', status: 'verified' },
        { id: `DOC-${Date.now()}-2`, documentName: 'Itemized Hospital Final Bill.pdf', documentType: 'final_hospital_bill', uploadDate: new Date().toISOString().split('T')[0], uploadedBy: 'Billing Desk', status: 'verified' },
        { id: `DOC-${Date.now()}-3`, documentName: 'Patient Insurance Health Card.pdf', documentType: 'insurance_card', uploadDate: new Date().toISOString().split('T')[0], uploadedBy: 'Insurance Coordinator', status: 'verified' }
      ]
    });

    setShowCreateModal(false);
  };

  const handleOpenDocs = (c: InsuranceClaimRecord) => {
    setActiveClaim(c);
    setDocName('');
    setDocType('lab_report');
    setShowDocsModal(true);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim || !docName) return;

    uploadClaimDocument(activeClaim.id, {
      documentName: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      documentType: docType,
      uploadedBy: 'Insurance Staff',
      status: 'verified'
    });

    setDocName('');
    setShowDocsModal(false);
  };

  const handleOpenReject = (c: InsuranceClaimRecord) => {
    setActiveClaim(c);
    setRejectedAmount(c.claimedAmount);
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    rejectClaim(activeClaim.id, rejectionReason, Number(rejectedAmount));
    setShowRejectModal(false);
  };

  const handleOpenResubmit = (c: InsuranceClaimRecord) => {
    setActiveClaim(c);
    setShowResubmitModal(true);
  };

  const handleConfirmResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    resubmitClaim(activeClaim.id, correctionNotes);
    setShowResubmitModal(false);
  };

  const handleTrackTimeline = (c: InsuranceClaimRecord) => {
    setSelectedClaimId(c.id);
    setActiveTab('tracking');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Insurance Claim Management & Dossier Compilation</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Combine final hospital bills, discharge summaries, mandatory claim documents, and submit to insurers
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={15} /> Generate New Claim
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
              placeholder="Search Claim #, UHID, Insurer, Policy #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Claim Statuses ({claims.length})</option>
            <option value="draft">Draft Claims</option>
            <option value="submitted">Submitted (Under Review)</option>
            <option value="additional_info_required">Additional Info Required / Resubmitted</option>
            <option value="approved">Approved</option>
            <option value="settled">Settled & Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="ALL">All Claim Types</option>
            <option value="cashless">Cashless Settlement</option>
            <option value="reimbursement">Patient Reimbursement</option>
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
                  <th>Claim # & Type</th>
                  <th>Patient & UHID</th>
                  <th>Insurance Provider</th>
                  <th>Total Hospital Bill</th>
                  <th>Claimed Amount</th>
                  <th>Approved Amount</th>
                  <th>Co-Pay / Patient Share</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ color: '#1e40af', fontSize: '13px' }}>{c.claimNumber}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{c.submissionDate}</div>
                      <span
                        className="badge"
                        style={{
                          fontSize: '10px',
                          marginTop: '2px',
                          background: c.claimType === 'cashless' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)',
                          color: c.claimType === 'cashless' ? '#2563eb' : '#059669'
                        }}
                      >
                        {c.claimType.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.patientName}</strong>
                      <div style={{ fontSize: '11px', color: '#2563eb' }}>{c.uhid}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Pol: {c.policyNumber}</div>
                    </td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>{c.providerName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>TPA: {c.tpaName || 'Direct'}</div>
                    </td>

                    <td>
                      <strong>₹{c.totalHospitalBill.toLocaleString()}</strong>
                    </td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>₹{c.claimedAmount.toLocaleString()}</strong>
                    </td>

                    <td>
                      <strong style={{ color: c.approvedAmount > 0 ? '#059669' : 'var(--text-tertiary)' }}>
                        ₹{c.approvedAmount.toLocaleString()}
                      </strong>
                      {c.disallowedAmount > 0 && (
                        <div style={{ fontSize: '11px', color: '#dc2626' }}>
                          -₹{c.disallowedAmount.toLocaleString()} disallow
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#ea580c' }}>
                        ₹{c.patientPayableAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Co-pay: ₹{c.coPayAmount}</div>
                    </td>

                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                        onClick={() => handleOpenDocs(c)}
                        title="Manage Attached Documents"
                      >
                        <Paperclip size={11} /> {c.documents.length} Docs
                      </button>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          c.status === 'settled'
                            ? 'badge-success'
                            : c.status === 'approved'
                            ? 'badge-primary'
                            : c.status === 'submitted' || c.status === 'under_review'
                            ? 'badge-warning'
                            : c.status === 'additional_info_required'
                            ? 'badge-warning'
                            : c.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {c.status === 'draft' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => submitClaim(c.id)}
                            title="Submit to Insurer"
                          >
                            <Send size={12} /> Submit
                          </button>
                        )}
                        {c.status === 'rejected' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOpenResubmit(c)}
                            title="Resubmit with Corrections"
                          >
                            <RefreshCw size={12} /> Resubmit
                          </button>
                        )}
                        {c.status === 'submitted' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleOpenReject(c)}
                            title="Record Rejection / Denial"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleTrackTimeline(c)}
                          title="Track Timeline & Milestones"
                        >
                          <Eye size={12} /> Track
                        </button>
                      </div>
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
          <FileText size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>No insurance claims found</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Click "Generate New Claim" to create a claim dossier from hospital bills and services.
          </div>
        </div>
      )}

      {/* Modal 1: Generate New Claim */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#2563eb" />
                <span className="modal-title">Generate Insurance Claim Dossier</span>
              </div>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Patient (UHID) *</label>
                    <select
                      className="form-select"
                      value={newPatientId}
                      onChange={e => setNewPatientId(e.target.value)}
                    >
                      {DEMO_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Claim Type *</label>
                    <select
                      className="form-select"
                      value={claimType}
                      onChange={e => setClaimType(e.target.value as any)}
                    >
                      <option value="cashless">Cashless Hospitalization</option>
                      <option value="reimbursement">Patient Reimbursement</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Final Diagnosis *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Coronary Artery Disease / Double Vessel CAD"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Treatment & Procedure Performed *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. PTCA Stenting with 1 DES Stent + 3 Days CCU Care"
                    value={treatmentDetails}
                    onChange={e => setTreatmentDetails(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Total Hospital Final Bill (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1000"
                      value={totalHospitalBill}
                      onChange={e => setTotalHospitalBill(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Claimed Amount to Insurer (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1000"
                      value={claimedAmount}
                      onChange={e => setClaimedAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="#059669" style={{ display: 'inline', marginRight: '6px' }} />
                  Automated checklist: Discharge summary, itemized pharmacy/lab receipts, and pre-auth certificate will be auto-attached.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Claim Dossier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Claim Document Management */}
      {showDocsModal && activeClaim && (
        <div className="modal-overlay" onClick={() => setShowDocsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Paperclip size={20} color="#2563eb" />
                <span className="modal-title">Supporting Documents: {activeClaim.claimNumber}</span>
              </div>
              <button className="btn-icon" onClick={() => setShowDocsModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Existing Documents List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Missing Standard Documents Checker */}
                {(() => {
                  const standardTypes: { type: ClaimDocument['documentType']; label: string }[] = [
                    { type: 'final_hospital_bill', label: 'Final Hospital Bill' },
                    { type: 'discharge_summary', label: 'Discharge Summary' },
                    { type: 'doctor_prescription', label: 'Doctor Prescription & Treatment Sheet' },
                    { type: 'insurance_card', label: 'Insurance Card / TPA Card' },
                    { type: 'id_proof', label: 'Patient Identification Proof (Aadhaar / Voter ID)' },
                    { type: 'lab_report', label: 'Diagnostic Laboratory Reports' },
                    { type: 'pre_auth_letter', label: 'Pre-Authorization Sanction Letter' }
                  ];
                  const attachedTypes = new Set(activeClaim.documents.map(d => d.documentType));
                  const missingList = standardTypes.filter(st => !attachedTypes.has(st.type));

                  return (
                    <div>
                      {missingList.length > 0 ? (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.2)', marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} /> Missing Required Claim Documents ({missingList.length})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {missingList.map((m, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  background: '#ffffff',
                                  border: '1px solid #fdba74',
                                  color: '#9a3412',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setDocType(m.type);
                                  setDocName(m.label);
                                }}
                                title="Click to pre-fill upload form"
                              >
                                + {m.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                          <CheckCircle2 size={14} /> All standard required claim documents have been attached and verified!
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Attached Documents Checklist ({activeClaim.documents.length})
                </div>
                {activeClaim.documents.map(d => (
                  <div
                    key={d.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-base)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border-muted)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.documentName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Type: {d.documentType.replace(/_/g, ' ')} · Uploaded: {d.uploadDate} by {d.uploadedBy}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', height: '28px', padding: '2px 8px' }}
                        value={d.status}
                        onChange={e => verifyClaimDocument(activeClaim.id, d.id, e.target.value as any)}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <span className={`badge ${d.status === 'verified' ? 'badge-success' : d.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Document Form */}
              <form onSubmit={handleUploadDoc} style={{ padding: '14px', borderRadius: '8px', border: '1px dashed #2563eb', background: 'rgba(37,99,235,0.03)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', marginBottom: '10px' }}>
                  + Upload Additional Medical / Diagnostic Document
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Document Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Operative Notes Barcode"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select
                      className="form-select"
                      value={docType}
                      onChange={e => setDocType(e.target.value as any)}
                    >
                      <option value="discharge_summary">Discharge Summary</option>
                      <option value="final_hospital_bill">Final Hospital Bill</option>
                      <option value="doctor_prescription">Doctor Prescription / Notes</option>
                      <option value="lab_report">Laboratory Test Report</option>
                      <option value="radiology_report">Radiology / Imaging Study</option>
                      <option value="insurance_card">Insurance Card / ID Proof</option>
                      <option value="pre_auth_letter">Pre-Auth Approval Letter</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                  <Upload size={13} /> Add Document to Dossier
                </button>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDocsModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Record Rejection */}
      {showRejectModal && activeClaim && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={20} color="#dc2626" />
                <span className="modal-title">Record Claim Rejection / Denial</span>
              </div>
              <button className="btn-icon" onClick={() => setShowRejectModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                  <div><strong>Claim:</strong> {activeClaim.claimNumber} ({activeClaim.patientName})</div>
                  <div><strong>Claimed Amount:</strong> ₹{activeClaim.claimedAmount.toLocaleString()}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Insurer Rejection Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    required
                    placeholder="Enter explicit reason provided by TPA / Insurer adjudicator..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rejected Disallowed Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    value={rejectedAmount}
                    onChange={e => setRejectedAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Claim Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Resubmit Claim */}
      {showResubmitModal && activeClaim && (
        <div className="modal-overlay" onClick={() => setShowResubmitModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={20} color="#d97706" />
                <span className="modal-title">Resubmit Corrected Claim: {activeClaim.claimNumber}</span>
              </div>
              <button className="btn-icon" onClick={() => setShowResubmitModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmResubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ color: '#dc2626', fontWeight: 700 }}>Previous Rejection Reason:</div>
                  <div style={{ marginTop: '2px', fontSize: '12px' }}>{activeClaim.rejectionReason}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Corrections & Rebuttal Notes *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    required
                    placeholder="Describe how the rejection queries were addressed (e.g. attached additional clinical charts)..."
                    value={correctionNotes}
                    onChange={e => setCorrectionNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Resubmission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
