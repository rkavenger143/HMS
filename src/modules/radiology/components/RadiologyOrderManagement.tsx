import React, { useState } from 'react';
import {
  Scan, Search, Filter, Plus, Calendar, Clock, User, FileText,
  AlertTriangle, CheckCircle2, Play, Printer, Camera, ShieldCheck
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import CreateRadiologyOrderModal from './modals/CreateRadiologyOrderModal';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import PACSViewerModal from './modals/PACSViewerModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyOrderManagement() {
  const {
    radiologyOrders,
    selectedOrderId,
    setSelectedOrderId,
    startExamination,
    cancelRadiologyOrder,
    setActiveTab,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState('ALL');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const filteredOrders = radiologyOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q);

    const matchesEnc = selectedEncounter === 'ALL' || ord.encounterType === selectedEncounter;
    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    const matchesPri = selectedPriority === 'ALL' || ord.priority === selectedPriority;
    return matchesSearch && matchesEnc && matchesMod && matchesPri;
  });

  const activeOrder = radiologyOrders.find(o => o.id === selectedOrderId) || filteredOrders[0] || radiologyOrders[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scan size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Requisition & Order Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Comprehensive 2-column order inspector across OPD consultations, IPD admissions, and Emergency casualty
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Order Diagnostic Scan
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Accession, Patient, Order #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedEncounter} onChange={e => setSelectedEncounter(e.target.value)}>
            <option value="ALL">All Encounters (OPD / IPD / Emerg)</option>
            <option value="opd">Outpatient (OPD)</option>
            <option value="ipd">Inpatient (IPD Admission)</option>
            <option value="emergency">Emergency Casualty</option>
          </select>

          <select className="form-select" value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
            <option value="ALL">All Modalities</option>
            <option value="xray">X-Ray</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="mammography">Mammography</option>
            <option value="dexa">DEXA</option>
          </select>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT Immediate</option>
          </select>
        </div>
      </div>

      {/* 2-Column Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 20 }}>
        {/* Left: Orders Roster */}
        <div className="card" style={{ padding: 0, maxHeight: '74vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
            REQUISITION CENSUS ({filteredOrders.length})
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredOrders.map(ord => {
                const isSelected = activeOrder?.id === ord.id;

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <strong style={{ fontSize: 13, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                          {ord.accessionNumber}
                        </strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.orderNumber}</div>
                      </div>

                      <span className={`badge ${ord.priority === 'stat' ? 'badge-danger' : ord.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                        {ord.priority.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                      {ord.patientName}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {ord.examName} ({ord.modalityType.toUpperCase()})
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span className={`badge ${ord.status === 'verified' || ord.status === 'completed' ? 'badge-success' : ord.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {ord.status.toUpperCase().replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {ord.scheduledTime || ord.orderDate.slice(11)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Master Order Inspector */}
        {activeOrder ? (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Inspector Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-primary)' }}>
                    {activeOrder.accessionNumber}
                  </span>
                  <span className="badge badge-primary">{activeOrder.modalityType.toUpperCase()}</span>
                  <span className={`badge ${activeOrder.priority === 'stat' ? 'badge-danger' : activeOrder.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {activeOrder.priority.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Order Requisition: <strong>{activeOrder.orderNumber}</strong> · Placed: {activeOrder.orderDate}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {activeOrder.status === 'scheduled' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedOrderId(activeOrder.id);
                      setActiveTab('check_in');
                    }}
                  >
                    Check-in & Prep
                  </button>
                )}

                {activeOrder.status === 'ready' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startExamination(activeOrder.id, 'Certified Radiographer')}
                  >
                    <Play size={12} /> Start Scan
                  </button>
                )}

                {(activeOrder.status === 'completed' || activeOrder.status === 'verified') && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewPACSOrder(activeOrder)}
                  >
                    <Camera size={12} /> View DICOM in PACS
                  </button>
                )}

                {activeOrder.status === 'verified' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPrintOrder(activeOrder)}
                  >
                    <Printer size={12} /> View / Print Report
                  </button>
                )}

                {activeOrder.status !== 'cancelled' && activeOrder.status !== 'verified' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => cancelRadiologyOrder(activeOrder.id, 'Cancelled by attending clinician')}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Demographics & Clinical Information Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Patient Name: </span>
                <strong style={{ fontSize: 13 }}>{activeOrder.patientName}</strong>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>UHID: {activeOrder.patientId} · {activeOrder.gender.toUpperCase()}, {activeOrder.age}y</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Location: </span>
                <strong>{activeOrder.encounterType.toUpperCase()}</strong>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{activeOrder.bedNumber ? `Bed ${activeOrder.bedNumber} (${activeOrder.ward})` : 'Outpatient Clinic'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Referring Doctor: </span>
                <strong>{activeOrder.referringDoctorName}</strong>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{activeOrder.department}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Billing & Price: </span>
                <strong style={{ color: 'var(--color-primary)' }}>₹{activeOrder.price}</strong>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Status: {activeOrder.paymentStatus.toUpperCase()}</div>
              </div>
            </div>

            {/* Examination Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {activeOrder.examName} ({activeOrder.bodyPart})
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong>Clinical Indication: </strong>{activeOrder.clinicalIndication || activeOrder.clinicalNotes || 'No specific clinical history provided.'}
              </div>
              {activeOrder.contrastRequired && (
                <div style={{ fontSize: 11, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} /> Intravenous contrast media required. Pre-procedure serum creatinine clearance validated.
                </div>
              )}
            </div>

            {/* Findings & Impression Preview if available */}
            {activeOrder.findingsText && (
              <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>
                  RADIOLOGICAL FINDINGS:
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: 12 }}>
                  {activeOrder.findingsText}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  IMPRESSION:
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: activeOrder.isCriticalFinding ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {activeOrder.impressionText}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No radiology order selected.
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreateRadiologyOrderModal onClose={() => setShowCreateModal(false)} />}
      {printOrder && <PrintRadiologyReportModal order={printOrder} onClose={() => setPrintOrder(null)} />}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
    </div>
  );
}
