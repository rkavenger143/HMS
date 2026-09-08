import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Activity, AlertCircle } from 'lucide-react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import type {
  DiagnosticRequest,
  DiagnosticResultParameter,
  DiagnosticResultStatus,
} from '../../../../types';

interface EnterDiagnosticResultModalProps {
  request: DiagnosticRequest;
  onClose: () => void;
}

export default function EnterDiagnosticResultModal({
  request,
  onClose,
}: EnterDiagnosticResultModalProps) {
  const { testMaster, enterResults } = useDiagnostic();

  const testDefinition = testMaster.find(t => t.id === request.testId);

  // Initialize parameter results from test definition or existing results
  const [paramResults, setParamResults] = useState<{ [paramId: string]: string | number }>(() => {
    const map: { [paramId: string]: string | number } = {};
    if (request.results && request.results.length > 0) {
      request.results.forEach(r => {
        map[r.parameterId] = r.value;
      });
    } else if (testDefinition) {
      testDefinition.parameters.forEach(p => {
        map[p.id] = p.defaultValue || '';
      });
    }
    return map;
  });

  const [technicianName, setTechnicianName] = useState(
    request.technicianName || 'Aarti Kulkarni, Senior Technologist'
  );
  const [findingsText, setFindingsText] = useState(
    request.findingsText || (testDefinition?.parameters.find(p => p.id.includes('find'))?.defaultValue || '')
  );
  const [impressionText, setImpressionText] = useState(
    request.impressionText || (testDefinition?.parameters.find(p => p.id.includes('imp'))?.defaultValue || '')
  );

  const handleValueChange = (paramId: string, val: string | number) => {
    setParamResults(prev => ({ ...prev, [paramId]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDefinition) return;

    const formattedResults: DiagnosticResultParameter[] = testDefinition.parameters.map(p => {
      const rawVal = paramResults[p.id];
      const numVal = typeof rawVal === 'string' ? parseFloat(rawVal) : Number(rawVal);
      const isNum = !isNaN(numVal) && typeof rawVal !== 'undefined' && rawVal !== '';

      let status: DiagnosticResultStatus = 'normal';
      let isCritical = false;

      // Check numeric critical limits
      if (isNum) {
        if (p.criticalLow !== undefined && numVal < p.criticalLow) {
          status = 'critical';
          isCritical = true;
        } else if (p.criticalHigh !== undefined && numVal > p.criticalHigh) {
          status = 'critical';
          isCritical = true;
        } else {
          // Check abnormal if reference range formatted like "min - max"
          const parts = p.referenceRange.split('-').map(s => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            if (numVal < parts[0] || numVal > parts[1]) {
              status = 'abnormal';
            }
          }
        }
      } else if (typeof rawVal === 'string') {
        const lower = rawVal.toLowerCase();
        if (lower.includes('positive') || lower.includes('abnormal') || lower.includes('cardiomegaly')) {
          status = 'abnormal';
        }
      }

      return {
        parameterId: p.id,
        parameterName: p.name,
        value: rawVal ?? '',
        unit: p.unit,
        referenceRange: p.referenceRange,
        status,
        isCritical,
      };
    });

    enterResults(request.id, formattedResults, technicianName, findingsText, impressionText);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 750 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} style={{ color: 'var(--color-primary)' }} />
            <span className="modal-title">Enter Diagnostic Results — {request.testName}</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient & Request Meta Strip */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Patient: </span>
                <strong>{request.patientName}</strong> ({request.patientId})
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Bed / Location: </span>
                <strong>{request.bedNumber ? `${request.bedNumber} (${request.ward})` : 'OPD'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Doctor: </span>
                <strong>{request.doctorName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Priority: </span>
                <span className={`badge ${request.priority === 'emergency' ? 'badge-danger' : request.priority === 'urgent' ? 'badge-warning' : 'badge-primary'}`}>
                  {request.priority.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Parameter Entry Table for Laboratory & Multi-parameter tests */}
            {testDefinition && testDefinition.parameters.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Observed Parameter Results:
                </div>

                <div className="table-container" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parameter Name</th>
                        <th>Reference Range</th>
                        <th style={{ width: 180 }}>Result Value</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testDefinition.parameters.map(p => {
                        const val = paramResults[p.id];
                        return (
                          <tr key={p.id}>
                            <td>
                              <strong>{p.name}</strong>
                              {p.criticalHigh || p.criticalLow ? (
                                <div style={{ fontSize: 10, color: 'var(--color-danger)' }}>
                                  Panic: {p.criticalLow ? `< ${p.criticalLow}` : ''} {p.criticalHigh ? `> ${p.criticalHigh}` : ''}
                                </div>
                              ) : null}
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {p.referenceRange}
                            </td>
                            <td>
                              {p.format === 'selectable' && p.options ? (
                                <select
                                  className="form-select"
                                  style={{ height: 32, fontSize: 12 }}
                                  value={val}
                                  onChange={e => handleValueChange(p.id, e.target.value)}
                                >
                                  {p.options.map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={p.format === 'numeric' ? 'number' : 'text'}
                                  step="any"
                                  className="form-input"
                                  style={{ height: 32, fontSize: 12, fontWeight: 700 }}
                                  value={val}
                                  onChange={e => handleValueChange(p.id, e.target.value)}
                                  placeholder="Enter value"
                                  required
                                />
                              )}
                            </td>
                            <td style={{ fontSize: 12 }}>{p.unit || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Radiology & Narrative Test Findings */}
            {(request.category === 'radiology' || request.category === 'other') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Radiological / Diagnostic Findings</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter detailed anatomical and pathological findings..."
                    value={findingsText}
                    onChange={e => setFindingsText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Impression</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Summary diagnosis e.g. Normal Study, Cardiomegaly, Fracture..."
                    value={impressionText}
                    onChange={e => setImpressionText(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Technician Signoff */}
            <div className="form-group">
              <label className="form-label">
                Technician / Signatory Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={14} /> Save & Advance to Report Ready
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
