import React, { useState } from 'react';
import { History, Search, Filter, Printer, Camera, Scan, Calendar } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import PACSViewerModal from './modals/PACSViewerModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function PatientRadiologyHistory() {
  const { radiologyOrders } = useRadiology();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const patientOrders = radiologyOrders.filter(o => o.patientId === selectedPatientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Longitudinal Patient Radiology EHR & Prior Study History</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Historical diagnostic examinations, prior scan comparison, and longitudinal imaging timeline
            </div>
          </div>
        </div>

        {/* Patient Picker */}
        <select
          className="form-select"
          style={{ width: 280 }}
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          {DEMO_PATIENTS.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
            </option>
          ))}
        </select>
      </div>

      {/* Patient Profile Card */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-md">{selectedPatient.firstName[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                UHID: <strong>{selectedPatient.id}</strong> · {selectedPatient.gender?.toUpperCase()}, {(selectedPatient as any).age || 35}y · Phone: {selectedPatient.phone}
              </div>
            </div>
          </div>

          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
            {patientOrders.length} Lifetime Imaging Stud{patientOrders.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Historical Studies Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patientOrders.length > 0 ? (
          patientOrders.map(ord => (
            <div key={ord.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)', paddingBottom: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>
                      {ord.accessionNumber}
                    </span>
                    <span className="badge badge-primary">{ord.modalityType.toUpperCase()}</span>
                    <span className="badge badge-neutral">{ord.encounterType.toUpperCase()}</span>
                    <span className={`badge ${ord.reportStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                      {ord.reportStatus.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Ordered: <strong>{ord.orderDate}</strong> · Referring: <strong>{ord.referringDoctorName}</strong> ({ord.department})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {(ord.status === 'completed' || ord.status === 'verified') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setViewPACSOrder(ord)}>
                      <Camera size={12} /> View PACS
                    </button>
                  )}
                  {ord.reportStatus === 'verified' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setPrintOrder(ord)}>
                      <Printer size={12} /> View Report
                    </button>
                  )}
                </div>
              </div>

              {/* Study Summary & Findings */}
              <div style={{ background: 'var(--bg-surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-primary)', marginBottom: 4 }}>
                  {ord.examName} ({ord.bodyPart})
                </div>

                {ord.clinicalIndication && (
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <strong>Indication: </strong>{ord.clinicalIndication}
                  </div>
                )}

                {ord.findingsText ? (
                  <>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                      Report Findings:
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 8 }}>
                      {ord.findingsText}
                    </div>
                    <div style={{ fontWeight: 800, color: ord.isCriticalFinding ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      IMPRESSION: {ord.impressionText}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)' }}>Report drafting in progress.</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No prior radiological studies recorded for this patient.
          </div>
        )}
      </div>

      {/* Modals */}
      {printOrder && <PrintRadiologyReportModal order={printOrder} onClose={() => setPrintOrder(null)} />}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
    </div>
  );
}
