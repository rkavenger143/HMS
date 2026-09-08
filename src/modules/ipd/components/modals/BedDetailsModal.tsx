import React from 'react';
import {
  BedDouble, X, User, Activity, Clock, ArrowRightLeft,
  Sparkles, CheckCircle2, ShieldAlert, Stethoscope, FileText,
  Wrench, Shield, Check
} from 'lucide-react';
import { useIPD } from '../../context/IPDContext';
import type { Bed } from '../../../../types';

interface BedDetailsModalProps {
  bed: Bed;
  onClose: () => void;
  onTransfer?: (bed: Bed) => void;
  onAdmit?: (bed: Bed) => void;
  onViewProfile?: (admissionId: string) => void;
}

const STATUS_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  occupied: { label: 'Occupied', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  reserved: { label: 'Reserved', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  cleaning: { label: 'Cleaning', color: 'var(--color-info)', bg: 'var(--color-info-muted)' },
  maintenance: { label: 'Maintenance', color: 'var(--text-muted)', bg: 'var(--bg-surface)' },
  blocked: { label: 'Blocked', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
};

export default function BedDetailsModal({ bed, onClose, onTransfer, onAdmit, onViewProfile }: BedDetailsModalProps) {
  const {
    updateBedStatus,
    markBedCleaned,
    reserveBed,
    releaseBed,
    setBedMaintenance,
    admissions,
    vitalsHistory,
  } = useIPD();

  const sc = STATUS_COLORS[bed.status] || STATUS_COLORS.available;
  const currentAdmission = bed.currentAdmissionId ? admissions.find(a => a.id === bed.currentAdmissionId) : null;
  const latestVitals = bed.currentAdmissionId && vitalsHistory[bed.currentAdmissionId] && vitalsHistory[bed.currentAdmissionId].length > 0
    ? vitalsHistory[bed.currentAdmissionId][0]
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <BedDouble size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Bed Inspection: {bed.bedNumber}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {bed.building || 'Building A'} · Floor {bed.floor} · {bed.ward} · Room {bed.roomNumber || '—'}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Banner */}
          <div style={{ padding: '12px 16px', background: sc.bg, border: `1px solid ${sc.color}40`, borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Current Bed Status:</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: sc.color }}>
                ● {sc.label.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Daily Tariff:</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{bed.dailyRate}/day
              </div>
            </div>
          </div>

          {/* If Occupied: Patient Snapshot */}
          {bed.status === 'occupied' && (
            <div className="card" style={{ padding: '14px', marginBottom: 16, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="avatar avatar-sm">{bed.currentPatientName?.[0] || 'P'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{bed.currentPatientName || 'Active Inpatient'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>UHID: {bed.currentPatientId} · Adm: {bed.currentAdmissionId}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, borderTop: '1px solid var(--border-muted)', paddingTop: 8 }}>
                <div>Attending: <strong>{bed.admittingDoctorName || currentAdmission?.admittingDoctorName || 'Dr. Physician'}</strong></div>
                <div>Admitted: <strong>{bed.admissionDate || currentAdmission?.admissionDate}</strong></div>
              </div>

              {currentAdmission?.diagnosis && (
                <div style={{ marginTop: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Diagnosis: </span>
                  <strong>{currentAdmission.diagnosis.join(', ')}</strong>
                </div>
              )}

              {/* Vitals Snapshot */}
              {latestVitals && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 12, fontSize: 11 }}>
                  <span>BP: <strong>{latestVitals.bloodPressure}</strong></span>
                  <span>Pulse: <strong>{latestVitals.pulse} bpm</strong></span>
                  <span>SpO2: <strong>{latestVitals.spo2}%</strong></span>
                  <span>Temp: <strong>{latestVitals.temperature}°F</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Features List */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              BED SPECIFICATIONS & AMENITIES
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{bed.type} Bed</span>
              {bed.features.map((f, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: 11 }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Bed Status Control Actions */}
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              BED STATUS LIFECYCLE CONTROLS
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {bed.status === 'cleaning' && (
                <button className="btn btn-success btn-sm" onClick={() => { markBedCleaned(bed.id); onClose(); }}>
                  <CheckCircle2 size={13} /> Mark Cleaned & Ready (Available)
                </button>
              )}

              {bed.status === 'available' && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => { reserveBed(bed.id, 'Reserved for incoming planned admission'); onClose(); }}>
                    Set Reserved
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setBedMaintenance(bed.id, 'Routine biomedical & linen maintenance'); onClose(); }}>
                    Set Maintenance
                  </button>
                </>
              )}

              {bed.status === 'maintenance' && (
                <button className="btn btn-success btn-sm" onClick={() => { updateBedStatus(bed.id, 'cleaning'); onClose(); }}>
                  <Sparkles size={13} /> Maintenance Done → Send to Cleaning
                </button>
              )}

              {bed.status === 'reserved' && (
                <button className="btn btn-secondary btn-sm" onClick={() => { releaseBed(bed.id); onClose(); }}>
                  Cancel Reservation → Available
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>

          {bed.status === 'available' && onAdmit && (
            <button className="btn btn-primary btn-sm" onClick={() => { onAdmit(bed); onClose(); }}>
              <User size={13} /> Admit Patient to this Bed
            </button>
          )}

          {bed.status === 'occupied' && onTransfer && (
            <button className="btn btn-secondary btn-sm" onClick={() => { onTransfer(bed); onClose(); }}>
              <ArrowRightLeft size={13} /> Transfer Patient
            </button>
          )}

          {bed.status === 'occupied' && bed.currentAdmissionId && onViewProfile && (
            <button className="btn btn-primary btn-sm" onClick={() => { onViewProfile(bed.currentAdmissionId!); onClose(); }}>
              <FileText size={13} /> Open Inpatient EHR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
