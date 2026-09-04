import React, { useState } from 'react';
import { Bell, Search, Filter, ShieldAlert, CheckCircle2, ShieldCheck, Activity, Pill, Clock, Stethoscope } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

export default function AlertCenter() {
  const { nursingAlerts, acknowledgeAlert, resolveAlert, setSelectedAdmissionId, setActiveTab } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredAlerts = nursingAlerts.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.message.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.bedNumber.toLowerCase().includes(q);

    const matchesPriority = selectedPriority === 'ALL' || a.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Real-Time Clinical Alert Center</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Abnormal vital thresholds, overdue medications, urgent physician orders, and critical patient alerts
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Alert Message, Patient, or Bed..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Alert Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({nursingAlerts.length})</option>
            <option value="new">New Alerts Only ({nursingAlerts.filter(a => a.status === 'new').length})</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const isNew = alert.status === 'new';
            const isCritical = alert.priority === 'critical' || alert.priority === 'high';

            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  borderLeft: `4px solid ${isCritical ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                  background: isNew ? 'rgba(255, 69, 58, 0.03)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isCritical ? 'var(--color-danger-muted)' : 'var(--color-warning-muted)',
                    color: isCritical ? 'var(--color-danger)' : 'var(--color-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {alert.alertType === 'abnormal_vitals' ? <Activity size={18} /> : alert.alertType.includes('medication') ? <Pill size={18} /> : <Bell size={18} />}
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>Patient: <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => handleOpenEHR(alert.admissionId)}>{alert.patientName}</strong> (Bed {alert.bedNumber})</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{alert.timestamp}</span>
                      {alert.triggerValue && <span>Trigger: <strong>{alert.triggerValue}</strong></span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${alert.priority === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${isNew ? 'badge-danger' : alert.status === 'acknowledged' ? 'badge-primary' : 'badge-success'}`}>
                    {alert.status.toUpperCase()}
                  </span>

                  {isNew && (
                    <button className="btn btn-secondary btn-sm" onClick={() => acknowledgeAlert(alert.id)}>
                      <ShieldCheck size={12} /> Acknowledge
                    </button>
                  )}

                  {alert.status !== 'resolved' && (
                    <button className="btn btn-primary btn-sm" onClick={() => resolveAlert(alert.id)}>
                      <CheckCircle2 size={12} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Active Clinical Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>All inpatient vitals and medication schedules are within safe thresholds.</div>
          </div>
        )}
      </div>
    </div>
  );
}
