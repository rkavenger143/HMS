import React from 'react';
import { Printer, X, Building2, User, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import type { OPDVisit, Patient } from '../../../../types';

interface PrintRegistrationSlipModalProps {
  visit: OPDVisit;
  patient?: Patient | null;
  onClose: () => void;
}

export default function PrintRegistrationSlipModal({ visit, patient, onClose }: PrintRegistrationSlipModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">OPD Registration Slip</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Slip
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          {/* Printable Slip Container */}
          <div
            id="printable-registration-slip"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Slip Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                ALN Cure Multispeciality Hospital
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>
                Plot 45, Knowledge Park III, Greater Noida, UP - 201306 | Ph: 0120-4001000
              </div>
              <div style={{ display: 'inline-block', background: '#111827', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '4px', marginTop: '6px', letterSpacing: '0.5px' }}>
                OUTPATIENT DEPARTMENT (OPD) SLIP
              </div>
            </div>

            {/* Token Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Token Number</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0A84FF', lineHeight: 1 }}>#{visit.tokenNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280' }}>Priority: <span style={{ textTransform: 'uppercase', color: visit.priority === 'emergency' ? '#DC2626' : '#111827' }}>{visit.priority}</span></div>
                <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>Type: <strong style={{ textTransform: 'capitalize' }}>{visit.visitType} Visit</strong></div>
              </div>
            </div>

            {/* Patient & Visit Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#6B7280' }}>Patient UHID:</span>
                <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>{visit.patientId}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>OPD Visit ID:</span>
                <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>{visit.id}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Patient Name:</span>
                <div style={{ fontWeight: '700' }}>{visit.patientName}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Age / Gender / Blood:</span>
                <div style={{ fontWeight: '600' }}>
                  {visit.patientAge || '—'} Yrs / {visit.patientGender || '—'} / <strong style={{ color: '#DC2626' }}>{visit.patientBloodGroup || '—'}</strong>
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Mobile Number:</span>
                <div style={{ fontWeight: '600' }}>{visit.patientPhone || patient?.phone || '—'}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Date & Time:</span>
                <div style={{ fontWeight: '600' }}>{visit.visitDate} {visit.visitTime}</div>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #D1D5DB', paddingTop: '8px' }}>
                <span style={{ color: '#6B7280' }}>Doctor & Department:</span>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1F2937' }}>
                  {visit.doctorName} <span style={{ color: '#4B5563', fontWeight: '500' }}>({visit.department})</span>
                </div>
              </div>
              {visit.reasonForVisit && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#6B7280' }}>Reason for Visit:</span>
                  <div style={{ fontStyle: 'italic', color: '#374151' }}>{visit.reasonForVisit}</div>
                </div>
              )}
            </div>

            {/* Vitals Summary if available */}
            {visit.vitals && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Recorded Initial Vitals:</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: '#4B5563' }}>
                  {visit.vitals.bloodPressure && <span>BP: <strong>{visit.vitals.bloodPressure}</strong> mmHg</span>}
                  {visit.vitals.pulse && <span>Pulse: <strong>{visit.vitals.pulse}</strong> bpm</span>}
                  {visit.vitals.temperature && <span>Temp: <strong>{visit.vitals.temperature}</strong> °F</span>}
                  {visit.vitals.spo2 && <span>SpO2: <strong>{visit.vitals.spo2}</strong>%</span>}
                </div>
              </div>
            )}

            {/* Fee & Barcode Section */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Consultation Fee:</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>
                  ₹{visit.consultationFee.toLocaleString('en-IN')} <span style={{ fontSize: '10px', fontWeight: '600', color: '#4B5563' }}>({visit.paymentStatus.toUpperCase()})</span>
                </div>
              </div>
              {/* Simulated barcode */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '18px', fontWeight: '900', color: '#111827', transform: 'scaleY(1.3)' }}>
                  ||||| | |||| ||| |||| |
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280', letterSpacing: '1px' }}>{visit.id}</div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div style={{ borderTop: '1px dashed #D1D5DB', marginTop: '14px', paddingTop: '8px', fontSize: '9px', color: '#9CA3AF', textAlign: 'center' }}>
              * Please proceed to OPD Waiting Hall 1. Please display this token when called by the nurse. Valid for 7 days.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Registration Slip
          </button>
        </div>
      </div>
    </div>
  );
}
