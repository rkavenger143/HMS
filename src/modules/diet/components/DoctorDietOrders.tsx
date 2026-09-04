import React, { useState } from 'react';
import { Stethoscope, Plus, Search, Filter, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import CreateDietChartModal from './modals/CreateDietChartModal';
import type { DoctorDietOrder } from '../../../types';

export default function DoctorDietOrders() {
  const { admissions, doctorOrders, acknowledgeDietOrder, completeDietOrder, createDoctorDietOrder } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [prescribeAdmId, setPrescribeAdmId] = useState<string | null>(null);

  // New Order Form State
  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const [admissionId, setAdmissionId] = useState(activeAdmissions[0]?.id || '');
  const [requestedDietType, setRequestedDietType] = useState<DoctorDietOrder['requestedDietType']>('diabetic');
  const [priority, setPriority] = useState<DoctorDietOrder['priority']>('routine');
  const [isNPO, setIsNPO] = useState(false);
  const [npoReason, setNpoReason] = useState('');
  const [instructions, setInstructions] = useState('');

  const filteredOrders = doctorOrders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.patientName.toLowerCase().includes(q) ||
      o.doctorName.toLowerCase().includes(q) ||
      o.bedNumber.toLowerCase().includes(q) ||
      (o.instructions && o.instructions.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = activeAdmissions.find(a => a.id === admissionId) || activeAdmissions[0];
    if (!adm) return;

    createDoctorDietOrder({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      doctorId: 'doc-001',
      doctorName: adm.admittingDoctorName,
      requestedDietType: isNPO ? 'npo' : requestedDietType,
      instructions,
      priority,
      isNPO,
      npoReason: isNPO ? npoReason : undefined,
    });

    setInstructions('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Physician Bedside Diet Orders</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consultant bedside dietary prescriptions, therapeutic nutrition requests, NPO fasting authorizations, and dietitian execution queue
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Enter Doctor Diet Order
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Doctor, Patient, Bed..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Order Statuses ({doctorOrders.length})</option>
            <option value="new">New / Unacknowledged Orders</option>
            <option value="acknowledged">Acknowledged by Dietitian</option>
            <option value="completed">Completed / Active</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map(order => {
          const isNew = order.status === 'new';
          const isAck = order.status === 'acknowledged';
          const isComp = order.status === 'completed';

          return (
            <div
              key={order.id}
              className="card"
              style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${isComp ? 'var(--color-success)' : order.priority === 'stat' || order.isNPO ? 'var(--color-danger)' : 'var(--color-primary)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {order.patientName} · <span style={{ color: 'var(--color-primary)' }}>Bed {order.bedNumber}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Prescribed by <strong>{order.doctorName}</strong> on {order.orderDate}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {order.isNPO && <span className="badge badge-danger">STRICT NPO</span>}
                  <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : order.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {order.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${isComp ? 'badge-success' : isAck ? 'badge-primary' : 'badge-warning'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <strong>Requested Diet: </strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  {order.requestedDietType.toUpperCase().replace('_', ' ')}
                </span>
                {order.instructions && <div><strong>Instructions: </strong>{order.instructions}</div>}
                {order.npoReason && <div style={{ color: 'var(--color-danger)', marginTop: 4 }}><strong>NPO Reason: </strong>{order.npoReason}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <div>
                  {order.acknowledgedBy && <span>Acknowledged by: <strong>{order.acknowledgedBy}</strong> ({order.acknowledgedAt})</span>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {isNew && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => acknowledgeDietOrder(order.id, 'Dietitian Shalini Gupta, RD')}
                    >
                      <ShieldCheck size={12} /> Acknowledge Order
                    </button>
                  )}

                  {!isComp && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setPrescribeAdmId(order.admissionId)}
                    >
                      <Plus size={12} /> Prescribe Diet Chart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Enter Physician Bedside Diet Order</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested Diet Type</label>
                    <select className="form-select" disabled={isNPO} value={requestedDietType} onChange={e => setRequestedDietType(e.target.value as any)}>
                      <option value="regular">Regular Diet</option>
                      <option value="diabetic">Diabetic Diet</option>
                      <option value="cardiac">Cardiac Diet (Low Salt)</option>
                      <option value="renal">Renal Diet</option>
                      <option value="high_protein">High Protein Healing</option>
                      <option value="soft">Soft Diet</option>
                      <option value="liquid">Liquid Diet</option>
                      <option value="icu">ICU Enteral Feed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Priority</label>
                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT / Immediate</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={isNPO} onChange={e => setIsNPO(e.target.checked)} />
                      <span style={{ fontWeight: 700, color: isNPO ? 'var(--color-danger)' : undefined }}>
                        Place patient on Nil Per Os (Strict NPO Fasting)
                      </span>
                    </label>
                  </div>

                  {isNPO && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">NPO Fasting Clinical Indication <span className="required">*</span></label>
                      <input type="text" className="form-input" placeholder="e.g. Pre-op for Appendectomy tomorrow 08:00" value={npoReason} onChange={e => setNpoReason(e.target.value)} required={isNPO} />
                    </div>
                  )}

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Instructions & Restrictions</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Limit fluids to 1.5L/24h, high calcium intake, avoid simple sugars..."
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Submit Diet Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescribe Modal Triggered by Order */}
      {prescribeAdmId && (
        <CreateDietChartModal
          initialAdmissionId={prescribeAdmId}
          onClose={() => {
            const ord = doctorOrders.find(o => o.admissionId === prescribeAdmId);
            if (ord) completeDietOrder(ord.id);
            setPrescribeAdmId(null);
          }}
        />
      )}
    </div>
  );
}
