import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticRequest } from '../../../types';

export type EssentialReportType =
  | 'history_archive'
  | 'daily_test_report'
  | 'pending_test_report'
  | 'result_report'
  | 'critical_report'
  | 'dept_summary_report';

const ESSENTIAL_REPORTS = [
  {
    id: 'daily_test_report',
    title: '1. Daily Diagnostic Test Report',
    desc: 'Summary of diagnostic tests requested and completed for the selected date range.',
    icon: '📊',
  },
  {
    id: 'pending_test_report',
    title: '2. Pending Test Report',
    desc: 'Diagnostic investigations awaiting specimen collection, processing, or pathologist signoff.',
    icon: '⏳',
  },
  {
    id: 'result_report',
    title: '3. Diagnostic Result Report',
    desc: 'Complete catalog of validated diagnostic findings across all clinical departments.',
    icon: '📋',
  },
  {
    id: 'critical_report',
    title: '4. Critical Result Report',
    desc: 'All abnormal and critical life-threatening values requiring clinical physician escalation.',
    icon: '⚠️',
  },
  {
    id: 'dept_summary_report',
    title: '5. Department-Wise Diagnostic Report',
    desc: 'Workload and revenue distribution across Laboratory, Radiology, and Specialty Services.',
    icon: '🏢',
  },
];

export default function DiagnosticReportHistoryView() {
  const { requests, releaseReport } = useDiagnostic();

  const [activeReportTab, setActiveReportTab] = useState<EssentialReportType>('history_archive');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-07');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('ALL');

  const [viewReport, setViewReport] = useState<DiagnosticRequest | null>(null);

  // Filter requests
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
    const matchesDepartment = selectedDepartment === 'ALL' || r.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus || r.reportStatus === selectedStatus;
    const matchesPatient = selectedPatientFilter === 'ALL' || r.patientId === selectedPatientFilter;

    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus && matchesPatient;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = ['Request ID', 'UHID', 'Patient Name', 'Bed/Location', 'Doctor', 'Investigation', 'Category', 'Status', 'Overall Result', 'Fee (INR)'];
    let rows: (string | number)[][] = filteredRequests.map(r => [
      r.requestId,
      r.patientId,
      `"${r.patientName}"`,
      `"${r.bedNumber ? `Bed ${r.bedNumber} (${r.ward})` : 'OPD'}"`,
      `"${r.doctorName}"`,
      `"${r.testName}"`,
      r.category,
      r.reportStatus,
      r.overallResultStatus || 'Normal',
      r.price,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `diagnostic_report_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Report History & Essential Hospital Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete audit ledger of diagnostic results, multi-attribute historical search, and 5 essential hospital reports
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
        {/* Left: Report Archive & 5 Essential Reports Selector */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            REPORT SELECTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              className={`btn btn-sm ${activeReportTab === 'history_archive' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 12px', height: 'auto' }}
              onClick={() => setActiveReportTab('history_archive')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>📜 All Patient Report History</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>Universal patient investigation archive</div>
              </div>
            </button>

            <div style={{ borderTop: '1px solid var(--border-default)', margin: '6px 0' }} />

            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', padding: '0 8px', marginBottom: 4 }}>
              ESSENTIAL HOSPITAL REPORTS (5)
            </div>

            {ESSENTIAL_REPORTS.map(r => {
              const isSelected = activeReportTab === r.id;
              return (
                <button
                  key={r.id}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 12px', height: 'auto' }}
                  onClick={() => setActiveReportTab(r.id as EssentialReportType)}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{r.title}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Report Content & Multi-Filter Controls */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-title" style={{ fontSize: 15 }}>
                {activeReportTab === 'history_archive'
                  ? 'All Diagnostic Patient Report History'
                  : ESSENTIAL_REPORTS.find(r => r.id === activeReportTab)?.title}
              </span>
              <div className="card-subtitle">
                {activeReportTab === 'history_archive'
                  ? 'Historical patient diagnostic records, test results, and verified reports'
                  : ESSENTIAL_REPORTS.find(r => r.id === activeReportTab)?.desc}
              </div>
            </div>

            {/* Filter Controls: Date Range, Department, Category */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="form-input"
                style={{ height: 30, fontSize: 11, width: 115 }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ height: 30, fontSize: 11, width: 115 }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />

              <select
                className="form-select"
                style={{ height: 30, fontSize: 11, width: 130 }}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="laboratory">Laboratory</option>
                <option value="radiology">Radiology</option>
                <option value="other">Other Diagnostics</option>
              </select>

              <select
                className="form-select"
                style={{ height: 30, fontSize: 11, width: 130 }}
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Clinical Pathology">Pathology</option>
                <option value="Radiology & Imaging">Radiology</option>
                <option value="Cardiology Diagnostics">Cardiology</option>
              </select>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {/* 1. Daily Diagnostic Test Report */}
            {activeReportTab === 'daily_test_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Patient Name</th>
                      <th>Investigation</th>
                      <th>Department</th>
                      <th>Request Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(r => (
                      <tr key={r.id}>
                        <td><strong>#{r.requestId}</strong></td>
                        <td>{r.patientName} ({r.patientId})</td>
                        <td><strong>{r.testName}</strong></td>
                        <td>{r.department}</td>
                        <td>{r.requestDate}</td>
                        <td><span className={`badge ${r.priority === 'emergency' ? 'badge-danger' : r.priority === 'urgent' ? 'badge-warning' : 'badge-primary'}`}>{r.priority.toUpperCase()}</span></td>
                        <td><span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>{r.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Pending Test Report */}
            {activeReportTab === 'pending_test_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Patient Name & Location</th>
                      <th>Investigation</th>
                      <th>Department</th>
                      <th>Sample Status</th>
                      <th>Pending Stage</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.filter(r => r.status !== 'completed' && r.reportStatus !== 'released').map(r => (
                      <tr key={r.id}>
                        <td><strong>#{r.requestId}</strong></td>
                        <td>{r.patientName} · {r.bedNumber ? `Bed ${r.bedNumber}` : 'OPD'}</td>
                        <td><strong>{r.testName}</strong></td>
                        <td>{r.department}</td>
                        <td><span className="badge badge-warning">{r.sampleStatus.toUpperCase().replace('_', ' ')}</span></td>
                        <td><span className="badge badge-primary">{r.status.toUpperCase().replace('_', ' ')}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => setViewReport(r)}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Diagnostic Result Report */}
            {activeReportTab === 'result_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name & UHID</th>
                      <th>Investigation</th>
                      <th>Observed Result</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                      <th>Authorized By</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.filter(r => r.results.length > 0 || r.findingsText).map(r => (
                      <tr key={r.id}>
                        <td>{r.patientName} ({r.patientId})</td>
                        <td><strong>{r.testName}</strong></td>
                        <td>
                          {r.results[0] ? (
                            <strong>{r.results[0].parameterName}: {r.results[0].value} {r.results[0].unit}</strong>
                          ) : (
                            <span>{r.impressionText || 'Findings recorded'}</span>
                          )}
                        </td>
                        <td>{r.results[0]?.referenceRange || 'Standard'}</td>
                        <td>
                          <span className={`badge ${r.overallResultStatus === 'critical' ? 'badge-danger' : r.overallResultStatus === 'abnormal' ? 'badge-warning' : 'badge-success'}`}>
                            {r.overallResultStatus ? r.overallResultStatus.toUpperCase() : 'NORMAL'}
                          </span>
                        </td>
                        <td>{r.authorizedBy || 'Dr. Sunita Rao'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => setViewReport(r)}>
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Critical Result Report */}
            {activeReportTab === 'critical_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Location</th>
                      <th>Attending Doctor</th>
                      <th>Investigation</th>
                      <th>Critical Parameter & Value</th>
                      <th>Critical Threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.filter(r => r.overallResultStatus === 'critical' || r.results.some(p => p.isCritical)).map(r => {
                      const critP = r.results.find(p => p.isCritical);
                      return (
                        <tr key={r.id} style={{ background: 'rgba(239, 68, 68, 0.04)' }}>
                          <td><strong>{r.patientName}</strong></td>
                          <td><span className="badge badge-primary">{r.bedNumber ? r.bedNumber : 'OPD'}</span> ({r.ward || 'Consultation'})</td>
                          <td>{r.doctorName}</td>
                          <td><strong>{r.testName}</strong></td>
                          <td><strong style={{ color: 'var(--color-danger)' }}>{critP?.parameterName}: {critP?.value} {critP?.unit}</strong></td>
                          <td><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{critP?.referenceRange} (Critical)</span></td>
                          <td><span className="badge badge-danger">CRITICAL PANIC</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. Department-Wise Diagnostic Report */}
            {activeReportTab === 'dept_summary_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diagnostic Discipline</th>
                      <th>Total Requests</th>
                      <th>Completed & Released</th>
                      <th>Pending Runs</th>
                      <th>Critical Results Count</th>
                      <th>Revenue (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['laboratory', 'radiology', 'other'].map(cat => {
                      const catRequests = requests.filter(r => r.category === cat);
                      const completed = catRequests.filter(r => r.status === 'completed' || r.reportStatus === 'released').length;
                      const pending = catRequests.filter(r => r.status !== 'completed' && r.reportStatus !== 'released').length;
                      const critCount = catRequests.filter(r => r.overallResultStatus === 'critical').length;
                      const revenue = catRequests.reduce((sum, r) => sum + r.price, 0);

                      return (
                        <tr key={cat}>
                          <td><strong style={{ textTransform: 'uppercase' }}>{cat === 'other' ? 'Special Diagnostics' : cat}</strong></td>
                          <td><strong>{catRequests.length}</strong></td>
                          <td><span className="badge badge-success">{completed}</span></td>
                          <td><span className="badge badge-warning">{pending}</span></td>
                          <td><span className={`badge ${critCount > 0 ? 'badge-danger' : 'badge-neutral'}`}>{critCount}</span></td>
                          <td><strong style={{ color: 'var(--color-primary)' }}>₹{revenue.toLocaleString()}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Main History Archive */}
            {activeReportTab === 'history_archive' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Patient Details</th>
                      <th>Investigation</th>
                      <th>Category</th>
                      <th>Ordering Doctor</th>
                      <th>Report Status</th>
                      <th>Overall Result</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>#{req.requestId}</strong></td>
                        <td>
                          <strong>{req.patientName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UHID: {req.patientId} · {req.bedNumber ? `Bed ${req.bedNumber}` : 'OPD'}</div>
                        </td>
                        <td>
                          <strong>{req.testName}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.department}</div>
                        </td>
                        <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{req.category}</span></td>
                        <td>{req.doctorName}</td>
                        <td>
                          <span className={`badge ${req.reportStatus === 'released' ? 'badge-success' : req.reportStatus === 'ready' ? 'badge-primary' : 'badge-neutral'}`}>
                            {req.reportStatus.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${req.overallResultStatus === 'critical' ? 'badge-danger' : req.overallResultStatus === 'abnormal' ? 'badge-warning' : 'badge-success'}`}>
                            {req.overallResultStatus ? req.overallResultStatus.toUpperCase() : 'NORMAL'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => setViewReport(req)}
                          >
                            <Eye size={12} /> View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

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
