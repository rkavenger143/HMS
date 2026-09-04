import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import type { Consultation, Patient, Doctor, OPDVisit } from '../../../../types';

interface PrintConsultationModalProps {
  consultation?: Consultation | null;
  patient?: Patient | null;
  doctor?: Doctor | null;
  visit?: OPDVisit | null;
  onClose: () => void;
}

export default function PrintConsultationModal({ consultation, patient, doctor, visit, onClose }: PrintConsultationModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : visit?.patientName || 'Ramesh Yadav';
  const patientId = patient?.id || visit?.patientId || 'ALN-2026-00001';
  const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : visit?.patientAge || 48;
  const gender = patient?.gender || visit?.patientGender || 'male';
  const bloodGroup = patient?.bloodGroup || visit?.patientBloodGroup || 'B+';
  const doctorName = doctor?.name || visit?.doctorName || 'Dr. Rajesh Kumar';
  const department = doctor?.department || visit?.department || 'Cardiology';
  const date = consultation?.date || visit?.visitDate || '2026-08-31';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">OPD Consultation Summary Sheet</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Consultation
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-consultation-sheet"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0A84FF', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Department of {department} — Outpatient Clinical Records
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{doctorName}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Date: {date}</div>
              </div>
            </div>

            {/* Demographics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age/Sex:</span> <strong>{age} Y / {gender}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Blood Group:</span> <strong style={{ color: '#DC2626' }}>{bloodGroup}</strong></div>
            </div>

            {/* Vitals */}
            {consultation?.vitals && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <strong style={{ color: '#1E40AF' }}>Vitals:</strong>
                {consultation.vitals.bloodPressure && <span>BP: <strong>{consultation.vitals.bloodPressure}</strong> mmHg</span>}
                {consultation.vitals.pulse && <span>Pulse: <strong>{consultation.vitals.pulse}</strong> bpm</span>}
                {consultation.vitals.temperature && <span>Temp: <strong>{consultation.vitals.temperature}</strong> °F</span>}
                {consultation.vitals.spo2 && <span>SpO2: <strong>{consultation.vitals.spo2}</strong>%</span>}
                {consultation.vitals.respiratoryRate && <span>RR: <strong>{consultation.vitals.respiratoryRate}</strong> /min</span>}
                {consultation.vitals.bmi && <span>BMI: <strong>{consultation.vitals.bmi}</strong></span>}
              </div>
            )}

            {/* Clinical Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
              <div>
                <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Chief Complaint:</strong>
                <div style={{ marginTop: '2px', color: '#111827' }}>{consultation?.chiefComplaint || visit?.reasonForVisit || 'None recorded'}</div>
              </div>

              {consultation?.history && (
                <div>
                  <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>History of Present Illness / Past History:</strong>
                  <div style={{ marginTop: '2px', color: '#374151', whiteSpace: 'pre-line' }}>{consultation.history}</div>
                </div>
              )}

              {consultation?.examination && (
                <div>
                  <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Clinical Examination & Findings:</strong>
                  <div style={{ marginTop: '2px', color: '#374151', whiteSpace: 'pre-line' }}>{consultation.examination}</div>
                </div>
              )}

              <div>
                <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Diagnosis:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {consultation?.diagnosis && consultation.diagnosis.length > 0 ? (
                    consultation.diagnosis.map((d, i) => (
                      <span key={i} style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                        {d}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6B7280', fontStyle: 'italic' }}>Clinical evaluation pending</span>
                  )}
                </div>
              </div>

              {consultation?.prescription && consultation.prescription.length > 0 && (
                <div>
                  <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Prescribed Medications:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                    {consultation.prescription.map((m, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>
                        <strong>{m.medicineName}</strong> — {m.dosage} ({m.frequency}) for {m.duration} {m.instructions && `[${m.instructions}]`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {consultation?.notes && (
                <div>
                  <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Doctor's Advice & Treatment Plan:</strong>
                  <div style={{ marginTop: '2px', color: '#374151', whiteSpace: 'pre-line' }}>{consultation.notes}</div>
                </div>
              )}

              {consultation?.followUpDate && (
                <div style={{ background: '#F3F4F6', padding: '8px 12px', borderRadius: '4px' }}>
                  <strong>Next Review / Follow-up: </strong>
                  <span style={{ color: '#0A84FF', fontWeight: '800' }}>{consultation.followUpDate}</span>
                </div>
              )}
            </div>

            {/* Signature */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>* Confidential Outpatient Medical Record</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '28px', borderBottom: '1px solid #9CA3AF', marginBottom: '4px', minWidth: '150px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>{doctorName}</div>
                <div>Consultant, Dept of {department}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
