import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, CheckCircle2, User, BookOpen } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { PatientEducationRecord } from '../../../types';

export default function PatientEducation() {
  const { admissions, patientEducationLogs, recordPatientEducation } = useNursing();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [topic, setTopic] = useState<PatientEducationRecord['topic']>('medication');
  const [educationDetails, setEducationDetails] = useState('');
  const [understandingLevel, setUnderstandingLevel] = useState<PatientEducationRecord['understandingLevel']>('good');
  const [caregiverPresent, setCaregiverPresent] = useState('Spouse / Son');
  const [remarks, setRemarks] = useState('Patient repeated instructions accurately.');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredLogs = patientEducationLogs.filter(l => {
    const q = search.toLowerCase();
    return !search || l.patientName.toLowerCase().includes(q) || l.topic.toLowerCase().includes(q) || l.educationDetails.toLowerCase().includes(q);
  });

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    recordPatientEducation({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      topic,
      educationDetails,
      understandingLevel,
      caregiverPresent,
      remarks,
    });

    setEducationDetails('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient & Family Health Education Logs</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Medication compliance counseling, post-discharge wound care, diet instructions, and fall prevention teaching
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Log Patient Education
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Topic or Patient..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Education Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div key={log.id} className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {log.patientName} — <span style={{ color: 'var(--color-primary)' }}>Topic: {log.topic.toUpperCase().replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Taught by <strong>{log.nurseName}</strong> on {log.date} at {log.time} · Caregiver Present: <strong>{log.caregiverPresent}</strong>
                  </div>
                </div>

                <span className="badge badge-success">
                  Understanding: {log.understandingLevel.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: 13, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                {log.educationDetails}
              </div>

              {log.remarks && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                  <strong>Caregiver Feedback:</strong> {log.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <BookOpen size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Patient Education Logs Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Click "Log Patient Education" to record a health teaching session.</div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Log Patient & Family Education</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEducation}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Education Topic <span className="required">*</span></label>
                    <select className="form-select" value={topic} onChange={e => setTopic(e.target.value as any)}>
                      <option value="medication">Medication Instructions</option>
                      <option value="diet">Diet & Nutrition</option>
                      <option value="wound_care">Wound Care & Dressing</option>
                      <option value="follow_up">Follow-up & Emergency Warning Signs</option>
                      <option value="mobility">Mobility & Fall Prevention</option>
                      <option value="hygiene">Personal Hygiene</option>
                      <option value="home_care">Home Care Rehabilitation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comprehension Level</label>
                    <select className="form-select" value={understandingLevel} onChange={e => setUnderstandingLevel(e.target.value as any)}>
                      <option value="good">Good / Clear Understanding</option>
                      <option value="moderate">Moderate / Requires Pamphlet</option>
                      <option value="needs_reinforcement">Needs Reinforcement</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Education Instructions Provided <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Instructed patient on low-salt cardiac diet, timing of aspirin and statin doses, and taking pulse before beta-blockers."
                      value={educationDetails}
                      onChange={e => setEducationDetails(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Family / Caregiver Present</label>
                    <input type="text" className="form-input" value={caregiverPresent} onChange={e => setCaregiverPresent(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient / Family Response</label>
                    <input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Education Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
