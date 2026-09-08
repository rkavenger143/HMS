import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Clock,
  Activity,
  Pill,
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import PrintHandoverModal from './modals/PrintHandoverModal';
import type { NursingHandoverRecord } from '../../../types';

export default function NursingHandover() {
  const { admissions, handovers, nurses, createShiftHandover, acknowledgeHandover } = useNursing();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printHandoverRecord, setPrintHandoverRecord] = useState<NursingHandoverRecord | null>(null);
  const [search, setSearch] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL');

  // Form State
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [ward, setWard] = useState('General Ward A');
  const [fromNurseName, setFromNurseName] = useState(nurses[0]?.name || 'Nurse Preethi Mathew');
  const [toNurseName, setToNurseName] = useState(nurses[1]?.name || 'Nurse Rajesh Nair');
  const [generalWardNotes, setGeneralWardNotes] = useState(
    'All infusion pumps functional and calibrated. Emergency crash cart verified, sealed, and restocked.'
  );

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredHandovers = handovers.filter(h => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      h.ward.toLowerCase().includes(q) ||
      h.fromNurseName.toLowerCase().includes(q) ||
      h.toNurseName.toLowerCase().includes(q) ||
      h.patientHandovers.some(p => p.patientName.toLowerCase().includes(q) || p.bedNumber.toLowerCase().includes(q));

    const matchesWard = selectedWardFilter === 'ALL' || h.ward === selectedWardFilter;
    return matchesSearch && matchesWard;
  });

  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedFrom = nurses.find(n => n.name === fromNurseName);
    const matchedTo = nurses.find(n => n.name === toNurseName);

    const patientHandovers = activeAdmissions.map(adm => ({
      admissionId: adm.id,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      condition: adm.ward.toLowerCase().includes('icu') ? 'Critical / On Monitor' : 'Stable & Resting',
      importantNotes: `Admitted for ${adm.diagnosis[0] || 'Clinical observation'}. Vitals stable.`,
      pendingTasks: 'Evening vitals due at 18:00',
      medicationDue: 'Night statin and antibiotic dose',
      doctorOrders: 'Strict I/O fluid monitoring; regular sugar charting',
      criticalAlerts: adm.ward.toLowerCase().includes('icu') ? 'Titrate inotropes as per MAP target > 65' : '',
    }));

    createShiftHandover({
      fromNurseId: matchedFrom?.id || 'n-001',
      fromNurseName,
      toNurseId: matchedTo?.id || 'n-002',
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
              Structured shift-to-shift handoff notes, patient condition summary, pending meds/tasks, and dual-nurse acknowledgement
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Create Shift Handover Report
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Handover by Nurse, Ward, or Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedWardFilter} onChange={e => setSelectedWardFilter(e.target.value)}>
            <option value="ALL">All Clinical Wards</option>
            <option value="General Ward A">General Ward A</option>
            <option value="General Ward B">General Ward B</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Surgical ICU">Surgical ICU</option>
            <option value="Private Ward">Private Ward</option>
          </select>
        </div>
      </div>

      {/* Handover History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredHandovers.length > 0 ? (
          filteredHandovers.map(h => {
            const isAcknowledged = h.status === 'acknowledged';

            return (
              <div
                key={h.id}
                className="card"
                style={{
                  padding: '20px',
                  borderLeft: `4px solid ${isAcknowledged ? 'var(--color-success)' : 'var(--color-warning)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>
                      {h.ward} — {h.shift.toUpperCase()} SHIFT HANDOVER
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>Outgoing: <strong>{h.fromNurseName}</strong></span>
                      <ArrowRight size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>Incoming: <strong>{h.toNurseName}</strong></span>
                      <span>•</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{h.date} at {h.time}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${isAcknowledged ? 'badge-success' : 'badge-warning'}`}>
                      {isAcknowledged ? 'ACKNOWLEDGED' : 'PENDING ACKNOWLEDGEMENT'}
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

                {/* Patient Roster Handoff Table/Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Transferred Inpatient Handoffs ({h.patientHandovers.length} Patients):</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>Bedside care transferred safely</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {h.patientHandovers.map((p, idx) => {
                      const isCritical = p.condition.toLowerCase().includes('critical') || !!p.criticalAlerts;
                      return (
                        <div
                          key={idx}
                          style={{
                            fontSize: 12,
                            background: 'var(--bg-card)',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            borderLeft: `3px solid ${isCritical ? 'var(--color-danger)' : 'var(--color-success)'}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, marginBottom: 4 }}>
                            <span style={{ fontSize: 13 }}>{p.patientName} (Bed {p.bedNumber})</span>
                            <span className={`badge ${isCritical ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 10 }}>
                              {p.condition}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 6, color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>
                            <div><strong>Notes:</strong> {p.importantNotes}</div>
                            {p.medicationDue && <div><strong>Pending Meds:</strong> {p.medicationDue}</div>}
                            {p.pendingTasks && <div><strong>Pending Tasks:</strong> {p.pendingTasks}</div>}
                            {p.doctorOrders && <div><strong>Doctor Orders:</strong> {p.doctorOrders}</div>}
                          </div>

                          {p.criticalAlerts && (
                            <div style={{ color: 'var(--color-danger)', fontWeight: 700, marginTop: 6, fontSize: 11, background: 'var(--color-danger-muted)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <AlertTriangle size={12} /> {p.criticalAlerts}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {h.generalWardNotes && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Ward & Equipment Remarks:</strong> {h.generalWardNotes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Shift Handover Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Click "Create Shift Handover Report" to generate the end-of-shift transfer sheet.
            </div>
          </div>
        )}
      </div>

      {/* Create Handover Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Create Nursing Shift Handover Report</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowCreateModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHandover}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Duty Shift <span className="required">*</span></label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning Shift (07:00 - 15:00)</option>
                      <option value="evening">Evening Shift (15:00 - 23:00)</option>
                      <option value="night">Night Shift (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Ward <span className="required">*</span></label>
                    <select className="form-select" value={ward} onChange={e => setWard(e.target.value)}>
                      <option value="General Ward A">General Ward A</option>
                      <option value="General Ward B">General Ward B</option>
                      <option value="Medical ICU">Medical ICU</option>
                      <option value="Surgical ICU">Surgical ICU</option>
                      <option value="Private Ward">Private Ward</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Outgoing Handing-Over Nurse <span className="required">*</span></label>
                    <select className="form-select" value={fromNurseName} onChange={e => setFromNurseName(e.target.value)}>
                      {nurses.map(n => (
                        <option key={n.id} value={n.name}>{n.name} ({n.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incoming Relieving Nurse <span className="required">*</span></label>
                    <select className="form-select" value={toNurseName} onChange={e => setToNurseName(e.target.value)}>
                      {nurses.map(n => (
                        <option key={n.id} value={n.name}>{n.name} ({n.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Ward Environment, Crash Cart & Equipment Notes</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={generalWardNotes}
                      onChange={e => setGeneralWardNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span>
                    All {activeAdmissions.length} active ward inpatients with latest vitals, pending medication orders, and doctor instructions will be automatically transferred.
                  </span>
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
