import React, { useState } from 'react';
import {
  ArrowRightLeft, CheckCircle2, AlertTriangle, BedDouble,
  Search, Clock, ShieldCheck, User, Plus, Sparkles, Building2
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, Bed } from '../../../types';
import TransferModal from './modals/TransferModal';

export default function BedTransferManagement() {
  const {
    transfers,
    admissions,
    beds,
    transferPatient,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  // Direct 4-step transfer panel state
  const [panelAdmissionId, setPanelAdmissionId] = useState('');
  const [panelToBedId, setPanelToBedId] = useState('');
  const [panelReason, setPanelReason] = useState('Clinical Step-down (ICU/HDU to General Ward)');
  const [panelCustomReason, setPanelCustomReason] = useState('');
  const [panelRequestedBy, setPanelRequestedBy] = useState('Dr. Rajesh Kumar');
  const [panelApprovedBy, setPanelApprovedBy] = useState('Dr. Medical Superintendent');
  const [panelSuccessMessage, setPanelSuccessMessage] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const availableBeds = beds.filter(b => b.status === 'available');

  const selectedPanelAdmission = admissions.find(a => a.id === panelAdmissionId) || activeAdmissions[0];
  const selectedPanelTargetBed = beds.find(b => b.id === panelToBedId);

  const filteredTransfers = transfers.filter(t => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.patientName.toLowerCase().includes(q) ||
      t.patientId.toLowerCase().includes(q) ||
      t.fromBedNumber.toLowerCase().includes(q) ||
      t.toBedNumber.toLowerCase().includes(q) ||
      t.reason.toLowerCase().includes(q)
    );
  });

  const handleDirectTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = selectedPanelAdmission;
    if (!adm || !panelToBedId) return;

    transferPatient({
      admissionId: adm.id,
      toBedId: panelToBedId,
      reason: panelCustomReason || panelReason,
      requestedBy: panelRequestedBy,
      approvedBy: panelApprovedBy,
    });

    setPanelSuccessMessage(`✓ Transferred ${adm.patientName} to Bed ${selectedPanelTargetBed?.bedNumber || panelToBedId} successfully!`);
    setPanelToBedId('');
    setTimeout(() => setPanelSuccessMessage(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient Room & Bed Transfer Station</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Direct clinical step-down, ICU transfer, room upgrades, and complete transfer audit history
            </div>
          </div>
        </div>
      </div>

      {panelSuccessMessage && (
        <div style={{ padding: '12px 18px', background: 'var(--color-success-muted)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {panelSuccessMessage}
        </div>
      )}

      {/* 4-Step Direct Transfer Console */}
      <div className="card">
        <div className="card-header">
          <ArrowRightLeft size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Quick Transfer Console (Direct 4-Step Action)</span>
        </div>
        <div className="card-body">
          {activeAdmissions.length > 0 ? (
            <form onSubmit={handleDirectTransfer}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {/* Step 1: Select Inpatient */}
                <div className="form-group">
                  <label className="form-label">1. Select Inpatient <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={panelAdmissionId || selectedPanelAdmission?.id || ''}
                    onChange={e => setPanelAdmissionId(e.target.value)}
                  >
                    {activeAdmissions.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.patientName} — {a.bedNumber} ({a.ward})
                      </option>
                    ))}
                  </select>
                  {selectedPanelAdmission && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      UHID: {selectedPanelAdmission.patientId} · Attending: {selectedPanelAdmission.admittingDoctorName}
                    </div>
                  )}
                </div>

                {/* Step 2: Select Available Bed */}
                <div className="form-group">
                  <label className="form-label">2. Select Destination Bed <span className="required">*</span></label>
                  {availableBeds.length > 0 ? (
                    <select
                      className="form-select"
                      value={panelToBedId}
                      onChange={e => setPanelToBedId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Available Bed --</option>
                      {availableBeds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bedNumber} — {b.ward} ({b.type.toUpperCase()}) | ₹{b.dailyRate}/d
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '6px 10px', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 11 }}>
                      ⚠️ No vacant beds available.
                    </div>
                  )}
                  {selectedPanelTargetBed && (
                    <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 4 }}>
                      ✓ {selectedPanelTargetBed.type.toUpperCase()} · Floor {selectedPanelTargetBed.floor} · Tariff ₹{selectedPanelTargetBed.dailyRate}/d
                    </div>
                  )}
                </div>

                {/* Step 3: Transfer Reason */}
                <div className="form-group">
                  <label className="form-label">3. Clinical / Admin Reason <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={panelReason}
                    onChange={e => setPanelReason(e.target.value)}
                  >
                    <option value="Clinical Step-down (ICU/HDU to General Ward)">Clinical Step-down (ICU/HDU to General Ward)</option>
                    <option value="Clinical Deterioration (Emergency/Ward to ICU)">Clinical Deterioration (Emergency/Ward to ICU)</option>
                    <option value="Patient / Relative Request for Room Upgrade">Patient / Relative Request for Room Upgrade</option>
                    <option value="Infection Control & Isolation Requirement">Infection Control & Isolation Requirement</option>
                    <option value="Post-Operative Recovery Ward Transfer">Post-Operative Recovery Ward Transfer</option>
                    <option value="Routine Bed Re-allocation / Ward Maintenance">Routine Bed Re-allocation / Ward Maintenance</option>
                  </select>
                </div>

                {/* Step 4: Confirm Action */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: 38, justifyContent: 'center', fontWeight: 700 }}
                    disabled={!panelToBedId || availableBeds.length === 0}
                  >
                    <ArrowRightLeft size={14} /> Execute Transfer
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No active inpatients currently admitted.
            </div>
          )}
        </div>
      </div>

      {/* Active Inpatients Eligible for Transfer */}
      <div className="card">
        <div className="card-header">
          <BedDouble size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Active Inpatients Census ({activeAdmissions.length})</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & UHID</th>
                  <th>Current Ward & Bed</th>
                  <th>Attending Doctor</th>
                  <th>Admission Date</th>
                  <th>Condition</th>
                  <th>Primary Diagnosis</th>
                  <th style={{ textAlign: 'right' }}>Transfer Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map(adm => {
                  const isICU = adm.ward.toLowerCase().includes('icu');

                  return (
                    <tr key={adm.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{adm.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 10 }}>{adm.patientId}</div>
                      </td>
                      <td>
                        <span className={`badge ${isICU ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 800 }}>
                          {adm.bedNumber}
                        </span>
                        <span style={{ fontSize: 12, marginLeft: 6 }}>{adm.ward}</span>
                      </td>
                      <td>{adm.admittingDoctorName}</td>
                      <td>{adm.admissionDate}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {adm.condition || 'Stable'}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        <div className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {adm.diagnosis.join(', ')}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '3px 10px', fontSize: 11 }}
                          onClick={() => setSelectedAdmission(adm)}
                        >
                          <ArrowRightLeft size={12} /> Transfer Bed
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Audit Trail Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span className="card-title">Historical Bed Transfer Audit Trail ({filteredTransfers.length})</span>
            <div className="card-subtitle">Complete chronological record of bed movements and sanitization handovers</div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search patient, bed, reason..."
              style={{ paddingLeft: 26, height: 32, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Source Bed (Old)</th>
                  <th>Destination Bed (New)</th>
                  <th>Transfer Reason</th>
                  <th>Requested & Approved By</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 12 }}>{t.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{t.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 10 }}>{t.patientId}</div>
                      </td>
                      <td>
                        <span className="badge badge-danger">{t.fromBedNumber}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.fromWard}</div>
                      </td>
                      <td>
                        <span className="badge badge-success">{t.toBedNumber}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.toWard}</div>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontSize: 12 }}>{t.reason}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>Req: {t.requestedBy}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Appr: {t.approvedBy}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{t.transferDate}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{t.transferTime}</div>
                      </td>
                      <td>
                        <span className="badge badge-success">COMPLETED</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <div className="empty-state-icon"><ArrowRightLeft size={28} /></div>
                        <div className="empty-state-title">No Bed Transfers Logged</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {selectedAdmission && (
        <TransferModal
          admission={selectedAdmission}
          onClose={() => setSelectedAdmission(null)}
        />
      )}
    </div>
  );
}
