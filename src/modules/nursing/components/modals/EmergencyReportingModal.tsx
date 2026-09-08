import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Siren, User } from 'lucide-react';
import { useNursing } from '../../context/NursingContext';
import type { NursingEmergencyAlert } from '../../../../types';

interface EmergencyReportingModalProps {
  onClose: () => void;
  defaultAdmissionId?: string;
}

export default function EmergencyReportingModal({ onClose, defaultAdmissionId }: EmergencyReportingModalProps) {
  const { admissions, wards, reportEmergency } = useNursing();

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdm = activeAdmissions.find(a => a.id === defaultAdmissionId) || activeAdmissions[0];

  const [emergencyType, setEmergencyType] = useState<NursingEmergencyAlert['type']>('critical_patient');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(defaultAdmissionId || selectedAdm?.id || '');
  const [selectedWard, setSelectedWard] = useState(selectedAdm?.ward || wards[0]?.name || 'Medical ICU');
  const [description, setDescription] = useState('Immediate medical evaluation required. Acute clinical deterioration observed.');

  const currentPatient = activeAdmissions.find(a => a.id === selectedAdmissionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    reportEmergency({
      type: emergencyType,
      admissionId: currentPatient?.id,
      patientId: currentPatient?.patientId,
      patientName: currentPatient?.patientName,
      bedNumber: currentPatient?.bedNumber,
      ward: selectedWard,
      description,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, borderTop: '4px solid var(--color-danger)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Siren size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ color: 'var(--color-danger)' }}>Rapid Emergency Broadcast</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Instant broadcast to duty doctor, emergency response team & nursing in-charge
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid" style={{ gap: 14 }}>
              {/* Emergency Category */}
              <div className="form-group">
                <label className="form-label">Emergency Category <span className="required">*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${emergencyType === 'critical_patient' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                    onClick={() => setEmergencyType('critical_patient')}
                  >
                    Critical Patient
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${emergencyType === 'medical_emergency' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                    onClick={() => setEmergencyType('medical_emergency')}
                  >
                    Medical Emergency
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${emergencyType === 'code_blue' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                    onClick={() => setEmergencyType('code_blue')}
                  >
                    Code Blue (Arrest)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${emergencyType === 'other' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
                    onClick={() => setEmergencyType('other')}
                  >
                    Other Emergency
                  </button>
                </div>
              </div>

              {/* Patient Selection */}
              <div className="form-group">
                <label className="form-label">Inpatient Involved</label>
                <select
                  className="form-select"
                  value={selectedAdmissionId}
                  onChange={e => {
                    setSelectedAdmissionId(e.target.value);
                    const adm = activeAdmissions.find(a => a.id === e.target.value);
                    if (adm) setSelectedWard(adm.ward);
                  }}
                >
                  <option value="">-- General Ward Emergency (No specific patient) --</option>
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} ({a.patientId}) — Bed {a.bedNumber} ({a.ward})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward Location */}
              <div className="form-group">
                <label className="form-label">Hospital Ward / Location <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={selectedWard}
                  onChange={e => setSelectedWard(e.target.value)}
                  required
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.name}>{w.name} (Floor {w.floor})</option>
                  ))}
                </select>
              </div>

              {/* Clinical Description */}
              <div className="form-group">
                <label className="form-label">Emergency Nature & Immediate Symptoms <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="State patient condition, sudden vitals drop, severe arrhythmia, trauma, or emergency detail..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-danger btn-sm"
              style={{ padding: '8px 18px', fontWeight: 800 }}
            >
              <Siren size={14} /> Broadcast Emergency Alert Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
