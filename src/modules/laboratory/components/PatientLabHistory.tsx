import React, { useState } from 'react';
import { History, Search, Filter, Eye, Printer, TrendingUp, Calendar } from 'lucide-react';
import { useLab } from '../context/LabContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import PrintLabReportModal from './modals/PrintLabReportModal';
import type { ComprehensiveLabOrder } from '../../../types';

export default function PatientLabHistory() {
  const { labOrders } = useLab();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [viewReportOrder, setViewReportOrder] = useState<ComprehensiveLabOrder | null>(null);

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const patientOrders = labOrders.filter(o => o.patientId === selectedPatientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Longitudinal Patient Laboratory EHR & Analyte Trends</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Historical laboratory investigations, longitudinal analyte trends, delta-check comparisons, and diagnostic timeline
            </div>
          </div>
        </div>

        {/* Patient Picker */}
        <select
          className="form-select"
          style={{ width: 280 }}
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          {DEMO_PATIENTS.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
            </option>
          ))}
        </select>
      </div>

      {/* Patient Banner */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-md">{selectedPatient.firstName[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                UHID: <strong>{selectedPatient.id}</strong> · {selectedPatient.gender?.toUpperCase()}, {(selectedPatient as any).age || 35}y · Phone: {selectedPatient.phone}
              </div>
            </div>
          </div>

          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
            {patientOrders.length} Lifetime Lab Order{patientOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Historical Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patientOrders.length > 0 ? (
          patientOrders.map(order => (
            <div key={order.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)', paddingBottom: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{order.orderNumber}</span>
                    <span className="badge badge-primary">{order.encounterType.toUpperCase()}</span>
                    <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : 'badge-neutral'}`}>{order.priority.toUpperCase()}</span>
                    <span className={`badge ${order.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>{order.status.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Ordered: <strong>{order.orderDate}</strong> by <strong>{order.doctorName}</strong> ({order.department})
                  </div>
                </div>

                {order.status === 'verified' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setViewReportOrder(order)}>
                    <Printer size={12} /> View Report
                  </button>
                )}
              </div>

              {/* Observed Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)', marginBottom: 8 }}>
                      {item.testName} ({item.testCode})
                    </div>

                    {item.results.length > 0 ? (
                      <div className="table-container">
                        <table className="data-table" style={{ fontSize: 12 }}>
                          <thead>
                            <tr>
                              <th>Parameter</th>
                              <th>Observed Value</th>
                              <th>Unit</th>
                              <th>Reference Range</th>
                              <th>Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.results.map((res, rIdx) => (
                              <tr key={rIdx}>
                                <td><strong>{res.parameterName}</strong></td>
                                <td style={{ fontWeight: 800, color: res.isCritical ? 'var(--color-danger)' : res.status !== 'normal' ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                                  {res.value}
                                </td>
                                <td>{res.unit || '—'}</td>
                                <td>{res.referenceRange}</td>
                                <td>
                                  <span className={`badge ${res.isCritical ? 'badge-danger' : res.status !== 'normal' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: 10 }}>
                                    {res.status.toUpperCase().replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Results pending processing.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No historical laboratory orders found for this patient.
          </div>
        )}
      </div>

      {viewReportOrder && <PrintLabReportModal order={viewReportOrder} onClose={() => setViewReportOrder(null)} />}
    </div>
  );
}
