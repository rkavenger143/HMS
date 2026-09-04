import React, { useState } from 'react';
import { Pill, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import type { ComprehensivePrescription } from '../../../../types';

interface DispenseMedicineModalProps {
  prescription: ComprehensivePrescription;
  onClose: () => void;
}

export default function DispenseMedicineModal({ prescription, onClose }: DispenseMedicineModalProps) {
  const { batches, dispensePrescription } = usePharmacy();
  const [pharmacistName, setPharmacistName] = useState('Praveen Nair (Registered Pharmacist)');

  // Map each prescribed medicine to selected batch and dispensed quantity
  const [dispenseAllocations, setDispenseAllocations] = useState<
    { medicineId: string; batchNumber: string; dispensedQty: number }[]
  >(() => {
    return prescription.medicines.map(m => {
      // FEFO: find available batches for this medicine, sort by expiry date ascending
      const matchingBatches = batches
        .filter(b => b.medicineId === m.medicineId && b.availableQuantity > 0 && b.status !== 'expired' && b.status !== 'recalled')
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      const selectedBatch = matchingBatches[0];
      const remainingQtyToDispense = Math.max(0, m.prescribedQty - m.dispensedQty);
      const availableInBatch = selectedBatch ? selectedBatch.availableQuantity : 0;
      const initialQty = Math.min(remainingQtyToDispense, availableInBatch);

      return {
        medicineId: m.medicineId,
        batchNumber: selectedBatch ? selectedBatch.batchNumber : '',
        dispensedQty: initialQty,
      };
    });
  });

  const handleBatchChange = (medId: string, bNum: string) => {
    setDispenseAllocations(prev =>
      prev.map(al => (al.medicineId === medId ? { ...al, batchNumber: bNum } : al))
    );
  };

  const handleQtyChange = (medId: string, qty: number) => {
    setDispenseAllocations(prev =>
      prev.map(al => (al.medicineId === medId ? { ...al, dispensedQty: qty } : al))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispensePrescription(prescription.id, dispenseAllocations, pharmacistName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <Pill size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Dispense Prescription & FEFO Batch Allocation</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Prescription: <strong>{prescription.prescriptionNumber}</strong> · Patient: {prescription.patientName} ({prescription.patientId})
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Patient & Doctor Card */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Patient:</span><br />
                <strong>{prescription.patientName}</strong> ({prescription.gender.toUpperCase()}, {prescription.age}y)
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Encounter & Location:</span><br />
                <strong>{prescription.encounterType.toUpperCase()}</strong> {prescription.bedNumber ? `· Bed ${prescription.bedNumber}` : ''}
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Prescribing Doctor:</span><br />
                <strong>{prescription.doctorName}</strong> ({prescription.department})
              </div>
              <div style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
                <strong>Diagnosis:</strong> {prescription.diagnosis}
              </div>
            </div>

            {/* Prescribed Medicines Allocations */}
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Prescribed Medication Lines & FEFO Batch Allocations</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {prescription.medicines.map(m => {
                const availableBatches = batches
                  .filter(b => b.medicineId === m.medicineId && b.availableQuantity > 0 && b.status !== 'expired' && b.status !== 'recalled')
                  .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

                const alloc = dispenseAllocations.find(a => a.medicineId === m.medicineId);
                const isOutOfStock = availableBatches.length === 0;

                return (
                  <div
                    key={m.id}
                    style={{
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      background: isOutOfStock ? 'var(--color-danger-muted)' : 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{m.medicineName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {m.dosage} · {m.frequency} for {m.duration} ({m.route}) {m.instructions ? `· Note: ${m.instructions}` : ''}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: 12 }}>
                        <div>Prescribed: <strong>{m.prescribedQty}</strong></div>
                        <div style={{ color: 'var(--text-tertiary)' }}>Already Dispensed: {m.dispensedQty}</div>
                      </div>
                    </div>

                    {!isOutOfStock ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'center', marginTop: 8 }}>
                        <div>
                          <label className="form-label" style={{ fontSize: 11 }}>Select FEFO Batch</label>
                          <select
                            className="form-select"
                            style={{ fontSize: 12 }}
                            value={alloc?.batchNumber}
                            onChange={e => handleBatchChange(m.medicineId, e.target.value)}
                            required
                          >
                            {availableBatches.map(b => (
                              <option key={b.id} value={b.batchNumber}>
                                {b.batchNumber} (Exp: {b.expiryDate}) · Available: {b.availableQuantity}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: 11 }}>Dispensing Quantity</label>
                          <input
                            type="number"
                            className="form-input"
                            style={{ fontSize: 12 }}
                            value={alloc?.dispensedQty || 0}
                            min={0}
                            max={m.prescribedQty - m.dispensedQty}
                            onChange={e => handleQtyChange(m.medicineId, Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>
                        <AlertTriangle size={14} /> Out of stock in active pharmacy inventory. Reorder required.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Dispensing Pharmacist Verification</label>
              <input
                type="text"
                className="form-input"
                value={pharmacistName}
                onChange={e => setPharmacistName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Confirm Dispensing & Deduct Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
