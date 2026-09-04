import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, FlaskConical, ClipboardList, ReceiptText, UserRound, Phone, Activity, Heart } from 'lucide-react';
import { DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_LAB_REQUESTS, DEMO_BILLS, DEMO_PRESCRIPTIONS } from '../../data/seedData';
import { format } from 'date-fns';

export default function PatientPortal() {
  const { state } = useAuth();
  const phone = state.user?.phone;
  const patient = DEMO_PATIENTS.find(p => p.phone === phone);
  const myAppointments = DEMO_APPOINTMENTS.filter(a => a.patientId === patient?.id);
  const myLab = DEMO_LAB_REQUESTS.filter(r => r.patientId === patient?.id);
  const myBills = DEMO_BILLS.filter(b => b.patientId === patient?.id);
  const myPrescriptions = DEMO_PRESCRIPTIONS.filter(rx => rx.patientId === patient?.id);

  if (!patient) {
    return (
      <div className="empty-state" style={{ minHeight: 400 }}>
        <div className="empty-state-icon"><UserRound size={32} /></div>
        <div className="empty-state-title">Patient record not found</div>
        <div className="empty-state-desc">Your phone number is not linked to any patient record. Contact the hospital reception.</div>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-ai))', border: 'none' }}>
        <div style={{ padding: '24px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="avatar" style={{ width: 60, height: 60, fontSize: 22, background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome, {patient.firstName}!</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>{patient.id} · {age} yrs · {patient.gender} · {patient.bloodGroup}</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
              <Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{patient.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 mb-6" style={{ gap: 12 }}>
        {[
          { label: 'Appointments', value: myAppointments.length, icon: <Calendar size={18} />, color: 'var(--color-primary)' },
          { label: 'Lab Reports', value: myLab.length, icon: <FlaskConical size={18} />, color: 'var(--color-info)' },
          { label: 'Prescriptions', value: myPrescriptions.length, icon: <ClipboardList size={18} />, color: 'var(--color-ai)' },
          { label: 'Bills', value: myBills.length, icon: <ReceiptText size={18} />, color: 'var(--color-success)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Appointments */}
        <div className="card">
          <div className="card-header">
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">My Appointments</span>
          </div>
          {myAppointments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-title">No appointments found</div>
            </div>
          ) : (
            <div>
              {myAppointments.map(apt => (
                <div key={apt.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Dr. {apt.doctorName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{apt.department}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{apt.date} at {apt.time}</div>
                  </div>
                  <span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'waiting' ? 'badge-warning' : 'badge-neutral'}`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-header">
              <Activity size={16} style={{ color: 'var(--color-success)' }} />
              <span className="card-title">Health Info</span>
            </div>
            <div className="card-body">
              {[
                { label: 'Blood Group', value: patient.bloodGroup },
                { label: 'Allergies', value: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None' },
                { label: 'Emergency Contact', value: `${patient.emergencyContact.name}` },
                { label: 'Emergency Phone', value: patient.emergencyContact.phone },
                { label: 'Insurance', value: patient.insurance ? patient.insurance.provider : 'Not enrolled' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Heart size={16} style={{ color: 'var(--color-danger)' }} />
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="card-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <Calendar size={14} /> Book New Appointment
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <FlaskConical size={14} /> View Lab Reports
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <ReceiptText size={14} /> View Bills
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Phone size={14} /> Contact Hospital
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
