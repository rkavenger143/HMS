import React, { useState } from 'react';
import { Ban, Search, Filter, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export default function MedicineRecall() {
  const { batches, recallBatch } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [recallReason, setRecallReason] = useState('Manufacturer voluntary recall: Sub-potency reported in quality audit');
  const [recalledBy, setRecalledBy] = useState('Praveen Nair (Chief Pharmacist)');

  const recalledBatches = batches.filter(b => b.status === 'recalled');

  const handleRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !recallReason.trim()) return;

    recallBatch(selectedBatchId, recallReason, recalledBy);
    alert('Emergency batch recall notice issued and batch locked from dispensary.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ban size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Emergency Pharmaceutical Recall Command Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              CDSCO drug alert compliance, defective batch lockout, patient dispensing traceability, and vendor return mandates
            </div>
          </div>
        </div>

        <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: 12 }}>
          {recalledBatches.length} Recalled Batch(es)
        </span>
      </div>

      {/* Recall Trigger Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Issue New Emergency Batch Recall Notice</span>
        </div>

        <form onSubmit={handleRecall} className="card-body">
          <div className="form-grid form-grid-2" style={{ gap: 14 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Select Active Batch to Recall <span className="required">*</span></label>
              <select className="form-select" value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}>
                {batches.filter(b => b.status !== 'recalled').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} — {b.medicineName} (Available Stock: {b.availableQuantity}, Exp: {b.expiryDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Regulatory Notice Reference & Recall Justification <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                value={recallReason}
                onChange={e => setRecallReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Authorizing Pharmacist / Medical Superintendent</label>
              <input
                type="text"
                className="form-input"
                value={recalledBy}
                onChange={e => setRecalledBy(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button type="submit" className="btn btn-danger">
              <Ban size={13} /> Dispatch Emergency Batch Recall & Quarantine
            </button>
          </div>
        </form>
      </div>

      {/* Recalled Batches Register */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Quarantined & Recalled Batches Register</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch / Lot #</th>
                  <th>Medicine Item</th>
                  <th>Supplier</th>
                  <th>Quarantined Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recalledBatches.length > 0 ? (
                  recalledBatches.map(b => (
                    <tr key={b.id} style={{ background: 'var(--color-danger-muted)' }}>
                      <td><strong style={{ fontFamily: 'monospace' }}>{b.batchNumber}</strong></td>
                      <td><strong>{b.medicineName}</strong></td>
                      <td>{b.supplierName}</td>
                      <td><strong>{b.availableQuantity}</strong></td>
                      <td><span className="badge badge-danger">LOCKED / RECALLED</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>
                      No active drug recalls logged. All inventory batches are compliant with pharmacopeial standards.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
