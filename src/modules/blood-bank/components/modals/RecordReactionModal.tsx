import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';
import type { TransfusionRecord } from '../../context/BloodBankContext';

interface RecordReactionModalProps {
  transfusion: TransfusionRecord | null;
  onClose: () => void;
}

export default function RecordReactionModal({ transfusion, onClose }: RecordReactionModalProps) {
  const { transfusions, reportTransfusionReaction } = useBloodBank();

  const [selectedTransfusionId, setSelectedTransfusionId] = useState(transfusion?.id || transfusions[0]?.id || '');
  const [reactionType, setReactionType] = useState<'febrile' | 'allergic' | 'hemolytic' | 'taco' | 'trali' | 'septic'>('febrile');
  const [symptoms, setSymptoms] = useState('Chills, rigors, temperature spike to 102.4°F, and mild tachycardia (110 bpm) 20 mins post-infusion.');
  const [immediateIntervention, setImmediateIntervention] = useState('Transfusion immediately halted. NS IV line maintained. IV Paracetamol 1g + IV Avil 22.75mg administered. Blood bag & clerical check sent to Blood Centre.');
  const [reportedBy, setReportedBy] = useState('Staff Nurse Kavita Patil');
  const [doctorNotified, setDoctorNotified] = useState('Dr. Rajesh Sharma (Attending Physician)');

  const activeTransfusion = transfusions.find(t => t.id === selectedTransfusionId) || transfusion || transfusions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransfusion) {
      alert('No active transfusion found to link with reaction incident.');
      return;
    }

    reportTransfusionReaction({
      transfusionId: activeTransfusion.id,
      patientId: activeTransfusion.patientId,
      patientName: activeTransfusion.patientName,
      bagId: activeTransfusion.bagId,
      component: activeTransfusion.component,
      reactionType,
      symptoms,
      immediateIntervention,
      reportedBy,
      doctorNotified,
      resolution: 'Patient stabilized. Workup sent for Direct Antiglobulin Test (DAT) and blood culture.',
    });

    alert(`Adverse Transfusion Reaction reported for ${activeTransfusion.patientName}.\nTransfusion halted and hemovigilance investigation initiated.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 660 }}>
        <div className="modal-header">
          <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
          <div>
            <div className="modal-title">Report Adverse Transfusion Reaction / Hemovigilance Incident</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Standard clinical incident reporting for transfusion safety audit
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Transfusion Session Selector */}
            <div className="form-group">
              <label className="form-label">Select Patient Transfusion Session <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedTransfusionId}
                onChange={e => setSelectedTransfusionId(e.target.value)}
              >
                {transfusions.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.patientName} ({t.patientId}) · Bag #{t.bagId} · Started at {t.startTime}
                  </option>
                ))}
              </select>
            </div>

            {/* Reaction Classification */}
            <div className="form-group">
              <label className="form-label">Clinical Reaction Classification <span className="required">*</span></label>
              <select className="form-select" value={reactionType} onChange={e => setReactionType(e.target.value as any)}>
                <option value="febrile">Febrile Non-Hemolytic Transfusion Reaction (FNHTR)</option>
                <option value="allergic">Allergic / Urticarial Reaction</option>
                <option value="hemolytic">Acute Hemolytic Transfusion Reaction (AHTR)</option>
                <option value="taco">Transfusion-Associated Circulatory Overload (TACO)</option>
                <option value="trali">Transfusion-Related Acute Lung Injury (TRALI)</option>
                <option value="septic">Bacterial Sepsis / Contamination</option>
              </select>
            </div>

            {/* Symptoms */}
            <div className="form-group">
              <label className="form-label">Observed Symptoms & Onset Time <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={2}
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                required
              />
            </div>

            {/* Immediate Action */}
            <div className="form-group">
              <label className="form-label">Immediate Bedside Interventions Taken <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={2}
                value={immediateIntervention}
                onChange={e => setImmediateIntervention(e.target.value)}
                required
              />
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Attending Doctor Notified <span className="required">*</span></label>
                <input type="text" className="form-input" value={doctorNotified} onChange={e => setDoctorNotified(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Nurse / Clinician <span className="required">*</span></label>
                <input type="text" className="form-input" value={reportedBy} onChange={e => setReportedBy(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              <CheckCircle2 size={14} /> Submit Hemovigilance Reaction Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
