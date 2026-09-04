import React, { useState } from 'react';
import { UserRound, Plus, X, CheckCircle2, Award, DollarSign } from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';
import type { Doctor } from '../../../../types';

interface AddEditDoctorModalProps {
  doctor?: Doctor;
  onClose: () => void;
}

export default function AddEditDoctorModal({ doctor, onClose }: AddEditDoctorModalProps) {
  const { addDoctor, updateDoctor } = useDoctor();

  const [name, setName] = useState(doctor?.name || 'Dr. ');
  const [department, setDepartment] = useState(doctor?.department || 'Cardiology');
  const [specialization, setSpecialization] = useState(doctor?.specialization || 'Interventional Cardiologist');
  const [qualifications, setQualifications] = useState(
    Array.isArray(doctor?.qualifications) ? doctor?.qualifications.join(', ') : (doctor?.qualifications || 'MBBS, MD (Medicine), DM (Cardiology)')
  );
  const [experience, setExperience] = useState(doctor?.experience || 10);
  const [consultationFee, setConsultationFee] = useState(doctor?.consultationFee || 750);
  const [phone, setPhone] = useState(doctor?.phone || '+91 98450 12345');
  const [email, setEmail] = useState(doctor?.email || '');
  const [registrationNumber, setRegistrationNumber] = useState(doctor?.registrationNumber || 'MCI-2026-');
  const [roomNumber, setRoomNumber] = useState('Room 102 (OPD Block A)');
  const [isAvailable, setIsAvailable] = useState(doctor?.isAvailable ?? true);
  const [bio, setBio] = useState(doctor?.bio || 'Senior consultant with extensive expertise in clinical care and advanced treatment modalities.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const qualArray = qualifications.split(',').map(q => q.trim()).filter(Boolean);

    if (doctor) {
      updateDoctor(doctor.id, {
        name,
        department,
        specialization,
        qualifications: qualArray,
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        phone,
        email,
        registrationNumber,
        isAvailable,
        bio,
      });
      alert(`Doctor record for ${name} updated successfully.`);
    } else {
      addDoctor({
        userId: `user-${Date.now()}`,
        name,
        department,
        specialization,
        qualifications: qualArray,
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        phone,
        email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@alncurehospital.com`,
        registrationNumber,
        isAvailable,
        bio,
        schedule: [
          { day: 'monday', startTime: '09:00 AM', endTime: '01:00 PM', maxPatients: 25, isAvailable: true },
          { day: 'wednesday', startTime: '09:00 AM', endTime: '01:00 PM', maxPatients: 25, isAvailable: true },
          { day: 'friday', startTime: '09:00 AM', endTime: '01:00 PM', maxPatients: 25, isAvailable: true },
        ],
        opdSchedule: {
          days: ['Mon', 'Wed', 'Fri'],
          startTime: '09:00 AM',
          endTime: '01:00 PM',
        },
      });
      alert(`Doctor ${name} registered successfully into Hospital Master.`);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <UserRound size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">{doctor ? 'Edit Doctor Profile' : 'Register New Medical Staff / Doctor'}</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Doctor Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department <span className="required">*</span></label>
                <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="ENT">ENT</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Urology">Urology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Specialization <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Interventional Cardiologist"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications (comma separated) <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MBBS, MD, DM"
                  value={qualifications}
                  onChange={e => setQualifications(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid form-grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={experience}
                  onChange={e => setExperience(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  className="form-input"
                  value={consultationFee}
                  onChange={e => setConsultationFee(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MCI-2018-7749"
                  value={registrationNumber}
                  onChange={e => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Biography & Clinical Summary</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> {doctor ? 'Save Changes' : 'Register Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
