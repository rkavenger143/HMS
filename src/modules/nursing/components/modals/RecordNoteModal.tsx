import React, { useState } from 'react';
import { FileText, X, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { useNursing } from '../../context/NursingContext';
import type { Admission } from '../../../../types';

interface RecordNoteModalProps {
  admission?: Admission | null;
  onClose: () => void;
}

export default function RecordNoteModal({ admission: initialAdmission, onClose }: RecordNoteModalProps) {
  const { admissions, nurses, recordNursingNote } = useNursing();
  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>(
    initialAdmission?.id || activeAdmissions[0]?.id || ''
  );
  const [nurseName, setNurseName] = useState(nurses[0]?.name || 'Nurse Preethi Mathew');
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [condition, setCondition] = useState<'stable' | 'improving' | 'critical' | 'deteriorating'>('stable');
  const [noteCategory, setNoteCategory] = useState('Patient Observation');
  const [observations, setObservations] = useState('');
  const [careProvided, setCareProvided] = useState('');
  const [importantRemarks, setImportantRemarks] = useState('');

  const currentAdmission = activeAdmissions.find(a => a.id === selectedAdmissionId) || initialAdmission || activeAdmissions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observations.trim()) {
      alert('Please enter clinical observations.');
      return;
    }
    if (!currentAdmission) {
      alert('Please select an active inpatient.');
      return;
    }

    const matchedNurse = nurses.find(n => n.name === nurseName);

    recordNursingNote({
      admissionId: currentAdmission.id,
      patientId: currentAdmission.patientId,
      patientName: currentAdmission.patientName,
      nurseId: matchedNurse?.id || 'n-001',
      nurseName: matchedNurse?.name || nurseName,
      shift,
      observations: `[Condition: ${condition.toUpperCase()} | ${noteCategory}] ${observations}`,
      nursingProcedures: careProvided,
      careInstructions: importantRemarks,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Inpatient Nursing Note</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bedside observations, condition updates, care provided, and audit notes
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              {/* Patient Selection */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Inpatient & Bed <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={selectedAdmissionId}
                  onChange={e => setSelectedAdmissionId(e.target.value)}
                  required
                >
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} ({a.patientId}) — Bed {a.bedNumber} ({a.ward})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nurse & Shift */}
              <div className="form-group">
                <label className="form-label">Recording Nurse <span className="required">*</span></label>
                <select className="form-select" value={nurseName} onChange={e => setNurseName(e.target.value)}>
                  {nurses.map(n => (
                    <option key={n.id} value={n.name}>{n.name} ({n.ward})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duty Shift <span className="required">*</span></label>
                <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                  <option value="morning">Morning Shift (07:00 - 15:00)</option>
                  <option value="evening">Evening Shift (15:00 - 23:00)</option>
                  <option value="night">Night Shift (23:00 - 07:00)</option>
                </select>
              </div>

              {/* Condition & Note Category */}
              <div className="form-group">
                <label className="form-label">Current Patient Condition <span className="required">*</span></label>
                <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as any)}>
                  <option value="stable">Stable</option>
                  <option value="improving">Improving</option>
                  <option value="critical">Critical</option>
                  <option value="deteriorating">Deteriorating</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Note Category <span className="required">*</span></label>
                <select className="form-select" value={noteCategory} onChange={e => setNoteCategory(e.target.value)}>
                  <option value="Patient Observation">Patient Observation</option>
                  <option value="Shift Summary">Shift Summary</option>
                  <option value="Condition Update">Condition Update</option>
                  <option value="Post-Procedure Care">Post-Procedure Care</option>
                  <option value="Doctor Round Order">Doctor Round Follow-up</option>
                </select>
              </div>

              {/* Observations */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Patient Observations & Clinical Status <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Record patient physical state, vital stability, pain level, consciousness, comfort..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  required
                />
              </div>

              {/* Care Provided */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Care Provided & Procedures Performed</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IV cannulation flushed, wound dressing done with sterile gauze, sponge bath given"
                  value={careProvided}
                  onChange={e => setCareProvided(e.target.value)}
                />
              </div>

              {/* Important Remarks */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Important Nursing Remarks / Handover Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Strict NPO after midnight for ultrasound; monitor fluid intake closely"
                  value={importantRemarks}
                  onChange={e => setImportantRemarks(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} />
              Notes are electronically signed and timestamped into the patient's permanent inpatient history.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Nursing Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
