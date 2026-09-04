import React, { useState } from 'react';
import {
  Clock, Calendar, CheckCircle2, AlertCircle, Save,
  Building2, UserRound, Sparkles, Plus, Trash2
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorScheduleAvailability() {
  const { doctors, selectedDoctorId, setSelectedDoctorId, updateDoctor } = useDoctor();

  const [activeDoctorId, setActiveDoctorId] = useState<string>(selectedDoctorId || doctors[0]?.id || 'doc-1');
  const [slotDuration, setSlotDuration] = useState<number>(15);
  const [maxPatients, setMaxPatients] = useState<number>(25);
  const [roomNumber, setRoomNumber] = useState('Room 102 (OPD Block A)');

  // Local state for week schedule
  const [daySchedules, setDaySchedules] = useState<Record<string, { enabled: boolean; start: string; end: string; breakStart: string; breakEnd: string }>>({
    Monday: { enabled: true, start: '09:00', end: '13:00', breakStart: '13:00', breakEnd: '14:00' },
    Tuesday: { enabled: false, start: '09:00', end: '13:00', breakStart: '13:00', breakEnd: '14:00' },
    Wednesday: { enabled: true, start: '09:00', end: '13:00', breakStart: '13:00', breakEnd: '14:00' },
    Thursday: { enabled: false, start: '09:00', end: '13:00', breakStart: '13:00', breakEnd: '14:00' },
    Friday: { enabled: true, start: '09:00', end: '13:00', breakStart: '13:00', breakEnd: '14:00' },
    Saturday: { enabled: true, start: '09:00', end: '12:00', breakStart: '', breakEnd: '' },
    Sunday: { enabled: false, start: '09:00', end: '12:00', breakStart: '', breakEnd: '' },
  });

  const selectedDoctor = doctors.find(d => d.id === activeDoctorId) || doctors[0];

  const handleSave = () => {
    const activeDays = Object.entries(daySchedules)
      .filter(([_, s]) => s.enabled)
      .map(([day]) => day.slice(0, 3));

    updateDoctor(selectedDoctor.id, {
      opdSchedule: {
        days: activeDays,
        startTime: '09:00 AM',
        endTime: '01:00 PM',
      },
    });

    alert(`OPD Availability schedule updated for ${selectedDoctor.name}. Working Days: ${activeDays.join(', ')}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(2,132,199,0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Doctor Availability & OPD Roster Master
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configure clinical consultation hours, token limits, slot durations, and clinic room assignments
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Doctor:</label>
          <select
            className="form-select"
            style={{ width: 240, height: 36, fontSize: 12 }}
            value={activeDoctorId}
            onChange={e => setActiveDoctorId(e.target.value)}
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} /> Save Roster
          </button>
        </div>
      </div>

      {/* Global Consultation Slot Settings */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
          General Consultation Parameters for {selectedDoctor?.name}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Slot Duration per Patient (Mins)</label>
            <select className="form-select" value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))}>
              <option value={10}>10 Minutes (Fast Track)</option>
              <option value={15}>15 Minutes (Standard OPD)</option>
              <option value={20}>20 Minutes (Comprehensive)</option>
              <option value={30}>30 Minutes (Specialist / Surgery)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Max Token Quota per Session</label>
            <input
              type="number"
              min="5"
              max="60"
              className="form-input"
              value={maxPatients}
              onChange={e => setMaxPatients(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Consulting OPD Chamber / Room</label>
            <input
              type="text"
              className="form-input"
              value={roomNumber}
              onChange={e => setRoomNumber(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Day-Wise Roster Table */}
      <div className="card">
        <div className="card-header">
          <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Weekly OPD Availability Roster</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Day of Week</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th>OPD Start Time</th>
                  <th>OPD End Time</th>
                  <th>Break Interval</th>
                  <th>Estimated Capacity</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => {
                  const s = daySchedules[day];
                  return (
                    <tr key={day} style={{ opacity: s.enabled ? 1 : 0.6 }}>
                      <td>
                        <strong>{day}</strong>
                      </td>

                      <td>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={s.enabled}
                            onChange={e => setDaySchedules({
                              ...daySchedules,
                              [day]: { ...s, enabled: e.target.checked }
                            })}
                          />
                          <span className={`badge ${s.enabled ? 'badge-success' : 'badge-neutral'}`}>
                            {s.enabled ? 'Active OPD' : 'Off Day'}
                          </span>
                        </label>
                      </td>

                      <td>
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 130, height: 32, fontSize: 12 }}
                          value={s.start}
                          disabled={!s.enabled}
                          onChange={e => setDaySchedules({
                            ...daySchedules,
                            [day]: { ...s, start: e.target.value }
                          })}
                        />
                      </td>

                      <td>
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 130, height: 32, fontSize: 12 }}
                          value={s.end}
                          disabled={!s.enabled}
                          onChange={e => setDaySchedules({
                            ...daySchedules,
                            [day]: { ...s, end: e.target.value }
                          })}
                        />
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: 110, height: 32, fontSize: 11 }}
                            value={s.breakStart}
                            disabled={!s.enabled}
                            onChange={e => setDaySchedules({
                              ...daySchedules,
                              [day]: { ...s, breakStart: e.target.value }
                            })}
                          />
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: 110, height: 32, fontSize: 11 }}
                            value={s.breakEnd}
                            disabled={!s.enabled}
                            onChange={e => setDaySchedules({
                              ...daySchedules,
                              [day]: { ...s, breakEnd: e.target.value }
                            })}
                          />
                        </div>
                      </td>

                      <td>
                        {s.enabled ? (
                          <strong style={{ color: 'var(--color-primary)' }}>{maxPatients} Slots</strong>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>0 Slots (Closed)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
