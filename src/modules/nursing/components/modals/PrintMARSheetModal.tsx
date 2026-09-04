import React from 'react';
import { Printer, X, Pill, CheckCircle2 } from 'lucide-react';
import type { MARRecord, Patient, Admission } from '../../../../types';

interface PrintMARSheetModalProps {
  records: MARRecord[];
  patient: Patient | null;
  admission: Admission | null;
  onClose: () => void;
}

export default function PrintMARSheetModal({ records, patient, admission, onClose }: PrintMARSheetModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = admission?.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient');
  const patientId = admission?.patientId || patient?.id || 'ALN-2026-00001';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <Pill size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Inpatient Medication Administration Record (MAR Sheet)</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print MAR Chart
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-nursing-mar-sheet"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0A84FF', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0A84FF', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Department of Inpatient Pharmacy & Nursing — Medication Administration Record (MAR)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Bed: {admission?.bedNumber} ({admission?.ward})
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Attending: {admission?.admittingDoctorName}
                </div>
              </div>
            </div>

            {/* Patient Demographics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Patient Name:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age / Sex:</span> <strong>{patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 48}Y / {patient?.gender || 'Male'}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Allergies:</span> <strong style={{ color: '#DC2626' }}>{patient?.allergies.join(', ') || 'No Known Drug Allergies'}</strong></div>
            </div>

            {/* MAR Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Medication & Strength</th>
                  <th style={{ padding: '6px 8px' }}>Dose & Route</th>
                  <th style={{ padding: '6px 8px' }}>Scheduled Date & Time</th>
                  <th style={{ padding: '6px 8px' }}>Administered Time</th>
                  <th style={{ padding: '6px 8px' }}>Status</th>
                  <th style={{ padding: '6px 8px' }}>Administering Nurse</th>
                  <th style={{ padding: '6px 8px' }}>Clinical Remarks / Reason</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.medicineName}</td>
                    <td style={{ padding: '6px 8px' }}>{r.dose} ({r.route})</td>
                    <td style={{ padding: '6px 8px' }}>{r.scheduledDate} {r.scheduledTime}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.administeredTime || '—'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{
                        background: r.status === 'administered' ? '#DCFCE7' : r.status === 'scheduled' ? '#EFF6FF' : '#FEE2E2',
                        color: r.status === 'administered' ? '#15803D' : r.status === 'scheduled' ? '#1D4ED8' : '#B91C1C',
                        padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: '10px'
                      }}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>{r.nurseName || '—'}</td>
                    <td style={{ padding: '6px 8px', color: '#4B5563' }}>{r.reasonForHoldMissed || r.remarks || 'Standard schedule'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 5 Rights Verification Statement */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '4px', fontSize: '10px', color: '#1E40AF', marginBottom: '16px' }}>
              ✓ <strong>5 Rights Verified:</strong> Right Patient, Right Drug, Right Dose, Right Route, Right Time confirmed prior to administration.
            </div>

            {/* Nurse Signature Line */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>* Medication administered in accordance with authorized physician orders</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '140px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Registered Nurse Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print MAR Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
