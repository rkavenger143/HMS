import React from 'react';
import { Printer, Download, X, FlaskConical, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ComprehensiveLabOrder } from '../../../../types';

interface PrintLabReportModalProps {
  order: ComprehensiveLabOrder;
  onClose: () => void;
}

export default function PrintLabReportModal({ order, onClose }: PrintLabReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const hasCritical = order.items.some(i => i.results.some(r => r.isCritical));

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 880, background: '#ffffff', color: '#111827' }}>
        {/* Screen Controls Header */}
        <div className="modal-header no-print" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={18} style={{ color: '#0284c7' }} />
            <span className="modal-title" style={{ color: '#0f172a' }}>
              Official Laboratory Diagnostic Report — {order.orderNumber}
            </span>
            {order.version > 1 && (
              <span className="badge badge-warning" style={{ fontSize: 11 }}>
                AMENDED REPORT (v{order.version})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Report
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ color: '#475569' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="modal-body" style={{ padding: '32px 40px', background: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
          {/* Hospital Letterhead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0369a1', letterSpacing: '-0.5px' }}>
                ALN CURE SUPER SPECIALITY HOSPITAL
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Department of Laboratory Medicine & Pathology · NABL & NABH Accredited
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                124 Healthcare Boulevard, Sector 9, Medical District · Ph: +91 11 4567 8900 · lab@alncure.hospital
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', border: '1px solid #0284c7', padding: '4px 10px', borderRadius: 4, background: '#f0f9ff' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0369a1' }}>NABL ACCREDITED LAB</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>ISO 15189:2022 Certified</div>
            </div>
          </div>

          {/* Patient & Order Demographics Box */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '12px 16px', background: '#f8fafc', marginBottom: 20, fontSize: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div>
                <span style={{ color: '#64748b' }}>Patient Name: </span>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{order.patientName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>UHID / Patient ID: </span>
                <strong>{order.patientId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Age / Gender: </span>
                <strong>{order.age} Yrs / {order.gender.toUpperCase()}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Lab Order No: </span>
                <strong style={{ color: '#0369a1' }}>{order.orderNumber}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Encounter: </span>
                <strong>{order.encounterType.toUpperCase()} {order.bedNumber ? `(Bed ${order.bedNumber} - ${order.ward})` : ''}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Ordering Doctor: </span>
                <strong>{order.doctorName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Order Date: </span>
                <strong>{order.orderDate}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Sample ID(s): </span>
                <strong>{order.sampleIds.join(', ')}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Report Release: </span>
                <strong>{new Date().toISOString().replace('T', ' ').slice(0, 16)}</strong>
              </div>
            </div>
            {order.diagnosis && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #cbd5e1', color: '#334155' }}>
                <span style={{ color: '#64748b' }}>Clinical Diagnosis / Notes: </span>
                <strong>{order.diagnosis}</strong> {order.clinicalNotes ? `— ${order.clinicalNotes}` : ''}
              </div>
            )}
          </div>

          {/* Critical Value Warning Callout */}
          {hasCritical && (
            <div style={{ border: '2px solid #ef4444', background: '#fef2f2', padding: '10px 14px', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#991b1b' }}>
                <strong>CRITICAL VALUE ALERT: </strong>
                One or more parameters exceed life-threatening laboratory critical thresholds. Attending physician / clinical team has been escalated.
              </div>
            </div>
          )}

          {/* Test Results Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {order.items.map(item => (
              <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                {/* Section Header */}
                <div style={{ background: '#f1f5f9', padding: '8px 14px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0369a1' }}>
                    {item.testName} <span style={{ fontSize: 11, color: '#64748b' }}>({item.testCode})</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>
                    Specimen: <strong>{item.sampleType}</strong> · Container: <strong>{item.containerType}</strong>
                  </div>
                </div>

                {/* Parameters Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 700 }}>Test Parameter</th>
                      <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 700 }}>Observed Value</th>
                      <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 700 }}>Unit</th>
                      <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 700 }}>Biological Reference Interval</th>
                      <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 700, textAlign: 'center' }}>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.results.length > 0 ? (
                      item.results.map((res, rIdx) => {
                        const isHigh = res.status === 'high' || res.status === 'critical_high';
                        const isLow = res.status === 'low' || res.status === 'critical_low';
                        const isCrit = res.isCritical;

                        return (
                          <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: isCrit ? '#fef2f2' : isHigh || isLow ? '#fffbeb' : 'transparent' }}>
                            <td style={{ padding: '8px 14px', fontWeight: 600, color: '#1e293b' }}>
                              {res.parameterName}
                            </td>
                            <td style={{ padding: '8px 14px', fontWeight: 800, fontSize: 13, color: isCrit ? '#dc2626' : isHigh || isLow ? '#d97706' : '#0f172a' }}>
                              {res.value}
                            </td>
                            <td style={{ padding: '8px 14px', color: '#64748b' }}>
                              {res.unit || '—'}
                            </td>
                            <td style={{ padding: '8px 14px', color: '#475569' }}>
                              {res.referenceRange}
                            </td>
                            <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                              {isCrit ? (
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: 10 }}>
                                  CRITICAL {isHigh ? 'HIGH' : 'LOW'}
                                </span>
                              ) : isHigh ? (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                                  HIGH (↑)
                                </span>
                              ) : isLow ? (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                                  LOW (↓)
                                </span>
                              ) : (
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                                  NORMAL
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                          Parameters pending processing in laboratory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Pathologist Clinical Interpretation & Remarks */}
          {order.pathologistRemarks && (
            <div style={{ marginTop: 16, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc', fontSize: 12 }}>
              <strong style={{ color: '#0369a1' }}>Pathologist Clinical Interpretation: </strong>
              <span style={{ color: '#334155' }}>{order.pathologistRemarks}</span>
            </div>
          )}

          {/* Amendment Notice if applicable */}
          {order.amendmentReason && (
            <div style={{ marginTop: 12, padding: '8px 12px', border: '1px solid #f59e0b', background: '#fffbeb', borderRadius: 6, fontSize: 11, color: '#92400e' }}>
              <strong>AMENDMENT AUDIT NOTE: </strong>
              Amended on {order.amendedAt} by {order.amendedBy}. Reason: {order.amendmentReason}
            </div>
          )}

          {/* Dual Signatures & Authentication Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, marginTop: 36, paddingTop: 16, borderTop: '1px solid #cbd5e1' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                {order.items[0]?.technicianName || 'Sanjay Deshmukh, MLT'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Medical Laboratory Technologist (MLT)</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Processed at: {order.items[0]?.technicianAt || '2026-09-02 10:15'}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
                {order.items[0]?.verifiedBy || 'Dr. Sunita Rao, MD (Pathology)'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Consultant Pathologist & Lab Director</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Verified & Electronically Signed: {order.items[0]?.verifiedAt || '2026-09-02 11:30'}</div>
            </div>
          </div>

          {/* Hospital Regulatory Disclaimer */}
          <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px dashed #e2e8f0', textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
            ✦ Laboratory results are to be correlated clinically by the attending physician. Test methods comply with ISO 15189 standards. End of Official Report.
          </div>
        </div>
      </div>
    </div>
  );
}
