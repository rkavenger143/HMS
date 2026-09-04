import React, { useState, useMemo } from 'react';
import {
  Users, Stethoscope, PhoneCall, Clock, CheckCircle2,
  AlertTriangle, Pause, Play, ArrowRight, User, Sparkles
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';

export default function DoctorOPDQueue() {
  const {
    doctors,
    appointments,
    selectedDoctorId,
    setSelectedDoctorId,
    setSelectedPatientId,
    setActiveTab,
  } = useDoctor();

  const [activeDoctorId, setActiveDoctorId] = useState<string>(selectedDoctorId || doctors[0]?.id || 'doc-1');
  const [calledToken, setCalledToken] = useState<number | null>(null);

  const activeDoctor = doctors.find(d => d.id === activeDoctorId) || doctors[0];

  // Filter appointments for the selected doctor
  const docQueue = useMemo(() => {
    return appointments.filter(a =>
      a.doctorId === activeDoctorId ||
      a.doctorName.toLowerCase().includes(activeDoctor.name.toLowerCase())
    );
  }, [appointments, activeDoctorId, activeDoctor]);

  const queueStats = useMemo(() => {
    const total = docQueue.length;
    const waiting = docQueue.filter(a => a.status === 'waiting' || a.status === 'scheduled').length;
    const inProgress = docQueue.filter(a => a.status === 'in_progress').length;
    const completed = docQueue.filter(a => a.status === 'completed').length;
    return { total, waiting, inProgress, completed };
  }, [docQueue]);

  const handleCallPatient = (token: number, patientName: string) => {
    setCalledToken(token);
    alert(`Calling Token #${token} — ${patientName} to ${activeDoctor.name}'s Chamber.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Doctor Live OPD Queue & Consultation Calling Desk
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Chamber token management: Token Announcement → Queue Status → Instant Consultation Launch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Consulting Doctor:</label>
          <select
            className="form-select"
            style={{ width: 240, height: 36, fontSize: 12 }}
            value={activeDoctorId}
            onChange={e => {
              setActiveDoctorId(e.target.value);
              setSelectedDoctorId(e.target.value);
            }}
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value">{queueStats.total}</div>
          <div className="stat-label">Total Appointments in Session</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{queueStats.waiting}</div>
          <div className="stat-label">Patients Waiting in Lounge</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{queueStats.inProgress}</div>
          <div className="stat-label">Currently in Chamber</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{queueStats.completed}</div>
          <div className="stat-label">Consultations Completed</div>
        </div>
      </div>

      {/* Live Queue Desk Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Active OPD Queue for {activeDoctor.name}</span>
          <span className="badge badge-primary">{docQueue.length} Patients in Queue</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Token #</th>
                  <th>Patient Name & UHID</th>
                  <th>Age & Gender</th>
                  <th>Time Slot</th>
                  <th>Visit Priority</th>
                  <th>Queue Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docQueue.map(apt => (
                  <tr key={apt.id} style={{ background: calledToken === apt.tokenNumber ? '#f0fdf4' : undefined }}>
                    <td>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: apt.status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-primary-muted)',
                        color: apt.status === 'in_progress' ? '#ffffff' : 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 900
                      }}>
                        {apt.tokenNumber || '1'}
                      </div>
                    </td>

                    <td>
                      <strong>{apt.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{apt.patientId}</div>
                    </td>

                    <td>45y / Male</td>
                    <td><strong>{apt.time}</strong></td>

                    <td>
                      <span className="badge badge-neutral">NORMAL</span>
                    </td>

                    <td>
                      <span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'in_progress' ? 'badge-primary' : apt.status === 'waiting' ? 'badge-warning' : 'badge-neutral'}`}>
                        {(apt.status || 'scheduled').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: 28, fontSize: 11 }}
                          onClick={() => handleCallPatient(apt.tokenNumber, apt.patientName)}
                          title="Call patient token into chamber"
                        >
                          <PhoneCall size={11} /> Call
                        </button>

                        <button
                          className="btn btn-primary btn-sm"
                          style={{ height: 28, fontSize: 11 }}
                          onClick={() => {
                            setSelectedPatientId(apt.patientId);
                            setActiveTab('consultation');
                          }}
                        >
                          <Stethoscope size={11} /> Consult
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {docQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No patients currently waiting in queue for {activeDoctor.name}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
