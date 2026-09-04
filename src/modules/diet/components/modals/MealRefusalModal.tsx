import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import type { MealDeliveryRecord } from '../../../../types';

interface MealRefusalModalProps {
  delivery: MealDeliveryRecord;
  onClose: () => void;
}

export default function MealRefusalModal({ delivery, onClose }: MealRefusalModalProps) {
  const { recordMealRefusal } = useDiet();

  const [reason, setReason] = useState('Patient Refused / Poor Appetite');
  const [remarks, setRemarks] = useState('Offered alternative soup; patient declined.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordMealRefusal(delivery.id, reason, remarks);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
          <div className="modal-title">Document Inpatient Meal Refusal</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13 }}>
              <div>Patient: <strong>{delivery.patientName}</strong> (Bed {delivery.bedNumber})</div>
              <div>Meal: <strong>{delivery.mealType.toUpperCase()}</strong> · Scheduled: {delivery.scheduledTime}</div>
            </div>

            <div className="form-grid" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Clinical / Operational Reason for Refusal <span className="required">*</span></label>
                <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
                  <option value="Patient Refused / Poor Appetite">Patient Refused / Poor Appetite</option>
                  <option value="Nausea / Emesis / Vomiting">Nausea / Emesis / Vomiting</option>
                  <option value="NPO for Diagnostic Procedure">NPO for Diagnostic Procedure / Surgery</option>
                  <option value="Patient Sleeping / Not Available">Patient Sleeping / Not Available</option>
                  <option value="Food Texture / Temperature Dislike">Food Texture / Temperature Dislike</option>
                  <option value="Outside Food Consumed">Outside Food Consumed</option>
                  <option value="Other Clinical Reason">Other Clinical Reason</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Staff Observations & Actions Taken</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Detail symptoms, alternative feeds offered, or clinical escalation..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger btn-sm">
              <CheckCircle2 size={13} /> Log Meal Refusal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
