import React from 'react';
import { Printer, X, FileText, CheckCircle2, BedDouble, ShieldCheck, User } from 'lucide-react';
import type { Admission, Patient, Bed } from '../../../../types';

interface PrintAdmissionSlipModalProps {
  admission: Admission;
  patient?: Patient | null;
  bed?: Bed | null;
  onClose: () => void;
}

export default function PrintAdmissionSlipModal({ admission, patient, bed, onClose }: PrintAdmissionSlipModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = admission.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient');
  const patientId = admission.patientId || patient?.id || 'ALN-2026-00001';
  const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 48;
  const gender = patient?.gender || 'male';
  const bloodGroup = patient?.bloodGroup || 'B+';
  const phone = patient?.phone || '9123456781';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <BedDouble size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Inpatient (IPD) Admission & Attendant Pass</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Admission Pass
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-ipd-admission-pass"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Hospital Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0A84FF', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Inpatient Department (IPD) — Official Admission Record & Attendant Pass
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Admission ID: <span style={{ color: '#0A84FF' }}>{admission.id}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Date: {admission.admissionDate} | {admission.admissionTime}
                </div>
              </div>
            </div>

            {/* Barcode Simulation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '8px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #E5E7EB' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase' }}>Patient UHID</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{patientId}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ letterSpacing: '4px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>
                  ||| | | |||| | ||| |||| |
                </div>
                <div style={{ fontSize: '9px', color: '#9CA3AF' }}>*{admission.id}*</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: admission.mlc ? '#FEE2E2' : '#DCFCE7', color: admission.mlc ? '#B91C1C' : '#15803D', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {admission.mlc ? 'MEDICO-LEGAL CASE (MLC)' : 'NON-MLC ADMISSION'}
                </span>
              </div>
            </div>

            {/* Patient Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px', marginBottom: '16px', background: '#F3F4F6', padding: '12px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>Patient Name:</span> <br /><strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age / Gender:</span> <br /><strong>{age} Yrs / {gender}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Blood Group:</span> <br /><strong style={{ color: '#DC2626' }}>{bloodGroup}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Mobile:</span> <br /><strong>{phone}</strong></div>
            </div>

            {/* Bed & Ward Allocation Box */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px', borderRadius: '6px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#1E40AF', fontSize: '11px' }}>Allocated Bed:</span>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#1D4ED8' }}>{admission.bedNumber}</div>
              </div>
              <div>
                <span style={{ color: '#1E40AF', fontSize: '11px' }}>Ward / Unit:</span>
                <div style={{ fontWeight: '800', color: '#111827' }}>{admission.ward}</div>
              </div>
              <div>
                <span style={{ color: '#1E40AF', fontSize: '11px' }}>Attending Consultant:</span>
                <div style={{ fontWeight: '800', color: '#111827' }}>{admission.admittingDoctorName}</div>
              </div>
              <div>
                <span style={{ color: '#1E40AF', fontSize: '11px' }}>Daily Bed Tariff:</span>
                <div style={{ fontWeight: '800', color: '#059669' }}>₹{bed?.dailyRate || 800}/day</div>
              </div>
            </div>

            {/* Clinical Admission Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '16px' }}>
              <div>
                <strong style={{ color: '#374151' }}>Provisional Admitting Diagnosis:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {admission.diagnosis.map((d, i) => (
                    <span key={i} style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px', border: '1px solid #FDE68A' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ color: '#374151' }}>Admission Notes & Clinical Instructions:</strong>
                <div style={{ color: '#4B5563', marginTop: '2px' }}>{admission.admissionNotes || 'Routine inpatient admission for monitoring and therapy.'}</div>
              </div>

              {/* Attendant Pass Section */}
              <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: '12px', marginTop: '6px' }}>
                <strong style={{ color: '#111827', textTransform: 'uppercase', fontSize: '11px' }}>Attendant Information (Pass 1 of 1):</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
                  <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{admission.attendantName || 'Relative'}</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Relationship:</span> <strong>{admission.attendantRelation || 'Family'}</strong></div>
                  <div><span style={{ color: '#6B7280' }}>Phone:</span> <strong>{admission.attendantPhone || phone}</strong></div>
                </div>
              </div>
            </div>

            {/* Hospital Terms & Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div>* Visiting Hours: 11:00 AM - 12:00 PM & 05:00 PM - 07:00 PM</div>
                <div>* Please carry this pass at all times inside inpatient wards.</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '140px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Admission Desk Officer</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Admission Slip
          </button>
        </div>
      </div>
    </div>
  );
}
