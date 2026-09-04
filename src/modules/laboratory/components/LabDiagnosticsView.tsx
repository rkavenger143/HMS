import React, { useState } from 'react';
import {
  Scan, Search, Filter, Plus, Printer, CheckCircle2,
  Clock, AlertCircle, Eye, Activity, FileText, Upload
} from 'lucide-react';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';
import type { RadiologyStudy, RadiologyModality } from '../../../types';

const DEMO_DIAGNOSTICS: RadiologyStudy[] = [
  {
    id: 'RAD-2026-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    modality: 'xray',
    bodyPart: 'Chest (PA View)',
    scheduledDate: '2026-08-31',
    scheduledTime: '10:30',
    priority: 'routine',
    status: 'completed',
    price: 450,
    clinicalHistory: 'Recurrent cough and chest congestion. Rule out consolidation.',
    findingsText: 'Bilateral lung fields show clear parenchymal markings. Cardiac silhouette is within normal limits. Costophrenic angles are acute.',
    impressionText: 'Normal Chest Radiograph. No active pulmonary parenchymal lesion.',
    createdAt: '2026-08-31T08:30:00Z',
  },
  {
    id: 'RAD-2026-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Sunita Sharma',
    doctorId: 'doc-002',
    doctorName: 'Dr. Priya Sharma',
    modality: 'ultrasound',
    bodyPart: 'Whole Abdomen & Pelvis (USG)',
    scheduledDate: '2026-08-31',
    scheduledTime: '11:15',
    priority: 'urgent',
    status: 'in_progress',
    price: 1200,
    clinicalHistory: 'Right upper quadrant abdominal pain postprandial. Suspected cholelithiasis.',
    createdAt: '2026-08-31T09:00:00Z',
  },
  {
    id: 'RAD-2026-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Amit Patel',
    doctorId: 'doc-004',
    doctorName: 'Dr. Suresh Nair',
    modality: 'ecg',
    bodyPart: '12-Lead Electrocardiogram',
    scheduledDate: '2026-08-31',
    scheduledTime: '09:45',
    priority: 'stat',
    status: 'completed',
    price: 350,
    clinicalHistory: 'Epigastric discomfort and palpitations.',
    findingsText: 'Normal sinus rhythm at 78 bpm. Normal PR and QTc intervals. No acute ST segment elevation or T wave inversion.',
    impressionText: 'Normal 12-Lead ECG.',
    createdAt: '2026-08-31T09:15:00Z',
  },
  {
    id: 'RAD-2026-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Pooja Verma',
    doctorId: 'doc-003',
    doctorName: 'Dr. Ananya Iyer',
    modality: 'ct',
    bodyPart: 'CT Brain Plain (NCCT)',
    scheduledDate: '2026-08-31',
    scheduledTime: '14:00',
    priority: 'urgent',
    status: 'scheduled',
    price: 2800,
    clinicalHistory: 'Severe persistent hemicranial headache with photophobia.',
    createdAt: '2026-08-31T09:30:00Z',
  },
];

export default function LabDiagnosticsView() {
  const [diagnosticsList, setDiagnosticsList] = useState<RadiologyStudy[]>(DEMO_DIAGNOSTICS);
  const [search, setSearch] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudy, setSelectedStudy] = useState<RadiologyStudy | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter
  const filteredStudies = diagnosticsList.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.patientName.toLowerCase().includes(q) ||
      s.patientId.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.bodyPart.toLowerCase().includes(q);
    const matchModality = !modalityFilter || s.modality === modalityFilter;
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchModality && matchStatus;
  });

  const handleStatusChange = (id: string, newStatus: RadiologyStudy['status']) => {
    setDiagnosticsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-ai-muted)', color: 'var(--color-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scan size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Central Diagnostics & Radiology Studies</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Integrated management of X-Rays, Ultrasounds, CT, MRI, ECG and specialized imaging requests
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowOrderModal(true)}>
          <Plus size={14} /> New Diagnostic Request
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4" style={{ gap: 12 }}>
        {[
          { label: 'Total Diagnostic Orders', count: diagnosticsList.length, color: 'var(--color-primary)' },
          { label: 'Scheduled / Pending', count: diagnosticsList.filter(s => s.status === 'scheduled').length, color: 'var(--color-warning)' },
          { label: 'In Examination', count: diagnosticsList.filter(s => s.status === 'in_progress').length, color: 'var(--color-ai)' },
          { label: 'Reports Released', count: diagnosticsList.filter(s => s.status === 'completed').length, color: 'var(--color-success)' },
        ].map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Diagnostics Queue & Worklist</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient, study, ID..."
                style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 36, fontSize: 13 }}
                value={modalityFilter}
                onChange={e => setModalityFilter(e.target.value)}
              >
                <option value="">All Modalities</option>
                <option value="xray">X-Ray</option>
                <option value="ultrasound">Ultrasound (USG)</option>
                <option value="ecg">ECG</option>
                <option value="ct">CT Scan</option>
                <option value="mri">MRI</option>
              </select>
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 36, fontSize: 13 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Study ID</th>
                  <th>Patient Details</th>
                  <th>Modality</th>
                  <th>Body Region / Procedure</th>
                  <th>Consultant</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudies.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--color-ai)' }}>
                      {s.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.patientName}</div>
                      <div className="patient-id" style={{ fontSize: 10 }}>{s.patientId}</div>
                    </td>
                    <td>
                      <span className="badge badge-ai" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        {s.modality}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.bodyPart}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.scheduledDate} ({s.scheduledTime})</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{s.doctorName}</div>
                    </td>
                    <td>
                      <span className={`badge ${s.priority === 'stat' ? 'badge-danger' : s.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                        {s.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ height: 28, fontSize: 11, padding: '2px 8px', width: 120 }}
                        value={s.status}
                        onChange={e => handleStatusChange(s.id, e.target.value as any)}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="View Findings"
                          onClick={() => setSelectedStudy(s)}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Study Detail Modal */}
      {selectedStudy && (
        <div className="modal-backdrop" onClick={() => setSelectedStudy(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Scan size={18} style={{ color: 'var(--color-ai)' }} />
              <span className="modal-title">Diagnostic Study Details — {selectedStudy.id}</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setSelectedStudy(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div><strong>Patient:</strong> {selectedStudy.patientName} ({selectedStudy.patientId})</div>
                  <div><strong>Consultant:</strong> {selectedStudy.doctorName}</div>
                  <div><strong>Modality:</strong> <span className="badge badge-ai" style={{ textTransform: 'uppercase' }}>{selectedStudy.modality}</span></div>
                  <div><strong>Body Region:</strong> {selectedStudy.bodyPart}</div>
                  <div><strong>Date & Time:</strong> {selectedStudy.scheduledDate} {selectedStudy.scheduledTime}</div>
                  <div><strong>Diagnostic Fee:</strong> ₹{selectedStudy.price}</div>
                </div>

                {selectedStudy.clinicalHistory && (
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                    <strong>Clinical Indication:</strong> {selectedStudy.clinicalHistory}
                  </div>
                )}

                {selectedStudy.findingsText ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Radiologist Observations & Findings:</div>
                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, border: '1px solid var(--border-default)' }}>
                      {selectedStudy.findingsText}
                    </div>
                    {selectedStudy.impressionText && (
                      <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--color-primary)', fontSize: 13 }}>
                        Impression: {selectedStudy.impressionText}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info" style={{ fontSize: 12 }}>
                    This study is currently pending imaging acquisition or radiologist report signoff.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedStudy(null)}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                <Printer size={13} /> Print Study Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
