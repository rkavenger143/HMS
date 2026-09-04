import React, { useState } from 'react';
import { TrendingDown, Search, Plus, ShoppingCart, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import CreatePurchaseOrderModal from './modals/CreatePurchaseOrderModal';

export default function LowStockAlerts() {
  const { medicines, setActiveTab } = usePharmacy();
  const [search, setSearch] = useState('');
  const [showPOModal, setShowPOModal] = useState(false);

  const lowStockMeds = medicines.filter(m => m.totalStock <= m.reorderLevel);

  const filtered = lowStockMeds.filter(m => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-warning-muted)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Low Stock & Reorder Threshold Command Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Automated stockout prevention, reorder point alerts, and instant procurement PO dispatch
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowPOModal(true)}>
          <ShoppingCart size={13} /> Create Purchase PO
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Low Stock Drug..."
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
                  <th>Medicine Item</th>
                  <th>Therapeutic Category</th>
                  <th>Current Stock</th>
                  <th>Minimum Reorder Level</th>
                  <th>Shortage Units</th>
                  <th>Suggested Order Qty</th>
                  <th>Estimated Cost (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(med => {
                  const isOut = med.totalStock === 0;
                  const shortage = Math.max(0, med.reorderLevel - med.totalStock);
                  const suggestedOrder = med.maxStockLevel - med.totalStock;
                  const estimatedCost = suggestedOrder * med.purchasePrice;

                  return (
                    <tr key={med.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{med.brandName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {med.genericName} ({med.strength})
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {med.category}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: 14, color: isOut ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          {med.totalStock} {med.unit}
                        </strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{med.reorderLevel} {med.unit}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-danger)' }}>{shortage}</strong>
                      </td>

                      <td>
                        <strong>{suggestedOrder} {med.unit}</strong>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{estimatedCost.toLocaleString()}</strong>
                      </td>

                      <td>
                        <span className={`badge ${isOut ? 'badge-danger' : 'badge-warning'}`}>
                          {isOut ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowPOModal(true)}>
                          <ShoppingCart size={11} /> Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPOModal && <CreatePurchaseOrderModal onClose={() => setShowPOModal(false)} />}
    </div>
  );
}
