import React, { useState } from 'react';
import {
  Calendar, Clock, Plus, Search, CheckCircle2, XCircle, AlertCircle,
  User, Filter, Printer, UserCheck, CalendarDays, List, ArrowRight, X,
  ReceiptText, IndianRupee, Eye, CreditCard
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { Appointment, AppointmentStatus, AppointmentType } from '../../../types';
import AppointmentBillingModal from './modals/AppointmentBillingModal';
import PrintBillModal from './modals/PrintBillModal';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: 'var(--text-secondary)', bg: 'var(--bg-surface)' },
  confirmed: { label: 'Confirmed', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  waiting: { label: 'Checked In / Waiting', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  in_progress: { label: 'In Progress', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  completed: { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  no_show: { label: 'No Show', color: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
};

export default function AppointmentManagement() {
  const {
    appointments,
    patients,
    doctors,
    departments,
    registerExistingPatientVisit,
    setActiveTab,
  } = useOPD();

  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-31');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Central Billing States per Appointment
  const [billingMap, setBillingMap] = useState<Record<string, {
    status: 'unbilled' | 'pending' | 'paid';
    invoiceId?: string;
    receiptNumber?: string;
    amount?: number;
  }>>({
    'apt-001': { status: 'paid', invoiceId: 'INV-2026-00101', receiptNumber: 'RCPT-2026-00101', amount: 800 },
    'apt-002': { status: 'pending', invoiceId: 'INV-2026-00102', amount: 600 },
    'apt-003': { status: 'unbilled', amount: 500 },
    'apt-004': { status: 'paid', invoiceId: 'INV-2026-00104', receiptNumber: 'RCPT-2026-00104', amount: 700 },
  });

  const [billingModalApt, setBillingModalApt] = useState<Appointment | null>(null);
  const [printBillData, setPrintBillData] = useState<any>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-08-31');
  const [newTime, setNewTime] = useState('11:00');
  const [newType, setNewType] = useState<AppointmentType>('opd');
  const [newReason, setNewReason] = useState('');

  // Reschedule Modal
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-01');
  const [rescheduleTime, setRescheduleTime] = useState('10:00');

  // New Filters
  const [deptFilter, setDeptFilter] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('');

  // Filtered appointments
  const filteredAppointments = appointments.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q);

    const matchDate = !dateFilter || a.date === dateFilter;
    const matchDoctor = !doctorFilter || a.doctorId === doctorFilter;
    const matchDept = !deptFilter || a.department === deptFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;

    const billing = billingMap[a.id] || { status: 'unbilled' };
    const matchBilling = !billingStatusFilter || billing.status === billingStatusFilter;

    return matchSearch && matchDate && matchDoctor && matchDept && matchStatus && matchBilling;
  });

  const handleCheckIn = (apt: Appointment) => {
    registerExistingPatientVisit(apt.patientId, {
      doctorId: apt.doctorId,
      department: apt.department,
      visitDate: apt.date,
      visitTime: apt.time,
      visitType: apt.type === 'follow_up' ? 'follow_up' : 'new',
      reasonForVisit: apt.chiefComplaint || 'Scheduled Appointment Check-in',
    });
    setActiveTab('queue');
  };

  const handleConfirm = (id: string) => {
    // In local state, change status to confirmed
    aptStatusUpdate(id, 'confirmed');
  };

  const handleCancel = (id: string) => {
    aptStatusUpdate(id, 'cancelled');
  };

  const handleMarkNoShow = (id: string) => {
    aptStatusUpdate(id, 'no_show');
  };

  const aptStatusUpdate = (id: string, status: AppointmentStatus) => {
    // We can update the matching appointment directly in the state
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleApt) {
      rescheduleApt.date = rescheduleDate;
      rescheduleApt.time = rescheduleTime;
      rescheduleApt.status = 'scheduled';
      setRescheduleApt(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    const doctor = doctors.find(d => d.id === selectedDoctorId);
    if (!patient || !doctor) return;

    const newApt: Appointment = {
      id: `apt-new-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: newDate,
      time: newTime,
      type: newType,
      status: 'scheduled',
      tokenNumber: Math.floor(Math.random() * 20) + 1,
      consultationFee: doctor.consultationFee,
      chiefComplaint: newReason || 'Outpatient Consultation',
      createdAt: new Date().toISOString(),
    };

    appointments.unshift(newApt);
    setShowCreateModal(false);
  };

  // Time slots for calendar view
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Appointment Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Schedule, confirm, reschedule, check-in, and manage patient appointments</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View Toggle */}
          <div className="tabs">
            <button
              className={`tab ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              <List size={13} style={{ display: 'inline', marginRight: 4 }} /> Table View
            </button>
            <button
              className={`tab ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <CalendarDays size={13} style={{ display: 'inline', marginRight: 4 }} /> Calendar View
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search patient, ID, doctor..."
              style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <input
              type="date"
              className="form-input"
              style={{ height: 36, fontSize: 13 }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="waiting">Waiting / Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={billingStatusFilter}
              onChange={e => setBillingStatusFilter(e.target.value)}
            >
              <option value="">All Billing Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="unbilled">Unbilled / Not Generated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content: Table View */}
      {view === 'table' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Apt ID</th>
                  <th>Patient Info</th>
                  <th>Consultant & Dept</th>
                  <th>Date & Time</th>
                  <th>Type & Fee</th>
                  <th>Status</th>
                  <th>Central Billing</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(a => {
                    const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
                    const billing = billingMap[a.id] || { status: 'unbilled', amount: a.consultationFee || 600 };
                    return (
                      <tr key={a.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: 'var(--color-primary)' }}>
                          {a.id}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{a.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.patientId}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.doctorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.department}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{a.date}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.time}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: 10, textTransform: 'uppercase' }}>{a.type}</span>
                          <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600, marginTop: 2 }}>₹{a.consultationFee}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                            <span className="badge-dot" />
                            {sc.label}
                          </span>
                        </td>
                        {/* Central Billing Status & Actions */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {billing.status === 'paid' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="badge badge-success" style={{ fontSize: 10 }}>
                                  Paid (₹{billing.amount})
                                </span>
                                <button
                                  className="btn btn-ghost btn-icon btn-icon-sm"
                                  title="Print Central Receipt"
                                  onClick={() => setPrintBillData({
                                    billNumber: billing.receiptNumber || `RCPT-${a.id}`,
                                    patientName: a.patientName,
                                    patientId: a.patientId,
                                    date: a.date,
                                    total: billing.amount,
                                    paidAmount: billing.amount,
                                    status: 'paid',
                                    items: [
                                      { id: '1', category: 'consultation', description: `OPD Consultation — Dr. ${a.doctorName} (${a.department})`, quantity: 1, unitPrice: billing.amount, totalPrice: billing.amount, date: a.date }
                                    ]
                                  })}
                                >
                                  <Printer size={12} />
                                </button>
                              </div>
                            ) : billing.status === 'pending' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="badge badge-warning" style={{ fontSize: 10 }}>
                                  Pending (₹{billing.amount})
                                </span>
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '2px 8px', fontSize: 10 }}
                                  onClick={() => setBillingModalApt(a)}
                                >
                                  <CreditCard size={10} /> Pay
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="badge badge-neutral" style={{ fontSize: 10, color: 'var(--color-danger)', background: 'var(--color-danger-muted)' }}>
                                  Unbilled
                                </span>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '2px 8px', fontSize: 10 }}
                                  onClick={() => setBillingModalApt(a)}
                                >
                                  <ReceiptText size={10} /> Create Bill
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            {a.status === 'scheduled' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => handleConfirm(a.id)}
                              >
                                <CheckCircle2 size={11} /> Confirm
                              </button>
                            )}

                            {(a.status === 'scheduled' || a.status === 'confirmed') && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 10px', fontSize: 11 }}
                                onClick={() => handleCheckIn(a)}
                              >
                                <UserCheck size={11} /> Check-In
                              </button>
                            )}

                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 6px', fontSize: 11 }}
                              onClick={() => {
                                setRescheduleApt(a);
                                setRescheduleDate(a.date);
                                setRescheduleTime(a.time);
                              }}
                            >
                              Reschedule
                            </button>

                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                style={{ color: 'var(--color-danger)' }}
                                title="Cancel Appointment"
                                onClick={() => handleCancel(a.id)}
                              >
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-state-icon"><Calendar size={28} /></div>
                        <div className="empty-state-title">No Appointments Scheduled</div>
                        <div className="empty-state-desc">Try changing filters or book a new appointment.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Calendar / Time Slot View */}
      {view === 'calendar' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              OPD Slot Schedule for {dateFilter}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Showing time slot occupancy for active clinics
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {TIME_SLOTS.map(slot => {
              const slotApts = filteredAppointments.filter(a => a.time.startsWith(slot.slice(0, 2)));
              return (
                <div
                  key={slot}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
                      <Clock size={14} style={{ color: 'var(--color-primary)' }} /> {slot}
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{slotApts.length} Patients</span>
                  </div>

                  {slotApts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {slotApts.map(a => (
                        <div
                          key={a.id}
                          style={{
                            padding: '8px 10px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${STATUS_CONFIG[a.status]?.color || 'var(--color-primary)'}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{a.patientName}</div>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.time}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {a.doctorName} · {a.department}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                            <span className="badge" style={{ fontSize: 9, background: STATUS_CONFIG[a.status]?.bg, color: STATUS_CONFIG[a.status]?.color }}>
                              {STATUS_CONFIG[a.status]?.label}
                            </span>
                            {a.status !== 'waiting' && a.status !== 'completed' && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '1px 6px', fontSize: 10 }}
                                onClick={() => handleCheckIn(a)}
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '14px', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                      No appointments in this time block
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="modal-backdrop" onClick={() => setRescheduleApt(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Reschedule Appointment</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setRescheduleApt(null)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: 14, fontSize: 13 }}>
                  <div>Patient: <strong>{rescheduleApt.patientName}</strong></div>
                  <div style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>Doctor: {rescheduleApt.doctorName} ({rescheduleApt.department})</div>
                </div>
                <div className="form-grid" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">New Appointment Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={rescheduleDate}
                      onChange={e => setRescheduleDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Slot Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={rescheduleTime}
                      onChange={e => setRescheduleTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRescheduleApt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Book Outpatient Appointment</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowCreateModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Registered Patient <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedPatientId}
                      onChange={e => setSelectedPatientId(e.target.value)}
                      required
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} ({p.id}) — {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Consulting Doctor <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      required
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.department} (Fee: ₹{d.consultationFee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appointment Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slot Time <span className="required">*</span></label>
                    <input
                      type="time"
                      className="form-input"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Appointment Type</label>
                    <select
                      className="form-select"
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                    >
                      <option value="opd">Standard OPD</option>
                      <option value="follow_up">Follow-Up Visit</option>
                      <option value="teleconsult">Tele-Consultation</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Chief Reason / Complaint</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Symptoms or reason for booking..."
                      value={newReason}
                      onChange={e => setNewReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Billing Modal */}
      {billingModalApt && (
        <AppointmentBillingModal
          appointment={billingModalApt}
          onClose={() => setBillingModalApt(null)}
          onPaymentComplete={(data) => {
            setBillingMap(prev => ({
              ...prev,
              [billingModalApt.id]: {
                status: data.status,
                invoiceId: data.invoiceId,
                receiptNumber: data.receiptNumber,
                amount: data.amount,
              },
            }));
          }}
        />
      )}

      {/* Print Receipt / Bill Modal */}
      {printBillData && (
        <PrintBillModal
          bill={printBillData}
          onClose={() => setPrintBillData(null)}
        />
      )}
    </div>
  );
}
