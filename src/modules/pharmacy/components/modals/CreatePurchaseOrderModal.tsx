import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, X, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

interface CreatePurchaseOrderModalProps {
  onClose: () => void;
}

export default function CreatePurchaseOrderModal({ onClose }: CreatePurchaseOrderModalProps) {
  const { suppliers, medicines, createPurchaseOrder } = usePharmacy();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-09-15');
  const [items, setItems] = useState<
    { medicineId: string; medicineName: string; quantity: number; unitPrice: number; taxRate: number; totalAmount: number }[]
  >([
    {
      medicineId: medicines[0]?.id || '',
      medicineName: medicines[0]?.brandName || 'Dolo 650',
      quantity: 200,
      unitPrice: medicines[0]?.purchasePrice || 22.5,
      taxRate: 12,
      totalAmount: 200 * (medicines[0]?.purchasePrice || 22.5) * 1.12,
    },
  ]);

  const selectedSup = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const handleAddItem = () => {
    const defaultMed = medicines[0];
    if (!defaultMed) return;

    setItems(prev => [
      ...prev,
      {
        medicineId: defaultMed.id,
        medicineName: defaultMed.brandName,
        quantity: 100,
        unitPrice: defaultMed.purchasePrice,
        taxRate: 12,
        totalAmount: 100 * defaultMed.purchasePrice * 1.12,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (!med) return;

    setItems(prev =>
      prev.map((it, i) => {
        if (i === index) {
          const total = it.quantity * med.purchasePrice * (1 + it.taxRate / 100);
          return {
            ...it,
            medicineId: med.id,
            medicineName: med.brandName,
            unitPrice: med.purchasePrice,
            totalAmount: total,
          };
        }
        return it;
      })
    );
  };

  const handleQtyChange = (index: number, qty: number) => {
    setItems(prev =>
      prev.map((it, i) => {
        if (i === index) {
          const total = qty * it.unitPrice * (1 + it.taxRate / 100);
          return { ...it, quantity: qty, totalAmount: total };
        }
        return it;
      })
    );
  };

  const totalPOAmount = items.reduce((sum, it) => sum + it.totalAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSup || items.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSup.id,
      supplierName: selectedSup.supplierName,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate,
      items,
      totalAmount: totalPOAmount,
      createdBy: 'Praveen Nair (Chief Pharmacist)',
      approvedBy: 'Dr. S. K. Narayan (Medical Superintendent)',
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Generate Pharmacy Purchase Order (PO)</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Create procurement requisition to pharmaceutical distributors and manufacturers
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Pharmaceutical Vendor <span className="required">*</span></label>
                <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName} ({s.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Delivery Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Procurement Requisition Items ({items.length})</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                <Plus size={12} /> Add Drug Line
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
              {items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 100px 90px 30px',
                    gap: 8,
                    alignItems: 'center',
                    background: 'var(--bg-surface)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <select
                    className="form-select"
                    style={{ fontSize: 12 }}
                    value={it.medicineId}
                    onChange={e => handleMedChange(idx, e.target.value)}
                  >
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.brandName} ({m.strength})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: 12 }}
                    value={it.quantity}
                    min={1}
                    onChange={e => handleQtyChange(idx, Number(e.target.value))}
                  />

                  <div style={{ fontSize: 12, textAlign: 'right' }}>
                    ₹{it.unitPrice.toFixed(2)}/pk
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right' }}>
                    ₹{it.totalAmount.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 12, marginTop: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900 }}>
                Total Order Value (incl. GST): <span style={{ color: 'var(--color-primary)' }}>₹{totalPOAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Dispatch Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
