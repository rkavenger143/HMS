import React, { useState } from 'react';
import { Package, Search, Filter, Plus, ArrowUpDown, TrendingDown, DollarSign } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import StockInModal from './modals/StockInModal';

export default function StockManagement() {
  const { medicines, batches, setActiveTab } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [showStockInModal, setShowStockInModal] = useState(false);

  const totalPurchaseValue = medicines.reduce((sum, m) => sum + m.totalStock * m.purchasePrice, 0);
  const totalSellingValue = medicines.reduce((sum, m) => sum + m.totalStock * m.sellingPrice, 0);

  const filtered = medicines.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStockStatus === 'low') matchesStatus = m.totalStock <= m.reorderLevel && m.totalStock > 0;
    if (selectedStockStatus === 'out') matchesStatus = m.totalStock === 0;
    if (selectedStockStatus === 'in') matchesStatus = m.totalStock > m.reorderLevel;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with Inventory Valuation */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Real-Time Stock & Inventory Ledger</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Total dispensary stock levels, reorder minimum thresholds, and current financial valuation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Inventory Valuation:</div>
            <strong style={{ fontSize: 15, color: 'var(--color-primary)' }}>
              ₹{Math.round(totalPurchaseValue).toLocaleString()} (Cost) / ₹{Math.round(totalSellingValue).toLocaleString()} (MRP)
            </strong>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowStockInModal(true)}>
            <Plus size={13} /> Inward Stock (GRN)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Medicine, Generic, Code..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="antibiotics">Antibiotics</option>
            <option value="analgesics">Analgesics & Antipyretics</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="antidiabetics">Antidiabetics</option>
            <option value="gastrointestinal">Gastrointestinal</option>
            <option value="respiratory">Respiratory</option>
            <option value="iv_fluids">IV Fluids</option>
          </select>

          <select className="form-select" value={selectedStockStatus} onChange={e => setSelectedStockStatus(e.target.value)}>
            <option value="ALL">All Stock Statuses</option>
            <option value="in">In Stock (Adequate)</option>
            <option value="low">Low Stock (At / Below Reorder)</option>
            <option value="out">Out of Stock (Zero)</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Item & Composition</th>
                  <th>Dosage Form</th>
                  <th>Total Stock</th>
                  <th>Reorder Level</th>
                  <th>Purchase Cost (₹)</th>
                  <th>Total Asset Value (₹)</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(med => {
                  const isLow = med.totalStock <= med.reorderLevel && med.totalStock > 0;
                  const isOut = med.totalStock === 0;
                  const itemAssetValue = med.totalStock * med.purchasePrice;

                  return (
                    <tr key={med.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{med.brandName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {med.genericName} ({med.strength}) · {med.medicineCode}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {med.dosageForm}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: 14, color: isOut ? 'var(--color-danger)' : isLow ? 'var(--color-warning)' : 'var(--color-success)' }}>
                          {med.totalStock} {med.unit}
                        </strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{med.reorderLevel} {med.unit}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>₹{med.purchasePrice.toFixed(2)}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{itemAssetValue.toLocaleString()}</strong>
                      </td>

                      <td>
                        <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                          {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('batches')}>
                            Batches
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => setShowStockInModal(true)}>
                            + Stock
                          </button>
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

      {showStockInModal && <StockInModal onClose={() => setShowStockInModal(false)} />}
    </div>
  );
}
