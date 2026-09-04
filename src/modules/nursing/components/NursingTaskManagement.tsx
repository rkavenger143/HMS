import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle, Filter, Search } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { IPDNursingTask } from '../../../types';

export default function NursingTaskManagement() {
  const { admissions, nursingTasks, createNursingTask, updateTaskStatus } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<IPDNursingTask['taskType']>('medication_due');
  const [dueTime, setDueTime] = useState('14:00');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [description, setDescription] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredTasks = nursingTasks.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      t.patientName.toLowerCase().includes(q) ||
      t.bedNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    createNursingTask({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      title,
      taskType,
      dueTime,
      priority,
      description,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-warning-muted)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Shift Tasks & Care Board</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Scheduled procedures, injections, wound dressings, fluid charting, and urgent clinical tasks
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Add Care Task
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Task, Patient, or Bed..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({nursingTasks.length})</option>
            <option value="pending">Pending Tasks ({nursingTasks.filter(t => t.status === 'pending').length})</option>
            <option value="completed">Completed Tasks ({nursingTasks.filter(t => t.status === 'completed').length})</option>
          </select>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT / Immediate</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isUrgent = task.priority === 'urgent' || task.priority === 'stat';

            return (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  borderLeft: `4px solid ${isCompleted ? 'var(--color-success)' : isUrgent ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                  opacity: isCompleted ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                  <button
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    style={{ marginTop: 2, color: isCompleted ? 'var(--color-success)' : 'var(--text-tertiary)' }}
                    onClick={() => updateTaskStatus(task.id, isCompleted ? 'pending' : 'completed')}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span>Patient: <strong>{task.patientName}</strong> (Bed {task.bedNumber})</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />Due: <strong>{task.dueTime}</strong></span>
                      <span>Assigned: <strong>{task.assignedNurse}</strong></span>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${task.priority === 'stat' ? 'badge-danger' : task.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${isCompleted ? 'badge-success' : 'badge-primary'}`}>
                    {task.status.toUpperCase()}
                  </span>
                  {!isCompleted && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateTaskStatus(task.id, 'completed')}>
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <ClipboardList size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Nursing Tasks Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>All scheduled nursing care tasks are cleared.</div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Schedule Inpatient Care Task</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Task Title / Care Item <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Change IV Cannula & Flush Line"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Task Category</label>
                    <select className="form-select" value={taskType} onChange={e => setTaskType(e.target.value as any)}>
                      <option value="medication_due">Medication Administration</option>
                      <option value="vitals_due">Record Vitals</option>
                      <option value="lab_sample">Sample Collection</option>
                      <option value="doctor_round">Doctor Order Followup</option>
                      <option value="discharge_clearance">Discharge Preparation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority <span className="required">*</span></label>
                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT / Immediate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks / Instructions</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Use 20G cannula in right forearm, aseptic dressing"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
