import React, { useState } from 'react';
import { FileEdit, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import type { ComprehensiveLabOrder, LabOrderItem, LabParameterResult } from '../../../../types';

interface ReportAmendmentModalProps {
  order: ComprehensiveLabOrder;
  item: LabOrderItem;
  onClose: () => void;
}

export default function ReportAmendmentModal({ order, item, onClose }: ReportAmendmentModalProps) {
  const { amendLabReport } = useLab();

  const [amendedValues, setAmendedValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    item.results.forEach(r => {
      init[r.parameterId] = String(r.value);
    });
    return init;
  });

  const [reason, setReason] = useState('Recalibration verification on secondary analyzer');
  const [pathologistName, setPathologistName] = useState('Dr. Sunita Rao, MD (Pathology)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedResults: LabParameterResult[] = item.results.map(r => {
      const rawVal = amendedValues[r.parameterId] || String(r.value);
      const isNum = typeof r.value === 'number' || !isNaN(parseFloat(rawVal));

      return {
        ...r,
        value: isNum ? parseFloat(rawVal) : rawVal,
      };
    });

    amendLabReport(order.id, item.testId, updatedResults, reason, pathologistName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <FileEdit size={18} style={{ color: 'var(--color-warning)' }} />
          <div>
            <span className="modal-title">Amend Verified Laboratory Diagnostic Report</span>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Non-destructive audit versioning (Current Version: v{order.version} → New Version: v{order.version + 1})
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Regulatory Notice Banner */}
            <div style={{ background: 'var(--color-warning-muted)', border: '1px solid var(--color-warning)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 12 }}>
              <strong>NABL AUDIT COMPLIANCE: </strong>
              Verified laboratory reports cannot be silently edited. Amending this report will permanently preserve the previous values in the historical audit trail and increment the official document version.
            </div>

            {/* Parameters Table */}
            <div className="table-container" style={{ marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Previous Verified Value</th>
                    <th>Amended Value <span className="required">*</span></th>
                    <th>Unit</th>
                    <th>Reference Interval</th>
                  </tr>
                </thead>
                <tbody>
                  {item.results.map(r => (
                    <tr key={r.parameterId}>
                      <td><strong>{r.parameterName}</strong></td>
                      <td style={{ color: 'var(--text-tertiary)', textDecoration: amendedValues[r.parameterId] !== String(r.value) ? 'line-through' : 'none' }}>
                        {r.value}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ width: 140, height: 32, fontWeight: 700 }}
                          value={amendedValues[r.parameterId] || ''}
                          onChange={e => setAmendedValues(prev => ({ ...prev, [r.parameterId]: e.target.value }))}
                          required
                        />
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.unit}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.referenceRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Amendment Reason & Authorizing Pathologist */}
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Clinical / Technical Reason for Amendment <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Sample rerun following automated delta-check variance alert"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Authorizing Consultant Pathologist <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={pathologistName}
                  onChange={e => setPathologistName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-warning btn-sm">
              <ShieldCheck size={13} /> Authorize & Issue Amended Report (v{order.version + 1})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
