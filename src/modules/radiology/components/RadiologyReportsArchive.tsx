import React, { useState } from 'react';
import { FileText, Search, Filter, Printer, Camera, ShieldCheck } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import PACSViewerModal from './modals/PACSViewerModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyReportsArchive() {
  const { radiologyOrders } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const releasedReports = radiologyOrders.filter(
    o => o.reportStatus === 'verified' || o.reportStatus === 'released' || o.reportStatus === 'amended'
  );

  const filtered = releasedReports.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.referringDoctorName.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    return matchesSearch && matchesMod;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Verified Diagnostic Radiology Reports Archive</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consultant radiologist authorized reports available for immediate clinical review, printing, and EHR release
            </div>
          </div>
        </div>

        <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: 12 }}>
          {releasedReports.length} Released Report{releasedReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Accession #, Patient, Doctor..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
            <option value="ALL">All Diagnostic Modalities</option>
            <option value="xray">Digital Radiography (X-Ray)</option>
            <option value="ct">Computed Tomography (CT)</option>
            <option value="mri">Magnetic Resonance Imaging (MRI)</option>
            <option value="ultrasound">Ultrasound & Doppler</option>
            <option value="mammography">Mammography</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession # & Version</th>
                  <th>Patient Name & Demographics</th>
                  <th>Referring Doctor</th>
                  <th>Examination & Modality</th>
                  <th>Report Date</th>
                  <th>Authorizing Radiologist</th>
                  <th>Report Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{ord.accessionNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Version {ord.version} {ord.version > 1 ? '(Amended)' : ''}
                      </div>
                    </td>

                    <td>
                      <strong>{ord.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        UHID: {ord.patientId} · {ord.gender.toUpperCase()}, {ord.age}y
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{ord.referringDoctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.department}</div>
                    </td>

                    <td>
                      <div>{ord.examName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{ord.modalityType.toUpperCase()} · {ord.bodyPart}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{ord.radiologistAt || ord.orderDate}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{ord.radiologistName}</div>
                    </td>

                    <td>
                      <span className="badge badge-success">RELEASED</span>
                      {ord.isCriticalFinding && (
                        <div style={{ fontSize: 10, color: 'var(--color-danger)', fontWeight: 800, marginTop: 2 }}>
                          ⚠️ CRITICAL
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => setViewPACSOrder(ord)}
                        >
                          <Camera size={12} /> PACS
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => setPrintOrder(ord)}
                        >
                          <Printer size={12} /> View Report
                        </button>
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
      {printOrder && <PrintRadiologyReportModal order={printOrder} onClose={() => setPrintOrder(null)} />}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
    </div>
  );
}
