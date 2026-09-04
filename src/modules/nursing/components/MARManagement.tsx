import React, { useState } from 'react';
import { Pill, Plus, Search, Filter, Printer, CheckCircle2, PauseCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import AdministerMedModal from './modals/AdministerMedModal';
import PrintMARSheetModal from './modals/PrintMARSheetModal';

export default function MARManagement() {
  const { admissions, patients, marRecords } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAdmId, setSelectedAdmId] = useState<string>('ALL');

  const [activeMedRecord, setActiveMedRecord] = useState<any | null>(null);
  const [printAdm, setPrintAdm] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredMAR = marRecords.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.medicineName.toLowerCase().includes(q) ||
      m.patientName.toLowerCase().includes(q) ||
      m.bedNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    const matchesAdm = selectedAdmId === 'ALL' || m.admissionId === selectedAdmId;

    return matchesSearch && matchesStatus && matchesAdm;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Medication Administration Record (MAR & eMAR)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              5-Rights verification, bedside administration logging, scheduled doses, and hold/missed clinical audit
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPrintAdm(activeAdmissions[0])}>
            <Printer size={13} /> Print Inpatient MAR
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Medicine, Patient, or Bed..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedAdmId} onChange={e => setSelectedAdmId(e.target.value)}>
            <option value="ALL">All Inpatients ({activeAdmissions.length})</option>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} (Bed {a.bedNumber})</option>
            ))}
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({marRecords.length})</option>
            <option value="scheduled">Scheduled / Due ({marRecords.filter(m => m.status === 'scheduled').length})</option>
            <option value="administered">Administered ({marRecords.filter(m => m.status === 'administered').length})</option>
            <option value="held">Held Doses</option>
            <option value="missed">Missed Doses</option>
          </select>
        </div>
      </div>

      {/* MAR Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Medication Administration Schedule & Records</span>
            <span className="badge badge-primary">{filteredMAR.length} Medications</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & Bed</th>
                  <th>Medication & Strength</th>
                  <th>Dose & Route</th>
                  <th>Frequency</th>
                  <th>Scheduled Time</th>
                  <th>Administered Time</th>
                  <th>Status</th>
                  <th>Administering Nurse</th>
                  <th>Clinical Remarks</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMAR.map(med => {
                  const isDue = med.status === 'scheduled';
                  const isAdministered = med.status === 'administered';
                  const isHeldOrMissed = med.status === 'held' || med.status === 'missed';

                  return (
                    <tr key={med.id}>
                      <td>
                        <strong>{med.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {med.bedNumber}</div>
                      </td>
                      <td>
                        <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{med.medicineName}</strong>
                      </td>
                      <td>{med.dose} ({med.route})</td>
                      <td>{med.frequency}</td>
                      <td>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4, color: 'var(--text-tertiary)' }} />
                        <strong>{med.scheduledTime}</strong>
                      </td>
                      <td>
                        <strong>{med.administeredTime || '—'}</strong>
                      </td>
                      <td>
                        <span className={`badge ${isAdministered ? 'badge-success' : isDue ? 'badge-primary' : 'badge-danger'}`}>
                          {med.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{med.nurseName || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, color: isHeldOrMissed ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                          {med.reasonForHoldMissed || med.remarks || 'Standard prescription'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isDue ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setActiveMedRecord(med)}
                          >
                            <ShieldCheck size={12} /> Administer
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveMedRecord(med)}
                          >
                            Edit / Log
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Administer 5-Rights Modal */}
      {activeMedRecord && (
        <AdministerMedModal record={activeMedRecord} onClose={() => setActiveMedRecord(null)} />
      )}

      {/* Print MAR Modal */}
      {printAdm && (
        <PrintMARSheetModal
          records={marRecords.filter(m => m.admissionId === printAdm.id)}
          patient={patients.find(p => p.id === printAdm.patientId) || null}
          admission={printAdm}
          onClose={() => setPrintAdm(null)}
        />
      )}
    </div>
  );
}
