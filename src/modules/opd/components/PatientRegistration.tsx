import React, { useState, useEffect } from 'react';
import {
  UserPlus, Save, Printer, RotateCcw, X, Search, CheckCircle2,
  Calendar, User, Phone, MapPin, ShieldCheck, Stethoscope, AlertCircle
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { Patient, OPDVisit, BloodGroup, OPDVisitType, OPDQueuePriority } from '../../../types';
import PrintRegistrationSlipModal from './modals/PrintRegistrationSlipModal';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ID_TYPES = ['Aadhaar Card', 'Passport', 'Driving License', 'Voter ID', 'PAN Card', 'Other'];
const REFERRAL_SOURCES = ['Direct Walk-in', 'Community Health Camp', 'Internal Hospital Transfer', 'Private Practitioner', 'Online Portal', 'Emergency Triage'];

export default function PatientRegistration() {
  const {
    patients,
    doctors,
    departments,
    visits,
    registerPatientAndVisit,
    registerExistingPatientVisit,
    setActiveTab,
  } = useOPD();

  // Mode: 'new' patient or 'existing' patient
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existingPatientSearch, setExistingPatientSearch] = useState('');
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<Patient | null>(null);

  // Form Fields - Patient
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1992-05-15');
  const [age, setAge] = useState<number>(34);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('201301');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [allergies, setAllergies] = useState<string>('');

  // Form Fields - Visit
  const [visitType, setVisitType] = useState<OPDVisitType>('new');
  const [priority, setPriority] = useState<OPDQueuePriority>('normal');
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-002');
  const [visitDate, setVisitDate] = useState('2026-08-31');
  const [visitTime, setVisitTime] = useState('10:00');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [referralSource, setReferralSource] = useState('Direct Walk-in');

  // Slip Modal
  const [createdVisit, setCreatedVisit] = useState<OPDVisit | null>(null);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Auto calculate age from DOB
  useEffect(() => {
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear)) {
        setAge(Math.max(0, currentYear - birthYear));
      }
    }
  }, [dateOfBirth]);

  // Filter available doctors for chosen department
  const filteredDoctors = doctors.filter(d => !selectedDept || d.department.toLowerCase() === selectedDept.toLowerCase() || d.department === selectedDept);

  // Doctor fee preview
  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Search existing patients
  const matchingPatients = patients.filter(p => {
    if (!existingPatientSearch || existingPatientSearch.length < 2) return false;
    const q = existingPatientSearch.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }).slice(0, 5);

  const handleSelectExistingPatient = (p: Patient) => {
    setSelectedExistingPatient(p);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setGender(p.gender);
    setDateOfBirth(p.dateOfBirth);
    setBloodGroup(p.bloodGroup);
    setPhone(p.phone);
    setEmail(p.email || '');
    setAddress(p.address);
    setCity(p.city);
    setState(p.state);
    setPincode(p.pincode);
    setEmergencyName(p.emergencyContact?.name || '');
    setEmergencyRelation(p.emergencyContact?.relationship || '');
    setEmergencyPhone(p.emergencyContact?.phone || '');
    setAllergies(p.allergies?.join(', ') || '');
    setVisitType('follow_up');
    setExistingPatientSearch('');
  };

  const handleClearForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setAddress('');
    setEmergencyName('');
    setEmergencyRelation('');
    setEmergencyPhone('');
    setIdNumber('');
    setReasonForVisit('');
    setAllergies('');
    setSelectedExistingPatient(null);
    setMode('new');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'existing' && selectedExistingPatient) {
      // Register repeat visit for existing patient
      const visit = registerExistingPatientVisit(selectedExistingPatient.id, {
        doctorId: selectedDoctorId,
        department: selectedDept,
        visitDate,
        visitTime,
        visitType,
        priority,
        reasonForVisit: reasonForVisit || 'Routine Consultation',
        referralSource,
      });
      setCreatedVisit(visit);
      setCreatedPatient(selectedExistingPatient);
      setShowSlipModal(true);
    } else {
      // Register brand new patient & visit
      const allergyArr = allergies ? allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
      const { patient, visit } = registerPatientAndVisit(
        {
          firstName,
          lastName,
          gender,
          dateOfBirth,
          bloodGroup,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          allergies: allergyArr,
          emergencyContact: {
            name: emergencyName,
            relationship: emergencyRelation,
            phone: emergencyPhone,
          },
          aadhaar: idType === 'Aadhaar Card' ? idNumber : undefined,
        },
        {
          doctorId: selectedDoctorId,
          department: selectedDept,
          visitDate,
          visitTime,
          visitType,
          priority,
          reasonForVisit: reasonForVisit || 'General OPD Consultation',
          referralSource,
          idType,
          idNumber,
        }
      );
      setCreatedVisit(visit);
      setCreatedPatient(patient);
      setShowSlipModal(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Mode Toggle */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Outpatient (OPD) Patient Registration</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Instant UHID allocation, token generation, and registration slips</div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="tabs">
          <button
            type="button"
            className={`tab ${mode === 'new' ? 'active' : ''}`}
            onClick={() => { setMode('new'); setSelectedExistingPatient(null); }}
          >
            New Patient (First Visit)
          </button>
          <button
            type="button"
            className={`tab ${mode === 'existing' ? 'active' : ''}`}
            onClick={() => setMode('existing')}
          >
            Existing Patient (Repeat Visit)
          </button>
        </div>
      </div>

      {/* Existing Patient Search Section if mode === 'existing' */}
      {mode === 'existing' && (
        <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--color-primary-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
            <Search size={16} /> Search Existing Patient Master Record
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by UHID (e.g. ALN-2026-00001), Patient Name, or Mobile Number..."
              value={existingPatientSearch}
              onChange={e => setExistingPatientSearch(e.target.value)}
            />
            {matchingPatients.length > 0 && (
              <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                {matchingPatients.map(p => (
                  <div
                    key={p.id}
                    className="search-result-item"
                    onClick={() => handleSelectExistingPatient(p)}
                  >
                    <div className="avatar avatar-sm">{p.firstName[0]}{p.lastName[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.id} · {p.phone} · {p.bloodGroup} · {p.city}</div>
                    </div>
                    <button className="btn btn-primary btn-sm">Select</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedExistingPatient && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>SELECTED PATIENT:</span>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedExistingPatient.firstName} {selectedExistingPatient.lastName} ({selectedExistingPatient.id})</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mobile: {selectedExistingPatient.phone} · Blood: {selectedExistingPatient.bloodGroup}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedExistingPatient(null)}>Change</button>
            </div>
          )}
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          {/* Left Column: Patient Personal & Identification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient Personal Information Card */}
            <div className="card">
              <div className="card-header">
                <User size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">1. Patient Demographic Information</span>
              </div>
              <div className="card-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  {/* First Name */}
                  <div className="form-group">
                    <label className="form-label">First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="form-group">
                    <label className="form-label">Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Yadav"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="form-label">Gender <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="form-group">
                    <label className="form-label">Blood Group <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  {/* DOB & Age */}
                  <div className="form-group">
                    <label className="form-label">Date of Birth <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      required
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age (Calculated)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={age}
                      onChange={e => setAge(parseInt(e.target.value, 10) || 0)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  {/* Mobile & Alt Mobile */}
                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alternate Mobile</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Alternate phone (optional)"
                      value={altPhone}
                      onChange={e => setAltPhone(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="patient@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  {/* Address */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Residential Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Street, house number, area"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>

                  {/* Allergies */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Known Drug / Food Allergies</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (comma separated)"
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      disabled={mode === 'existing' && !!selectedExistingPatient}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Identification & Emergency Contact */}
            <div className="card">
              <div className="card-header">
                <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">2. Government ID & Emergency Contact</span>
              </div>
              <div className="card-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">ID Document Type</label>
                    <select
                      className="form-select"
                      value={idType}
                      onChange={e => setIdType(e.target.value)}
                    >
                      {ID_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1234-5678-9012"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contact person name"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Relationship & Phone</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Spouse"
                        style={{ width: '40%' }}
                        value={emergencyRelation}
                        onChange={e => setEmergencyRelation(e.target.value)}
                      />
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Phone number"
                        style={{ width: '60%' }}
                        value={emergencyPhone}
                        onChange={e => setEmergencyPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visit Details, Doctor Allocation & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Visit Details Card */}
            <div className="card">
              <div className="card-header">
                <Stethoscope size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">3. OPD Visit Information</span>
              </div>
              <div className="card-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  {/* Visit Type & Priority */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Visit Type <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={visitType}
                        onChange={e => setVisitType(e.target.value as OPDVisitType)}
                      >
                        <option value="new">New Visit</option>
                        <option value="follow_up">Follow-up Visit</option>
                        <option value="emergency">Emergency OPD</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Queue Priority</label>
                      <select
                        className="form-select"
                        value={priority}
                        onChange={e => setPriority(e.target.value as OPDQueuePriority)}
                      >
                        <option value="normal">Normal</option>
                        <option value="priority">Priority</option>
                        <option value="senior">Senior Citizen</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="form-group">
                    <label className="form-label">Clinical Department <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedDept}
                      onChange={e => {
                        setSelectedDept(e.target.value);
                        const match = doctors.find(d => d.department === e.target.value);
                        if (match) setSelectedDoctorId(match.id);
                      }}
                      required
                    >
                      {departments.slice(0, 12).map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Attending Doctor */}
                  <div className="form-group">
                    <label className="form-label">Consulting Doctor <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      required
                    >
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.specialization} (₹{d.consultationFee})
                          </option>
                        ))
                      ) : (
                        doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Appointment Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input"
                        value={visitDate}
                        onChange={e => setVisitDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Slot Time <span className="required">*</span></label>
                      <input
                        type="time"
                        className="form-input"
                        value={visitTime}
                        onChange={e => setVisitTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div className="form-group">
                    <label className="form-label">Chief Reason for Visit <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Fever with chills, persistent dry cough for 3 days..."
                      value={reasonForVisit}
                      onChange={e => setReasonForVisit(e.target.value)}
                      required
                    />
                  </div>

                  {/* Referral Source */}
                  <div className="form-group">
                    <label className="form-label">Referral Source</label>
                    <select
                      className="form-select"
                      value={referralSource}
                      onChange={e => setReferralSource(e.target.value)}
                    >
                      {REFERRAL_SOURCES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Consultation Fee Preview Box */}
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Consultation Fee Payable:</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>
                      ₹{currentDoctor?.consultationFee || 600}
                    </div>
                  </div>
                  <span className="badge badge-success">Cash / Card / UPI</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', height: 42, fontSize: 14 }}>
                  <Save size={16} /> Save Patient & Register Visit
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClearForm}>
                    <RotateCcw size={14} /> Clear Form
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveTab('dashboard')}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Slip Modal Triggered after registration */}
      {showSlipModal && createdVisit && (
        <PrintRegistrationSlipModal
          visit={createdVisit}
          patient={createdPatient}
          onClose={() => {
            setShowSlipModal(false);
            setActiveTab('dashboard');
          }}
        />
      )}
    </div>
  );
}
