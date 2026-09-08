import React, { useState } from 'react';
import { UtensilsCrossed, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import type { MealDeliveryRecord } from '../../../../types';

interface RecordConsumptionModalProps {
  delivery: MealDeliveryRecord;
  onClose: () => void;
}

export default function RecordConsumptionModal({ delivery, onClose }: RecordConsumptionModalProps) {
  const { recordMealConsumption } = useDiet();

  const [consumptionStatus, setConsumptionStatus] = useState<'fully_consumed' | 'partially_consumed' | 'not_consumed'>(
    delivery.consumptionStatus || 'fully_consumed'
  );
  const [patientFeedback, setPatientFeedback] = useState(delivery.patientFeedback || '');
  const [foodProblem, setFoodProblem] = useState(delivery.foodProblem || '');
  const [remarks, setRemarks] = useState(delivery.remarks || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordMealConsumption(delivery.id, consumptionStatus, patientFeedback, foodProblem, remarks);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <UtensilsCrossed size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Record Patient Meal Consumption</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Patient Details Callout */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{delivery.patientName}</strong>
                <span className="badge badge-primary">{delivery.bedNumber} ({delivery.ward})</span>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Meal: <strong>{delivery.mealType.toUpperCase().replace('_', ' ')}</strong> · Scheduled:{' '}
                {delivery.scheduledTime}
              </div>
            </div>

            {/* Consumption Status Radio Group */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Intake Level <span className="required">*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <label
                  style={{
                    border: `1.5px solid ${consumptionStatus === 'fully_consumed' ? 'var(--color-success)' : 'var(--border-default)'}`,
                    background: consumptionStatus === 'fully_consumed' ? 'rgba(50,215,75,0.08)' : 'transparent',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <input
                    type="radio"
                    name="consumption"
                    checked={consumptionStatus === 'fully_consumed'}
                    onChange={() => setConsumptionStatus('fully_consumed')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>Fully Consumed</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>100% Intake</div>
                </label>

                <label
                  style={{
                    border: `1.5px solid ${consumptionStatus === 'partially_consumed' ? 'var(--color-warning)' : 'var(--border-default)'}`,
                    background: consumptionStatus === 'partially_consumed' ? 'rgba(255,159,10,0.08)' : 'transparent',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <input
                    type="radio"
                    name="consumption"
                    checked={consumptionStatus === 'partially_consumed'}
                    onChange={() => setConsumptionStatus('partially_consumed')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 700, color: 'var(--color-warning)' }}>Partially Consumed</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>25% - 75% Intake</div>
                </label>

                <label
                  style={{
                    border: `1.5px solid ${consumptionStatus === 'not_consumed' ? 'var(--color-danger)' : 'var(--border-default)'}`,
                    background: consumptionStatus === 'not_consumed' ? 'rgba(255,69,58,0.08)' : 'transparent',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <input
                    type="radio"
                    name="consumption"
                    checked={consumptionStatus === 'not_consumed'}
                    onChange={() => setConsumptionStatus('not_consumed')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 700, color: 'var(--color-danger)' }}>Not Consumed</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Missed / Refused</div>
                </label>
              </div>
            </div>

            {/* Food Problem Note (if not fully consumed) */}
            {consumptionStatus !== 'fully_consumed' && (
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--color-danger)' }}>
                  Clinical Food Problem / Reason for Incomplete Intake
                </label>
                <select
                  className="form-select"
                  value={foodProblem}
                  onChange={e => setFoodProblem(e.target.value)}
                >
                  <option value="">Select reason...</option>
                  <option value="Nausea / Emesis">Nausea / Emesis (Vomiting)</option>
                  <option value="Loss of appetite / Anorexia">Loss of appetite / Anorexia</option>
                  <option value="Swallowing difficulty / Dysphagia">Swallowing difficulty / Dysphagia</option>
                  <option value="Food temperature / taste preference">Food temperature / taste preference</option>
                  <option value="Fasting for diagnostic procedure">Fasting for diagnostic procedure</option>
                  <option value="Patient sleeping / unavailable">Patient sleeping / unavailable</option>
                  <option value="Other clinical reason">Other clinical reason</option>
                </select>
              </div>
            )}

            {/* Patient Feedback */}
            <div className="form-group">
              <label className="form-label">Patient Feedback & Food Preferences</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Likes mild spice, prefers warm porridge..."
                value={patientFeedback}
                onChange={e => setPatientFeedback(e.target.value)}
              />
            </div>

            {/* Staff Remarks */}
            <div className="form-group">
              <label className="form-label">Nursing / Staff Observations</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Optional clinical notes or tray observations..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Save Intake Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
