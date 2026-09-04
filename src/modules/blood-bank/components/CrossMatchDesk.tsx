import React, { useState } from 'react';
import {
  Activity, Search, Plus, CheckCircle2, AlertTriangle, ShieldCheck,
  Printer, ArrowRight, Droplets, Check, X, FileText
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { CrossMatchRecord } from '../context/BloodBankContext';
import RecordCrossMatchModal from './modals/RecordCrossMatchModal';
import PrintCrossMatchModal from './modals/PrintCrossMatchModal';

export default function CrossMatchDesk() {
  const { crossMatches, bloodRequests, bloodBags, reserveBloodBag, setActiveTab } = useBloodBank();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [printXM, setPrintXM] = useState<CrossMatchRecord | null>(null);

  const filtered = crossMatches.filter(xm => {
    const q = search.toLowerCase();
    return (
      !q ||
      xm.id.toLowerCase().includes(q) ||
      xm.patientName.toLowerCase().includes(q) ||
      xm.bagId.toLowerCase().includes(q) ||
      xm.patientBloodGroup.toLowerCase().includes(q)
    );
  });

  const handleReserveDirect = (xm: CrossMatchRecord) => {
    reserveBloodBag(xm.bagId, xm.requestId, xm.patientId, xm.patientName);
    alert(`Blood bag ${xm.bagId} officially RESERVED for patient ${xm.patientName}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Immunohematology Cross-Matching & Compatibility Testing Desk
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Major & Minor serological compatibility, Antiglobulin (Coombs) cross-match, and pre-transfusion clearance certificates
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Perform Cross-Match
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search cross-match ID, patient name, bag ID..."
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cross-Match Records Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Completed Cross-Match Compatibility Logs</span>
          <span className="badge badge-primary">{crossMatches.length} Tests</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cross-Match ID</th>
                  <th>Patient Name & Group</th>
                  <th>Blood Bag ID & Group</th>
                  <th>Component</th>
                  <th>Major Match</th>
                  <th>Minor Match</th>
                  <th>Coombs / IAT</th>
                  <th>Overall Result</th>
                  <th>Tested & Verified By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(xm => (
                  <tr key={xm.id} style={{ background: xm.overallResult === 'compatible' ? '#f0fdf4' : '#fef2f2' }}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{xm.id}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{xm.testDate}</div>
                    </td>

                    <td>
                      <strong>{xm.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 700 }}>
                        {xm.patientBloodGroup} ({xm.patientId})
                      </div>
                    </td>

                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{xm.bagId}</strong>
                      <div style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 700 }}>
                        {xm.bagBloodGroup}
                      </div>
                    </td>

                    <td>{xm.component.replace(/_/g, ' ').toUpperCase()}</td>

                    <td>
                      <span className={`badge ${xm.majorCrossmatch === 'compatible' ? 'badge-success' : 'badge-danger'}`}>
                        {xm.majorCrossmatch.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${xm.minorCrossmatch === 'compatible' ? 'badge-success' : 'badge-danger'}`}>
                        {xm.minorCrossmatch.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{xm.coombsTest.toUpperCase()}</span>
                    </td>

                    <td>
                      <span className={`badge ${xm.overallResult === 'compatible' ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 900 }}>
                        {xm.overallResult === 'compatible' ? '✓ COMPATIBLE' : '✕ INCOMPATIBLE'}
                      </span>
                    </td>

                    <td>
                      <div>{xm.testedBy}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{xm.verifiedBy}</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: 26, fontSize: 11 }}
                          onClick={() => setPrintXM(xm)}
                          title="Print Official Compatibility Certificate"
                        >
                          <Printer size={11} /> Certificate
                        </button>

                        {xm.overallResult === 'compatible' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => handleReserveDirect(xm)}
                          >
                            Reserve Bag
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No cross-match compatibility records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals Suite */}
      {showModal && (
        <RecordCrossMatchModal onClose={() => setShowModal(false)} />
      )}

      {printXM && (
        <PrintCrossMatchModal crossMatch={printXM} onClose={() => setPrintXM(null)} />
      )}
    </div>
  );
}
