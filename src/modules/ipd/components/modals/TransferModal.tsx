import React, { useState } from 'react';
import {
  ArrowRightLeft, X, CheckCircle2, BedDouble, AlertTriangle,
  Building2, ShieldCheck
} from 'lucide-react';
import { useIPD } from '../../context/IPDContext';
import type { Admission, Bed } from '../../../../types';

interface TransferModalProps {
  admission: Admission;
  onClose: () => void;
}

const TRANSFER_REASONS = [
  'Clinical Step-down (ICU/HDU to General Ward)',
  'Clinical Deterioration (Emergency/Ward to ICU)',
  'Patient / Relative Request for Room Upgrade (Private Room)',
  'Infection Control & Isolation Requirement',
  'Post-Operative Recovery Ward Transfer',
  'Routine Bed Re-allocation / Ward Maintenance',
];

export default function TransferModal({ admission, onClose }: TransferModalProps) {
  const {
    beds,
    transferPatient,
    doctors,
  } = useIPD();

  const availableBeds = beds.filter(b => b.status === 'available' && b.id !== admission.bedId);
  const currentBed = beds.find(b => b.id === admission.bedId);

  const [selectedToBedId, setSelectedToBedId] = useState(availableBeds[0]?.id || '');
  const [reason, setReason] = useState(TRANSFER_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [requestedBy, setRequestedBy] = useState(admission.admittingDoctorName || 'Dr. Rajesh Kumar');
  const [approvedBy, setApprovedBy] = useState('Dr. Medical Superintendent');

  const selectedTargetBed = beds.find(b => b.id === selectedToBedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToBedId) return;

    transferPatient({
      admissionId: admission.id,
      toBedId: selectedToBedId,
      reason: customReason || reason,
      requestedBy,
      approvedBy,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <ArrowRightLeft size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Patient Room / Bed Transfer</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {admission.patientName} ({admission.patientId}) · Admission: {admission.id}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current vs Target Bed Visual Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              {/* From Bed */}
              <div style={{ padding: '10px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-danger)', fontWeight: 800, textTransform: 'uppercase' }}>CURRENT BED</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>{admission.bedNumber}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{admission.ward}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>Tariff: ₹{currentBed?.dailyRate || 800}/d</div>
              </div>

              <div style={{ color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>
                <ArrowRightLeft size={22} />
              </div>

              {/* To Bed Preview */}
              <div style={{ padding: '10px 12px', background: 'var(--color-success-muted)', border: '1px solid rgba(48,209,88,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 800, textTransform: 'uppercase' }}>NEW TARGET BED</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>{selectedTargetBed?.bedNumber || 'Select'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedTargetBed?.ward || '—'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>Tariff: ₹{selectedTargetBed?.dailyRate || 0}/d</div>
              </div>
            </div>

            <div className="form-grid" style={{ gap: 14 }}>
              {/* Target Bed Selector */}
              <div className="form-group">
                <label className="form-label">Select Available Target Bed <span className="required">*</span></label>
                {availableBeds.length > 0 ? (
                  <select
                    className="form-select"
                    value={selectedToBedId}
                    onChange={e => setSelectedToBedId(e.target.value)}
                    required
                  >
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} — {b.ward} ({b.type.toUpperCase()}) | Floor {b.floor} | ₹{b.dailyRate}/day
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '8px 12px', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                    ⚠️ No available beds in the hospital. Please discharge or free up a bed before transferring.
                  </div>
                )}
              </div>

              {/* Reason for Transfer */}
              <div className="form-group">
                <label className="form-label">Clinical / Administrative Reason for Transfer <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                >
                  {TRANSFER_REASONS.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                  <option value="other">Other Reason...</option>
                </select>
              </div>

              {reason === 'other' && (
                <div className="form-group">
                  <label className="form-label">Specify Custom Transfer Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter detailed reason..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Requested & Approved By */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Requested By</label>
                  <input
                    type="text"
                    className="form-input"
                    value={requestedBy}
                    onChange={e => setRequestedBy(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approved By</label>
                  <input
                    type="text"
                    className="form-input"
                    value={approvedBy}
                    onChange={e => setApprovedBy(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Automatic Status Notice */}
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--color-info-muted)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-secondary)' }}>
              ℹ️ <strong>Automated Hospital Sanitization Protocol:</strong> Upon transfer confirmation, Bed <strong>{admission.bedNumber}</strong> will automatically be marked as <strong>CLEANING</strong>, and Bed <strong>{selectedTargetBed?.bedNumber}</strong> will become <strong>OCCUPIED</strong>.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={availableBeds.length === 0}
            >
              <CheckCircle2 size={13} /> Confirm Bed Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
