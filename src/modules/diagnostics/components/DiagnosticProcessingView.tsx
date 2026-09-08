import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import EnterDiagnosticResultModal from './modals/EnterDiagnosticResultModal';
import type { DiagnosticRequest } from '../../../types';

export default function DiagnosticProcessingView() {
  const { requests, startProcessing, setSelectedRequestId, setActiveTab } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [technicianOnDuty, setTechnicianOnDuty] = useState('Aarti Kulkarni, MLT');
  const [activeResultRequest, setActiveResultRequest] = useState<DiagnosticRequest | null>(null);

  // Filter requests active in processing or ready
  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      (r.technicianName && r.technicianName.toLowerCase().includes(q));

    const matchesDept = selectedDepartment === 'ALL' || r.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'pending' && (r.status === 'requested' || r.status === 'sample_collected')) ||
      (selectedStatus === 'processing' && r.status === 'processing') ||
      (selectedStatus === 'completed' && (r.status === 'result_ready' || r.status === 'completed'));

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleStartProcessing = (reqId: string) => {
    startProcessing(reqId, technicianOnDuty);
  };

  const handleOpenResults = (req: DiagnosticRequest) => {
    setActiveResultRequest(req);
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
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Test Processing & Analyzer Queue</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Test Requested → Sample Collected → Processing → Result Ready (Laboratory Analyzer Runs & Imaging Studies)
            </div>
          </div>
        </div>

        {/* Technician Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Assigned Technologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 220, height: 32, fontSize: 12 }}
            value={technicianOnDuty}
            onChange={e => setTechnicianOnDuty(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Test, Technician..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Clinical Pathology">Clinical Pathology</option>
            <option value="Emergency Lab">Emergency Lab</option>
            <option value="Radiology & Imaging">Radiology & Imaging</option>
            <option value="Cardiology Diagnostics">Cardiology Diagnostics</option>
          </select>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Processing Statuses</option>
            <option value="pending">Pending Processing</option>
            <option value="processing">In Progress (Analyzer Run)</option>
            <option value="completed">Results Completed</option>
          </select>
        </div>
      </div>

      {/* Processing Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Name & ID</th>
                  <th>Investigation & Code</th>
                  <th>Assigned Department</th>
                  <th>Assigned Technician</th>
                  <th>Priority</th>
                  <th>Processing Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => {
                  const isProcessing = req.status === 'processing';
                  const isReady = req.status === 'result_ready' || req.status === 'completed';

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
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Code: {req.testCode}</div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="badge badge-primary">{req.department}</span>
                      </td>

                      {/* Technician */}
                      <td>
                        <div style={{ fontSize: 12 }}>{req.technicianName || 'Unassigned'}</div>
                        {req.technicianAt && (
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{req.technicianAt}</div>
                        )}
                      </td>

                      {/* Priority */}
                      <td>
                        <span
                          className={`badge ${
                            req.priority === 'emergency'
                              ? 'badge-danger'
                              : req.priority === 'urgent'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          {req.priority.toUpperCase()}
                        </span>
                      </td>

                      {/* Processing Status */}
                      <td>
                        <span
                          className={`badge ${
                            isReady
                              ? 'badge-success'
                              : isProcessing
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          {isReady ? 'COMPLETED' : isProcessing ? 'IN PROGRESS' : 'PENDING'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {!isProcessing && !isReady && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '3px 10px' }}
                              onClick={() => handleStartProcessing(req.id)}
                            >
                              <Play size={11} /> Start Run
                            </button>
                          )}

                          {isProcessing && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, padding: '3px 10px' }}
                              onClick={() => handleOpenResults(req)}
                            >
                              Enter Results
                            </button>
                          )}

                          {isReady && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                              onClick={() => {
                                setSelectedRequestId(req.id);
                                setActiveTab('results');
                              }}
                            >
                              View Results <ArrowRight size={11} />
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

      {activeResultRequest && (
        <EnterDiagnosticResultModal
          request={activeResultRequest}
          onClose={() => setActiveResultRequest(null)}
        />
      )}
    </div>
  );
}
