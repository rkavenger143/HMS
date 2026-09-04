import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { NursingIncidentReport } from '../../../types';

export default function IncidentReporting() {
  const { admissions, incidentReports, reportIncident, resolveIncident } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [patientAdmissionId, setPatientAdmissionId] = useState(admissions[0]?.id || '');
  const [location, setLocation] = useState('General Ward A — Bed 01');
  const [incidentType, setIncidentType] = useState<NursingIncidentReport['incidentType']>('fall');
  const [severity, setSeverity] = useState<NursingIncidentReport['severity']>('minor');
  const [description, setDescription] = useState('');
  const [immediateActionTaken, setImmediateActionTaken] = useState('Patient examined by on-duty resident. Vital signs checked, no fractures noted.');
  const [supervisor, setSupervisor] = useState('Head Nurse Rekha Sharma');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredIncidents = incidentReports.filter(i => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      i.description.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      (i.patientName && i.patientName.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === patientAdmissionId);

    reportIncident({
      admissionId: adm?.id,
      patientId: adm?.patientId,
      patientName: adm?.patientName,
      location,
      incidentType,
      severity,
      description,
      immediateActionTaken,
      supervisor,
    });

    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Internal Nursing Incident & Sentinel Event Auditing</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Inpatient falls, medication variance logging, line infiltrations, equipment alerts, and supervisor resolution tracking
            </div>
          </div>
        </div>

        <button className="btn btn-danger btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Report Clinical Incident
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
              placeholder="Search Incident Description or Location..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({incidentReports.length})</option>
            <option value="reported">Reported / Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map(inc => {
            const isResolved = inc.status === 'resolved';

            return (
              <div
                key={inc.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderLeft: `4px solid ${inc.severity === 'sentinel' || inc.severity === 'major' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>
                      Incident #{inc.id} — <span style={{ color: 'var(--color-danger)' }}>{inc.incidentType.toUpperCase().replace('_', ' ')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Location: <strong>{inc.location}</strong> · Patient: <strong>{inc.patientName || 'N/A'}</strong> · Reported by <strong>{inc.reportedBy}</strong> on {inc.date} at {inc.time}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${inc.severity === 'sentinel' ? 'badge-danger' : 'badge-warning'}`}>
                      Severity: {inc.severity.toUpperCase()}
                    </span>
                    <span className={`badge ${isResolved ? 'badge-success' : 'badge-danger'}`}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', marginBottom: 10 }}>
                  <strong>Description: </strong>{inc.description}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <strong>Immediate Action Taken: </strong>{inc.immediateActionTaken}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <div>Supervisor Notified: <strong>{inc.supervisor}</strong></div>
                  {!isResolved && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => resolveIncident(inc.id, 'Investigated and corrective safety measures implemented.')}
                    >
                      <ShieldCheck size={12} /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <ShieldCheck size={32} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Zero Active Clinical Incidents</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>No patient safety incidents reported during this operational cycle.</div>
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
              <div className="modal-title">File Nursing Incident / Safety Event</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCreateIncident}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient Involved (Optional)</label>
                    <select className="form-select" value={patientAdmissionId} onChange={e => setPatientAdmissionId(e.target.value)}>
                      <option value="">No specific patient / General Ward</option>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incident Type <span className="required">*</span></label>
                    <select className="form-select" value={incidentType} onChange={e => setIncidentType(e.target.value as any)}>
                      <option value="fall">Patient Bedside Fall</option>
                      <option value="medication_error">Medication Variance / Error</option>
                      <option value="patient_injury">Patient Skin Tear / Injury</option>
                      <option value="infiltration">IV Cannula Infiltration / Extravasation</option>
                      <option value="equipment_issue">Infusion Pump / Monitor Malfunction</option>
                      <option value="other">Other Clinical Event</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity Level <span className="required">*</span></label>
                    <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value as any)}>
                      <option value="minor">Minor (No harm / Near miss)</option>
                      <option value="moderate">Moderate (Temporary harm)</option>
                      <option value="major">Major (Additional care required)</option>
                      <option value="sentinel">Sentinel Event (Critical)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Ward Location <span className="required">*</span></label>
                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Detailed Incident Description <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Detail exactly what transpired, time, witnesses, and immediate clinical signs observed..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Immediate Corrective Action Taken <span className="required">*</span></label>
                    <input type="text" className="form-input" value={immediateActionTaken} onChange={e => setImmediateActionTaken(e.target.value)} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Supervisor / Head Nurse Notified</label>
                    <input type="text" className="form-input" value={supervisor} onChange={e => setSupervisor(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <AlertTriangle size={13} /> Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
