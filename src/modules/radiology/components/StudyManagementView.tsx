import React, { useState } from 'react';
import {
  Camera, Search, Filter, Eye, Layers, ShieldCheck, Clock,
  FileText, User, Scan
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PACSViewerModal from './modals/PACSViewerModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function StudyManagementView() {
  const { radiologyOrders, setActiveTab, setSelectedOrderId } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [activePACSOrder, setActivePACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const completedStudies = radiologyOrders.filter(
    o => o.status === 'completed' || o.status === 'verified' || o.studyUid
  );

  const filtered = completedStudies.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    return matchesSearch && matchesMod;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>DICOM Studies & Image Archive (PACS Integration)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Centralized medical imaging archive, series metadata, slice indices, and interactive web PACS viewer
            </div>
          </div>
        </div>

        <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
          {completedStudies.length} Archived Stud{completedStudies.length !== 1 ? 'ies' : 'y'}
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
              placeholder="Search Accession Number, Patient, Study..."
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

      {/* Studies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(study => (
          <div
            key={study.id}
            className="card"
            style={{
              padding: 20,
              borderLeft: '4px solid var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{study.examName}</span>
                    <span className="badge badge-primary">{study.modalityType.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Accession: <strong style={{ color: 'var(--color-primary)' }}>{study.accessionNumber}</strong>
                  </div>
                </div>

                <span className={`badge ${study.reportStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                  {study.reportStatus.toUpperCase()}
                </span>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 12, fontSize: 12 }}>
                <div>Patient: <strong>{study.patientName}</strong> ({study.patientId})</div>
                <div style={{ marginTop: 2 }}>Region: <strong>{study.bodyPart}</strong> {study.contrastRequired ? '· (IV Contrast)' : ''}</div>
                <div style={{ marginTop: 2, color: 'var(--text-tertiary)' }}>Study Date: {study.technicianAt || study.orderDate}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                <div>Acquisition: <strong>{study.seriesCount || 2} Series · {study.imageCount || 48} Slices</strong></div>
                <div>Technician: <strong>{study.technicianName}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActivePACSOrder(study)}>
                <Camera size={13} /> Open PACS Viewer
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedOrderId(study.id);
                  setActiveTab('reporting');
                }}
              >
                <FileText size={13} /> Radiologist Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {activePACSOrder && <PACSViewerModal order={activePACSOrder} onClose={() => setActivePACSOrder(null)} />}
    </div>
  );
}
