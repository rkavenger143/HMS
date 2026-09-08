import React, { useState } from 'react';
import {
  Barcode,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import type { DiagnosticRequest, DiagnosticSampleStatus } from '../../../types';

export default function DiagnosticSampleCollectionView() {
  const { requests, collectSample, receiveSample, rejectSample, setActiveTab, setSelectedRequestId } = useDiagnostic();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [collectorName, setCollectorName] = useState('Deepa Sen, Phlebotomist');

  // Filter for requests requiring sample collection or intake
  const sampleRequests = requests.filter(r => r.category === 'laboratory');

  const filteredRequests = sampleRequests.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      (r.sampleId && r.sampleId.toLowerCase().includes(q)) ||
      (r.barcode && r.barcode.toLowerCase().includes(q)) ||
      r.testName.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || r.sampleStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCollect = (requestId: string, sampleType?: string) => {
    collectSample(requestId, collectorName, sampleType);
  };

  const handleReceive = (requestId: string) => {
    receiveSample(requestId, 'Sanjay Deshmukh, Lab Receptionist');
  };

  const handleReject = (requestId: string) => {
    const reason = window.prompt('Enter sample rejection reason (e.g. Hemolyzed, Clotted, Insufficient Volume):');
    if (reason) {
      rejectSample(requestId, reason);
    }
  };

  const handleOpenProcessing = (reqId: string) => {
    setSelectedRequestId(reqId);
    setActiveTab('processing');
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
            <Barcode size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Specimen Collection & Intake Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Phlebotomy, vacutainer labeling, barcode tracking, and sample quality acceptance workflow
            </div>
          </div>
        </div>

        {/* Collector Name Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duty Phlebotomist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 210, height: 32, fontSize: 12 }}
            value={collectorName}
            onChange={e => setCollectorName(e.target.value)}
          />
        </div>
      </div>

      {/* Stage Visual Flow */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-warning">1</span>
          <strong>Pending Collection</strong> ({sampleRequests.filter(r => r.sampleStatus === 'pending_collection').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-primary">2</span>
          <strong>Collected / Barcoded</strong> ({sampleRequests.filter(r => r.sampleStatus === 'collected').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-success">3</span>
          <strong>Received in Lab</strong> ({sampleRequests.filter(r => r.sampleStatus === 'received').length})
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="badge badge-danger">4</span>
          <strong>Rejected / Recollect</strong> ({sampleRequests.filter(r => r.sampleStatus === 'rejected').length})
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
              placeholder="Search Patient, Barcode, Sample ID..."
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
            <option value="ALL">All Sample Statuses ({sampleRequests.length})</option>
            <option value="pending_collection">Pending Collection</option>
            <option value="collected">Collected / Labeled</option>
            <option value="received">Received & Accepted</option>
            <option value="rejected">Rejected / Hemolyzed</option>
          </select>
        </div>
      </div>

      {/* Sample Queue Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample / Barcode</th>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Investigation Required</th>
                  <th>Sample & Tube Type</th>
                  <th>Collection Details</th>
                  <th>Sample Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id}>
                    {/* Sample Barcode */}
                    <td>
                      {req.barcode ? (
                        <div>
                          <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                            {req.barcode}
                          </span>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{req.sampleId}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Awaiting Collection</span>
                      )}
                    </td>

                    {/* Patient */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{req.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UHID: {req.patientId}</div>
                    </td>

                    {/* Location */}
                    <td>
                      <span className="badge badge-primary">{req.bedNumber ? req.bedNumber : 'OPD'}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.ward || 'General'}</div>
                    </td>

                    {/* Test */}
                    <td>
                      <strong>{req.testName}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Code: {req.testCode}</div>
                    </td>

                    {/* Specimen / Tube */}
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{req.sampleType || 'Whole Blood'}</div>
                    </td>

                    {/* Collection Details */}
                    <td>
                      {req.sampleCollectedAt ? (
                        <div>
                          <div style={{ fontSize: 11 }}>{req.sampleCollectedAt}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>By: {req.sampleCollectedBy}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-warning)' }}>Pending draw</span>
                      )}
                    </td>

                    {/* Sample Status */}
                    <td>
                      <span
                        className={`badge ${
                          req.sampleStatus === 'received'
                            ? 'badge-success'
                            : req.sampleStatus === 'collected'
                            ? 'badge-primary'
                            : req.sampleStatus === 'rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {req.sampleStatus.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {req.sampleStatus === 'pending_collection' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, padding: '3px 10px' }}
                            onClick={() => handleCollect(req.id, req.sampleType)}
                          >
                            <Barcode size={12} /> Collect & Label
                          </button>
                        )}

                        {req.sampleStatus === 'collected' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                              onClick={() => handleReceive(req.id)}
                            >
                              <Truck size={12} /> Accept in Lab
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, color: 'var(--color-danger)', padding: '3px 6px' }}
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {req.sampleStatus === 'received' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => handleOpenProcessing(req.id)}
                          >
                            Processing Queue <ArrowRight size={11} />
                          </button>
                        )}

                        {req.sampleStatus === 'rejected' && (
                          <button
                            className="btn btn-warning btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => handleCollect(req.id, req.sampleType)}
                          >
                            Re-Collect
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
    </div>
  );
}
