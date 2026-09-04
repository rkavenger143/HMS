import React, { useState } from 'react';
import { History, Search, Filter, Printer, Pill, Calendar } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import PrintPharmacyReceiptModal from './modals/PrintPharmacyReceiptModal';
import type { ComprehensivePrescription } from '../../../types';

export default function PatientPharmacyHistory() {
  const { prescriptions, sales } = usePharmacy();
  const [selectedPatientId, setSelectedPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [printTarget, setPrintTarget] = useState<ComprehensivePrescription | null>(null);

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const patientPrescriptions = prescriptions.filter(p => p.patientId === selectedPatientId);
  const patientSales = sales.filter(s => s.patientId === selectedPatientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Longitudinal Patient Medication EHR & Dispensing History</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete patient pharmacotherapy record across all OPD visits, inpatient stays, and emergency admissions
            </div>
          </div>
        </div>

        {/* Patient Picker */}
        <select
          className="form-select"
          style={{ width: 280 }}
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          {DEMO_PATIENTS.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
            </option>
          ))}
        </select>
      </div>

      {/* Patient Card */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-md">{selectedPatient.firstName[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                UHID: <strong>{selectedPatient.id}</strong> · {selectedPatient.gender?.toUpperCase()}, {(selectedPatient as any).age || 35}y · Phone: {selectedPatient.phone}
              </div>
            </div>
          </div>

          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
            {patientPrescriptions.length} Lifetime Prescriptions
          </span>
        </div>
      </div>

      {/* Prescriptions History Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patientPrescriptions.length > 0 ? (
          patientPrescriptions.map(rx => (
            <div key={rx.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)', paddingBottom: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>
                      {rx.prescriptionNumber}
                    </span>
                    <span className="badge badge-primary">{rx.encounterType.toUpperCase()}</span>
                    <span className={`badge ${rx.dispensingStatus === 'dispensed' ? 'badge-success' : 'badge-warning'}`}>
                      {rx.dispensingStatus.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Prescribed: <strong>{rx.date}</strong> by <strong>{rx.doctorName}</strong> ({rx.department}) · Diagnosis: <strong>{rx.diagnosis}</strong>
                  </div>
                </div>

                {rx.dispensingStatus === 'dispensed' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setPrintTarget(rx)}>
                    <Printer size={12} /> View Bill / Receipt
                  </button>
                )}
              </div>

              {/* Medicines Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rx.medicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <strong>{m.medicineName}</strong> — {m.dosage} ({m.route}) · {m.frequency} for {m.duration}
                      {m.instructions && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Note: {m.instructions}</div>}
                    </div>

                    <div>
                      Dispensed: <strong style={{ color: 'var(--color-success)' }}>{m.dispensedQty} / {m.prescribedQty}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No medication history found for this patient.
          </div>
        )}
      </div>

      {printTarget && (
        <PrintPharmacyReceiptModal prescription={printTarget} onClose={() => setPrintTarget(null)} />
      )}
    </div>
  );
}
