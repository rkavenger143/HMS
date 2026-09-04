import React, { useState } from 'react';
import { Activity, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';

interface RecordCrossMatchModalProps {
  onClose: () => void;
}

export default function RecordCrossMatchModal({ onClose }: RecordCrossMatchModalProps) {
  const { bloodRequests, bloodBags, recordCrossMatch, reserveBloodBag } = useBloodBank();

  // Pending or approved requests
  const eligibleRequests = bloodRequests.filter(r => r.status === 'approved' || r.status === 'requested');
  const availableBags = bloodBags.filter(b => b.status === 'available');

  const [requestId, setRequestId] = useState(eligibleRequests[0]?.id || '');
  const [bagId, setBagId] = useState(availableBags[0]?.id || '');

  const [majorCrossmatch, setMajorCrossmatch] = useState<'compatible' | 'incompatible'>('compatible');
  const [minorCrossmatch, setMinorCrossmatch] = useState<'compatible' | 'incompatible'>('compatible');
  const [coombsTest, setCoombsTest] = useState<'negative' | 'positive'>('negative');
  const [testedBy, setTestedBy] = useState('Deepak Verma (Technologist)');
  const [verifiedBy, setVerifiedBy] = useState('Dr. V. K. Murthy (Blood Bank Officer)');
  const [autoReserve, setAutoReserve] = useState(true);
  const [remarks, setRemarks] = useState('Negative for agglutination in saline, albumin & Coombs phase at 37°C. Compatible.');

  const selectedRequest = bloodRequests.find(r => r.id === requestId) || bloodRequests[0];
  const selectedBag = bloodBags.find(b => b.id === bagId) || bloodBags[0];

  const overallResult = majorCrossmatch === 'compatible' && minorCrossmatch === 'compatible' && coombsTest === 'negative' ? 'compatible' : 'incompatible';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedBag) {
      alert('Please select both a valid patient request and a blood unit.');
      return;
    }

    recordCrossMatch({
      requestId: selectedRequest.id,
      patientId: selectedRequest.patientId,
      patientName: selectedRequest.patientName,
      patientBloodGroup: selectedRequest.bloodGroup,
      bagId: selectedBag.id,
      bagBloodGroup: selectedBag.bloodGroup,
      component: selectedBag.component,
      majorCrossmatch,
      minorCrossmatch,
      coombsTest,
      overallResult,
      testedBy,
      verifiedBy,
      testDate: new Date().toISOString().slice(0, 10),
      status: 'completed',
      remarks,
    });

    if (overallResult === 'compatible' && autoReserve) {
      reserveBloodBag(selectedBag.id, selectedRequest.id, selectedRequest.patientId, selectedRequest.patientName);
    }

    alert(`Cross-Match test recorded.\nResult: ${overallResult.toUpperCase()}.\n${overallResult === 'compatible' ? `Blood Bag ${selectedBag.id} reserved for ${selectedRequest.patientName}.` : 'Unit NOT compatible for transfusion.'}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <Activity size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="modal-title">Perform Immunohematology Cross-Match Test</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Serological matching between recipient serum and donor red cells
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Request Selection */}
            <div className="form-group">
              <label className="form-label">Select Patient Blood Request <span className="required">*</span></label>
              <select className="form-select" value={requestId} onChange={e => setRequestId(e.target.value)}>
                {bloodRequests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.patientName} ({r.bloodGroup}) · {r.component.toUpperCase()} · Priority: {r.priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Bag Selection */}
            <div className="form-group">
              <label className="form-label">Select Available Blood Bag for Matching <span className="required">*</span></label>
              <select className="form-select" value={bagId} onChange={e => setBagId(e.target.value)}>
                {availableBags.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.bloodGroup}) · {b.component.toUpperCase()} · Exp: {b.expiryDate} · {b.storageLocation}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Results */}
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                Laboratory Cross-Match Observations
              </div>

              <div className="form-grid form-grid-3" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Major Match (Donor Cells + Patient Serum)</label>
                  <select className="form-select" value={majorCrossmatch} onChange={e => setMajorCrossmatch(e.target.value as any)}>
                    <option value="compatible">Compatible (No Agglutination)</option>
                    <option value="incompatible">Incompatible (Agglutination)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Minor Match (Donor Serum + Patient Cells)</label>
                  <select className="form-select" value={minorCrossmatch} onChange={e => setMinorCrossmatch(e.target.value as any)}>
                    <option value="compatible">Compatible (No Agglutination)</option>
                    <option value="incompatible">Incompatible (Agglutination)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Indirect Antiglobulin (Coombs)</label>
                  <select className="form-select" value={coombsTest} onChange={e => setCoombsTest(e.target.value as any)}>
                    <option value="negative">Negative</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>
              </div>

              {/* Overall Compatibility Summary */}
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 6,
                background: overallResult === 'compatible' ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${overallResult === 'compatible' ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ fontSize: 13, color: overallResult === 'compatible' ? '#15803d' : '#b91c1c' }}>
                    Overall Decision: {overallResult === 'compatible' ? 'COMPATIBLE FOR TRANSFUSION' : 'INCOMPATIBLE — DO NOT TRANSFUSE'}
                  </strong>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Patient: {selectedRequest?.bloodGroup} vs Donor Unit: {selectedBag?.bloodGroup}
                  </div>
                </div>

                <span className={`badge ${overallResult === 'compatible' ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 900 }}>
                  {overallResult.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Testing Technologist</label>
                <input type="text" className="form-input" value={testedBy} onChange={e => setTestedBy(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Verified By (Blood Bank Officer)</label>
                <input type="text" className="form-input" value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Laboratory Remarks & Incubation Notes</label>
              <input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            {overallResult === 'compatible' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={autoReserve} onChange={e => setAutoReserve(e.target.checked)} />
                <span>Automatically lock and reserve this blood bag for {selectedRequest?.patientName}</span>
              </label>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> Record & Save Compatibility Findings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
