import React, { useState } from 'react';
import { Plus, Search, FileText, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import type { DiagnosticPriority } from '../../../../types';

interface CreateDiagnosticRequestModalProps {
  initialPatientId?: string;
  onClose: () => void;
}

export default function CreateDiagnosticRequestModal({
  initialPatientId,
  onClose,
}: CreateDiagnosticRequestModalProps) {
  const { patients, doctors, admissions, testMaster, createDiagnosticRequest } = useDiagnostic();

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedTestId, setSelectedTestId] = useState(testMaster[0]?.id || '');
  const [priority, setPriority] = useState<DiagnosticPriority>('normal');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const selectedTest = testMaster.find(t => t.id === selectedTestId);
  const activeAdmission = admissions.find(a => a.patientId === selectedPatientId && a.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor || !selectedTest) return;

    const patientFullName = `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim();
    const calculatedAge = selectedPatient.dateOfBirth
      ? Math.max(1, Math.floor((new Date().getTime() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
      : 35;

    createDiagnosticRequest({
      patientId: selectedPatient.id,
      patientName: patientFullName,
      age: calculatedAge,
      gender: selectedPatient.gender,
      encounterType: activeAdmission ? 'ipd' : 'opd',
      admissionId: activeAdmission?.id,
      bedNumber: activeAdmission?.bedNumber,
      ward: activeAdmission?.ward,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department || selectedTest.department,
      testId: selectedTest.id,
      testCode: selectedTest.code,
      testName: selectedTest.name,
      category: selectedTest.category,
      subCategory: selectedTest.subCategory,
      priority,
      clinicalNotes,
      diagnosis: diagnosis || selectedPatient.allergies?.[0] || 'Clinical Evaluation',
      price: selectedTest.price,
      sampleType: selectedTest.sampleType,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} style={{ color: 'var(--color-primary)' }} />
            <span className="modal-title">New Diagnostic Order / Test Request</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient & Doctor Row */}
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Patient <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  required
                >
                  {patients.map(p => {
                    const adm = admissions.find(a => a.patientId === p.id && a.status === 'active');
                    return (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.id}) {adm ? `· Bed ${adm.bedNumber} (${adm.ward})` : '· OPD'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ordering Doctor <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Selection & Priority */}
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Diagnostic Test / Procedure <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedTestId}
                  onChange={e => setSelectedTestId(e.target.value)}
                  required
                >
                  <optgroup label="Laboratory Tests">
                    {testMaster.filter(t => t.category === 'laboratory').map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name} (₹{t.price})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Radiology & Imaging">
                    {testMaster.filter(t => t.category === 'radiology').map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name} (₹{t.price})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Diagnostic Tests">
                    {testMaster.filter(t => t.category === 'other').map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name} (₹{t.price})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Clinical Priority <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as DiagnosticPriority)}
                >
                  <option value="normal">Normal (Routine Care)</option>
                  <option value="urgent">Urgent (Priority Processing)</option>
                  <option value="emergency">Emergency / STAT (Immediate)</option>
                </select>
              </div>
            </div>

            {/* Test Preview Banner */}
            {selectedTest && (
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Category: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedTest.category}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Department: </span>
                  <strong>{selectedTest.department}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Turnaround: </span>
                  <strong>{selectedTest.turnaroundHours} Hours</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Standard Fee: </span>
                  <strong style={{ color: 'var(--color-primary)' }}>₹{selectedTest.price}</strong>
                </div>
                {selectedTest.sampleType && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sample Required: </span>
                    <strong>{selectedTest.sampleType}</strong> ({selectedTest.containerType})
                  </div>
                )}
              </div>
            )}

            {/* Provisional Diagnosis & Clinical Indication */}
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Provisional Clinical Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acute Pyrexia, Rule out NSTEMI..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Indication / Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fasting sample, urgent stat alert..."
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={14} /> Submit Test Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
