import React, { useState } from 'react';
import { FlaskConical, Plus, Search, Filter, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

export default function SampleCollectionManagement() {
  const { sampleCollections, collectLabSample, sendSampleToLab } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredSamples = sampleCollections.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.testName.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      s.barcode.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Phlebotomy & Lab Sample Collection Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Specimen collection, barcode labeling, blood draw verification, and transport dispatch to Pathology
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Test Name, Patient, or Barcode..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Sample Statuses ({sampleCollections.length})</option>
            <option value="pending">Pending Collection</option>
            <option value="collected">Collected (Awaiting Dispatch)</option>
            <option value="sent_to_lab">Sent to Diagnostic Lab</option>
          </select>
        </div>
      </div>

      {/* Samples Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Inpatient Diagnostic Specimen Queue</span>
            <span className="badge badge-primary">{filteredSamples.length} Orders</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Bed</th>
                  <th>Lab Test Name</th>
                  <th>Specimen / Tube Type</th>
                  <th>Sample Barcode</th>
                  <th>Ordered Date</th>
                  <th>Collected Time</th>
                  <th>Status</th>
                  <th>Phlebotomist Nurse</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map(sample => {
                  const isPending = sample.status === 'pending';
                  const isCollected = sample.status === 'collected';
                  const isSent = sample.status === 'sent_to_lab';

                  return (
                    <tr key={sample.id}>
                      <td>
                        <strong>{sample.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {sample.bedNumber}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{sample.testName}</strong>
                      </td>
                      <td>{sample.sampleType}</td>
                      <td>
                        <code style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                          {sample.barcode}
                        </code>
                      </td>
                      <td>{sample.orderedDate}</td>
                      <td>{sample.collectionTime || '—'}</td>
                      <td>
                        <span className={`badge ${isSent ? 'badge-success' : isCollected ? 'badge-primary' : 'badge-warning'}`}>
                          {sample.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{sample.collectedBy || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending && (
                          <button className="btn btn-primary btn-sm" onClick={() => collectLabSample(sample.id)}>
                            <ShieldCheck size={12} /> Collect Sample
                          </button>
                        )}
                        {isCollected && (
                          <button className="btn btn-secondary btn-sm" onClick={() => sendSampleToLab(sample.id)}>
                            <ArrowRight size={12} /> Dispatch to Lab
                          </button>
                        )}
                        {isSent && (
                          <span className="badge badge-success">In Lab Processing</span>
                        )}
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
