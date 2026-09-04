import React, { useState } from 'react';
import { DollarSign, Plus, Search, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import RecordAdvanceModal from './modals/RecordAdvanceModal';

export default function AdvanceManagement() {
  const { advances } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showRecordModal, setShowRecordModal] = useState(false);

  const totalAvailable = advances
    .filter(a => a.status === 'available')
    .reduce((sum, a) => sum + a.amount, 0);

  const filtered = advances.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.advanceNumber.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      (a.reference && a.reference.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Advances & Pre-Admission Security Deposits</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Patient booking deposits, surgery pre-funding, and automatic 1-click deduction during discharge billing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Available Advance Pool:</div>
            <strong style={{ fontSize: 16, color: '#d97706' }}>₹{totalAvailable.toLocaleString()}</strong>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowRecordModal(true)}>
            <Plus size={13} /> Collect Advance
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
              placeholder="Search Advance #, Patient, Reference..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Advance Statuses</option>
            <option value="available">Available (Unadjusted)</option>
            <option value="utilized">Utilized (Deducted on Invoice)</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Advances Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Advance # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Deposit Amount (₹)</th>
                  <th>Payment Tender</th>
                  <th>Purpose / Reference</th>
                  <th>Received By</th>
                  <th>Status</th>
                  <th>Utilized Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{a.advanceNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.date}</div>
                    </td>

                    <td>
                      <strong>{a.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.patientId}</div>
                    </td>

                    <td>
                      <strong style={{ fontSize: 14, color: a.status === 'available' ? '#d97706' : 'var(--color-success)' }}>
                        ₹{a.amount.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                        {a.paymentMethod}
                      </span>
                    </td>

                    <td>
                      <div>{a.reference || 'General Patient Deposit'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{a.receivedBy}</div>
                    </td>

                    <td>
                      <span className={`badge ${a.status === 'available' ? 'badge-warning' : a.status === 'utilized' ? 'badge-success' : 'badge-neutral'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {a.utilizedInvoiceId || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRecordModal && <RecordAdvanceModal onClose={() => setShowRecordModal(false)} />}
    </div>
  );
}
