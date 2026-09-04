import React, { useState } from 'react';
import {
  Users, UserPlus, CalendarCheck, Clock, Stethoscope, CheckCircle2,
  XCircle, IndianRupee, Search, Filter, Printer, Activity, Play,
  FileText, ChevronLeft, ChevronRight, Eye, AlertCircle, Sparkles, Plus,
  UserCheck, ArrowRight, UserRound, ReceiptText, CreditCard, ExternalLink,
  RotateCcw, CalendarDays
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDVisit, OPDVisitStatus, Appointment, Patient } from '../../../types';
import PrintRegistrationSlipModal from './modals/PrintRegistrationSlipModal';
import VitalEntryModal from './modals/VitalEntryModal';
import AppointmentBillingModal from './modals/AppointmentBillingModal';
import PrintBillModal from './modals/PrintBillModal';
import OPDPatientProfileModal from './OPDPatientProfileModal';

const STATUS_CONFIG: Record<OPDVisitStatus, { label: string; color: string; bg: string }> = {
  waiting: { label: 'Waiting', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  called: { label: 'Called', color: 'var(--color-info)', bg: 'var(--color-info-muted)' },
  in_consultation: { label: 'In Consultation', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  completed: { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  no_show: { label: 'No Show', color: 'var(--text-tertiary)', bg: 'var(--bg-surface)' },
  on_hold: { label: 'On Hold', color: 'var(--color-warning-dark)', bg: 'var(--color-warning-muted)' },
  skipped: { label: 'Skipped', color: 'var(--text-tertiary)', bg: 'var(--bg-surface)' },
};

export default function OPDDashboard() {
  const {
    visits,
    kpis,
    doctors,
    departments,
    appointments,
    bills,
    patients,
    followUps,
    setActiveTab,
    startConsultationForVisit,
    updateVisitStatus,
    callToken,
    updateVisitVitals,
    setSelectedPatientId,
  } = useOPD();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [patientIdFilter, setPatientIdFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-31');
  const [visitTypeFilter, setVisitTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tokenFilter, setTokenFilter] = useState('');

  // Modals
  const [selectedProfilePatient, setSelectedProfilePatient] = useState<Patient | null>(null);
  const [selectedProfileVisit, setSelectedProfileVisit] = useState<OPDVisit | null>(null);
  const [slipModalVisit, setSlipModalVisit] = useState<OPDVisit | null>(null);
  const [vitalsModalVisit, setVitalsModalVisit] = useState<OPDVisit | null>(null);
  const [billingModalApt, setBillingModalApt] = useState<any | null>(null);
  const [printBillObj, setPrintBillObj] = useState<any | null>(null);

  // Filter today's OPD Queue
  const filteredQueue = visits.filter(v => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.patientName.toLowerCase().includes(q) ||
      v.patientId.toLowerCase().includes(q) ||
      v.doctorName.toLowerCase().includes(q);

    const matchPatientId = !patientIdFilter || v.patientId.toLowerCase().includes(patientIdFilter.toLowerCase());
    const matchDoctor = !doctorFilter || v.doctorId === doctorFilter;
    const matchDept = !deptFilter || v.department === deptFilter;
    const matchDate = !dateFilter || v.visitDate === dateFilter;
    const matchVisitType = !visitTypeFilter || v.visitType === visitTypeFilter;
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchToken = !tokenFilter || v.tokenNumber.toString() === tokenFilter;

    return (
      matchSearch &&
      matchPatientId &&
      matchDoctor &&
      matchDept &&
      matchDate &&
      matchVisitType &&
      matchStatus &&
      matchToken
    );
  });

  const handleResetFilters = () => {
    setSearch('');
    setPatientIdFilter('');
    setDoctorFilter('');
    setDeptFilter('');
    setDateFilter('2026-08-31');
    setVisitTypeFilter('');
    setStatusFilter('');
    setTokenFilter('');
  };

  const handleViewPatientProfile = (visit: OPDVisit) => {
    const p = patients.find(pat => pat.id === visit.patientId) || {
      id: visit.patientId,
      firstName: visit.patientName.split(' ')[0] || 'Patient',
      lastName: visit.patientName.split(' ').slice(1).join(' ') || '',
      dateOfBirth: '1980-05-15',
      gender: (visit.patientGender as any) || 'male',
      phone: visit.patientPhone || '9876543210',
      address: 'Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      bloodGroup: 'O+',
      allergies: [],
      emergencyContact: { name: 'Family', relationship: 'Spouse', phone: '9876543211' },
      registrationDate: visit.visitDate,
      isActive: true,
    };
    setSelectedProfilePatient(p);
    setSelectedProfileVisit(visit);
  };

  // Appointments list for dashboard ledger
  const todayApts = appointments.filter(a => !dateFilter || a.date === dateFilter);

  // Billing calculation
  const paidBillsCount = appointments.filter(a => a.status === 'completed').length;
  const pendingBillsCount = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;
  const checkedInCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'waiting' || a.status === 'in_progress').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. TOP 10 DYNAMIC SUMMARY CARDS */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {/* Card 1: Today's Appointments */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon"><Users size={17} /></div>
            <span className="badge badge-primary">Total</span>
          </div>
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>

        {/* Card 2: New Patients */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}><UserPlus size={17} /></div>
            <span className="badge badge-info">New</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.newPatients}</div>
          <div className="stat-label">New Patients</div>
        </div>

        {/* Card 3: Follow-up Patients */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-ai)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-ai-muted)', color: 'var(--color-ai)' }}><CalendarDays size={17} /></div>
            <span className="badge badge-ai">Review</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-ai)' }}>{kpis.followUpPatients || followUps.length || 3}</div>
          <div className="stat-label">Follow-up Patients</div>
        </div>

        {/* Card 4: Checked-in */}
        <div className="stat-card" style={{ '--stat-color': '#0d9488' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}><UserCheck size={17} /></div>
            <span className="badge badge-teal">Token</span>
          </div>
          <div className="stat-value" style={{ color: '#0d9488' }}>{checkedInCount}</div>
          <div className="stat-label">Checked-in</div>
        </div>

        {/* Card 5: Waiting */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-warning)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}><Clock size={17} /></div>
            <span className="badge badge-warning">Queue</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.waitingPatients}</div>
          <div className="stat-label">Waiting in Hall</div>
        </div>

        {/* Card 6: In Consultation */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon"><Stethoscope size={17} /></div>
            <span className="badge badge-primary">Active</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.inConsultation}</div>
          <div className="stat-label">In Consultation</div>
        </div>

        {/* Card 7: Completed */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}><CheckCircle2 size={17} /></div>
            <span className="badge badge-success">Done</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.completedConsultations}</div>
          <div className="stat-label">Completed</div>
        </div>

        {/* Card 8: Cancelled */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}><XCircle size={17} /></div>
            <span className="badge badge-danger">Drop</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.cancelledAppointments}</div>
          <div className="stat-label">Cancelled</div>
        </div>

        {/* Card 9: Today's OPD Revenue */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}><IndianRupee size={17} /></div>
            <span className="badge badge-success">Realized</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{kpis.revenueToday.toLocaleString('en-IN')}</div>
          <div className="stat-label">Today's OPD Revenue</div>
        </div>

        {/* Card 10: Pending Payments */}
        <div className="stat-card" style={{ '--stat-color': '#d97706' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}><ReceiptText size={17} /></div>
            <span className="badge badge-warning">Due</span>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>₹{(pendingBillsCount * 600).toLocaleString('en-IN')}</div>
          <div className="stat-label">Pending Payments ({pendingBillsCount})</div>
        </div>
      </div>

      {/* 2. UNIFIED SEARCH & FILTER BAR */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--color-primary)' }} />
            OPD Search & Fast Filter
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleResetFilters} style={{ fontSize: 11 }}>
            <RotateCcw size={12} /> Reset Filters
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
          {/* Text Search */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient, UHID, doctor..."
                style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* UHID */}
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="UHID (e.g. ALN-...)"
              style={{ height: 34, fontSize: 12 }}
              value={patientIdFilter}
              onChange={e => setPatientIdFilter(e.target.value)}
            />
          </div>

          {/* Doctor */}
          <div>
            <select
              className="form-select"
              style={{ height: 34, fontSize: 12 }}
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              className="form-select"
              style={{ height: 34, fontSize: 12 }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              className="form-input"
              style={{ height: 34, fontSize: 12 }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>

          {/* Visit Type */}
          <div>
            <select
              className="form-select"
              style={{ height: 34, fontSize: 12 }}
              value={visitTypeFilter}
              onChange={e => setVisitTypeFilter(e.target.value)}
            >
              <option value="">All Visit Types</option>
              <option value="new">New Visit</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency Walk-in</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              className="form-select"
              style={{ height: 34, fontSize: 12 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="called">Called</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Token Number */}
          <div>
            <input
              type="number"
              className="form-input"
              placeholder="Token #"
              style={{ height: 34, fontSize: 12 }}
              value={tokenFilter}
              onChange={e => setTokenFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: APPOINTMENTS + BILLING SIDE-BY-SIDE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 16 }}>
        {/* Left Side: Today's Appointments */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="card-title">Today's Appointments ({todayApts.length})</span>
                <div className="card-subtitle">Scheduled slots, consultation readiness & billing status</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('appointments')}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="card-body" style={{ padding: '8px 12px', maxHeight: 360, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayApts.slice(0, 6).map(apt => {
                const isBilled = apt.status === 'completed';
                return (
                  <div
                    key={apt.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{apt.patientName}</span>
                        <span className="badge badge-neutral" style={{ fontSize: 9 }}>{apt.time}</span>
                        <span className="badge badge-primary" style={{ fontSize: 9, textTransform: 'uppercase' }}>{apt.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Dr. {apt.doctorName} · {apt.department}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${isBilled ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {isBilled ? 'PAID (₹' + (apt.consultationFee || 600) + ')' : 'DUE'}
                      </span>
                      {isBilled ? (
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Print Receipt"
                          onClick={() => setPrintBillObj({
                            billNumber: `RCPT-2026-0${apt.id.replace(/\D/g, '') || '101'}`,
                            patientName: apt.patientName,
                            patientId: apt.patientId,
                            date: apt.date,
                            total: apt.consultationFee || 600,
                            paidAmount: apt.consultationFee || 600,
                            status: 'paid',
                            items: [
                              { id: '1', category: 'consultation', description: `OPD Consultation — Dr. ${apt.doctorName} (${apt.department})`, quantity: 1, unitPrice: apt.consultationFee || 600, totalPrice: apt.consultationFee || 600, date: apt.date }
                            ]
                          })}
                        >
                          <Printer size={12} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => setBillingModalApt(apt)}
                        >
                          <CreditCard size={11} /> Bill
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: OPD Billing Summary & Central Collections */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ReceiptText size={16} style={{ color: 'var(--color-success)' }} />
              <div>
                <span className="card-title">OPD Billing & Central Collections</span>
                <div className="card-subtitle">Real-time collections & central invoice ledger</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('billing')}>
              Master Ledger <ArrowRight size={12} />
            </button>
          </div>

          <div className="card-body" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total Bills</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{appointments.length}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Paid</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)' }}>{paidBillsCount}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Pending</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-warning)' }}>{pendingBillsCount}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Revenue</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)' }}>₹{kpis.revenueToday.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 230, overflowY: 'auto' }}>
              {appointments.slice(0, 5).map(apt => {
                const isPaid = apt.status === 'completed';
                return (
                  <div
                    key={apt.id}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>INV-OPD-{apt.id.replace(/\D/g, '') || '101'} · ₹{apt.consultationFee || 600}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                        {isPaid ? 'PAID' : 'DUE'}
                      </span>
                      {isPaid ? (
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Print Central Receipt"
                          onClick={() => setPrintBillObj({
                            billNumber: `RCPT-2026-0${apt.id.replace(/\D/g, '') || '101'}`,
                            patientName: apt.patientName,
                            patientId: apt.patientId,
                            date: apt.date,
                            total: apt.consultationFee || 600,
                            paidAmount: apt.consultationFee || 600,
                            status: 'paid',
                            items: [
                              { id: '1', category: 'consultation', description: `OPD Consultation — Dr. ${apt.doctorName} (${apt.department})`, quantity: 1, unitPrice: apt.consultationFee || 600, totalPrice: apt.consultationFee || 600, date: apt.date }
                            ]
                          })}
                        >
                          <Printer size={12} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 6px', fontSize: 10 }}
                          onClick={() => setBillingModalApt(apt)}
                        >
                          <CreditCard size={10} /> Pay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: TODAY'S LIVE OPD QUEUE TABLE */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Today's Live OPD Queue ({filteredQueue.length})</span>
              <div className="card-subtitle">Real-time consultation queue, patient calling, and doctor chambers</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('queue')}>
              Full Screen Queue <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name & UHID</th>
                  <th>Consulting Doctor</th>
                  <th>Department</th>
                  <th>Appointment Time</th>
                  <th>Visit Type</th>
                  <th>Queue Status</th>
                  <th>Waiting Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map(v => {
                    const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.waiting;
                    return (
                      <tr key={v.id}>
                        <td>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: v.status === 'in_consultation' ? 'var(--color-primary)' : 'var(--color-primary-muted)',
                            color: v.status === 'in_consultation' ? 'white' : 'var(--color-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800
                          }}>
                            {v.tokenNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{v.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{v.patientId} · {v.patientGender || 'M'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>Dr. {v.doctorName}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: 10 }}>{v.department}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{v.visitTime}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{v.visitDate}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: 10 }}>
                            {v.visitType.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 11 }}>
                            <span className="badge-dot" />
                            {sc.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {v.status === 'completed' ? '—' : `${v.tokenNumber * 6} mins`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            {/* View Profile */}
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="View Patient Profile"
                              onClick={() => handleViewPatientProfile(v)}
                            >
                              <Eye size={12} /> View
                            </button>

                            {/* Call */}
                            {v.status === 'waiting' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => callToken(v.tokenNumber)}
                              >
                                <Play size={11} /> Call
                              </button>
                            )}

                            {/* Start Consultation */}
                            {v.status !== 'completed' && v.status !== 'cancelled' && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => startConsultationForVisit(v)}
                              >
                                <Stethoscope size={11} /> Consult
                              </button>
                            )}

                            {/* Vitals */}
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              title="Record Patient Vitals"
                              onClick={() => setVitalsModalVisit(v)}
                            >
                              <Activity size={12} />
                            </button>

                            {/* Print Slip */}
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              title="Print Registration Slip"
                              onClick={() => setSlipModalVisit(v)}
                            >
                              <Printer size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No patients matching selected filters in today's OPD queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Patient Profile Modal */}
      {selectedProfilePatient && (
        <OPDPatientProfileModal
          patient={selectedProfilePatient}
          visit={selectedProfileVisit}
          onClose={() => {
            setSelectedProfilePatient(null);
            setSelectedProfileVisit(null);
          }}
        />
      )}

      {/* 2. Print Registration Slip Modal */}
      {slipModalVisit && (
        <PrintRegistrationSlipModal
          visit={slipModalVisit}
          onClose={() => setSlipModalVisit(null)}
        />
      )}

      {/* 3. Vitals Entry Modal */}
      {vitalsModalVisit && (
        <VitalEntryModal
          visit={vitalsModalVisit}
          onClose={() => setVitalsModalVisit(null)}
          onSave={(vitals) => {
            updateVisitVitals(vitalsModalVisit.id, vitals);
            setVitalsModalVisit(null);
          }}
        />
      )}

      {/* 4. Appointment Billing Modal */}
      {billingModalApt && (
        <AppointmentBillingModal
          appointment={billingModalApt}
          onClose={() => setBillingModalApt(null)}
          onPaymentComplete={(data) => {
            setBillingModalApt(null);
          }}
        />
      )}

      {/* 5. Central Receipt Print Modal */}
      {printBillObj && (
        <PrintBillModal
          bill={printBillObj}
          onClose={() => setPrintBillObj(null)}
        />
      )}
    </div>
  );
}
