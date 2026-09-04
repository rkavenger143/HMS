import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, CheckCircle2, PauseCircle, XCircle, Clock } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

export default function CarePlanManagement() {
  const { admissions, carePlans, saveCarePlan, updateCarePlanStatus } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Care Plan Form State
  const [patientAdmissionId, setPatientAdmissionId] = useState(admissions[0]?.id || '');
  const [problem, setProblem] = useState('');
  const [nursingDiagnosis, setNursingDiagnosis] = useState('');
  const [goal, setGoal] = useState('');
  const [intervention, setIntervention] = useState('');
  const [frequency, setFrequency] = useState('Q4H Vitals & QShift Monitoring');
  const [reviewDate, setReviewDate] = useState('2026-09-03');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredPlans = carePlans.filter(cp => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      cp.patientName.toLowerCase().includes(q) ||
      cp.problem.toLowerCase().includes(q) ||
      cp.nursingDiagnosis.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || cp.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === patientAdmissionId) || admissions[0];

    saveCarePlan({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      problem,
      nursingDiagnosis,
      goal,
      intervention,
      frequency,
      startDate: '2026-08-31',
      reviewDate,
    });

    setProblem('');
    setNursingDiagnosis('');
    setGoal('');
    setIntervention('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Care Plans & NANDA Clinical Goals</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Individualized nursing diagnoses, planned interventions, outcome goals, and review evaluations
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Create Nursing Care Plan
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Problem, Diagnosis, or Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({carePlans.length})</option>
            <option value="active">Active Plans ({carePlans.filter(c => c.status === 'active').length})</option>
            <option value="completed">Completed Plans ({carePlans.filter(c => c.status === 'completed').length})</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Care Plans Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredPlans.map(plan => (
          <div key={plan.id} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {plan.problem}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Patient: <strong>{plan.patientName}</strong> ({plan.patientId}) · Assigned: <strong>{plan.responsibleNurse}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge ${plan.status === 'active' ? 'badge-success' : plan.status === 'completed' ? 'badge-primary' : 'badge-warning'}`}>
                  {plan.status.toUpperCase()}
                </span>
                {plan.status === 'active' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateCarePlanStatus(plan.id, 'completed', 'Goals achieved successfully')}>
                    <CheckCircle2 size={12} /> Complete Goal
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, background: 'var(--bg-surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>NANDA Nursing Diagnosis</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{plan.nursingDiagnosis}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Measurable Outcome Goal</div>
                <div style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600, marginTop: 2 }}>{plan.goal}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Planned Interventions & Protocol</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{plan.intervention}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <div>Frequency: <strong>{plan.frequency}</strong> · Started: {plan.startDate}</div>
              <div>Next Clinical Review: <strong style={{ color: 'var(--color-primary)' }}>{plan.reviewDate}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Create Nursing Care Plan</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={patientAdmissionId} onChange={e => setPatientAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Problem Identified <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acute Post-Operative Pain & Mobilization Difficulty"
                      value={problem}
                      onChange={e => setProblem(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">NANDA Nursing Diagnosis <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acute pain related to surgical tissue trauma as evidenced by pain score 7/10"
                      value={nursingDiagnosis}
                      onChange={e => setNursingDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Measurable Outcome Goal <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Patient will report pain score < 3/10 within 60 minutes of analgesia"
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Planned Interventions <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Administer prescribed IV analgesia, support limb with pillows, assess pain hourly"
                      value={intervention}
                      onChange={e => setIntervention(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monitoring Frequency</label>
                    <input
                      type="text"
                      className="form-input"
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Evaluation Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={reviewDate}
                      onChange={e => setReviewDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Care Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
