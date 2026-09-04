import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import StockInModal from './modals/StockInModal';

export default function StockInView() {
  const { batches } = usePharmacy();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = batches.filter(b => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.batchNumber.toLowerCase().includes(q) ||
      b.medicineName.toLowerCase().includes(q) ||
      b.supplierName.toLowerCase().includes(q) ||
      (b.purchaseInvoiceNo && b.purchaseInvoiceNo.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Goods Inward Notes (GRN) & Stock Inward Register</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Inward stock verification from pharmaceutical distributors, manufacturer invoice tracking, and batch onboarding
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={13} /> New Inward Stock (GRN)
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search GRN, Batch #, Supplier, Medicine..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inward Register Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Received Date & Invoice #</th>
                  <th>Supplier / Distributor</th>
                  <th>Medicine Item</th>
                  <th>Batch / Lot Number</th>
                  <th>Expiry Date</th>
                  <th>Inward Qty</th>
                  <th>Unit Rate (₹)</th>
                  <th>Total Purchase Value (₹)</th>
                  <th>GRN Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const lineTotal = b.quantity * b.purchasePrice;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.receivedDate}</strong>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>
                          {b.purchaseInvoiceNo || 'DIRECT GRN'}
                        </div>
                      </td>

                      <td>
                        <div>{b.supplierName}</div>
                      </td>

                      <td>
                        <strong>{b.medicineName}</strong>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.batchNumber}</span>
                      </td>

                      <td>
                        <div>{b.expiryDate}</div>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13 }}>{b.quantity}</strong>
                      </td>

                      <td>
                        <div>₹{b.purchasePrice.toFixed(2)}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{lineTotal.toLocaleString()}</strong>
                      </td>

                      <td>
                        <span className="badge badge-success">FINALIZED</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && <StockInModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
