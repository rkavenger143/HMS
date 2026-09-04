import React, { useState } from 'react';
import { Undo2, Plus, Search, Filter, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import CreateReturnModal from './modals/CreateReturnModal';

export default function MedicineReturns() {
  const { returns } = usePharmacy();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = returns.filter(ret => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ret.returnNumber.toLowerCase().includes(q) ||
      (ret.patientName && ret.patientName.toLowerCase().includes(q)) ||
      (ret.supplierName && ret.supplierName.toLowerCase().includes(q)) ||
      (ret.referenceSaleOrInvoiceId && ret.referenceSaleOrInvoiceId.toLowerCase().includes(q));

    const matchesType = selectedType === 'ALL' || ret.returnType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Undo2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Medicine Returns & Vendor Debit Note Registry</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Patient medication returns, sealed condition validation, inventory reinstatement, and supplier return debits
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Process New Return
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
              placeholder="Search Return #, Patient, Reference Bill..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="ALL">All Return Types</option>
            <option value="patient">Patient Returns</option>
            <option value="supplier">Supplier Returns (Vendor Debit)</option>
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
                  <th>Return # & Date</th>
                  <th>Channel</th>
                  <th>Patient / Supplier</th>
                  <th>Reference Bill #</th>
                  <th>Returned Drug & Batch</th>
                  <th>Condition</th>
                  <th>Refund Amount (₹)</th>
                  <th>Processed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ret => (
                  <tr key={ret.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{ret.returnNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ret.returnDate}</div>
                    </td>

                    <td>
                      <span className={`badge ${ret.returnType === 'patient' ? 'badge-primary' : 'badge-info'}`}>
                        {ret.returnType.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <strong>{ret.patientName || ret.supplierName}</strong>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{ret.referenceSaleOrInvoiceId || 'DIRECT'}</span>
                    </td>

                    <td>
                      {ret.items.map((it, idx) => (
                        <div key={idx}>
                          <strong>{it.medicineName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Batch: {it.batchNumber} · Qty: {it.quantity} · Reason: {it.returnReason}
                          </div>
                        </div>
                      ))}
                    </td>

                    <td>
                      <span className={`badge ${ret.items[0]?.returnCondition === 'sealed_good' ? 'badge-success' : 'badge-warning'}`}>
                        {ret.items[0]?.returnCondition.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{ret.totalRefundAmount.toFixed(2)}</strong>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{ret.processedBy}</div>
                    </td>

                    <td>
                      <span className="badge badge-success">COMPLETED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateReturnModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
