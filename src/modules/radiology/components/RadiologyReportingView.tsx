import React, { useState } from 'react';
import {
  FileText, Search, Filter, Camera, ShieldCheck, AlertTriangle,
  CheckCircle2, RefreshCw
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PACSViewerModal from './modals/PACSViewerModal';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyReportingView() {
  const {
    radiologyOrders,
    selectedOrderId,
    setSelectedOrderId,
    reportTemplates,
    saveReportDraft,
    verifyAndReleaseReport,
    escalateCriticalFinding,
    setActiveTab,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [radiologistName, setRadiologistName] = useState('Dr. Vivek Malhotra, MD (Radiodiagnosis)');
  const [technique, setTechnique] = useState('');
  const [findingsText, setFindingsText] = useState('');
  const [impressionText, setImpressionText] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showCriticalDialog, setShowCriticalDialog] = useState(false);
  const [criticalReason, setCriticalReason] = useState('');
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const reportingQueue = radiologyOrders.filter(
    o => o.status === 'completed' || o.reportStatus === 'draft' || o.reportStatus === 'pending_verification' || o.reportStatus === 'verified'
  );

  const filtered = reportingQueue.filter(ord => {
    const q = search.toLowerCase();
    return (
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q)
    );
  });

  const activeOrder = radiologyOrders.find(o => o.id === selectedOrderId) || filtered[0] || reportingQueue[0];

  // Synchronize form when activeOrder changes
  React.useEffect(() => {
    if (activeOrder) {
      setTechnique(activeOrder.technique || `High-resolution protocol performed for ${activeOrder.bodyPart}.`);
      setFindingsText(activeOrder.findingsText || '');
      setImpressionText(activeOrder.impressionText || '');
      setRecommendations(activeOrder.recommendations || '');
    }
  }, [activeOrder?.id]);

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = reportTemplates.find(t => t.id === tmplId);
    if (tmpl) {
      setTechnique(tmpl.defaultTechnique);
      setFindingsText(tmpl.defaultFindings);
      setImpressionText(tmpl.defaultImpression);
      setRecommendations(tmpl.defaultRecommendations || '');
    }
  };

  const handleSaveDraft = () => {
    if (!activeOrder) return;
    saveReportDraft(activeOrder.id, {
      technique,
      findingsText,
      impressionText,
      recommendations,
      radiologistName,
    });
  };

  const handleVerify = () => {
    if (!activeOrder) return;
    verifyAndReleaseReport(activeOrder.id, {
      technique,
      findingsText,
      impressionText,
      recommendations,
      radiologistName,
    });
  };

  const handleConfirmCritical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !criticalReason.trim()) return;

    escalateCriticalFinding(activeOrder.id, criticalReason, radiologistName);
    setShowCriticalDialog(false);
    setCriticalReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Structured Diagnostic Reporting Workstation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Clinical observation entry, template insertion, critical finding panic escalation, and digital authorization
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reporting Radiologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 240, height: 32, fontSize: 12 }}
            value={radiologistName}
            onChange={e => setRadiologistName(e.target.value)}
          />
        </div>
      </div>

      {/* 2-Column Reporting Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 20 }}>
        {/* Left: Reporting Queue Census */}
        <div className="card" style={{ padding: 0, maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search reporting queue..."
                style={{ paddingLeft: 30, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(ord => {
                const isSelected = activeOrder?.id === ord.id;
                const isVerified = ord.reportStatus === 'verified';

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
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                        {ord.accessionNumber}
                      </strong>
                      <span className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                        {ord.reportStatus.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700 }}>{ord.patientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {ord.examName} ({ord.modalityType.toUpperCase()})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Diagnostic Report Editor */}
        {activeOrder ? (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Bar with PACS link & Template Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)', paddingBottom: 14 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{activeOrder.examName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Accession: <strong>{activeOrder.accessionNumber}</strong> · Patient: {activeOrder.patientName} ({activeOrder.patientId})
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ width: 220, height: 32, fontSize: 12 }}
                  value={selectedTemplateId}
                  onChange={e => handleApplyTemplate(e.target.value)}
                >
                  <option value="">Insert Report Template...</option>
                  {reportTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.templateName}</option>
                  ))}
                </select>

                <button className="btn btn-secondary btn-sm" onClick={() => setViewPACSOrder(activeOrder)}>
                  <Camera size={13} /> View PACS
                </button>
              </div>
            </div>

            {/* Structured Report Inputs */}
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Clinical Indication</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: 'var(--bg-surface)' }}
                  readOnly
                  value={activeOrder.clinicalIndication || activeOrder.clinicalNotes || 'None'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Examination Technique</label>
                <input
                  type="text"
                  className="form-input"
                  value={technique}
                  onChange={e => setTechnique(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observations & Structured Findings <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={7}
                  placeholder="Enter detailed anatomical observations..."
                  value={findingsText}
                  onChange={e => setFindingsText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Impression / Diagnostic Conclusion <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter primary impression..."
                  value={impressionText}
                  onChange={e => setImpressionText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Recommendations / Follow-up (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Clinical correlation advised; follow-up scan in 3 months..."
                  value={recommendations}
                  onChange={e => setRecommendations(e.target.value)}
                />
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: 14 }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setCriticalReason(impressionText || '');
                  setShowCriticalDialog(true);
                }}
              >
                <AlertTriangle size={13} /> Escalate Critical Finding
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveDraft}>
                  Save Draft
                </button>

                <button type="button" className="btn btn-primary btn-sm" onClick={handleVerify}>
                  <ShieldCheck size={13} /> Verify & Release Official Report
                </button>

                {activeOrder.reportStatus === 'verified' && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPrintOrder(activeOrder)}>
                    Print Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No study selected in reporting queue.
          </div>
        )}
      </div>

      {/* Critical Finding Escalation Dialog */}
      {showCriticalDialog && (
        <div className="modal-backdrop" onClick={() => setShowCriticalDialog(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
              <div>
                <div className="modal-title">Escalate Critical / Panic Radiological Finding</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {activeOrder?.patientName} · {activeOrder?.examName}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowCriticalDialog(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmCritical}>
              <div className="modal-body">
                <div className="form-grid" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Critical Finding Summary (Life-Threatening Emergency) <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Acute Intracerebral Hemorrhage with 3mm midline shift. Immediate neurosurgical consultation required..."
                      value={criticalReason}
                      onChange={e => setCriticalReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCriticalDialog(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm">
                  <AlertTriangle size={13} /> Dispatch Critical Alert to Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewPACSOrder && <PACSViewerModal order={viewPACSOrder} onClose={() => setViewPACSOrder(null)} />}
      {printOrder && <PrintRadiologyReportModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </div>
  );
}
