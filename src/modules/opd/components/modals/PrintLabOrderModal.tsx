import React from 'react';
import { Printer, X, FlaskConical, AlertTriangle } from 'lucide-react';
import type { LabRequest, RadiologyStudy, Patient, OPDVisit } from '../../../../types';

interface PrintLabOrderModalProps {
  labOrder?: Partial<LabRequest> | null;
  radiologyOrder?: Partial<RadiologyStudy> | null;
  patient?: Patient | null;
  visit?: OPDVisit | null;
  onClose: () => void;
}

export default function PrintLabOrderModal({ labOrder, radiologyOrder, patient, visit, onClose }: PrintLabOrderModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : visit?.patientName || labOrder?.patientName || 'Patient';
  const patientId = patient?.id || visit?.patientId || labOrder?.patientId || 'UHID-2026-00001';
  const age = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : visit?.patientAge || 45;
  const gender = patient?.gender || visit?.patientGender || 'male';
  const doctorName = visit?.doctorName || labOrder?.doctorName || 'Dr. Sneha Patel';
  const department = visit?.department || 'General Medicine';
  const orderDate = labOrder?.requestDate || radiologyOrder?.scheduledDate || '2026-08-31';
  const priority = labOrder?.priority || radiologyOrder?.priority || 'routine';

  const isRadiology = !!radiologyOrder && !labOrder;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">{isRadiology ? 'Diagnostic Imaging Requisition' : 'Laboratory Investigation Requisition'}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Requisition
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-lab-slip"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '24px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: '800', textTransform: 'uppercase' }}>
                ALN Cure Multispeciality Hospital
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '2px' }}>
                Central Diagnostic Laboratories & Department of Radio-Diagnosis
              </div>
              <div style={{ display: 'inline-block', background: isRadiology ? '#7C3AED' : '#0A84FF', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '4px', marginTop: '6px', textTransform: 'uppercase' }}>
                {isRadiology ? 'RADIOLOGY REQUISITION' : 'LABORATORY TEST ORDER'}
              </div>
            </div>

            {/* Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#F9FAFB', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Name:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age/Sex:</span> <strong>{age} Y / {gender}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Ordering Dr:</span> <strong>{doctorName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Dept:</span> <strong>{department}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Priority:</span> <strong style={{ textTransform: 'uppercase', color: priority === 'stat' ? '#DC2626' : '#111827' }}>{priority}</strong></div>
            </div>

            {/* Tests List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRadiology ? 'Requested Imaging Modalities:' : 'Requested Investigations:'}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', width: '30px' }}>#</th>
                    <th style={{ padding: '6px 8px' }}>Investigation Name</th>
                    <th style={{ padding: '6px 8px' }}>{isRadiology ? 'Modality' : 'Sample Type'}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Est. Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrder?.tests && labOrder.tests.length > 0 ? (
                    labOrder.tests.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '6px 8px', color: '#6B7280' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: '600' }}>{t.testName}</td>
                        <td style={{ padding: '6px 8px', color: '#4B5563' }}>{t.sampleType || 'Blood'}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700' }}>₹{t.price}</td>
                      </tr>
                    ))
                  ) : radiologyOrder ? (
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '6px 8px', color: '#6B7280' }}>1</td>
                      <td style={{ padding: '6px 8px', fontWeight: '600' }}>{radiologyOrder.bodyPart}</td>
                      <td style={{ padding: '6px 8px', color: '#7C3AED', fontWeight: '700', textTransform: 'uppercase' }}>{radiologyOrder.modality}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700' }}>₹{radiologyOrder.price}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF' }}>No tests specified</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Clinical Indications */}
            <div style={{ background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Clinical Indication / Notes:</div>
              <div style={{ color: '#4B5563', fontStyle: 'italic' }}>
                {labOrder?.aiInsight || radiologyOrder?.clinicalHistory || visit?.reasonForVisit || 'Rule out clinical pathology and establish baseline investigation parameters.'}
              </div>
            </div>

            {/* Phlebotomy / Radiologist Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div>Sample Collected By: ____________________</div>
                <div style={{ marginTop: '4px' }}>Date & Time: ____________________</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', marginBottom: '4px', minWidth: '130px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Doctor's Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Order
          </button>
        </div>
      </div>
    </div>
  );
}
