import React, { useState } from 'react';
import { FileText, Search, Filter, Pill, Printer, CheckCircle2, Clock } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import DispenseMedicineModal from './modals/DispenseMedicineModal';
import PrintPharmacyReceiptModal from './modals/PrintPharmacyReceiptModal';
import type { ComprehensivePrescription } from '../../../types';

export default function PrescriptionQueue() {
  const {
    prescriptions,
    selectedPrescriptionId,
    setSelectedPrescriptionId,
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState('ALL');
  const [dispenseTarget, setDispenseTarget] = useState<ComprehensivePrescription | null>(null);
  const [printTarget, setPrintTarget] = useState<ComprehensivePrescription | null>(null);

  const filtered = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.patientId.toLowerCase().includes(q) ||
      rx.prescriptionNumber.toLowerCase().includes(q) ||
      rx.doctorName.toLowerCase().includes(q);

    const matchesEnc = selectedEncounter === 'ALL' || rx.encounterType === selectedEncounter;
    return matchesSearch && matchesEnc;
  });

  const activeRx = prescriptions.find(p => p.id === selectedPrescriptionId) || filtered[0] || prescriptions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Clinical Prescriptions & Medication Orders Queue</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Electronic physician prescriptions routed seamlessly from OPD consultations, IPD ward rounds, and Emergency casualty
            </div>
          </div>
        </div>

        <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
          {prescriptions.length} Active Prescriptions
        </span>
      </div>

      {/* 2-Column Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: 20 }}>
        {/* Left: Searchable Prescriptions Roster */}
        <div className="card" style={{ padding: 0, maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search Prescription #, Patient, Doctor..."
                style={{ paddingLeft: 30, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ height: 30, fontSize: 11 }}
              value={selectedEncounter}
              onChange={e => setSelectedEncounter(e.target.value)}
            >
              <option value="ALL">All Encounters (OPD / IPD / Emergency)</option>
              <option value="opd">Outpatient (OPD)</option>
              <option value="ipd">Inpatient (IPD)</option>
              <option value="emergency">Emergency Casualty</option>
            </select>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(rx => {
                const isSelected = activeRx?.id === rx.id;
                const isDispensed = rx.dispensingStatus === 'dispensed';

                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedPrescriptionId(rx.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                        {rx.prescriptionNumber}
                      </strong>
                      <span className={`badge ${isDispensed ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                        {rx.dispensingStatus.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700 }}>{rx.patientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {rx.doctorName} ({rx.department}) · {rx.encounterType.toUpperCase()} {rx.bedNumber ? `· Bed ${rx.bedNumber}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Comprehensive Prescription Inspector */}
        {activeRx ? (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)', paddingBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{activeRx.prescriptionNumber}</span>
                  <span className="badge badge-primary">{activeRx.encounterType.toUpperCase()}</span>
                  <span className={`badge ${activeRx.priority === 'stat' ? 'badge-danger' : activeRx.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {activeRx.priority.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Issued Date: <strong>{activeRx.date}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {activeRx.dispensingStatus !== 'dispensed' ? (
                  <button className="btn btn-primary btn-sm" onClick={() => setDispenseTarget(activeRx)}>
                    <Pill size={13} /> Dispense Medicines
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setPrintTarget(activeRx)}>
                    <Printer size={13} /> Print Bill
                  </button>
                )}
              </div>
            </div>

            {/* Patient & Doctor Card */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Patient Demographics:</span><br />
                <strong>{activeRx.patientName}</strong> ({activeRx.gender.toUpperCase()}, {activeRx.age}y)<br />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>UHID: {activeRx.patientId}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Encounter & Location:</span><br />
                <strong>{activeRx.encounterType.toUpperCase()}</strong> {activeRx.bedNumber ? `· Bed ${activeRx.bedNumber}` : ''}<br />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{activeRx.ward || 'General Outpatient Clinic'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Prescribing Consultant:</span><br />
                <strong>{activeRx.doctorName}</strong><br />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{activeRx.department}</span>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-default)', paddingTop: 8, marginTop: 4 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Clinical Diagnosis: </span>
                <strong>{activeRx.diagnosis}</strong>
              </div>
            </div>

            {/* Prescribed Drug Items */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Prescribed Drug Formulary Items ({activeRx.medicines.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeRx.medicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--color-primary)' }}>{m.medicineName}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Dosage: <strong>{m.dosage}</strong> ({m.route}) · Frequency: <strong>{m.frequency}</strong> · Duration: <strong>{m.duration}</strong>
                      </div>
                      {m.instructions && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Note: {m.instructions}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div>Prescribed: <strong>{m.prescribedQty}</strong></div>
                      <div style={{ fontSize: 11, color: m.dispensedQty >= m.prescribedQty ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        Dispensed: <strong>{m.dispensedQty}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispensing Footer */}
            {activeRx.dispensedBy && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
                Dispensed by <strong>{activeRx.dispensedBy}</strong> at <strong>{activeRx.dispensedAt}</strong>.
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No prescription selected.
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
