import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, AlertTriangle, DollarSign } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';
import { useBilling } from '../../../billing/context/BillingContext';
import type { BloodBagRecord, BloodRequestRecord } from '../../context/BloodBankContext';
import type { DepartmentChargeItem } from '../../../../types';

interface IssueBloodModalProps {
  bag: BloodBagRecord;
  request: BloodRequestRecord;
  onClose: () => void;
}

export default function IssueBloodModal({ bag, request, onClose }: IssueBloodModalProps) {
  const { issueBloodBag } = useBloodBank();
  const { createInvoice } = useBilling();

  const [receivedBy, setReceivedBy] = useState('Staff Nurse Kavita Patil');
  const [receiverRole, setReceiverRole] = useState('Ward Staff Nurse (ICU/Ward)');
  const [issuedBy, setIssuedBy] = useState('Blood Bank Officer (Dr. V. K. Murthy)');
  const [serviceFee, setServiceFee] = useState<number>(1500); // Standard processing & cross-match fee

  // 8 Mandatory Safety Verification Checklist items
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    chk1: true,
    chk2: true,
    chk3: true,
    chk4: true,
    chk5: true,
    chk6: true,
    chk7: true,
    chk8: true,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) {
      alert('All 8 mandatory pre-transfusion safety checklist items must be verified before releasing blood.');
      return;
    }

    const newIssue = issueBloodBag({
      requestId: request.id,
      patientId: request.patientId,
      patientName: request.patientName,
      bagId: bag.id,
      component: bag.component,
      bloodGroup: bag.bloodGroup,
      issuedBy,
      receivedBy,
      receiverRole,
      ward: request.ward,
      bed: request.bed,
      doctorName: request.doctorName,
      safetyCheckVerified: true,
    });

    // Create itemized charge in Central Billing
    const chargeItem: DepartmentChargeItem = {
      id: `chg-bb-${Date.now()}`,
      patientId: request.patientId,
      department: 'ipd' as const,
      sourceModule: 'blood_bank',
      sourceRecordId: newIssue.id,
      serviceCode: 'BB-COMP-PRBC',
      description: `Blood Bank: ${bag.component.toUpperCase()} (${bag.bloodGroup}) · Bag #${bag.id} + Cross-Match`,
      quantity: 1,
      unitPrice: serviceFee,
      discountAmount: 0,
      taxRate: 0,
      totalAmount: serviceFee,
      chargeDate: new Date().toISOString().slice(0, 10),
      createdBy: issuedBy,
      isBilled: true,
    };

    createInvoice({
      patientId: request.patientId,
      patientName: request.patientName,
      uhid: request.patientId,
      encounterType: 'ipd',
      doctorName: request.doctorName,
      department: request.department,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [chargeItem],
      grossAmount: serviceFee,
      discountAmount: 0,
      taxAmount: 0,
      insuranceAmount: 0,
      advanceAdjusted: 0,
      netPayable: serviceFee,
      paidAmount: serviceFee,
      outstandingBalance: 0,
      status: 'paid',
      createdBy: 'Blood Bank Central Desk',
    });

    alert(`Blood Unit ${bag.id} (${bag.bloodGroup}) successfully handed over to ${receivedBy}.\nCentral Billing invoice generated (₹${serviceFee}).`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Pre-Issue Safety Verification & Blood Handover</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Unit: {bag.id} ({bag.bloodGroup} · {bag.component}) &rarr; Recipient: {request.patientName} ({request.ward} · {request.bed})
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Patient:</span>
                <div style={{ fontWeight: 700 }}>{request.patientName} ({request.patientId})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Blood Bag:</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{bag.id} ({bag.bloodGroup})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Ward / Bed:</span>
                <div style={{ fontWeight: 700 }}>{request.ward} · {request.bed}</div>
              </div>
            </div>

            {/* 8-Point Mandatory Safety Verification Checklist */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 10, textTransform: 'uppercase' }}>
                Mandatory 8-Point Pre-Transfusion Safety Checklist
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                {[
                  { id: 'chk1', label: '1. Patient Identity & UHID verified against Requisition Slip' },
                  { id: 'chk2', label: '2. Recipient ABO & Rh blood group verified identical / compatible' },
                  { id: 'chk3', label: '3. Blood Bag ID matches Cross-Match Compatibility Certificate' },
                  { id: 'chk4', label: '4. Donor blood unit within valid expiry date (' + bag.expiryDate + ')' },
                  { id: 'chk5', label: '5. Infectious disease screening markers (HIV, HBV, HCV, VDRL, MP) non-reactive' },
                  { id: 'chk6', label: '6. Bag physical inspection intact (No clots, hemolysis, discoloration, or leak)' },
                  { id: 'chk7', label: '7. Serological Compatibility Certificate signed by Blood Bank Officer' },
                  { id: 'chk8', label: '8. Insulated cold chain transport box provided for ward transfer' },
                ].map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checks[item.id]}
                      onChange={e => setChecks({ ...checks, [item.id]: e.target.checked })}
                    />
                    <span style={{ color: '#0f172a' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipient Staff Information */}
            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Receiving Staff Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Staff Role / Designation</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiverRole}
                  onChange={e => setReceiverRole(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Central Billing Fee Notice */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Central Billing Processing Fee</strong>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Auto-generates billable invoice for component testing & cross-matching
                </div>
              </div>

              <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>₹{serviceFee}</strong>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!allChecked}>
              <CheckCircle2 size={14} /> Confirm Safety Checklist & Handover Blood
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
