import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Calendar, Edit3, Eye, Filter, Download } from 'lucide-react';
import { DEMO_PATIENTS } from '../../data/seedData';
import type { Patient } from '../../types';

const BLOOD_COLORS: Record<string, string> = {
  'A+': '#FF453A', 'A-': '#FF6B35', 'B+': '#0A84FF', 'B-': '#64D2FF',
  'AB+': '#BF5AF2', 'AB-': '#FF9F0A', 'O+': '#30D158', 'O-': '#34C759',
};

function PatientCard({ patient, onView }: { patient: Patient; onView: (p: Patient) => void }) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  return (
    <div className="card" style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
      onClick={() => onView(patient)}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div className="avatar avatar-lg" style={{ background: `linear-gradient(135deg, ${BLOOD_COLORS[patient.bloodGroup] || '#0A84FF'}, #0A84FF)` }}>
          {initials}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            {patient.firstName} {patient.lastName}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
            <span className="patient-id">{patient.id}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{age} yrs · {patient.gender}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: `${BLOOD_COLORS[patient.bloodGroup] || '#0A84FF'}20`, color: BLOOD_COLORS[patient.bloodGroup] || '#0A84FF', border: `1px solid ${BLOOD_COLORS[patient.bloodGroup] || '#0A84FF'}40` }}>
              {patient.bloodGroup}
            </span>
            {patient.allergies.length > 0 && (
              <span className="badge badge-danger">⚠ {patient.allergies.length} Allergy</span>
            )}
            {patient.insurance && (
              <span className="badge badge-success">Insured</span>
            )}
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-muted)', marginTop: 12, paddingTop: 12, display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Phone size={11} /> {patient.phone}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Calendar size={11} /> Since {new Date(patient.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

function PatientDetailModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="avatar" style={{ background: `linear-gradient(135deg, ${BLOOD_COLORS[patient.bloodGroup] || '#0A84FF'}, #0A84FF)` }}>
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <div className="modal-title">{patient.firstName} {patient.lastName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className="patient-id">{patient.id}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{age} yrs · {patient.gender}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm"><Edit3 size={13} /> Edit</button>
            <button className="btn btn-primary btn-sm"><Calendar size={13} /> Book Appointment</button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="tabs">
            {['overview', 'appointments', 'lab reports', 'blood & transfusion', 'billing'].map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="form-grid form-grid-3" style={{ gap: 20 }}>
              {[
                { label: 'Date of Birth', value: new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                { label: 'Blood Group', value: patient.bloodGroup },
                { label: 'Phone', value: patient.phone },
                { label: 'Email', value: patient.email || '—' },
                { label: 'City', value: `${patient.city}, ${patient.state}` },
                { label: 'Pincode', value: patient.pincode },
                { label: 'Allergies', value: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None recorded' },
                { label: 'Emergency Contact', value: `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) — ${patient.emergencyContact.phone}` },
                { label: 'Insurance', value: patient.insurance ? `${patient.insurance.provider} · ${patient.insurance.policyNumber}` : 'Not enrolled' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'appointments' && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
              No appointments found for this patient in the demo dataset.
            </div>
          )}
          {activeTab === 'lab reports' && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
              Navigate to the Laboratory module to view this patient's lab reports.
            </div>
          )}
          {activeTab === 'blood & transfusion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Patient Blood Group Profile:</div>
                  <strong style={{ fontSize: 18, color: '#dc2626' }}>{patient.bloodGroup}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Compatible with compatible donor units per Blood Bank standard protocol</div>
                </div>
                <span className="badge badge-success">Verified ABO/Rh</span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Blood Bank Requisitions & Transfusion History
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Requisition #BR-2026-001 (Packed RBC)</strong>
                  <span className="badge badge-primary">RESERVED / READY</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Indication: Surgical transfusion support · Cross-Match: <strong>Compatible (XM-2026-001)</strong>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'billing' && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
              Navigate to Billing to view invoices for this patient.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientsModule() {
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterBlood, setFilterBlood] = useState('');

  const filtered = DEMO_PATIENTS.filter(p => {
    const q = search.toLowerCase();
    const match = !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
    const gMatch = !filterGender || p.gender === filterGender;
    const bMatch = !filterBlood || p.bloodGroup === filterBlood;
    return match && gMatch && bMatch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span><span className="breadcrumb-sep">›</span><span>Patients</span>
          </div>
          <div className="page-title">Patient Registry</div>
          <div className="page-subtitle">{DEMO_PATIENTS.length} registered patients · Search by name, ID, or phone</div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm"><Download size={13} /> Export</button>
          <button id="register-patient-btn" className="btn btn-primary" onClick={() => setShowRegister(true)}>
            <Plus size={15} /> Register Patient
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                id="patient-search"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by name, Patient ID, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 130 }} value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select className="form-select" style={{ width: 140 }} value={filterBlood} onChange={e => setFilterBlood(e.target.value)}>
              <option value="">All Blood Groups</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Users size={14} /> {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-3" style={{ gap: '14px' }}>
        {filtered.map(p => <PatientCard key={p.id} patient={p} onView={setViewPatient} />)}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={28} /></div>
          <div className="empty-state-title">No patients found</div>
          <div className="empty-state-desc">Try adjusting your search or filters</div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {viewPatient && <PatientDetailModal patient={viewPatient} onClose={() => setViewPatient(null)} />}

      {/* Register Patient Modal */}
      {showRegister && (
        <div className="modal-backdrop" onClick={() => setShowRegister(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Plus size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="modal-title">Register New Patient</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowRegister(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-3" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="First name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="Last name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="required">*</span></label>
                  <input className="form-input" type="date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender <span className="required">*</span></label>
                  <select className="form-select">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="required">*</span></label>
                  <input className="form-input" placeholder="10-digit mobile" type="tel" />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select">
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" placeholder="Full address" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" placeholder="State" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" placeholder="6-digit pincode" maxLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input className="form-input" placeholder="Comma-separated (e.g. Penicillin, Sulfa)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input className="form-input" placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" placeholder="Mobile number" type="tel" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRegister(false)}>Cancel</button>
              <button id="save-patient-btn" className="btn btn-primary" onClick={() => setShowRegister(false)}>
                <Plus size={14} /> Register Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
