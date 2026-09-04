import React, { useState } from 'react';
import {
  Scan, Plus, Trash2, Printer, CheckCircle2, History,
  Clock, AlertCircle, Eye, Activity
} from 'lucide-react';
import { useOPD, COMMON_OPD_RADIOLOGY } from '../context/OPDContext';
import type { RadiologyStudy, RadiologyModality } from '../../../types';
import PrintLabOrderModal from './modals/PrintLabOrderModal';

export default function DiagnosticOrdersManagement() {
  const {
    visits,
    patients,
    radiologyOrders,
    selectedVisit,
    createDiagnosticOrder,
    setActiveTab,
  } = useOPD();

  const activeVisit = selectedVisit || visits.find(v => v.status === 'in_consultation') || visits[0];
  const activePatient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) : null;

  const [selectedModality, setSelectedModality] = useState<RadiologyModality>('xray');
  const [bodyPart, setBodyPart] = useState('Chest (PA View)');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [scheduledDate, setScheduledDate] = useState('2026-08-31');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [price, setPrice] = useState(450);
  const [clinicalHistory, setClinicalHistory] = useState('Chest tightness and cough. Rule out cardiomegaly and focal consolidation.');

  // Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [submittedStudy, setSubmittedStudy] = useState<RadiologyStudy | null>(null);

  const handleSelectPreset = (p: typeof COMMON_OPD_RADIOLOGY[0]) => {
    setSelectedModality(p.modality as RadiologyModality);
    setBodyPart(p.name);
    setPrice(p.price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;

    const study = createDiagnosticOrder({
      patientId: activeVisit.patientId,
      patientName: activeVisit.patientName,
      doctorId: activeVisit.doctorId,
      doctorName: activeVisit.doctorName,
      modality: selectedModality,
      bodyPart,
      scheduledDate,
      scheduledTime,
      priority,
      price,
      clinicalHistory,
    });

    setSubmittedStudy(study);
    setShowPrintModal(true);
  };

  const patientPastRadiology = radiologyOrders.filter(r => r.patientId === activeVisit?.patientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-ai-muted)', color: 'var(--color-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scan size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology & Imaging Diagnostics Requisition</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Patient: <strong>{activeVisit?.patientName}</strong> ({activeVisit?.patientId}) · Consultant: <strong>{activeVisit?.doctorName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintModal(true)}>
            <Printer size={13} /> Print Requisition Form
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Ordering Form & Catalog Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Presets Card */}
          <div className="card">
            <div className="card-header">
              <Plus size={16} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title">Standard Hospital Imaging Modalities</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {COMMON_OPD_RADIOLOGY.map(item => {
                  const isSelected = bodyPart === item.name;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPreset(item)}
                      style={{
                        padding: '12px 14px',
                        background: isSelected ? 'var(--color-ai-muted)' : 'var(--bg-surface)',
                        border: isSelected ? '1px solid var(--color-ai)' : '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-ai" style={{ fontSize: 10, textTransform: 'uppercase' }}>{item.modality}</span>
                        <strong style={{ fontSize: 13, color: 'var(--color-success)' }}>₹{item.price}</strong>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginTop: 6 }}>
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Form Card */}
          <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
              <Scan size={16} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title">Imaging Study Specifics</span>
            </div>
            <div className="card-body">
              <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Imaging Modality <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={selectedModality}
                    onChange={e => setSelectedModality(e.target.value as RadiologyModality)}
                  >
                    <option value="xray">X-Ray (Plain Radiography)</option>
                    <option value="ultrasound">Ultrasound (USG / Doppler)</option>
                    <option value="ecg">12-Lead ECG</option>
                    <option value="ct">CT Scan (Computed Tomography)</option>
                    <option value="mri">MRI (Magnetic Resonance Imaging)</option>
                    <option value="mammography">Mammography</option>
                    <option value="dexa">DEXA Bone Mineral Densitometry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Body Region / Study Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chest (PA View), Knee (AP/Lat), Brain Plain"
                    value={bodyPart}
                    onChange={e => setBodyPart(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT (Immediate Emergency)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value, 10) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Time Slot</label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Clinical History & Specific Findings to Rule Out</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Relevant clinical background, suspected pathology, implant/pacemaker safety..."
                    value={clinicalHistory}
                    onChange={e => setClinicalHistory(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: 42 }}>
                  <CheckCircle2 size={15} /> Submit Radiology Order
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Past Imaging History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Summary Preview Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 14 }}>Study Summary & Estimation</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Selected Study:</span>
                  <strong>{bodyPart}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Modality:</span>
                  <span className="badge badge-ai" style={{ textTransform: 'uppercase' }}>{selectedModality}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                  <span className={`badge ${priority === 'stat' ? 'badge-danger' : priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {priority.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-muted)', paddingTop: 8, fontSize: 15, fontWeight: 800 }}>
                  <span>Diagnostic Fee:</span>
                  <span style={{ color: 'var(--color-success)' }}>₹{price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Past Radiology Studies for Patient */}
          <div className="card">
            <div className="card-header">
              <History size={16} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Patient Previous Imaging History ({patientPastRadiology.length})</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px', maxHeight: 380, overflowY: 'auto' }}>
              {patientPastRadiology.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {patientPastRadiology.map(r => (
                    <div
                      key={r.id}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-ai)' }}>{r.id}</span>
                        <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{r.bodyPart}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {r.scheduledDate} · Modality: <strong style={{ textTransform: 'uppercase' }}>{r.modality}</strong> · ₹{r.price}
                      </div>
                      {r.impressionText && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4, padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                          "Impression: {r.impressionText}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
                  No prior imaging scans on record for this patient.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Diagnostic Order Modal */}
      {showPrintModal && (
        <PrintLabOrderModal
          radiologyOrder={submittedStudy || {
            id: 'rad-temp',
            patientId: activeVisit?.patientId,
            patientName: activeVisit?.patientName,
            doctorId: activeVisit?.doctorId,
            doctorName: activeVisit?.doctorName,
            modality: selectedModality,
            bodyPart,
            scheduledDate,
            priority,
            price,
            clinicalHistory,
          }}
          patient={activePatient}
          visit={activeVisit}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
