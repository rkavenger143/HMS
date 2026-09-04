import React from 'react';
import { Printer, X, FileText, Pill, ShieldAlert, HeartPulse } from 'lucide-react';
import type { Consultation, Patient, Doctor, OPDVisit } from '../../../../types';

interface PrintPrescriptionModalProps {
  consultation?: Partial<Consultation> | null;
  patient?: Patient | null;
  doctor?: Doctor | null;
  visit?: OPDVisit | null;
  onClose: () => void;
}

export default function PrintPrescriptionModal({ consultation, patient, doctor, visit, onClose }: PrintPrescriptionModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : visit?.patientName || 'Patient';
  const patientId = patient?.id || visit?.patientId || 'UHID-2026-00001';
  const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : visit?.patientAge || 45;
  const gender = patient?.gender || visit?.patientGender || 'male';
  const bloodGroup = patient?.bloodGroup || visit?.patientBloodGroup || 'O+';
  const doctorName = doctor?.name || visit?.doctorName || 'Dr. Sneha Patel';
  const department = doctor?.department || visit?.department || 'General Medicine';
  const qualifications = doctor?.qualifications?.join(', ') || 'MBBS, MD';
  const regNumber = doctor?.registrationNumber || 'MCI-23456';

  const medicines = consultation?.prescription || [];
  const diagnoses = consultation?.diagnosis || [];
  const vitals = consultation?.vitals || visit?.vitals;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Digital Prescription (Rx)</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Rx Letterhead
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          {/* Prescription Document Sheet */}
          <div
            id="printable-rx-sheet"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '32px 36px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
              minHeight: '650px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Hospital & Doctor Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0A84FF', letterSpacing: '-0.5px' }}>
                    ALN CURE MULTISPECIALITY HOSPITAL
                  </div>
                  <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>
                    Plot 45, Knowledge Park III, Greater Noida, UP - 201306 | Phone: 0120-4001000
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    Email: care@alncurehms.com | Web: www.alncurehms.com
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>{doctorName}</div>
                  <div style={{ fontSize: '12px', color: '#4B5563', fontWeight: '600' }}>{qualifications}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Dept of {department}</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Reg No: {regNumber}</div>
                </div>
              </div>

              {/* Patient Demographics Bar */}
              <div style={{ background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
                <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{patientName}</strong></div>
                <div><span style={{ color: '#6B7280' }}>Age/Sex:</span> <strong>{age} Y / {gender}</strong></div>
                <div><span style={{ color: '#6B7280' }}>Blood Group:</span> <strong style={{ color: '#DC2626' }}>{bloodGroup}</strong></div>
                <div><span style={{ color: '#6B7280' }}>Date:</span> <strong>{consultation?.date || '2026-08-31'}</strong></div>
                <div><span style={{ color: '#6B7280' }}>OPD Visit:</span> <strong>{visit?.id || 'OPD-2026-00102'}</strong></div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#6B7280' }}>Allergies:</span>{' '}
                  <strong style={{ color: patient?.allergies && patient.allergies.length > 0 ? '#DC2626' : '#059669' }}>
                    {patient?.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None Recorded (NKDA)'}
                  </strong>
                </div>
              </div>

              {/* Vitals Ribbon */}
              {vitals && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '4px', marginBottom: '16px', color: '#4B5563' }}>
                  {vitals.bloodPressure && <span>BP: <strong>{vitals.bloodPressure}</strong> mmHg</span>}
                  {vitals.pulse && <span>Pulse: <strong>{vitals.pulse}</strong> bpm</span>}
                  {vitals.temperature && <span>Temp: <strong>{vitals.temperature}</strong> °F</span>}
                  {vitals.spo2 && <span>SpO2: <strong>{vitals.spo2}</strong>%</span>}
                  {vitals.weight && <span>Weight: <strong>{vitals.weight}</strong> kg</span>}
                  {vitals.bmi && <span>BMI: <strong>{vitals.bmi}</strong></span>}
                </div>
              )}

              {/* Chief Complaints & Diagnoses */}
              <div style={{ marginBottom: '16px', fontSize: '12px' }}>
                {consultation?.chiefComplaint && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#374151' }}>Chief Complaint:</strong> {consultation.chiefComplaint}
                  </div>
                )}
                {diagnoses.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#374151' }}>Diagnosis:</strong>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {diagnoses.map((d, i) => (
                        <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '1px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rx Symbol & Medication Table */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'serif', fontStyle: 'italic', color: '#0A84FF', marginBottom: '8px' }}>
                  ℞
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', width: '30px' }}>#</th>
                      <th style={{ padding: '8px 10px' }}>Medicine Name & Strength</th>
                      <th style={{ padding: '8px 10px' }}>Dosage & Route</th>
                      <th style={{ padding: '8px 10px' }}>Frequency</th>
                      <th style={{ padding: '8px 10px' }}>Duration</th>
                      <th style={{ padding: '8px 10px' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((m: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px 10px', color: '#6B7280' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#111827' }}>
                            {m.medicineName} {m.strength && `(${m.strength})`}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#374151' }}>
                            {m.dosage || '1 Tab'} · {m.route || 'Oral'}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: '600', color: '#0A84FF' }}>
                            {m.frequency}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#374151' }}>
                            {m.duration}
                          </td>
                          <td style={{ padding: '8px 10px', fontStyle: 'italic', color: '#4B5563' }}>
                            {m.instructions || 'After meals'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
                          No medications prescribed for this consultation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Advice & General Instructions */}
              {consultation?.notes && (
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Advice & Dietary Instructions:</div>
                  <div style={{ color: '#4B5563', whiteSpace: 'pre-line' }}>{consultation.notes}</div>
                </div>
              )}

              {/* Follow-up Note */}
              {consultation?.followUpDate && (
                <div style={{ fontSize: '12px', color: '#1F2937', fontWeight: '600', marginBottom: '16px' }}>
                  📅 Next Review / Follow-up on:{' '}
                  <span style={{ color: '#0A84FF', fontWeight: '800' }}>{consultation.followUpDate}</span>
                  {consultation.followUpInstructions && <span style={{ fontWeight: 'normal', color: '#6B7280' }}> ({consultation.followUpInstructions})</span>}
                </div>
              )}
            </div>

            {/* Doctor Signature Block & Bottom Stamp */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', maxWidth: '380px' }}>
                * Substitutes permissible with equivalent generic bioequivalence. Please complete full antimicrobial course if prescribed.
              </div>
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <div style={{ height: '36px', borderBottom: '1px solid #374151', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', fontStyle: 'italic', fontSize: '12px' }}>
                  {doctorName}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>Doctor's Signature & Stamp</div>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>Reg No: {regNumber}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
