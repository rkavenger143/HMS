import React, { useState } from 'react';
import {
  Trash2, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2,
  Plus, Search, Droplets, UserCheck
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';

export default function BloodReturnsDiscards() {
  const { discards, bloodBags, discardBloodBag } = useBloodBank();

  const [selectedBagId, setSelectedBagId] = useState(bloodBags[0]?.id || '');
  const [reason, setReason] = useState<'expired' | 'failed_screening' | 'hemolysis' | 'broken_bag' | 'temperature_excursion'>('expired');
  const [method, setMethod] = useState<'autoclave_incineration' | 'biohazard_shredding'>('autoclave_incineration');
  const [authorizedBy, setAuthorizedBy] = useState('Medical Superintendent (Dr. Anil Mehta)');
  const [discardedBy, setDiscardedBy] = useState('Blood Bank Technician');
  const [remarks, setRemarks] = useState('Unit past expiration date. Condemned for biohazard autoclaving.');

  const handleCreateDiscard = (e: React.FormEvent) => {
    e.preventDefault();
    const bag = bloodBags.find(b => b.id === selectedBagId);
    if (!bag) return;

    discardBloodBag({
      bagId: bag.id,
      bloodGroup: bag.bloodGroup,
      component: bag.component,
      reason,
      discardedBy,
      authorizedBy,
      method,
      remarks,
    });

    alert(`Blood bag ${bag.id} (${bag.bloodGroup}) recorded in Discard & Biohazard Destruction Register.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Unit Return Inspection & Biohazard Discard Destruction
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hospital bio-waste compliance: Strict cold-chain inspection for returns & biohazard autoclave incineration logs
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Discard Action Form + Discarded Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left: Discard Entry Form */}
        <div className="card">
          <div className="card-header">
            <Trash2 size={17} style={{ color: 'var(--color-danger)' }} />
            <span className="card-title">Record Biohazard Blood Discard</span>
          </div>

          <form onSubmit={handleCreateDiscard}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Select Blood Bag to Discard <span className="required">*</span></label>
                <select className="form-select" value={selectedBagId} onChange={e => setSelectedBagId(e.target.value)}>
                  {bloodBags.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} ({b.bloodGroup} · {b.component.toUpperCase()}) · Status: {b.status.toUpperCase()} · Exp: {b.expiryDate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Discard Reason <span className="required">*</span></label>
                  <select className="form-select" value={reason} onChange={e => setReason(e.target.value as any)}>
                    <option value="expired">Date Expired</option>
                    <option value="failed_screening">Failed Serology / Positive Marker</option>
                    <option value="hemolysis">Hemolysis / Clot Observed</option>
                    <option value="broken_bag">Damaged / Leaking Bag</option>
                    <option value="temperature_excursion">Cold-Chain Temperature Excursion</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destruction Method</label>
                  <select className="form-select" value={method} onChange={e => setMethod(e.target.value as any)}>
                    <option value="autoclave_incineration">Autoclave & Incineration</option>
                    <option value="biohazard_shredding">Chemical Treatment & Shredding</option>
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Authorized Signoff (Medical Supt)</label>
                  <input type="text" className="form-input" value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Performed By (Technician)</label>
                  <input type="text" className="form-input" value={discardedBy} onChange={e => setDiscardedBy(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks & Incident Details</label>
                <input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                <Trash2 size={13} /> Execute Biohazard Condemnation & Discard
              </button>
            </div>
          </form>
        </div>

        {/* Right: Discarded Logs Table */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Biohazard Discard Audit Log</span>
            <span className="badge badge-danger">{discards.length} Discarded</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Discard ID</th>
                    <th>Bag ID & Group</th>
                    <th>Reason</th>
                    <th>Method</th>
                    <th>Authorized By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {discards.map(d => (
                    <tr key={d.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-danger)' }}>{d.id}</strong>
                      </td>
                      <td>
                        <strong>{d.bagId}</strong>
                        <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 10 }}>{d.bloodGroup}</span>
                      </td>
                      <td>
                        <strong style={{ textTransform: 'uppercase', fontSize: 11 }}>{d.reason.replace(/_/g, ' ')}</strong>
                      </td>
                      <td style={{ fontSize: 11 }}>{d.method.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: 11 }}>{d.authorizedBy}</td>
                      <td>{d.discardDate}</td>
                    </tr>
                  ))}

                  {discards.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No blood bags discarded in this session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
