import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Plus, Search, CheckCircle2, XCircle,
  AlertCircle, User, Filter, Printer, ReceiptText, CreditCard,
  Trash2, Edit3, Eye, Check, X, Stethoscope, ChevronRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import type { Appointment } from '../../types';
import { format } from 'date-fns';
import { useToast } from '../../contexts/ToastContext';
import AppointmentBillingModal from '../opd/components/modals/AppointmentBillingModal';
import PrintBillModal from '../opd/components/modals/PrintBillModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: '#64748b', bg: '#f1f5f9' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  waiting: { label: 'Waiting', color: '#d97706', bg: '#fffbeb' },
  in_progress: { label: 'In Consultation', color: '#2563eb', bg: '#eff6ff' },
  completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fff1f2' },
  no_show: { label: 'No Show', color: '#8b5cf6', bg: '#f5f3ff' },
};

export default function AppointmentsModule() {
  const { showToast } = useToast();

  const [apts, setApts] = useState<Appointment[]>(() => storageService.getAppointments());
  const [patients, setPatients] = useState(() => storageService.getPatients());
  const [doctors, setDoctors] = useState(() => storageService.getDoctors());

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showBook, setShowBook] = useState(false);
  const [view, setView] = useState<'list' | 'queue'>('list');

  // Book Appointment Form state
  const [formPatientId, setFormPatientId] = useState('');
  const [formDoctorId, setFormDoctorId] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formTime, setFormTime] = useState('09:30');
  const [formType, setFormType] = useState('opd');
  const [formComplaint, setFormComplaint] = useState('');

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

  useEffect(() => {
    const handleUpdate = () => {
      setApts(storageService.getAppointments());
      setPatients(storageService.getPatients());
      setDoctors(storageService.getDoctors());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  const handleOpenBook = () => {
    if (patients.length > 0) setFormPatientId(patients[0].id);
    if (doctors.length > 0) setFormDoctorId(doctors[0].id);
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormTime('09:30');
    setFormType('opd');
    setFormComplaint('');
    setShowBook(true);
  };

  const handleConfirmBook = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === formPatientId) || patients[0];
    const selDoctor = doctors.find(d => d.id === formDoctorId) || doctors[0];

    if (!selPatient || !selDoctor) {
      showToast('Please select both a patient and doctor', 'warning');
      return;
    }

    const created = storageService.addAppointment({
      patientId: selPatient.id,
      patientName: `${selPatient.firstName} ${selPatient.lastName}`,
      doctorId: selDoctor.id,
      doctorName: selDoctor.name,
      department: selDoctor.department,
      date: formDate,
      time: formTime,
      type: formType as any,
      chiefComplaint: formComplaint || 'OPD Consultation',
      consultationFee: selDoctor.consultationFee,
      status: 'scheduled',
    });

    showToast(`Appointment booked for ${created.patientName} (Token #${created.tokenNumber})`, 'success');
    setShowBook(false);
  };

  const handleUpdateStatus = (id: string, newStatus: Appointment['status']) => {
    storageService.updateAppointment(id, { status: newStatus });
    showToast(`Appointment marked as ${newStatus.replace('_', ' ')}`, 'success');
  };

  const handleDeleteAppointment = (id: string, patientName: string) => {
    if (window.confirm(`Cancel appointment for ${patientName}?`)) {
      storageService.updateAppointment(id, { status: 'cancelled' });
      showToast(`Appointment for ${patientName} cancelled`, 'info');
    }
  };

  const filteredApts = apts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || (a.patientName || '').toLowerCase().includes(q) || (a.id || '').toLowerCase().includes(q) || (a.doctorName || '').toLowerCase().includes(q);
    const matchDate = !dateFilter || a.date === dateFilter;
    const matchDoctor = !doctorFilter || a.doctorId === doctorFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchDate && matchDoctor && matchStatus;
  });

  const tokenQueue = apts
    .filter(a => a.date === dateFilter)
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span><span className="breadcrumb-sep">›</span><span>Appointments / OPD</span>
          </div>
          <div className="page-title">Appointment Scheduling & Queue Triage</div>
          <div className="page-subtitle">Outpatient visit scheduling, consultation queue, and billing checkout</div>
        </div>
        <div className="flex gap-3">
          <div className="tabs">
            <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List View</button>
            <button className={`tab ${view === 'queue' ? 'active' : ''}`} onClick={() => setView('queue')}>Queue View</button>
          </div>
          <button id="book-appointment-btn" className="btn btn-primary" onClick={handleOpenBook}>
            <Plus size={15} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5" style={{ gap: 12 }}>
        {[
          { label: 'Total for Date', value: tokenQueue.length, color: '#2563eb' },
          { label: 'Waiting in Lobby', value: tokenQueue.filter(a => a.status === 'waiting' || a.status === 'scheduled').length, color: '#d97706' },
          { label: 'In Consultation', value: tokenQueue.filter(a => a.status === 'in_progress').length, color: '#2563eb' },
          { label: 'Completed Consults', value: tokenQueue.filter(a => a.status === 'completed').length, color: '#10b981' },
          { label: 'Cancelled / No-Show', value: tokenQueue.filter(a => a.status === 'cancelled' || a.status === 'no_show').length, color: '#ef4444' },
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Live Consultation Queue — {dateFilter}
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                style={{ width: 160, height: 34, fontSize: 12 }}
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tokenQueue.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={32} /></div>
                <div className="empty-state-title">Queue is empty for {dateFilter}</div>
                <div className="empty-state-desc">Book an appointment to populate the queue</div>
              </div>
            ) : (
              tokenQueue.map(apt => {
                const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;
                return (
                  <div
                    key={apt.id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      borderLeft: `4px solid ${sc.color}`,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      #{apt.tokenNumber}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        {apt.patientName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {apt.patientId} · {apt.doctorName} ({apt.department})
                      </div>
                      {apt.chiefComplaint && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Chief Complaint: {apt.chiefComplaint}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{apt.time}</div>
                      <div style={{ marginTop: 4 }}>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontWeight: 700 }}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {apt.status !== 'completed' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        >
                          <Check size={13} /> Complete
                        </button>
                      )}
                      {apt.status === 'scheduled' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleUpdateStatus(apt.id, 'in_progress')}
                        >
                          <Stethoscope size={13} /> Call Next
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32 }}
                    placeholder="Search patient, doctor, appointment..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <input
                  className="form-input"
                  type="date"
                  style={{ width: 160 }}
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                />
                <select className="form-select" style={{ width: 180 }} value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
                  <option value="">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                {filteredApts.map(apt => {
                  const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.scheduled;
                  const billing = billingMap[apt.id] || { status: 'unbilled', amount: apt.consultationFee || 600 };
                  return (
                    <tr key={apt.id}>
                      <td>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {apt.tokenNumber || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{apt.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 11, marginTop: 2 }}>{apt.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{apt.doctorName}</div>
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
                      <td style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>₹{apt.consultationFee}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontWeight: 700 }}>
                          <span className="badge-dot" />
                          {sc.label}
                        </span>
                      </td>
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
                                  items: [{ id: '1', category: 'consultation', description: `Consultation — ${apt.doctorName}`, quantity: 1, unitPrice: billing.amount, totalPrice: billing.amount, date: apt.date }]
                                })}
                              >
                                <Printer size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: 10 }}
                              onClick={() => setBillingModalApt(apt)}
                            >
                              <ReceiptText size={10} /> Bill
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          {apt.status !== 'completed' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="Cancel Appointment"
                            onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                          >
                            <X size={13} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredApts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Calendar size={32} /></div>
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
              <span className="modal-title">Book New OPD Appointment</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowBook(false)}>✕</button>
            </div>
            <form onSubmit={handleConfirmBook}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Select Patient <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formPatientId}
                      onChange={e => setFormPatientId(e.target.value)}
                      required
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.id} ({p.phone})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consulting Doctor <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formDoctorId}
                      onChange={e => setFormDoctorId(e.target.value)}
                      required
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization} (Fee: ₹{d.consultationFee})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Date <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="date"
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time Slot <span className="required">*</span></label>
                      <select
                        className="form-select"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                      >
                        {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '15:00', '16:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Appointment Category</label>
                    <select
                      className="form-select"
                      value={formType}
                      onChange={e => setFormType(e.target.value)}
                    >
                      <option value="opd">OPD — First Visit</option>
                      <option value="follow_up">Follow-Up Consult</option>
                      <option value="emergency">Emergency Priority</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chief Complaint / Symptoms</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brief clinical reason for visit..."
                      rows={2}
                      value={formComplaint}
                      onChange={e => setFormComplaint(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBook(false)}>Cancel</button>
                <button type="submit" id="confirm-appointment-btn" className="btn btn-primary">
                  <Calendar size={14} /> Confirm & Generate Token
                </button>
              </div>
            </form>
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
