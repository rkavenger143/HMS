import React, { useState } from 'react';
import { Search, X, User, HeartPulse, Pill, ArrowRight } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

interface NursingSearchModalProps {
  onClose: () => void;
}

export default function NursingSearchModal({ onClose }: NursingSearchModalProps) {
  const { admissions, marRecords, setSelectedAdmissionId, setActiveTab } = useNursing();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedAdmissions = query.length >= 2 ? admissions.filter(a =>
    a.patientName.toLowerCase().includes(q) ||
    a.patientId.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.bedNumber.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchedMeds = query.length >= 2 ? marRecords.filter(m =>
    m.medicineName.toLowerCase().includes(q) ||
    m.patientName.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const handleSelectAdmission = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
    onClose();
  };

  const handleSelectMed = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('mar');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Nursing Quick Search</span>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              autoFocus
              className="form-input"
              placeholder="Search Inpatient Name, UHID, Bed #, or Medication..."
              style={{ paddingLeft: 36, height: 42, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Results */}
          {query.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Inpatients Section */}
              {matchedAdmissions.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Inpatients ({matchedAdmissions.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedAdmissions.map(adm => (
                      <div
                        key={adm.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectAdmission(adm.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{adm.patientName[0]}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{adm.patientName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{adm.patientId} · Bed {adm.bedNumber} ({adm.ward})</div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications Section */}
              {matchedMeds.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Scheduled Medications ({matchedMeds.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedMeds.map(med => (
                      <div
                        key={med.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectMed(med.admissionId)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Pill size={16} style={{ color: 'var(--color-primary)' }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{med.medicineName} — {med.dose}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              Patient: {med.patientName} (Bed {med.bedNumber}) · Time: {med.scheduledTime}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-primary">{med.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedAdmissions.length === 0 && matchedMeds.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching inpatients or medications found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search active inpatients, beds, and scheduled medications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
