import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import type { NursingHandoverRecord } from '../../../../types';

interface PrintHandoverModalProps {
  handover: NursingHandoverRecord;
  onClose: () => void;
}

export default function PrintHandoverModal({ handover, onClose }: PrintHandoverModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Nursing Shift Handover Report & Signoff Sheet</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Handover
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-nursing-handover-sheet"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0A84FF', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Department of Nursing Services — Shift-to-Shift Clinical Handover Record
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Ward: {handover.ward} · Shift: {handover.shift.toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Date: {handover.date} at {handover.time}
                </div>
              </div>
            </div>

            {/* Shift Staff Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>Relieving Nurse (From):</span> <br /><strong>{handover.fromNurseName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Incoming Nurse (To):</span> <br /><strong>{handover.toNurseName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Handover Status:</span> <br /><strong style={{ color: '#059669', textTransform: 'uppercase' }}>{handover.status}</strong></div>
            </div>

            {/* Patients Handover Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <strong style={{ fontSize: '12px', color: '#1E40AF', textTransform: 'uppercase' }}>Inpatient Handoff Summary ({handover.patientHandovers.length} Patients):</strong>

              {handover.patientHandovers.map((p, i) => (
                <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', background: '#F9FAFB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                    <span>{p.patientName} (Bed {p.bedNumber})</span>
                    <span style={{ color: '#0A84FF' }}>Condition: {p.condition}</span>
                  </div>
                  <div style={{ color: '#374151', marginTop: '2px' }}><strong>Notes: </strong>{p.importantNotes}</div>
                  <div style={{ color: '#D97706', marginTop: '2px' }}><strong>Pending Tasks: </strong>{p.pendingTasks || 'None'}</div>
                  <div style={{ color: '#2563EB', marginTop: '2px' }}><strong>Medications Due: </strong>{p.medicationDue || 'Standard'}</div>
                  {p.criticalAlerts && <div style={{ color: '#DC2626', fontWeight: 700, marginTop: '2px' }}>⚠️ {p.criticalAlerts}</div>}
                </div>
              ))}
            </div>

            {/* General Ward Notes */}
            {handover.generalWardNotes && (
              <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#1E40AF', marginBottom: '16px', border: '1px solid #BFDBFE' }}>
                <strong>Ward Observations & Equipment Notes: </strong>{handover.generalWardNotes}
              </div>
            )}

            {/* Dual Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '160px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>{handover.fromNurseName}</div>
                <div>Relieving Staff Nurse (Outgoing)</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '160px', marginBottom: '4px', marginLeft: 'auto' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>{handover.toNurseName}</div>
                <div>Incoming Staff Nurse (Acknowledged)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Handover Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
