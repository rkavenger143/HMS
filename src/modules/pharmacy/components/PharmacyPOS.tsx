import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Trash2, CheckCircle2, Printer, CreditCard, DollarSign, QrCode } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { useToast } from '../../../contexts/ToastContext';
import PrintPharmacyReceiptModal from './modals/PrintPharmacyReceiptModal';
import type { ComprehensiveMedicineItem, PharmacySaleRecord } from '../../../types';

export default function PharmacyPOS() {
  const { showToast } = useToast();
  const { medicines, batches, processPOSSale } = usePharmacy();

  const [search, setSearch] = useState('');
  const [patientName, setPatientName] = useState('Walk-In Customer');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'insurance'>('upi');
  const [pharmacistName, setPharmacistName] = useState('Praveen Nair (Pharmacist)');
  const [cart, setCart] = useState<
    {
      medicine: ComprehensiveMedicineItem;
      batchNumber: string;
      expiryDate: string;
      qty: number;
      price: number;
    }[]
  >([]);
  const [completedSale, setCompletedSale] = useState<PharmacySaleRecord | null>(null);

  const filteredMeds = medicines.filter(m => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q)
    );
  });

  const handleAddToCart = (med: ComprehensiveMedicineItem) => {
    // Find earliest expiring available batch (FEFO)
    const availableBatches = batches
      .filter(b => b.medicineId === med.id && b.availableQuantity > 0 && b.status !== 'expired' && b.status !== 'recalled')
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (availableBatches.length === 0) {
      showToast(`No available stock batches for ${med.brandName}`, 'warning');
      return;
    }

    const selectedBatch = availableBatches[0];

    setCart(prev => {
      const existing = prev.find(item => item.medicine.id === med.id && item.batchNumber === selectedBatch.batchNumber);
      if (existing) {
        return prev.map(item =>
          item.medicine.id === med.id && item.batchNumber === selectedBatch.batchNumber
            ? { ...item, qty: Math.min(selectedBatch.availableQuantity, item.qty + 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          medicine: med,
          batchNumber: selectedBatch.batchNumber,
          expiryDate: selectedBatch.expiryDate,
          qty: 1,
          price: med.sellingPrice,
        },
      ];
    });
  };

  const handleQtyChange = (medId: string, bNum: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.medicine.id === medId && item.batchNumber === bNum) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const handleRemove = (medId: string, bNum: string) => {
    setCart(prev => prev.filter(item => !(item.medicine.id === medId && item.batchNumber === bNum)));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = subtotal * 0.12;
  const grandTotal = subtotal; // MRP is tax-inclusive

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const saleRecord = processPOSSale({
      patientName,
      items: cart.map(item => ({
        medicineId: item.medicine.id,
        medicineName: `${item.medicine.brandName} (${item.medicine.strength})`,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        quantity: item.qty,
        unitPrice: item.price,
        discount: 0,
        tax: item.price * item.qty * 0.12,
        total: item.price * item.qty,
      })),
      subtotal,
      discountAmount: 0,
      taxAmount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'paid',
      pharmacistName,
    });

    setCompletedSale(saleRecord);
    setCart([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Outpatient Counter POS & Express Billing</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Barcode-ready rapid OTC dispensing, instant FEFO batch allocation, GST calculation, and cash receipt generation
            </div>
          </div>
        </div>
      </div>

      {/* POS Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Left: Product Catalog & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                autoFocus
                placeholder="Search Medicine by Brand Name, Generic Composition, Barcode..."
                style={{ paddingLeft: 36 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container" style={{ maxHeight: '60vh' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine Item</th>
                    <th>Form & Pack</th>
                    <th>Available Stock</th>
                    <th>MRP (₹)</th>
                    <th style={{ textAlign: 'right' }}>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map(med => {
                    const isOut = med.totalStock === 0;

                    return (
                      <tr key={med.id}>
                        <td>
                          <strong>{med.brandName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {med.genericName} ({med.strength})
                          </div>
                        </td>

                        <td>
                          <div style={{ textTransform: 'capitalize' }}>{med.dosageForm}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{med.unit}</div>
                        </td>

                        <td>
                          <strong style={{ color: isOut ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {med.totalStock}
                          </strong>
                        </td>

                        <td>
                          <strong style={{ color: 'var(--color-primary)' }}>₹{med.sellingPrice.toFixed(2)}</strong>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isOut}
                            onClick={() => handleAddToCart(med)}
                          >
                            <Plus size={12} /> Add
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

        {/* Right: Live Cart & Express Checkout */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content' }}>
          <div>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={16} />
                <span className="card-title">Dispensary Cart</span>
              </div>
              <span className="badge badge-primary">{cart.length} Item(s)</span>
            </div>

            {/* Cart Items Stream */}
            <div style={{ padding: '8px', maxHeight: 260, overflowY: 'auto' }}>
              {cart.map(item => (
                <div
                  key={`${item.medicine.id}-${item.batchNumber}`}
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13 }}>{item.medicine.brandName}</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      Batch: <span style={{ fontFamily: 'monospace' }}>{item.batchNumber}</span> (Exp: {item.expiryDate})
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>
                      ₹{item.price.toFixed(2)} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => handleQtyChange(item.medicine.id, item.batchNumber, -1)}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{item.qty}</span>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => handleQtyChange(item.medicine.id, item.batchNumber, 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => handleRemove(item.medicine.id, item.batchNumber)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontSize: 12 }}>
                  Cart is empty. Search & add medicines from left catalog.
                </div>
              )}
            </div>

            {/* Customer & Payment Inputs */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Customer / Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: 32, fontSize: 12 }}
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Payment Tender</label>
                <select
                  className="form-select"
                  style={{ height: 32, fontSize: 12 }}
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="cash">Cash Tender</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="insurance">TPA / Insurance Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Checkout Totals & Button */}
          <div style={{ padding: '14px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span>Tax (GST 12% incl.):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
              <span>Payable Total:</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
            >
              <CheckCircle2 size={14} /> Complete Sale & Print Bill
            </button>
          </div>
        </div>
      </div>

      {/* Completed Sale Thermal Bill Modal */}
      {completedSale && (
        <PrintPharmacyReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
