import React, { useState } from 'react';
import { Scan, X, CheckCircle2 } from 'lucide-react';
import type { OPDVisit, Patient } from '../../../../types';

interface OrderDiagnosticRequisitionModalProps {
  visit: OPDVisit;
  patient: Patient | null;
  onClose: () => void;
  onSubmit: (data: {
    modalityType: string;
    procedureName: string;
    bodyPart: string;
    priority: 'routine' | 'urgent' | 'stat';
    clinicalIndication: string;
    specialInstructions?: string;
  }) => void;
}

const DIAGNOSTIC_CATALOG = [
  { id: 'XR-01', modality: 'xray', name: 'Chest X-Ray PA View', bodyPart: 'Chest', price: 400 },
  { id: 'XR-02', modality: 'xray', name: 'X-Ray Knee AP & Lateral', bodyPart: 'Knee', price: 550 },
  { id: 'XR-03', modality: 'xray', name: 'X-Ray Lumbar Spine AP/Lat', bodyPart: 'Spine', price: 650 },
  { id: 'US-01', modality: 'ultrasound', name: 'USG Whole Abdomen & Pelvis', bodyPart: 'Abdomen', price: 1200 },
  { id: 'US-02', modality: 'ultrasound', name: 'USG KUB & Prostate', bodyPart: 'KUB', price: 900 },
  { id: 'ECG-01', modality: 'ecg', name: '12-Lead Electrocardiogram (ECG)', bodyPart: 'Heart', price: 300 },
  { id: 'ECHO-01', modality: 'ecg', name: '2D Echocardiography with Doppler', bodyPart: 'Heart', price: 2200 },
  { id: 'CT-01', modality: 'ct', name: 'CT Brain Plain', bodyPart: 'Brain', price: 2800 },
  { id: 'CT-02', modality: 'ct', name: 'HRCT Chest (High Resolution)', bodyPart: 'Chest', price: 3800 },
  { id: 'MRI-01', modality: 'mri', name: 'MRI Brain with Contrast', bodyPart: 'Brain', price: 6500 },
  { id: 'MRI-02', modality: 'mri', name: 'MRI Lumbar Spine', bodyPart: 'Spine', price: 5500 },
];

export default function OrderDiagnosticRequisitionModal({
  visit,
  patient,
  onClose,
  onSubmit,
}: OrderDiagnosticRequisitionModalProps) {
  const [selectedStudyId, setSelectedStudyId] = useState(DIAGNOSTIC_CATALOG[0].id);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const currentStudy = DIAGNOSTIC_CATALOG.find(s => s.id === selectedStudyId) || DIAGNOSTIC_CATALOG[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      modalityType: currentStudy.modality,
      procedureName: currentStudy.name,
      bodyPart: currentStudy.bodyPart,
      priority,
      clinicalIndication: clinicalIndication || 'Outpatient Diagnostic Evaluation',
      specialInstructions,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-ai-muted)', color: 'var(--color-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scan size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16 }}>Radiology & Diagnostics Study Requisition</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Requisition will be dispatched to the Central Radiology / Diagnostics queue
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient banner */}
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{visit.patientName}</span>
                <span className="patient-id" style={{ marginLeft: 8, fontSize: 10 }}>{visit.patientId}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Dr. {visit.doctorName} ({visit.department})
              </div>
            </div>

            {/* Diagnostic Study Selector */}
            <div className="form-group">
              <label className="form-label">Select Imaging / Diagnostic Procedure</label>
              <select
                className="form-select"
                value={selectedStudyId}
                onChange={e => setSelectedStudyId(e.target.value)}
              >
                {DIAGNOSTIC_CATALOG.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.modality.toUpperCase()}] {s.name} ({s.bodyPart}) — ₹{s.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Study Overview Preview */}
            <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Selected Investigation</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{currentStudy.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Modality: {currentStudy.modality.toUpperCase()} · Target: {currentStudy.bodyPart}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Estimated Charge:</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)' }}>₹{currentStudy.price}</div>
              </div>
            </div>

            {/* Priority & Clinical Indications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT (Emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Indication / Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Persistent pleuritic chest pain, rule out pneumonia..."
                  value={clinicalIndication}
                  onChange={e => setClinicalIndication(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Preparation / Safety Instructions (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 4-hour fasting, full bladder for pelvic scan, check pacemaker history..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> Dispatch Requisition to Diagnostics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
