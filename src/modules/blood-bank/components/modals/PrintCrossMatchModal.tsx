import React from 'react';
import { Activity, Printer, X, ShieldCheck } from 'lucide-react';
import type { CrossMatchRecord } from '../../context/BloodBankContext';

interface PrintCrossMatchModalProps {
  crossMatch: CrossMatchRecord;
  onClose: () => void;
}

export default function PrintCrossMatchModal({ crossMatch, onClose }: PrintCrossMatchModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 780,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#059669' }}>
            <Activity size={16} />
            <span>Official Immunohematology Cross-Match Compatibility Certificate</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Certificate (A4)
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div style={{ padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>
              ALN CURE SUPER SPECIALTY HOSPITAL
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Department of Transfusion Medicine & Licensed Blood Centre · NABH / NABL Accredited
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              CERTIFICATE OF PRE-TRANSFUSION CROSS-MATCH COMPATIBILITY
            </div>
          </div>

          {/* Certificate Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 16 }}>
            <div>Cross-Match ID: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{crossMatch.id}</strong></div>
            <div>Requisition ID: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{crossMatch.requestId}</strong></div>
            <div>Test Date: <strong style={{ color: '#0f172a' }}>{crossMatch.testDate}</strong></div>
          </div>

          {/* Patient vs Donor Unit Match Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '50%' }}>Recipient (Patient) Details</th>
                <th style={{ padding: '8px 10px', width: '50%' }}>Donor Blood Unit Details</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>
                  <div>Name: <strong>{crossMatch.patientName}</strong></div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>UHID: {crossMatch.patientId}</div>
                  <div style={{ marginTop: 4 }}>
                    ABO & Rh Group: <strong style={{ fontSize: 14, color: '#dc2626' }}>{crossMatch.patientBloodGroup}</strong>
                  </div>
                </td>
                <td style={{ padding: '10px' }}>
                  <div>Blood Bag ID: <strong style={{ fontFamily: 'monospace' }}>{crossMatch.bagId}</strong></div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Component: {crossMatch.component.toUpperCase()}</div>
                  <div style={{ marginTop: 4 }}>
                    Donor Unit Group: <strong style={{ fontSize: 14, color: '#dc2626' }}>{crossMatch.bagBloodGroup}</strong>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Serological Test Results */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '14px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#0f172a', marginBottom: 8, textTransform: 'uppercase' }}>
              Immunohematological Laboratory Serology Findings
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 11 }}>
              <div>
                <span style={{ color: '#64748b' }}>Major Cross-Match:</span>
                <div style={{ fontWeight: 700, fontSize: 13, color: crossMatch.majorCrossmatch === 'compatible' ? '#15803d' : '#dc2626' }}>
                  {crossMatch.majorCrossmatch.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Saline + Albumin at 37°C</div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Minor Cross-Match:</span>
                <div style={{ fontWeight: 700, fontSize: 13, color: crossMatch.minorCrossmatch === 'compatible' ? '#15803d' : '#dc2626' }}>
                  {crossMatch.minorCrossmatch.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Donor Serum + Patient Cells</div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Antiglobulin / Coombs:</span>
                <div style={{ fontWeight: 700, fontSize: 13, color: crossMatch.coombsTest === 'negative' ? '#15803d' : '#dc2626' }}>
                  {crossMatch.coombsTest.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Indirect Antiglobulin Phase</div>
              </div>
            </div>
          </div>

          {/* Final Certification Statement */}
          <div style={{
            background: crossMatch.overallResult === 'compatible' ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${crossMatch.overallResult === 'compatible' ? '#86efac' : '#fca5a5'}`,
            borderRadius: 8,
            padding: '16px',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: crossMatch.overallResult === 'compatible' ? '#15803d' : '#b91c1c' }}>
              {crossMatch.overallResult === 'compatible' ? '✓ CERTIFIED COMPATIBLE FOR TRANSFUSION' : '✕ INCOMPATIBLE — TRANSFUSION PROHIBITED'}
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>
              {crossMatch.remarks || 'No agglutination or hemolysis detected in all tested phases. Unit cleared for patient issue.'}
            </div>
          </div>

          {/* Signoff Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, marginTop: 40, fontSize: 11 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: 24, marginBottom: 4 }} />
              <strong>{crossMatch.testedBy}</strong>
              <div style={{ color: '#64748b' }}>Testing Medical Technologist</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: 24, marginBottom: 4 }} />
              <strong>{crossMatch.verifiedBy}</strong>
              <div style={{ color: '#64748b' }}>Authorized Blood Bank Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
