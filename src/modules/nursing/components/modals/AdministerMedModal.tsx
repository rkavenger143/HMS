import React, { useState } from 'react';
import { Pill, X, CheckCircle2, AlertTriangle, ShieldCheck, PauseCircle, XCircle } from 'lucide-react';
import { useNursing } from '../../context/NursingContext';
import type { MARRecord } from '../../../../types';

interface AdministerMedModalProps {
  record: MARRecord;
  onClose: () => void;
}

export default function AdministerMedModal({ record, onClose }: AdministerMedModalProps) {
  const { administerMARMedication, holdMARMedication, markMARMissed } = useNursing();

  const [verifiedPatient, setVerifiedPatient] = useState(true);
  const [verifiedDrug, setVerifiedDrug] = useState(true);
  const [verifiedDose, setVerifiedDose] = useState(true);
  const [verifiedRoute, setVerifiedRoute] = useState(true);
  const [verifiedTime, setVerifiedTime] = useState(true);

  const [actionType, setActionType] = useState<'administer' | 'hold' | 'missed'>('administer');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  const allFiveRightsVerified = verifiedPatient && verifiedDrug && verifiedDose && verifiedRoute && verifiedTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === 'administer') {
      if (!allFiveRightsVerified) {
        alert('Please verify all 5 Rights of Medication Administration prior to administration.');
        return;
      }
      administerMARMedication({
        recordId: record.id,
        verifiedPatient,
        remarks,
      });
    } else if (actionType === 'hold') {
      if (!reason) {
        alert('Mandatory clinical reason is required to hold medication.');
        return;
      }
      holdMARMedication(record.id, reason);
    } else if (actionType === 'missed') {
      if (!reason) {
        alert('Mandatory clinical reason is required for missed medication.');
        return;
      }
      markMARMissed(record.id, reason);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <Pill size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">MAR Medication Administration Log</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {record.patientName} · Bed {record.bedNumber}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Medication Card Details */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{record.medicineName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, marginTop: 6, color: 'var(--text-secondary)' }}>
                <div><strong>Dose:</strong> {record.dose}</div>
                <div><strong>Route:</strong> {record.route}</div>
                <div><strong>Frequency:</strong> {record.frequency}</div>
                <div><strong>Scheduled Time:</strong> {record.scheduledTime}</div>
              </div>
            </div>

            {/* Action Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${actionType === 'administer' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setActionType('administer')}
              >
                <CheckCircle2 size={13} /> Administer Now
              </button>
              <button
                type="button"
                className={`btn btn-sm ${actionType === 'hold' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setActionType('hold')}
              >
                <PauseCircle size={13} /> Hold Dose
              </button>
              <button
                type="button"
                className={`btn btn-sm ${actionType === 'missed' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setActionType('missed')}
              >
                <XCircle size={13} /> Mark Missed
              </button>
            </div>

            {/* 5 Rights Verification for Administer */}
            {actionType === 'administer' ? (
              <div style={{ background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.2)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> 5 Rights of Medication Administration Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={verifiedPatient} onChange={e => setVerifiedPatient(e.target.checked)} />
                    1. Right Patient ({record.patientName})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={verifiedDrug} onChange={e => setVerifiedDrug(e.target.checked)} />
                    2. Right Medication ({record.medicineName})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={verifiedDose} onChange={e => setVerifiedDose(e.target.checked)} />
                    3. Right Dose ({record.dose})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={verifiedRoute} onChange={e => setVerifiedRoute(e.target.checked)} />
                    4. Right Route ({record.route})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={verifiedTime} onChange={e => setVerifiedTime(e.target.checked)} />
                    5. Right Time ({record.scheduledTime})
                  </label>
                </div>
              </div>
            ) : (
              /* Mandatory Reason for Hold / Missed */
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ color: 'var(--color-danger)' }}>
                  Mandatory Clinical Reason for {actionType === 'hold' ? 'Holding' : 'Missing'} Dose <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                >
                  <option value="">Select reason...</option>
                  {actionType === 'hold' ? (
                    <>
                      <option value="Patient NPO for surgery/procedure">Patient NPO for surgery/procedure</option>
                      <option value="Hypotension / BP low">Hypotension / BP low</option>
                      <option value="Bradycardia / Heart rate low">Bradycardia / Heart rate low</option>
                      <option value="Doctor verbal hold order">Doctor verbal hold order</option>
                      <option value="Awaiting lab results">Awaiting lab results</option>
                      <option value="Patient nausea/vomiting">Patient nausea/vomiting</option>
                    </>
                  ) : (
                    <>
                      <option value="Patient refused medication">Patient refused medication</option>
                      <option value="Patient asleep / unavailable">Patient asleep / unavailable</option>
                      <option value="Pharmacy drug shortage">Pharmacy drug shortage</option>
                      <option value="IV cannula displaced">IV cannula displaced</option>
                      <option value="Patient absent from ward">Patient absent from ward</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">Nurse Remarks (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Injected in left deltoid, well tolerated."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-sm ${actionType === 'administer' ? 'btn-primary' : actionType === 'hold' ? 'btn-secondary' : 'btn-danger'}`}>
              <CheckCircle2 size={13} /> Confirm {actionType.toUpperCase()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
