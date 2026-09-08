import React, { useState } from 'react';
import {
  Activity,
  FileText,
  Clock,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  ArrowRight,
  Eye,
  Printer,
  Barcode,
  Radio,
} from 'lucide-react';
import { useDiagnostic, DiagnosticTab } from '../context/DiagnosticContext';
import CreateDiagnosticRequestModal from './modals/CreateDiagnosticRequestModal';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticRequest } from '../../../types';

export default function DiagnosticDashboard() {
  const {
    kpis,
    requests,
    criticalAlerts,
    setSelectedRequestId,
    setActiveTab,
    releaseReport,
  } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewReport, setViewReport] = useState<DiagnosticRequest | null>(null);

  const unackCritical = criticalAlerts.filter(a => a.status === 'new');
  const emergencyRequests = requests.filter(r => r.priority === 'emergency' && r.status !== 'completed');

  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenRequest = (reqId: string, targetTab: DiagnosticTab) => {
    setSelectedRequestId(reqId);
    setActiveTab(targetTab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Critical Panic Value Alert Banner */}
      {unackCritical.length > 0 && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid var(--color-danger)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--color-danger)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 14 }}>
                CRITICAL PANIC VALUES DETECTED ({unackCritical.length} Patient{unackCritical.length > 1 ? 's' : ''})
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {unackCritical[0]?.patientName} ({unackCritical[0]?.testName} - {unackCritical[0]?.parameterName}: {unackCritical[0]?.resultValue}) requires urgent clinical notification.
              </div>
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => setActiveTab('critical_results')}
          >
            Review Critical Alerts <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 7 Essential Diagnostic KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {/* 1. Today's Requests */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-primary)' }}
          onClick={() => setActiveTab('requests')}
        >
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <FileText size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.todayRequests}</div>
          <div className="stat-label">Today's Requests</div>
        </div>

        {/* 2. Pending Tests */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-warning)' }}
          onClick={() => setActiveTab('requests')}
        >
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.pendingTests}</div>
          <div className="stat-label">Pending Tests</div>
        </div>

        {/* 3. Samples Collected */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #0891b2' }}
          onClick={() => setActiveTab('sample_collection')}
        >
          <div className="stat-icon" style={{ background: 'rgba(8, 145, 178, 0.12)', color: '#0891b2' }}>
            <Barcode size={18} />
          </div>
          <div className="stat-value" style={{ color: '#0891b2' }}>{kpis.samplesCollected}</div>
          <div className="stat-label">Samples Collected</div>
        </div>

        {/* 4. Tests In Progress */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #6366f1' }}
          onClick={() => setActiveTab('processing')}
        >
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <FlaskConical size={18} />
          </div>
          <div className="stat-value" style={{ color: '#6366f1' }}>{kpis.inProgress}</div>
          <div className="stat-label">Tests In Progress</div>
        </div>

        {/* 5. Reports Ready */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}
          onClick={() => setActiveTab('results')}
        >
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <ShieldCheck size={18} />
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{kpis.reportsReady}</div>
          <div className="stat-label">Reports Ready</div>
        </div>

        {/* 6. Critical Results */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-danger)' }}
          onClick={() => setActiveTab('critical_results')}
        >
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalResults}</div>
          <div className="stat-label">Critical Results</div>
        </div>

        {/* 7. Completed Tests */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-success)' }}
          onClick={() => setActiveTab('report_history')}
        >
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.completedTests}</div>
          <div className="stat-label">Completed Tests</div>
        </div>
      </div>

      {/* 2-Column Action Grid: Service Breakdown & Emergency Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Diagnostic Workflow Status */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Diagnostic Service Workflow</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('processing')}>
              Processing Queue <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-warning)' }}>
                  {requests.filter(r => r.status === 'requested').length}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>1. Requested</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0891b2' }}>
                  {requests.filter(r => r.status === 'sample_collected').length}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>2. Collected</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1' }}>
                  {requests.filter(r => r.status === 'processing').length}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>3. Processing</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)' }}>
                  {requests.filter(r => r.status === 'result_ready' || r.status === 'completed').length}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>4. Verified</div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live diagnostics synchronized with OPD, IPD, and Emergency modules.</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                + New Request
              </button>
            </div>
          </div>
        </div>

        {/* Emergency / STAT Queue */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
              <span className="card-title">STAT & Emergency Queue</span>
            </div>
            <span className="badge badge-danger">{emergencyRequests.length} High Priority</span>
          </div>
          <div className="card-body" style={{ padding: '8px 16px' }}>
            {emergencyRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {emergencyRequests.slice(0, 3).map(req => (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {req.patientName}{' '}
                        <span className="badge badge-danger" style={{ fontSize: 10 }}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {req.testName} · Ref: {req.doctorName}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ height: 26, fontSize: 11 }}
                      onClick={() => handleOpenRequest(req.id, req.status === 'requested' ? 'sample_collection' : 'results')}
                    >
                      Process Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-success)', fontSize: 13 }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                No pending STAT or emergency requests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Diagnostic Queue Roster */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Diagnostic Requests Master Roster</span>
              <div className="card-subtitle">Active laboratory, radiology and special diagnostic investigations</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search Patient, Test, ID..."
                style={{ paddingLeft: 32, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ height: 32, fontSize: 12, width: 140 }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="laboratory">Laboratory</option>
              <option value="radiology">Radiology</option>
              <option value="other">Other Diagnostics</option>
            </select>

            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={13} /> Order Test
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Investigation Name</th>
                  <th>Category</th>
                  <th>Ordering Doctor</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id}>
                    {/* Request ID */}
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>
                      #{req.requestId}
                    </td>

                    {/* Patient */}
                    <td>
                      <div
                        style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }}
                        onClick={() => handleOpenRequest(req.id, 'results')}
                      >
                        {req.patientName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        UHID: {req.patientId} · {req.age}Y/{req.gender[0]?.toUpperCase()}
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <span className="badge badge-primary">{req.bedNumber ? req.bedNumber : 'OPD'}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.ward || 'Consultation'}</div>
                    </td>

                    {/* Test */}
                    <td>
                      <strong>{req.testName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Code: {req.testCode}</div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {req.category}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td>
                      <div style={{ fontSize: 12 }}>{req.doctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.department}</div>
                    </td>

                    {/* Priority */}
                    <td>
                      <span
                        className={`badge ${
                          req.priority === 'emergency'
                            ? 'badge-danger'
                            : req.priority === 'urgent'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {req.priority.toUpperCase()}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${
                          req.status === 'completed' || req.reportStatus === 'released'
                            ? 'badge-success'
                            : req.status === 'result_ready'
                            ? 'badge-primary'
                            : req.status === 'processing'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {req.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {req.reportStatus === 'ready' || req.reportStatus === 'released' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setViewReport(req)}
                          >
                            <Eye size={12} /> View Report
                          </button>
                        ) : req.status === 'processing' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenRequest(req.id, 'results')}
                          >
                            Enter Results
                          </button>
                        ) : req.status === 'sample_collected' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenRequest(req.id, 'processing')}
                          >
                            Process Test
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenRequest(req.id, 'sample_collection')}
                          >
                            Collect Sample
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateDiagnosticRequestModal onClose={() => setShowCreateModal(false)} />}
      {viewReport && (
        <PrintDiagnosticReportModal
          request={viewReport}
          onClose={() => setViewReport(null)}
          onRelease={releaseReport}
        />
      )}
    </div>
  );
}
