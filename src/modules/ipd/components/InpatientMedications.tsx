import React, { useState } from 'react';
import {
  Pill, Plus, CheckCircle2, Clock, XCircle, AlertCircle,
  Search, ShieldAlert, Sparkles, User, FileText
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { InpatientMedication } from '../../../types';

export default function InpatientMedications() {
  const {
    inpatientMedications,
    addInpatientMedication,
    medicationAdministrations,
    administerMedication,
    admissions,
    doctors,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(admissions[0]?.id || '');
  const [showAddMed, setShowAddMed] = useState(false);

  // New Med State
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('500mg');
  const [route, setRoute] = useState<InpatientMedication['route']>('Oral');
  const [dose, setDose] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('Twice Daily (BD)');
  const [startDate, setStartDate] = useState('2026-08-31');
  const [endDate, setEndDate] = useState('2026-09-04');
  const [instructions, setInstructions] = useState('Take after meals');
  const [prescribingDoctor, setPrescribingDoctor] = useState(doctors[0]?.name || 'Dr. Rajesh Kumar');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentAdm = admissions.find(a => a.id === selectedAdmissionId) || activeAdmissions[0];

  const currentMeds = inpatientMedications.filter(m => {
    const matchAdm = !selectedAdmissionId || m.admissionId === selectedAdmissionId;
    const q = search.toLowerCase();
    const matchSearch = !q || m.medicineName.toLowerCase().includes(q) || m.patientId.toLowerCase().includes(q);
    return matchAdm && matchSearch;
  });

  const handlePrescribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName || !currentAdm) return;

    addInpatientMedication({
      admissionId: currentAdm.id,
      patientId: currentAdm.patientId,
      medicineName,
      genericName,
      strength,
      route,
      dose,
      frequency,
      startDate,
      endDate,
      instructions,
      prescribingDoctor,
    });

    setMedicineName('');
    setGenericName('');
    setShowAddMed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Medication Chart & MAR</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Inpatient prescriptions, scheduled dosage times, and Medication Administration Records (MAR)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddMed(!showAddMed)}>
            <Plus size={13} /> {showAddMed ? 'Close Form' : 'Prescribe Inpatient Drug'}
          </button>
        </div>
      </div>

      {/* Inline Prescribe Drawer */}
      {showAddMed && (
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--color-primary)' }}>
            Prescribe Inpatient Medication for {currentAdm?.patientName} (Bed {currentAdm?.bedNumber})
          </div>
          <form onSubmit={handlePrescribe}>
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Inpatient <span className="required">*</span></label>
                <select className="form-select" value={selectedAdmissionId} onChange={e => setSelectedAdmissionId(e.target.value)}>
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>{a.patientName} (Bed {a.bedNumber} - {a.ward})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prescribing Consultant</label>
                <select className="form-select" value={prescribingDoctor} onChange={e => setPrescribingDoctor(e.target.value)}>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Medicine Name & Formulation <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Inj. Piperacillin + Tazobactam 4.5g"
                  value={medicineName}
                  onChange={e => setMedicineName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Generic Name / Composition</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Piperacillin 4g + Tazobactam 0.5g"
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Administration Route</label>
                <select className="form-select" value={route} onChange={e => setRoute(e.target.value as any)}>
                  <option value="Oral">Oral (PO)</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="IM">Intramuscular (IM)</option>
                  <option value="SC">Subcutaneous (SC)</option>
                  <option value="Inhalation">Inhalation / Nebulization</option>
                  <option value="Topical">Topical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dosage & Units</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1 Vial / 1 Tablet / 10ml"
                  value={dose}
                  onChange={e => setDose(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dosage Frequency</label>
                <select className="form-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                  <option value="Once Daily (OD)">Once Daily (OD)</option>
                  <option value="Twice Daily (BD)">Twice Daily (BD)</option>
                  <option value="Thrice Daily (TDS)">Thrice Daily (TDS)</option>
                  <option value="Four Times Daily (QID)">Four Times Daily (QID)</option>
                  <option value="At Bedtime (HS)">At Bedtime (HS)</option>
                  <option value="STAT / Immediate Single Dose">STAT / Immediate Single Dose</option>
                  <option value="As Needed / PRN">As Needed / PRN (SOS)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Nursing Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Infuse slowly over 30 mins in 100ml NS"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMed(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Add to Inpatient MAR Sheet</button>
            </div>
          </form>
        </div>
      )}

      {/* Patient Selector Bar */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {activeAdmissions.map(adm => (
          <button
            key={adm.id}
            className={`btn btn-sm ${selectedAdmissionId === adm.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedAdmissionId(adm.id)}
          >
            {adm.patientName} (Bed {adm.bedNumber})
          </button>
        ))}
      </div>

      {/* Active Inpatient Prescription Chart */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="card-title">Medication Chart for {currentAdm?.patientName || 'Inpatient'} (Bed {currentAdm?.bedNumber})</span>
            <div className="card-subtitle">Active drugs under administration and nurse verification log</div>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Name & Formulation</th>
                  <th>Route</th>
                  <th>Dose</th>
                  <th>Frequency</th>
                  <th>Start / End Date</th>
                  <th>Instructions</th>
                  <th>Prescribed By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>MAR Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMeds.length > 0 ? (
                  currentMeds.map(med => (
                    <tr key={med.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{med.medicineName}</div>
                        {med.genericName && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{med.genericName}</div>}
                      </td>
                      <td>
                        <span className="badge badge-primary">{med.route}</span>
                      </td>
                      <td>{med.dose}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{med.frequency}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 11 }}>{med.startDate} {med.endDate && `→ ${med.endDate}`}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.instructions}</td>
                      <td style={{ fontSize: 11 }}>{med.prescribingDoctor}</td>
                      <td>
                        <span className="badge badge-success">{med.status.toUpperCase()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            title="Mark Administered"
                            onClick={() => administerMedication({ medicationId: med.id, admissionId: currentAdm.id, status: 'administered' })}
                          >
                            <CheckCircle2 size={12} /> Given
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            title="Mark Missed / Held"
                            onClick={() => administerMedication({ medicationId: med.id, admissionId: currentAdm.id, status: 'held', remarks: 'Patient refused or held by doctor' })}
                          >
                            <XCircle size={12} /> Hold
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state" style={{ padding: 24 }}>
                        <div className="empty-state-icon"><Pill size={24} /></div>
                        <div className="empty-state-title">No Active Medications for This Inpatient</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MAR Log Table */}
      {medicationAdministrations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Recent Medication Administration Records (MAR Log)</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Medicine</th>
                    <th>Dose & Route</th>
                    <th>Administration Status</th>
                    <th>Administering Nurse</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {medicationAdministrations.map(mar => (
                    <tr key={mar.id}>
                      <td style={{ fontSize: 12 }}>{mar.scheduledDate} {mar.administeredTime || mar.scheduledTime}</td>
                      <td style={{ fontWeight: 700 }}>{mar.medicineName}</td>
                      <td>{mar.dose} ({mar.route})</td>
                      <td>
                        <span className={`badge ${mar.status === 'administered' ? 'badge-success' : 'badge-danger'}`}>
                          {mar.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{mar.nurseName}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{mar.remarks || 'Routine schedule'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
