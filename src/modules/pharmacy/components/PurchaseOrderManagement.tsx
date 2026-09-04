import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Filter, CheckCircle2, Clock, Ban, Eye } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import CreatePurchaseOrderModal from './modals/CreatePurchaseOrderModal';
import type { PurchaseOrderItem } from '../../../types';

export default function PurchaseOrderManagement() {
  const { purchaseOrders, updatePOStatus } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewPO, setViewPO] = useState<PurchaseOrderItem | null>(null);

  const filtered = purchaseOrders.filter(po => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      po.poNumber.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      po.createdBy.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Procurement & Purchase Order Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Requisition approval workflows, supplier order tracking, delivery schedules, and fulfillment auditing
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Create Purchase Order
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
              placeholder="Search PO Number, Supplier..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Order Statuses</option>
            <option value="ordered">Ordered / Dispatched</option>
            <option value="approved">Approved</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="fully_received">Fully Received</option>
            <option value="cancelled">Cancelled</option>
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
                  <th>PO Number & Order Date</th>
                  <th>Pharmaceutical Supplier</th>
                  <th>Expected Delivery</th>
                  <th>Requisition Line Items</th>
                  <th>Total Amount (₹)</th>
                  <th>Created & Approved By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(po => (
                  <tr key={po.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{po.poNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{po.orderDate}</div>
                    </td>

                    <td>
                      <strong>{po.supplierName}</strong>
                    </td>

                    <td>
                      <div>{po.expectedDeliveryDate || '—'}</div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{po.items.length} Drug Line(s)</span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{po.totalAmount.toLocaleString()}</strong>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{po.createdBy}</div>
                      {po.approvedBy && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Appr: {po.approvedBy}</div>}
                    </td>

                    <td>
                      <span className={`badge ${po.status === 'fully_received' ? 'badge-success' : po.status === 'ordered' ? 'badge-info' : po.status === 'approved' ? 'badge-primary' : 'badge-warning'}`}>
                        {po.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        {po.status === 'ordered' && (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => updatePOStatus(po.id, 'fully_received')}
                          >
                            <CheckCircle2 size={11} /> Mark Received
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => setViewPO(po)}
                        >
                          <Eye size={11} /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View PO Details Modal */}
      {viewPO && (
        <div className="modal-backdrop" onClick={() => setViewPO(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Purchase Order Details: {viewPO.poNumber}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Supplier: {viewPO.supplierName}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setViewPO(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>Order Date: <strong>{viewPO.orderDate}</strong></div>
                <div>Expected Delivery: <strong>{viewPO.expectedDeliveryDate || 'Standard'}</strong></div>
                <div>Created By: <strong>{viewPO.createdBy}</strong></div>
                <div>Status: <strong style={{ textTransform: 'uppercase' }}>{viewPO.status}</strong></div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ordered Drug Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {viewPO.items.map((it, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{it.medicineName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Qty: {it.quantity} · Rate: ₹{it.unitPrice}</div>
                    </div>
                    <strong style={{ color: 'var(--color-primary)' }}>₹{it.totalAmount.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: 12, marginTop: 14 }}>
                <span style={{ fontWeight: 600 }}>Total Order Value:</span>
                <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>₹{viewPO.totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setViewPO(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <CreatePurchaseOrderModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
