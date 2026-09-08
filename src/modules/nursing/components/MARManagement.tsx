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
      m.bedNumber.toLowerCase().includes(q) ||
      (m.nurseName && m.nurseName.toLowerCase().includes(q));

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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Medication Administration Record (MAR)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Scheduled bedside drug administration: Administer, Hold (Delayed), and Missed logging with automatic nurse timestamp
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
            <option value="held">Held / Delayed</option>
            <option value="missed">Missed Doses</option>
          </select>
        </div>
      </div>

      {/* MAR Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Bedside Medication Schedule</span>
            <span className="badge badge-primary">{filteredMAR.length} Prescriptions</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Bed</th>
                  <th>Medicine Name</th>
                  <th>Dose & Route</th>
                  <th>Scheduled Time</th>
                  <th>Administration Status</th>
                  <th>Administered Time & Nurse</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMAR.length > 0 ? (
                  filteredMAR.map(m => {
                    const isDone = m.status === 'administered';
                    const isHeld = m.status === 'held';
                    const isMissed = m.status === 'missed';

                    return (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.patientName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {m.bedNumber}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>{m.medicineName}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.frequency}</div>
                        </td>

                        <td>
                          <div>{m.dose}</div>
                          <span className="badge badge-neutral" style={{ fontSize: 9 }}>{m.route}</span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                            {m.scheduledTime}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.scheduledDate}</div>
                        </td>

                        <td>
                          {isDone ? (
                            <span className="badge badge-success">
                              <span className="badge-dot" /> Administered
                            </span>
                          ) : isHeld ? (
                            <span className="badge badge-warning">Held / Delayed</span>
                          ) : isMissed ? (
                            <span className="badge badge-danger">Missed</span>
                          ) : (
                            <span className="badge badge-primary">Scheduled / Due</span>
                          )}
                        </td>

                        <td>
                          {m.administeredTime ? (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600 }}>{m.administeredTime}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>By {m.nurseName}</div>
                            </div>
                          ) : m.reasonForHoldMissed ? (
                            <div style={{ fontSize: 11, color: 'var(--color-danger)' }}>
                              Reason: {m.reasonForHoldMissed}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pending Dose</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ padding: '3px 10px', fontSize: 11 }}
                            onClick={() => setActiveMedRecord(m)}
                          >
                            {isDone ? 'View Log' : 'Administer / Update'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state" style={{ padding: '32px' }}>
                        <div className="empty-state-icon"><Pill size={28} /></div>
                        <div className="empty-state-title">No Medication Records Found</div>
                        <div className="empty-state-desc">All scheduled doses are logged or filter criteria didn't match.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Administer Medication Modal */}
      {activeMedRecord && (
        <AdministerMedModal
          record={activeMedRecord}
          onClose={() => setActiveMedRecord(null)}
        />
      )}

      {/* Print MAR Modal */}
      {printAdm && (
        <PrintMARSheetModal
          admission={printAdm}
          records={marRecords.filter(r => r.admissionId === printAdm.id)}
          patient={patients.find(p => p.id === printAdm.patientId) || null}
          onClose={() => setPrintAdm(null)}
        />
      )}
    </div>
  );
}
