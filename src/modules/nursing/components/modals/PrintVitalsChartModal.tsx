import React from 'react';
import { Printer, X, Activity, HeartPulse } from 'lucide-react';
import type { ComprehensiveVitals, Patient, Admission } from '../../../../types';

interface PrintVitalsChartModalProps {
  vitals: ComprehensiveVitals[];
  patient: Patient | null;
  admission: Admission | null;
  onClose: () => void;
}

export default function PrintVitalsChartModal({ vitals, patient, admission, onClose }: PrintVitalsChartModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patientName = admission?.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Inpatient');
  const patientId = admission?.patientId || patient?.id || 'ALN-2026-00001';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <Activity size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Official Inpatient Vital Signs Graphic Chart & Timeline</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Vitals Sheet
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-nursing-vitals-sheet"
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
                  Nursing Department — 24-Hour Clinical Vital Signs Monitoring Chart
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Ward: {admission?.ward || 'General Ward'} · Bed: {admission?.bedNumber || 'GA-01'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Adm ID: {admission?.id} · Date: 2026-08-31
                </div>
              </div>
            </div>

            {/* Patient Demographics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>UHID:</span> <strong>{patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Patient:</span> <strong>{patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Age / Sex:</span> <strong>{patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 48}Y / {patient?.gender || 'Male'}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Blood Group:</span> <strong style={{ color: '#DC2626' }}>{patient?.bloodGroup || 'B+'}</strong></div>
            </div>

            {/* Vitals Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Date & Time</th>
                  <th style={{ padding: '6px 8px' }}>BP (mmHg)</th>
                  <th style={{ padding: '6px 8px' }}>Pulse (bpm)</th>
                  <th style={{ padding: '6px 8px' }}>Temp (°F)</th>
                  <th style={{ padding: '6px 8px' }}>SpO2 (%)</th>
                  <th style={{ padding: '6px 8px' }}>RR (/min)</th>
                  <th style={{ padding: '6px 8px' }}>Blood Sugar</th>
                  <th style={{ padding: '6px 8px' }}>Pain (0-10)</th>
                  <th style={{ padding: '6px 8px' }}>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #E5E7EB', background: v.isAbnormal ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{v.recordedAt}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: v.systolic > 140 ? '#DC2626' : '#111827' }}>{v.bloodPressure}</td>
                    <td style={{ padding: '6px 8px', color: v.pulse > 100 ? '#DC2626' : '#111827' }}>{v.pulse}</td>
                    <td style={{ padding: '6px 8px', color: v.temperature > 100.4 ? '#DC2626' : '#111827' }}>{v.temperature}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: v.spo2 < 95 ? '#DC2626' : '#059669' }}>{v.spo2}%</td>
                    <td style={{ padding: '6px 8px' }}>{v.respiratoryRate}</td>
                    <td style={{ padding: '6px 8px' }}>{v.bloodSugar ? `${v.bloodSugar} mg/dL` : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{v.painScore ?? 0} / 10</td>
                    <td style={{ padding: '6px 8px', color: '#4B5563' }}>{v.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Abnormal Alerts Callout */}
            {vitals.some(v => v.isAbnormal) && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#991B1B', marginBottom: '16px' }}>
                <strong>Clinical Abnormalities Noted: </strong>
                {vitals.filter(v => v.isAbnormal).map(v => v.abnormalFlags.join(', ')).join('; ')}
              </div>
            )}

            {/* Nurse Signature Line */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>* Continuous vitals charting maintained under hospital nursing protocols</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '140px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>Duty Staff Nurse Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
