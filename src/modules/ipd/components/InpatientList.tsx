import React, { useState } from 'react';
import {
  Users, Search, Filter, Clock, Eye, ArrowRightLeft,
  Stethoscope, Activity, FileText, CheckCircle2, UserPlus, Download,
  Calendar, ShieldAlert, AlertTriangle, Sparkles
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, PatientCondition, AdmissionPriority, DischargeReadiness } from '../../../types';
import TransferModal from './modals/TransferModal';
import RecordRoundModal from './modals/RecordRoundModal';
import RecordNursingVitalsModal from './modals/RecordNursingVitalsModal';

const CONDITION_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  stable: { label: 'Stable', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  guarded: { label: 'Guarded', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  serious: { label: 'Serious', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  critical: { label: 'Critical', color: 'var(--color-danger)', bg: 'rgba(255,69,58,0.25)' },
};

const PRIORITY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: 'Normal', color: 'var(--text-secondary)', bg: 'var(--bg-surface)' },
  urgent: { label: 'Urgent', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  emergency: { label: 'Emergency', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
};

export default function InpatientList() {
  const {
    admissions,
    wards,
    doctors,
    setSelectedAdmissionId,
    setActiveTab,
    updateAdmissionReadiness,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'discharged'>('active');
  const [wardFilter, setWardFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

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
    const matchCondition = !conditionFilter || a.condition === conditionFilter;
    const matchPriority = !priorityFilter || a.priority === priorityFilter;

    return matchSearch && matchStatus && matchWard && matchDoctor && matchCondition && matchPriority;
  });

  const handleOpenEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('inpatient_profile');
  };

  const handleExportCSV = () => {
    const headers = ['Admission ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Admission Date', 'Expected Discharge', 'Condition', 'Priority', 'Readiness', 'Status', 'Diagnosis'];
    const rows = filteredAdmissions.map(a => [
      a.id,
      a.patientId,
      `"${a.patientName}"`,
      `"${a.ward}"`,
      a.bedNumber,
      `"${a.admittingDoctorName}"`,
      a.admissionDate,
      a.expectedDischargeDate || 'N/A',
      a.condition || 'stable',
      a.priority || 'normal',
      a.dischargeReadiness || 'under_treatment',
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Census & Clinical Status Roster</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Master census tracking patient condition, attending doctor, length of stay, and discharge readiness
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export Census CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
            <UserPlus size={13} /> Admit Inpatient
          </button>
        </div>
      </div>

      {/* Multi-Filter Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
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

          {/* Status Filter */}
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

          {/* Condition Filter */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={conditionFilter}
              onChange={e => setConditionFilter(e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="stable">Stable</option>
              <option value="guarded">Guarded</option>
              <option value="serious">Serious</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
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
                  <th>Condition & Priority</th>
                  <th>Attending Doctor</th>
                  <th>Length of Stay / Exp. Disch</th>
                  <th>Discharge Readiness</th>
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
                    const cond = CONDITION_STYLES[adm.condition || 'stable'] || CONDITION_STYLES.stable;
                    const prio = PRIORITY_STYLES[adm.priority || 'normal'] || PRIORITY_STYLES.normal;

                    return (
                      <tr key={adm.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>{adm.id}</div>
                          <div className="patient-id" style={{ fontSize: 10, marginTop: 2 }}>{adm.patientId}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{adm.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {adm.diagnosis?.[0] || 'Medical Inpatient'}
                          </div>
                          {adm.mlc && <span className="badge badge-danger" style={{ fontSize: 9, marginTop: 2 }}>MLC</span>}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800, fontSize: 12 }}>
                              {adm.bedNumber}
                            </span>
                            <span style={{ fontSize: 12 }}>{adm.ward}</span>
                          </div>
                          {adm.roomNumber && (
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>Room: {adm.roomNumber}</div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="badge" style={{ background: cond.bg, color: cond.color, fontSize: 10, fontWeight: 700 }}>
                              <span className="badge-dot" /> {cond.label}
                            </span>
                            {adm.priority && adm.priority !== 'normal' && (
                              <span className="badge" style={{ background: prio.bg, color: prio.color, fontSize: 9 }}>
                                {prio.label}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{adm.admittingDoctorName}</div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 12 }}>
                            <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                            Day {days} ({days}d)
                          </div>
                          {adm.expectedDischargeDate && (
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Calendar size={10} /> Exp: {adm.expectedDischargeDate}
                            </div>
                          )}
                        </td>

                        <td>
                          {!isDischarged ? (
                            <select
                              className="form-select"
                              style={{
                                height: 28,
                                fontSize: 11,
                                padding: '2px 6px',
                                background:
                                  adm.dischargeReadiness === 'ready_for_discharge'
                                    ? 'var(--color-success-muted)'
                                    : adm.dischargeReadiness === 'pending_clearance'
                                    ? 'var(--color-warning-muted)'
                                    : 'var(--bg-surface)',
                                color:
                                  adm.dischargeReadiness === 'ready_for_discharge'
                                    ? 'var(--color-success)'
                                    : adm.dischargeReadiness === 'pending_clearance'
                                    ? 'var(--color-warning)'
                                    : 'var(--text-secondary)',
                                fontWeight: 600,
                              }}
                              value={adm.dischargeReadiness || 'under_treatment'}
                              onChange={e => updateAdmissionReadiness(adm.id, e.target.value as DischargeReadiness)}
                            >
                              <option value="under_treatment">Under Treatment</option>
                              <option value="pending_clearance">Pending Clearance</option>
                              <option value="ready_for_discharge">✓ Ready for Discharge</option>
                            </select>
                          ) : (
                            <span className="badge badge-neutral">Discharged</span>
                          )}
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
