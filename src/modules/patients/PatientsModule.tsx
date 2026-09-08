import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Phone, Calendar, Edit3, Eye,
  Filter, Download, Trash2, Mail, MapPin, Shield,
  HeartPulse, AlertTriangle, CheckCircle2, X, ShieldCheck, ExternalLink, FileCheck
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import type { Patient } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const BLOOD_COLORS: Record<string, string> = {
  'A+': '#ef4444', 'A-': '#f97316', 'B+': '#2563eb', 'B-': '#0284c7',
  'AB+': '#8b5cf6', 'AB-': '#d97706', 'O+': '#10b981', 'O-': '#059669',
};

function PatientCard({
  patient,
  onView,
  onEdit,
  onDelete
}: {
  patient: Patient;
  onView: (p: Patient) => void;
  onEdit: (p: Patient) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const initials = `${patient.firstName[0] || 'P'}${patient.lastName[0] || ''}`;

  return (
    <div
      className="card"
      style={{
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onClick={() => onView(patient)}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            className="avatar avatar-lg"
            style={{
              background: `linear-gradient(135deg, ${BLOOD_COLORS[patient.bloodGroup] || '#2563eb'}, #1e40af)`,
              color: 'white',
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {patient.firstName} {patient.lastName}
              </div>
              <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-icon btn-icon-sm"
                  title="Edit Patient"
                  onClick={() => onEdit(patient)}
                >
                  <Edit3 size={13} style={{ color: '#2563eb' }} />
                </button>
                <button
                  className="btn btn-ghost btn-icon btn-icon-sm"
                  title="Delete Patient"
                  onClick={() => onDelete(patient.id, `${patient.firstName} ${patient.lastName}`)}
                >
                  <Trash2 size={13} style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <span className="patient-id" style={{ background: '#eff6ff', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                {patient.id}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {isNaN(age) ? '—' : `${age} yrs`} · {patient.gender}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span
                className="badge"
                style={{
                  background: `${BLOOD_COLORS[patient.bloodGroup] || '#2563eb'}18`,
                  color: BLOOD_COLORS[patient.bloodGroup] || '#2563eb',
                  border: `1px solid ${BLOOD_COLORS[patient.bloodGroup] || '#2563eb'}35`,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {patient.bloodGroup}
              </span>
              {patient.allergies && patient.allergies.length > 0 && (
                <span className="badge badge-danger" style={{ fontSize: 10 }}>
                  ⚠ {patient.allergies.length} Allergy
                </span>
              )}
              {patient.insurance && (
                <span className="badge badge-success" style={{ fontSize: 10 }}>
                  Insured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-default)', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Phone size={11} style={{ color: '#2563eb' }} /> {patient.phone}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)' }}>
          <Calendar size={11} /> {patient.city || 'Hospital Record'}
        </div>
      </div>
    </div>
  );
}

function PatientDetailModal({
  patient,
  onClose,
  onBookApt,
  onEdit
}: {
  patient: Patient;
  onClose: () => void;
  onBookApt: (p: Patient) => void;
  onEdit: (p: Patient) => void;
}) {
  const navigate = useNavigate();
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div
            className="avatar"
            style={{
              background: `linear-gradient(135deg, ${BLOOD_COLORS[patient.bloodGroup] || '#2563eb'}, #1e40af)`,
              color: 'white',
              fontWeight: 700,
            }}
          >
            {patient.firstName[0] || 'P'}{patient.lastName[0] || ''}
          </div>
          <div>
            <div className="modal-title">{patient.firstName} {patient.lastName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className="patient-id" style={{ background: '#eff6ff', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                {patient.id}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{isNaN(age) ? '—' : `${age} yrs`} · {patient.gender}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(patient)}>
              <Edit3 size={13} /> Edit Record
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onBookApt(patient)}>
              <Calendar size={13} /> Book Appointment
            </button>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)', background: '#f8fafc' }}>
          <div className="tabs">
            {['overview', 'clinical history', 'insurance', 'emergency contact'].map(tab => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="form-grid form-grid-3" style={{ gap: 20 }}>
              {[
                { label: 'Date of Birth', value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Blood Group', value: patient.bloodGroup || '—' },
                { label: 'Primary Mobile', value: patient.phone || '—' },
                { label: 'Email Address', value: patient.email || '—' },
                { label: 'City / State', value: `${patient.city || '—'}, ${patient.state || '—'}` },
                { label: 'Postal Pincode', value: patient.pincode || '—' },
                { label: 'Allergies', value: patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None recorded (NKDA)' },
                { label: 'Clinical Notes', value: patient.notes || 'None recorded' },
                { label: 'Registration Date', value: patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('en-IN') : 'Active' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clinical history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Standard Outpatient Record</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Patient is active in hospital clinical registers. No critical adverse events flagged.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (() => {
            const patientPolicies = storageService.getPatientPolicies().filter(p => p.patientId === patient.id);
            const patientPreAuths = storageService.getPreAuthRequests().filter(p => p.patientId === patient.id);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={18} color="#2563eb" /> Empanelled Insurance Policies ({patientPolicies.length})
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onClose();
                        navigate('/insurance');
                      }}
                    >
                      <ExternalLink size={12} /> Manage in Insurance Center
                    </button>
                  </div>

                  {patientPolicies.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {patientPolicies.map(pol => (
                        <div key={pol.id} style={{ padding: '12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#1e40af', fontSize: 14 }}>{pol.providerName}</strong>
                            <span className={`badge ${pol.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                              {pol.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8, fontSize: 12 }}>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Policy #:</span> <strong>{pol.policyNumber}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Member ID:</span> <strong>{pol.memberId}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Plan:</span> <span>{pol.planName}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Sum Insured:</span> <strong>₹{pol.sumInsured.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Remaining:</span> <strong style={{ color: '#059669' }}>₹{pol.remainingCoverage.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Co-Pay:</span> <span>{pol.coPayPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      {patient.insurance ? `${patient.insurance.provider} (Policy #${patient.insurance.policyNumber})` : 'Self-Pay / Non-insured patient chart.'}
                    </div>
                  )}
                </div>

                {patientPreAuths.length > 0 && (
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                      Linked Pre-Authorization Authorizations ({patientPreAuths.length})
                    </div>
                    {patientPreAuths.map(pa => (
                      <div key={pa.id} style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: 6, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                          <span style={{ color: '#1e40af' }}>{pa.requestNumber} — {pa.diagnosis}</span>
                          <span className={`badge ${pa.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{pa.status.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: 4 }}>
                          <span>Requested: ₹{pa.requestedAmount.toLocaleString()}</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>Approved: ₹{pa.approvedAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'emergency contact' && (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>
                Designated Next-of-Kin Emergency Contact
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                Name: <strong>{patient.emergencyContact?.name || 'Guardian'}</strong> ({patient.emergencyContact?.relationship || 'Relative'})
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                Emergency Phone: <strong>{patient.emergencyContact?.phone || patient.phone}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientsModule() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>(() => storageService.getPatients());
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [filterGender, setFilterGender] = useState('');
  const [filterBlood, setFilterBlood] = useState('');

  // Register / Edit Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    phone: '',
    email: '',
    bloodGroup: 'B+',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    allergies: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setPatients(storageService.getPatients());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  const handleOpenRegister = () => {
    setEditingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phone: '',
      email: '',
      bloodGroup: 'B+',
      address: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      allergies: '',
      emergencyName: '',
      emergencyPhone: '',
    });
    setShowRegister(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setFormData({
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      phone: p.phone,
      email: p.email || '',
      bloodGroup: p.bloodGroup,
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      pincode: p.pincode || '',
      allergies: p.allergies ? p.allergies.join(', ') : '',
      emergencyName: p.emergencyContact?.name || '',
      emergencyPhone: p.emergencyContact?.phone || '',
    });
    setShowRegister(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      showToast('Please fill in required fields (Name and Mobile)', 'warning');
      return;
    }

    const payload: Partial<Patient> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as any,
      phone: formData.phone,
      email: formData.email,
      bloodGroup: (formData.bloodGroup as any) || 'B+',
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      emergencyContact: {
        name: formData.emergencyName || 'Relative',
        relationship: 'Family',
        phone: formData.emergencyPhone || formData.phone,
      },
    };

    if (editingPatient) {
      storageService.updatePatient(editingPatient.id, payload);
      showToast(`Patient record for ${formData.firstName} updated`, 'success');
      if (viewPatient && viewPatient.id === editingPatient.id) {
        setViewPatient({ ...viewPatient, ...payload } as Patient);
      }
    } else {
      const created = storageService.addPatient(payload);
      showToast(`New patient ${created.firstName} registered (MRN: ${created.id})`, 'success');
    }

    setShowRegister(false);
  };

  const handleDeletePatient = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove patient record for ${name} (${id})?`)) {
      storageService.deletePatient(id);
      showToast(`Patient record ${name} removed`, 'info');
      if (viewPatient && viewPatient.id === id) {
        setViewPatient(null);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Gender', 'Blood Group', 'Phone', 'City', 'Registration Date'];
    const rows = patients.map(p => [
      p.id,
      `"${p.firstName}"`,
      `"${p.lastName}"`,
      p.gender,
      p.bloodGroup,
      p.phone,
      `"${p.city || ''}"`,
      p.registrationDate || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Patients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported patient registry to CSV', 'success');
  };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const match = !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
    const gMatch = !filterGender || p.gender === filterGender;
    const bMatch = !filterBlood || p.bloodGroup === filterBlood;
    return match && gMatch && bMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span><span className="breadcrumb-sep">›</span><span>Patient Management</span>
          </div>
          <div className="page-title">Enterprise Patient Registry & MPI</div>
          <div className="page-subtitle">
            {patients.length} active registered patient charts · Full search, demographic registration, and clinical profile linkage
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button id="register-patient-btn" className="btn btn-primary" onClick={handleOpenRegister}>
            <Plus size={15} /> Register Patient
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                id="patient-search"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by name, MRN / Patient ID, mobile..."
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
            <select className="form-select" style={{ width: 150 }} value={filterBlood} onChange={e => setFilterBlood(e.target.value)}>
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Users size={14} style={{ color: '#2563eb' }} /> {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-3" style={{ gap: '14px' }}>
        {filtered.map(p => (
          <PatientCard
            key={p.id}
            patient={p}
            onView={setViewPatient}
            onEdit={handleOpenEdit}
            onDelete={handleDeletePatient}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={32} /></div>
          <div className="empty-state-title">No matching patient charts</div>
          <div className="empty-state-desc">Try modifying your query or click Register Patient to create a new chart</div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {viewPatient && (
        <PatientDetailModal
          patient={viewPatient}
          onClose={() => setViewPatient(null)}
          onBookApt={(p) => {
            setViewPatient(null);
            navigate('/opd');
          }}
          onEdit={(p) => {
            setViewPatient(null);
            handleOpenEdit(p);
          }}
        />
      )}

      {/* Register / Edit Patient Modal */}
      {showRegister && (
        <div className="modal-backdrop" onClick={() => setShowRegister(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {editingPatient ? <Edit3 size={18} style={{ color: '#2563eb' }} /> : <Plus size={18} style={{ color: '#2563eb' }} />}
              <span className="modal-title">
                {editingPatient ? `Edit Patient Chart (${editingPatient.id})` : 'Register New Hospital Patient'}
              </span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowRegister(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="modal-body">
                <div className="form-grid form-grid-3" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">First Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-input"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth <span className="required">*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="10-digit mobile"
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Residential Address</label>
                    <input
                      className="form-input"
                      placeholder="Street address, apartment, locality"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      className="form-input"
                      placeholder="City"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      className="form-input"
                      placeholder="State"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      className="form-input"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Known Allergies (Optional)</label>
                    <input
                      className="form-input"
                      placeholder="Comma-separated (e.g. Penicillin, Sulfa, Peanuts)"
                      value={formData.allergies}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      className="form-input"
                      placeholder="Next of Kin / Relative"
                      value={formData.emergencyName}
                      onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      className="form-input"
                      placeholder="Emergency contact mobile"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegister(false)}>
                  Cancel
                </button>
                <button type="submit" id="save-patient-btn" className="btn btn-primary">
                  {editingPatient ? <Edit3 size={14} /> : <Plus size={14} />}
                  {editingPatient ? 'Save Modifications' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
