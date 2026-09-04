import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Droplets, ShieldAlert } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../../data/seedData';
import type { BloodGroup, BloodComponentType } from '../../context/BloodBankContext';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface CreateBloodRequestModalProps {
  onClose: () => void;
}

export default function CreateBloodRequestModal({ onClose }: CreateBloodRequestModalProps) {
  const { createBloodRequest } = useBloodBank();

  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]?.id || 'pat-001');
  const [component, setComponent] = useState<BloodComponentType>('packed_rbc');
  const [unitsRequested, setUnitsRequested] = useState<number>(1);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [department, setDepartment] = useState('General Surgery');
  const [ward, setWard] = useState('Surgical Ward 3');
  const [bed, setBed] = useState('BED-304');
  const [doctorName, setDoctorName] = useState(DEMO_DOCTORS[0]?.name || 'Dr. Rajesh Sharma');
  const [clinicalIndication, setClinicalIndication] = useState('Severe anemia / intra-operative blood loss');
  const [requiredDateTime, setRequiredDateTime] = useState('2026-09-02 04:00 PM');

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];

  const getAge = (dob?: string) => {
    if (!dob) return 45;
    try {
      return new Date().getFullYear() - new Date(dob).getFullYear() || 45;
    } catch {
      return 45;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createBloodRequest({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      age: getAge(selectedPatient.dateOfBirth),
      gender: selectedPatient.gender || 'male',
      bloodGroup: selectedPatient.bloodGroup || 'O+',
      department,
      ward,
      bed,
      doctorName,
      component,
      unitsRequested: Number(unitsRequested),
      priority,
      clinicalIndication,
      requiredDateTime: priority === 'emergency' ? 'STAT / IMMEDIATE' : requiredDateTime,
    });

    alert(`Blood Requisition created for ${selectedPatient.firstName} ${selectedPatient.lastName} (${unitsRequested} Unit(s) of ${component.toUpperCase()}).`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <Droplets size={18} style={{ color: priority === 'emergency' ? '#dc2626' : 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Create Patient Blood Requisition Order</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Hospital clinical blood request linked with patient record, attending physician & ward
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Priority Selection Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div
                style={{
                  border: `2px solid ${priority === 'routine' ? 'var(--color-primary)' : 'var(--border-default)'}`,
                  background: priority === 'routine' ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setPriority('routine')}
              >
                <strong style={{ fontSize: 13, color: priority === 'routine' ? 'var(--color-primary)' : 'var(--text-primary)' }}>Routine</strong>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Elective surgery / Planned</div>
              </div>

              <div
                style={{
                  border: `2px solid ${priority === 'urgent' ? '#f59e0b' : 'var(--border-default)'}`,
                  background: priority === 'urgent' ? '#fef3c7' : 'var(--bg-surface)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setPriority('urgent')}
              >
                <strong style={{ fontSize: 13, color: '#d97706' }}>⚡ Urgent</strong>
                <div style={{ fontSize: 10, color: '#92400e' }}>Within 2–4 hours</div>
              </div>

              <div
                style={{
                  border: `2px solid ${priority === 'emergency' ? '#ef4444' : 'var(--border-default)'}`,
                  background: priority === 'emergency' ? '#fee2e2' : 'var(--bg-surface)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setPriority('emergency')}
              >
                <strong style={{ fontSize: 13, color: '#dc2626' }}>🚨 Emergency STAT</strong>
                <div style={{ fontSize: 10, color: '#991b1b' }}>Life-threatening / Trauma</div>
              </div>
            </div>

            {/* Patient Selector */}
            <div className="form-group">
              <label className="form-label">Select Patient <span className="required">*</span></label>
              <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                {DEMO_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.id}) · Blood: {p.bloodGroup || 'O+'} · {p.gender}
                  </option>
                ))}
              </select>
            </div>

            {/* Component & Units */}
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Blood Component <span className="required">*</span></label>
                <select className="form-select" value={component} onChange={e => setComponent(e.target.value as any)}>
                  <option value="packed_rbc">Packed Red Blood Cells (PRBC)</option>
                  <option value="fresh_frozen_plasma">Fresh Frozen Plasma (FFP)</option>
                  <option value="platelets">Platelet Concentrate (PC)</option>
                  <option value="whole_blood">Whole Blood (WB)</option>
                  <option value="cryoprecipitate">Cryoprecipitate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Units / Bags Required <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={unitsRequested}
                  onChange={e => setUnitsRequested(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Ward & Doctor */}
            <div className="form-grid form-grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ward</label>
                <input type="text" className="form-input" value={ward} onChange={e => setWard(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Bed #</label>
                <input type="text" className="form-input" value={bed} onChange={e => setBed(e.target.value)} />
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Requesting Doctor</label>
                <select className="form-select" value={doctorName} onChange={e => setDoctorName(e.target.value)}>
                  {DEMO_DOCTORS.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Required By Date / Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={priority === 'emergency' ? 'STAT / IMMEDIATE' : requiredDateTime}
                  disabled={priority === 'emergency'}
                  onChange={e => setRequiredDateTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Indication & Diagnosis <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={2}
                value={clinicalIndication}
                onChange={e => setClinicalIndication(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${priority === 'emergency' ? 'btn-danger' : 'btn-primary'}`}
            >
              <CheckCircle2 size={14} /> Submit Blood Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
