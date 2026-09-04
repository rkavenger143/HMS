import React from 'react';
import { Printer, X, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import type { ComprehensiveDietChart } from '../../../../types';

interface PrintBedsideDietCardModalProps {
  chart: ComprehensiveDietChart;
  onClose: () => void;
}

export default function PrintBedsideDietCardModal({ chart, onClose }: PrintBedsideDietCardModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const isNPO = chart.dietType === 'npo' || chart.dietConsistency === 'npo';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 540, background: '#ffffff', color: '#1a1a1a' }}
      >
        <div className="modal-header no-print" style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={18} style={{ color: '#0284c7' }} />
            <div className="modal-title" style={{ color: '#111827', fontSize: 16, fontWeight: 700 }}>
              Bedside Diet & Tray Card
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Card
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={13} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body print-area" style={{ padding: '24px 28px', fontSize: 13, color: '#111827' }}>
          {/* Card Frame */}
          <div style={{ border: `3px solid ${isNPO ? '#dc2626' : '#0284c7'}`, borderRadius: 8, padding: 18, background: '#ffffff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0284c7' }}>ALN GENERAL HOSPITAL</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>BEDSIDE NUTRITION & TRAY CARD</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: 4 }}>
                  BED: {chart.bedNumber}
                </span>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{chart.ward}</div>
              </div>
            </div>

            {/* Patient Name */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>PATIENT NAME:</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{chart.patientName}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>UHID: {chart.patientId} · Attending: {chart.doctorName}</div>
            </div>

            {/* Diet Type Highlight */}
            <div style={{
              background: isNPO ? '#fee2e2' : '#f0f9ff',
              border: `2px solid ${isNPO ? '#ef4444' : '#0284c7'}`,
              borderRadius: 6,
              padding: '12px 14px',
              textAlign: 'center',
              marginBottom: 12
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isNPO ? '#b91c1c' : '#0369a1' }}>
                {isNPO ? '⚠️ STRICT NPO FASTING PROTOCOL' : 'PRESCRIBED DIET PLAN'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: isNPO ? '#b91c1c' : '#0284c7', marginTop: 2 }}>
                {chart.dietType.toUpperCase().replace('_', ' ')}
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                Consistency: <strong>{chart.dietConsistency.toUpperCase()}</strong> · Method: <strong>{chart.feedingMethod.toUpperCase()}</strong>
              </div>
            </div>

            {/* Allergies Callout */}
            {chart.allergies.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 6, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#b91c1c', fontSize: 12 }}>FOOD ALLERGIES: </strong>
                  <span style={{ color: '#991b1b', fontWeight: 700, fontSize: 12 }}>{chart.allergies.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            {chart.restrictions.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: 6, marginBottom: 10, fontSize: 12 }}>
                <strong style={{ color: '#92400e' }}>RESTRICTIONS: </strong>
                <span style={{ color: '#78350f' }}>{chart.restrictions.join(' · ')}</span>
              </div>
            )}

            {/* Special Instructions */}
            {chart.specialInstructions && (
              <div style={{ fontSize: 11, color: '#4b5563', borderTop: '1px dashed #cbd5e1', paddingTop: 8, marginTop: 8 }}>
                <strong>Tray Instructions:</strong> {chart.specialInstructions}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 10 }}>
              <span>Dietitian: {chart.dietitianName}</span>
              <span>Updated: {chart.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
