import React, { useState } from 'react';
import { UserPlus, Plus, X, CheckCircle2 } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';
import type { BloodDonorRecord, BloodGroup } from '../../context/BloodBankContext';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface AddEditDonorModalProps {
  donor?: BloodDonorRecord;
  onClose: () => void;
}

export default function AddEditDonorModal({ donor, onClose }: AddEditDonorModalProps) {
  const { addDonor, updateDonor } = useBloodBank();

  const [name, setName] = useState(donor?.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(donor?.gender || 'male');
  const [age, setAge] = useState(donor?.age || 30);
  const [dateOfBirth, setDateOfBirth] = useState(donor?.dateOfBirth || '1995-01-01');
  const [phone, setPhone] = useState(donor?.phone || '+91 ');
  const [email, setEmail] = useState(donor?.email || '');
  const [address, setAddress] = useState(donor?.address || 'Bengaluru, Karnataka');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donor?.bloodGroup || 'O+');
  const [donorType, setDonorType] = useState<'voluntary' | 'replacement' | 'directed'>(donor?.donorType || 'voluntary');
  const [weightKg, setWeightKg] = useState(donor?.weightKg || 65);
  const [hemoglobinGdl, setHemoglobinGdl] = useState(donor?.hemoglobinGdl || 13.5);
  const [isEligible, setIsEligible] = useState(donor?.isEligible ?? true);
  const [deferralStatus, setDeferralStatus] = useState(donor?.deferralStatus || 'none');
  const [deferralReason, setDeferralReason] = useState(donor?.deferralReason || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (donor) {
      updateDonor(donor.id, {
        name,
        gender,
        age: Number(age),
        dateOfBirth,
        phone,
        email,
        address,
        bloodGroup,
        rhFactor: bloodGroup.includes('+') ? '+' : '-',
        donorType,
        weightKg: Number(weightKg),
        hemoglobinGdl: Number(hemoglobinGdl),
        isEligible,
        deferralStatus: deferralStatus as any,
        deferralReason: isEligible ? undefined : deferralReason,
      });
      alert(`Donor record for ${name} updated successfully.`);
    } else {
      addDonor({
        name,
        gender,
        age: Number(age),
        dateOfBirth,
        phone,
        email,
        address,
        bloodGroup,
        rhFactor: bloodGroup.includes('+') ? '+' : '-',
        donorType,
        weightKg: Number(weightKg),
        hemoglobinGdl: Number(hemoglobinGdl),
        isEligible,
        deferralStatus: deferralStatus as any,
        deferralReason: isEligible ? undefined : deferralReason,
      });
      alert(`Donor ${name} (${bloodGroup}) registered into Blood Bank Master.`);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <UserPlus size={18} style={{ color: 'var(--color-danger)' }} />
          <div className="modal-title">{donor ? 'Edit Blood Donor Profile' : 'Register New Blood Donor'}</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Donor Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group <span className="required">*</span></label>
                <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value as BloodGroup)}>
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select className="form-select" value={gender} onChange={e => setGender(e.target.value as any)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Age (Years) <span className="required">*</span></label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  className="form-input"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Donor Type</label>
                <select className="form-select" value={donorType} onChange={e => setDonorType(e.target.value as any)}>
                  <option value="voluntary">Voluntary Donor</option>
                  <option value="replacement">Replacement Donor</option>
                  <option value="directed">Directed Donor</option>
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Contact Phone <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
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
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Screening Vitals */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                Donor Physical Screening & Eligibility Vitals
              </div>

              <div className="form-grid form-grid-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Body Weight (kg) &ge;45kg</label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    className="form-input"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hemoglobin (g/dL) &ge;12.5</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    className="form-input"
                    value={hemoglobinGdl}
                    onChange={e => setHemoglobinGdl(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Eligibility Status</label>
                  <select
                    className="form-select"
                    value={isEligible ? 'eligible' : 'deferred'}
                    onChange={e => setIsEligible(e.target.value === 'eligible')}
                  >
                    <option value="eligible">Eligible to Donate</option>
                    <option value="deferred">Deferred from Donation</option>
                  </select>
                </div>
              </div>

              {!isEligible && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label">Deferral Reason / Medical Justification</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Low hemoglobin (<12.5 g/dL), Recent vaccination, Antibiotic course"
                    value={deferralReason}
                    onChange={e => setDeferralReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> {donor ? 'Save Changes' : 'Register Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
