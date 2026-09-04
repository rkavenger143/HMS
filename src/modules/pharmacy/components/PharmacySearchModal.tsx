import React, { useState } from 'react';
import { Search, X, Pill, ArrowRight, Layers, FileText } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

interface PharmacySearchModalProps {
  onClose: () => void;
}

export default function PharmacySearchModal({ onClose }: PharmacySearchModalProps) {
  const { medicines, batches, prescriptions, setSelectedMedicineId, setSelectedPrescriptionId, setActiveTab } = usePharmacy();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedMeds = query.length >= 2 ? medicines.filter(m =>
    m.brandName.toLowerCase().includes(q) ||
    m.genericName.toLowerCase().includes(q) ||
    m.medicineCode.toLowerCase().includes(q) ||
    m.manufacturer.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchedRx = query.length >= 2 ? prescriptions.filter(p =>
    p.prescriptionNumber.toLowerCase().includes(q) ||
    p.patientName.toLowerCase().includes(q) ||
    p.patientId.toLowerCase().includes(q) ||
    p.doctorName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const handleSelectMed = (medId: string) => {
    setSelectedMedicineId(medId);
    setActiveTab('medicines');
    onClose();
  };

  const handleSelectRx = (rxId: string) => {
    setSelectedPrescriptionId(rxId);
    setActiveTab('prescriptions');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Pharmacy & Medication Quick Search</span>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              autoFocus
              className="form-input"
              placeholder="Search Brand Name, Generic, Batch #, Prescription, Patient..."
              style={{ paddingLeft: 36, height: 42, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {query.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Matched Medicines */}
              {matchedMeds.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Formulary Medicines ({matchedMeds.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedMeds.map(m => (
                      <div
                        key={m.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectMed(m.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                            {m.brandName} — {m.genericName} ({m.strength})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Stock: <strong>{m.totalStock} {m.unit}</strong> · MRP: ₹{m.sellingPrice} · Location: {m.storageLocation || 'Main Store'}
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Prescriptions */}
              {matchedRx.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Prescriptions ({matchedRx.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedRx.map(p => (
                      <div
                        key={p.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectRx(p.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {p.prescriptionNumber} — {p.patientName} ({p.patientId})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Doctor: {p.doctorName} · {p.medicines.length} Medicines · Status: <strong style={{ textTransform: 'uppercase' }}>{p.dispensingStatus}</strong>
                          </div>
                        </div>
                        <span className="badge badge-primary">{p.encounterType.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedMeds.length === 0 && matchedRx.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching pharmacy records found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search medicines, generic formulations, batches, and prescriptions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
