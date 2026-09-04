import React, { useState } from 'react';
import { ArrowUpDown, Search, Filter, ShieldCheck, Download, Calendar } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import type { StockMovementType } from '../../../types';

export default function StockMovementLedger() {
  const { stockMovements } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filtered = stockMovements.filter(mov => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      mov.medicineName.toLowerCase().includes(q) ||
      mov.batchNumber.toLowerCase().includes(q) ||
      (mov.referenceId && mov.referenceId.toLowerCase().includes(q)) ||
      mov.performedBy.toLowerCase().includes(q);

    const matchesType = selectedType === 'ALL' || mov.movementType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const headers = ['Movement ID', 'Date/Time', 'Medicine', 'Batch', 'Movement Type', 'Quantity', 'Prev Stock', 'New Stock', 'Reference ID', 'User', 'Remarks'];
    const rows = filtered.map(m => [
      m.id,
      m.performedAt,
      `"${m.medicineName}"`,
      m.batchNumber,
      m.movementType,
      m.quantity,
      m.previousStock,
      m.newStock,
      m.referenceId || '',
      `"${m.performedBy}"`,
      `"${m.remarks || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `pharmacy_stock_movements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpDown size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Immutable Stock Movement Ledger & Audit Trail</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete chronological journal of all stock receipts, dispensing transactions, sales, returns, transfers, and disposals
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
          <Download size={13} /> Export Ledger CSV
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Medicine, Batch, Reference ID, User..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="ALL">All Movement Types ({stockMovements.length})</option>
            <option value="stock_in">Stock In (GRN)</option>
            <option value="dispense">Prescription Dispensing</option>
            <option value="sale">Counter POS Sale</option>
            <option value="patient_return">Patient Return</option>
            <option value="supplier_return">Supplier Return</option>
            <option value="adjustment">Stock Count Adjustment</option>
            <option value="transfer">Store Transfer</option>
            <option value="disposal">Expired Stock Disposal</option>
            <option value="recall">Emergency Recall</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Medicine Item</th>
                  <th>Batch / Lot Number</th>
                  <th>Movement Type</th>
                  <th>Quantity Delta</th>
                  <th>Stock Balance</th>
                  <th>Reference ID</th>
                  <th>Authorized User & Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(mov => {
                  const isPositive = mov.quantity > 0;

                  return (
                    <tr key={mov.id}>
                      <td>
                        <div style={{ fontSize: 12 }}>{mov.performedAt}</div>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13 }}>{mov.medicineName}</strong>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{mov.batchNumber}</span>
                      </td>

                      <td>
                        <span className={`badge ${mov.movementType === 'stock_in' ? 'badge-success' : mov.movementType === 'dispense' || mov.movementType === 'sale' ? 'badge-primary' : mov.movementType === 'patient_return' ? 'badge-info' : 'badge-warning'}`}>
                          {mov.movementType.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13, color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>
                          {mov.previousStock} → <strong>{mov.newStock}</strong>
                        </div>
                      </td>

                      <td>
                        <span style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: 11 }}>
                          {mov.referenceId || 'DIRECT'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{mov.performedBy}</div>
                        {mov.remarks && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{mov.remarks}</div>}
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
