import React, { useState } from 'react';
import { Ban, Plus, Search, Filter, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useDiet } from '../context/DietContext';

export default function NPOManagement() {
  const { admissions, npoPatients, setNPOStatus, clearNPOStatus } = useDiet();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New NPO Form State
  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(activeAdmissions[0]?.id || '');
  const [reason, setReason] = useState('Pre-operative fasting for elective surgery');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Khan');
  const [endDateTime, setEndDateTime] = useState('2026-09-02 18:00');

  const filteredNPO = npoPatients.filter(n => {
    const q = search.toLowerCase();
    return (
      !search ||
      n.patientName.toLowerCase().includes(q) ||
      n.bedNumber.toLowerCase().includes(q) ||
      n.reason.toLowerCase().includes(q)
    );
  });

  const handleSaveNPO = (e: React.FormEvent) => {
    e.preventDefault();
    setNPOStatus(admissionId, reason, doctorName, endDateTime);
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ban size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nil Per Os (NPO) Fasting Clinical Command Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Strict fasting patient safety board, automated meal preparation suppression, and surgery clearance tracking
            </div>
          </div>
        </div>

        <button className="btn btn-danger btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Order Patient NPO
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div style={{ background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', padding: '12px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--color-danger)' }}>CLINICAL SAFETY PROTOCOL: </strong>
          Patients under active NPO status have oral diet feeds and kitchen meal tray preparation automatically suppressed to prevent aspiration during anesthesia or diagnostic procedures.
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search NPO Patient, Bed, Reason..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* NPO Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {filteredNPO.map(n => {
          const isActive = n.status === 'active';

          return (
            <div
              key={n.id}
              className="card"
              style={{
                padding: 18,
                borderLeft: `5px solid ${isActive ? 'var(--color-danger)' : 'var(--color-success)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{n.patientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Bed <strong style={{ color: 'var(--color-primary)' }}>{n.bedNumber}</strong> ({n.ward})
                  </div>
                </div>

                <span className={`badge ${isActive ? 'badge-danger' : 'badge-success'}`}>
                  {isActive ? 'STRICT NPO' : 'CLEARED'}
                </span>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 12 }}>
                <div><strong>Indication:</strong> {n.reason}</div>
                <div style={{ marginTop: 4, color: 'var(--text-tertiary)' }}>
                  Start: {n.startDateTime} {n.endDateTime && `· Expected End: ${n.endDateTime}`}
                </div>
                <div style={{ marginTop: 2, color: 'var(--text-tertiary)' }}>Ordered by: <strong>{n.doctorName}</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Oral Feeds Blocked</span>
                {isActive && (
                  <button className="btn btn-secondary btn-sm" onClick={() => clearNPOStatus(n.admissionId)}>
                    <CheckCircle2 size={12} /> Clear NPO / Resume Diet
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add NPO Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <Ban size={18} style={{ color: 'var(--color-danger)' }} />
              <div className="modal-title">Place Inpatient on Strict NPO Fasting</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveNPO}>
              <div className="modal-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Indication / Reason <span className="required">*</span></label>
                    <input type="text" className="form-input" value={reason} onChange={e => setReason(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ordering Physician / Consultant</label>
                    <input type="text" className="form-input" value={doctorName} onChange={e => setDoctorName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Anticipated Fasting Completion Time</label>
                    <input type="text" className="form-input" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <Ban size={13} /> Confirm NPO Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
