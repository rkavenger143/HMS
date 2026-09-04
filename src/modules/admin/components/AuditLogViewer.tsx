import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Search, Filter,
  Download, Printer, FileSpreadsheet, Eye, Clock, User
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AuditLogViewer() {
  const { auditLogs, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q);

      const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      const matchModule = moduleFilter === 'ALL' || log.module.toLowerCase().includes(moduleFilter.toLowerCase());

      return matchSearch && matchSeverity && matchModule;
    });
  }, [auditLogs, searchQuery, severityFilter, moduleFilter]);

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.user,
      l.role,
      l.module,
      l.action,
      l.recordId || '—',
      l.ipAddress,
      l.severity.toUpperCase(),
    ]);

    exportCSV(
      'HMS_Administrative_Audit_Trail_Log',
      ['Audit ID', 'Timestamp', 'User', 'Role', 'Module', 'Action Details', 'Record Ref', 'IP Address', 'Severity'],
      rows
    );
  };

  const handlePrint = () => {
    const orig = document.title;
    document.title = `ALN Cure HMS — System Security Audit Trail (${new Date().toLocaleDateString('en-IN')})`;
    window.print();
    document.title = orig;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Immutable System Audit Logs & Security Telemetry</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                HIPAA / NABH compliance audit trail recording all clinical events, financial overrides, and access modifications
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FileSpreadsheet size={13} /> Export CSV
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={13} /> Print Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search user, action, IP..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="info">Info / Normal Operations</option>
              <option value="warning">Warning / Overrides</option>
              <option value="danger">Danger / Security Alerts</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
            >
              <option value="ALL">All Modules</option>
              <option value="User Management">User Management</option>
              <option value="Permission Management">Permission Management</option>
              <option value="Clinical">Clinical OPD / IPD</option>
              <option value="Central Billing">Central Billing</option>
              <option value="Blood Bank">Blood Bank</option>
              <option value="Hospital Profile">Hospital Profile</option>
              <option value="Security">Security Auth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Immutable Event Record</span>
          <span className="badge badge-primary">{filteredLogs.length} Events Logged</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Module</th>
                  <th>Event Description</th>
                  <th>IP Address</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const isDanger = log.severity === 'danger';
                  const isWarning = log.severity === 'warning';

                  return (
                    <tr key={log.id} style={{ background: isDanger ? '#fef2f2' : undefined }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {log.id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{log.timestamp}</div>
                      </td>
                      <td>
                        <strong>{log.user}</strong>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{log.role}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{log.module}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, lineHeight: 1.4 }}>{log.action}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.ipAddress}</span>
                      </td>
                      <td>
                        <span className={`badge ${isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
                          {log.severity.toUpperCase()}
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
