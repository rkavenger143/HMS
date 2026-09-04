import React, { useState } from 'react';
import {
  ShieldCheck, Search, Plus, CheckCircle2, AlertTriangle,
  ArrowRight, Droplets, UserCheck, DollarSign, Clock, Printer
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodBagRecord, BloodRequestRecord } from '../context/BloodBankContext';
import IssueBloodModal from './modals/IssueBloodModal';

export default function BloodIssueDesk() {
  const { bloodBags, bloodRequests, issues, setActiveTab } = useBloodBank();

  const [search, setSearch] = useState('');
  const [selectedBagForIssue, setSelectedBagForIssue] = useState<{ bag: BloodBagRecord; request: BloodRequestRecord } | null>(null);

  // Ready to issue units (Reserved or Ready for Issue)
  const readyUnits = bloodBags
    .filter(b => b.status === 'reserved' && b.reservedRequestId)
    .map(bag => {
      const request = bloodRequests.find(r => r.id === bag.reservedRequestId);
      return { bag, request };
    })
    .filter(item => item.request !== undefined) as { bag: BloodBagRecord; request: BloodRequestRecord }[];

  const filteredIssues = issues.filter(iss => {
    const q = search.toLowerCase();
    return (
      !q ||
      iss.id.toLowerCase().includes(q) ||
      iss.patientName.toLowerCase().includes(q) ||
      iss.bagId.toLowerCase().includes(q) ||
      iss.bloodGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(5,150,105,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Unit Issue, Handover & Central Billing Clearance Desk
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Pre-transfusion safety verification: 8-point checklist &rarr; Recipient handover &rarr; Automated Central Billing &rarr; Transfusion tracking
            </div>
          </div>
        </div>
      </div>

      {/* Ready for Issue Queue */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Reserved Blood Units Ready for Issue Handover</span>
              <div className="card-subtitle">Cross-matched and reserved bags awaiting bedside release</div>
            </div>
          </div>
          <span className="badge badge-primary">{readyUnits.length} Ready Units</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Bag ID</th>
                  <th>Reserved For Patient</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Ward & Bed</th>
                  <th>Request Priority</th>
                  <th>Storage Location</th>
                  <th style={{ textAlign: 'right' }}>Handover Action</th>
                </tr>
              </thead>
              <tbody>
                {readyUnits.map(({ bag, request }) => (
                  <tr key={bag.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{bag.id}</strong>
                    </td>

                    <td>
                      <strong>{request.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{request.patientId}</div>
                    </td>

                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>{bag.bloodGroup}</span>
                    </td>

                    <td>{bag.component.replace(/_/g, ' ').toUpperCase()}</td>

                    <td>
                      <div>{request.ward}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bed {request.bed}</div>
                    </td>

                    <td>
                      <span className={`badge ${request.priority === 'emergency' ? 'badge-danger' : 'badge-warning'}`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </td>

                    <td>{bag.storageLocation}</td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: 11 }}
                        onClick={() => setSelectedBagForIssue({ bag, request })}
                      >
                        <ShieldCheck size={11} /> Verify & Issue
                      </button>
                    </td>
                  </tr>
                ))}

                {readyUnits.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No reserved blood units currently waiting for issue. Perform cross-matching to reserve units.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historical Issue Logs Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Completed Blood Handover & Issue Logs</span>
          <span className="badge badge-success">{issues.length} Handed Over</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Bag ID</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Issued To (Nurse/Staff)</th>
                  <th>Ward / Bed</th>
                  <th>Issue Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(iss => (
                  <tr key={iss.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{iss.id}</strong>
                    </td>

                    <td>
                      <strong>{iss.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{iss.patientId}</div>
                    </td>

                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{iss.bagId}</strong>
                    </td>

                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>{iss.bloodGroup}</span>
                    </td>

                    <td>{iss.component.replace(/_/g, ' ').toUpperCase()}</td>

                    <td>
                      <strong>{iss.receivedBy}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{iss.receiverRole}</div>
                    </td>

                    <td>{iss.ward} · {iss.bed}</td>
                    <td>{iss.issuedAt}</td>

                    <td>
                      <span className="badge badge-success">
                        {iss.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                      No blood issues logged yet in this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedBagForIssue && (
        <IssueBloodModal
          bag={selectedBagForIssue.bag}
          request={selectedBagForIssue.request}
          onClose={() => setSelectedBagForIssue(null)}
        />
      )}
    </div>
  );
}
