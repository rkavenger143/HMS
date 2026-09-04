import React, { useState } from 'react';
import { Package, Plus, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import type { ComprehensiveMedicineItem, PharmacySupplierItem } from '../../../../types';

interface StockInModalProps {
  onClose: () => void;
}

export default function StockInModal({ onClose }: StockInModalProps) {
  const { medicines, suppliers, stockIn } = usePharmacy();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState(`INV-SP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [medicineId, setMedicineId] = useState(medicines[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(`LOT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [manufacturingDate, setManufacturingDate] = useState('2026-01-01');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [quantity, setQuantity] = useState(100);
  const [freeQuantity, setFreeQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(25.0);
  const [sellingPrice, setSellingPrice] = useState(40.0);
  const [receivedBy, setReceivedBy] = useState('Praveen Nair (Chief Pharmacist)');

  const selectedMed = medicines.find(m => m.id === medicineId) || medicines[0];
  const selectedSup = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const handleMedChange = (mId: string) => {
    setMedicineId(mId);
    const m = medicines.find(item => item.id === mId);
    if (m) {
      setPurchasePrice(m.purchasePrice);
      setSellingPrice(m.sellingPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !selectedSup) return;

    const totalQty = Number(quantity) + Number(freeQuantity);

    stockIn(
      {
        medicineId: selectedMed.id,
        medicineName: `${selectedMed.brandName} (${selectedMed.genericName} ${selectedMed.strength})`,
        batchNumber,
        manufacturingDate,
        expiryDate,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        quantity: totalQty,
        availableQuantity: totalQty,
        supplierId: selectedSup.id,
        supplierName: selectedSup.supplierName,
        purchaseInvoiceNo,
        receivedDate: new Date().toISOString().slice(0, 10),
      },
      receivedBy
    );

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <Package size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Inward Stock Receipt & Goods Inward Note (GRN)</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Receive purchased pharmaceutical batches, assign lot numbers, and update available inventory
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              {/* Supplier & Invoice */}
              <div className="form-group">
                <label className="form-label">Pharmaceutical Supplier <span className="required">*</span></label>
                <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName} ({s.supplierCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier Invoice Number <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={purchaseInvoiceNo}
                  onChange={e => setPurchaseInvoiceNo(e.target.value)}
                  required
                />
              </div>

              {/* Medicine Selector */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Select Medicine Item <span className="required">*</span></label>
                <select className="form-select" value={medicineId} onChange={e => handleMedChange(e.target.value)} required>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} — {m.genericName} ({m.strength}, {m.dosageForm}) · Pack: {m.unit} · Current Stock: {m.totalStock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch & Dates */}
              <div className="form-group">
                <label className="form-label">Manufacturer Batch / Lot Number <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  placeholder="LOT-XXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturing Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={manufacturingDate}
                  onChange={e => setManufacturingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              {/* Quantities */}
              <div className="form-group">
                <label className="form-label">Inward Billed Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bonus / Free Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={freeQuantity}
                  onChange={e => setFreeQuantity(Number(e.target.value))}
                  min={0}
                />
              </div>

              {/* Pricing */}
              <div className="form-group">
                <label className="form-label">Unit Purchase Rate (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling MRP per Pack (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Receiving Pharmacist</label>
                <input
                  type="text"
                  className="form-input"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Finalize GRN & Inward Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
