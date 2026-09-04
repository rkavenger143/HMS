import React, { useState } from 'react';
import { Scan, Plus, X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRadiology } from '../../context/RadiologyContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../../data/seedData';
import type { RadiologyModalityType, RadiologyPriority } from '../../../../types';

interface CreateRadiologyOrderModalProps {
  onClose: () => void;
}

export default function CreateRadiologyOrderModal({ onClose }: CreateRadiologyOrderModalProps) {
  const { examinations, packages, createRadiologyOrder, setActiveTab } = useRadiology();

  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [encounterType, setEncounterType] = useState<'opd' | 'ipd' | 'emergency'>('ipd');
  const [ward, setWard] = useState('General Ward A');
  const [bedNumber, setBedNumber] = useState('GW-03');
  const [doctorId, setDoctorId] = useState(DEMO_DOCTORS[0]?.id || 'doc-1');
  const [priority, setPriority] = useState<RadiologyPriority>('routine');
  const [selectedExamId, setSelectedExamId] = useState(examinations[0]?.id || 'exam-cxr');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [contrastRequired, setContrastRequired] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState('11:00');

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];
  const selectedDoctor = DEMO_DOCTORS.find(d => d.id === doctorId) || DEMO_DOCTORS[0];
  const selectedExam = examinations.find(e => e.id === selectedExamId) || examinations[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRadiologyOrder({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      age: (selectedPatient as any).age || 38,
      gender: selectedPatient.gender || 'male',
      encounterType,
      bedNumber: encounterType === 'ipd' ? bedNumber : undefined,
      ward: encounterType === 'ipd' ? ward : undefined,
      referringDoctorId: selectedDoctor.id,
      referringDoctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      orderDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduledDate,
      scheduledTime,
      priority,
      modalityType: selectedExam.modalityType,
      examId: selectedExam.id,
      examName: selectedExam.examName,
      bodyPart: selectedExam.bodyPart,
      clinicalIndication,
      clinicalNotes,
      contrastRequired: contrastRequired || selectedExam.contrastRequired,
      price: selectedExam.price,
      paymentStatus: 'paid',
    });

    onClose();
    setActiveTab('orders');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 840 }}>
        <div className="modal-header">
          <Scan size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <span className="modal-title">Physician Radiology & Imaging Order Requisition</span>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Diagnostic scan requisition, protocol selection, and schedule reservation
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Demographics Grid */}
            <div className="form-grid form-grid-2" style={{ gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Patient <span className="required">*</span></label>
                <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  {DEMO_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Encounter Classification</label>
                <select className="form-select" value={encounterType} onChange={e => setEncounterType(e.target.value as any)}>
                  <option value="opd">Outpatient Department (OPD)</option>
                  <option value="ipd">Inpatient Department (IPD Admission)</option>
                  <option value="emergency">Emergency Casualty / Trauma</option>
                </select>
              </div>

              {encounterType === 'ipd' && (
                <>
                  <div className="form-group">
                    <label className="form-label">IPD Ward Location</label>
                    <input type="text" className="form-input" value={ward} onChange={e => setWard(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bed Allocation</label>
                    <input type="text" className="form-input" value={bedNumber} onChange={e => setBedNumber(e.target.value)} required />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Referring Consultant <span className="required">*</span></label>
                <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  {DEMO_DOCTORS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {(d as any).specialty || d.department} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Urgency / Priority</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="routine">Routine Standard Schedule</option>
                  <option value="urgent">Urgent Priority (Within 4 Hours)</option>
                  <option value="stat">STAT Immediate Emergency</option>
                </select>
              </div>
            </div>

            {/* Examination Selection */}
            <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>
                SELECT IMAGING INVESTIGATION
              </div>

              <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Diagnostic Examination <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={selectedExamId}
                    onChange={e => {
                      setSelectedExamId(e.target.value);
                      const ex = examinations.find(item => item.id === e.target.value);
                      if (ex) setContrastRequired(ex.contrastRequired);
                    }}
                  >
                    {examinations.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        [{ex.modalityType.toUpperCase()}] {ex.examName} ({ex.bodyPart}) — ₹{ex.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input type="date" className="form-input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Time Slot</label>
                  <select className="form-select" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}>
                    {['08:30', '09:15', '10:00', '10:45', '11:30', '12:15', '14:00', '14:45', '15:30', '16:15', '17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedExam && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                  <div>Preparation: <strong>{selectedExam.preparationInstructions}</strong></div>
                  <div style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Estimated Duration: {selectedExam.estimatedDurationMins} Mins · Target TAT: {selectedExam.turnaroundHours} Hours · Standard Price: ₹{selectedExam.price}
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Indication & Contrast */}
            <div className="form-grid" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Clinical Indication & Suspected Pathology <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Acute severe headache with left facial drooping. Rule out acute ischemic stroke vs intracerebral hemorrhage..."
                  value={clinicalIndication}
                  onChange={e => setClinicalIndication(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={contrastRequired}
                    onChange={e => setContrastRequired(e.target.checked)}
                  />
                  <span style={{ fontWeight: 700, color: contrastRequired ? 'var(--color-warning)' : undefined }}>
                    Intravenous Contrast Media (IV Contrast) Required
                  </span>
                </label>
                {contrastRequired && (
                  <div style={{ fontSize: 11, color: 'var(--color-warning)', marginTop: 4 }}>
                    ⚠️ Serum Creatinine validation and written informed consent mandatory prior to contrast injection.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Scan size={14} /> Place Radiology Order (₹{selectedExam.price})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
