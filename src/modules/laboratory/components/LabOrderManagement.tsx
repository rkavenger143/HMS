import React, { useState } from 'react';
import {
  FileText, Plus, Search, Filter, Eye, Printer, AlertTriangle,
  CheckCircle2, Clock, X, Ban, Barcode
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import CreateLabOrderModal from './modals/CreateLabOrderModal';
import PrintLabReportModal from './modals/PrintLabReportModal';
import ResultEntryModal from './modals/ResultEntryModal';
import type { ComprehensiveLabOrder, LabOrderItem } from '../../../types';

export default function LabOrderManagement() {
  const {
    labOrders,
    cancelLabOrder,
    selectedOrderId,
    setSelectedOrderId,
    setActiveTab,
  } = useLab();

  const [search, setSearch] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewReportOrder, setViewReportOrder] = useState<ComprehensiveLabOrder | null>(null);
  const [resultEntryItem, setResultEntryItem] = useState<{ order: ComprehensiveLabOrder; item: LabOrderItem } | null>(null);

  const filteredOrders = labOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.doctorName.toLowerCase().includes(q) ||
      (ord.diagnosis && ord.diagnosis.toLowerCase().includes(q));

    const matchesEncounter = selectedEncounter === 'ALL' || ord.encounterType === selectedEncounter;
    const matchesPriority = selectedPriority === 'ALL' || ord.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || ord.status === selectedStatus;

    return matchesSearch && matchesEncounter && matchesPriority && matchesStatus;
  });

  const activeSelectedOrder = labOrders.find(o => o.id === selectedOrderId) || labOrders[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Investigation Order Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Physician test requisitions from OPD, IPD, and Emergency casualty with billing reconciliation and sample dispatch
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Create Lab Order
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient, Order #, Doctor..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedEncounter} onChange={e => setSelectedEncounter(e.target.value)}>
            <option value="ALL">All Encounters</option>
            <option value="opd">OPD Consultations</option>
            <option value="ipd">IPD Inpatients</option>
            <option value="emergency">Emergency / Casualty</option>
          </select>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses ({labOrders.length})</option>
            <option value="ordered">Ordered</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 2-Column Layout: Left Orders Roster, Right Active Order Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: 20, alignItems: 'start' }}>
        {/* Left Orders List */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Lab Orders Census ({filteredOrders.length})</span>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 600, overflowY: 'auto' }}>
            {filteredOrders.map(order => {
              const isSelected = order.id === activeSelectedOrder?.id;
              const hasCrit = order.items.some(i => i.results.some(r => r.isCritical));

              return (
                <div
                  key={order.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--color-primary-muted)' : hasCrit ? 'rgba(255, 69, 58, 0.03)' : undefined,
                    borderLeft: `4px solid ${hasCrit ? 'var(--color-danger)' : order.priority === 'stat' ? 'var(--color-danger)' : isSelected ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                        {order.orderNumber}
                      </span>
                      <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : order.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`} style={{ marginLeft: 6, fontSize: 10 }}>
                        {order.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className={`badge ${order.status === 'verified' ? 'badge-success' : order.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 14 }}>{order.patientName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    UHID: {order.patientId} · {order.encounterType.toUpperCase()} {order.bedNumber ? `· Bed ${order.bedNumber}` : ''}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>Dr. {order.doctorName}</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Order Inspector */}
        {activeSelectedOrder ? (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-primary)' }}>
                    {activeSelectedOrder.orderNumber}
                  </span>
                  <span className={`badge ${activeSelectedOrder.priority === 'stat' ? 'badge-danger' : activeSelectedOrder.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {activeSelectedOrder.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${activeSelectedOrder.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                    {activeSelectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Ordered on {activeSelectedOrder.orderDate} by <strong>{activeSelectedOrder.doctorName}</strong> ({activeSelectedOrder.department})
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {activeSelectedOrder.status === 'verified' && (
                  <button className="btn btn-primary btn-sm" onClick={() => setViewReportOrder(activeSelectedOrder)}>
                    <Printer size={12} /> View Report
                  </button>
                )}
                {activeSelectedOrder.status !== 'cancelled' && activeSelectedOrder.status !== 'verified' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => {
                      const r = prompt('Reason for cancelling lab order:');
                      if (r) cancelLabOrder(activeSelectedOrder.id, r);
                    }}
                  >
                    <Ban size={12} /> Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Patient Demographics Card */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>Patient: <strong>{activeSelectedOrder.patientName}</strong></div>
                <div>UHID: <strong>{activeSelectedOrder.patientId}</strong></div>
                <div>Age/Gender: <strong>{activeSelectedOrder.age}y / {activeSelectedOrder.gender.toUpperCase()}</strong></div>
                <div>Encounter: <strong>{activeSelectedOrder.encounterType.toUpperCase()}</strong></div>
                <div>Location: <strong>{activeSelectedOrder.bedNumber ? `Bed ${activeSelectedOrder.bedNumber} (${activeSelectedOrder.ward})` : 'OPD Clinic'}</strong></div>
                <div>Billing: <span className="badge badge-success">PAID (₹{activeSelectedOrder.totalAmount})</span></div>
              </div>
              {activeSelectedOrder.diagnosis && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border-default)' }}>
                  Diagnosis / Indication: <strong>{activeSelectedOrder.diagnosis}</strong>
                  {activeSelectedOrder.clinicalNotes && ` — ${activeSelectedOrder.clinicalNotes}`}
                </div>
              )}
            </div>

            {/* Investigations in Order */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                Ordered Investigations ({activeSelectedOrder.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeSelectedOrder.items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{item.testName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Code: {item.testCode} · Specimen: <strong>{item.sampleType}</strong> ({item.containerType}) · Price: ₹{item.price}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`badge ${item.status === 'verified' ? 'badge-success' : item.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.status !== 'verified' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => setResultEntryItem({ order: activeSelectedOrder, item })}
                          >
                            Enter Results
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Results Preview */}
                    {item.results.length > 0 && (
                      <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, marginTop: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                          {item.results.map((r, rIdx) => (
                            <div key={rIdx}>
                              <span style={{ color: 'var(--text-secondary)' }}>{r.parameterName}: </span>
                              <strong style={{ color: r.isCritical ? 'var(--color-danger)' : r.status !== 'normal' ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                                {r.value} {r.unit}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Associated Sample IDs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Specimen Tracking IDs: </span>
                <strong>{activeSelectedOrder.sampleIds.join(', ')}</strong>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('sample_tracking')}>
                Track Sample Timeline →
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Select an order to view clinical details.
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreateLabOrderModal onClose={() => setShowCreateModal(false)} />}
      {viewReportOrder && <PrintLabReportModal order={viewReportOrder} onClose={() => setViewReportOrder(null)} />}
      {resultEntryItem && (
        <ResultEntryModal
          order={resultEntryItem.order}
          item={resultEntryItem.item}
          onClose={() => setResultEntryItem(null)}
        />
      )}
    </div>
  );
}
