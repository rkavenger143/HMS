import React, { useState } from 'react';
import {
  History, Search, Filter, Calendar, Users, Eye, Printer,
  FileText, CheckCircle2, BedDouble, ArrowRightLeft, Clock,
  Sparkles, Wrench, Shield
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';

const ACTION_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  admit: { label: 'Admitted', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  transfer_in: { label: 'Transferred In', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  transfer_out: { label: 'Transferred Out', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  discharge: { label: 'Discharged / Released', color: 'var(--color-info)', bg: 'var(--color-info-muted)' },
  reserve: { label: 'Reserved', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  release: { label: 'Released', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  maintenance: { label: 'Maintenance', color: 'var(--text-muted)', bg: 'var(--bg-surface)' },
};

export default function IPDHistoryView() {
  const { admissions, patients, bedAllocations, setSelectedAdmissionId, setActiveTab } = useIPD();

  const [activeTab, setActiveStayTab] = useState<'stays' | 'allocations'>('stays');
  const [search, setSearch] = useState('');

  // Discharged or historic admissions
  const historyList = admissions.filter(a => a.status === 'discharged' || a.dischargeDate);

  const filteredHistory = historyList.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.patientId.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.ward.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAllocations = bedAllocations.filter(b =>
    b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.ward.toLowerCase().includes(search.toLowerCase()) ||
    (b.patientName && b.patientName.toLowerCase().includes(search.toLowerCase())) ||
    (b.patientId && b.patientId.toLowerCase().includes(search.toLowerCase())) ||
    (b.performedBy && b.performedBy.toLowerCase().includes(search.toLowerCase())) ||
    (b.notes && b.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} style={{ color: 'var(--color-primary)' }} />
            Inpatient Stay History & Bed Allocation Audit Log
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Historical inpatient discharge census, length of stay analysis, and complete chronological bed movement logs
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'stays' ? 'active' : ''}`}
            onClick={() => setActiveStayTab('stays')}
          >
            <Users size={13} /> Discharged Inpatient Stays ({historyList.length})
          </button>
          <button
            className={`tab ${activeTab === 'allocations' ? 'active' : ''}`}
            onClick={() => setActiveStayTab('allocations')}
          >
            <BedDouble size={13} /> Bed Allocation & Movement History ({bedAllocations.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={activeTab === 'stays' ? "Search patient, UHID, bed, or admission ID..." : "Search bed, ward, patient, doctor, action..."}
            style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TAB 1: Discharged Stays History */}
      {activeTab === 'stays' && (
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
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {adm.bedNumber} {adm.roomNumber && `· Rm ${adm.roomNumber}`}</div>
                        </td>
                        <td>{adm.admissionDate}</td>
                        <td>
                          <strong style={{ color: 'var(--color-success)' }}>{adm.dischargeDate || '2026-08-30'}</strong>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{los} days</span>
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
                    <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                      No discharge records found matching the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Bed Allocation & Movement History */}
      {activeTab === 'allocations' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Allocation ID</th>
                  <th>Action Event</th>
                  <th>Bed & Ward</th>
                  <th>Patient Name & UHID</th>
                  <th>Timestamp</th>
                  <th>Handled By</th>
                  <th>Clinical / Operational Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.length > 0 ? (
                  filteredAllocations.map(alloc => {
                    const ab = ACTION_BADGES[alloc.action] || { label: alloc.action, color: 'var(--text-secondary)', bg: 'var(--bg-surface)' };

                    return (
                      <tr key={alloc.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>
                          {alloc.id}
                        </td>
                        <td>
                          <span className="badge" style={{ background: ab.bg, color: ab.color, fontSize: 11, fontWeight: 700 }}>
                            {ab.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BedDouble size={14} style={{ color: 'var(--color-primary)' }} />
                            <strong>{alloc.bedNumber}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{alloc.ward} {alloc.roomNumber && `· Room ${alloc.roomNumber}`}</div>
                        </td>
                        <td>
                          {alloc.patientName ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{alloc.patientName}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{alloc.patientId}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{alloc.timestamp.slice(0, 10)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{alloc.timestamp.slice(11, 16) || '10:00 AM'}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12 }}>{alloc.performedBy || 'System Admin'}</div>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{alloc.notes || 'Routine allocation'}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                      No bed allocation history logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
