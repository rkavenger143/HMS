import React, { useState } from 'react';
import { FlaskConical, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import type { ComprehensiveLabOrder, LabOrderItem, LabParameterResult, LabResultFlag } from '../../../../types';

interface ResultEntryModalProps {
  order: ComprehensiveLabOrder;
  item: LabOrderItem;
  onClose: () => void;
}

export default function ResultEntryModal({ order, item, onClose }: ResultEntryModalProps) {
  const { testMaster, enterTestResults } = useLab();

  const masterTest = testMaster.find(t => t.id === item.testId);
  const parameters = masterTest?.parameters || [];

  // Form State initialized with existing results or defaults
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    parameters.forEach(p => {
      const existing = item.results.find(r => r.parameterId === p.id);
      if (existing) {
        init[p.id] = String(existing.value);
      } else if (p.defaultValue) {
        init[p.id] = p.defaultValue;
      } else {
        init[p.id] = '';
      }
    });
    return init;
  });

  const [technicianName, setTechnicianName] = useState(item.technicianName || 'Sanjay Deshmukh, MLT');
  const [remarks, setRemarks] = useState(order.pathologistRemarks || '');

  // Live flag calculator for a parameter
  const calculateFlag = (paramId: string, rawVal: string): { flag: LabResultFlag; isCritical: boolean } => {
    const param = parameters.find(p => p.id === paramId);
    if (!param || !rawVal) return { flag: 'normal', isCritical: false };

    if (param.format === 'numeric') {
      const num = parseFloat(rawVal);
      if (isNaN(num)) return { flag: 'normal', isCritical: false };

      // Check Critical
      if (param.criticalLow !== undefined && num < param.criticalLow) {
        return { flag: 'critical_low', isCritical: true };
      }
      if (param.criticalHigh !== undefined && num > param.criticalHigh) {
        return { flag: 'critical_high', isCritical: true };
      }

      // Check Range (parse numeric lower and upper bounds)
      const rangeStr = order.gender === 'female' ? param.referenceRangeFemale : param.referenceRangeMale;
      const bounds = rangeStr.match(/(\d+(\.\d+)?)/g);
      if (bounds && bounds.length >= 2) {
        const lower = parseFloat(bounds[0]);
        const upper = parseFloat(bounds[1]);
        if (num < lower) return { flag: 'low', isCritical: false };
        if (num > upper) return { flag: 'high', isCritical: false };
      } else if (bounds && bounds.length === 1) {
        const bound = parseFloat(bounds[0]);
        if (rangeStr.includes('<') && num > bound) return { flag: 'high', isCritical: false };
        if (rangeStr.includes('>') && num < bound) return { flag: 'low', isCritical: false };
      }
      return { flag: 'normal', isCritical: false };
    }

    if (param.format === 'positive_negative') {
      if (rawVal.toLowerCase() === 'positive' || rawVal.toLowerCase() === 'reactive') {
        return { flag: 'abnormal', isCritical: true };
      }
      return { flag: 'normal', isCritical: false };
    }

    return { flag: 'normal', isCritical: false };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const results: LabParameterResult[] = parameters.map(p => {
      const rawVal = paramValues[p.id] || '';
      const { flag, isCritical } = calculateFlag(p.id, rawVal);
      const refRange = order.gender === 'female' ? p.referenceRangeFemale : p.referenceRangeMale;

      return {
        parameterId: p.id,
        parameterName: p.parameterName,
        value: p.format === 'numeric' && !isNaN(parseFloat(rawVal)) ? parseFloat(rawVal) : rawVal,
        unit: p.unit,
        referenceRange: refRange,
        status: flag,
        isCritical,
      };
    });

    enterTestResults(order.id, item.testId, results, technicianName, remarks);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 840 }}>
        <div className="modal-header">
          <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <span className="modal-title">Laboratory Result Entry — {item.testName}</span>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Patient: <strong>{order.patientName}</strong> ({order.patientId}) · Order: <strong>{order.orderNumber}</strong>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Parameters Table Grid */}
            <div className="table-container" style={{ marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter Name</th>
                    <th>Reference Interval</th>
                    <th>Result Value <span className="required">*</span></th>
                    <th>Unit</th>
                    <th>Calculated Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map(p => {
                    const val = paramValues[p.id] || '';
                    const { flag, isCritical } = calculateFlag(p.id, val);
                    const refRange = order.gender === 'female' ? p.referenceRangeFemale : p.referenceRangeMale;

                    return (
                      <tr key={p.id} style={{ background: isCritical ? 'rgba(255, 69, 58, 0.06)' : undefined }}>
                        <td>
                          <strong>{p.parameterName}</strong>
                          {p.criticalHigh && (
                            <div style={{ fontSize: 10, color: 'var(--color-danger)' }}>
                              Critical &gt; {p.criticalHigh} {p.unit}
                            </div>
                          )}
                        </td>

                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {refRange}
                        </td>

                        <td>
                          {p.format === 'numeric' ? (
                            <input
                              type="number"
                              step="any"
                              className="form-input"
                              style={{ width: 140, height: 34, fontWeight: 700 }}
                              placeholder="Enter value"
                              value={val}
                              onChange={e => setParamValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                              required
                            />
                          ) : p.format === 'positive_negative' ? (
                            <select
                              className="form-select"
                              style={{ width: 140, height: 34 }}
                              value={val}
                              onChange={e => setParamValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                            >
                              <option value="Negative">Negative</option>
                              <option value="Positive">Positive</option>
                              <option value="Non-Reactive">Non-Reactive</option>
                              <option value="Reactive">Reactive</option>
                            </select>
                          ) : p.format === 'selectable' && p.options ? (
                            <select
                              className="form-select"
                              style={{ width: 160, height: 34 }}
                              value={val}
                              onChange={e => setParamValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                            >
                              {p.options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: 160, height: 34 }}
                              value={val}
                              onChange={e => setParamValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                            />
                          )}
                        </td>

                        <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          {p.unit || '—'}
                        </td>

                        <td>
                          {val ? (
                            <span className={`badge ${isCritical ? 'badge-danger' : flag === 'high' || flag === 'low' ? 'badge-warning' : 'badge-success'}`}>
                              {flag.toUpperCase().replace('_', ' ')}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Technician Info & Remarks */}
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Medical Lab Technologist (MLT) <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={technicianName}
                  onChange={e => setTechnicianName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technician Observations / Interpretation Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sample processed on Beckman Coulter AU480 analyzer without pre-analytical errors..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Submit Results for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
