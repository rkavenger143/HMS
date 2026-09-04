import React, { useState } from 'react';
import { AlertTriangle, Search, Filter, PhoneCall, ShieldCheck, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { useLab } from '../context/LabContext';

export default function CriticalResultsCenter() {
  const { criticalAlerts, acknowledgeCriticalAlert } = useLab();

  const [search, setSearch] = useState('');
  const [ackName, setAckName] = useState('Dr. Sarah Khan (Attending Consultant)');

  const filteredAlerts = criticalAlerts.filter(a => {
    const q = search.toLowerCase();
    return (
      !search ||
      a.patientName.toLowerCase().includes(q) ||
      a.parameterName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      (a.bedNumber && a.bedNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Critical Laboratory Values & Panic Alert Command Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mandatory clinical escalation hub, attending physician call logs, and closed-loop acknowledgment audit trails
            </div>
          </div>
        </div>

        <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: 12 }}>
          {criticalAlerts.filter(a => a.status === 'new').length} Active Panic Alert(s)
        </span>
      </div>

      {/* Regulatory Notice */}
      <div style={{ background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', padding: '12px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--color-danger)' }}>CLINICAL SAFETY MANDATE: </strong>
          Critical values represent immediate life-threatening physiological disturbances. Laboratory technologists must verbally communicate results to the patient's primary care physician within 15 minutes of detection and record acknowledgment in this log.
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Critical Result, Patient, Bed..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const isNew = alert.status === 'new';
            const isAck = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderLeft: `5px solid ${isNew ? 'var(--color-danger)' : 'var(--color-success)'}`,
                  background: isNew ? 'rgba(255, 69, 58, 0.03)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--color-danger)' }}>
                        {alert.parameterName}: {alert.resultValue}
                      </span>
                      <span className="badge badge-danger">CRITICAL VALUE</span>
                      <span className={`badge ${isAck ? 'badge-success' : 'badge-danger'}`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                      Patient: <strong>{alert.patientName}</strong> ({alert.patientId}) · Location: <strong>{alert.bedNumber ? `Bed ${alert.bedNumber} (${alert.ward})` : 'OPD'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isNew && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => acknowledgeCriticalAlert(alert.id, ackName)}
                      >
                        <ShieldCheck size={12} /> Confirm Physician Verbal Handover
                      </button>
                    )}
                    {isAck && (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        ✓ ACKNOWLEDGED BY {alert.acknowledgedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Box */}
                <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 8 }}>
                  <div>Test: <strong>{alert.testName}</strong></div>
                  <div>Panic Threshold: <strong style={{ color: 'var(--color-danger)' }}>{alert.criticalThreshold}</strong></div>
                  <div>Attending Doctor: <strong>{alert.doctorName}</strong></div>
                  <div>Detected At: <strong>{alert.detectedAt}</strong></div>
                </div>

                {isAck && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    Closed-loop handover logged at <strong>{alert.acknowledgedAt}</strong> by <strong>{alert.acknowledgedBy}</strong>.
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No Active Critical Laboratory Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>All inpatient and outpatient test results are within clinical safety margins.</div>
          </div>
        )}
      </div>
    </div>
  );
}
