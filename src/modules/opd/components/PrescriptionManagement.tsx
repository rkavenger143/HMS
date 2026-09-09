import React, { useState } from 'react';
import {
  Pill, Plus, Trash2, Printer, Save, AlertTriangle, ShieldCheck,
  Search, Clock, History, CheckCircle2, RotateCcw, Stethoscope
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import { DEMO_MEDICINES } from '../../../data/seedData';
import type { OPDMedicineItem, Patient, Doctor } from '../../../types';
import PrintPrescriptionModal from './modals/PrintPrescriptionModal';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Other'] as const;
const ROUTES = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Ophthalmic', 'Nasal'] as const;
const FREQUENCIES = [
  'Once Daily (OD)',
  'Twice Daily (BD)',
  'Thrice Daily (TID)',
  'Four Times (QID)',
  'Every 6 Hours',
  'Every 8 Hours',
  'As Needed (SOS)',
  'Before Food',
  'After Food',
  'At Bedtime (HS)'
] as const;

export default function PrescriptionManagement() {
  const {
    visits,
    patients,
    doctors,
    prescriptions,
    selectedVisit,
    savePrescription,
    setActiveTab,
  } = useOPD();

  // Active visit or fallback
  const activeVisit = selectedVisit || visits.find(v => v.status === 'in_consultation') || visits[0];
  const activePatient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) : null;
  const activeDoctor = activeVisit ? doctors.find(d => d.id === activeVisit.doctorId) : doctors[0];

  // Prescribed items list
  const [items, setItems] = useState<OPDMedicineItem[]>([
    {
      id: 'med-item-1',
      medicineId: 'med-003',
      medicineName: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      type: 'Tablet',
      strength: '500mg',
      dosage: '1 Tab',
      route: 'Oral',
      frequency: 'Thrice Daily (TID)',
      duration: '5 days',
      quantity: 15,
      instructions: 'Take after meals for fever / body ache',
    },
    {
      id: 'med-item-2',
      medicineId: 'med-009',
      medicineName: 'Pantoprazole 40mg',
      genericName: 'Pantoprazole Sodium',
      type: 'Tablet',
      strength: '40mg',
      dosage: '1 Tab',
      route: 'Oral',
      frequency: 'Before Food',
      duration: '5 days',
      quantity: 5,
      instructions: 'Take in morning 30 mins before breakfast',
    }
  ]);

  // New item inputs
  const [medSearch, setMedSearch] = useState('');
  const [medType, setMedType] = useState<OPDMedicineItem['type']>('Tablet');
  const [strength, setStrength] = useState('500mg');
  const [dosage, setDosage] = useState('1 Tab');
  const [route, setRoute] = useState<OPDMedicineItem['route']>('Oral');
  const [frequency, setFrequency] = useState<OPDMedicineItem['frequency']>('Twice Daily (BD)');
  const [duration, setDuration] = useState('5 days');
  const [quantity, setQuantity] = useState(10);
  const [instructions, setInstructions] = useState('After meals with warm water');

  const [notes, setNotes] = useState('Complete full prescribed antibiotic course if indicated. Maintain adequate hydration.');

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Medicine catalog search
  const matchingMedicines = DEMO_MEDICINES.filter(m => {
    if (!medSearch) return false;
    const q = medSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  }).slice(0, 5);

  const handleSelectCatalogMed = (med: typeof DEMO_MEDICINES[0]) => {
    setMedSearch(med.name);
    setStrength(med.strength || '500mg');
    setMedType(med.form === 'Capsule' ? 'Capsule' : med.form === 'Injection' ? 'Injection' : 'Tablet');
  };

  const handleAddItem = () => {
    if (!medSearch) return;

    const newItem: OPDMedicineItem = {
      id: `med-item-${Date.now()}`,
      medicineName: medSearch,
      type: medType,
      strength,
      dosage,
      route,
      frequency,
      duration,
      quantity,
      instructions,
    };

    setItems(prev => [...prev, newItem]);
    setMedSearch('');
    setInstructions('After meals with warm water');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (!activeVisit) return;
    savePrescription({
      patientId: activeVisit.patientId,
      patientName: activeVisit.patientName,
      doctorId: activeVisit.doctorId,
      doctorName: activeVisit.doctorName,
      medicines: items,
      notes,
    });
    setShowPrintModal(true);
  };

  // Past Prescriptions for this patient
  const patientPastRx = prescriptions.filter(p => p.patientId === activeVisit?.patientId);

  // Allergy warning check
  const patientAllergies = activePatient?.allergies || [];
  const allergyConflicts = items.filter(item => {
    return patientAllergies.some(a =>
      item.medicineName.toLowerCase().includes(a.toLowerCase()) ||
      (item.genericName && item.genericName.toLowerCase().includes(a.toLowerCase()))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Digital OPD Prescription Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Prescribing for: <strong>{activeVisit?.patientName}</strong> ({activeVisit?.patientId}) · Attending: <strong>{activeVisit?.doctorName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintModal(true)}>
            <Printer size={13} /> Preview Rx Letterhead
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={items.length === 0}>
            <Save size={13} /> Save Prescription
          </button>
        </div>
      </div>

      {/* Allergy Alert Warning if conflicts detected */}
      {allergyConflicts.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.4)', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>⚠️ DRUG ALLERGY WARNING CONFLICT DETECTED</div>
            <div style={{ fontSize: 12 }}>
              Patient has recorded allergy to <strong>{patientAllergies.join(', ')}</strong>. Please review prescribed item: {allergyConflicts.map(c => c.medicineName).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Medicine Composer & Active Prescription List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add Medicine Form Card */}
          <div className="card">
            <div className="card-header">
              <Plus size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Add Medication to Prescription</span>
            </div>
            <div className="card-body">
              {/* Medicine Name Search with Hospital Formulary Auto-complete */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <label className="form-label">Medicine Brand or Generic Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type medicine name (e.g. Paracetamol, Metformin, Amlodipine, Azithromycin)..."
                  value={medSearch}
                  onChange={e => setMedSearch(e.target.value)}
                />

                {matchingMedicines.length > 0 && (
                  <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                    {matchingMedicines.map(m => (
                      <div
                        key={m.id}
                        className="search-result-item"
                        onClick={() => handleSelectCatalogMed(m)}
                      >
                        <Pill size={14} style={{ color: 'var(--color-primary)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.genericName} · {m.form} · ₹{m.price}/unit</div>
                        </div>
                        <span className="badge badge-neutral">{m.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="form-grid form-grid-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Dosage Form</label>
                  <select
                    className="form-select"
                    value={medType}
                    onChange={e => setMedType(e.target.value as any)}
                  >
                    {MEDICINE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Strength</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 500mg, 10mg"
                    value={strength}
                    onChange={e => setStrength(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dosage / Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1 Tab, 5ml"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Route</label>
                  <select
                    className="form-select"
                    value={route}
                    onChange={e => setRoute(e.target.value as any)}
                  >
                    {ROUTES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 5 days, 1 month"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / span 1' }}>
                  <label className="form-label">Dispense Qty</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '2 / span 2' }}>
                  <label className="form-label">Special Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. After food with warm water"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddItem}
                  disabled={!medSearch}
                >
                  <Plus size={13} /> Add Medicine
                </button>
              </div>
            </div>
          </div>

          {/* Current Prescription Items Table */}
          <div className="card">
            <div className="card-header">
              <Pill size={16} style={{ color: 'var(--color-primary)' }} />
              <div className="card-title" style={{ fontSize: 15 }}>
                Current Prescription List ({items.length} Medicines)
              </div>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage / Route</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                      <th style={{ textAlign: 'right' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                              {item.medicineName} {item.strength && `(${item.strength})`}
                            </div>
                            <span className="badge badge-neutral" style={{ fontSize: 9, marginTop: 2 }}>{item.type}</span>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {item.dosage} · <span style={{ color: 'var(--text-tertiary)' }}>{item.route}</span>
                          </td>
                          <td>
                            <span className="badge badge-primary" style={{ fontSize: 11 }}>{item.frequency}</span>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>{item.duration}</td>
                          <td style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: 160 }}>
                            {item.instructions}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              style={{ color: 'var(--color-danger)' }}
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <div className="empty-state-icon"><Pill size={28} /></div>
                            <div className="empty-state-title">No Medications Added</div>
                            <div className="empty-state-desc">Use the composer above to add medicines to this prescription.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: General Advice & Past Prescription History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* General Rx Notes & Dietary Advice */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 14 }}>Prescription Advice & Dietary Notes</span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="General precautions, warnings, diet modifications, hydration advice..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 42 }}
                  onClick={handleSave}
                  disabled={items.length === 0}
                >
                  <CheckCircle2 size={15} /> Save & Generate Rx
                </button>
              </div>
            </div>
          </div>

          {/* Past Prescription History for this patient */}
          <div className="card">
            <div className="card-header">
              <History size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Patient Previous Rx History</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px', maxHeight: 380, overflowY: 'auto' }}>
              {patientPastRx.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {patientPastRx.map(rx => (
                    <div
                      key={rx.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{rx.id}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rx.date}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                        Dr. {rx.doctorName || 'Dr. Rajesh Kumar'} — {rx.diagnosis}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                        {rx.medicines?.map((m: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {m.medicineName}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>{m.dosage} ({m.frequency})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
                  No prior digital prescriptions on file for this patient.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Prescription Modal */}
      {showPrintModal && (
        <PrintPrescriptionModal
          consultation={{
            id: 'rx-current',
            date: '2026-08-31',
            chiefComplaint: activeVisit?.reasonForVisit,
            diagnosis: ['Primary Clinical Consultation'],
            prescription: items,
            notes,
            followUpDate: '2026-09-07',
          }}
          patient={activePatient}
          doctor={activeDoctor}
          visit={activeVisit}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
