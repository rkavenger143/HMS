import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import PrintVitalsChartModal from './modals/PrintVitalsChartModal';

export default function VitalsManagement() {
  const { admissions, patients, vitalsList, wards } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'abnormal'>('all');

  const [activeVitalsAdm, setActiveVitalsAdm] = useState<any | null>(null);
  const [printAdm, setPrintAdm] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredVitals = vitalsList.filter(v => {
    const adm = admissions.find(a => a.id === v.admissionId);
    const q = search.toLowerCase();

    const matchesSearch =
      !search ||
      adm?.patientName.toLowerCase().includes(q) ||
      v.patientId.toLowerCase().includes(q) ||
      v.recordedBy.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'ALL' || adm?.ward === selectedWard;
    const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'abnormal' && v.isAbnormal);

    return matchesSearch && matchesWard && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Vital Signs Monitoring & Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Rapid vital recording: Temperature, BP, Pulse, SpO2, Respiratory Rate & abnormal threshold flags
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveVitalsAdm(activeAdmissions[0])}>
            <Plus size={13} /> Record New Vitals
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
              placeholder="Search Patient, UHID, or Nurse..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Clinical Wards</option>
            {wards.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)}>
            <option value="all">All Readings ({vitalsList.length})</option>
            <option value="abnormal">⚠️ Abnormal Readings Only ({vitalsList.filter(v => v.isAbnormal).length})</option>
          </select>
        </div>
      </div>

      {/* Vitals History Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Chronological Inpatient Vitals Log</span>
            <span className="badge badge-primary">{filteredVitals.length} Records</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Ward</th>
                  <th>Recorded Time</th>
                  <th>BP (mmHg)</th>
                  <th>Heart Rate (bpm)</th>
                  <th>SpO2 (%)</th>
                  <th>Temperature (°F)</th>
                  <th>Resp. Rate</th>
                  <th>Abnormal Alerts</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {filteredVitals.length > 0 ? (
                  filteredVitals.map(v => {
                    const adm = admissions.find(a => a.id === v.admissionId);

                    return (
                      <tr key={v.id}>
                        <td>
                          <strong>{adm?.patientName || 'Inpatient'}</strong>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                            Bed {adm?.bedNumber} · {adm?.ward}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>{v.recordedAt.slice(0, 10)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{v.recordedAt.slice(11) || '08:00'}</div>
                        </td>

                        <td>
                          <strong style={{ fontSize: 13, color: v.systolic > 140 || v.diastolic > 90 ? 'var(--color-danger)' : undefined }}>
                            {v.bloodPressure}
                          </strong>
                        </td>

                        <td>
                          <strong style={{ fontSize: 13, color: v.pulse > 100 || v.pulse < 60 ? 'var(--color-danger)' : undefined }}>
                            {v.pulse} bpm
                          </strong>
                        </td>

                        <td>
                          <span className={`badge ${v.spo2 < 95 ? 'badge-danger' : 'badge-success'}`} style={{ fontWeight: 800 }}>
                            {v.spo2}%
                          </span>
                        </td>

                        <td>
                          <strong style={{ fontSize: 13, color: v.temperature > 100.4 ? 'var(--color-danger)' : undefined }}>
                            {v.temperature}°F
                          </strong>
                        </td>

                        <td>
                          <span>{v.respiratoryRate}/min</span>
                        </td>

                        <td>
                          {v.isAbnormal ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {v.abnormalFlags.map((flag, idx) => (
                                <span key={idx} className="badge badge-danger" style={{ fontSize: 9 }}>
                                  {flag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: 10 }}>Normal</span>
                          )}
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>{v.recordedBy}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state" style={{ padding: '30px' }}>
                        <div className="empty-state-icon"><Activity size={28} /></div>
                        <div className="empty-state-title">No Vitals Readings Found</div>
                        <div className="empty-state-desc">Click "Record New Vitals" to log bedside readings.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      {activeVitalsAdm && (
        <RecordVitalsModal
          admission={activeVitalsAdm}
          onClose={() => setActiveVitalsAdm(null)}
        />
      )}

      {/* Print Chart Modal */}
      {printAdm && (
        <PrintVitalsChartModal
          admission={printAdm}
          vitals={vitalsList.filter(v => v.admissionId === printAdm.id)}
          patient={patients.find(p => p.id === printAdm.patientId) || null}
          onClose={() => setPrintAdm(null)}
        />
      )}
    </div>
  );
}
