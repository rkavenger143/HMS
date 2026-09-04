import React, { useState } from 'react';
import {
  HeartPulse, ShieldAlert, AlertTriangle, Plus, CheckCircle2,
  Clock, Droplets, Activity, FileText, Check, ArrowRight
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { TransfusionRecord, TransfusionReactionRecord } from '../context/BloodBankContext';
import RecordReactionModal from './modals/RecordReactionModal';

export default function TransfusionManagement() {
  const {
    issues,
    transfusions,
    reactions,
    recordTransfusionStart,
    recordTransfusionComplete,
  } = useBloodBank();

  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedTransfusionForReaction, setSelectedTransfusionForReaction] = useState<TransfusionRecord | null>(null);

  // Issues that haven't started transfusion yet
  const pendingTransfusions = issues.filter(iss => !transfusions.some(t => t.issueId === iss.id));

  const handleStartTransfusion = (issue: any) => {
    recordTransfusionStart({
      issueId: issue.id,
      bagId: issue.bagId,
      patientId: issue.patientId,
      patientName: issue.patientName,
      component: issue.component,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      administeredBy: issue.receivedBy || 'Staff Nurse',
      preTransfusionVitals: { bp: '124/80', pulse: 76, temp: 98.6 },
      reactionObserved: false,
      notes: `Transfusion commenced in ${issue.ward} (Bed ${issue.bed}) under standard infusion protocol.`,
    });
    alert(`Transfusion started for ${issue.patientName} (Bag #${issue.bagId}).`);
  };

  const handleCompleteTransfusion = (t: TransfusionRecord) => {
    recordTransfusionComplete(t.id, { bp: '120/78', pulse: 72, temp: 98.4 });
    alert(`Transfusion completed for ${t.patientName} without adverse reactions.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Bedside Transfusion Administration & Adverse Reaction Hemovigilance
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bedside nurse monitoring: Pre-transfusion vitals &rarr; Rate regulation &rarr; Post-transfusion check &rarr; Hemovigilance reaction reports
            </div>
          </div>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => {
            setSelectedTransfusionForReaction(transfusions[0] || null);
            setShowReactionModal(true);
          }}
        >
          <ShieldAlert size={15} /> Report Transfusion Reaction
        </button>
      </div>

      {/* Grid: Active Transfusions & Reaction Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left Column: Issued Units Awaiting Bedside Start */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Issued Units Pending Bedside Transfusion Start</span>
            <span className="badge badge-warning">{pendingTransfusions.length} Issued</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient & UHID</th>
                    <th>Bag ID & Group</th>
                    <th>Ward / Bed</th>
                    <th style={{ textAlign: 'right' }}>Bedside Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransfusions.map(iss => (
                    <tr key={iss.id}>
                      <td>
                        <strong>{iss.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{iss.patientId}</div>
                      </td>

                      <td>
                        <strong style={{ fontFamily: 'monospace' }}>{iss.bagId}</strong>
                        <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 10 }}>{iss.bloodGroup}</span>
                      </td>

                      <td>{iss.ward} · {iss.bed}</td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ height: 26, fontSize: 11 }}
                          onClick={() => handleStartTransfusion(iss)}
                        >
                          <HeartPulse size={11} /> Start Transfusion
                        </button>
                      </td>
                    </tr>
                  ))}

                  {pendingTransfusions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        All issued blood units have been started at bedside.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: In-Progress & Completed Transfusions */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Active Transfusion Sessions ({transfusions.length})</span>
            <span className="badge badge-primary">{transfusions.filter(t => t.status === 'in_progress').length} In Progress</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transfusions.map(t => (
              <div
                key={t.id}
                style={{
                  background: t.status === 'stopped_reaction' ? '#fef2f2' : t.status === 'completed' ? '#f0fdf4' : 'var(--bg-surface)',
                  border: `1.5px solid ${t.status === 'stopped_reaction' ? '#fecaca' : t.status === 'completed' ? '#bbf7d0' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{t.patientName} ({t.patientId})</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      Bag #{t.bagId} · Started at {t.startTime} by {t.administeredBy}
                    </div>
                  </div>

                  <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'stopped_reaction' ? 'badge-danger' : 'badge-warning'}`}>
                    {t.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Pre-Vitals: BP {t.preTransfusionVitals.bp} · Pulse {t.preTransfusionVitals.pulse} bpm · Temp {t.preTransfusionVitals.temp}°F
                </div>

                {t.status === 'in_progress' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, justifyContent: 'center', height: 26, fontSize: 11 }}
                      onClick={() => handleCompleteTransfusion(t)}
                    >
                      <CheckCircle2 size={11} /> Mark Completed
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center', height: 26, fontSize: 11 }}
                      onClick={() => {
                        setSelectedTransfusionForReaction(t);
                        setShowReactionModal(true);
                      }}
                    >
                      <ShieldAlert size={11} /> Reaction Occurred
                    </button>
                  </div>
                )}
              </div>
            ))}

            {transfusions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                No active bedside transfusion sessions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hemovigilance Adverse Reactions Log Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
            <div>
              <span className="card-title">Hemovigilance Transfusion Reaction Incident Logs</span>
              <div className="card-subtitle">Hospital adverse transfusion events and root cause investigations</div>
            </div>
          </div>
          <span className="badge badge-danger">{reactions.length} Incident(s)</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Blood Bag ID</th>
                  <th>Reaction Classification</th>
                  <th>Observed Symptoms</th>
                  <th>Immediate Intervention</th>
                  <th>Attending Doctor</th>
                  <th>Report Time</th>
                  <th>Investigation</th>
                </tr>
              </thead>
              <tbody>
                {reactions.map(rxn => (
                  <tr key={rxn.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-danger)' }}>{rxn.id}</strong>
                    </td>

                    <td>
                      <strong>{rxn.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rxn.patientId}</div>
                    </td>

                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{rxn.bagId}</strong>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-danger)', textTransform: 'uppercase' }}>
                        {rxn.reactionType.replace(/_/g, ' ')}
                      </strong>
                    </td>

                    <td>
                      <div style={{ fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rxn.symptoms}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rxn.immediateIntervention}
                      </div>
                    </td>

                    <td>{rxn.doctorNotified}</td>
                    <td>{rxn.reportedAt}</td>

                    <td>
                      <span className="badge badge-warning">
                        {rxn.investigationStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {reactions.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                      No adverse transfusion reactions reported. Hemovigilance safety index optimal (100%).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showReactionModal && (
        <RecordReactionModal
          transfusion={selectedTransfusionForReaction}
          onClose={() => setShowReactionModal(false)}
        />
      )}
    </div>
  );
}
