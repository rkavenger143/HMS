import React from 'react';
import { Printer, X, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { IPDDischargeRecord, Patient, Admission } from '../../../../types';

interface PrintDischargeSummaryModalProps {
  record: IPDDischargeRecord;
  patient?: Patient | null;
  admission?: Admission | null;
  onClose: () => void;
}

export default function PrintDischargeSummaryModal({ record, patient, admission, onClose }: PrintDischargeSummaryModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = record.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient');
  const patientId = record.patientId || patient?.id || 'ALN-2026-00001';
  const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 48;
  const gender = patient?.gender || 'male';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Inpatient (IPD) Discharge Summary</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Discharge Summary
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-ipd-discharge-summary"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0A84FF', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Department of Clinical Inpatient Services — Discharge Summary Sheet
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Discharge ID: <span style={{ color: '#0A84FF' }}>{record.id}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Admission: {record.admissionDate} → Discharge: {record.dischargeDate}
                </div>
              </div>
            </div>

            {/* Patient Demographics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age / Sex:</span> <strong>{age} Y / {gender}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Consultant:</span> <strong>{record.consultantName}</strong></div>
            </div>

            {/* Clinical Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
              {/* Final Diagnosis */}
              <div>
                <strong style={{ color: '#1E40AF', textTransform: 'uppercase', fontSize: '11px' }}>Final Clinical Diagnosis:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {record.finalDiagnosis && record.finalDiagnosis.map((d, i) => (
                    <span key={i} style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px', border: '1px solid #BFDBFE' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Summary & Course in Hospital */}
              <div>
                <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Clinical Summary & Presenting Complaint:</strong>
                <div style={{ marginTop: '2px', color: '#374151' }}>{record.clinicalSummary || 'Patient was admitted with acute complaints for inpatient evaluation and management.'}</div>
              </div>

              <div>
                <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Hospital Course & Treatment Given:</strong>
                <div style={{ marginTop: '2px', color: '#374151', whiteSpace: 'pre-line' }}>{record.hospitalCourse || record.treatmentGiven || 'Managed with appropriate medications and supportive care.'}</div>
              </div>

              {/* Procedures */}
              {record.proceduresDone && record.proceduresDone.length > 0 && (
                <div>
                  <strong style={{ color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>Procedures Performed:</strong>
                  <div style={{ marginTop: '2px', color: '#111827', fontWeight: 600 }}>{record.proceduresDone.join(', ')}</div>
                </div>
              )}

              {/* Condition at Discharge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F9FAFB', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                <div><strong>Discharge Type:</strong> <span style={{ textTransform: 'capitalize' }}>{record.dischargeType}</span></div>
                <div><strong>Condition at Discharge:</strong> <span style={{ color: '#059669', fontWeight: '800', textTransform: 'uppercase' }}>{record.conditionAtDischarge}</span></div>
              </div>

              {/* Discharge Medications Table */}
              <div>
                <strong style={{ color: '#1E40AF', textTransform: 'uppercase', fontSize: '11px' }}>Discharge Medications & Advice:</strong>
                {record.dischargeMedications && record.dischargeMedications.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#F3F4F6', textAlign: 'left', borderBottom: '1px solid #D1D5DB' }}>
                        <th style={{ padding: '6px 8px' }}>Medicine Name</th>
                        <th style={{ padding: '6px 8px' }}>Dosage</th>
                        <th style={{ padding: '6px 8px' }}>Frequency</th>
                        <th style={{ padding: '6px 8px' }}>Duration</th>
                        <th style={{ padding: '6px 8px' }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.dischargeMedications.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>{m.medicineName}</td>
                          <td style={{ padding: '6px 8px' }}>{m.dosage}</td>
                          <td style={{ padding: '6px 8px', color: '#0A84FF', fontWeight: 600 }}>{m.frequency}</td>
                          <td style={{ padding: '6px 8px' }}>{m.duration}</td>
                          <td style={{ padding: '6px 8px', color: '#4B5563' }}>{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontStyle: 'italic', color: '#6B7280', marginTop: '4px' }}>Continue previous oral medications as advised.</div>
                )}
              </div>

              {/* Follow-up Date */}
              <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Next Review / Follow-Up Date:</strong> <span style={{ color: '#0A84FF', fontWeight: '800' }}>{record.followUpDate}</span></span>
                  <span><strong>Consultant:</strong> {record.followUpDoctor || record.consultantName}</span>
                </div>
                {record.followUpInstructions && (
                  <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '4px' }}>
                    Instructions: {record.followUpInstructions}
                  </div>
                )}
              </div>
            </div>

            {/* Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', color: '#6B7280' }}>
              <div>
                <div>* Emergency Helpline: 0120-5000 (Available 24x7)</div>
                <div>* Please report immediately in case of fever, breathlessness, or unusual pain.</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '30px', borderBottom: '1px solid #9CA3AF', width: '160px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>{record.consultantName}</div>
                <div>Attending Consultant Physician / Surgeon</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Discharge Summary
          </button>
        </div>
      </div>
    </div>
  );
}
