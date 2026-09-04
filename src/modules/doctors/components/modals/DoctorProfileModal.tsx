import React from 'react';
import {
  UserRound, Award, Clock, Phone, Mail, ShieldCheck,
  Calendar, Stethoscope, CheckCircle2, X, Building2
} from 'lucide-react';
import type { Doctor } from '../../../../types';
import { useDoctor } from '../../context/DoctorContext';

interface DoctorProfileModalProps {
  doctor: Doctor;
  onClose: () => void;
}

export default function DoctorProfileModal({ doctor, onClose }: DoctorProfileModalProps) {
  const { setActiveTab, setSelectedDoctorId } = useDoctor();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <UserRound size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Doctor Official Clinical Profile</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20
            }}>
              {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{doctor.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{doctor.specialization}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Department of {doctor.department}</div>
            </div>

            <div>
              <span className={`badge ${doctor.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                {doctor.isAvailable ? '● Available on Duty' : '○ Off Duty'}
              </span>
            </div>
          </div>

          {/* Grid Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Qualifications</span>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Medical Registration #</span>
              <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>
                {doctor.registrationNumber || 'MCI-2018-7749'}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Clinical Experience</span>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{doctor.experience} Years Active Practice</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-default)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Consultation Fee</span>
              <div style={{ fontWeight: 800, marginTop: 2, color: 'var(--color-primary)' }}>
                ₹{doctor.consultationFee} per visit
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} style={{ color: 'var(--color-primary)' }} />
              <span>{doctor.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} style={{ color: 'var(--color-primary)' }} />
              <span>{doctor.email}</span>
            </div>
          </div>

          {/* OPD Schedule */}
          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📅 OPD Timings & Consulting Room
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {doctor.opdSchedule?.days?.join(', ') || 'Monday, Wednesday, Friday'} · {doctor.opdSchedule?.startTime || '09:00 AM'} – {doctor.opdSchedule?.endTime || '01:00 PM'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              Clinic Room: Room {doctor.id === 'doc-1' ? '102 (Cardiology OPD)' : '204 (Surgical Block)'}
            </div>
          </div>

          {/* Biography */}
          {doctor.bio && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Clinical Bio & Special Expertise
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {doctor.bio}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedDoctorId(doctor.id);
              setActiveTab('consultation');
              onClose();
            }}
          >
            <Stethoscope size={14} /> Start Consultation as {doctor.name}
          </button>
        </div>
      </div>
    </div>
  );
}
