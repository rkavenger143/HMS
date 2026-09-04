import React, { useState } from 'react';
import {
  Activity, CheckCircle2, Clock, Plus, AlertTriangle, ShieldCheck,
  Sparkles, FileText, User, HeartPulse, Droplets
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { IPDNursingTask, IPDNursingNote, Admission } from '../../../types';
import RecordNursingVitalsModal from './modals/RecordNursingVitalsModal';

export default function NursingManagement() {
  const {
    nursingTasks,
    completeNursingTask,
    createNursingTask,
    nursingNotes,
    recordNursingNote,
    admissions,
    beds,
  } = useIPD();

  const [activeTab, setActiveTab] = useState<'tasks' | 'intake_output' | 'handover'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Task Creation State
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskAdmissionId, setTaskAdmissionId] = useState(admissions[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<IPDNursingTask['taskType']>('medication_due');
  const [taskPriority, setTaskPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [taskDueTime, setTaskDueTime] = useState('14:00');

  // Handover Note State
  const [handoverAdmissionId, setHandoverAdmissionId] = useState(admissions[0]?.id || '');
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [observations, setObservations] = useState('');
  const [intakeOral, setIntakeOral] = useState('500');
  const [intakeIV, setIntakeIV] = useState('1000');
  const [outputUrine, setOutputUrine] = useState('1200');
  const [outputDrain, setOutputDrain] = useState('0');

  // Vitals Modal
  const [vitalsAdmission, setVitalsAdmission] = useState<Admission | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredTasks = nursingTasks.filter(t => {
    if (taskFilter === 'all') return true;
    return t.status === taskFilter;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const adm = admissions.find(a => a.id === taskAdmissionId);

    createNursingTask({
      admissionId: taskAdmissionId,
      patientId: adm?.patientId,
      patientName: adm?.patientName,
      bedNumber: adm?.bedNumber,
      taskType,
      title: taskTitle,
      dueTime: taskDueTime,
      priority: taskPriority,
    });

    setTaskTitle('');
    setShowNewTask(false);
  };

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observations) return;

    const adm = admissions.find(a => a.id === handoverAdmissionId);

    recordNursingNote({
      admissionId: handoverAdmissionId,
      patientId: adm?.patientId,
      patientName: adm?.patientName,
      shift,
      observations,
      intakeOral: parseInt(intakeOral, 10) || 0,
      intakeIV: parseInt(intakeIV, 10) || 0,
      outputUrine: parseInt(outputUrine, 10) || 0,
      outputDrain: parseInt(outputDrain, 10) || 0,
    });

    setObservations('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Station & Care Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Inpatient shift roster, medication schedules, intake/output charts, and shift handover
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewTask(!showNewTask)}>
            <Plus size={13} /> {showNewTask ? 'Close Form' : 'New Nursing Task'}
          </button>
        </div>
      </div>

      {/* New Task Inline Drawer */}
      {showNewTask && (
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--color-primary)' }}>
            Create New Inpatient Nursing Order / Task
          </div>
          <form onSubmit={handleCreateTask}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Inpatient <span className="required">*</span></label>
                <select className="form-select" value={taskAdmissionId} onChange={e => setTaskAdmissionId(e.target.value)}>
                  {activeAdmissions.map(a => (
                    <option key={a.id} value={a.id}>{a.patientName} (Bed {a.bedNumber} - {a.ward})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Task Category</label>
                <select className="form-select" value={taskType} onChange={e => setTaskType(e.target.value as any)}>
                  <option value="medication_due">Medication Administration</option>
                  <option value="vitals_due">Vitals & SpO2 Monitoring</option>
                  <option value="investigation_pending">Lab Sample Collection</option>
                  <option value="procedure_pending">Dressing / Bedside Care</option>
                  <option value="care_instruction">Special Nursing Care</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Time</label>
                <input type="time" className="form-input" value={taskDueTime} onChange={e => setTaskDueTime(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT / Immediate</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Task Description <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Administer Inj. Ceftriaxone 1g IV in 100ml NS"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewTask(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Add to Shift Roster</button>
            </div>
          </form>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <Clock size={13} /> Active Nursing Task Roster ({nursingTasks.filter(t => t.status === 'pending').length} Pending)
        </button>
        <button className={`tab ${activeTab === 'intake_output' ? 'active' : ''}`} onClick={() => setActiveTab('intake_output')}>
          <Droplets size={13} /> Fluid Intake & Output Chart
        </button>
        <button className={`tab ${activeTab === 'handover' ? 'active' : ''}`} onClick={() => setActiveTab('handover')}>
          <FileText size={13} /> Shift Handover Notes ({nursingNotes.length})
        </button>
      </div>

      {/* TAB 1: NURSING TASKS ROSTER */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn btn-sm ${taskFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTaskFilter('pending')}>
                Pending ({nursingTasks.filter(t => t.status === 'pending').length})
              </button>
              <button className={`btn btn-sm ${taskFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTaskFilter('completed')}>
                Completed ({nursingTasks.filter(t => t.status === 'completed').length})
              </button>
              <button className={`btn btn-sm ${taskFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTaskFilter('all')}>
                All Tasks ({nursingTasks.length})
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Due Time</th>
                    <th>Patient & Bed</th>
                    <th>Task Description</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{task.dueTime}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{task.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {task.bedNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {task.taskType.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${task.priority === 'stat' ? 'badge-danger' : task.priority === 'urgent' ? 'badge-warning' : 'badge-primary'}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${task.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {task.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {task.status === 'pending' ? (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => completeNursingTask(task.id)}
                            >
                              <CheckCircle2 size={12} /> Complete
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>✓ Done</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><CheckCircle2 size={28} /></div>
                          <div className="empty-state-title">No Nursing Tasks in Queue</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTAKE & OUTPUT CHART */}
      {activeTab === 'intake_output' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
          {/* Quick Record Intake/Output */}
          <div className="card">
            <div className="card-header">
              <Droplets size={16} style={{ color: 'var(--color-info)' }} />
              <span className="card-title">Chart Fluid Intake & Output (24h)</span>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveHandover}>
                <div className="form-grid" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={handoverAdmissionId} onChange={e => setHandoverAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} (Bed {a.bedNumber} - {a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning Shift (07:00 - 15:00)</option>
                      <option value="evening">Evening Shift (15:00 - 23:00)</option>
                      <option value="night">Night Shift (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Oral Intake (ml)</label>
                      <input type="number" className="form-input" value={intakeOral} onChange={e => setIntakeOral(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IV Fluid Intake (ml)</label>
                      <input type="number" className="form-input" value={intakeIV} onChange={e => setIntakeIV(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Urine Output (ml)</label>
                      <input type="number" className="form-input" value={outputUrine} onChange={e => setOutputUrine(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Drain / Ryle's Tube (ml)</label>
                      <input type="number" className="form-input" value={outputDrain} onChange={e => setOutputDrain(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nurse Observation & Notes <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Patient hydrated, IV cannula patent, urine clear yellow..."
                      value={observations}
                      onChange={e => setObservations(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    Save Fluid Balance Record
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Intake/Output History Log */}
          <div className="card">
            <div className="card-header">
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Recent Inpatient Fluid Balance Logs</span>
            </div>
            <div className="card-body">
              {nursingNotes.length > 0 ? (
                nursingNotes.map(n => {
                  const totalIn = (n.intakeOral || 0) + (n.intakeIV || 0);
                  const totalOut = (n.outputUrine || 0) + (n.outputDrain || 0);
                  const balance = totalIn - totalOut;

                  return (
                    <div key={n.id} style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 10, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{n.patientName}</span>
                        <span className="badge badge-primary">{n.shift.toUpperCase()} SHIFT</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8, background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 4 }}>
                        <div>In: <strong style={{ color: 'var(--color-info)' }}>{totalIn} ml</strong></div>
                        <div>Out: <strong style={{ color: 'var(--color-warning)' }}>{totalOut} ml</strong></div>
                        <div>Bal: <strong style={{ color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{balance > 0 ? `+${balance}` : balance} ml</strong></div>
                      </div>
                      <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>{n.observations}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>Logged by {n.nurseName} · {n.noteDate}</div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><Droplets size={28} /></div>
                  <div className="empty-state-title">No Fluid Balance Entries</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT HANDOVER NOTES */}
      {activeTab === 'handover' && (
        <div className="card">
          <div className="card-header">
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Shift Handover & Nurse Clinical Notes</span>
          </div>
          <div className="card-body">
            {nursingNotes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nursingNotes.map(note => (
                  <div key={note.id} style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{note.patientName} · Shift: {note.shift.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{note.noteDate} at {note.noteTime}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{note.observations}</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>Duty Nurse: {note.nurseName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={28} /></div>
                <div className="empty-state-title">No Shift Handover Notes</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vitals Modal */}
      {vitalsAdmission && (
        <RecordNursingVitalsModal
          admission={vitalsAdmission}
          onClose={() => setVitalsAdmission(null)}
        />
      )}
    </div>
  );
}
