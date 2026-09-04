import React, { useState } from 'react';
import { AlertTriangle, Search, Filter, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export default function ExpiryManagement() {
  const { batches, disposeExpiredStock } = usePharmacy();

  const [search, setSearch] = useState('');
  const [expiryWindow, setExpiryWindow] = useState<'30' | '60' | '90' | 'expired'>('90');

  const now = new Date();

  const filteredBatches = batches.filter(b => {
    const exp = new Date(b.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (expiryWindow === 'expired') {
      return diffDays <= 0;
    } else if (expiryWindow === '30') {
      return diffDays > 0 && diffDays <= 30;
    } else if (expiryWindow === '60') {
      return diffDays > 0 && diffDays <= 60;
    } else {
      return diffDays > 0 && diffDays <= 90;
    }
  });

  const searched = filteredBatches.filter(b => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.medicineName.toLowerCase().includes(q) ||
      b.batchNumber.toLowerCase().includes(q) ||
      b.supplierName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Drug Expiration Management & Near-Expiry Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Proactive 30/60/90-day expiry tracking, FEFO priority acceleration, and bio-medical disposal quarantine
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: '30', label: '< 30 Days' },
            { id: '60', label: '< 60 Days' },
            { id: '90', label: '< 90 Days' },
            { id: 'expired', label: 'Expired Stock' },
          ].map(w => (
            <button
              key={w.id}
              className={`btn btn-sm ${expiryWindow === w.id ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setExpiryWindow(w.id as any)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Near-Expiry Medicine, Batch #..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Expiry Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Item</th>
                  <th>Batch / Lot #</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Available Qty</th>
                  <th>Stock Value at Risk (₹)</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searched.map(b => {
                  const exp = new Date(b.expiryDate);
                  const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysRemaining <= 0;
                  const valueAtRisk = b.availableQuantity * b.purchasePrice;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{b.medicineName}</strong>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.batchNumber}</span>
                      </td>

                      <td>
                        <strong style={{ color: isExpired ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          {b.expiryDate}
                        </strong>
                      </td>

                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-warning'}`}>
                          {isExpired ? 'EXPIRED' : `${daysRemaining} Days`}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13 }}>{b.availableQuantity}</strong>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-danger)' }}>₹{valueAtRisk.toFixed(2)}</strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{b.supplierName}</div>
                      </td>

                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-warning'}`}>
                          {isExpired ? 'BLOCKED' : 'EXPIRING SOON'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isExpired && b.availableQuantity > 0 ? (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => disposeExpiredStock(b.id, 'Praveen Nair (Pharmacist)')}
                          >
                            <Trash2 size={11} /> Bio-Disposal
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>FEFO Priority Active</span>
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
    </div>
  );
}
