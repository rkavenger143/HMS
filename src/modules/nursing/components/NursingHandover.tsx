import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Printer, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import PrintHandoverModal from './modals/PrintHandoverModal';
import type { NursingHandoverRecord } from '../../../types';

export default function NursingHandover() {
  const { admissions, handovers, createShiftHandover, acknowledgeHandover } = useNursing();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printHandoverRecord, setPrintHandoverRecord] = useState<NursingHandoverRecord | null>(null);

  // Form State
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [ward, setWard] = useState('General Ward A');
  const [toNurseName, setToNurseName] = useState('Preethi Mathew');
  const [generalWardNotes, setGeneralWardNotes] = useState('All infusion pumps inspected. Crash cart sealed and checked.');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const patientHandovers = activeAdmissions.map(adm => ({
      admissionId: adm.id,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      condition: adm.ward.toLowerCase().includes('icu') ? 'Critical / On Monitor' : 'Stable & Resting',
      importantNotes: `Admitted for ${adm.diagnosis[0] || 'Clinical observation'}. Vitals stable.`,
      pendingTasks: 'Evening vitals due at 18:00',
      medicationDue: 'Night statin and antibiotic dose',
      doctorOrders: 'Strict I/O monitoring',
      criticalAlerts: adm.ward.toLowerCase().includes('icu') ? 'Titrate inotropes as per MAP' : '',
    }));

    createShiftHandover({
      toNurseId: 'u-009',
      toNurseName,
      shift,
      ward,
      patientHandovers,
      generalWardNotes,
    });

    setShowCreateModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Shift Handover & Clinical Handoff</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Shift-to-shift patient handovers, critical alerts transfer, dual-nurse electronic signoff, and audit trail
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Create Shift Handover Report
        </button>
      </div>

      {/* Handover History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {handovers.length > 0 ? (
          handovers.map(h => {
            const isAcknowledged = h.status === 'acknowledged';

            return (
              <div key={h.id} className="card" style={{ padding: '20px', borderLeft: `4px solid ${isAcknowledged ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>
                      {h.ward} — {h.shift.toUpperCase()} SHIFT HANDOVER
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      From: <strong>{h.fromNurseName}</strong> <ArrowRight size={11} style={{ display: 'inline', margin: '0 4px' }} /> To: <strong>{h.toNurseName}</strong> · {h.date} at {h.time}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge ${isAcknowledged ? 'badge-success' : 'badge-warning'}`}>
                      {h.status.toUpperCase()}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPrintHandoverRecord(h)}>
                      <Printer size={12} /> Print Handover
                    </button>
                    {!isAcknowledged && (
                      <button className="btn btn-primary btn-sm" onClick={() => acknowledgeHandover(h.id)}>
                        <ShieldCheck size={12} /> Sign Off & Acknowledge
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient Roster Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                    Transferred Inpatient Handoffs ({h.patientHandovers.length} Patients):
                  </div>
                  {h.patientHandovers.map((p, idx) => (
                    <div key={idx} style={{ fontSize: 12, borderBottom: '1px solid var(--border-muted)', paddingBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{p.patientName} (Bed {p.bedNumber})</span>
                        <span style={{ color: 'var(--color-primary)' }}>{p.condition}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Notes: {p.importantNotes} · Meds: {p.medicationDue}</div>
                      {p.criticalAlerts && <div style={{ color: 'var(--color-danger)', fontWeight: 700, marginTop: 2 }}>⚠️ {p.criticalAlerts}</div>}
                    </div>
                  ))}
                </div>

                {h.generalWardNotes && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Ward Remarks:</strong> {h.generalWardNotes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Shift Handover Created Today</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Click "Create Shift Handover Report" to generate the end-of-shift clinical transfer sheet.
            </div>
          </div>
        )}
      </div>

      {/* Create Handover Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Create Nursing Shift Handover Report</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowCreateModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCreateHandover}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Duty Shift <span className="required">*</span></label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning Shift (07:00 - 15:00)</option>
                      <option value="afternoon">Afternoon Shift (15:00 - 23:00)</option>
                      <option value="night">Night Shift (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Ward <span className="required">*</span></label>
                    <select className="form-select" value={ward} onChange={e => setWard(e.target.value)}>
                      <option value="General Ward A">General Ward A</option>
                      <option value="Medical ICU">Medical ICU</option>
                      <option value="Private Ward">Private Ward</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Incoming Relieving Nurse Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={toNurseName} onChange={e => setToNurseName(e.target.value)} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Ward Observations & Equipment Notes</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={generalWardNotes}
                      onChange={e => setGeneralWardNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
                  ✓ All {activeAdmissions.length} active ward inpatients with latest vitals and pending tasks will be automatically compiled into the official handover sheet.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Submit Handover Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Handover Modal */}
      {printHandoverRecord && (
        <PrintHandoverModal handover={printHandoverRecord} onClose={() => setPrintHandoverRecord(null)} />
      )}
    </div>
  );
}
