import React, { useState } from 'react';
import {
  Users, Search, Filter, Activity, ClipboardList, Pill,
  HeartPulse, User, ArrowRight, Download, CheckCircle2
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import RecordNoteModal from './modals/RecordNoteModal';

export default function NursingPatientList() {
  const {
    admissions,
    patients,
    doctors,
    wards,
    vitalsList,
    marRecords,
    setSelectedAdmissionId,
    setActiveTab,
  } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [vitalsModalAdm, setVitalsModalAdm] = useState<any | null>(null);
  const [notesModalAdm, setNotesModalAdm] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  // Multi-Criteria Filtering
  const filtered = activeAdmissions.filter(adm => {
    const patient = patients.find(p => p.id === adm.patientId);
    const q = search.toLowerCase();

    const matchesSearch =
      !search ||
      adm.patientName.toLowerCase().includes(q) ||
      adm.patientId.toLowerCase().includes(q) ||
      adm.id.toLowerCase().includes(q) ||
      adm.bedNumber.toLowerCase().includes(q) ||
      (patient?.phone && patient.phone.includes(q));

    const matchesWard = selectedWard === 'ALL' || adm.ward === selectedWard;
    const matchesDoctor = selectedDoctor === 'ALL' || adm.admittingDoctorId === selectedDoctor;
    const isCritical = adm.ward.toLowerCase().includes('icu');
    const priority = isCritical ? 'high' : 'normal';
    const matchesPriority = selectedPriority === 'ALL' || priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || adm.status === selectedStatus;

    return matchesSearch && matchesWard && matchesDoctor && matchesPriority && matchesStatus;
  });

  const handleOpenEHR = (admId: string, subTab?: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  const handleExportCSV = () => {
    const headers = ['Adm ID', 'UHID', 'Patient Name', 'Age/Gender', 'Ward', 'Bed', 'Doctor', 'Admission Date', 'Status'];
    const rows = filtered.map(a => [
      a.id,
      a.patientId,
      `"${a.patientName}"`,
      '45/M',
      `"${a.ward}"`,
      a.bedNumber,
      `"${a.admittingDoctorName}"`,
      a.admissionDate,
      a.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `nursing_patient_list_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search & Filters Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          {/* Universal Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient Name, UHID, Adm ID, Mobile, or Bed #..."
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

          {/* Priority Filter */}
          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="high">High / Urgent</option>
          </select>

          {/* Export Button */}
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Patients Roster Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Inpatient Nursing Care Roster</span>
            <span className="badge badge-primary">{filtered.length} Inpatients</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & UHID</th>
                  <th>Age / Sex</th>
                  <th>Ward & Bed</th>
                  <th>Attending Doctor</th>
                  <th>Admission Date</th>
                  <th>Clinical Diagnosis</th>
                  <th>Patient Status</th>
                  <th>Assigned Nurse</th>
                  <th style={{ textAlign: 'right' }}>Nursing Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(adm => {
                  const patient = patients.find(p => p.id === adm.patientId);
                  const isCritical = adm.ward.toLowerCase().includes('icu');
                  const days = Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000) + 1;

                  return (
                    <tr key={adm.id}>
                      {/* Name & UHID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">
                            {adm.patientName[0]}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: 800, color: 'var(--color-primary)', cursor: 'pointer' }}
                              onClick={() => handleOpenEHR(adm.id)}
                            >
                              {adm.patientName}
                            </div>
                            <div className="patient-id" style={{ fontSize: 10 }}>{adm.patientId} · Adm: {adm.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Sex */}
                      <td>
                        <span style={{ fontSize: 12 }}>
                          {patient ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y / ${patient.gender[0].toUpperCase()}` : '48Y / M'}
                        </span>
                      </td>

                      {/* Ward & Bed */}
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          <span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Day {days} of Stay</div>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{adm.admittingDoctorName}</div>
                      </td>

                      {/* Admission Date */}
                      <td>
                        <div style={{ fontSize: 12 }}>{adm.admissionDate}</div>
                      </td>

                      {/* Diagnosis */}
                      <td>
                        <div style={{ fontSize: 12, maxWidth: 180 }}>{adm.diagnosis.join(', ') || 'Under evaluation'}</div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${isCritical ? 'badge-danger' : 'badge-success'}`}>
                          {isCritical ? 'CRITICAL' : 'STABLE'}
                        </span>
                      </td>

                      {/* Assigned Nurse */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Kavitha Nair</span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Chart Vitals"
                            onClick={() => setVitalsModalAdm(adm)}
                          >
                            <Activity size={12} /> Vitals
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Add Clinical Note"
                            onClick={() => setNotesModalAdm(adm)}
                          >
                            <ClipboardList size={12} /> Note
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenEHR(adm.id)}
                          >
                            View EHR
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
    </div>
  );
}
