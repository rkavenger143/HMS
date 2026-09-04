import React from 'react';
import { FileText, Printer, X } from 'lucide-react';

interface PrintConsultationSummaryModalProps {
  summary: any;
  onClose: () => void;
}

export default function PrintConsultationSummaryModal({ summary, onClose }: PrintConsultationSummaryModalProps) {
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
        {/* Header Bar */}
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
            <FileText size={16} />
            <span>Official Clinical Consultation Summary</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Summary (A4)
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Summary Body */}
        <div style={{ padding: '32px 36px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12 }}>
          {/* Hospital Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>
              ALN CURE SUPER SPECIALTY HOSPITAL
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              124 Healthcare Boulevard, Medical District, Bengaluru · Department of {summary.department}
            </div>
            <div style={{ fontWeight: 800, fontSize: 13, marginTop: 4, textTransform: 'uppercase' }}>
              OUTPATIENT CLINICAL CONSULTATION SUMMARY
            </div>
          </div>

          {/* Patient Details Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <div>
              <span style={{ color: '#64748b' }}>Patient:</span>
              <div style={{ fontWeight: 700 }}>{summary.patientName} ({summary.patientId})</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Consulting Doctor:</span>
              <div style={{ fontWeight: 700 }}>{summary.doctorName}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Consultation Date:</span>
              <div style={{ fontWeight: 600 }}>{summary.date}</div>
            </div>
          </div>

          {/* Clinical Record Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div>
              <strong style={{ color: '#059669' }}>Chief Complaints & History:</strong>
              <div style={{ marginTop: 2, color: '#334155' }}>{summary.chiefComplaint}</div>
            </div>

            <div>
              <strong style={{ color: '#059669' }}>Physical Examination Findings:</strong>
              <div style={{ marginTop: 2, color: '#334155' }}>{summary.examinationFindings}</div>
            </div>

            <div>
              <strong style={{ color: '#059669' }}>Final Clinical Diagnosis:</strong>
              <div style={{ marginTop: 2, fontWeight: 700, color: '#0f172a' }}>{summary.primaryDiagnosis}</div>
            </div>

            <div>
              <strong style={{ color: '#059669' }}>Prescribed Medication Regimen:</strong>
              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                {(summary.medicines || []).map((m: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: 2 }}>
                    <strong>{m.name}</strong> — {m.frequency} for {m.duration} ({m.instructions})
                  </li>
                ))}
              </ul>
            </div>

            {((summary.labOrders && summary.labOrders.length > 0) || (summary.radiologyOrders && summary.radiologyOrders.length > 0)) && (
              <div>
                <strong style={{ color: '#059669' }}>Ordered Investigations:</strong>
                <div style={{ marginTop: 2 }}>
                  {summary.labOrders?.length > 0 && <span>Lab: {summary.labOrders.join(', ')}. </span>}
                  {summary.radiologyOrders?.length > 0 && <span>Imaging: {summary.radiologyOrders.join(', ')}.</span>}
                </div>
              </div>
            )}

            <div>
              <strong style={{ color: '#059669' }}>Review / Follow-up Advice:</strong>
              <div style={{ marginTop: 2 }}>Follow-up scheduled on <strong>{summary.followUpDate}</strong></div>
            </div>
          </div>

          {/* Signoff */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
            <div style={{ textAlign: 'center', minWidth: 200 }}>
              <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: 24, marginBottom: 4 }} />
              <strong>{summary.doctorName}</strong>
              <div style={{ fontSize: 10, color: '#64748b' }}>Department of {summary.department}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
