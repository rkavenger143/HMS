import React, { useState } from 'react';
import { Sliders, ArrowRightLeft, Search, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export default function StockAdjustmentTransfer() {
  const { medicines, batches, recordStockAdjustment, recordStockTransfer } = usePharmacy();

  const [mode, setMode] = useState<'adjustment' | 'transfer'>('adjustment');

  // Adjustment State
  const [adjMedId, setAdjMedId] = useState(medicines[0]?.id || '');
  const [adjBatchNum, setAdjBatchNum] = useState(batches[0]?.batchNumber || 'LOT-DL-9821');
  const [physicalCount, setPhysicalCount] = useState(320);
  const [adjReason, setAdjReason] = useState('Monthly physical inventory reconciliation audit');
  const [approvedBy, setApprovedBy] = useState('Praveen Nair (Pharmacy Head)');

  // Transfer State
  const [sourceLoc, setSourceLoc] = useState('Central Pharmacy Store');
  const [destLoc, setDestLoc] = useState('IPD Inpatient Dispensary (Floor 2)');
  const [trMedId, setTrMedId] = useState(medicines[0]?.id || '');
  const [trBatchNum, setTrBatchNum] = useState(batches[0]?.batchNumber || 'LOT-DL-9821');
  const [transferQty, setTransferQty] = useState(50);
  const [transferredBy, setTransferredBy] = useState('Praveen Nair (Pharmacist)');

  const selectedAdjMed = medicines.find(m => m.id === adjMedId) || medicines[0];
  const adjVariance = physicalCount - (selectedAdjMed?.totalStock || 0);

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjMed) return;

    recordStockAdjustment(selectedAdjMed.id, adjBatchNum, Number(physicalCount), adjReason, approvedBy);
    alert('Stock adjustment verified and ledger updated.');
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    recordStockTransfer(sourceLoc, destLoc, trMedId, trBatchNum, Number(transferQty), transferredBy);
    alert(`Transfer of ${transferQty} units from ${sourceLoc} to ${destLoc} logged successfully.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Stock Variance Adjustments & Inter-Dispensary Transfers</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Physical inventory reconciliation, breakage write-offs, and stock transfers between OPD, IPD, and Emergency stores
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${mode === 'adjustment' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('adjustment')}
          >
            Physical Count Adjustment
          </button>
          <button
            className={`btn btn-sm ${mode === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('transfer')}
          >
            Inter-Store Transfer
          </button>
        </div>
      </div>

      {/* Forms */}
      {mode === 'adjustment' ? (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Physical Inventory Variance Adjustment</span>
          </div>

          <form onSubmit={handleSaveAdjustment} className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Select Medicine <span className="required">*</span></label>
                <select className="form-select" value={adjMedId} onChange={e => setAdjMedId(e.target.value)}>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} — {m.genericName} (System Stock: {m.totalStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={adjBatchNum}
                  onChange={e => setAdjBatchNum(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Physical Count Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={physicalCount}
                  onChange={e => setPhysicalCount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Stock Variance</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  style={{ fontWeight: 800, color: adjVariance < 0 ? 'var(--color-danger)' : adjVariance > 0 ? 'var(--color-success)' : 'var(--text-primary)' }}
                  value={adjVariance === 0 ? 'Zero Variance (Perfect Match)' : adjVariance > 0 ? `+${adjVariance} (Surplus)` : `${adjVariance} (Shortage)`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adjustment Reason & Audit Justification <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Approving Pharmacy Manager</label>
                <input
                  type="text"
                  className="form-input"
                  value={approvedBy}
                  onChange={e => setApprovedBy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={13} /> Authorize & Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Inter-Dispensary Store Stock Transfer</span>
          </div>

          <form onSubmit={handleSaveTransfer} className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Source Dispensary Location <span className="required">*</span></label>
                <select className="form-select" value={sourceLoc} onChange={e => setSourceLoc(e.target.value)}>
                  <option value="Central Pharmacy Store">Central Pharmacy Store (Ground Floor)</option>
                  <option value="OPD Dispensary">OPD Outpatient Dispensary</option>
                  <option value="IPD Pharmacy">IPD Inpatient Dispensary</option>
                  <option value="Emergency Store">Emergency Casualty Store</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination Location <span className="required">*</span></label>
                <select className="form-select" value={destLoc} onChange={e => setDestLoc(e.target.value)}>
                  <option value="IPD Inpatient Dispensary (Floor 2)">IPD Inpatient Dispensary (Floor 2)</option>
                  <option value="ICU Crash Cart Stock">ICU Crash Cart Stock</option>
                  <option value="OT Pharmacy Sub-Store">OT Pharmacy Sub-Store</option>
                  <option value="Emergency Night Dispensary">Emergency Night Dispensary</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Medicine Item <span className="required">*</span></label>
                <select className="form-select" value={trMedId} onChange={e => setTrMedId(e.target.value)}>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} — {m.genericName} (Stock: {m.totalStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={trBatchNum}
                  onChange={e => setTrBatchNum(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Quantity (Units) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={transferQty}
                  min={1}
                  onChange={e => setTransferQty(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transferring Pharmacist</label>
                <input
                  type="text"
                  className="form-input"
                  value={transferredBy}
                  onChange={e => setTransferredBy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="submit" className="btn btn-primary">
                <ArrowRightLeft size={13} /> Dispatch Inter-Store Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
