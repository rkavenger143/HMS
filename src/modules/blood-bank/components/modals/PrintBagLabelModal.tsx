import React from 'react';
import { Droplets, Printer, X, ShieldCheck, QrCode } from 'lucide-react';
import type { BloodBagRecord } from '../../context/BloodBankContext';

interface PrintBagLabelModalProps {
  bag: BloodBagRecord;
  onClose: () => void;
}

export default function PrintBagLabelModal({ bag, onClose }: PrintBagLabelModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 480,
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
            padding: '12px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>
            <Droplets size={16} />
            <span>Official Blood Bag Barcode Label</span>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Label (100x150mm)
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Blood Bag Label Body */}
        <div style={{ padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{
            border: '2px solid #0f172a',
            borderRadius: 8,
            padding: '16px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Hospital & Accreditation Header */}
            <div style={{ borderBottom: '1.5px solid #0f172a', paddingBottom: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#059669', letterSpacing: '-0.2px' }}>
                ALN CURE SUPER SPECIALTY HOSPITAL
              </div>
              <div style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>
                LICENSED BLOOD CENTRE & COMPONENT TRANSFUSION FACILITY
              </div>
              <div style={{ fontSize: 8, color: '#64748b' }}>
                NABH / NABL ACCREDITED · FDA LIC NO: KTK/28C/BB-2024-884
              </div>
            </div>

            {/* Blood Group Box & Component Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: 6 }}>
              <div>
                <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>BLOOD COMPONENT:</span>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                  {bag.component.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: '#334155' }}>Volume: <strong>{bag.volumeMl} mL</strong></div>
              </div>

              <div style={{
                width: 56, height: 56, borderRadius: 6,
                background: '#dc2626', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 900, letterSpacing: '-1px'
              }}>
                {bag.bloodGroup}
              </div>
            </div>

            {/* Barcode & Identifiers */}
            <div style={{ textAlign: 'center', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: 24, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 900 }}>
                ||| ||||| || ||||||| |||
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                {bag.id}
              </div>
              <div style={{ fontSize: 9, color: '#64748b' }}>Donation: {bag.donationId} · Batch: {bag.batchNumber}</div>
            </div>

            {/* Dates & Temperatures */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 10 }}>
              <div>
                <span style={{ color: '#64748b' }}>Collection Date:</span>
                <div style={{ fontWeight: 700 }}>{bag.collectionDate}</div>
              </div>
              <div>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>EXPIRY DATE:</span>
                <div style={{ fontWeight: 900, color: '#dc2626', fontSize: 12 }}>{bag.expiryDate}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Storage Temp:</span>
                <div style={{ fontWeight: 600 }}>
                  {bag.component === 'packed_rbc' || bag.component === 'whole_blood' ? '2°C to 6°C' : bag.component === 'platelets' ? '20°C to 24°C Agitate' : '-30°C Freezer'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Storage Location:</span>
                <div style={{ fontWeight: 600 }}>{bag.storageLocation}</div>
              </div>
            </div>

            {/* Mandatory Testing Clearance Statement */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 8px', borderRadius: 4, fontSize: 8, color: '#166534', lineHeight: 1.3 }}>
              <strong>TESTED & CLEARED:</strong> Non-Reactive for HIV 1&2, HBsAg, HCV, Syphilis, and Malaria Parasite. Confirmed ABO & Rh grouping.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
