import React, { useState } from 'react';
import { Droplets, Plus, Search, Filter, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { IntakeOutputRecord } from '../../../types';

export default function IntakeOutputManagement() {
  const { admissions, intakeOutputLogs, recordIntakeOutput } = useNursing();

  const [selectedAdmId, setSelectedAdmId] = useState<string>(admissions[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [category, setCategory] = useState<'intake' | 'output'>('intake');
  const [subType, setSubType] = useState<IntakeOutputRecord['subType']>('oral');
  const [amountMl, setAmountMl] = useState(250);
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [remarks, setRemarks] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdm = admissions.find(a => a.id === selectedAdmId) || admissions[0];

  const patientLogs = intakeOutputLogs.filter(i => i.admissionId === selectedAdmId);

  const totalIntake = patientLogs.filter(i => i.category === 'intake').reduce((sum, i) => sum + i.amountMl, 0);
  const totalOutput = patientLogs.filter(i => i.category === 'output').reduce((sum, i) => sum + i.amountMl, 0);
  const netBalance = totalIntake - totalOutput;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();

    recordIntakeOutput({
      admissionId: selectedAdm.id,
      patientId: selectedAdm.patientId,
      patientName: selectedAdm.patientName,
      bedNumber: selectedAdm.bedNumber,
      category,
      subType,
      amountMl: Number(amountMl) || 0,
      shift,
      remarks,
    });

    setShowAddModal(false);
    setRemarks('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(10,132,255,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>24-Hour Fluid Intake & Output (I/O) Balance Chart</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Oral & IV fluid intake vs urine, drain, and vomit output with automated net fluid balance
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Log Fluid Entry
        </button>
      </div>

      {/* Patient Selector */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Select Inpatient:</label>
          <select className="form-select" style={{ maxWidth: 360 }} value={selectedAdmId} onChange={e => setSelectedAdmId(e.target.value)}>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{totalIntake} ml</div>
          <div className="stat-label">Total 24h Fluid Intake (Oral + IV)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <TrendingDown size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{totalOutput} ml</div>
          <div className="stat-label">Total 24h Fluid Output (Urine + Drain)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: netBalance >= 0 ? 'rgba(50,215,75,0.1)' : 'var(--color-danger-muted)', color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            <Droplets size={20} />
          </div>
          <div className="stat-value" style={{ color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {netBalance >= 0 ? `+${netBalance}` : netBalance} ml
          </div>
          <div className="stat-label">Net Fluid Balance ({netBalance >= 0 ? 'Positive Balance' : 'Negative Balance'})</div>
        </div>
      </div>

      {/* Log Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Fluid Chart Entries for {selectedAdm.patientName} (Bed {selectedAdm.bedNumber})</span>
          <span className="badge badge-primary">{patientLogs.length} Entries</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Shift</th>
                  <th>Category</th>
                  <th>Sub-Type</th>
                  <th>Volume (ml)</th>
                  <th>Administering Nurse</th>
                  <th>Clinical Remarks</th>
                </tr>
              </thead>
              <tbody>
                {patientLogs.length > 0 ? (
                  patientLogs.map(log => (
                    <tr key={log.id}>
                      <td><strong>{log.time}</strong></td>
                      <td>{log.shift.toUpperCase()}</td>
                      <td>
                        <span className={`badge ${log.category === 'intake' ? 'badge-primary' : 'badge-warning'}`}>
                          {log.category.toUpperCase()}
                        </span>
                      </td>
                      <td><strong>{log.subType.replace('_', ' ').toUpperCase()}</strong></td>
                      <td>
                        <strong style={{ fontSize: 13, color: log.category === 'intake' ? 'var(--color-primary)' : 'var(--color-warning)' }}>
                          {log.amountMl} ml
                        </strong>
                      </td>
                      <td>{log.nurseName}</td>
                      <td>{log.remarks || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state" style={{ padding: 30 }}>No fluid entries logged today for this inpatient.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <Droplets size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Log Fluid Intake / Output</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select className="form-select" value={category} onChange={e => {
                      const cat = e.target.value as any;
                      setCategory(cat);
                      setSubType(cat === 'intake' ? 'oral' : 'urine');
                    }}>
                      <option value="intake">Intake (+)</option>
                      <option value="output">Output (-)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fluid Sub-Type <span className="required">*</span></label>
                    <select className="form-select" value={subType} onChange={e => setSubType(e.target.value as any)}>
                      {category === 'intake' ? (
                        <>
                          <option value="oral">Oral / Fluids by Mouth</option>
                          <option value="iv_fluids">IV Fluids / Drips</option>
                          <option value="tube_feeding">Enteral / NG Tube Feed</option>
                          <option value="blood_products">Blood / Blood Components</option>
                          <option value="other">Other Intake</option>
                        </>
                      ) : (
                        <>
                          <option value="urine">Urine Output (Foley / Void)</option>
                          <option value="drain">Surgical Drain Output</option>
                          <option value="vomit">Vomitus / Gastric Aspirate</option>
                          <option value="stool">Stool / Bowel Output</option>
                          <option value="blood_loss">Blood Loss</option>
                          <option value="other">Other Output</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (ml) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={amountMl}
                      onChange={e => setAmountMl(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Afternoon (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks / Characteristics</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Clear straw colored urine or Normal Saline 0.9%"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
