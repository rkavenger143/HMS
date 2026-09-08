// ============================================================
// ALN Cure HMS — Insurance Claim Documents Management Module
// ============================================================

import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Plus,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Send,
  FileCheck,
  Download,
  Trash2,
  RefreshCw,
  File,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import type { ClaimDocument, InsuranceClaimRecord } from '../../../types/insurance';

const STANDARD_DOCUMENT_TYPES: { type: ClaimDocument['documentType']; label: string; mandatory: boolean }[] = [
  { type: 'final_hospital_bill', label: 'Final Hospital Bill & Receipts', mandatory: true },
  { type: 'discharge_summary', label: 'Discharge Summary & Epicrisis', mandatory: true },
  { type: 'doctor_prescription', label: 'Doctor Prescription & Clinical Orders', mandatory: true },
  { type: 'insurance_card', label: 'Patient Insurance Card & ID Proof', mandatory: true },
  { type: 'medical_reports', label: 'Operative & Clinical Medical Notes', mandatory: false },
  { type: 'lab_report', label: 'Laboratory Diagnostic Test Results', mandatory: false },
  { type: 'radiology_report', label: 'Radiology & Imaging Reports (X-Ray/CT/MRI)', mandatory: false },
  { type: 'admission_docs', label: 'IPD Admission & Triage Records', mandatory: false },
  { type: 'pre_auth_letter', label: 'Pre-Authorization Sanction Letter', mandatory: false },
  { type: 'itemized_bill', label: 'Itemized Pharmacy & Consumables Bill', mandatory: false },
  { type: 'other', label: 'Other Supporting Clinical Vouchers', mandatory: false },
];

export default function ClaimDocumentsManagement() {
  const {
    claims,
    uploadClaimDocument,
    replaceClaimDocument,
    deleteClaimDocument,
    verifyClaimDocument,
    submitClaim,
    setActiveTab
  } = useInsurance();

  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<ClaimDocument['documentType']>('final_hospital_bill');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState<ClaimDocument | null>(null);

  // Document Replacement Modal State
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);

  // Document Rejection Modal State
  const [rejectingDoc, setRejectingDoc] = useState<{ claimId: string; doc: ClaimDocument } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Illegible scan / missing doctor signature and hospital seal.');

  const activeClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  // Missing documents analysis
  const attachedTypes = new Set(activeClaim?.documents?.map(d => d.documentType) || []);
  const missingMandatoryDocs = STANDARD_DOCUMENT_TYPES.filter(st => st.mandatory && !attachedTypes.has(st.type));
  const missingOptionalDocs = STANDARD_DOCUMENT_TYPES.filter(st => !st.mandatory && !attachedTypes.has(st.type));

  const filteredDocs = (activeClaim?.documents || []).filter(d => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      d.documentName.toLowerCase().includes(q) ||
      d.uploadedBy.toLowerCase().includes(q);
    const matchesType = typeFilter === 'ALL' || d.documentType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenUpload = (prefillType?: ClaimDocument['documentType'], prefillLabel?: string) => {
    setDocType(prefillType || 'final_hospital_bill');
    setDocName(prefillLabel || 'Hospital Final Consolidated Bill');
    setSelectedFile(null);
    setFileBase64('');
    setUploadError('');
    setUploadProgress(0);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the maximum limit of 5 MB.');
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    // Validate type
    const validExtensions = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setUploadError('Invalid file format. Please upload PDF, JPG, JPEG, or PNG only.');
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    setUploadError('');
    setSelectedFile(file);
    if (!docName || docName.includes('Consolidated Bill')) {
      setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Read to Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;

    setIsUploading(true);
    setUploadProgress(40);

    setTimeout(() => {
      setUploadProgress(85);
      setTimeout(() => {
        const sizeFormatted = selectedFile
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
          : '1.24 MB';

        uploadClaimDocument(activeClaim.id, {
          documentName: docName || selectedFile?.name || 'Supporting Claim Voucher',
          documentType: docType,
          uploadedBy: 'Insurance Coordinator',
          status: 'verified',
          fileSize: sizeFormatted,
          fileType: selectedFile?.type || 'application/pdf',
          fileData: fileBase64 || undefined
        });

        setIsUploading(false);
        setShowUploadModal(false);
        setDocName('');
        setSelectedFile(null);
        setFileBase64('');
      }, 300);
    }, 200);
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClaim || !replacingDocId) return;

    const reader = new FileReader();
    reader.onload = () => {
      replaceClaimDocument(activeClaim.id, replacingDocId, {
        documentName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: file.type,
        fileData: reader.result as string,
        status: 'uploaded'
      });
      setReplacingDocId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (doc: ClaimDocument) => {
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.documentName.includes('.') ? doc.documentName : `${doc.documentName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a printable text summary for seed documents without binary
      const blob = new Blob([
        `ALN CURE HOSPITAL — INSURANCE CLAIM DOCUMENT\n\nDocument Name: ${doc.documentName}\nClaim Number: ${activeClaim?.claimNumber}\nPatient Name: ${activeClaim?.patientName}\nUHID: ${activeClaim?.uhid}\nDocument Type: ${doc.documentType}\nUploaded Date: ${doc.uploadDate}\nVerification Status: ${doc.status}\n\n[Certified True Copy for Cashless TPA Settlement]`
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.documentName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingDoc) return;
    verifyClaimDocument(rejectingDoc.claimId, rejectingDoc.doc.id, 'rejected', rejectionReason);
    setRejectingDoc(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paperclip size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Claim Document Management & Verification
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Upload, verify, and validate required vouchers and summaries before submitting claims to payers.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleOpenUpload()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Upload size={15} /> Upload Document
          </button>
        </div>
      </div>

      {/* Claim Selector Banner */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Target Claim:
            </span>
            <select
              className="form-control"
              style={{ fontSize: '13px', fontWeight: 600 }}
              value={selectedClaimId}
              onChange={e => setSelectedClaimId(e.target.value)}
            >
              {claims.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.claimNumber || c.id} — {c.patientName} ({c.providerName || c.insuranceProvider}) — ₹{(c.claimedAmount || c.claimAmount || 0).toLocaleString()} [{c.status?.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          {activeClaim && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <span style={{ fontWeight: 700, color: activeClaim.status === 'approved' ? '#059669' : activeClaim.status === 'rejected' ? '#dc2626' : '#2563eb' }}>
                  {activeClaim.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Documents: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeClaim.documents?.length || 0}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Missing Documents Alert Box */}
      {missingMandatoryDocs.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <AlertTriangle size={20} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#b91c1c' }}>
              Missing Mandatory Documents ({missingMandatoryDocs.length} Required)
            </div>
            <p style={{ fontSize: '12px', color: '#7f1d1d', margin: '4px 0 10px' }}>
              This claim cannot be submitted until all mandatory clinical vouchers and bill summaries are attached and verified.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingMandatoryDocs.map(mDoc => (
                <button
                  key={mDoc.type}
                  onClick={() => handleOpenUpload(mDoc.type, mDoc.label)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#ffffff',
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} /> Upload {mDoc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Search document name, uploaded by..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              style={{ fontSize: '13px' }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Document Types</option>
              {STANDARD_DOCUMENT_TYPES.map(st => (
                <option key={st.type} value={st.type}>{st.label}</option>
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
              <option value="ALL">All Document Statuses</option>
              <option value="verified">Verified</option>
              <option value="uploaded">Uploaded / Pending Verification</option>
              <option value="rejected">Rejected / Replacement Needed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
            Attached Documents ({filteredDocs.length})
          </h3>
          {activeClaim?.status === 'ready_for_submission' && (
            <button
              onClick={() => {
                submitClaim(activeClaim.id);
                setActiveTab('tracking');
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={13} /> Submit Claim to Insurer
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 16px' }}>Document Name</th>
                <th style={{ padding: '10px 16px' }}>Category</th>
                <th style={{ padding: '10px 16px' }}>Size & Type</th>
                <th style={{ padding: '10px 16px' }}>Uploaded Date</th>
                <th style={{ padding: '10px 16px' }}>Uploaded By</th>
                <th style={{ padding: '10px 16px' }}>Verification Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No documents attached for this claim matching the filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const isVerified = doc.status === 'verified';
                  const isRejected = doc.status === 'rejected';
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="#2563eb" />
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.documentName}</span>
                            {doc.rejectionNote && (
                              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                                Rejection Note: {doc.rejectionNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                          {doc.documentType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {doc.fileSize || '1.2 MB'} ({doc.fileType?.includes('png') || doc.fileType?.includes('jpeg') ? 'Image' : 'PDF'})
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        {doc.uploadDate}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        {doc.uploadedBy}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: isVerified
                              ? 'rgba(16,185,129,0.12)'
                              : isRejected
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(245,158,11,0.12)',
                            color: isVerified ? '#059669' : isRejected ? '#dc2626' : '#d97706'
                          }}
                        >
                          {doc.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="btn btn-secondary btn-sm"
                            title="View Document"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="btn btn-secondary btn-sm"
                            title="Download Document"
                            style={{ padding: '4px 8px' }}
                          >
                            <Download size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setReplacingDocId(doc.id);
                              replaceFileInputRef.current?.click();
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Replace Document File"
                            style={{ padding: '4px 8px' }}
                          >
                            <RefreshCw size={13} />
                          </button>
                          {!isVerified && (
                            <button
                              onClick={() => verifyClaimDocument(activeClaim.id, doc.id, 'verified')}
                              className="btn btn-secondary btn-sm"
                              title="Mark as Verified"
                              style={{ padding: '4px 8px', color: '#059669' }}
                            >
                              <Check size={13} />
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              onClick={() => setRejectingDoc({ claimId: activeClaim.id, doc })}
                              className="btn btn-secondary btn-sm"
                              title="Reject Document"
                              style={{ padding: '4px 8px', color: '#dc2626' }}
                            >
                              <X size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteClaimDocument(activeClaim.id, doc.id)}
                            className="btn btn-secondary btn-sm"
                            title="Delete Document"
                            style={{ padding: '4px 8px', color: '#dc2626' }}
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Hidden File Input for Document Replacement */}
      <input
        type="file"
        ref={replaceFileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleReplaceFile}
      />

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Upload Claim Voucher / Report</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUpload}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Document Category *</label>
                  <select
                    className="form-control"
                    value={docType}
                    onChange={e => setDocType(e.target.value as any)}
                    required
                  >
                    {STANDARD_DOCUMENT_TYPES.map(st => (
                      <option key={st.type} value={st.type}>{st.label} {st.mandatory ? '(Mandatory)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Document Name / Label *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Discharge Summary - Final Signed"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    required
                  />
                </div>

                {/* Real File Input Dropzone */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Select File (PDF, JPG, JPEG, PNG - Max 5MB) *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-default)',
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      background: 'var(--bg-base)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <Upload size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedFile ? selectedFile.name : 'Click to Browse & Choose File from Device'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB — Ready to upload`
                        : 'Supports PDF medical records, scan images (JPG, PNG)'}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  {uploadError && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {uploadError}
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Uploading & saving to claim storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-default)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading || !!uploadError}>
                  {isUploading ? 'Uploading...' : 'Save & Attach Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{viewingDoc.documentName}</h3>
              </div>
              <button className="close-btn" onClick={() => setViewingDoc(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px' }}>
                <div>Category: <strong style={{ textTransform: 'capitalize' }}>{viewingDoc.documentType.replace(/_/g, ' ')}</strong></div>
                <div>Size: <strong>{viewingDoc.fileSize || '1.2 MB'}</strong></div>
                <div>Status: <strong style={{ color: viewingDoc.status === 'verified' ? '#059669' : '#d97706' }}>{viewingDoc.status.toUpperCase()}</strong></div>
              </div>

              {/* Preview Content */}
              {viewingDoc.fileData && viewingDoc.fileData.startsWith('data:image') ? (
                <div style={{ textAlign: 'center', padding: '12px', background: '#000', borderRadius: '8px' }}>
                  <img src={viewingDoc.fileData} alt={viewingDoc.documentName} style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '4px' }} />
                </div>
              ) : viewingDoc.fileData && viewingDoc.fileData.startsWith('data:application/pdf') ? (
                <iframe src={viewingDoc.fileData} style={{ width: '100%', height: '420px', border: 'none', borderRadius: '8px' }} title="PDF Preview" />
              ) : (
                <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)', textAlign: 'center' }}>
                  <FileText size={48} color="#2563eb" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--text-primary)' }}>
                    {viewingDoc.documentName}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 16px' }}>
                    Certified digital copy linked to Claim #{activeClaim?.claimNumber} ({activeClaim?.patientName}).
                  </p>
                  <button onClick={() => handleDownload(viewingDoc)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Download Document File
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Document Modal */}
      {rejectingDoc && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <XCircle size={18} /> Reject Document
              </h3>
              <button className="close-btn" onClick={() => setRejectingDoc(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Please specify the reason why <strong>{rejectingDoc.doc.documentName}</strong> is rejected:
              </p>
              <textarea
                className="form-control"
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Illegible scan, missing doctor seal, incomplete discharge summary..."
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectingDoc(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={handleConfirmRejection}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
