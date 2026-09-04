import React, { useState } from 'react';
import { Undo2, X, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { DEMO_PATIENTS } from '../../../../data/seedData';

interface CreateReturnModalProps {
  onClose: () => void;
}

export default function CreateReturnModal({ onClose }: CreateReturnModalProps) {
  const { medicines, suppliers, batches, processMedicineReturn } = usePharmacy();

  const [returnType, setReturnType] = useState<'patient' | 'supplier'>('patient');
  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [referenceNumber, setReferenceNumber] = useState('POS-2026-00441');
  const [medicineId, setMedicineId] = useState(medicines[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(batches[0]?.batchNumber || 'LOT-DL-9821');
  const [quantity, setQuantity] = useState(1);
  const [returnCondition, setReturnCondition] = useState<'sealed_good' | 'damaged' | 'expired'>('sealed_good');
  const [returnReason, setReturnReason] = useState('Patient dose discontinued by consulting physician');
  const [processedBy, setProcessedBy] = useState('Praveen Nair (Chief Pharmacist)');

  const selectedMed = medicines.find(m => m.id === medicineId) || medicines[0];
  const selectedPat = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];
  const selectedSup = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const refundUnitPrice = selectedMed?.sellingPrice || 33.5;
  const totalRefund = quantity * refundUnitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    processMedicineReturn({
      returnType,
      patientId: returnType === 'patient' ? selectedPat?.id : undefined,
      patientName: returnType === 'patient' ? `${selectedPat?.firstName} ${selectedPat?.lastName}` : undefined,
      supplierId: returnType === 'supplier' ? selectedSup?.id : undefined,
      supplierName: returnType === 'supplier' ? selectedSup?.supplierName : undefined,
      referenceSaleOrInvoiceId: referenceNumber,
      items: [
        {
          medicineId: selectedMed.id,
          medicineName: selectedMed.brandName,
          batchNumber,
          quantity: Number(quantity),
          unitPrice: refundUnitPrice,
          refundAmount: totalRefund,
          returnCondition,
          returnReason,
        },
      ],
      totalRefundAmount: totalRefund,
      processedBy,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Undo2 size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Medicine Return & Inventory Reinstatement</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Process patient returns or return defective/expired goods to supplier
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Return Channel</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="returnType"
                      checked={returnType === 'patient'}
                      onChange={() => setReturnType('patient')}
                    />
                    <span>Patient Return (Credit / Refund)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="returnType"
                      checked={returnType === 'supplier'}
                      onChange={() => setReturnType('supplier')}
                    />
                    <span>Supplier Return (Vendor Debit Note)</span>
                  </label>
                </div>
              </div>

              {returnType === 'patient' ? (
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                    {DEMO_PATIENTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Select Supplier</label>
                  <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reference Bill / Invoice #</label>
                <input
                  type="text"
                  className="form-input"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Returned Medicine Item</label>
                <select className="form-select" value={medicineId} onChange={e => setMedicineId(e.target.value)}>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} ({m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Return Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={quantity}
                  min={1}
                  onChange={e => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition Inspection</label>
                <select className="form-select" value={returnCondition} onChange={e => setReturnCondition(e.target.value as any)}>
                  <option value="sealed_good">Sealed & Intact (Reinstate to Stock)</option>
                  <option value="damaged">Damaged / Opened (Quarantine & Discard)</option>
                  <option value="expired">Expired (Bio-Hazard Disposal)</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reason for Return</label>
                <input
                  type="text"
                  className="form-input"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Calculated Refund / Credit Value:</span>
              <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>₹{totalRefund.toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Process Return Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
