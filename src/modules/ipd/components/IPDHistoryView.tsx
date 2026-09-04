import React, { useState } from 'react';
import {
  History, Search, Filter, Calendar, Users, Eye, Printer,
  FileText, CheckCircle2, BedDouble
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';

export default function IPDHistoryView() {
  const { admissions, patients, setSelectedAdmissionId, setActiveTab } = useIPD();
  const [search, setSearch] = useState('');

  // Discharged or historic admissions
  const historyList = admissions.filter(a => a.status === 'discharged' || a.dischargeDate);

  const filteredHistory = historyList.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.patientId.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} style={{ color: 'var(--color-primary)' }} />
            Inpatient Archive & Discharge History Census
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Historical inpatient admissions records, discharge summaries, length of stay, and completed encounter files
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search patient, UHID, or Admission ID..."
            style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Adm ID / UHID</th>
                <th>Patient Details</th>
                <th>Ward & Bed</th>
                <th>Admitted Date</th>
                <th>Discharged Date</th>
                <th>Length of Stay</th>
                <th>Discharging Doctor</th>
                <th>Final Diagnosis</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map(adm => {
                  const pat = patients.find(p => p.id === adm.patientId);
                  const admDate = new Date(adm.admissionDate);
                  const disDate = adm.dischargeDate ? new Date(adm.dischargeDate) : new Date();
                  const los = Math.max(1, Math.round((disDate.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <tr key={adm.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {adm.id}
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{adm.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{adm.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{pat?.gender || 'M'} · Blood: {pat?.bloodGroup || 'O+'}</div>
                      </td>
                      <td>
                        <div>{adm.ward}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {adm.bedNumber}</div>
                      </td>
                      <td>{adm.admissionDate}</td>
                      <td>
                        <strong>{adm.dischargeDate || '2026-08-30'}</strong>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{los} days</span>
                      </td>
                      <td>{adm.admittingDoctorName}</td>
                      <td>{adm.diagnosis ? adm.diagnosis.join(', ') : 'Recovered'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedAdmissionId(adm.id);
                            setActiveTab('inpatient_profile');
                          }}
                        >
                          <Eye size={12} /> View EHR
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 28, color: 'var(--text-tertiary)' }}>
                    No discharge records found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
