import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, CheckCircle2, Siren, Activity,
  Clock, ShieldAlert, CheckCheck, Trash2, Filter, ShieldCheck
} from 'lucide-react';
import { storageService, CriticalAlert, HospitalActivity } from '../../services/storageService';

export default function NotificationsModule() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>(() => storageService.getCriticalAlerts());
  const [activities, setActivities] = useState<HospitalActivity[]>(() => storageService.getActivities());
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'emergency' | 'insurance' | 'activity'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setAlerts(storageService.getCriticalAlerts());
      setActivities(storageService.getActivities());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  const handleAcknowledge = (id: string) => {
    storageService.acknowledgeAlert(id);
    setAlerts(storageService.getCriticalAlerts());
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'all') return true;
    if (filterType === 'critical') return a.severity === 'critical';
    if (filterType === 'emergency') return a.category === 'emergency';
    if (filterType === 'insurance') return a.category === 'insurance_alert';
    return false;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span><span className="breadcrumb-sep">›</span><span>Notifications & Alerts</span>
          </div>
          <div className="page-title">Hospital Notification & Alert Command Center</div>
          <div className="page-subtitle">
            Real-time critical alarms, panic lab results, emergency admissions, insurance pre-authorizations, and departmental dispatch notifications
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            All Notifications ({alerts.length})
          </button>
          <button
            className={`btn btn-sm ${filterType === 'critical' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setFilterType('critical')}
          >
            Critical Only
          </button>
          <button
            className={`btn btn-sm ${filterType === 'emergency' ? 'btn-warning' : 'btn-secondary'}`}
            onClick={() => setFilterType('emergency')}
          >
            Emergency ER
          </button>
          <button
            className={`btn btn-sm ${filterType === 'insurance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('insurance')}
          >
            Insurance & Pre-Auth
          </button>
        </div>
      </div>

      {/* Active Critical Alerts */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
            <div>
              <span className="card-title">Live Critical Priority Alarms</span>
              <div className="card-subtitle">Urgent patient events requiring clinician acknowledgment</div>
            </div>
          </div>
          <span className="badge badge-danger">
            {alerts.filter(a => !a.acknowledged).length} Pending Review
          </span>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredAlerts.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto' }} />
              <div className="empty-state-title" style={{ marginTop: 8 }}>No active critical alerts</div>
              <div className="empty-state-desc">All urgent hospital alarms have been reviewed and resolved</div>
            </div>
          ) : (
            filteredAlerts.map(a => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: a.acknowledged ? 'var(--bg-surface)' : a.severity === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${a.acknowledged ? 'var(--border-default)' : a.severity === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: a.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {a.category === 'emergency' ? <Siren size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {a.title}
                      </span>
                      <span className={`badge ${a.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {a.severity.toUpperCase()}
                      </span>
                      {a.acknowledged && (
                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {a.description}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {a.timestamp} {a.bedNumber && `· Bed: ${a.bedNumber}`} {a.patientName && `· Patient: ${a.patientName}`}
                    </div>
                  </div>
                </div>

                <div>
                  {!a.acknowledged ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAcknowledge(a.id)}
                    >
                      <CheckCheck size={14} /> Acknowledge Alert
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} /> Actioned
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hospital Activity Broadcast Stream */}
      <div className="card">
        <div className="card-header">
          <Clock size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <span className="card-title">Hospital Operational Activity Feed</span>
            <div className="card-subtitle">Chronological record of recent clinical & administrative actions</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map(act => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Activity size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {act.description}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
