import React, { useState } from 'react';
import { Tag, Plus, Search, Filter, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

export default function DiscountManagement() {
  const { invoices, applyDiscount } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [discountAmount, setDiscountAmount] = useState(500);
  const [reason, setReason] = useState('Senior Citizen Healthcare Concession (10%)');
  const [approvedBy, setApprovedBy] = useState('Dr. Anil Mehta (Medical Superintendent)');
  const [showModal, setShowModal] = useState(false);

  const discountedInvoices = invoices.filter(i => i.discountAmount > 0);
  const totalDiscountsGiven = invoices.reduce((sum, i) => sum + i.discountAmount, 0);

  const filtered = discountedInvoices.filter(i => {
    const q = search.toLowerCase();
    return (
      !search ||
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.patientName.toLowerCase().includes(q) ||
      i.uhid.toLowerCase().includes(q)
    );
  });

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || discountAmount <= 0) return;

    applyDiscount(selectedInvoiceId, Number(discountAmount), reason, approvedBy);
    alert('Hospital discount applied and invoice net total updated.');
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Concessions, Waivers & Discount Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Authorized bill discounts, institutional concessions, and senior citizen waivers with mandatory superintendent signoff
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Concessions Granted:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-success)' }}>₹{totalDiscountsGiven.toLocaleString()}</strong>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={13} /> Grant Concession
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Discounted Invoice, Patient..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Discount Register Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Gross Bill (₹)</th>
                  <th>Discount Granted (₹)</th>
                  <th>Effective Net Payable (₹)</th>
                  <th>Authorized Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{inv.invoiceNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.invoiceDate}</div>
                    </td>

                    <td>
                      <strong>{inv.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.uhid}</div>
                    </td>

                    <td>
                      <div>₹{inv.grossAmount.toLocaleString()}</div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-success)', fontSize: 14 }}>
                        -₹{inv.discountAmount.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <strong>₹{inv.netPayable.toLocaleString()}</strong>
                    </td>

                    <td>
                      <span className="badge badge-success">AUTHORIZED SIGN-OFF</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grant Concession Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Tag size={18} style={{ color: 'var(--color-success)' }} />
              <div>
                <div className="modal-title">Grant Hospital Discount / Concession</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Applies concession waiver to patient invoice</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleApplyDiscount}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Active Invoice <span className="required">*</span></label>
                    <select className="form-select" value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)}>
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} — {inv.patientName} (Gross: ₹{inv.grossAmount}, Due: ₹{inv.outstandingBalance})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Amount (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Authorizing Authority</label>
                    <input
                      type="text"
                      className="form-input"
                      value={approvedBy}
                      onChange={e => setApprovedBy(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Concession Category / Policy Reason</label>
                    <input
                      type="text"
                      className="form-input"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Apply Concession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
