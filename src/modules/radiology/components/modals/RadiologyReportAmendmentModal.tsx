import React, { useState } from 'react';
import { FileEdit, X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRadiology } from '../../context/RadiologyContext';
import type { ComprehensiveRadiologyOrder } from '../../../../types';

interface RadiologyReportAmendmentModalProps {
  order: ComprehensiveRadiologyOrder;
  onClose: () => void;
}

export default function RadiologyReportAmendmentModal({ order, onClose }: RadiologyReportAmendmentModalProps) {
  const { amendRadiologyReport } = useRadiology();

  const [amendedFindings, setAmendedFindings] = useState(order.findingsText || '');
  const [amendedImpression, setAmendedImpression] = useState(order.impressionText || '');
  const [amendmentReason, setAmendmentReason] = useState('');
  const [radiologistName, setRadiologistName] = useState('Dr. Vivek Malhotra, MD (Radiodiagnosis)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentReason.trim()) return;

    amendRadiologyReport(order.id, amendedFindings, amendedImpression, amendmentReason, radiologistName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <FileEdit size={18} style={{ color: 'var(--color-warning)' }} />
          <div>
            <div className="modal-title">Non-Destructive Radiology Report Amendment (Version {(order.version || 1) + 1})</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Accession: <strong>{order.accessionNumber}</strong> · Patient: {order.patientName} ({order.patientId})
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Regulatory Invariant Alert */}
            <div style={{ background: 'rgba(255, 159, 10, 0.1)', border: '1px solid var(--color-warning)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-warning)' }}>
                <AlertTriangle size={16} /> Clinical Audit Protocol: Version Preservation Mandate
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 2 }}>
                Verified radiology diagnostic reports cannot be silently overwritten. Submitting this form will archive Version {order.version || 1} and publish Version {(order.version || 1) + 1} with an explicit amendment audit log.
              </div>
            </div>

            <div className="form-grid" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Mandatory Clinical Amendment Rationale <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Second opinion specialist review identified subtle non-displaced cortical fracture on supplementary oblique view..."
                  value={amendmentReason}
                  onChange={e => setAmendmentReason(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amended Findings & Observations <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={amendedFindings}
                  onChange={e => setAmendedFindings(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amended Impression / Diagnostic Conclusion <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={amendedImpression}
                  onChange={e => setAmendedImpression(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Authorizing Radiologist Digital Signoff <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={radiologistName}
                  onChange={e => setRadiologistName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-warning btn-sm">
              <CheckCircle2 size={13} /> Publish Amended Report (v{(order.version || 1) + 1})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
