import React, { useState } from 'react';
import {
  Users, UserPlus, Search, Filter, Phone, Calendar,
  Clock, Eye, UserCheck, Stethoscope, ArrowRight, ShieldCheck, Heart
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { Patient, OPDVisit } from '../../../types';
import PatientRegistrationModal from './modals/PatientRegistrationModal';
import PrintRegistrationSlipModal from './modals/PrintRegistrationSlipModal';

export default function OPDPatientsView() {
  const {
    patients,
    visits,
    doctors,
    departments,
    setActiveTab,
    setSelectedPatientId,
    startConsultationForVisit,
  } = useOPD();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [slipModalVisit, setSlipModalVisit] = useState<OPDVisit | null>(null);

  const filteredPatients = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q);

    const matchGender = !genderFilter || p.gender === genderFilter;
    return matchSearch && matchGender;
  });

  const totalPatientsCount = patients.length;
  const activeTodayCount = visits.filter(v => v.visitDate === '2026-08-31').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Outpatient (OPD) Patients Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Master outpatient profiles, demographics, contact data, and clinical history
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            <UserPlus size={15} /> Register OPD Patient
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3" style={{ gap: 12 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Registered Patients</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)', marginTop: 4 }}>{totalPatientsCount}</div>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Today in OPD</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)', marginTop: 4 }}>{activeTodayCount}</div>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Follow-up Recall Patients</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ai)', marginTop: 4 }}>
            {visits.filter(v => v.visitType === 'follow_up').length}
          </div>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span className="card-title">Patient Roster ({filteredPatients.length})</span>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, UHID, phone..."
                style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 34, fontSize: 12 }}
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Age & Gender</th>
                  <th>Contact Phone</th>
                  <th>Blood Group</th>
                  <th>Registered Date</th>
                  <th>Latest OPD Visit</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const patientVisits = visits.filter(v => v.patientId === p.id);
                    const latestVisit = patientVisits[patientVisits.length - 1];

                    return (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>
                          {p.id}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.firstName} {p.lastName}</div>
                          {p.allergies && p.allergies.length > 0 && (
                            <span className="badge badge-danger" style={{ fontSize: 9, marginTop: 2 }}>
                              ⚠ {p.allergies.join(', ')}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: 12 }}>
                            {p.dateOfBirth ? `${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} yrs` : '45 yrs'} · <span style={{ textTransform: 'capitalize' }}>{p.gender}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <Phone size={11} style={{ color: 'var(--text-tertiary)' }} />
                            <span>{p.phone}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontWeight: 700, fontSize: 11 }}>
                            {p.bloodGroup || 'O+'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            2026-08-31
                          </div>
                        </td>
                        <td>
                          {latestVisit ? (
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{latestVisit.visitDate}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Dr. {latestVisit.doctorName}</div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No encounters</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {latestVisit && (latestVisit.status === 'waiting' || latestVisit.status === 'called') && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '2px 8px', fontSize: 11 }}
                                onClick={() => startConsultationForVisit(latestVisit)}
                              >
                                <Stethoscope size={11} /> Consult
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: 11 }}
                              onClick={() => {
                                setSelectedPatientId(p.id);
                                if (latestVisit) {
                                  startConsultationForVisit(latestVisit);
                                } else {
                                  setActiveTab('appointments');
                                }
                              }}
                            >
                              <Eye size={11} /> View Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <div className="empty-state-title">No Patients Found</div>
                        <div className="empty-state-desc">Try clearing the search query or register a new patient.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      {showRegisterModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newVisit) => {
            setShowRegisterModal(false);
            if (newVisit) setSlipModalVisit(newVisit);
          }}
        />
      )}

      {/* Slip Modal */}
      {slipModalVisit && (
        <PrintRegistrationSlipModal
          visit={slipModalVisit}
          onClose={() => setSlipModalVisit(null)}
        />
      )}
    </div>
  );
}
