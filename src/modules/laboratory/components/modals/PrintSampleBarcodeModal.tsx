import React from 'react';
import { Printer, X, QrCode, Barcode, CheckCircle2 } from 'lucide-react';
import type { LabSampleRecord } from '../../../../types';

interface PrintSampleBarcodeModalProps {
  sample: LabSampleRecord;
  onClose: () => void;
}

export default function PrintSampleBarcodeModal({ sample, onClose }: PrintSampleBarcodeModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, background: '#ffffff', color: '#111827' }}>
        {/* Header */}
        <div className="modal-header no-print" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Barcode size={18} style={{ color: '#0284c7' }} />
            <span className="modal-title" style={{ color: '#0f172a' }}>
              Phlebotomy Specimen Tube Barcode Label
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Label
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ color: '#475569' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Label (Standard 50mm x 25mm Thermal Label layout) */}
        <div className="modal-body" style={{ padding: '24px 28px', background: '#ffffff', color: '#0f172a' }}>
          <div
            style={{
              border: '2px dashed #0284c7',
              borderRadius: 8,
              padding: 16,
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0369a1' }}>ALN CURE PATH LAB</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>SPECIMEN TUBE IDENTIFIER</div>
              </div>
              <span
                style={{
                  background: sample.priority === 'stat' ? '#fee2e2' : '#f1f5f9',
                  color: sample.priority === 'stat' ? '#991b1b' : '#334155',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {sample.priority.toUpperCase()}
              </span>
            </div>

            {/* Patient & Sample Info */}
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{sample.patientName}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                UHID: <strong>{sample.patientId}</strong> {sample.bedNumber ? `· Bed: ${sample.bedNumber}` : ''}
              </div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                Specimen: <strong>{sample.sampleType}</strong>
              </div>
              <div style={{ color: '#0369a1', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                Container: {sample.containerType}
              </div>
            </div>

            {/* Barcode Graphic Simulation */}
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '10px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 26,
                  letterSpacing: '3px',
                  lineHeight: 1,
                  color: '#0f172a',
                  fontWeight: 900,
                }}
              >
                ||| | |||| | || ||| || ||| |
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', marginTop: 4, letterSpacing: '1px' }}>
                *{sample.barcode}*
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginTop: 2 }}>
                ID: {sample.sampleId}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginTop: 8 }}>
              <span>Coll: {sample.collectedAt || new Date().toISOString().slice(0, 16)}</span>
              <span>By: {sample.collectedBy || 'Phlebotomist'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
