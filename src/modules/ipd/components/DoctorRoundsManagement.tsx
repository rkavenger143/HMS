import React, { useState } from 'react';
import {
  Stethoscope, CheckCircle2, Clock, Plus, Search, Filter,
  HeartPulse, FileText, User, AlertCircle, Eye
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { IPDDoctorRound, Admission } from '../../../types';
import RecordRoundModal from './modals/RecordRoundModal';

export default function DoctorRoundsManagement() {
  const {
    doctorRounds,
    admissions,
    doctors,
    wards,
    setActiveTab,
    setSelectedAdmissionId,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('');
  const [roundAdmission, setRoundAdmission] = useState<Admission | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredRounds = doctorRounds.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.patientName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q) ||
      r.progressNotes.toLowerCase().includes(q);

    const matchDoctor = !selectedDoctorFilter || r.doctorId === selectedDoctorFilter;
    return matchSearch && matchDoctor;
  });

  const handleOpenEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('inpatient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Doctor Rounds & Clinical Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consultant bedside rounds, progress notes, orders, and treatment modifications
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setRoundAdmission(activeAdmissions[0] || null)}
          >
            <Plus size={13} /> Record Doctor Round
          </button>
        </div>
      </div>

      {/* Inpatients Awaiting Doctor Round (Active Roster) */}
      <div className="card">
        <div className="card-header">
          <Clock size={16} style={{ color: 'var(--color-warning)' }} />
          <span className="card-title">Inpatient Rounds Roster ({activeAdmissions.length} Active Patients)</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & UHID</th>
                  <th>Ward / Bed</th>
                  <th>Attending Consultant</th>
                  <th>Primary Diagnosis</th>
                  <th>Last Recorded Round</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map(adm => {
                  const lastRound = doctorRounds.find(r => r.admissionId === adm.id);
                  const isICU = adm.ward.toLowerCase().includes('icu');

                  return (
                    <tr key={adm.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{adm.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 10 }}>{adm.patientId}</div>
                      </td>
                      <td>
                        <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800 }}>
                          {adm.bedNumber}
                        </span>
                        <span style={{ fontSize: 12, marginLeft: 6 }}>{adm.ward}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{adm.admittingDoctorName}</div>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {adm.diagnosis.join(', ')}
                        </div>
                      </td>
                      <td>
                        {lastRound ? (
                          <div style={{ fontSize: 12 }}>
                            <span style={{ fontWeight: 700 }}>{lastRound.roundDate}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>({lastRound.roundTime})</span>
                          </div>
                        ) : (
                          <span className="badge badge-warning">No Rounds Today</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setRoundAdmission(adm)}
                          >
                            <Stethoscope size={12} /> Conduct Round
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px', fontSize: 11 }}
                            onClick={() => handleOpenEHR(adm.id)}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Doctor Rounds History Log */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Chronological Doctor Rounds History ({filteredRounds.length})</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search notes, patient, doctor..."
                style={{ paddingLeft: 26, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ height: 32, fontSize: 12 }}
              value={selectedDoctorFilter}
              onChange={e => setSelectedDoctorFilter(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body">
          {filteredRounds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredRounds.map(r => (
                <div key={r.id} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{r.doctorName[0]}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{r.doctorName} ({r.department})</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Inpatient: <strong>{r.patientName}</strong> · Round: {r.roundDate} at {r.roundTime}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${r.condition === 'critical' ? 'badge-danger' : r.condition === 'improving' ? 'badge-success' : 'badge-primary'}`}>
                      {r.condition.toUpperCase()}
                    </span>
                  </div>

                  {/* Vitals Snapshot */}
                  {r.vitals && (
                    <div style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 4, display: 'flex', gap: 12, fontSize: 11, marginBottom: 8 }}>
                      <span>BP: <strong>{r.vitals.bloodPressure}</strong></span>
                      <span>Pulse: <strong>{r.vitals.pulse} bpm</strong></span>
                      <span>Temp: <strong>{r.vitals.temperature}°F</strong></span>
                      <span>SpO2: <strong>{r.vitals.spo2}%</strong></span>
                    </div>
                  )}

                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>Progress Notes: </strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.progressNotes}</span>
                  </div>

                  {r.clinicalFindings && (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                      <strong>Clinical Findings: </strong>{r.clinicalFindings}
                    </div>
                  )}

                  {r.treatmentPlan && (
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', background: 'var(--color-primary-muted)', padding: '6px 10px', borderRadius: 4 }}>
                      <strong>Treatment Plan: </strong>{r.treatmentPlan}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Stethoscope size={28} /></div>
              <div className="empty-state-title">No Doctor Round Entries Found</div>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Round Entry Modal */}
      {roundAdmission && (
        <RecordRoundModal
          admission={roundAdmission}
          onClose={() => setRoundAdmission(null)}
        />
      )}
    </div>
  );
}
