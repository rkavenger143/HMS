import React, { useState } from 'react';
import { Stethoscope, Plus, Search, Filter, CheckCircle2, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { NursingDoctorOrder } from '../../../types';

export default function DoctorOrdersManagement() {
  const { admissions, doctorOrders, acknowledgeDoctorOrder, completeDoctorOrder, createDoctorOrder } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [admissionId, setAdmissionId] = useState(admissions[0]?.id || '');
  const [orderText, setOrderText] = useState('');
  const [category, setCategory] = useState<NursingDoctorOrder['category']>('medication');
  const [priority, setPriority] = useState<NursingDoctorOrder['priority']>('routine');

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredOrders = doctorOrders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.orderText.toLowerCase().includes(q) ||
      o.patientName.toLowerCase().includes(q) ||
      o.doctorName.toLowerCase().includes(q) ||
      o.bedNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || o.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === admissionId) || admissions[0];

    createDoctorOrder({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      orderText,
      category,
      priority,
    });

    setOrderText('');
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Physician & Doctor Orders</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consultant bedside instructions, stat diagnostic orders, drug titrations, and nursing execution signoffs
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Enter Doctor Order
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
              placeholder="Search Order Text, Doctor, or Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Order Statuses ({doctorOrders.length})</option>
            <option value="new">New Orders</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="completed">Completed</option>
          </select>

          <select className="form-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT / Immediate</option>
          </select>
        </div>
      </div>

      {/* Doctor Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map(order => {
          const isNew = order.status === 'new';
          const isAck = order.status === 'acknowledged' || order.status === 'in_progress';
          const isComp = order.status === 'completed';

          return (
            <div
              key={order.id}
              className="card"
              style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${isComp ? 'var(--color-success)' : order.priority === 'stat' ? 'var(--color-danger)' : 'var(--color-primary)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    {order.patientName} · <span style={{ color: 'var(--color-primary)' }}>Bed {order.bedNumber}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Prescribed by <strong>{order.doctorName}</strong> on {order.orderDate} at {order.orderTime}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : order.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {order.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${isComp ? 'badge-success' : isAck ? 'badge-primary' : 'badge-warning'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                {order.orderText}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <div>
                  Category: <strong>{order.category.toUpperCase()}</strong>
                  {order.acknowledgedBy && <span> · Acknowledged by: <strong>{order.acknowledgedBy}</strong></span>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {isNew && (
                    <button className="btn btn-secondary btn-sm" onClick={() => acknowledgeDoctorOrder(order.id)}>
                      <ShieldCheck size={12} /> Acknowledge Order
                    </button>
                  )}
                  {!isComp && (
                    <button className="btn btn-primary btn-sm" onClick={() => completeDoctorOrder(order.id)}>
                      <CheckCircle2 size={12} /> Mark Executed
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
              <div className="modal-title">Enter Physician Bedside Order</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Inpatient <span className="required">*</span></label>
                    <select className="form-select" value={admissionId} onChange={e => setAdmissionId(e.target.value)}>
                      {activeAdmissions.map(a => (
                        <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Doctor Order Instructions <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Strict I/O monitoring, repeat Serum Potassium stat, escalate O2 if SpO2 < 94%"
                      value={orderText}
                      onChange={e => setOrderText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                      <option value="medication">Medication Order</option>
                      <option value="investigation">Lab / Radiology Scan</option>
                      <option value="procedure">Bedside Procedure</option>
                      <option value="monitoring">Monitoring / Vitals</option>
                      <option value="diet">Diet & Nutrition</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT / Immediate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Doctor Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
