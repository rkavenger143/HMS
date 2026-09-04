import React, { useState } from 'react';
import { Pill, Search, Filter, CheckCircle2, Clock, Printer, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import DispenseMedicineModal from './modals/DispenseMedicineModal';
import PrintPharmacyReceiptModal from './modals/PrintPharmacyReceiptModal';
import type { ComprehensivePrescription } from '../../../types';

export default function PharmacyDispensingDesk() {
  const { prescriptions } = usePharmacy();

  const [search, setSearch] = useState('');
  const [dispenseTarget, setDispenseTarget] = useState<ComprehensivePrescription | null>(null);
  const [printTarget, setPrintTarget] = useState<ComprehensivePrescription | null>(null);

  const pendingPrescriptions = prescriptions.filter(
    p => p.dispensingStatus === 'pending' || p.dispensingStatus === 'partially_dispensed'
  );

  const filtered = pendingPrescriptions.filter(rx => {
    const q = search.toLowerCase();
    return (
      !search ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.patientId.toLowerCase().includes(q) ||
      rx.prescriptionNumber.toLowerCase().includes(q) ||
      rx.doctorName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Dispensing Workstation & FEFO Allocation Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Prescription safety validation, automated First-Expiry-First-Out (FEFO) batch selection, and partial dispensing logging
            </div>
          </div>
        </div>

        <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: 12 }}>
          {pendingPrescriptions.length} Order(s) Awaiting Dispensation
        </span>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Prescription, Patient Name, UHID..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pending Prescriptions Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length > 0 ? (
          filtered.map(rx => {
            const isPartial = rx.dispensingStatus === 'partially_dispensed';

            return (
              <div
                key={rx.id}
                className="card"
                style={{
                  padding: 20,
                  borderLeft: `5px solid ${isPartial ? 'var(--color-warning)' : 'var(--color-primary)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{rx.prescriptionNumber}</span>
                      <span className="badge badge-primary">{rx.encounterType.toUpperCase()}</span>
                      <span className={`badge ${rx.priority === 'stat' ? 'badge-danger' : rx.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                        {rx.priority.toUpperCase()}
                      </span>
                      <span className={`badge ${isPartial ? 'badge-warning' : 'badge-primary'}`}>
                        {rx.dispensingStatus.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Patient: <strong>{rx.patientName}</strong> ({rx.patientId}) · Doctor: <strong>{rx.doctorName}</strong> ({rx.department})
                    </div>
                  </div>

                  <button className="btn btn-primary btn-sm" onClick={() => setDispenseTarget(rx)}>
                    <Pill size={12} /> Dispense with FEFO Allocation
                  </button>
                </div>

                {/* Medicine Lines Summary */}
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rx.medicines.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <div>
                        <strong>{m.medicineName}</strong> — {m.dosage} ({m.frequency} for {m.duration})
                      </div>
                      <div>
                        Prescribed: <strong>{m.prescribedQty}</strong> · Dispensed: <strong style={{ color: m.dispensedQty >= m.prescribedQty ? 'var(--color-success)' : 'var(--color-warning)' }}>{m.dispensedQty}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>All Prescriptions Fully Dispensed</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>No pending prescriptions awaiting dispensary fulfillment.</div>
          </div>
        )}
      </div>

      {/* Modals */}
      {dispenseTarget && (
        <DispenseMedicineModal prescription={dispenseTarget} onClose={() => setDispenseTarget(null)} />
      )}
      {printTarget && (
        <PrintPharmacyReceiptModal prescription={printTarget} onClose={() => setPrintTarget(null)} />
      )}
    </div>
  );
}
