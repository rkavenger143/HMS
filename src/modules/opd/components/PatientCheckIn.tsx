import React, { useState } from 'react';
import {
  UserCheck, Calendar, Search, Clock, CheckCircle2,
  Plus, AlertCircle, Printer, User, ArrowRight
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import { useToast } from '../../../contexts/ToastContext';
import type { Appointment, OPDVisit } from '../../../types';
import PrintRegistrationSlipModal from './modals/PrintRegistrationSlipModal';

export default function PatientCheckIn() {
  const {
    appointments,
    visits,
    doctors,
    departments,
    patients,
    registerExistingPatientVisit,
    setActiveTab,
  } = useOPD();

  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [slipVisit, setSlipVisit] = useState<OPDVisit | null>(null);

  // Scheduled appointments that are pending check-in today
  const pendingApts = appointments.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q);

    return matchSearch && a.status === 'scheduled';
  });

  const handleCheckIn = (apt: Appointment) => {
    const newVisit = registerExistingPatientVisit(apt.patientId, {
      patientName: apt.patientName,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      department: apt.department,
      visitType: apt.type === 'follow_up' ? 'follow_up' : 'new',
      consultationFee: apt.consultationFee || 600,
      reasonForVisit: apt.chiefComplaint || 'Scheduled OPD Consultation',
      priority: 'normal',
    });

    toast.success('Patient Checked In', `Patient ${apt.patientName} successfully checked-in! Assigned Token #${newVisit.tokenNumber}`);
    setSlipVisit(newVisit);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>OPD Patient Check-In & Arrival Triage</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Confirm arrival for booked appointments, issue OPD tokens, or fast-track walk-ins
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('patients')}>
          <Plus size={14} /> Walk-in Patient Registration
        </button>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Left Column: Scheduled Appointments Awaiting Arrival */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Scheduled Arrivals ({pendingApts.length})</span>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search appointment..."
                style={{ paddingLeft: 26, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body" style={{ padding: '14px 16px' }}>
            {pendingApts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingApts.map(apt => (
                  <div
                    key={apt.id}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{apt.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        UHID: {apt.patientId} · Time: <strong>{apt.time}</strong> · Dr. {apt.doctorName} ({apt.department})
                      </div>
                      {apt.chiefComplaint && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Reason: {apt.chiefComplaint}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ height: 34, padding: '0 14px', fontSize: 12 }}
                      onClick={() => handleCheckIn(apt)}
                    >
                      <UserCheck size={14} /> Check In & Issue Token
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon"><Calendar size={28} /></div>
                <div className="empty-state-title">No Pending Scheduled Appointments</div>
                <div className="empty-state-desc">All scheduled patients for this slot have been checked in or you can register a walk-in patient.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Check-in Rules & Quick Flow Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 14 }}>OPD Check-In & Token Workflow</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <strong>Identify Patient</strong>: Match appointment from scheduled list or search by phone/UHID.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <strong>Generate Token</strong>: System generates consecutive token number and assigns to doctor's queue.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <strong>Print Slip & Triage</strong>: Hand patient token slip to proceed to Vitals station.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      {slipVisit && (
        <PrintRegistrationSlipModal
          visit={slipVisit}
          onClose={() => setSlipVisit(null)}
        />
      )}
    </div>
  );
}
