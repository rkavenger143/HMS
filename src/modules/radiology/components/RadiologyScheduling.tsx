import React, { useState } from 'react';
import { Calendar, Clock, Search, Filter, Plus, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import CreateRadiologyOrderModal from './modals/CreateRadiologyOrderModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyScheduling() {
  const {
    radiologyOrders,
    modalities,
    equipment,
    scheduleExamination,
    rescheduleExamination,
    checkInPatient,
    setActiveTab,
    setSelectedOrderId,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-09-02');
  const [rescheduleOrder, setRescheduleOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [newDate, setNewDate] = useState('2026-09-02');
  const [newTime, setNewTime] = useState('14:00');
  const [rescheduleReason, setRescheduleReason] = useState('Patient transportation delay from ward');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const scheduledOrders = radiologyOrders.filter(
    o => o.status === 'scheduled' || o.status === 'pending_scheduling' || o.checkInStatus === 'arrived' || o.checkInStatus === 'waiting'
  );

  const filtered = scheduledOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    return matchesSearch && matchesMod;
  });

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleOrder) return;

    rescheduleExamination(rescheduleOrder.id, newDate, newTime, rescheduleReason);
    setRescheduleOrder(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Equipment Appointment & Slot Scheduling</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Conflict-free machine reservation, patient arrival tracking, and slot optimization
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={13} /> Book Imaging Slot
        </button>
      </div>

      {/* Equipment Status Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {equipment.map(eq => (
          <div key={eq.id} className="card" style={{ padding: 14, borderLeft: `3px solid ${eq.status === 'available' ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{eq.equipmentName}</div>
              <span className={`badge ${eq.status === 'available' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                {eq.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
              {eq.roomLocation} · Modality: {eq.modalityType.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient Name, UHID, Accession..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
            <option value="ALL">All Modalities</option>
            <option value="xray">X-Ray Rooms</option>
            <option value="ct">CT Scanner Suite</option>
            <option value="mri">MRI High-Field Suite</option>
            <option value="ultrasound">Ultrasound Rooms</option>
            <option value="mammography">Mammography Suite</option>
          </select>
        </div>
      </div>

      {/* Scheduled Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheduled Time</th>
                  <th>Accession & Order</th>
                  <th>Patient Name & Demographics</th>
                  <th>Examination & Modality</th>
                  <th>Referring Doctor</th>
                  <th>Priority</th>
                  <th>Arrival / Check-in</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                        {ord.scheduledTime || 'Unscheduled'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {ord.scheduledDate || ord.orderDate}
                      </div>
                    </td>

                    <td>
                      <strong>{ord.accessionNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.orderNumber}</div>
                    </td>

                    <td>
                      <strong>{ord.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        UHID: {ord.patientId} · {ord.bedNumber ? `Bed ${ord.bedNumber}` : 'OPD'}
                      </div>
                    </td>

                    <td>
                      <div>{ord.examName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{ord.modalityType.toUpperCase()} · {ord.bodyPart}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{ord.referringDoctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ord.department}</div>
                    </td>

                    <td>
                      <span className={`badge ${ord.priority === 'stat' ? 'badge-danger' : ord.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                        {ord.priority.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${ord.checkInStatus === 'ready' || ord.checkInStatus === 'arrived' ? 'badge-success' : 'badge-warning'}`}>
                        {ord.checkInStatus.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => {
                            setSelectedOrderId(ord.id);
                            setActiveTab('check_in');
                          }}
                        >
                          Check-in & Prep
                        </button>

                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, height: 26 }}
                          onClick={() => {
                            setRescheduleOrder(ord);
                            setNewDate(ord.scheduledDate || '2026-09-02');
                            setNewTime(ord.scheduledTime || '14:00');
                          }}
                        >
                          Reschedule
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reschedule Modal Dialog */}
      {rescheduleOrder && (
        <div className="modal-backdrop" onClick={() => setRescheduleOrder(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Reschedule Examination Slot</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {rescheduleOrder.patientName} · {rescheduleOrder.examName} ({rescheduleOrder.accessionNumber})
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setRescheduleOrder(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmReschedule}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">New Scheduled Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Time Slot <span className="required">*</span></label>
                    <select className="form-select" value={newTime} onChange={e => setNewTime(e.target.value)}>
                      {['08:30', '09:15', '10:00', '10:45', '11:30', '12:15', '14:00', '14:45', '15:30', '16:15', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Reason for Rescheduling <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={rescheduleReason}
                      onChange={e => setRescheduleReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRescheduleOrder(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Confirm Slot Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && <CreateRadiologyOrderModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
