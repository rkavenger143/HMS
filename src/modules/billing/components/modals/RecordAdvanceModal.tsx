import React, { useState } from 'react';
import { DollarSign, CheckCircle2, X } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { DEMO_PATIENTS } from '../../../../data/seedData';
import type { PaymentTender } from '../../../../types';

interface RecordAdvanceModalProps {
  onClose: () => void;
  defaultPatientId?: string;
}

export default function RecordAdvanceModal({ onClose, defaultPatientId }: RecordAdvanceModalProps) {
  const { recordAdvance } = useBilling();

  const [patientId, setPatientId] = useState(defaultPatientId || DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [amount, setAmount] = useState(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTender>('upi');
  const [reference, setReference] = useState('Inpatient Admission & Bed Reservation Deposit');
  const [receivedBy, setReceivedBy] = useState('Ananya Deshmukh (Cashier)');

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Advance amount must be greater than zero.');
      return;
    }

    recordAdvance({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      amount: Number(amount),
      paymentMethod,
      reference,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      receivedBy,
      status: 'available',
    });

    alert(`Advance deposit of ₹${amount} recorded for ${selectedPatient.firstName} ${selectedPatient.lastName}.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Record Patient Advance / Booking Deposit</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Inpatient security deposit & pre-admission advance ledger</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Select Patient <span className="required">*</span></label>
                <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  {DEMO_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Advance Deposit Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  className="form-input"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Tender <span className="required">*</span></label>
                <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cash">Cash Tender</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="net_banking">Net Banking / NEFT</option>
                  <option value="cheque">Demand Draft / Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Deposit Purpose & Reference Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Received By Cashier</label>
                <input
                  type="text"
                  className="form-input"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Collect Advance & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
