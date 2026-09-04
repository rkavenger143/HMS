import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, CheckCircle2, XCircle, AlertCircle, User, Filter, Printer, ReceiptText, CreditCard } from 'lucide-react';
import { DEMO_APPOINTMENTS, DEMO_DOCTORS, DEMO_PATIENTS } from '../../data/seedData';
import type { Appointment } from '../../types';
import { format } from 'date-fns';
import AppointmentBillingModal from '../opd/components/modals/AppointmentBillingModal';
import PrintBillModal from '../opd/components/modals/PrintBillModal';

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'var(--text-tertiary)', bg: 'var(--bg-surface)' },
  confirmed: { label: 'Confirmed', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  waiting: { label: 'Waiting', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  in_progress: { label: 'In Progress', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  completed: { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  no_show: { label: 'No Show', color: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
};

const TOKEN_QUEUE = DEMO_APPOINTMENTS.filter(a => a.date === '2026-08-31').sort((a, b) => a.tokenNumber - b.tokenNumber);

export default function AppointmentsModule() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-31');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showBook, setShowBook] = useState(false);
  const [view, setView] = useState<'list' | 'queue'>('list');

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

  const apts = DEMO_APPOINTMENTS.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.patientName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    const matchDate = !dateFilter || a.date === dateFilter;
    const matchDoctor = !doctorFilter || a.doctorId === doctorFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchDate && matchDoctor && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span><span className="breadcrumb-sep">›</span><span>Appointments</span>
          </div>
          <div className="page-title">Appointment Management</div>
          <div className="page-subtitle">OPD scheduling, appointment billing, and check-in triage</div>
        </div>
        <div className="flex gap-3">
          <div className="tabs">
            <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List View</button>
            <button className={`tab ${view === 'queue' ? 'active' : ''}`} onClick={() => setView('queue')}>Queue View</button>
          </div>
          <button id="book-appointment-btn" className="btn btn-primary" onClick={() => setShowBook(true)}>
            <Plus size={15} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 mb-6" style={{ gap: 12 }}>
        {[
          { label: 'Total Today', value: TOKEN_QUEUE.length, color: 'var(--color-primary)' },
          { label: 'Waiting', value: TOKEN_QUEUE.filter(a => a.status === 'waiting').length, color: 'var(--color-warning)' },
          { label: 'In Progress', value: TOKEN_QUEUE.filter(a => a.status === 'in_progress').length, color: 'var(--color-primary)' },
          { label: 'Completed', value: TOKEN_QUEUE.filter(a => a.status === 'completed').length, color: 'var(--color-success)' },
          { label: 'Cancelled', value: TOKEN_QUEUE.filter(a => a.status === 'cancelled').length, color: 'var(--color-danger)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {view === 'queue' ? (
        /* Token Queue View */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Queue — {format(new Date('2026-08-31'), 'dd MMMM yyyy')}</h3>
            <button className="btn btn-secondary btn-sm"><Printer size={13} /> Print Queue</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOKEN_QUEUE.map(apt => {
              const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;
              return (
                <div key={apt.id} className="card" style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  borderLeft: `4px solid ${sc.color}`
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, flexShrink: 0
                  }}>
                    {apt.tokenNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{apt.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {apt.patientId} · {apt.doctorName} · {apt.department}
                    </div>
                    {apt.chiefComplaint && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Chief Complaint: {apt.chiefComplaint}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{apt.time}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm">Start Consultation</button>
                    <button className="btn btn-secondary btn-sm">Skip</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body" style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search patient, appointment..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <input className="form-input" type="date" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                <select className="form-select" style={{ width: 180 }} value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
                  <option value="">All Doctors</option>
                  {DEMO_DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor / Dept</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Billing Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apts.map(apt => {
                  const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;
                  const billing = billingMap[apt.id] || { status: 'unbilled', amount: apt.consultationFee || 600 };
                  return (
                    <tr key={apt.id}>
                      <td>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {apt.tokenNumber}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{apt.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 11, marginTop: 2 }}>{apt.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{apt.doctorName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{apt.department}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{apt.date}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 4, alignItems: 'center' }}>
                          <Clock size={11} /> {apt.time}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${apt.type === 'follow_up' ? 'badge-info' : apt.type === 'emergency' ? 'badge-danger' : 'badge-neutral'}`}>
                          {apt.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>₹{apt.consultationFee}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                          <span className="badge-dot" />
                          {sc.label}
                        </span>
                      </td>
                      {/* Billing column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {billing.status === 'paid' ? (
                            <>
                              <span className="badge badge-success" style={{ fontSize: 10 }}>Paid (₹{billing.amount})</span>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Central Receipt"
                                onClick={() => setPrintBillData({
                                  billNumber: billing.receiptNumber || `RCPT-${apt.id}`,
                                  patientName: apt.patientName,
                                  patientId: apt.patientId,
                                  date: apt.date,
                                  total: billing.amount,
                                  paidAmount: billing.amount,
                                  status: 'paid',
                                  items: [{ id: '1', category: 'consultation', description: `Consultation — Dr. ${apt.doctorName}`, quantity: 1, unitPrice: billing.amount, totalPrice: billing.amount, date: apt.date }]
                                })}
                              >
                                <Printer size={12} />
                              </button>
                            </>
                          ) : billing.status === 'pending' ? (
                            <>
                              <span className="badge badge-warning" style={{ fontSize: 10 }}>Pending</span>
                              <button className="btn btn-primary btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => setBillingModalApt(apt)}>
                                <CreditCard size={10} /> Pay
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="badge badge-neutral" style={{ fontSize: 10, color: 'var(--color-danger)', background: 'var(--color-danger-muted)' }}>Unbilled</span>
                              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => setBillingModalApt(apt)}>
                                <ReceiptText size={10} /> Bill
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>Consult</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {apts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Calendar size={28} /></div>
              <div className="empty-state-title">No appointments found</div>
              <div className="empty-state-desc">Try adjusting filters or book a new appointment</div>
            </div>
          )}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBook && (
        <div className="modal-backdrop" onClick={() => setShowBook(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Plus size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="modal-title">Book Appointment</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowBook(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Patient <span className="required">*</span></label>
                  <select className="form-select">
                    <option value="">Search or select patient...</option>
                    {DEMO_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.id}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor <span className="required">*</span></label>
                  <select className="form-select">
                    <option value="">Select doctor...</option>
                    {DEMO_DOCTORS.filter(d => d.isAvailable).map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialization} (Fee: ₹{d.consultationFee})</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Date <span className="required">*</span></label>
                    <input className="form-input" type="date" defaultValue="2026-09-01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Slot <span className="required">*</span></label>
                    <select className="form-select">
                      {['09:00','09:30','10:00','10:30','11:00','11:30','12:00'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Appointment Type</label>
                  <select className="form-select">
                    <option value="opd">OPD — New Visit</option>
                    <option value="follow_up">Follow-Up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chief Complaint</label>
                  <textarea className="form-textarea" placeholder="Briefly describe the reason for visit..." rows={3} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBook(false)}>Cancel</button>
              <button id="confirm-appointment-btn" className="btn btn-primary" onClick={() => setShowBook(false)}>
                <Calendar size={14} /> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
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

      {/* Print Modal */}
      {printBillData && (
        <PrintBillModal
          bill={printBillData}
          onClose={() => setPrintBillData(null)}
        />
      )}
    </div>
  );
}
