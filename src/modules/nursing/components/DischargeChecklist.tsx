import React, { useState } from 'react';
import { CheckSquare, Plus, Search, Filter, Printer, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import PrintDischargeChecklistModal from './modals/PrintDischargeChecklistModal';
import type { DischargeChecklistRecord } from '../../../types';

export default function DischargeChecklist() {
  const { admissions, dischargeChecklists, updateDischargeChecklist } = useNursing();

  const [selectedAdmId, setSelectedAdmId] = useState<string>(admissions[0]?.id || '');
  const [printChecklist, setPrintChecklist] = useState<DischargeChecklistRecord | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdm = admissions.find(a => a.id === selectedAdmId) || admissions[0];

  const currentChecklist = dischargeChecklists[selectedAdmId] || {
    id: `dcl-${selectedAdmId.slice(-3)}`,
    admissionId: selectedAdm.id,
    patientId: selectedAdm.patientId,
    patientName: selectedAdm.patientName,
    bedNumber: selectedAdm.bedNumber,
    doctorDischargeOrder: true,
    patientBelongingsReturned: true,
    medInstructionsProvided: true,
    followUpInstructionsProvided: true,
    documentsProvided: true,
    patientEducationCompleted: true,
    ivLineRemoved: true,
    nursingNotesCompleted: true,
    pendingInvestigationsChecked: true,
    billingClearanceChecked: true,
    transportArranged: true,
    nurseName: 'Kavitha Nair',
    status: 'in_progress',
  };

  const CHECKLIST_ITEMS: { key: keyof DischargeChecklistRecord; label: string; desc: string }[] = [
    { key: 'doctorDischargeOrder', label: '1. Physician Discharge Order', desc: 'Attending consultant has documented and signed official discharge authorization.' },
    { key: 'patientBelongingsReturned', label: '2. Patient Belongings & Valuables', desc: 'All personal belongings, jewelry, and documents returned from hospital locker.' },
    { key: 'medInstructionsProvided', label: '3. Discharge Medication Instructions', desc: 'Take-home medications, dosages, timings, and dietary precautions explained.' },
    { key: 'followUpInstructionsProvided', label: '4. OPD Review & Warning Signs', desc: 'Follow-up appointment date and emergency red-flag symptoms detailed to family.' },
    { key: 'documentsProvided', label: '5. Discharge Summary & Medical Reports', desc: 'Physical copy of Discharge Summary, lab reports, and imaging CDs handed over.' },
    { key: 'patientEducationCompleted', label: '6. Post-Discharge Patient Education', desc: 'Wound care, diet restrictions, and physical activity guidelines explained.' },
    { key: 'ivLineRemoved', label: '7. IV Cannula & Line Removal', desc: 'Peripheral IV line, central line, and urinary catheter removed aseptically.' },
    { key: 'nursingNotesCompleted', label: '8. Nursing Notes & Discharge Vitals', desc: 'Final exit vitals recorded and comprehensive nursing summary closed.' },
    { key: 'pendingInvestigationsChecked', label: '9. Diagnostic Results Verification', desc: 'All pending lab and radiology orders reviewed and finalized.' },
    { key: 'billingClearanceChecked', label: '10. Hospital Billing & Cashier Clearance', desc: 'Final inpatient invoice settled, TPA insurance claim processed, receipt issued.' },
    { key: 'transportArranged', label: '11. Patient Transport & Wheelchair', desc: 'Wheelchair assistance or patient transport vehicle ready at departure gate.' },
  ];

  const handleToggle = (key: keyof DischargeChecklistRecord) => {
    const updated = {
      ...currentChecklist,
      [key]: !currentChecklist[key],
    };
    updateDischargeChecklist(selectedAdmId, updated);
  };

  const allCleared = CHECKLIST_ITEMS.every(item => Boolean(currentChecklist[item.key]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>11-Point Inpatient Discharge Nursing Checklist</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mandatory clinical exit criteria, IV cannula removal, medication education, and departure clearance
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setPrintChecklist(currentChecklist)}>
          <Printer size={13} /> Print Discharge Certificate
        </button>
      </div>

      {/* Patient Selector */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Select Inpatient:</label>
          <select className="form-select" style={{ maxWidth: 380 }} value={selectedAdmId} onChange={e => setSelectedAdmId(e.target.value)}>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span className="card-title">Discharge Verification Checklist: {selectedAdm.patientName}</span>
            <div className="card-subtitle">UHID: {selectedAdm.patientId} · Bed {selectedAdm.bedNumber} ({selectedAdm.ward})</div>
          </div>

          <span className={`badge ${allCleared ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px', fontSize: 12 }}>
            {allCleared ? '✓ ALL 11 CRITERIA CLEARED' : 'PENDING VERIFICATION'}
          </span>
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHECKLIST_ITEMS.map(item => {
              const isChecked = Boolean(currentChecklist[item.key]);

              return (
                <div
                  key={item.key as string}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'rgba(50,215,75,0.06)' : 'var(--bg-surface)',
                    border: `1px solid ${isChecked ? 'rgba(50,215,75,0.3)' : 'var(--border-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleToggle(item.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(item.key)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isChecked ? 'var(--color-success)' : 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${isChecked ? 'badge-success' : 'badge-neutral'}`}>
                    {isChecked ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Final Clearance Box */}
          <div style={{ marginTop: 20, padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Nursing Signoff & Exit Clearance</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Verified by Nurse: <strong>{currentChecklist.nurseName}</strong> on 2026-08-31
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!allCleared}
              onClick={() => setPrintChecklist(currentChecklist)}
            >
              <ShieldCheck size={14} /> Authorize Discharge Departure
            </button>
          </div>
        </div>
      </div>

      {/* Print Certificate Modal */}
      {printChecklist && (
        <PrintDischargeChecklistModal checklist={printChecklist} onClose={() => setPrintChecklist(null)} />
      )}
    </div>
  );
}
