import React, { useState } from 'react';
import { Barcode, Search, Filter, Printer, CheckCircle2, Clock, User, AlertTriangle } from 'lucide-react';
import { useLab } from '../context/LabContext';
import PrintSampleBarcodeModal from './modals/PrintSampleBarcodeModal';
import type { LabSampleRecord } from '../../../types';

export default function SampleCollectionQueue() {
  const { labSamples, collectSample } = useLab();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [collectorName, setCollectorName] = useState('Deepa Sen (Senior Phlebotomist)');
  const [printSample, setPrintSample] = useState<LabSampleRecord | null>(null);

  const filteredSamples = labSamples.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.patientName.toLowerCase().includes(q) ||
      s.patientId.toLowerCase().includes(q) ||
      s.sampleId.toLowerCase().includes(q) ||
      s.barcode.toLowerCase().includes(q) ||
      s.sampleType.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Barcode size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Phlebotomy & Sample Collection Queue</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Specimen collection desk, tube labeling, unique barcode generation, and phlebotomy verification
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Phlebotomist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 220, height: 32, fontSize: 12 }}
            value={collectorName}
            onChange={e => setCollectorName(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Sample ID, Patient, Barcode..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Collection Statuses ({labSamples.length})</option>
            <option value="pending">Pending Collection</option>
            <option value="recollection_required">Recollection Required</option>
            <option value="collected">Collected</option>
            <option value="accepted">Received & Accepted in Lab</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Samples Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID & Barcode</th>
                  <th>Patient Name & Location</th>
                  <th>Specimen & Tube Type</th>
                  <th>Priority</th>
                  <th>Collection Status</th>
                  <th>Collection Timestamp</th>
                  <th>Phlebotomist</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map(sample => {
                  const isPending = sample.status === 'pending' || sample.status === 'recollection_required';
                  const isRecollect = sample.status === 'recollection_required';

                  return (
                    <tr key={sample.id} style={{ background: isRecollect ? 'rgba(255, 69, 58, 0.04)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                          {sample.sampleId}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                          *{sample.barcode}*
                        </div>
                      </td>

                      <td>
                        <strong>{sample.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {sample.patientId} {sample.bedNumber ? `· Bed ${sample.bedNumber} (${sample.ward})` : '· OPD'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{sample.sampleType}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>
                          {sample.containerType}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${sample.priority === 'stat' ? 'badge-danger' : sample.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                          {sample.priority.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${sample.status === 'completed' || sample.status === 'accepted' ? 'badge-success' : sample.status === 'collected' ? 'badge-info' : isRecollect ? 'badge-danger' : 'badge-warning'}`}>
                          {sample.status.toUpperCase().replace('_', ' ')}
                        </span>
                        {isRecollect && (
                          <div style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2 }}>
                            {sample.rejectionRemarks || 'Specimen Rejected'}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{sample.collectedAt || '—'}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{sample.collectedBy || '—'}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => setPrintSample(sample)}
                            title="Print Barcode Label"
                          >
                            <Printer size={12} /> Label
                          </button>

                          {isPending && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => collectSample(sample.sampleId, collectorName)}
                            >
                              <CheckCircle2 size={12} /> Mark Collected
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

      {printSample && <PrintSampleBarcodeModal sample={printSample} onClose={() => setPrintSample(null)} />}
    </div>
  );
}
