import React, { useState } from 'react';
import {
  ArrowRightLeft, CheckCircle2, AlertTriangle, BedDouble,
  Search, Clock, ShieldCheck, User, Plus
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

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const availableBeds = beds.filter(b => b.status === 'available');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Room & Bed Transfer Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Clinical step-down, ICU upgrade, room category upgrades, and audit logs
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setSelectedAdmission(activeAdmissions[0] || null)}
          >
            <Plus size={13} /> Initiate Bed Transfer
          </button>
        </div>
      </div>

      {/* Active Inpatients Eligible for Transfer */}
      <div className="card">
        <div className="card-header">
          <BedDouble size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Active Inpatients ({activeAdmissions.length}) — Click to Transfer</span>
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
                          <ArrowRightLeft size={12} /> Transfer Patient
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
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="card-title">Historical Bed Transfer Audit Trail ({filteredTransfers.length})</span>
            <div className="card-subtitle">Complete chronological record of bed re-allocations and room movements</div>
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
