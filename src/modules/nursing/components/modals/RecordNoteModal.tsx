import React, { useState } from 'react';
import { FileText, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNursing } from '../../context/NursingContext';
import type { Admission } from '../../../../types';

interface RecordNoteModalProps {
  admission: Admission;
  onClose: () => void;
}

export default function RecordNoteModal({ admission, onClose }: RecordNoteModalProps) {
  const { recordNursingNote } = useNursing();

  const [noteType, setNoteType] = useState('General Nursing Note');
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [observations, setObservations] = useState('');
  const [nursingProcedures, setNursingProcedures] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observations.trim()) {
      alert('Please enter clinical observations for the nursing note.');
      return;
    }

    recordNursingNote({
      admissionId: admission.id,
      patientId: admission.patientId,
      patientName: admission.patientName,
      shift: (shift === 'afternoon' ? 'evening' : shift) as 'morning' | 'evening' | 'night',
      observations: `[${noteType}] ${observations}`,
      nursingProcedures,
      careInstructions,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Add Clinical Nursing Note</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {admission.patientName} ({admission.patientId}) · Bed {admission.bedNumber}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Note Category <span className="required">*</span></label>
                <select className="form-select" value={noteType} onChange={e => setNoteType(e.target.value)}>
                  <option value="General Nursing Note">General Nursing Note</option>
                  <option value="Shift Summary Note">Shift Summary Note</option>
                  <option value="Patient Observation">Patient Observation</option>
                  <option value="Incident / Acute Change">Incident / Acute Change</option>
                  <option value="Bedside Procedure Note">Bedside Procedure Note</option>
                  <option value="Handover Note">Handover Note</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duty Shift <span className="required">*</span></label>
                <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                  <option value="morning">Morning Shift (07:00 - 15:00)</option>
                  <option value="afternoon">Afternoon Shift (15:00 - 23:00)</option>
                  <option value="night">Night Shift (23:00 - 07:00)</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Clinical Observations & Patient Response <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Detail patient physical state, response to medications, pain assessment, mobilization, etc."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nursing Procedures Performed</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IV cannula flushed, Foley catheter emptied (350ml), dressing changed"
                  value={nursingProcedures}
                  onChange={e => setNursingProcedures(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Special Care Instructions for Next Shift</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Monitor urine output hourly, strict NPO after 22:00"
                  value={careInstructions}
                  onChange={e => setCareInstructions(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} />
              Clinical notes are signed with your nurse credentials and permanently appended to the medical record.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Clinical Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
