import React, { useState } from 'react';
import { UserPlus, X, Save, CheckCircle2, User, Phone } from 'lucide-react';
import { useOPD } from '../../context/OPDContext';
import type { Patient, OPDVisit, BloodGroup } from '../../../../types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface PatientRegistrationModalProps {
  onClose: () => void;
  onSuccess: (visit: OPDVisit) => void;
}

export default function PatientRegistrationModal({ onClose, onSuccess }: PatientRegistrationModalProps) {
  const { doctors, departments, registerPatientAndVisit } = useOPD();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1992-05-15');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'General Medicine');
  const [reason, setReason] = useState('General Outpatient Consultation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

    const { visit } = registerPatientAndVisit(
      {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        bloodGroup,
        phone,
      },
      {
        doctorId: doc.id,
        doctorName: doc.name,
        department: selectedDept,
        reasonForVisit: reason,
        visitType: 'new',
        consultationFee: doc.consultationFee || 600,
        priority: 'normal',
      }
    );

    onSuccess(visit);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16 }}>Register OPD Patient & Issue Token</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Create outpatient record and assign to live consulting queue
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kumar"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={gender} onChange={e => setGender(e.target.value as any)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value as any)}>
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Consulting Doctor</label>
                <select
                  className="form-select"
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                >
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chief Complaint / Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="Fever, cough, body ache..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={14} /> Register & Generate Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
