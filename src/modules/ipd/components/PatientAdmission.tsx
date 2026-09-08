import React, { useState } from 'react';
import {
  UserPlus, Search, Save, BedDouble, ShieldCheck, Stethoscope,
  Clock, RotateCcw, AlertTriangle, Printer, User, Phone, CheckCircle2,
  Calendar, Activity, ShieldAlert
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Patient, Admission, AdmissionType } from '../../../types';
import PrintAdmissionSlipModal from './modals/PrintAdmissionSlipModal';

const ADMISSION_TYPES: { id: AdmissionType; label: string }[] = [
  { id: 'planned', label: 'Planned / Elective Admission' },
  { id: 'emergency', label: 'Emergency Inpatient Admission' },
  { id: 'referral', label: 'External Hospital Referral' },
  { id: 'transfer', label: 'Internal Department Transfer' },
];

export default function PatientAdmission() {
  const {
    patients,
    doctors,
    departments,
    beds,
    admitPatient,
    setActiveTab,
  } = useIPD();

  // Patient Search & Selection
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form Fields
  const [admissionType, setAdmissionType] = useState<AdmissionType>('planned');
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-001');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [admissionDate, setAdmissionDate] = useState('2026-08-31');
  const [admissionTime, setAdmissionTime] = useState('11:00');
  const [expectedDischargeDate, setExpectedDischargeDate] = useState('2026-09-04');
  const [condition, setCondition] = useState<'stable' | 'guarded' | 'serious' | 'critical'>('stable');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [diagnosis, setDiagnosis] = useState('Acute Inpatient Medical Evaluation');
  const [admissionNotes, setAdmissionNotes] = useState('Admitted for observation, continuous monitoring, and IV therapy.');
  const [referredBy, setReferredBy] = useState('Direct OPD');
  const [mlc, setMlc] = useState(false);

  // Attendant Details
  const [attendantName, setAttendantName] = useState('');
  const [attendantPhone, setAttendantPhone] = useState('');
  const [attendantRelation, setAttendantRelation] = useState('Spouse');

  // Insurance Info
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [tpaName, setTpaName] = useState('');

  // Post Admission Slip Modal
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [createdAdmission, setCreatedAdmission] = useState<Admission | null>(null);

  // Available Beds Filtered
  const availableBeds = beds.filter(b => b.status === 'available');
  const selectedBed = beds.find(b => b.id === selectedBedId);

  // Matching Patients Search
  const matchingPatients = patients.filter(p => {
    if (!patientSearch || patientSearch.length < 2) return false;
    const q = patientSearch.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }).slice(0, 5);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setAttendantName(p.emergencyContact?.name || '');
    setAttendantPhone(p.emergencyContact?.phone || p.phone);
    setAttendantRelation(p.emergencyContact?.relationship || 'Family');
    if (p.insurance) {
      setInsuranceProvider(p.insurance.provider);
      setPolicyNumber(p.insurance.policyNumber);
      setTpaName(p.insurance.tpaName || '');
    }
    setPatientSearch('');
  };

  const handleClear = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setDiagnosis('');
    setAdmissionNotes('');
    setAttendantName('');
    setAttendantPhone('');
    setSelectedBedId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Please search and select a registered patient.');
      return;
    }

    if (!selectedBedId) {
      alert('Please select an available bed for this admission.');
      return;
    }

    const adm = admitPatient({
      patientId: selectedPatient.id,
      bedId: selectedBedId,
      admittingDoctorId: selectedDoctorId,
      admissionType,
      admissionDate,
      admissionTime,
      expectedDischargeDate,
      condition,
      priority,
      diagnosis: [diagnosis],
      admissionNotes,
      attendantName,
      attendantPhone,
      attendantRelation,
      referredBy,
      mlc,
      insuranceProvider,
      policyNumber,
      tpaName,
    });

    setCreatedAdmission(adm);
    setShowSlipModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient (IPD) Admission & Bed Allocation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete patient registration, clinical triage, doctor assignment, and guaranteed double-allocation prevention
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('bed_board')}>
            <BedDouble size={13} /> View Bed Availability
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* Left Column: Patient Search, Demographics & Attendant Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient Search Card */}
            <div className="card">
              <div className="card-header">
                <Search size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">1. Patient Lookup & Master Record <span className="required">*</span></span>
              </div>
              <div className="card-body">
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <label className="form-label">Search Registered Patient (UHID, Name, or Mobile)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by UHID (e.g. ALN-2026-00001), Patient Name, or Mobile Number..."
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />

                  {matchingPatients.length > 0 && (
                    <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                      {matchingPatients.map(p => (
                        <div
                          key={p.id}
                          className="search-result-item"
                          onClick={() => handleSelectPatient(p)}
                        >
                          <div className="avatar avatar-sm">{p.firstName[0]}{p.lastName[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.id} · {p.phone} · {p.bloodGroup} · {p.city}</div>
                          </div>
                          <button type="button" className="btn btn-primary btn-sm">Select</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Patient Demographics Card */}
                {selectedPatient ? (
                  <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-md">{selectedPatient.firstName[0]}{selectedPatient.lastName[0]}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{selectedPatient.id} · Mobile: {selectedPatient.phone}</div>
                        </div>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedPatient(null)}>Change</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, marginTop: 10, borderTop: '1px solid var(--border-muted)', paddingTop: 8 }}>
                      <div>Gender: <strong>{selectedPatient.gender}</strong></div>
                      <div>DOB: <strong>{selectedPatient.dateOfBirth}</strong></div>
                      <div>Blood: <strong style={{ color: 'var(--color-danger)' }}>{selectedPatient.bloodGroup}</strong></div>
                      <div style={{ gridColumn: 'span 3' }}>Address: <strong>{selectedPatient.address}, {selectedPatient.city} ({selectedPatient.pincode})</strong></div>
                    </div>

                    {selectedPatient.allergies.length > 0 && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700 }}>
                        ⚠️ Patient Allergies: {selectedPatient.allergies.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-tertiary)' }}>
                    No patient selected. Type above to search the hospital master database.
                  </div>
                )}
              </div>
            </div>

            {/* Attendant & Insurance Details Card */}
            <div className="card">
              <div className="card-header">
                <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">2. Attendant Pass & Insurance Details</span>
              </div>
              <div className="card-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Attendant Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Attendant full name"
                      value={attendantName}
                      onChange={e => setAttendantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attendant Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Mobile number"
                      value={attendantPhone}
                      onChange={e => setAttendantPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Relationship to Patient</label>
                    <select
                      className="form-select"
                      value={attendantRelation}
                      onChange={e => setAttendantRelation(e.target.value)}
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Son / Daughter</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Guardian">Guardian / Relative</option>
                      <option value="Friend">Friend / Colleague</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medico-Legal Case (MLC)?</label>
                    <select
                      className="form-select"
                      value={mlc ? 'yes' : 'no'}
                      onChange={e => setMlc(e.target.value === 'yes')}
                    >
                      <option value="no">No — Standard Medical Case</option>
                      <option value="yes">Yes — Medico-Legal Case (MLC)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Insurance Provider (TPA)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Star Health / Medi Assist"
                      value={insuranceProvider}
                      onChange={e => setInsuranceProvider(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Policy / Member ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Policy number"
                      value={policyNumber}
                      onChange={e => setPolicyNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Triage, Bed Allocation & Dates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Clinical Condition & Bed Selection */}
            <div className="card">
              <div className="card-header">
                <BedDouble size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">3. Clinical Triage & Bed Allocation</span>
              </div>
              <div className="card-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  {/* Category & Priority */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Admission Category <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={admissionType}
                        onChange={e => setAdmissionType(e.target.value as AdmissionType)}
                      >
                        {ADMISSION_TYPES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Admission Priority <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={priority}
                        onChange={e => setPriority(e.target.value as any)}
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Patient Condition */}
                  <div className="form-group">
                    <label className="form-label">Patient Clinical Condition on Admission <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={condition}
                      onChange={e => setCondition(e.target.value as any)}
                    >
                      <option value="stable">Stable — Normal vital signs</option>
                      <option value="guarded">Guarded — Unfavorable or variable signs</option>
                      <option value="serious">Serious — Severely ill, close monitoring</option>
                      <option value="critical">Critical — Vital signs unstable / ICU</option>
                    </select>
                  </div>

                  {/* Department & Doctor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Clinical Dept <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        required
                      >
                        {departments.slice(0, 10).map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Attending Doctor <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={selectedDoctorId}
                        onChange={e => setSelectedDoctorId(e.target.value)}
                        required
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bed Selector with Double Allocation Protection */}
                  <div className="form-group">
                    <label className="form-label">Select Vacant Bed <span className="required">*</span></label>
                    {availableBeds.length > 0 ? (
                      <select
                        className="form-select"
                        value={selectedBedId}
                        onChange={e => setSelectedBedId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Available Bed --</option>
                        {availableBeds.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bedNumber} — {b.ward} {b.roomNumber ? `(Room ${b.roomNumber})` : ''} ({b.type.toUpperCase()}) | ₹{b.dailyRate}/day
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ padding: '8px 12px', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                        ⚠️ No beds currently available. Please check the cleaning or discharge queue.
                      </div>
                    )}
                  </div>

                  {/* Selected Bed Quick Preview */}
                  {selectedBed && (
                    <div style={{ padding: '8px 12px', background: 'var(--color-success-muted)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--color-success)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bed: <strong>{selectedBed.bedNumber}</strong> · Ward: <strong>{selectedBed.ward}</strong></span>
                      <span>Tariff: <strong>₹{selectedBed.dailyRate}/day</strong></span>
                    </div>
                  )}

                  {/* Admission Date, Time, and Expected Discharge Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div className="form-group">
                      <label className="form-label">Adm. Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={admissionDate}
                        onChange={e => setAdmissionDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Adm. Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={admissionTime}
                        onChange={e => setAdmissionTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Exp. Discharge</label>
                      <input
                        type="date"
                        className="form-input"
                        value={expectedDischargeDate}
                        onChange={e => setExpectedDischargeDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="form-group">
                    <label className="form-label">Provisional Admitting Diagnosis <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Primary diagnosis / presenting complaint..."
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  {/* Admission Notes */}
                  <div className="form-group">
                    <label className="form-label">Clinical Notes & Protocol</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Special instructions, continuous monitoring, diet, precautions..."
                      value={admissionNotes}
                      onChange={e => setAdmissionNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', height: 44, fontSize: 15 }}
                  disabled={!selectedPatient || !selectedBedId}
                >
                  <Save size={16} /> Confirm Admission & Allocate Bed
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClear}>
                    <RotateCcw size={14} /> Clear
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveTab('dashboard')}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Admission Slip Modal */}
      {showSlipModal && createdAdmission && (
        <PrintAdmissionSlipModal
          admission={createdAdmission}
          patient={selectedPatient}
          bed={beds.find(b => b.id === createdAdmission.bedId)}
          onClose={() => {
            setShowSlipModal(false);
            setActiveTab('dashboard');
          }}
        />
      )}
    </div>
  );
}
