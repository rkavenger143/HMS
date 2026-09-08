// ============================================================
// ALN Cure HMS — Pre-Authorization & Cashless Approval Management
// ============================================================

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Edit2,
  Printer,
  ShieldCheck,
  Stethoscope,
  IndianRupee,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';
import type { PreAuthRequest, PreAuthStatus } from '../../../types/insurance';

export default function PreAuthorizationManagement() {
  const { preAuthRequests, policies, createPreAuth, adjudicatePreAuth, setActiveTab } = useInsurance();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdjudicateModal, setShowAdjudicateModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PreAuthRequest | null>(null);

  // Form State for new Pre-Auth
  const [newPatientId, setNewPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [newDoctorId, setNewDoctorId] = useState(DEMO_DOCTORS[0]?.id || 'doc-1');
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [proposedTreatment, setProposedTreatment] = useState('');
  const [treatmentType, setTreatmentType] = useState<PreAuthRequest['treatmentType']>('surgical');
  const [estimatedCost, setEstimatedCost] = useState(120000);
  const [requestedAmount, setRequestedAmount] = useState(100000);

  // Form State for Adjudication (Approval/Rejection)
  const [adjStatus, setAdjStatus] = useState<PreAuthStatus>('approved');
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [approvalNumber, setApprovalNumber] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [approvedServicesText, setApprovedServicesText] = useState('');
  const [rejectedServicesText, setRejectedServicesText] = useState('');

  const filtered = preAuthRequests.filter(pa => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      pa.requestNumber.toLowerCase().includes(q) ||
      pa.patientName.toLowerCase().includes(q) ||
      pa.uhid.toLowerCase().includes(q) ||
      pa.diagnosis.toLowerCase().includes(q) ||
      pa.providerName.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || pa.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    const defaultPatient = DEMO_PATIENTS[0];
    const defaultDoc = DEMO_DOCTORS[0];
    setNewPatientId(defaultPatient.id);
    setNewDoctorId(defaultDoc.id);
    setDiagnosis('Coronary Artery Disease with Angina');
    setIcdCode('I20.0');
    setProposedTreatment('Coronary Angiography + PTCA Stenting');
    setTreatmentType('surgical');
    setEstimatedCost(140000);
    setRequestedAmount(120000);
    setShowCreateModal(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = DEMO_PATIENTS.find(p => p.id === newPatientId) || DEMO_PATIENTS[0];
    const doc = DEMO_DOCTORS.find(d => d.id === newDoctorId) || DEMO_DOCTORS[0];
    const policy = policies.find(p => p.patientId === newPatientId) || policies[0];

    createPreAuth({
      patientId: pt.id,
      patientName: `${pt.firstName} ${pt.lastName}`,
      uhid: pt.id,
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      providerId: policy.providerId,
      providerName: policy.providerName,
      tpaName: policy.tpaName,
      memberId: policy.memberId,
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department || 'General Medicine',
      diagnosis,
      icdCode,
      proposedTreatment,
      treatmentType,
      estimatedCost: Number(estimatedCost),
      requestedAmount: Number(requestedAmount),
      approvedAmount: 0,
      coPayAmount: 0,
      patientPayableAmount: Number(estimatedCost),
      status: 'submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      approvedServices: [proposedTreatment, 'Standard Room & Nursing Charges', 'Specialist Rounds'],
      rejectedServices: [],
      supportingDocs: ['Clinical Case Sheet', 'Diagnostic Reports', 'Insurance Card'],
      claimType: 'cashless'
    });

    setShowCreateModal(false);
  };

  const handleOpenAdjudicate = (pa: PreAuthRequest) => {
    setSelectedRequest(pa);
    setAdjStatus(pa.status === 'under_review' || pa.status === 'submitted' ? 'approved' : pa.status);
    setApprovedAmount(pa.approvedAmount || pa.requestedAmount);
    setApprovalNumber(pa.approvalNumber || `SH-APP-2026-${Date.now().toString().slice(-6)}`);
    setReviewerNotes(pa.reviewerNotes || 'Pre-authorization granted as per scheduled medical tariff.');
    setApprovedServicesText(pa.approvedServices.join(', '));
    setRejectedServicesText(pa.rejectedServices.join(', '));
    setShowAdjudicateModal(true);
  };

  const handleSaveAdjudicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const approvedList = approvedServicesText.split(',').map(s => s.trim()).filter(Boolean);
    const rejectedList = rejectedServicesText.split(',').map(s => s.trim()).filter(Boolean);

    adjudicatePreAuth(
      selectedRequest.id,
      adjStatus,
      Number(approvedAmount),
      reviewerNotes,
      approvalNumber,
      approvedList,
      rejectedList
    );

    setShowAdjudicateModal(false);
  };

  const handleOpenLetter = (pa: PreAuthRequest) => {
    setSelectedRequest(pa);
    setShowLetterModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(234,88,12,0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Pre-Authorization & Cashless Treatment Approval</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Submit cashless requests to insurance companies, track approval status, and print initial sanction letters
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={15} /> Raise Pre-Auth Request
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
              placeholder="Search Request #, Patient, Diagnosis..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Pre-Auth Statuses ({preAuthRequests.length})</option>
            <option value="approved">Approved</option>
            <option value="under_review">Under Review / Submitted</option>
            <option value="partially_approved">Partially Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request # & Date</th>
                  <th>Patient & UHID</th>
                  <th>Insurer & TPA</th>
                  <th>Diagnosis & Doctor</th>
                  <th>Estimated / Requested</th>
                  <th>Approved Amount</th>
                  <th>Patient Payable</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(pa => (
                  <tr key={pa.id}>
                    <td>
                      <strong style={{ color: '#1e40af', fontSize: '13px' }}>{pa.requestNumber}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{pa.submissionDate}</div>
                      {pa.approvalNumber && (
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                          Sanction: {pa.approvalNumber}
                        </div>
                      )}
                    </td>

                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{pa.patientName}</strong>
                      <div style={{ fontSize: '11px', color: '#2563eb' }}>{pa.uhid}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Policy: {pa.policyNumber}</div>
                    </td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>{pa.providerName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>TPA: {pa.tpaName || 'Direct'}</div>
                    </td>

                    <td>
                      <div className="truncate" style={{ maxWidth: '170px', fontWeight: 600 }}>{pa.diagnosis}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {pa.doctorName} ({pa.department})
                      </div>
                    </td>

                    <td>
                      <div>Est: ₹{pa.estimatedCost.toLocaleString()}</div>
                      <strong style={{ color: '#1e40af', fontSize: '12px' }}>Req: ₹{pa.requestedAmount.toLocaleString()}</strong>
                    </td>

                    <td>
                      <strong style={{ color: pa.approvedAmount > 0 ? '#059669' : 'var(--text-tertiary)', fontSize: '13px' }}>
                        ₹{pa.approvedAmount.toLocaleString()}
                      </strong>
                      {pa.approvalDate && (
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Apprv: {pa.approvalDate}</div>
                      )}
                    </td>

                    <td>
                      <strong style={{ color: pa.patientPayableAmount > 0 ? '#ea580c' : '#059669' }}>
                        ₹{pa.patientPayableAmount.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          pa.status === 'approved'
                            ? 'badge-success'
                            : pa.status === 'under_review' || pa.status === 'submitted'
                            ? 'badge-warning'
                            : pa.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {pa.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {pa.status === 'approved' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenLetter(pa)} title="Print Approval Letter">
                            <Printer size={13} />
                          </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenAdjudicate(pa)} title="Review / Adjudicate">
                          <Edit2 size={13} /> Adjudicate
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
          <Clock size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>No pre-authorization requests found</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Click "Raise Pre-Auth Request" to initiate cashless approval for planned or emergency treatments.
          </div>
        </div>
      )}

      {/* Modal 1: Raise Pre-Auth */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#ea580c" />
                <span className="modal-title">Create Cashless Pre-Authorization Request</span>
              </div>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Patient *</label>
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
                    <label className="form-label">Attending Doctor *</label>
                    <select
                      className="form-select"
                      value={newDoctorId}
                      onChange={e => setNewDoctorId(e.target.value)}
                    >
                      {DEMO_DOCTORS.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Clinical Provisional Diagnosis *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Acute Appendicitis / CAD / Fracture Femur"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ICD-10 Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. K35.80"
                      value={icdCode}
                      onChange={e => setIcdCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Proposed Surgical / Medical Treatment *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Laparoscopic Appendectomy with General Anesthesia"
                      value={proposedTreatment}
                      onChange={e => setProposedTreatment(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Treatment Category</label>
                    <select
                      className="form-select"
                      value={treatmentType}
                      onChange={e => setTreatmentType(e.target.value as any)}
                    >
                      <option value="surgical">Surgical Procedure</option>
                      <option value="medical_management">Medical Management</option>
                      <option value="emergency">Emergency Care</option>
                      <option value="day_care">Day Care Procedure</option>
                      <option value="icu_care">ICU / Critical Care</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Estimated Total Hospital Bill (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1000"
                      value={estimatedCost}
                      onChange={e => setEstimatedCost(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested Pre-Auth Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1000"
                      value={requestedAmount}
                      onChange={e => setRequestedAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Pre-Auth to Insurer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjudicate Pre-Auth (Update Approval Status & Amount) */}
      {showAdjudicateModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowAdjudicateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#059669" />
                <span className="modal-title">Adjudicate Pre-Auth: {selectedRequest.requestNumber}</span>
              </div>
              <button className="btn-icon" onClick={() => setShowAdjudicateModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveAdjudicate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                  <div><strong>Patient:</strong> {selectedRequest.patientName} ({selectedRequest.uhid})</div>
                  <div><strong>Insurer:</strong> {selectedRequest.providerName}</div>
                  <div><strong>Requested Amount:</strong> ₹{selectedRequest.requestedAmount.toLocaleString()}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Adjudication Decision *</label>
                    <select
                      className="form-select"
                      value={adjStatus}
                      onChange={e => setAdjStatus(e.target.value as PreAuthStatus)}
                    >
                      <option value="approved">Approved in Full</option>
                      <option value="partially_approved">Partially Approved</option>
                      <option value="under_review">Under Medical Review</option>
                      <option value="rejected">Rejected / Denied</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approved Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="0"
                      value={approvedAmount}
                      onChange={e => setApprovedAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sanction / Approval Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SH-APP-2026-904128"
                    value={approvalNumber}
                    onChange={e => setApprovalNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approved Services List (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ICU Charges, Surgery Fee, Stent, Pharmacy"
                    value={approvedServicesText}
                    onChange={e => setApprovedServicesText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Disallowed / Rejected Services List (if any)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Consumables, Registration Fee, Extra food"
                    value={rejectedServicesText}
                    onChange={e => setRejectedServicesText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adjudicator / Reviewer Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={reviewerNotes}
                    onChange={e => setReviewerNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjudicateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Adjudication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Printable Sanction Letter Preview */}
      {showLetterModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#1e40af" />
                <span className="modal-title">Cashless Pre-Authorization Sanction Letter</span>
              </div>
              <button className="btn-icon" onClick={() => setShowLetterModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ padding: '24px', background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1e40af', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{selectedRequest.providerName}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Third-Party Cashless Hospitalization Pre-Authorization Certificate</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
                <div><strong>Sanction Reference:</strong> {selectedRequest.approvalNumber || 'SAN-2026-PENDING'}</div>
                <div><strong>Sanction Date:</strong> {selectedRequest.approvalDate || new Date().toISOString().split('T')[0]}</div>
                <div><strong>Patient Name:</strong> {selectedRequest.patientName}</div>
                <div><strong>UHID:</strong> {selectedRequest.uhid}</div>
                <div><strong>Member Card ID:</strong> {selectedRequest.memberId}</div>
                <div><strong>Policy Number:</strong> {selectedRequest.policyNumber}</div>
                <div><strong>Hospital:</strong> ALN Cure Multi-Specialty Hospital</div>
                <div><strong>Treating Consultant:</strong> {selectedRequest.doctorName}</div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>Diagnosis & Procedure</div>
                <div style={{ fontSize: '12px' }}>{selectedRequest.diagnosis} ({selectedRequest.icdCode || 'ICD-10'})</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{selectedRequest.proposedTreatment}</div>
              </div>

              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 0', color: '#64748b' }}>Estimated Hospital Charges:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{selectedRequest.estimatedCost.toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 0', color: '#64748b' }}>Pre-Authorized Amount by Insurer:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '14px' }}>₹{selectedRequest.approvedAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#64748b' }}>Estimated Patient Responsibility (Co-pay / Non-medical):</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, color: '#ea580c' }}>₹{selectedRequest.patientPayableAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                * This pre-authorization letter is valid for 7 days from issue date. Final claim settlement is subject to receipt of original itemized bills, operative notes, and discharge summary.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLetterModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Print Sanction Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
