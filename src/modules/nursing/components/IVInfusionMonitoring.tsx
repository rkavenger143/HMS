import React, { useState } from 'react';
import { Droplets, Plus, Search, Filter, CheckCircle2, PauseCircle, PlayCircle, Clock } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { IVInfusionRecord } from '../../../types';

export default function IVInfusionMonitoring() {
  const { admissions, ivInfusions, recordIVInfusion, updateIVInfusionStatus } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [fluidName, setFluidName] = useState('Normal Saline 0.9%');
  const [volumeMl, setVolumeMl] = useState(500);
  const [flowRateMlHr, setFlowRateMlHr] = useState(75);
  const [ivSite, setIvSite] = useState('Left Forearm (18G Cannula)');
  const [remarks, setRemarks] = useState('Cannula site healthy, aseptic dressing intact.');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredInfusions = ivInfusions.filter(i => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      i.fluidName.toLowerCase().includes(q) ||
      i.patientName.toLowerCase().includes(q) ||
      i.bedNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInfusion = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    recordIVInfusion({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      fluidName,
      volumeMl: Number(volumeMl) || 500,
      flowRateMlHr: Number(flowRateMlHr) || 75,
      ivSite,
      remarks,
    });

    setShowAddModal(false);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>IV Lines & Intravenous Infusion Monitoring</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Flow rates, infusion completion timers, IV site integrity, and cannula maintenance
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Start New IV Infusion
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Fluid, Patient, or Bed..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Infusion Statuses ({ivInfusions.length})</option>
            <option value="running">Running Infusions ({ivInfusions.filter(i => i.status === 'running').length})</option>
            <option value="completed">Completed Infusions</option>
            <option value="stopped">Stopped / Held</option>
          </select>
        </div>
      </div>

      {/* Infusion Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {filteredInfusions.map(inf => {
          const isRunning = inf.status === 'running';

          return (
            <div key={inf.id} className="card" style={{ padding: '18px 20px', borderLeft: `4px solid ${isRunning ? 'var(--color-primary)' : 'var(--color-success)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>
                    {inf.fluidName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Patient: <strong>{inf.patientName}</strong> · Bed {inf.bedNumber}
                  </div>
                </div>
                <span className={`badge ${isRunning ? 'badge-primary' : 'badge-success'}`}>
                  {inf.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 12 }}>
                <div>Volume: <strong>{inf.volumeMl} ml</strong></div>
                <div>Flow Rate: <strong style={{ color: 'var(--color-primary)' }}>{inf.flowRateMlHr} ml/hr</strong></div>
                <div>IV Site: <strong>{inf.ivSite}</strong></div>
                <div>Nurse: <strong>{inf.nurseName}</strong></div>
                <div style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />Started: {inf.startTime} · Expected End: {inf.expectedEndTime}
                </div>
              </div>

              {inf.remarks && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <strong>Site Check:</strong> {inf.remarks}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {isRunning ? (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateIVInfusionStatus(inf.id, 'stopped')}>
                      <PauseCircle size={12} /> Pause
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => updateIVInfusionStatus(inf.id, 'completed')}>
                      <CheckCircle2 size={12} /> Mark Finished
                    </button>
                  </>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateIVInfusionStatus(inf.id, 'running')}>
                    <PlayCircle size={12} /> Resume
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Droplets size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Start Intravenous (IV) Infusion</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInfusion}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">IV Fluid / Medication <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Normal Saline 0.9% or Dextrose Normal Saline"
                      value={fluidName}
                      onChange={e => setFluidName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Volume (ml) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={volumeMl}
                      onChange={e => setVolumeMl(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Flow Rate (ml/hr) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={flowRateMlHr}
                      onChange={e => setFlowRateMlHr(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">IV Cannula Site</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Left Forearm (18G Cannula)"
                      value={ivSite}
                      onChange={e => setIvSite(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks / Site Condition</label>
                    <input
                      type="text"
                      className="form-input"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Start Infusion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
