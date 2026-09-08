import React, { useState } from 'react';
import {
  Users, Search, Filter, Activity, ClipboardList, Pill,
  HeartPulse, User, ArrowRight, Download, CheckCircle2, Siren
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import RecordNoteModal from './modals/RecordNoteModal';
import EmergencyReportingModal from './modals/EmergencyReportingModal';

export default function NursingPatientList() {
  const {
    admissions,
    patients,
    doctors,
    wards,
    assignments,
    nurses,
    setSelectedAdmissionId,
    setActiveTab,
  } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');

  const [vitalsModalAdm, setVitalsModalAdm] = useState<any | null>(null);
  const [notesModalAdm, setNotesModalAdm] = useState<any | null>(null);
  const [emergencyModalAdm, setEmergencyModalAdm] = useState<string | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  // Filtered assigned patients
  const filtered = activeAdmissions.filter(adm => {
    const q = search.toLowerCase();

    const matchesSearch =
      !search ||
      adm.patientName.toLowerCase().includes(q) ||
      adm.patientId.toLowerCase().includes(q) ||
      adm.id.toLowerCase().includes(q) ||
      adm.bedNumber.toLowerCase().includes(q) ||
      (adm.roomNumber && adm.roomNumber.toLowerCase().includes(q)) ||
      adm.admittingDoctorName.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'ALL' || adm.ward === selectedWard;
    const matchesDoctor = selectedDoctor === 'ALL' || adm.admittingDoctorId === selectedDoctor;
    const matchesCondition = selectedCondition === 'ALL' || (adm.condition || 'stable') === selectedCondition;

    return matchesSearch && matchesWard && matchesDoctor && matchesCondition;
  });

  const handleExportCSV = () => {
    const headers = ['UHID', 'Patient Name', 'Ward', 'Room', 'Bed Number', 'Doctor', 'Patient Condition', 'Admission Date'];
    const rows = filtered.map(a => [
      a.patientId,
      `"${a.patientName}"`,
      `"${a.ward}"`,
      a.roomNumber || '—',
      a.bedNumber,
      `"${a.admittingDoctorName}"`,
      a.condition || 'stable',
      a.admissionDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `assigned_patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Assigned Inpatient Care Roster</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bedside patient list: Patient, Ward, Room, Bed, Attending Doctor, Condition, and direct care actions
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          {/* Universal Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient Name, UHID, Room, Bed #, Doctor..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Ward Filter */}
          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Clinical Wards</option>
            {wards.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
          </select>

          {/* Doctor Filter */}
          <select className="form-select" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
            <option value="ALL">All Attending Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Condition Filter */}
          <select className="form-select" value={selectedCondition} onChange={e => setSelectedCondition(e.target.value)}>
            <option value="ALL">All Conditions</option>
            <option value="stable">Stable</option>
            <option value="guarded">Guarded</option>
            <option value="serious">Serious</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Assigned Inpatients Roster</span>
            <span className="badge badge-primary">{filtered.length} Patients</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & UHID</th>
                  <th>Ward & Bed</th>
                  <th>Room #</th>
                  <th>Attending Doctor</th>
                  <th>Patient Condition</th>
                  <th>Assigned Nurse</th>
                  <th style={{ textAlign: 'right' }}>Bedside Nursing Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(adm => {
                  const isICU = adm.ward.toLowerCase().includes('icu');
                  const assignedAsg = assignments.find(a => a.assignedPatientIds.includes(adm.patientId));
                  const nurseName = assignedAsg?.nurseName || (isICU ? 'Rekha Sharma' : 'Kavitha Nair');

                  return (
                    <tr key={adm.id}>
                      {/* Name & UHID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">
                            {adm.patientName[0]}
                          </div>
                          <div>
                            <strong style={{ fontSize: 14 }}>{adm.patientName}</strong>
                            <div className="patient-id" style={{ fontSize: 10, marginTop: 2 }}>{adm.patientId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Ward & Bed */}
                      <td>
                        <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800 }}>
                          {adm.bedNumber}
                        </span>
                        <span style={{ fontSize: 12, marginLeft: 6 }}>{adm.ward}</span>
                      </td>

                      {/* Room # */}
                      <td>
                        <strong style={{ fontSize: 13 }}>{adm.roomNumber || '—'}</strong>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{adm.admittingDoctorName}</div>
                      </td>

                      {/* Patient Condition */}
                      <td>
                        <span
                          className={`badge ${
                            adm.condition === 'critical'
                              ? 'badge-danger'
                              : adm.condition === 'serious'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                          style={{ textTransform: 'capitalize', fontSize: 11, fontWeight: 700 }}
                        >
                          <span className="badge-dot" /> {adm.condition || 'Stable'}
                        </span>
                      </td>

                      {/* Assigned Nurse */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{nurseName}</span>
                      </td>

                      {/* Bedside Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            title="Chart Vitals"
                            onClick={() => setVitalsModalAdm(adm)}
                          >
                            <Activity size={12} /> Vitals
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            title="Add Clinical Note"
                            onClick={() => setNotesModalAdm(adm)}
                          >
                            <ClipboardList size={12} /> Note
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            title="Administer Medication"
                            onClick={() => setActiveTab('medication')}
                          >
                            <Pill size={12} /> MAR
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 6px', color: 'var(--color-danger)' }}
                            title="Report Emergency"
                            onClick={() => setEmergencyModalAdm(adm.id)}
                          >
                            <Siren size={13} />
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

      {/* Vitals Recording Modal */}
      {vitalsModalAdm && (
        <RecordVitalsModal admission={vitalsModalAdm} onClose={() => setVitalsModalAdm(null)} />
      )}

      {/* Nursing Note Modal */}
      {notesModalAdm && (
        <RecordNoteModal admission={notesModalAdm} onClose={() => setNotesModalAdm(null)} />
      )}

      {/* Emergency Modal */}
      {emergencyModalAdm && (
        <EmergencyReportingModal
          defaultAdmissionId={emergencyModalAdm}
          onClose={() => setEmergencyModalAdm(null)}
        />
      )}
    </div>
  );
}
