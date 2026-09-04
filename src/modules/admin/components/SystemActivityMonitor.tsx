import React, { useState } from 'react';
import {
  Activity, ShieldAlert, KeyRound, CheckCircle2, AlertTriangle,
  UserCheck, Lock, Globe, Radio, RefreshCw
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function SystemActivityMonitor() {
  const { activityEvents, users } = useAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const loginSuccessCount = activityEvents.filter(e => e.eventType === 'login_success').length;
  const loginFailedCount = activityEvents.filter(e => e.eventType === 'login_failed').length;
  const financialOverridesCount = activityEvents.filter(e => e.eventType === 'financial_override').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Real-Time System Activity & Authentication Telemetry</h3>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <Radio size={10} className="spin" /> LIVE STREAM
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Active sessions, authentication attempts, security exceptions, and financial modifications
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{users.filter(u => u.isActive).length}</div>
          <div className="stat-label">Active Authorized Sessions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{loginSuccessCount}</div>
          <div className="stat-label">Successful Sign-Ins Today</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>{loginFailedCount}</div>
          <div className="stat-label">Failed Password Attempts</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{financialOverridesCount}</div>
          <div className="stat-label">Financial Overrides / Discounts</div>
        </div>
      </div>

      {/* Live Event Stream Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Live System Event Log</span>
          <span className="badge badge-primary">{activityEvents.length} Events</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Domain</th>
                  <th>User / Target</th>
                  <th>IP Address</th>
                  <th>Event Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activityEvents.map(evt => {
                  const isSuccess = evt.status === 'success';
                  const isDanger = evt.status === 'danger';
                  const isWarning = evt.status === 'warning';

                  return (
                    <tr key={evt.id} style={{ background: isDanger ? '#fef2f2' : undefined }}>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{evt.timestamp}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                          {evt.eventType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <strong>{evt.userName}</strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{evt.ipAddress}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{evt.description}</div>
                      </td>
                      <td>
                        <span className={`badge ${isSuccess ? 'badge-success' : isDanger ? 'badge-danger' : 'badge-warning'}`}>
                          {evt.status.toUpperCase()}
                        </span>
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
