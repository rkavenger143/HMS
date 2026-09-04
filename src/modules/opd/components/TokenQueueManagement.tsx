import React, { useState } from 'react';
import {
  Clock, Play, Pause, SkipForward, CheckCircle2, RotateCcw,
  Volume2, VolumeX, Stethoscope, Filter, AlertTriangle, ShieldCheck,
  User, ArrowRight, Activity, Eye, ChevronRight
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDVisit, OPDVisitStatus, OPDQueuePriority } from '../../../types';
import VitalEntryModal from './modals/VitalEntryModal';

const PRIORITY_BADGES: Record<OPDQueuePriority, { label: string; color: string; bg: string }> = {
  normal: { label: 'Normal', color: 'var(--text-secondary)', bg: 'var(--bg-surface)' },
  priority: { label: 'Priority', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  senior: { label: 'Senior Citizen', color: 'var(--color-ai)', bg: 'var(--color-ai-muted)' },
  emergency: { label: '🚨 Emergency', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
};

export default function TokenQueueManagement() {
  const {
    visits,
    doctors,
    departments,
    currentToken,
    audioEnabled,
    setAudioEnabled,
    callToken,
    callNextInQueue,
    holdVisit,
    skipVisit,
    updateVisitStatus,
    startConsultationForVisit,
    updateVisitVitals,
  } = useOPD();

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [vitalsModalVisit, setVitalsModalVisit] = useState<OPDVisit | null>(null);

  const today = '2026-08-31';

  // Filter visits for today
  const todayVisits = visits.filter(v => {
    const matchDate = v.visitDate === today;
    const matchDoc = !selectedDoctorId || v.doctorId === selectedDoctorId;
    const matchDept = !selectedDept || v.department === selectedDept;
    return matchDate && matchDoc && matchDept;
  });

  // Sort queue: emergency first, then senior, then priority, then normal, by token
  const priorityWeight: Record<OPDQueuePriority, number> = { emergency: 4, senior: 3, priority: 2, normal: 1 };

  const waitingQueue = [...todayVisits.filter(v => v.status === 'waiting' || v.status === 'on_hold')].sort((a, b) => {
    if (a.status === 'on_hold' && b.status !== 'on_hold') return 1;
    if (b.status === 'on_hold' && a.status !== 'on_hold') return -1;
    return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1) || a.tokenNumber - b.tokenNumber;
  });

  const calledVisits = todayVisits.filter(v => v.status === 'called');
  const activeConsultation = todayVisits.find(v => v.status === 'in_consultation' || v.tokenNumber === currentToken);
  const completedVisits = todayVisits.filter(v => v.status === 'completed');

  const nextWaitingToken = waitingQueue.length > 0 ? waitingQueue[0].tokenNumber : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Live Queue Display Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(0, 212, 170, 0.08))',
          border: '1px solid var(--color-primary-border)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* Big Live Token Metrics */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Current Token */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Current Calling Token
              </div>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  letterSpacing: -2,
                  lineHeight: 1.1,
                }}
              >
                #{currentToken}
              </div>
              {activeConsultation && (
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>
                  {activeConsultation.patientName} <span style={{ color: 'var(--text-tertiary)' }}>({activeConsultation.department})</span>
                </div>
              )}
            </div>

            <div style={{ width: 1, height: 60, background: 'var(--border-default)' }} />

            {/* Next Token */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Next in Queue
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: nextWaitingToken ? 'var(--color-warning)' : 'var(--text-tertiary)',
                  letterSpacing: -1,
                  lineHeight: 1.1,
                  marginTop: 6,
                }}
              >
                {nextWaitingToken ? `#${nextWaitingToken}` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {waitingQueue.length > 0 ? `${waitingQueue[0].patientName}` : 'No patients waiting'}
              </div>
            </div>

            <div style={{ width: 1, height: 60, background: 'var(--border-default)' }} />

            {/* Patients Waiting */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Patients Waiting
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: -1,
                  lineHeight: 1.1,
                  marginTop: 6,
                }}
              >
                {waitingQueue.length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600, marginTop: 2 }}>
                ● Queue Active
              </div>
            </div>
          </div>

          {/* Quick Queue Calling Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
                title={audioEnabled ? 'Chime sound enabled' : 'Chime muted'}
              >
                {audioEnabled ? <Volume2 size={14} style={{ color: 'var(--color-success)' }} /> : <VolumeX size={14} />}
                <span>{audioEnabled ? 'Chime ON' : 'Chime Muted'}</span>
              </button>

              <button
                className="btn btn-primary"
                style={{ height: 40, padding: '0 20px', fontSize: 14 }}
                onClick={() => callNextInQueue(selectedDoctorId || undefined)}
              >
                <Play size={15} /> Call Next Patient
              </button>
            </div>

            {activeConsultation && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => callToken(currentToken)}
                >
                  <RotateCcw size={12} /> Recall #{currentToken}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => startConsultationForVisit(activeConsultation)}
                >
                  <Stethoscope size={12} /> Start Consultation
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => holdVisit(activeConsultation.id)}
                >
                  <Pause size={12} /> Hold
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Filter size={14} /> Clinic Filter:
          </div>

          <div style={{ width: 220 }}>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.slice(0, 10).map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: 240 }}>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
            >
              <option value="">All Consulting Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
            Showing {todayVisits.length} total encounters for today
          </div>
        </div>
      </div>

      {/* Queue Grid: Active & Waiting Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left: Live Waiting Queue List */}
        <div className="card">
          <div className="card-header">
            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
            <div className="card-title" style={{ fontSize: 15 }}>
              Waiting Queue ({waitingQueue.length})
            </div>
            <span className="badge badge-warning">Priority Ranked</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {waitingQueue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {waitingQueue.map((v, idx) => {
                  const prio = PRIORITY_BADGES[v.priority] || PRIORITY_BADGES.normal;
                  const isHold = v.status === 'on_hold';

                  return (
                    <div
                      key={v.id}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: isHold ? 'var(--bg-surface)' : 'transparent',
                        borderLeft: v.priority === 'emergency' ? '4px solid var(--color-danger)' : v.priority === 'senior' ? '4px solid var(--color-ai)' : '4px solid transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Token Bubble */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'var(--color-primary-muted)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {v.tokenNumber}
                      </div>

                      {/* Patient & Doctor Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{v.patientName}</span>
                          <span className="patient-id" style={{ fontSize: 10 }}>{v.patientId}</span>
                          <span className="badge" style={{ background: prio.bg, color: prio.color, fontSize: 10 }}>
                            {prio.label}
                          </span>
                          {isHold && (
                            <span className="badge badge-warning" style={{ fontSize: 10 }}>On Hold</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                          <span>Dr. {v.doctorName}</span>
                          <span>·</span>
                          <span>{v.department}</span>
                          <span>·</span>
                          <span>Time: {v.visitTime}</span>
                        </div>

                        {v.reasonForVisit && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                            "{v.reasonForVisit}"
                          </div>
                        )}
                      </div>

                      {/* Vitals preview or enter button */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {v.vitals ? (
                          <div
                            style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', cursor: 'pointer' }}
                            onClick={() => setVitalsModalVisit(v)}
                            title="Click to edit vitals"
                          >
                            <div>BP: <strong style={{ color: 'var(--text-primary)' }}>{v.vitals.bloodPressure}</strong></div>
                            <div>Pulse: <strong style={{ color: 'var(--text-primary)' }}>{v.vitals.pulse}</strong></div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11, color: 'var(--color-warning)' }}
                            onClick={() => setVitalsModalVisit(v)}
                          >
                            <Activity size={12} /> Vitals
                          </button>
                        )}

                        {/* Actions */}
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px' }}
                          onClick={() => callToken(v.tokenNumber)}
                        >
                          <Play size={12} /> Call
                        </button>

                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Hold Patient"
                          onClick={() => holdVisit(v.id)}
                        >
                          <Pause size={13} />
                        </button>

                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Skip Patient"
                          onClick={() => skipVisit(v.id)}
                        >
                          <SkipForward size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '48px 16px' }}>
                <div className="empty-state-icon"><Clock size={32} /></div>
                <div className="empty-state-title">No Waiting Patients</div>
                <div className="empty-state-desc">All registered patients have been called or completed.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Called / In Consultation / Completed Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Called Patients Card */}
          <div className="card">
            <div className="card-header">
              <Play size={16} style={{ color: 'var(--color-info)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Called Patients ({calledVisits.length})</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {calledVisits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {calledVisits.map(v => (
                    <div
                      key={v.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--color-info-muted)',
                        border: '1px solid var(--color-primary-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {v.tokenNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{v.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Dr. {v.doctorName} · {v.department}</div>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startConsultationForVisit(v)}
                      >
                        <Stethoscope size={12} /> Start Consult
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
                  No called patient awaiting entry.
                </div>
              )}
            </div>
          </div>

          {/* Completed Consultations Card */}
          <div className="card">
            <div className="card-header">
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Completed Encounters ({completedVisits.length})</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px', maxHeight: 300, overflowY: 'auto' }}>
              {completedVisits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedVisits.map(v => (
                    <div
                      key={v.id}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{v.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Token #{v.tokenNumber} · Dr. {v.doctorName}</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>Completed</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
                  No consultations completed yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Modal */}
      {vitalsModalVisit && (
        <VitalEntryModal
          visit={vitalsModalVisit}
          onSave={(v) => updateVisitVitals(vitalsModalVisit.id, v)}
          onClose={() => setVitalsModalVisit(null)}
        />
      )}
    </div>
  );
}
