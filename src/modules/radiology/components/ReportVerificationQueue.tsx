import React, { useState } from 'react';
import {
  ShieldCheck, Search, Filter, Eye, Printer, FileEdit, AlertTriangle,
  Camera, CheckCircle2, UserCheck, Clock
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import PACSViewerModal from './modals/PACSViewerModal';
import RadiologyReportAmendmentModal from './modals/RadiologyReportAmendmentModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function ReportVerificationQueue() {
  const { radiologyOrders, verifyAndReleaseReport } = useRadiology();

  const [search, setSearch] = useState('');
  const [pathologistName, setPathologistName] = useState('Dr. Vivek Malhotra, MD (Radiodiagnosis)');
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [amendOrder, setAmendOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const verificationQueue = radiologyOrders.filter(
    o => o.findingsText || o.reportStatus === 'draft' || o.reportStatus === 'pending_verification' || o.reportStatus === 'verified'
  );

  const filtered = verificationQueue.filter(ord => {
    const q = search.toLowerCase();
    return (
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Consultant Radiologist Report Verification & Authorization Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Diagnostic impression review, electronic digital authorization, official release, and versioned amendments
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Verifying Radiologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 240, height: 32, fontSize: 12 }}
            value={pathologistName}
            onChange={e => setPathologistName(e.target.value)}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Accession Number, Patient Name..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Verification Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(ord => {
          const isVerified = ord.reportStatus === 'verified';

          return (
            <div
              key={ord.id}
              className="card"
              style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${ord.isCriticalFinding ? 'var(--color-danger)' : isVerified ? 'var(--color-success)' : 'var(--color-warning)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{ord.examName}</span>
                    <span className="badge badge-primary">{ord.modalityType.toUpperCase()}</span>
                    <span className="badge badge-neutral">Accession: {ord.accessionNumber}</span>
                    {ord.isCriticalFinding && <span className="badge badge-danger">⚠️ CRITICAL FINDING</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Patient: <strong>{ord.patientName}</strong> ({ord.patientId}) · Referring: <strong>{ord.referringDoctorName}</strong> ({ord.department})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setViewPACSOrder(ord)}>
                    <Camera size={12} /> PACS
                  </button>

                  {!isVerified ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        verifyAndReleaseReport(ord.id, {
                          technique: ord.technique || '',
                          findingsText: ord.findingsText || '',
                          impressionText: ord.impressionText || '',
                          recommendations: ord.recommendations,
                          radiologistName: pathologistName,
                        })
                      }
                    >
                      <ShieldCheck size={12} /> Authorize & Signoff
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => setPrintOrder(ord)}>
                        <Printer size={12} /> View Report
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-warning)' }}
                        onClick={() => setAmendOrder(ord)}
                      >
                        <FileEdit size={12} /> Amend Report
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Findings & Impression Content Preview */}
              <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
                  FINDINGS:
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: 8 }}>
                  {ord.findingsText || 'Drafting observations in progress...'}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  IMPRESSION:
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: ord.isCriticalFinding ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                  {ord.impressionText || 'Impression pending.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <div>Technician: <strong>{ord.technicianName || 'Certified Radiographer'}</strong> ({ord.technicianAt || ord.scheduledTime})</div>
                {isVerified && <div>Verified by: <strong>{ord.radiologistName}</strong> ({ord.radiologistAt}) · Version {ord.version}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
      {printOrder && <PrintRadiologyReportModal order={printOrder} onClose={() => setPrintOrder(null)} />}
      {amendOrder && <RadiologyReportAmendmentModal order={amendOrder} onClose={() => setAmendOrder(null)} />}
    </div>
  );
}
