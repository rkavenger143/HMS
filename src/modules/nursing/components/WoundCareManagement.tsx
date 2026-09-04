import React, { useState } from 'react';
import { HeartPulse, Plus, Search, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { WoundRecord, WoundDressingLog } from '../../../types';

export default function WoundCareManagement() {
  const { admissions, wounds, woundDressingLogs, recordWound, recordWoundDressing } = useNursing();

  const [selectedAdmId, setSelectedAdmId] = useState<string>('ALL');
  const [showAddWoundModal, setShowAddWoundModal] = useState(false);
  const [dressingWound, setDressingWound] = useState<WoundRecord | null>(null);

  // New Wound Form State
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [location, setLocation] = useState('Right Lower Limb');
  const [woundType, setWoundType] = useState<WoundRecord['woundType']>('surgical_incision');
  const [sizeCm, setSizeCm] = useState('10cm linear');
  const [condition, setCondition] = useState<WoundRecord['condition']>('granulating');
  const [drainage, setDrainage] = useState<WoundRecord['drainage']>('serous');
  const [dressingType, setDressingType] = useState('Sterile Hydrocolloid Dressing');
  const [nextDressingDate, setNextDressingDate] = useState('2026-09-02');
  const [remarks, setRemarks] = useState('Surgical edges healthy and clean.');

  // Dressing Log Form State
  const [procedureDone, setProcedureDone] = useState('Cleaned with Betadine and normal saline');
  const [dressingApplied, setDressingApplied] = useState('Dry sterile dressing applied');
  const [exudateAmount, setExudateAmount] = useState<WoundDressingLog['exudateAmount']>('scant');
  const [painDuringDressing, setPainDuringDressing] = useState(2);
  const [dressingRemarks, setDressingRemarks] = useState('Procedure well tolerated.');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredWounds = wounds.filter(w => selectedAdmId === 'ALL' || w.admissionId === selectedAdmId);

  const handleAddWound = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    recordWound({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      location,
      woundType,
      sizeCm,
      condition,
      drainage,
      dressingType,
      nextDressingDate,
      remarks,
    });

    setShowAddWoundModal(false);
  };

  const handleSaveDressing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dressingWound) return;

    recordWoundDressing({
      woundId: dressingWound.id,
      admissionId: dressingWound.admissionId,
      procedureDone,
      dressingApplied,
      exudateAmount,
      painDuringDressing: Number(painDuringDressing) || 0,
      remarks: dressingRemarks,
    });

    setDressingWound(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Wound Assessment & Sterile Dressing Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Surgical incisions, pressure injuries, dressing schedules, exudate tracking, and aseptic procedure logs
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddWoundModal(true)}>
          <Plus size={13} /> Add New Wound Record
        </button>
      </div>

      {/* Patient Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Filter Inpatient:</label>
          <select className="form-select" style={{ maxWidth: 360 }} value={selectedAdmId} onChange={e => setSelectedAdmId(e.target.value)}>
            <option value="ALL">All Inpatients with Wounds ({wounds.length})</option>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wounds Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {filteredWounds.map(w => {
          const dressingHistory = woundDressingLogs.filter(d => d.woundId === w.id);

          return (
            <div key={w.id} className="card" style={{ padding: '20px', borderLeft: '4px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{w.location}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Patient: <strong>{w.patientName}</strong> (Bed {w.bedNumber})
                  </div>
                </div>
                <span className="badge badge-primary">{w.woundType.replace('_', ' ').toUpperCase()}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 12 }}>
                <div>Size: <strong>{w.sizeCm}</strong></div>
                <div>Condition: <strong style={{ color: 'var(--color-success)' }}>{w.condition.toUpperCase()}</strong></div>
                <div>Drainage: <strong>{w.drainage.toUpperCase()}</strong></div>
                <div>Dressing: <strong>{w.dressingType}</strong></div>
                <div style={{ gridColumn: '1 / -1', color: 'var(--text-tertiary)', fontSize: 11 }}>
                  Last Dressing: {w.lastDressingDate} · Next Scheduled: <strong style={{ color: 'var(--color-primary)' }}>{w.nextDressingDate}</strong>
                </div>
              </div>

              {w.remarks && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  <strong>Notes:</strong> {w.remarks}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dressingHistory.length} Dressing Logs</span>
                <button className="btn btn-primary btn-sm" onClick={() => setDressingWound(w)}>
                  <Plus size={12} /> Log Dressing
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Wound Modal */}
      {showAddWoundModal && (
        <div className="modal-backdrop" onClick={() => setShowAddWoundModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <HeartPulse size={18} style={{ color: 'var(--color-danger)' }} />
              <div className="modal-title">Document Inpatient Wound</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddWoundModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleAddWound}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wound Anatomical Location <span className="required">*</span></label>
                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wound Type</label>
                    <select className="form-select" value={woundType} onChange={e => setWoundType(e.target.value as any)}>
                      <option value="surgical_incision">Surgical Incision</option>
                      <option value="pressure_ulcer">Pressure Ulcer / Bedsore</option>
                      <option value="diabetic_foot">Diabetic Foot Ulcer</option>
                      <option value="laceration">Laceration</option>
                      <option value="burn">Burn Wound</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Size (cm)</label>
                    <input type="text" className="form-input" value={sizeCm} onChange={e => setSizeCm(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wound Bed Condition</label>
                    <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as any)}>
                      <option value="granulating">Granulating (Healthy Pink)</option>
                      <option value="slough">Slough (Yellow/White)</option>
                      <option value="necrotic">Necrotic (Black/Eschar)</option>
                      <option value="epithelializing">Epithelializing</option>
                      <option value="infected">Infected / Inflamed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Drainage / Exudate</label>
                    <select className="form-select" value={drainage} onChange={e => setDrainage(e.target.value as any)}>
                      <option value="none">None / Dry</option>
                      <option value="serous">Serous (Clear)</option>
                      <option value="sanguineous">Sanguineous (Bloody)</option>
                      <option value="purulent">Purulent (Pus)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dressing Protocol</label>
                    <input type="text" className="form-input" value={dressingType} onChange={e => setDressingType(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Dressing Date</label>
                    <input type="date" className="form-input" value={nextDressingDate} onChange={e => setNextDressingDate(e.target.value)} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks</label>
                    <input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddWoundModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Wound
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Dressing Modal */}
      {dressingWound && (
        <div className="modal-backdrop" onClick={() => setDressingWound(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <HeartPulse size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Log Sterile Dressing Procedure</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setDressingWound(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveDressing}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13 }}>
                  <div>Wound: <strong>{dressingWound.location}</strong></div>
                  <div>Patient: <strong>{dressingWound.patientName}</strong> (Bed {dressingWound.bedNumber})</div>
                </div>

                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Cleaning & Aseptic Procedure Performed <span className="required">*</span></label>
                    <input type="text" className="form-input" value={procedureDone} onChange={e => setProcedureDone(e.target.value)} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Dressing Material Applied <span className="required">*</span></label>
                    <input type="text" className="form-input" value={dressingApplied} onChange={e => setDressingApplied(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Exudate Amount</label>
                    <select className="form-select" value={exudateAmount} onChange={e => setExudateAmount(e.target.value as any)}>
                      <option value="none">None</option>
                      <option value="scant">Scant / Minimal</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pain During Dressing (0-10)</label>
                    <input type="number" min="0" max="10" className="form-input" value={painDuringDressing} onChange={e => setPainDuringDressing(Number(e.target.value))} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Nurse Remarks</label>
                    <input type="text" className="form-input" value={dressingRemarks} onChange={e => setDressingRemarks(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDressingWound(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Dressing Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
