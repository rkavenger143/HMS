import React from 'react';
import { Pill, Printer, Download, X, Building2, User, Calendar } from 'lucide-react';
import type { Doctor } from '../../../../types';

interface PrintPrescriptionModalProps {
  consultation: any;
  doctor: Doctor;
  onClose: () => void;
}

export default function PrintPrescriptionModal({ consultation, doctor, onClose }: PrintPrescriptionModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 800,
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: '#059669' }}>
            <Pill size={16} />
            <span>Official Electronic Prescription Slip (Rx)</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Prescription (A4)
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div style={{ padding: '32px 36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Hospital Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', letterSpacing: '-0.3px' }}>
                ALN CURE SUPER SPECIALTY HOSPITAL
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                124 Healthcare Boulevard, Medical District, Bengaluru · NABH & NABL Accredited
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Tel: +91 80 4912 8800 · Emergency: 108 · Web: www.alncurehospital.com
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{doctor.name}</div>
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{doctor.specialization}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                Reg #: {doctor.registrationNumber || 'MCI-8849'}
              </div>
            </div>
          </div>

          {/* Patient Demographics Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 12, marginBottom: 16 }}>
            <div>
              <span style={{ color: '#64748b' }}>Patient Name:</span>
              <div style={{ fontWeight: 700 }}>{consultation.patientName}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>UHID:</span>
              <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{consultation.patientId}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Age / Gender:</span>
              <div style={{ fontWeight: 600 }}>{consultation.age}y / {consultation.gender}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Date:</span>
              <div style={{ fontWeight: 600 }}>{consultation.consultationDate || new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

          {/* Clinical Findings & Diagnosis */}
          <div style={{ marginBottom: 16, fontSize: 12 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <strong style={{ color: '#0f172a', minWidth: 140 }}>Diagnosis:</strong>
              <span style={{ color: '#059669', fontWeight: 700 }}>{consultation.primaryDiagnosis} {consultation.icdCode ? `(${consultation.icdCode})` : ''}</span>
            </div>
            {consultation.vitals && (
              <div style={{ display: 'flex', gap: 6, color: '#475569', fontSize: 11 }}>
                <strong style={{ minWidth: 140 }}>Recorded Vitals:</strong>
                <span>BP: {consultation.vitals.bp || '130/80'} mmHg · Pulse: {consultation.vitals.pulse || 76} bpm · SpO2: {consultation.vitals.spo2 || 98}%</span>
              </div>
            )}
          </div>

          {/* Rx Icon & Medications Table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', marginBottom: 8, fontFamily: 'serif' }}>
              ℞
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', width: 30 }}>#</th>
                  <th style={{ padding: '8px 10px' }}>Medicine Name</th>
                  <th style={{ padding: '8px 10px', width: 100 }}>Frequency</th>
                  <th style={{ padding: '8px 10px', width: 90 }}>Duration</th>
                  <th style={{ padding: '8px 10px' }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {(consultation.medicines || []).map((med: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{med.name}</td>
                    <td style={{ padding: '8px 10px' }}>{med.frequency}</td>
                    <td style={{ padding: '8px 10px' }}>{med.duration}</td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommended Investigations */}
          {((consultation.labOrders && consultation.labOrders.length > 0) || (consultation.radiologyOrders && consultation.radiologyOrders.length > 0)) && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 11 }}>
              <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>Recommended Diagnostic Investigations:</strong>
              <div style={{ marginTop: 4, color: '#334155' }}>
                {consultation.labOrders?.length > 0 && <div>🧪 <strong>Lab:</strong> {consultation.labOrders.join(', ')}</div>}
                {consultation.radiologyOrders?.length > 0 && <div style={{ marginTop: 2 }}>🩻 <strong>Imaging:</strong> {consultation.radiologyOrders.join(', ')}</div>}
              </div>
            </div>
          )}

          {/* Follow-up & Advice */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 24, fontSize: 12 }}>
            <div>
              <strong>Follow-up:</strong> Review on <strong>{consultation.followUpDate || 'In 2 Weeks'}</strong>
            </div>
            {consultation.followUpInstructions && (
              <div style={{ color: '#475569', marginTop: 2 }}>
                <strong>Advice:</strong> {consultation.followUpInstructions}
              </div>
            )}
          </div>

          {/* Doctor Signature */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
            <div style={{ textAlign: 'center', minWidth: 200 }}>
              <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: 30, marginBottom: 6 }} />
              <strong style={{ fontSize: 13 }}>{doctor.name}</strong>
              <div style={{ fontSize: 11, color: '#64748b' }}>Authorized Consulting Physician</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
