import React, { useState } from 'react';
import {
  Users, Search, Filter, Clock, Stethoscope, CheckCircle2,
  AlertCircle, Printer, Eye, UserCheck, Calendar, ReceiptText,
  CreditCard, ArrowRight
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDVisit, OPDVisitStatus } from '../../../types';
import PrintRegistrationSlipModal from './modals/PrintRegistrationSlipModal';
import VitalEntryModal from './modals/VitalEntryModal';
import AppointmentBillingModal from './modals/AppointmentBillingModal';

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

export default function TodaysPatients() {
  const {
    visits,
    doctors,
    departments,
    appointments,
    startConsultationForVisit,
    updateVisitStatus,
    updateVisitVitals,
    setActiveTab,
    setSelectedPatientId,
  } = useOPD();

  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [slipModalVisit, setSlipModalVisit] = useState<OPDVisit | null>(null);
  const [vitalsModalVisit, setVitalsModalVisit] = useState<OPDVisit | null>(null);
  const [billingModalApt, setBillingModalApt] = useState<any | null>(null);

  // Filter for today's visits
  const todayVisits = visits.filter(v => v.visitDate === '2026-08-31');

  const filteredVisits = todayVisits.filter(v => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.patientName.toLowerCase().includes(q) ||
      v.patientId.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.tokenNumber.toString().includes(q) ||
      (v.patientPhone && v.patientPhone.includes(q));

    const matchDoctor = !doctorFilter || v.doctorId === doctorFilter;
    const matchDept = !deptFilter || v.department === deptFilter;
    const matchStatus = !statusFilter || v.status === statusFilter;

    return matchSearch && matchDoctor && matchDept && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Today's OPD Patients Encounter Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete roster of checked-in outpatients, triage vitals, assigned consultants, and progress
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
            <UserCheck size={14} /> Scheduled Appointments
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4" style={{ gap: 12 }}>
        {[
          { label: "Today's Total Patients", count: todayVisits.length, color: 'var(--color-primary)' },
          { label: 'Waiting in Queue', count: todayVisits.filter(v => v.status === 'waiting' || v.status === 'called').length, color: 'var(--color-warning)' },
          { label: 'In Doctor Consultation', count: todayVisits.filter(v => v.status === 'in_consultation').length, color: 'var(--color-info)' },
          { label: 'Consultation Finished', count: todayVisits.filter(v => v.status === 'completed').length, color: 'var(--color-success)' },
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.count}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Today's Patients Registry ({filteredVisits.length})</span>
        </div>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient, UHID, Token..."
                style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 36, fontSize: 13 }}
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
              >
                <option value="">All Consultants</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
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
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
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
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Details</th>
                  <th>Visit Time</th>
                  <th>Consultant & Dept</th>
                  <th>Triage Vitals</th>
                  <th>Status</th>
                  <th>Billing Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length > 0 ? (
                  filteredVisits.map(v => {
                    const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.waiting;
                    const apt = appointments.find(a => a.patientId === v.patientId);
                    const isBilled = v.status === 'completed';

                    return (
                      <tr key={v.id}>
                        <td>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800
                          }}>
                            {v.tokenNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{v.patientName}</div>
                          <div className="patient-id" style={{ fontSize: 10 }}>{v.patientId} · {v.patientPhone || 'Walk-in'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{v.visitTime}</div>
                          <span className={`badge ${v.visitType === 'follow_up' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: 9 }}>
                            {v.visitType.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{v.doctorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{v.department}</div>
                        </td>
                        <td>
                          {v.vitals ? (
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              <span>BP: <strong>{v.vitals.bloodPressure || '120/80'}</strong></span> · <span>HR: <strong>{v.vitals.pulse || '76'}</strong></span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: 10 }}
                              onClick={() => setVitalsModalVisit(v)}
                            >
                              + Record Vitals
                            </button>
                          )}
                        </td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </td>
                        <td>
                          {isBilled ? (
                            <span className="badge badge-success" style={{ fontSize: 10 }}>Paid (₹{v.consultationFee || 600})</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '2px 8px', fontSize: 10 }}
                              onClick={() => setBillingModalApt(apt || {
                                id: `apt-${v.id}`,
                                patientId: v.patientId,
                                patientName: v.patientName,
                                doctorId: v.doctorId,
                                doctorName: v.doctorName,
                                department: v.department,
                                date: v.visitDate,
                                time: v.visitTime,
                                consultationFee: v.consultationFee || 600,
                                type: v.visitType === 'follow_up' ? 'follow_up' : 'opd',
                                status: v.status === 'completed' ? 'completed' : 'waiting',
                                tokenNumber: v.tokenNumber,
                                createdAt: v.createdAt,
                              })}
                            >
                              <ReceiptText size={10} /> Bill
                            </button>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              title="Print OPD Registration Slip"
                              onClick={() => setSlipModalVisit(v)}
                            >
                              <Printer size={12} />
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => startConsultationForVisit(v)}
                            >
                              Consult
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <div className="empty-state-title">No Patients Found</div>
                        <div className="empty-state-desc">Try clearing filters or check in a new patient.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      {slipModalVisit && (
        <PrintRegistrationSlipModal
          visit={slipModalVisit}
          onClose={() => setSlipModalVisit(null)}
        />
      )}

      {/* Vitals Modal */}
      {vitalsModalVisit && (
        <VitalEntryModal
          visit={vitalsModalVisit}
          onSave={(vitals) => {
            updateVisitVitals(vitalsModalVisit.id, vitals);
            setVitalsModalVisit(null);
          }}
          onClose={() => setVitalsModalVisit(null)}
        />
      )}

      {/* Billing Modal */}
      {billingModalApt && (
        <AppointmentBillingModal
          appointment={billingModalApt}
          onClose={() => setBillingModalApt(null)}
          onPaymentComplete={() => setBillingModalApt(null)}
        />
      )}
    </div>
  );
}
