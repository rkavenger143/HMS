import React from 'react';
import { Printer, Download, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { DiagnosticRequest } from '../../../../types';

interface PrintDiagnosticReportModalProps {
  request: DiagnosticRequest;
  onClose: () => void;
  onRelease?: (requestId: string) => void;
}

export default function PrintDiagnosticReportModal({
  request,
  onClose,
  onRelease,
}: PrintDiagnosticReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="modal-title">Official Diagnostic Investigation Report</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Printable Report Sheet */}
          <div
            id="printable-diagnostic-report"
            style={{
              background: 'white',
              color: '#0f172a',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Hospital Letterhead */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: 14,
                borderBottom: '2px solid #0A84FF',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0A84FF', letterSpacing: '-0.5px' }}>
                  ALN CURE MULTISPECIALITY HOSPITAL
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Department of Clinical Diagnostics, Pathology & Diagnostic Imaging
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  NABL Accredited & ISO 15189 Certified Diagnostic Laboratory
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                <div>Emergency Helpline: +91 98765 43200</div>
                <div>Report ID: <strong>#{request.requestId}</strong></div>
                <div>Status: <strong style={{ color: request.reportStatus === 'released' ? '#16a34a' : '#ea580c', textTransform: 'uppercase' }}>{request.reportStatus}</strong></div>
              </div>
            </div>

            {/* Patient & Doctor Demographics Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              <div><strong>Patient Name:</strong> {request.patientName}</div>
              <div><strong>UHID / Patient ID:</strong> {request.patientId}</div>
              <div><strong>Age / Gender:</strong> {request.age} Yrs / {request.gender.toUpperCase()}</div>
              <div><strong>Location:</strong> {request.bedNumber ? `Bed ${request.bedNumber} (${request.ward})` : 'Outpatient (OPD)'}</div>
              <div><strong>Referring Consultant:</strong> {request.doctorName}</div>
              <div><strong>Department:</strong> {request.department}</div>
              <div><strong>Request Date:</strong> {request.requestDate}</div>
              <div><strong>Report Release Date:</strong> {request.reportDate || new Date().toISOString().slice(0, 16).replace('T', ' ')}</div>
              {request.sampleId && (
                <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', paddingTop: 6, marginTop: 2 }}>
                  <strong>Specimen Details:</strong> {request.sampleType} (Sample ID: {request.sampleId} · Barcode: {request.barcode})
                </div>
              )}
            </div>

            {/* Test Heading */}
            <div style={{ marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                {request.testName} [{request.testCode}]
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Investigation Discipline: {request.category.toUpperCase()} ({request.subCategory.toUpperCase()})
              </div>
            </div>

            {/* Results Table */}
            {request.results && request.results.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px', color: '#334155' }}>Test Parameter</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px', color: '#334155' }}>Observed Result</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px', color: '#334155' }}>Biological Ref. Range</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px', color: '#334155' }}>Unit</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#334155' }}>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {request.results.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.parameterName}</td>
                      <td
                        style={{
                          textAlign: 'center',
                          padding: '8px 10px',
                          fontWeight: 700,
                          color: r.status === 'critical' ? '#dc2626' : r.status === 'abnormal' ? '#ea580c' : '#0f172a',
                        }}
                      >
                        {r.value}
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px 10px', color: '#64748b' }}>{r.referenceRange}</td>
                      <td style={{ textAlign: 'center', padding: '8px 10px' }}>{r.unit || '—'}</td>
                      <td style={{ textAlign: 'right', padding: '8px 10px' }}>
                        {r.status === 'critical' ? (
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>CRITICAL</span>
                        ) : r.status === 'abnormal' ? (
                          <span style={{ background: '#ffedd5', color: '#ea580c', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>ABNORMAL</span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>NORMAL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {/* Findings & Impression Text for Imaging & Narrative Studies */}
            {request.findingsText && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Radiological Findings:</div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, lineHeight: 1.5 }}>
                  {request.findingsText}
                </div>
              </div>
            )}

            {request.impressionText && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0A84FF', marginBottom: 4 }}>Clinical Impression:</div>
                <div style={{ background: 'rgba(10, 132, 255, 0.05)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(10, 132, 255, 0.2)', fontSize: 12, fontWeight: 600 }}>
                  {request.impressionText}
                </div>
              </div>
            )}

            {/* Signatures & Accreditation Footer */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 16,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: 11,
                color: '#64748b',
              }}
            >
              <div>
                <div>Performed By: <strong>{request.technicianName || 'Aarti Kulkarni, MLT'}</strong></div>
                <div style={{ fontSize: 10 }}>Electronically verified in HMS Diagnostic Suite</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 12 }}>
                  {request.authorizedBy || 'Dr. Sunita Rao, MD (Pathologist)'}
                </div>
                <div style={{ fontSize: 10 }}>Authorized Clinical Signatory</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          {onRelease && request.reportStatus !== 'released' && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                onRelease(request.id);
                onClose();
              }}
            >
              <CheckCircle2 size={13} /> Authorize & Release Report
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Official Report
          </button>
        </div>
      </div>
    </div>
  );
}
