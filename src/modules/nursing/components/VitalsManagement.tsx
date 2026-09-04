import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordVitalsModal from './modals/RecordVitalsModal';
import PrintVitalsChartModal from './modals/PrintVitalsChartModal';

export default function VitalsManagement() {
  const { admissions, patients, vitalsList } = useNursing();

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
              Real-time bedside vitals, AVPU consciousness, pain scores, and automated abnormal threshold flags
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
            <option value="ALL">All Wards</option>
            <option value="General Ward A">General Ward A</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Private Ward">Private Ward</option>
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
            <span className="card-title">Chronological Vitals Log</span>
            <span className="badge badge-primary">{filteredVitals.length} Records</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & Bed</th>
                  <th>Recorded Time</th>
                  <th>BP (mmHg)</th>
                  <th>Pulse (bpm)</th>
                  <th>Temp (°F)</th>
                  <th>SpO2 (%)</th>
                  <th>RR (/min)</th>
                  <th>Blood Sugar</th>
                  <th>Pain (0-10)</th>
                  <th>Consciousness</th>
                  <th>Abnormal Alerts</th>
                  <th>Nurse</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVitals.map(v => {
                  const adm = admissions.find(a => a.id === v.admissionId);
                  return (
                    <tr key={v.id} style={{ background: v.isAbnormal ? 'rgba(255,69,58,0.06)' : undefined }}>
                      <td>
                        <strong>{adm?.patientName || 'Inpatient'}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {adm?.bedNumber} ({adm?.ward})</div>
                      </td>
                      <td><strong>{v.recordedAt}</strong></td>
                      <td><strong style={{ color: v.systolic > 140 ? 'var(--color-danger)' : undefined }}>{v.bloodPressure}</strong></td>
                      <td><span style={{ color: v.pulse > 100 ? 'var(--color-danger)' : undefined }}>{v.pulse}</span></td>
                      <td><span style={{ color: v.temperature > 100.4 ? 'var(--color-danger)' : undefined }}>{v.temperature}°F</span></td>
                      <td><strong style={{ color: v.spo2 < 95 ? 'var(--color-danger)' : 'var(--color-success)' }}>{v.spo2}%</strong></td>
                      <td>{v.respiratoryRate}</td>
                      <td>{v.bloodSugar ? `${v.bloodSugar} mg/dL` : '—'}</td>
                      <td>{v.painScore ?? 0} / 10</td>
                      <td><span className="badge badge-neutral">{v.consciousness.toUpperCase()}</span></td>
                      <td>
                        {v.isAbnormal ? (
                          <span className="badge badge-danger" title={v.abnormalFlags.join(', ')}>
                            ⚠️ {v.abnormalFlags[0]}
                          </span>
                        ) : (
                          <span className="badge badge-success">NORMAL</span>
                        )}
                      </td>
                      <td>{v.recordedBy}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPrintAdm(adm)}
                        >
                          <Printer size={12} /> Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Modal */}
      {activeVitalsAdm && (
        <RecordVitalsModal admission={activeVitalsAdm} onClose={() => setActiveVitalsAdm(null)} />
      )}

      {/* Print Modal */}
      {printAdm && (
        <PrintVitalsChartModal
          vitals={vitalsList.filter(v => v.admissionId === printAdm.id)}
          patient={patients.find(p => p.id === printAdm.patientId) || null}
          admission={printAdm}
          onClose={() => setPrintAdm(null)}
        />
      )}
    </div>
  );
}
