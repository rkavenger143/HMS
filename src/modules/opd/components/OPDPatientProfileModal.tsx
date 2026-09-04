import React, { useState } from 'react';
import {
  X, User, Phone, Calendar, Clock, Stethoscope, HeartPulse,
  FileText, Pill, FlaskConical, Scan, ReceiptText, CheckCircle2,
  CalendarDays, History, AlertCircle, Printer, Eye
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { Patient, OPDVisit } from '../../../types';

interface OPDPatientProfileModalProps {
  patient: Patient | null;
  visit?: OPDVisit | null;
  onClose: () => void;
}

export default function OPDPatientProfileModal({ patient, visit, onClose }: OPDPatientProfileModalProps) {
  const { visits, consultations, bills, followUps, startConsultationForVisit } = useOPD();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'visit_details' | 'vitals' | 'consultation' | 'diagnosis' |
    'prescription' | 'lab' | 'radiology' | 'billing' | 'follow_up' | 'history'
  >('overview');

  if (!patient) return null;

  const currentVisit = visit || visits.find(v => v.patientId === patient.id) || visits[0];
  const patientVisits = visits.filter(v => v.patientId === patient.id);
  const patientConsultations = consultations.filter(c => c.patientId === patient.id);
  const patientBills = bills.filter(b => b.patientId === patient.id);
  const patientFollowUps = followUps.filter(f => f.patientId === patient.id);

  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : (currentVisit?.patientAge || 45);

  const TABS = [
    { id: 'overview', label: '1. Overview', icon: <User size={13} /> },
    { id: 'visit_details', label: '2. Visit Details', icon: <Calendar size={13} /> },
    { id: 'vitals', label: '3. Vitals', icon: <HeartPulse size={13} /> },
    { id: 'consultation', label: '4. Consultation', icon: <Stethoscope size={13} /> },
    { id: 'diagnosis', label: '5. Diagnosis', icon: <FileText size={13} /> },
    { id: 'prescription', label: '6. Prescription', icon: <Pill size={13} /> },
    { id: 'lab', label: '7. Lab', icon: <FlaskConical size={13} /> },
    { id: 'radiology', label: '8. Radiology', icon: <Scan size={13} /> },
    { id: 'billing', label: '9. Billing', icon: <ReceiptText size={13} /> },
    { id: 'follow_up', label: '10. Follow-up', icon: <CalendarDays size={13} /> },
    { id: 'history', label: '11. History', icon: <History size={13} /> },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Patient Header (Section 7) */}
        <div className="modal-header" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, var(--color-primary), #10b981)', color: 'white', fontWeight: 800 }}>
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="modal-title" style={{ fontSize: 18, fontWeight: 800 }}>
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="patient-id">{patient.id}</span>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {currentVisit?.visitType || 'OPD Walk-in'}
                </span>
                <span className="badge badge-success">
                  Token #{currentVisit?.tokenNumber || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                <span><strong>Age/Gender:</strong> {age} yrs / {patient.gender}</span>
                <span><strong>Phone:</strong> {patient.phone}</span>
                <span><strong>Blood:</strong> {patient.bloodGroup || 'O+'}</span>
                <span><strong>Doctor:</strong> {currentVisit?.doctorName || 'Dr. Sneha Patel'} ({currentVisit?.department || 'General Medicine'})</span>
                <span><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--color-primary)', fontWeight: 600 }}>{currentVisit?.status?.replace('_', ' ') || 'Waiting'}</span></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {currentVisit && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  startConsultationForVisit(currentVisit);
                  onClose();
                }}
              >
                <Stethoscope size={13} /> Start Consultation
              </button>
            )}
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{ padding: '8px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id as any)}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
                  Demographics & Registration
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div><strong>Full Name:</strong> {patient.firstName} {patient.lastName}</div>
                  <div><strong>UHID:</strong> {patient.id}</div>
                  <div><strong>Date of Birth:</strong> {patient.dateOfBirth || '1988-04-12'}</div>
                  <div><strong>Blood Group:</strong> {patient.bloodGroup || 'O+'}</div>
                  <div><strong>Emergency Contact:</strong> {patient.emergencyContact?.name || 'Relative'} ({patient.emergencyContact?.phone || patient.phone})</div>
                  <div><strong>Address:</strong> {patient.address || 'Hospital Area, Civil Lines'}</div>
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-warning-dark)', marginBottom: 8 }}>
                  Allergies & Clinical Flags
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((a, i) => (
                      <span key={i} className="badge badge-danger">⚠ {a}</span>
                    ))
                  ) : (
                    <span className="badge badge-success">No known drug allergies (NKDA)</span>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <strong>Insurance Provider:</strong> {patient.insurance?.provider || 'Self Pay (Direct)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visit_details' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Current OPD Encounter Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div><strong>Token Number:</strong> #{currentVisit?.tokenNumber || 101}</div>
                <div><strong>Visit Date & Time:</strong> {currentVisit?.visitDate} at {currentVisit?.visitTime}</div>
                <div><strong>Consulting Doctor:</strong> {currentVisit?.doctorName}</div>
                <div><strong>Department:</strong> {currentVisit?.department}</div>
                <div><strong>Chief Complaint:</strong> {currentVisit?.reasonForVisit || 'Fever, cough and fatigue'}</div>
                <div><strong>Consultation Fee:</strong> ₹{currentVisit?.consultationFee || 600}</div>
              </div>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Triage Vitals</div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div className="vital-card">
                  <div className="vital-value">{currentVisit?.vitals?.bloodPressure || '120/80'}</div>
                  <div className="vital-unit">mmHg</div>
                  <div className="vital-label">Blood Pressure</div>
                </div>
                <div className="vital-card">
                  <div className="vital-value">{currentVisit?.vitals?.pulse || 76}</div>
                  <div className="vital-unit">bpm</div>
                  <div className="vital-label">Pulse</div>
                </div>
                <div className="vital-card">
                  <div className="vital-value">{currentVisit?.vitals?.temperature || 98.6}°</div>
                  <div className="vital-unit">°F</div>
                  <div className="vital-label">Temperature</div>
                </div>
                <div className="vital-card">
                  <div className="vital-value">{currentVisit?.vitals?.spo2 || 98}%</div>
                  <div className="vital-unit">SpO2</div>
                  <div className="vital-label">Oxygen Saturation</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultation' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Doctor Clinical Notes</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Patient examined in OPD chamber. History of symptoms for 3 days. Chest clear bilaterally, S1/S2 normal. Hydration advised, prescribed symptomatic antipyretics and ordered baseline investigations.
              </p>
            </div>
          )}

          {activeTab === 'diagnosis' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>ICD-10 Diagnoses</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                  J06.9 — Acute Upper Respiratory Tract Infection (URTI)
                </span>
                <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: 12 }}>
                  R50.9 — Fever, unspecified
                </span>
              </div>
            </div>
          )}

          {activeTab === 'prescription' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Prescribed Medications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6 }}>
                  <strong>1. Tab. Amoxicillin + Clavulanic Acid 625mg</strong> — 1-0-1 for 5 days (After food)
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6 }}>
                  <strong>2. Tab. Paracetamol 650mg</strong> — 1-1-1 (SOS) for 3 days (For temperature &gt; 100°F)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Laboratory Investigations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div>• Complete Blood Count (CBC) with ESR — <em>Sample Received in Central Lab</em></div>
                <div>• Serum Electrolytes (Na+, K+, Cl-) — <em>Processing</em></div>
              </div>
            </div>
          )}

          {activeTab === 'radiology' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Radiology & Imaging</div>
              <div style={{ fontSize: 13 }}>• Chest X-Ray PA View — <em>Report Verified</em></div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Central Billing & Receipts</div>
              <div style={{ fontSize: 13 }}>
                <div><strong>Invoice #INV-2026-OPD-101:</strong> OPD Consultation Fee (₹600) — <span className="badge badge-success">PAID</span></div>
              </div>
            </div>
          )}

          {activeTab === 'follow_up' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Scheduled Review / Follow-up</div>
              <div style={{ fontSize: 13 }}>
                <strong>Follow-up Date:</strong> 2026-09-07 with Dr. Sneha Patel
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Instructions: Review with CBC and fasting blood sugar report.</div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Past Outpatient Encounters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                {patientVisits.map(v => (
                  <div key={v.id} style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{v.visitDate} — Dr. {v.doctorName} ({v.department})</span>
                    <span className="badge badge-neutral">{v.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print Summary
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
