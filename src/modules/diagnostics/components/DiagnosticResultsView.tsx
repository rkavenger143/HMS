import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  Edit,
  Activity,
  Plus,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import EnterDiagnosticResultModal from './modals/EnterDiagnosticResultModal';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticRequest } from '../../../types';

export default function DiagnosticResultsView() {
  const { requests, releaseReport, setSelectedRequestId, setActiveTab } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [editRequest, setEditRequest] = useState<DiagnosticRequest | null>(null);
  const [printRequest, setPrintRequest] = useState<DiagnosticRequest | null>(null);

  // Filter requests that have results or are ready for result entry
  const resultsRequests = requests.filter(r => r.results.length > 0 || r.status === 'processing' || r.status === 'result_ready');

  const filteredRequests = resultsRequests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q);

    const matchesResult =
      resultFilter === 'ALL' ||
      (resultFilter === 'critical' && (r.overallResultStatus === 'critical' || r.results.some(p => p.isCritical))) ||
      (resultFilter === 'abnormal' && r.overallResultStatus === 'abnormal') ||
      (resultFilter === 'normal' && r.overallResultStatus === 'normal');

    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesResult && matchesCategory;
  });

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
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Results & Verification Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Result value entry, automatic reference range evaluation, normal / abnormal / critical flag highlights, and clinical signoff
            </div>
          </div>
        </div>
      </div>

      {/* Result Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {requests.filter(r => r.overallResultStatus === 'normal').length}
          </div>
          <div className="stat-label">Normal Results</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {requests.filter(r => r.overallResultStatus === 'abnormal').length}
          </div>
          <div className="stat-label">Abnormal Findings</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {requests.filter(r => r.overallResultStatus === 'critical' || r.results.some(p => p.isCritical)).length}
          </div>
          <div className="stat-label">Critical Panic Results</div>
        </div>
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
              placeholder="Search Patient, Test, UHID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
          >
            <option value="ALL">All Result Classifications</option>
            <option value="normal">Normal Results Only</option>
            <option value="abnormal">Abnormal Results Only</option>
            <option value="critical">Critical Panic Results</option>
          </select>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="laboratory">Laboratory</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="other">Other Diagnostics</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Details</th>
                  <th>Investigation Name</th>
                  <th>Observed Result / Key Parameter</th>
                  <th>Normal Biological Range</th>
                  <th>Result Status</th>
                  <th>Technician & Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => {
                  const firstParam = req.results[0];
                  const criticalParam = req.results.find(p => p.isCritical || p.status === 'critical');
                  const displayParam = criticalParam || firstParam;

                  return (
                    <tr key={req.id}>
                      {/* Request ID */}
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>
                        #{req.requestId}
                      </td>

                      {/* Patient */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{req.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          UHID: {req.patientId} · {req.bedNumber ? `Bed ${req.bedNumber}` : 'OPD'}
                        </div>
                      </td>

                      {/* Test */}
                      <td>
                        <strong>{req.testName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.department}</div>
                      </td>

                      {/* Observed Result Value */}
                      <td>
                        {req.results.length > 0 ? (
                          <div>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color:
                                  displayParam?.status === 'critical'
                                    ? 'var(--color-danger)'
                                    : displayParam?.status === 'abnormal'
                                    ? 'var(--color-warning)'
                                    : 'var(--color-success)',
                              }}
                            >
                              {displayParam?.parameterName}: {displayParam?.value} {displayParam?.unit}
                            </span>
                            {req.results.length > 1 && (
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                                + {req.results.length - 1} more parameter{req.results.length > 2 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : req.findingsText ? (
                          <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                            {req.impressionText || 'Findings Entered'}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Awaiting Results</span>
                        )}
                      </td>

                      {/* Normal Range */}
                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {displayParam?.referenceRange || 'Standard anatomical'}
                        </div>
                      </td>

                      {/* Result Status Flag */}
                      <td>
                        <span
                          className={`badge ${
                            req.overallResultStatus === 'critical' || req.results.some(p => p.isCritical)
                              ? 'badge-danger'
                              : req.overallResultStatus === 'abnormal'
                              ? 'badge-warning'
                              : req.overallResultStatus === 'normal'
                              ? 'badge-success'
                              : 'badge-neutral'
                          }`}
                          style={{ fontWeight: 800, letterSpacing: '0.3px' }}
                        >
                          {req.overallResultStatus ? req.overallResultStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </td>

                      {/* Technician & Date */}
                      <td>
                        <div style={{ fontSize: 12 }}>{req.technicianName || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                          {req.technicianAt || req.requestDate}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => setEditRequest(req)}
                          >
                            <Edit size={11} /> {req.results.length > 0 ? 'Edit' : 'Enter'}
                          </button>

                          {(req.reportStatus === 'ready' || req.reportStatus === 'released') && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                              onClick={() => setPrintRequest(req)}
                            >
                              <Printer size={11} /> View Report
                            </button>
                          )}
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

      {editRequest && (
        <EnterDiagnosticResultModal
          request={editRequest}
          onClose={() => setEditRequest(null)}
        />
      )}

      {printRequest && (
        <PrintDiagnosticReportModal
          request={printRequest}
          onClose={() => setPrintRequest(null)}
          onRelease={releaseReport}
        />
      )}
    </div>
  );
}
