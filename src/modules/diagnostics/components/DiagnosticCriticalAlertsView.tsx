import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  User,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticCriticalAlert, DiagnosticRequest } from '../../../types';

export default function DiagnosticCriticalAlertsView() {
  const { criticalAlerts, requests, acknowledgeCriticalAlert, releaseReport } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [ackName, setAckName] = useState('Dr. Sarah Khan (Attending Cardiologist)');
  const [viewRequest, setViewRequest] = useState<DiagnosticRequest | null>(null);

  const filteredAlerts = criticalAlerts.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.testName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.parameterName.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAcknowledge = (alertId: string) => {
    acknowledgeCriticalAlert(alertId, ackName);
  };

  const handleOpenReport = (reqId: string) => {
    const r = requests.find(req => req.id === reqId);
    if (r) setViewRequest(r);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Critical Panic Values & Clinical Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Urgent life-threatening laboratory and diagnostic results requiring immediate escalation and physician signoff
            </div>
          </div>
        </div>

        {/* Doctor Ack Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Acknowledging Physician:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 230, height: 32, fontSize: 12 }}
            value={ackName}
            onChange={e => setAckName(e.target.value)}
          />
        </div>
      </div>

      {/* Alert Severity Banner */}
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-danger)', fontWeight: 700 }}>
          <ShieldAlert size={18} />
          <span>Hospital Critical Alert Protocol Active: Mandatory telephone notification within 15 minutes of result detection.</span>
        </div>
        <span className="badge badge-danger">
          {criticalAlerts.filter(a => a.status === 'new' || a.status === 'notified').length} Pending Action
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Parameter, Doctor..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Alert Statuses ({criticalAlerts.length})</option>
            <option value="new">New / Unnotified</option>
            <option value="notified">Notified to Doctor</option>
            <option value="acknowledged">Acknowledged & Resolved</option>
          </select>
        </div>
      </div>

      {/* Critical Alerts Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alert Timestamp</th>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Responsible Doctor</th>
                  <th>Investigation & Parameter</th>
                  <th>Critical Value & Threshold</th>
                  <th>Escalation Status</th>
                  <th style={{ textAlign: 'right' }}>Physician Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => {
                  const isAck = alert.status === 'acknowledged';

                  return (
                    <tr key={alert.id} style={{ background: isAck ? undefined : 'rgba(239, 68, 68, 0.04)' }}>
                      {/* Detected Date */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-danger)' }}>
                          {alert.detectedAt}
                        </div>
                      </td>

                      {/* Patient */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{alert.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UHID: {alert.patientId}</div>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="badge badge-primary">{alert.bedNumber ? alert.bedNumber : 'OPD'}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{alert.ward || 'General'}</div>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{alert.doctorName}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{alert.notifiedTo}</div>
                      </td>

                      {/* Investigation & Parameter */}
                      <td>
                        <strong>{alert.testName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 700 }}>
                          {alert.parameterName}
                        </div>
                      </td>

                      {/* Critical Value */}
                      <td>
                        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-danger)' }}>
                          {alert.resultValue}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{alert.criticalThreshold}</div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            alert.status === 'acknowledged'
                              ? 'badge-success'
                              : alert.status === 'notified'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                          style={{ fontWeight: 800 }}
                        >
                          {alert.status.toUpperCase()}
                        </span>
                        {alert.acknowledgedBy && (
                          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
                            By {alert.acknowledgedBy} at {alert.acknowledgedAt}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {!isAck ? (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, padding: '3px 10px' }}
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCircle2 size={12} /> Acknowledge Call
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>
                              ✓ Acknowledged
                            </span>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => handleOpenReport(alert.requestId)}
                          >
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewRequest && (
        <PrintDiagnosticReportModal
          request={viewRequest}
          onClose={() => setViewRequest(null)}
          onRelease={releaseReport}
        />
      )}
    </div>
  );
}
