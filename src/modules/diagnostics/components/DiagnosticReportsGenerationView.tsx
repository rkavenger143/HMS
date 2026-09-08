import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Download,
  Eye,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticReportStatus, DiagnosticRequest } from '../../../types';

export default function DiagnosticReportsGenerationView() {
  const { requests, generateReport, releaseReport } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeReportRequest, setActiveReportRequest] = useState<DiagnosticRequest | null>(null);

  // Filter requests that are eligible for report viewing/release
  const reportableRequests = requests.filter(r => r.results.length > 0 || r.findingsText || r.status === 'result_ready' || r.status === 'completed');

  const filteredRequests = reportableRequests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || r.reportStatus === statusFilter;
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRelease = (reqId: string) => {
    releaseReport(reqId);
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
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Printer size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Investigation Reports & Authorization</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Official diagnostic report generation, biological reference comparison, pathologist / radiologist authorization, and report release
            </div>
          </div>
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
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Report Statuses ({reportableRequests.length})</option>
            <option value="ready">Ready for Authorization</option>
            <option value="released">Released & Signed</option>
            <option value="draft">Draft Reports</option>
          </select>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="laboratory">Laboratory</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="other">Other Diagnostics</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report # / ID</th>
                  <th>Patient Details</th>
                  <th>Investigation & Department</th>
                  <th>Overall Result Status</th>
                  <th>Reporting Signatory</th>
                  <th>Report Date</th>
                  <th>Report Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => {
                  const isReleased = req.reportStatus === 'released';

                  return (
                    <tr key={req.id}>
                      {/* Report ID */}
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

                      {/* Test & Department */}
                      <td>
                        <strong>{req.testName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {req.department} ({req.category.toUpperCase()})
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td>
                        <span
                          className={`badge ${
                            req.overallResultStatus === 'critical'
                              ? 'badge-danger'
                              : req.overallResultStatus === 'abnormal'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                          style={{ fontWeight: 800 }}
                        >
                          {req.overallResultStatus ? req.overallResultStatus.toUpperCase() : 'NORMAL'}
                        </span>
                      </td>

                      {/* Signatory */}
                      <td>
                        <div style={{ fontSize: 12 }}>{req.authorizedBy || 'Dr. Sunita Rao, MD (Pathologist)'}</div>
                      </td>

                      {/* Date */}
                      <td>
                        <div style={{ fontSize: 11 }}>{req.reportDate || req.requestDate}</div>
                      </td>

                      {/* Report Status */}
                      <td>
                        <span
                          className={`badge ${
                            isReleased
                              ? 'badge-success'
                              : req.reportStatus === 'ready'
                              ? 'badge-primary'
                              : 'badge-neutral'
                          }`}
                        >
                          {req.reportStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => setActiveReportRequest(req)}
                          >
                            <Eye size={12} /> View Report
                          </button>

                          {!isReleased && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                              onClick={() => handleRelease(req.id)}
                            >
                              <CheckCircle2 size={12} /> Release
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

      {activeReportRequest && (
        <PrintDiagnosticReportModal
          request={activeReportRequest}
          onClose={() => setActiveReportRequest(null)}
          onRelease={releaseReport}
        />
      )}
    </div>
  );
}
