import React, { useState } from 'react';
import {
  Users, Search, Filter, Clock, Eye, ArrowRightLeft,
  Stethoscope, Activity, FileText, CheckCircle2, UserPlus, Download
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission } from '../../../types';
import TransferModal from './modals/TransferModal';
import RecordRoundModal from './modals/RecordRoundModal';
import RecordNursingVitalsModal from './modals/RecordNursingVitalsModal';

export default function InpatientList() {
  const {
    admissions,
    wards,
    doctors,
    setSelectedAdmissionId,
    setActiveTab,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'discharged'>('active');
  const [wardFilter, setWardFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');

  // Modals
  const [transferAdmission, setTransferAdmission] = useState<Admission | null>(null);
  const [roundAdmission, setRoundAdmission] = useState<Admission | null>(null);
  const [vitalsAdmission, setVitalsAdmission] = useState<Admission | null>(null);

  const filteredAdmissions = admissions.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.bedNumber.toLowerCase().includes(q) ||
      a.admittingDoctorName.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.status === 'active') ||
      (statusFilter === 'discharged' && a.status === 'discharged');

    const matchWard = !wardFilter || a.ward === wardFilter;
    const matchDoctor = !doctorFilter || a.admittingDoctorId === doctorFilter;

    return matchSearch && matchStatus && matchWard && matchDoctor;
  });

  const handleOpenEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('inpatient_profile');
  };

  const handleExportCSV = () => {
    const headers = ['Admission ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Admission Date', 'Status', 'Diagnosis'];
    const rows = filteredAdmissions.map(a => [
      a.id,
      a.patientId,
      `"${a.patientName}"`,
      `"${a.ward}"`,
      a.bedNumber,
      `"${a.admittingDoctorName}"`,
      a.admissionDate,
      a.status,
      `"${a.diagnosis.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ipd_inpatients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Census & Patient Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Master roster of active, discharged, and transferred hospital inpatients
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
            <UserPlus size={13} /> New Admission
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient Name, UHID, Admission ID, Bed, Doctor..."
              style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter Tabs */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="active">Active Inpatients Only</option>
              <option value="discharged">Discharged Patients</option>
              <option value="all">All Records</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={wardFilter}
              onChange={e => setWardFilter(e.target.value)}
            >
              <option value="">All Clinical Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
            >
              <option value="">All Attending Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inpatients Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Adm ID / UHID</th>
                  <th>Patient Name</th>
                  <th>Ward & Bed</th>
                  <th>Attending Consultant</th>
                  <th>Admission Date</th>
                  <th>Length of Stay</th>
                  <th>Primary Diagnosis</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map(adm => {
                    const days = Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000) + 1;
                    const isICU = adm.ward.toLowerCase().includes('icu');
                    const isDischarged = adm.status === 'discharged';

                    return (
                      <tr key={adm.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>{adm.id}</div>
                          <div className="patient-id" style={{ fontSize: 10, marginTop: 2 }}>{adm.patientId}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{adm.patientName}</div>
                          {adm.mlc && <span className="badge badge-danger" style={{ fontSize: 9, marginTop: 2 }}>MLC</span>}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800, fontSize: 12 }}>
                              {adm.bedNumber}
                            </span>
                            <span style={{ fontSize: 12 }}>{adm.ward}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{adm.admittingDoctorName}</div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{adm.admissionDate}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{adm.admissionTime}</div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13 }}>
                            <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                            Day {days} ({days}d)
                          </div>
                        </td>

                        <td style={{ maxWidth: 180 }}>
                          <div className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {adm.diagnosis.join(', ')}
                          </div>
                        </td>

                        <td>
                          {isDischarged ? (
                            <span className="badge badge-neutral">Discharged</span>
                          ) : isICU ? (
                            <span className="badge badge-danger">
                              <span className="badge-dot" /> ICU Care
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              <span className="badge-dot" /> Active
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => handleOpenEHR(adm.id)}
                            >
                              <Eye size={12} /> EHR
                            </button>

                            {!isDischarged && (
                              <>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 6px', fontSize: 11 }}
                                  title="Record Doctor Round"
                                  onClick={() => setRoundAdmission(adm)}
                                >
                                  <Stethoscope size={12} />
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 6px', fontSize: 11 }}
                                  title="Chart Vitals"
                                  onClick={() => setVitalsAdmission(adm)}
                                >
                                  <Activity size={12} />
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 6px', fontSize: 11 }}
                                  title="Transfer Bed"
                                  onClick={() => setTransferAdmission(adm)}
                                >
                                  <ArrowRightLeft size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state" style={{ padding: '36px 16px' }}>
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <div className="empty-state-title">No Inpatient Records Found</div>
                        <div className="empty-state-desc">Try changing the search filter or ward selection.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bed Transfer Modal */}
      {transferAdmission && (
        <TransferModal
          admission={transferAdmission}
          onClose={() => setTransferAdmission(null)}
        />
      )}

      {/* Doctor Round Modal */}
      {roundAdmission && (
        <RecordRoundModal
          admission={roundAdmission}
          onClose={() => setRoundAdmission(null)}
        />
      )}

      {/* Vitals Modal */}
      {vitalsAdmission && (
        <RecordNursingVitalsModal
          admission={vitalsAdmission}
          onClose={() => setVitalsAdmission(null)}
        />
      )}
    </div>
  );
}
