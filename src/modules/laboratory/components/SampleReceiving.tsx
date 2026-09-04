import React, { useState } from 'react';
import { Truck, CheckCircle2, XCircle, Search, Filter, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLab } from '../context/LabContext';

const REJECTION_REASONS = [
  'Hemolyzed Specimen (Severe Red Cell Lysis)',
  'Clotted Blood in EDTA Container',
  'Insufficient Specimen Volume (QNS)',
  'Wrong Specimen Container / Anticoagulant',
  'Leaking / Damaged Specimen Tube',
  'Unlabeled / Mislabeled Specimen',
  'Specimen Transit Delay Exceeded (>4 hours)',
  'Lipemic / Heavily Turbid Specimen',
  'Contaminated Urine Specimen',
];

export default function SampleReceiving() {
  const { labSamples, receiveSample, recollectSample } = useLab();

  const [search, setSearch] = useState('');
  const [receiverName, setReceiverName] = useState('Sanjay Deshmukh (Lab Reception MLT)');
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const receivedQueue = labSamples.filter(
    s => s.status === 'collected' || s.status === 'accepted' || s.status === 'rejected'
  );

  const filteredQueue = receivedQueue.filter(s => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.patientName.toLowerCase().includes(q) ||
      s.sampleId.toLowerCase().includes(q) ||
      s.barcode.toLowerCase().includes(q)
    );
  });

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionTargetId) return;

    receiveSample(rejectionTargetId, receiverName, 'rejected', selectedReason, rejectionRemarks);
    recollectSample(rejectionTargetId, `${selectedReason} — ${rejectionRemarks}`);
    setRejectionTargetId(null);
    setRejectionRemarks('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Specimen Reception & Quality Intake</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Specimen accessioning desk, pre-analytical quality checks (hemolysis/clotting), acceptance, and rejection audits
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Intake Officer:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 220, height: 32, fontSize: 12 }}
            value={receiverName}
            onChange={e => setReceiverName(e.target.value)}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Scan Barcode or Search Sample ID..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID & Barcode</th>
                  <th>Patient Name & Location</th>
                  <th>Specimen / Container</th>
                  <th>Collected At</th>
                  <th>Collector</th>
                  <th>Acceptance Status</th>
                  <th style={{ textAlign: 'right' }}>Quality Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(sample => {
                  const isCollected = sample.status === 'collected';
                  const isAccepted = sample.status === 'accepted';
                  const isRejected = sample.status === 'rejected';

                  return (
                    <tr key={sample.id} style={{ background: isRejected ? 'rgba(255, 69, 58, 0.04)' : undefined }}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{sample.sampleId}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sample.barcode}</div>
                      </td>

                      <td>
                        <strong>{sample.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {sample.patientId} {sample.bedNumber ? `· Bed ${sample.bedNumber}` : ''}
                        </div>
                      </td>

                      <td>
                        <div>{sample.sampleType}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{sample.containerType}</div>
                      </td>

                      <td>{sample.collectedAt || '—'}</td>
                      <td>{sample.collectedBy || '—'}</td>

                      <td>
                        <span className={`badge ${isAccepted ? 'badge-success' : isRejected ? 'badge-danger' : 'badge-warning'}`}>
                          {sample.status.toUpperCase()}
                        </span>
                        {isRejected && (
                          <div style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2 }}>
                            {sample.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isCollected ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => receiveSample(sample.sampleId, receiverName, 'accepted')}
                            >
                              <CheckCircle2 size={12} /> Accept Specimen
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => setRejectionTargetId(sample.sampleId)}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : isAccepted ? (
                          <span className="badge badge-success">✓ RECEIVED & VERIFIED</span>
                        ) : (
                          <span className="badge badge-danger">RECOLLECTION TRIGGERED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Specimen Rejection Dialog Modal */}
      {rejectionTargetId && (
        <div className="modal-backdrop" onClick={() => setRejectionTargetId(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
              <span className="modal-title">Specimen Rejection & Recollection Request</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setRejectionTargetId(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmRejection}>
              <div className="modal-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Pre-Analytical Rejection Reason <span className="required">*</span></label>
                    <select className="form-select" value={selectedReason} onChange={e => setSelectedReason(e.target.value)}>
                      {REJECTION_REASONS.map((r, idx) => (
                        <option key={idx} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lab Quality Remarks / Phlebotomy Notification Notes</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Specimen severely hemolyzed on centrifugation. Phlebotomy team notified to draw fresh 3ml EDTA sample immediately..."
                      value={rejectionRemarks}
                      onChange={e => setRejectionRemarks(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRejectionTargetId(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <RefreshCw size={13} /> Confirm Rejection & Order Recollection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
