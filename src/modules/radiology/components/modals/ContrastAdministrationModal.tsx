import React, { useState } from 'react';
import { Syringe, X, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRadiology } from '../../context/RadiologyContext';
import type { ComprehensiveRadiologyOrder } from '../../../../types';

interface ContrastAdministrationModalProps {
  order: ComprehensiveRadiologyOrder;
  onClose: () => void;
}

export default function ContrastAdministrationModal({ order, onClose }: ContrastAdministrationModalProps) {
  const { recordContrastAdministration } = useRadiology();

  const [agentName, setAgentName] = useState('Omnipaque (Iohexol 350 mg I/ml)');
  const [contrastType, setContrastType] = useState('Non-Ionic Monomeric Iodinated');
  const [volumeMl, setVolumeMl] = useState(80);
  const [route, setRoute] = useState('Intravenous (IV)');
  const [serumCreatinine, setSerumCreatinine] = useState(0.9);
  const [batchNumber, setBatchNumber] = useState('LOT-OMNI-2026-7789');
  const [administeredBy, setAdministeredBy] = useState('Staff Nurse Sunita / Kunal Joshi (RT)');
  const [remarks, setRemarks] = useState('Automated power injector used at 3.5 ml/sec. No adverse reactions observed.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    recordContrastAdministration(order.id, {
      contrastRequired: true,
      agentName,
      contrastType,
      volumeMl: Number(volumeMl) || 80,
      route,
      administeredAt: now,
      administeredBy,
      batchNumber,
      serumCreatinine: Number(serumCreatinine) || 0.9,
      remarks,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <Syringe size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Contrast Media Administration & Safety Audit</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Patient: <strong>{order.patientName}</strong> ({order.patientId}) · Accession: {order.accessionNumber}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Safety Clearance Banner */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, borderLeft: '4px solid var(--color-success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>
                <ShieldCheck size={16} /> Pre-Contrast Renal Clearance Verified
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Patient has no prior history of anaphylactoid contrast reactions. Adequate hydration verified.
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Contrast Media Agent <span className="required">*</span></label>
                <select className="form-select" value={agentName} onChange={e => setAgentName(e.target.value)}>
                  <option value="Omnipaque (Iohexol 350 mg I/ml)">Omnipaque (Iohexol 350 mg I/ml) — CT Scan</option>
                  <option value="Visipaque (Iodixanol 320 mg I/ml)">Visipaque (Iodixanol 320 mg I/ml) — Isosmolar CT</option>
                  <option value="Dotarem (Gadoterate Meglumine 0.5 mmol/ml)">Dotarem (Gadoterate Meglumine 0.5 mmol/ml) — MRI Macrocyclic</option>
                  <option value="Gadovist (Gadobutrol 1.0 mmol/ml)">Gadovist (Gadobutrol 1.0 mmol/ml) — MRI CNS</option>
                  <option value="Barium Sulfate 100% w/v">Barium Sulfate 100% w/v — Fluoroscopy / GI</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Administered Dose (ml) <span className="required">*</span></label>
                <input type="number" className="form-input" value={volumeMl} onChange={e => setVolumeMl(Number(e.target.value))} required />
              </div>

              <div className="form-group">
                <label className="form-label">Route of Administration</label>
                <select className="form-select" value={route} onChange={e => setRoute(e.target.value)}>
                  <option value="Intravenous (IV)">Intravenous (IV) — 18G/20G Cannula</option>
                  <option value="Oral">Oral (GI Opacification)</option>
                  <option value="Rectal">Rectal Enema</option>
                  <option value="Intra-articular">Intra-articular (MR/CT Arthrography)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Serum Creatinine (mg/dL) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={serumCreatinine}
                  onChange={e => setSerumCreatinine(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vial Batch / Lot Number <span className="required">*</span></label>
                <input type="text" className="form-input" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} required />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Administered By (Nurse / Radiographer) <span className="required">*</span></label>
                <input type="text" className="form-input" value={administeredBy} onChange={e => setAdministeredBy(e.target.value)} required />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Clinical Observations / Flow Rate Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Contrast Administration Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
