import React, { useState } from 'react';
import { Search, Pill, ShoppingCart, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export default function MedicineSearch() {
  const { medicines, batches, setActiveTab } = usePharmacy();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = medicines.filter(m => {
    return (
      !search ||
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Universal Fast Medicine Search & Clinical Formulary</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Real-time generic index, therapeutic substitution lookup, active batch breakdown, and dispensary rack locator
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            autoFocus
            placeholder="Search Brand Name, Generic Composition, Medicine Code, Manufacturer..."
            style={{ paddingLeft: 42, height: 44, fontSize: 15 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(med => {
          const medBatches = batches.filter(b => b.medicineId === med.id && b.availableQuantity > 0);
          const isLow = med.totalStock <= med.reorderLevel;

          return (
            <div
              key={med.id}
              className="card"
              style={{
                padding: 20,
                borderLeft: `4px solid ${isLow ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{med.brandName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                      {med.genericName} ({med.strength})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 900 }}>₹{med.sellingPrice.toFixed(2)}</span>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>MRP / {med.unit}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 12, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Form & Pack:</span>
                    <strong>{med.dosageForm.toUpperCase()} · {med.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Dispensary Location:</span>
                    <strong>{med.storageLocation || 'Main Store'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Available Total Stock:</span>
                    <strong style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-success)', fontSize: 13 }}>
                      {med.totalStock} Units {isLow ? '(Low Stock)' : ''}
                    </strong>
                  </div>
                </div>

                {/* Active Batches */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                    ACTIVE FEFO BATCHES ({medBatches.length})
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {medBatches.map(b => (
                      <span key={b.id} className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {b.batchNumber} (Exp: {b.expiryDate}) · {b.availableQuantity} Qty
                      </span>
                    ))}
                    {medBatches.length === 0 && (
                      <span className="badge badge-danger" style={{ fontSize: 10 }}>NO ACTIVE BATCHES AVAILABLE</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('stock')}>
                  Stock Ledger
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('pos')}>
                  <ShoppingCart size={12} /> Counter POS
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
