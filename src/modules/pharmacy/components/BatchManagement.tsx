import React, { useState } from 'react';
import { Layers, Search, Filter, AlertTriangle, ShieldCheck, Ban, Trash2, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import type { MedicineBatchItem } from '../../../types';

export default function BatchManagement() {
  const { batches, recallBatch, disposeExpiredStock } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [recallTarget, setRecallTarget] = useState<MedicineBatchItem | null>(null);
  const [recallReason, setRecallReason] = useState('');
  const [recalledBy, setRecalledBy] = useState('Praveen Nair (Chief Pharmacist)');

  // Sort by FEFO (earliest expiry first)
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const filtered = sortedBatches.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.batchNumber.toLowerCase().includes(q) ||
      b.medicineName.toLowerCase().includes(q) ||
      b.supplierName.toLowerCase().includes(q) ||
      (b.purchaseInvoiceNo && b.purchaseInvoiceNo.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallTarget || !recallReason.trim()) return;

    recallBatch(recallTarget.id, recallReason, recalledBy);
    setRecallTarget(null);
    setRecallReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>FEFO Batch Inventory & Drug Expiry Lifecycle</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Batch-level tracking, First-Expiry-First-Out (FEFO) dispensing order, and manufacturer recall management
            </div>
          </div>
        </div>

        <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
          {batches.length} Active Batches Tracked
        </span>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Batch #, Medicine, Supplier..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Batch Statuses</option>
            <option value="available">Available</option>
            <option value="expiring_soon">Expiring Soon (&lt;90d)</option>
            <option value="expired">Expired</option>
            <option value="low_stock">Low Stock</option>
            <option value="recalled">Recalled / Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Number & Medicine</th>
                  <th>Manufacturing Date</th>
                  <th>Expiry Date (FEFO)</th>
                  <th>Received Qty</th>
                  <th>Available Stock</th>
                  <th>Purchase / MRP (₹)</th>
                  <th>Supplier & GRN Invoice</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const isExpired = new Date(b.expiryDate) <= new Date();
                  const isRecalled = b.status === 'recalled';

                  return (
                    <tr key={b.id} style={{ background: isRecalled ? 'var(--color-danger-muted)' : undefined }}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: 13 }}>
                          {b.batchNumber}
                        </strong>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {b.medicineName}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{b.manufacturingDate}</div>
                      </td>

                      <td>
                        <strong style={{ color: isExpired ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {b.expiryDate}
                        </strong>
                        {isExpired && <div style={{ fontSize: 10, color: 'var(--color-danger)' }}>EXPIRED</div>}
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{b.quantity}</div>
                      </td>

                      <td>
                        <strong style={{ color: b.availableQuantity === 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: 13 }}>
                          {b.availableQuantity}
                        </strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>₹{b.purchasePrice.toFixed(2)} / ₹{b.sellingPrice.toFixed(2)}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{b.supplierName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{b.purchaseInvoiceNo || 'DIRECT GRN'}</div>
                      </td>

                      <td>
                        <span className={`badge ${isRecalled ? 'badge-danger' : isExpired ? 'badge-danger' : b.status === 'expiring_soon' ? 'badge-warning' : 'badge-success'}`}>
                          {b.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {!isRecalled && !isExpired && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-danger)', fontSize: 11, height: 26 }}
                              onClick={() => setRecallTarget(b)}
                            >
                              <Ban size={11} /> Recall
                            </button>
                          )}
                          {isExpired && b.availableQuantity > 0 && (
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => disposeExpiredStock(b.id, 'Praveen Nair (Pharmacist)')}
                            >
                              <Trash2 size={11} /> Dispose
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Emergency Batch Recall Dialog */}
      {recallTarget && (
        <div className="modal-backdrop" onClick={() => setRecallTarget(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <Ban size={18} style={{ color: 'var(--color-danger)' }} />
              <div>
                <div className="modal-title">Emergency Batch Recall Notice</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Batch: <strong>{recallTarget.batchNumber}</strong> · {recallTarget.medicineName}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setRecallTarget(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmRecall}>
              <div className="modal-body">
                <div style={{ background: 'var(--color-danger-muted)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 14, fontSize: 12, color: 'var(--color-danger)', fontWeight: 600 }}>
                  ⚠️ Marking this batch as Recalled will immediately block it from active dispensary selection and record a recall quarantine event.
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturer Recall Notice & Justification <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. CDSCO notification: Dissolution test failure reported by manufacturer..."
                    value={recallReason}
                    onChange={e => setRecallReason(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authorized Pharmacist</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recalledBy}
                    onChange={e => setRecalledBy(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRecallTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <Ban size={13} /> Lock Batch & Issue Recall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
