import React from 'react';
import { Printer, Download, X, Scan, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ComprehensiveRadiologyOrder } from '../../../../types';

interface PrintRadiologyReportModalProps {
  order: ComprehensiveRadiologyOrder;
  onClose: () => void;
}

export default function PrintRadiologyReportModal({ order, onClose }: PrintRadiologyReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 860, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Toolbar */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scan size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="modal-title" style={{ fontSize: 16 }}>Official Diagnostic Radiology & Imaging Report</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Accession No: <strong>{order.accessionNumber}</strong> · Order: {order.orderNumber}
              </div>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Report
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          className="modal-body"
          style={{
            overflowY: 'auto',
            padding: 32,
            background: '#ffffff',
            color: '#111827',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            lineHeight: 1.5,
          }}
        >
          {/* Hospital Header */}
          <div style={{ borderBottom: '2px solid #0A84FF', paddingBottom: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0A84FF', letterSpacing: '-0.5px' }}>
                  ALN CURE MULTISPECIALITY HOSPITAL
                </div>
                <div style={{ fontSize: 11, color: '#4B5563', marginTop: 2 }}>
                  DEPARTMENT OF RADIODIAGNOSIS & CLINICAL IMAGING
                </div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>
                  NABH & NABL Accredited Diagnostic Center · ISO 15189:2022 Certified
                </div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>
                  100 Feet Ring Road, Medical District, Bengaluru - 560076 · Emergency: 108 / (080) 4567-8900
                </div>
              </div>

              {/* Barcode / QR Simulation */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#F3F4F6', padding: '6px 10px', borderRadius: 4, border: '1px solid #E5E7EB', display: 'inline-block' }}>
                  <div style={{ fontSize: 9, color: '#6B7280', fontWeight: 600 }}>ACCESSION BARCODE</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#111827', letterSpacing: 1 }}>
                    *{order.accessionNumber}*
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 4 }}>
                  ● VERIFIED ELECTRONIC REPORT
                </div>
              </div>
            </div>
          </div>

          {/* Patient Demographics & Investigation Header */}
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px 24px',
              fontSize: 12,
            }}
          >
            <div>
              <span style={{ color: '#6B7280' }}>Patient Name: </span>
              <strong style={{ color: '#111827', fontSize: 13 }}>{order.patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Accession Number: </span>
              <strong style={{ color: '#0A84FF' }}>{order.accessionNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Patient UHID / ID: </span>
              <strong>{order.patientId}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Order ID: </span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Age / Gender: </span>
              <strong>{order.age} Years / {order.gender.toUpperCase()}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Encounter: </span>
              <strong>{order.encounterType.toUpperCase()} {order.bedNumber ? `· Bed ${order.bedNumber} (${order.ward})` : ''}</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Referring Doctor: </span>
              <strong>{order.referringDoctorName} ({order.department})</strong>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Study Date & Time: </span>
              <strong>{order.technicianAt || order.scheduledDate || order.orderDate}</strong>
            </div>
          </div>

          {/* Investigation Banner */}
          <div style={{ background: '#EFF6FF', borderLeft: '4px solid #0A84FF', padding: '10px 14px', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1E40AF' }}>
              EXAMINATION: {order.examName.toUpperCase()} ({order.modalityType.toUpperCase()})
            </div>
            <div style={{ fontSize: 11, color: '#3B82F6', marginTop: 2 }}>
              Anatomical Region: <strong>{order.bodyPart}</strong> {order.contrastRequired ? '· Intravenous Contrast Enhanced' : '· Non-Contrast'}
            </div>
          </div>

          {/* Critical Value Alert Banner if applicable */}
          {order.isCriticalFinding && (
            <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: 6, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#991B1B' }}>CRITICAL / PANIC RADIOLOGICAL FINDING ESCALATED</div>
                <div style={{ fontSize: 11, color: '#B91C1C' }}>
                  {order.criticalFindingRemarks || 'Life-threatening radiological emergency verbally communicated to attending clinical team.'}
                </div>
              </div>
            </div>
          )}

          {/* Clinical Indication */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, borderBottom: '1px solid #E5E7EB', paddingBottom: 2 }}>
              Clinical History & Indication
            </div>
            <div style={{ fontSize: 12, color: '#1F2937' }}>
              {order.clinicalIndication || order.clinicalNotes || 'No specific clinical history provided with requisition.'}
            </div>
          </div>

          {/* Technique */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, borderBottom: '1px solid #E5E7EB', paddingBottom: 2 }}>
              Examination Technique
            </div>
            <div style={{ fontSize: 12, color: '#1F2937' }}>
              {order.technique || `Standard high-resolution imaging protocol performed for ${order.bodyPart}. Acquired series: ${order.seriesCount || 2}, Total images: ${order.imageCount || 48}.`}
            </div>
          </div>

          {/* Findings */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, borderBottom: '1px solid #E5E7EB', paddingBottom: 2 }}>
              Observations & Findings
            </div>
            <div style={{ fontSize: 12.5, color: '#111827', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {order.findingsText || 'Diagnostic findings pending final specialist signoff.'}
            </div>
          </div>

          {/* Impression (Boxed) */}
          <div style={{ background: '#F9FAFB', border: '2px solid #D1D5DB', borderRadius: 6, padding: '14px 18px', marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              IMPRESSION / CONCLUSION:
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: order.isCriticalFinding ? '#DC2626' : '#1F2937', lineHeight: 1.6 }}>
              {order.impressionText || 'Findings to be correlated clinically.'}
            </div>
          </div>

          {/* Recommendations */}
          {order.recommendations && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Clinical Recommendations / Suggestions:
              </div>
              <div style={{ fontSize: 12, color: '#4B5563', fontStyle: 'italic' }}>
                {order.recommendations}
              </div>
            </div>
          )}

          {/* Signatures & Accreditation Footer */}
          <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: 16, marginTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 10, color: '#6B7280', maxWidth: 360 }}>
              <div>Technologist: <strong>{order.technicianName || 'Certified Radiographer'}</strong></div>
              <div style={{ marginTop: 2 }}>Study UID: {order.studyUid || '1.2.840.113619.2.55.3.2831164'}</div>
              <div style={{ marginTop: 2 }}>Report Released: {order.radiologistAt || order.orderDate} · Version {order.version || 1}</div>
              <div style={{ marginTop: 6, fontSize: 9, color: '#9CA3AF' }}>
                Radiological findings are to be correlated with clinical examination and laboratory data. This is an electronically signed diagnostic report.
              </div>
            </div>

            {/* Consultant Radiologist Signature */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: 22, color: '#1E40AF', marginBottom: -2 }}>
                {order.radiologistName || 'Dr. Vivek Malhotra'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>
                {order.radiologistName || 'Dr. Vivek Malhotra, MD, DMRD'}
              </div>
              <div style={{ fontSize: 10, color: '#4B5563' }}>Consultant Radiologist & Imaging Specialist</div>
              <div style={{ fontSize: 9, color: '#6B7280' }}>KMC Reg No: 58942 · Radiodiagnosis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
