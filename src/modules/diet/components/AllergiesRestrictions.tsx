import React, { useState } from 'react';
import { ShieldAlert, Plus, Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';

interface PatientAllergyItem {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  reaction: string;
  recordedBy: string;
  date: string;
}

const INITIAL_PATIENT_ALLERGIES: PatientAllergyItem[] = [
  { id: 'pa-1', patientId: 'ALN-2026-00001', patientName: 'Ananya Sharma', bedNumber: 'GW-01', allergen: 'Peanuts', severity: 'severe', reaction: 'Urticaria & Bronchospasm', recordedBy: 'Dr. Rajesh Sharma', date: '2026-08-30' },
  { id: 'pa-2', patientId: 'ALN-2026-00002', patientName: 'Vikram Patel', bedNumber: 'ICU-01', allergen: 'Shellfish / Seafood', severity: 'moderate', reaction: 'Facial Angioedema', recordedBy: 'Dr. Sarah Khan', date: '2026-08-31' },
  { id: 'pa-3', patientId: 'ALN-2026-00004', patientName: 'Karan Malhotra', bedNumber: 'GW-02', allergen: 'Cow Milk / Lactose', severity: 'moderate', reaction: 'Severe abdominal cramps', recordedBy: 'Dietitian Shalini Gupta, RD', date: '2026-09-02' },
];

export default function AllergiesRestrictions() {
  const { admissions } = useDiet();

  const [patientAllergies, setPatientAllergies] = useState<PatientAllergyItem[]>(INITIAL_PATIENT_ALLERGIES);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(activeAdmissions[0]?.id || '');
  const [allergen, setAllergen] = useState('Gluten / Wheat');
  const [severity, setSeverity] = useState<PatientAllergyItem['severity']>('moderate');
  const [reaction, setReaction] = useState('Gastrointestinal distress and skin rash');

  const filtered = patientAllergies.filter(pa => {
    const q = search.toLowerCase();
    return (
      !search ||
      pa.patientName.toLowerCase().includes(q) ||
      pa.allergen.toLowerCase().includes(q) ||
      pa.reaction.toLowerCase().includes(q)
    );
  });

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = activeAdmissions.find(a => a.id === admissionId) || activeAdmissions[0];
    if (!adm) return;

    const newAllergy: PatientAllergyItem = {
      id: `pa-${Date.now()}`,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      allergen,
      severity,
      reaction,
      recordedBy: 'Dietitian Shalini Gupta, RD',
      date: new Date().toISOString().slice(0, 10),
    };

    setPatientAllergies(prev => [newAllergy, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient Food Allergies & Dietary Restrictions Registry</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Cross-matching allergen database, severe reaction records, and automated kitchen safety alerts
            </div>
          </div>
        </div>

        <button className="btn btn-danger btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Record Food Allergy
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Patient, Allergen, Reaction..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Allergies Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & Bed</th>
                  <th>Food Allergen</th>
                  <th>Severity Level</th>
                  <th>Observed Clinical Reaction</th>
                  <th>Recorded By</th>
                  <th>Date Documented</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Bed <span className="badge badge-primary" style={{ fontSize: 10 }}>{item.bedNumber}</span> · {item.patientId}
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-danger)' }}>⚠️ {item.allergen}</strong>
                    </td>

                    <td>
                      <span className={`badge ${item.severity === 'anaphylactic' || item.severity === 'severe' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{item.reaction}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{item.recordedBy}</div>
                    </td>

                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
              <div className="modal-title">Record Patient Food Allergy</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleAddAllergy}>
              <div className="modal-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Food Allergen <span className="required">*</span></label>
                    <input type="text" className="form-input" value={allergen} onChange={e => setAllergen(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Allergy Severity Level</label>
                    <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value as any)}>
                      <option value="mild">Mild (Localized rash/itching)</option>
                      <option value="moderate">Moderate (GI distress/angioedema)</option>
                      <option value="severe">Severe (Bronchospasm/Dyspnea)</option>
                      <option value="anaphylactic">Anaphylactic (Life Threatening)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reaction Symptoms Description</label>
                    <textarea className="form-textarea" rows={2} value={reaction} onChange={e => setReaction(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <CheckCircle2 size={13} /> Save Allergy Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
