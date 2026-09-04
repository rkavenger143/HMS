import React, { useState } from 'react';
import {
  Scan, Search, Filter, Play, CheckCircle2, Camera, Clock,
  Layers, ShieldCheck, UserCheck, AlertTriangle
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PACSViewerModal from './modals/PACSViewerModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyWorklist() {
  const {
    radiologyOrders,
    startExamination,
    completeExamination,
    setActiveTab,
    setSelectedOrderId,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [technicianName, setTechnicianName] = useState('Kunal Joshi (Senior Radiographer)');
  const [completeTarget, setCompleteTarget] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [seriesCount, setSeriesCount] = useState(3);
  const [imageCount, setImageCount] = useState(128);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const worklistOrders = radiologyOrders.filter(
    o => o.status === 'ready' || o.status === 'in_progress' || o.status === 'completed'
  );

  const filtered = worklistOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    return matchesSearch && matchesMod;
  });

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTarget) return;

    const studyUid = `1.2.840.113619.2.55.3.${Date.now()}`;
    completeExamination(completeTarget.id, studyUid, Number(seriesCount) || 2, Number(imageCount) || 48);
    setCompleteTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scan size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Technologist Examination Worklist</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Modality room execution desk, image acquisition tracking, and PACS study archiving
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Technologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 220, height: 32, fontSize: 12 }}
            value={technicianName}
            onChange={e => setTechnicianName(e.target.value)}
          />
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
              placeholder="Search Accession #, Patient Name..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
            <option value="ALL">All Modality Worklists</option>
            <option value="xray">Digital Radiography (X-Ray)</option>
            <option value="ct">128-Slice CT Scanner</option>
            <option value="mri">1.5T MRI Scanner</option>
            <option value="ultrasound">Ultrasound & Doppler</option>
            <option value="mammography">Mammography</option>
          </select>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession Number</th>
                  <th>Patient Name & Location</th>
                  <th>Examination & Modality</th>
                  <th>Priority</th>
                  <th>Acquisition Status</th>
                  <th>Technologist & Timestamps</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ord => {
                  const isReady = ord.status === 'ready';
                  const isInProgress = ord.status === 'in_progress';
                  const isCompleted = ord.status === 'completed' || ord.status === 'verified';

                  return (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{ord.accessionNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.orderNumber}</div>
                      </td>

                      <td>
                        <strong>{ord.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {ord.patientId} · {ord.gender.toUpperCase()}, {ord.age}y {ord.bedNumber ? `· Bed ${ord.bedNumber}` : ''}
                        </div>
                      </td>

                      <td>
                        <strong>{ord.examName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>
                          {ord.modalityType.toUpperCase()} · {ord.bodyPart} {ord.contrastRequired ? '(IV Contrast)' : ''}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${ord.priority === 'stat' ? 'badge-danger' : ord.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                          {ord.priority.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${isCompleted ? 'badge-success' : isInProgress ? 'badge-info' : 'badge-primary'}`}>
                          {ord.status.toUpperCase().replace('_', ' ')}
                        </span>
                        {isCompleted && ord.imageCount && (
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {ord.seriesCount} Series · {ord.imageCount} Images
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{ord.technicianName || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.technicianAt || ord.scheduledTime}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {isReady && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => startExamination(ord.id, technicianName)}
                            >
                              <Play size={11} /> Start Scan
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => {
                                setCompleteTarget(ord);
                                setSeriesCount(ord.modalityType === 'ct' || ord.modalityType === 'mri' ? 4 : 1);
                                setImageCount(ord.modalityType === 'ct' ? 160 : ord.modalityType === 'mri' ? 80 : 2);
                              }}
                            >
                              <CheckCircle2 size={11} /> Complete Scan
                            </button>
                          )}

                          {isCompleted && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: 11, height: 26 }}
                                onClick={() => setViewPACSOrder(ord)}
                              >
                                <Camera size={11} /> PACS
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 11, height: 26, color: 'var(--color-primary)' }}
                                onClick={() => {
                                  setSelectedOrderId(ord.id);
                                  setActiveTab('reporting');
                                }}
                              >
                                Enter Report →
                              </button>
                            </>
                          )}
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

      {/* Complete Examination Dialog Modal */}
      {completeTarget && (
        <div className="modal-backdrop" onClick={() => setCompleteTarget(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
              <div>
                <div className="modal-title">Complete Image Acquisition & Archive Study</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {completeTarget.patientName} · {completeTarget.examName} ({completeTarget.accessionNumber})
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setCompleteTarget(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmCompletion}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Acquired Series Count <span className="required">*</span></label>
                    <input type="number" className="form-input" value={seriesCount} onChange={e => setSeriesCount(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Acquired Slices / Images <span className="required">*</span></label>
                    <input type="number" className="form-input" value={imageCount} onChange={e => setImageCount(Number(e.target.value))} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Simulated DICOM Study Instance UID</label>
                    <input
                      type="text"
                      className="form-input"
                      readOnly
                      value={`1.2.840.113619.2.55.3.2831164.${Date.now()}`}
                      style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--bg-surface)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCompleteTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-success btn-sm">
                  <CheckCircle2 size={13} /> Complete Study & Route to Radiologist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACS Viewer Modal */}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
    </div>
  );
}
