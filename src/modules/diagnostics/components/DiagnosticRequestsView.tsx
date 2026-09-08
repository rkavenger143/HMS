import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  XCircle,
  ArrowRight,
  Barcode,
} from 'lucide-react';
import { useDiagnostic, DiagnosticTab } from '../context/DiagnosticContext';
import CreateDiagnosticRequestModal from './modals/CreateDiagnosticRequestModal';
import PrintDiagnosticReportModal from './modals/PrintDiagnosticReportModal';
import type { DiagnosticPriority, DiagnosticRequest } from '../../../types';

export default function DiagnosticRequestsView() {
  const {
    requests,
    testMaster,
    setSelectedRequestId,
    setActiveTab,
    acceptRequest,
    updatePriority,
    cancelRequest,
    releaseReport,
  } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewRequest, setViewRequest] = useState<DiagnosticRequest | null>(null);

  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q);

    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  const handleAdvanceWorkflow = (req: DiagnosticRequest) => {
    setSelectedRequestId(req.id);
    if (req.status === 'requested') {
      acceptRequest(req.id);
      setActiveTab(req.category === 'laboratory' ? 'sample_collection' : 'processing');
    } else if (req.status === 'sample_collected') {
      setActiveTab('processing');
    } else if (req.status === 'processing') {
      setActiveTab('results');
    } else if (req.status === 'result_ready' || req.status === 'completed') {
      setActiveTab('reports');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Bar */}
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
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Test Requests & Orders</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Central intake for physician orders across Laboratory, Radiology, and Specialty Diagnostic Services
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Create Test Request
        </button>
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
              placeholder="Search Name, UHID, Request #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="normal">Normal Priority</option>
            <option value="urgent">Urgent Priority</option>
            <option value="emergency">Emergency / STAT</option>
          </select>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Disciplines</option>
            <option value="laboratory">Laboratory Services</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="other">Special Diagnostic Tests</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="requested">Requested / Intake</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing">In Processing</option>
            <option value="result_ready">Results Ready</option>
            <option value="completed">Completed / Released</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Name & ID</th>
                  <th>Ordering Doctor</th>
                  <th>Department</th>
                  <th>Test Name & Code</th>
                  <th>Category</th>
                  <th>Request Date</th>
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
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{req.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        UHID: {req.patientId} · {req.bedNumber ? `Bed ${req.bedNumber}` : 'OPD'}
                      </div>
                    </td>

                    {/* Doctor */}
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{req.doctorName}</div>
                    </td>

                    {/* Department */}
                    <td>
                      <div style={{ fontSize: 12 }}>{req.department}</div>
                    </td>

                    {/* Test */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{req.testName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Code: {req.testCode} · ₹{req.price}</div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {req.category}
                      </span>
                    </td>

                    {/* Request Date */}
                    <td>
                      <div style={{ fontSize: 11 }}>{req.requestDate}</div>
                    </td>

                    {/* Priority Level dropdown / badge */}
                    <td>
                      <select
                        className={`form-select ${req.priority === 'emergency' ? 'badge-danger' : req.priority === 'urgent' ? 'badge-warning' : 'badge-primary'}`}
                        style={{ height: 26, fontSize: 10, fontWeight: 700, padding: '0 6px', width: 105 }}
                        value={req.priority}
                        onChange={e => updatePriority(req.id, e.target.value as DiagnosticPriority)}
                      >
                        <option value="normal">NORMAL</option>
                        <option value="urgent">URGENT</option>
                        <option value="emergency">EMERGENCY</option>
                      </select>
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
                            : req.status === 'cancelled'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                      >
                        {req.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          title="View Request & Findings"
                          onClick={() => setViewRequest(req)}
                        >
                          <Eye size={12} />
                        </button>

                        {req.status !== 'cancelled' && req.status !== 'completed' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, padding: '3px 10px' }}
                            onClick={() => handleAdvanceWorkflow(req)}
                          >
                            {req.status === 'requested' ? 'Accept / Collect' : req.status === 'sample_collected' ? 'Process' : 'Results'}
                          </button>
                        )}

                        {req.status === 'requested' && (
                          <button
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            style={{ color: 'var(--color-danger)' }}
                            title="Cancel Request"
                            onClick={() => {
                              const reason = window.prompt('Enter reason for request cancellation:');
                              if (reason) cancelRequest(req.id, reason);
                            }}
                          >
                            <XCircle size={13} />
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
