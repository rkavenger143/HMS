import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  PlayCircle,
  RotateCcw,
  UserCheck,
  Activity,
  Pill,
  Eye,
  Scissors,
  CheckCircle,
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { IPDNursingTask } from '../../../types';

export default function NursingTaskManagement() {
  const { admissions, nursingTasks, nurses, createNursingTask, updateTaskStatus } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<IPDNursingTask['taskType']>('vitals_due');
  const [dueTime, setDueTime] = useState('14:00');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [assignedNurse, setAssignedNurse] = useState(nurses[0]?.name || 'Nurse Preethi Mathew');
  const [description, setDescription] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const getCategoryLabel = (type: IPDNursingTask['taskType']) => {
    switch (type) {
      case 'vitals_due':
        return { label: 'Vital Checks', icon: Activity, color: 'var(--color-info)', bg: 'var(--color-info-muted)' };
      case 'medication_due':
        return { label: 'Medication', icon: Pill, color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' };
      case 'patient_monitoring':
        return { label: 'Patient Monitoring', icon: Eye, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
      case 'dressing_changes':
        return { label: 'Dressing Changes', icon: Scissors, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
      default:
        return { label: 'Other Care', icon: ClipboardList, color: 'var(--text-secondary)', bg: 'var(--bg-surface)' };
    }
  };

  const pendingCount = nursingTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = nursingTasks.filter(t => t.status === 'in_progress').length;
  const completedCount = nursingTasks.filter(t => t.status === 'completed').length;

  const filteredTasks = nursingTasks.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      t.patientName.toLowerCase().includes(q) ||
      t.bedNumber.toLowerCase().includes(q) ||
      (t.assignedNurse && t.assignedNurse.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || t.taskType === selectedCategory;
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    createNursingTask({
      admissionId: adm ? adm.id : 'adm-001',
      patientId: adm ? adm.patientId : 'p-001',
      patientName: adm ? adm.patientName : 'Inpatient',
      bedNumber: adm ? adm.bedNumber : 'General',
      title,
      taskType,
      dueTime,
      priority,
      assignedNurse,
      description,
      status: 'pending',
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Nursing Tasks & Bedside Procedures</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Scheduled care tasks, vital checks, medication rounds, dressing changes, and patient monitoring
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Add Nursing Task
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div
          className="card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: selectedStatus === 'ALL' ? 'var(--color-primary)' : 'var(--border-color)',
          }}
          onClick={() => setSelectedStatus('ALL')}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL TASKS</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{nursingTasks.length}</div>
          </div>
          <ClipboardList size={20} style={{ color: 'var(--color-primary)' }} />
        </div>

        <div
          className="card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: selectedStatus === 'pending' ? 'var(--color-warning)' : 'var(--border-color)',
          }}
          onClick={() => setSelectedStatus('pending')}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-warning)', fontWeight: 600 }}>PENDING</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning)' }}>{pendingCount}</div>
          </div>
          <Clock size={20} style={{ color: 'var(--color-warning)' }} />
        </div>

        <div
          className="card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: selectedStatus === 'in_progress' ? 'var(--color-info)' : 'var(--border-color)',
          }}
          onClick={() => setSelectedStatus('in_progress')}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-info)', fontWeight: 600 }}>IN PROGRESS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-info)' }}>{inProgressCount}</div>
          </div>
          <PlayCircle size={20} style={{ color: 'var(--color-info)' }} />
        </div>

        <div
          className="card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderColor: selectedStatus === 'completed' ? 'var(--color-success)' : 'var(--border-color)',
          }}
          onClick={() => setSelectedStatus('completed')}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>COMPLETED</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)' }}>{completedCount}</div>
          </div>
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Task, Patient, Bed, or Nurse..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({nursingTasks.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="in_progress">In Progress ({inProgressCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>

          <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="vitals_due">Vital Checks</option>
            <option value="medication_due">Medication</option>
            <option value="patient_monitoring">Patient Monitoring</option>
            <option value="dressing_changes">Dressing Changes</option>
            <option value="other">Other</option>
          </select>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT / Critical</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isUrgent = task.priority === 'urgent' || task.priority === 'stat';
            const cat = getCategoryLabel(task.taskType);
            const CatIcon = cat.icon;

            const borderCol = isCompleted
              ? 'var(--color-success)'
              : isInProgress
              ? 'var(--color-info)'
              : isUrgent
              ? 'var(--color-danger)'
              : 'var(--color-primary)';

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
                  borderLeft: `4px solid ${borderCol}`,
                  opacity: isCompleted ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 280 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <CatIcon size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: cat.bg,
                          color: cat.color,
                        }}
                      >
                        {cat.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>Patient: <strong>{task.patientName}</strong> (Bed {task.bedNumber})</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />Due: <strong>{task.dueTime}</strong></span>
                      {task.assignedNurse && (
                        <span><UserCheck size={11} style={{ display: 'inline', marginRight: 3 }} />Assigned: <strong>{task.assignedNurse}</strong></span>
                      )}
                    </div>

                    {task.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`badge ${task.priority === 'stat' ? 'badge-danger' : task.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {task.priority === 'stat' ? 'STAT' : task.priority.toUpperCase()}
                  </span>

                  <span className={`badge ${isCompleted ? 'badge-success' : isInProgress ? 'badge-info' : 'badge-warning'}`}>
                    {task.status === 'in_progress' ? 'IN PROGRESS' : task.status.toUpperCase()}
                  </span>

                  {/* Quick Status Transition Actions */}
                  {task.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-info)' }}
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        title="Start Task"
                      >
                        <PlayCircle size={13} /> Start
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        title="Mark Complete"
                      >
                        <CheckCircle size={13} /> Done
                      </button>
                    </>
                  )}

                  {task.status === 'in_progress' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      title="Complete Task"
                    >
                      <CheckCircle size={13} /> Complete
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateTaskStatus(task.id, 'pending')}
                      title="Reopen Task"
                      style={{ fontSize: 11 }}
                    >
                      <RotateCcw size={12} /> Reopen
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
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              All scheduled care tasks for this view have been attended to.
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Schedule Nursing Care Task</div>
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
                      placeholder="e.g. Check vital signs & Blood Sugar (Q4H)"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Task Category <span className="required">*</span></label>
                    <select className="form-select" value={taskType} onChange={e => setTaskType(e.target.value as any)}>
                      <option value="vitals_due">Vital Checks</option>
                      <option value="medication_due">Medication</option>
                      <option value="patient_monitoring">Patient Monitoring</option>
                      <option value="dressing_changes">Dressing Changes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level <span className="required">*</span></label>
                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT / Immediate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheduled Due Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Nurse</label>
                    <select className="form-select" value={assignedNurse} onChange={e => setAssignedNurse(e.target.value)}>
                      {nurses.map(n => (
                        <option key={n.id} value={n.name}>{n.name} ({n.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks / Instructions</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Record pre-meal reading, notify duty MO if systolic BP > 150"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Care Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
