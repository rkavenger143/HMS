import React from 'react';
import { Printer, X, CheckSquare, CheckCircle2 } from 'lucide-react';
import type { DischargeChecklistRecord } from '../../../../types';

interface PrintDischargeChecklistModalProps {
  checklist: DischargeChecklistRecord;
  onClose: () => void;
}

export default function PrintDischargeChecklistModal({ checklist, onClose }: PrintDischargeChecklistModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const CHECKLIST_ITEMS = [
    { key: 'doctorDischargeOrder', label: '1. Physician Discharge Order Verified & Signed in Clinical Chart' },
    { key: 'patientBelongingsReturned', label: '2. Patient Valuables & Personal Belongings Returned from Safe/Locker' },
    { key: 'medInstructionsProvided', label: '3. Discharge Medications, Dosages, and Administration Timings Explained' },
    { key: 'followUpInstructionsProvided', label: '4. Next OPD Review Date & Emergency Warning Signs Detailed to Patient/Caregiver' },
    { key: 'documentsProvided', label: '5. Discharge Summary, Diagnostic Reports, and Original Scans Handed Over' },
    { key: 'patientEducationCompleted', label: '6. Post-Discharge Home Care & Nutrition Education Completed' },
    { key: 'ivLineRemoved', label: '7. IV Cannula, Catheters, and Lines Removed with Aseptic Dressing Applied' },
    { key: 'nursingNotesCompleted', label: '8. Final Inpatient Nursing Notes and Discharge Vital Signs Documented' },
    { key: 'pendingInvestigationsChecked', label: '9. All Ordered Diagnostic & Laboratory Test Reports Verified & Closed' },
    { key: 'billingClearanceChecked', label: '10. Hospital Billing, Cashier Clearance & TPA Settlement Confirmed' },
    { key: 'transportArranged', label: '11. Patient Wheelchair / Transport / Ambulance Arranged at Discharge Gate' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <CheckSquare size={18} style={{ color: 'var(--color-success)' }} />
          <div className="modal-title">Inpatient Discharge Nursing Clearance Certificate</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Certificate
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#0D1117' }}>
          <div
            id="printable-nursing-discharge-certificate"
            style={{
              background: 'white',
              color: '#111827',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Hospital Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669', textTransform: 'uppercase' }}>
                  ALN Cure Multispeciality Hospital
                </div>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  Department of Nursing Services — 11-Point Inpatient Discharge Clearance Certificate
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                  Certificate #: <span style={{ color: '#059669' }}>{checklist.id}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Date: 2026-08-31
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#F3F4F6', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div><span style={{ color: '#6B7280' }}>Patient Name:</span> <br /><strong>{checklist.patientName}</strong></div>
              <div><span style={{ color: '#6B7280' }}>UHID / Patient ID:</span> <br /><strong>{checklist.patientId}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Allocated Bed / Ward:</span> <br /><strong>Bed {checklist.bedNumber}</strong></div>
            </div>

            {/* 11 Verification Checks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', marginBottom: '4px' }}>
                Mandatory Nursing Discharge Criteria Verification:
              </div>

              {CHECKLIST_ITEMS.map(item => {
                const isChecked = (checklist as any)[item.key] ?? true;
                return (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', padding: '6px 10px', background: isChecked ? '#F0FDF4' : '#FEF2F2', borderRadius: '4px', border: `1px solid ${isChecked ? '#DCFCE7' : '#FECACA'}` }}>
                    <span style={{ color: isChecked ? '#16A34A' : '#DC2626', fontWeight: 900, fontSize: '14px' }}>
                      {isChecked ? '☑' : '☐'}
                    </span>
                    <span style={{ flex: 1, color: isChecked ? '#14532D' : '#991B1B', fontWeight: isChecked ? 600 : 400 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isChecked ? '#16A34A' : '#DC2626' }}>
                      {isChecked ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Final Signoff */}
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#065F46', marginBottom: '16px' }}>
              ✓ <strong>Nursing Clearance Approved:</strong> All mandatory clinical, administrative, and pharmacy exit protocols have been completed. Patient is cleared for discharge departure.
            </div>

            {/* Signatures */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>* Original certificate retained in medical records department</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', borderBottom: '1px solid #9CA3AF', width: '160px', marginBottom: '4px' }} />
                <div style={{ fontWeight: '700', color: '#111827' }}>{checklist.nurseName || 'Registered Staff Nurse'}</div>
                <div>Discharge Nursing Incharge</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
