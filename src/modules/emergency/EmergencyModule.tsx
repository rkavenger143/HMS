// ============================================================
// ALN Cure HMS — Emergency & Trauma Triage Management Module
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Siren,
  HeartPulse,
  Flame,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ShieldAlert,
  BedDouble,
  Activity,
  Stethoscope,
  UserCheck,
  CheckCircle2,
  PhoneCall,
  FileCheck
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import type {
  EmergencyPatient,
  TriageCategory
} from '../../types';

export default function EmergencyModule() {
  const [emergencyPatients, setEmergencyPatients] = useState<EmergencyPatient[]>(() => storageService.getEmergencyPatients());
  const [activeTab, setActiveTab] = useState<'triage' | 'trauma' | 'mlc' | 'discharged'>('triage');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState<string>('all');

  // Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);

  // Form State
  const [intakeForm, setIntakeForm] = useState<{
    patientName: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    broughtBy: string;
    chiefComplaint: string;
    triageCategory: TriageCategory;
    glasgowComaScale: number;
    bp: string;
    pulse: number;
    spo2: number;
    temp: number;
    respRate: number;
    isMLC: boolean;
    policeStation: string;
    assignedDoctor: string;
    erBed: string;
    clinicalNotes: string;
  }>({
    patientName: '',
    gender: 'male',
    age: 35,
    broughtBy: 'Ambulance (108 Paramedic)',
    chiefComplaint: '',
    triageCategory: 'red_resuscitation',
    glasgowComaScale: 15,
    bp: '120/80',
    pulse: 88,
    spo2: 98,
    temp: 98.6,
    respRate: 18,
    isMLC: false,
    policeStation: '',
    assignedDoctor: 'Dr. Rajesh Kumar (Emergency)',
    erBed: 'ER-Bay-01',
    clinicalNotes: '',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setEmergencyPatients(storageService.getEmergencyPatients());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  // Handler: Register Emergency Patient
  const handleCreateEmergencyPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.patientName || !intakeForm.chiefComplaint) return;

    storageService.addEmergencyPatient({
      patientName: intakeForm.patientName,
      gender: intakeForm.gender,
      age: Number(intakeForm.age) || 0,
      broughtBy: intakeForm.broughtBy,
      chiefComplaint: intakeForm.chiefComplaint,
      triageCategory: intakeForm.triageCategory,
      glasgowComaScale: Number(intakeForm.glasgowComaScale) || 15,
      vitals: {
        bp: intakeForm.bp,
        pulse: Number(intakeForm.pulse) || 80,
        spo2: Number(intakeForm.spo2) || 98,
        temp: Number(intakeForm.temp) || 98.6,
        respRate: Number(intakeForm.respRate) || 18,
      },
      isMLC: intakeForm.isMLC,
      policeStation: intakeForm.policeStation || undefined,
      assignedDoctor: intakeForm.assignedDoctor,
      erBed: intakeForm.erBed,
      status: 'treatment',
      clinicalNotes: intakeForm.clinicalNotes,
    });

    setShowIntakeModal(false);
    setIntakeForm({
      patientName: '',
      gender: 'male',
      age: 35,
      broughtBy: 'Ambulance (108 Paramedic)',
      chiefComplaint: '',
      triageCategory: 'red_resuscitation',
      glasgowComaScale: 15,
      bp: '120/80',
      pulse: 88,
      spo2: 98,
      temp: 98.6,
      respRate: 18,
      isMLC: false,
      policeStation: '',
      assignedDoctor: 'Dr. Rajesh Kumar (Emergency)',
      erBed: 'ER-Bay-01',
      clinicalNotes: '',
    });
    setEmergencyPatients(storageService.getEmergencyPatients());
  };

  // Handler: Update Status (Admit to ICU/Ward or Discharge)
  const handleUpdatePatientStatus = (id: string, newStatus: EmergencyPatient['status']) => {
    storageService.updateEmergencyPatient(id, { status: newStatus });
    setEmergencyPatients(storageService.getEmergencyPatients());
  };

  // Metrics
  const redCount = emergencyPatients.filter(p => p.triageCategory === 'red_resuscitation' && p.status !== 'discharged').length;
  const yellowCount = emergencyPatients.filter(p => p.triageCategory === 'yellow_emergent' && p.status !== 'discharged').length;
  const greenCount = emergencyPatients.filter(p => p.triageCategory === 'green_non_urgent' && p.status !== 'discharged').length;
  const mlcCount = emergencyPatients.filter(p => p.isMLC).length;

  // Filtered patients
  const filteredPatients = emergencyPatients.filter(p => {
    const matchSearch = p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.erNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.erBed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTriage = triageFilter === 'all' || p.triageCategory === triageFilter;

    if (activeTab === 'trauma') {
      return matchSearch && matchTriage && (p.triageCategory === 'red_resuscitation' || p.isMLC);
    }
    if (activeTab === 'mlc') {
      return matchSearch && matchTriage && p.isMLC;
    }
    if (activeTab === 'discharged') {
      return matchSearch && matchTriage && (p.status === 'discharged' || p.status === 'admitted_icu' || p.status === 'admitted_ward');
    }
    return matchSearch && matchTriage && p.status !== 'discharged';
  });

  return (
    <div className="emergency-module" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Emergency Medicine</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Emergency & Trauma Center</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Siren size={24} style={{ color: 'var(--color-danger)' }} />
            Emergency & Trauma Triage (24x7 ER)
          </div>
          <div className="page-subtitle">
            Red / Yellow / Green Color-Coded Triage, Glasgow Coma Scale (GCS), Resuscitation Bay, Rapid ICU Transfer & Medico-Legal Case (MLC) Registry
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setEmergencyPatients(storageService.getEmergencyPatients())}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowIntakeModal(true)}
            style={{ fontWeight: 700 }}
          >
            <Plus size={15} /> Rapid ER Patient Intake
          </button>
        </div>
      </div>

      {/* Triage KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {/* Red: Resuscitation */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #ef4444' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>RED Code: Resuscitation</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{redCount} Patients</div>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Immediate Life Support & Cath Lab</div>
          </div>
        </div>

        {/* Yellow: Emergent */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>YELLOW Code: Emergent</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{yellowCount} Patients</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Evaluation within 15 mins</div>
          </div>
        </div>

        {/* Green: Non-urgent */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #10b981' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>GREEN Code: Non-Urgent</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{greenCount} Patients</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Stable vitals / Ambulatory</div>
          </div>
        </div>

        {/* MLC Cases */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #6366f1' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Medico-Legal Cases (MLC)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{mlcCount} Cases</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Police intimation registered</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '6px', background: 'var(--bg-surface)', display: 'flex', gap: 4 }}>
        {[
          { id: 'triage', label: `Active ER Triage Board (${emergencyPatients.filter(p => p.status !== 'discharged').length})`, icon: <HeartPulse size={14} /> },
          { id: 'trauma', label: `Trauma & STAT Resuscitation (${redCount})`, icon: <Flame size={14} /> },
          { id: 'mlc', label: `Medico-Legal Cases (${mlcCount})`, icon: <ShieldAlert size={14} /> },
          { id: 'discharged', label: 'Discharged / ICU Transferred', icon: <CheckCircle2 size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
              background: activeTab === t.id ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search patient, ER #, bed, complaint, or trauma..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
          />
        </div>

        <select
          className="input"
          value={triageFilter}
          onChange={e => setTriageFilter(e.target.value)}
          style={{ width: 170, fontSize: 12 }}
        >
          <option value="all">All Triage Categories</option>
          <option value="red_resuscitation">RED (Resuscitation)</option>
          <option value="yellow_emergent">YELLOW (Emergent)</option>
          <option value="green_non_urgent">GREEN (Non-Urgent)</option>
        </select>
      </div>

      {/* Patients Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {filteredPatients.map(patient => {
          const isRed = patient.triageCategory === 'red_resuscitation';
          const isYellow = patient.triageCategory === 'yellow_emergent';

          return (
            <div
              key={patient.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderLeft: `5px solid ${isRed ? '#ef4444' : isYellow ? '#f59e0b' : '#10b981'}`,
                background: isRed ? 'rgba(239, 68, 68, 0.02)' : 'var(--bg-surface)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                    {patient.erNumber} · <strong style={{ color: 'var(--color-primary)' }}>{patient.erBed}</strong>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                    {patient.patientName} ({patient.age}y / {patient.gender.toUpperCase()})
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {patient.isMLC && (
                    <span className="badge badge-danger" style={{ fontSize: 10, fontWeight: 800 }}>
                      MLC
                    </span>
                  )}
                  <span
                    className={`badge badge-${isRed ? 'danger' : isYellow ? 'warning' : 'success'}`}
                    style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800 }}
                  >
                    {isRed ? 'RED CODE' : isYellow ? 'YELLOW' : 'GREEN'}
                  </span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div style={{ fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-base)', padding: 10, borderRadius: 6, lineHeight: 1.4 }}>
                <strong>Chief Complaint:</strong> {patient.chiefComplaint}
              </div>

              {/* Vitals Snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, fontSize: 11, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-base)', padding: '6px 4px', borderRadius: 4 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>BP</div>
                  <div style={{ fontWeight: 700, color: isRed ? 'var(--color-danger)' : 'inherit' }}>{patient.vitals.bp}</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '6px 4px', borderRadius: 4 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>PULSE</div>
                  <div style={{ fontWeight: 700 }}>{patient.vitals.pulse} bpm</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '6px 4px', borderRadius: 4 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>SpO2</div>
                  <div style={{ fontWeight: 700, color: patient.vitals.spo2 < 92 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {patient.vitals.spo2}%
                  </div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '6px 4px', borderRadius: 4 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>GCS</div>
                  <div style={{ fontWeight: 800, color: (patient.glasgowComaScale || 15) < 12 ? 'var(--color-danger)' : 'inherit' }}>
                    {patient.glasgowComaScale || 15}/15
                  </div>
                </div>
              </div>

              {/* Clinical Notes & Doctor */}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>Doctor: <strong style={{ color: 'var(--text-primary)' }}>{patient.assignedDoctor}</strong></div>
                <div>Brought by: <strong>{patient.broughtBy}</strong></div>
                {patient.policeStation && <div>Police Station: <strong style={{ color: 'var(--color-danger)' }}>{patient.policeStation}</strong></div>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto', borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
                {patient.status === 'treatment' && (
                  <>
                    <button
                      className="btn btn-danger btn-xs"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdatePatientStatus(patient.id, 'admitted_icu')}
                    >
                      <BedDouble size={12} /> Admit to ICU
                    </button>
                    <button
                      className="btn btn-primary btn-xs"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdatePatientStatus(patient.id, 'admitted_ward')}
                    >
                      Admit to Ward
                    </button>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleUpdatePatientStatus(patient.id, 'discharged')}
                    >
                      Discharge
                    </button>
                  </>
                )}
                {patient.status !== 'treatment' && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    Status: <span style={{ color: 'var(--color-success)', textTransform: 'capitalize' }}>{patient.status.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Rapid ER Patient Intake */}
      {showIntakeModal && (
        <div className="modal-overlay" onClick={() => setShowIntakeModal(false)}>
          <div className="modal-container" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Siren size={20} style={{ color: 'var(--color-danger)' }} />
                Rapid Emergency & Trauma Intake
              </div>
              <button className="modal-close" onClick={() => setShowIntakeModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEmergencyPatient}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Triage Selector */}
                <div>
                  <label className="label">Triage Urgency Category *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIntakeForm({ ...intakeForm, triageCategory: 'red_resuscitation' })}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        border: intakeForm.triageCategory === 'red_resuscitation' ? '2px solid #ef4444' : '1px solid var(--border-default)',
                        background: intakeForm.triageCategory === 'red_resuscitation' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-base)',
                        color: intakeForm.triageCategory === 'red_resuscitation' ? '#ef4444' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      RED (Immediate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntakeForm({ ...intakeForm, triageCategory: 'yellow_emergent' })}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        border: intakeForm.triageCategory === 'yellow_emergent' ? '2px solid #f59e0b' : '1px solid var(--border-default)',
                        background: intakeForm.triageCategory === 'yellow_emergent' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-base)',
                        color: intakeForm.triageCategory === 'yellow_emergent' ? '#f59e0b' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      YELLOW (Emergent)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntakeForm({ ...intakeForm, triageCategory: 'green_non_urgent' })}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        border: intakeForm.triageCategory === 'green_non_urgent' ? '2px solid #10b981' : '1px solid var(--border-default)',
                        background: intakeForm.triageCategory === 'green_non_urgent' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-base)',
                        color: intakeForm.triageCategory === 'green_non_urgent' ? '#10b981' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      GREEN (Non-Urgent)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div>
                    <label className="label">Patient Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Ramesh Varma"
                      value={intakeForm.patientName}
                      onChange={e => setIntakeForm({ ...intakeForm, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Age *</label>
                    <input
                      type="number"
                      className="input"
                      value={intakeForm.age}
                      onChange={e => setIntakeForm({ ...intakeForm, age: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      className="input"
                      value={intakeForm.gender}
                      onChange={e => setIntakeForm({ ...intakeForm, gender: e.target.value as any })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Chief Complaint & Onset *</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Describe symptoms, trauma history, pain location, onset time..."
                    value={intakeForm.chiefComplaint}
                    onChange={e => setIntakeForm({ ...intakeForm, chiefComplaint: e.target.value })}
                    required
                  />
                </div>

                {/* Vitals */}
                <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>BP (mmHg)</label>
                    <input
                      type="text"
                      className="input"
                      value={intakeForm.bp}
                      onChange={e => setIntakeForm({ ...intakeForm, bp: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>Pulse (bpm)</label>
                    <input
                      type="number"
                      className="input"
                      value={intakeForm.pulse}
                      onChange={e => setIntakeForm({ ...intakeForm, pulse: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>SpO2 (%)</label>
                    <input
                      type="number"
                      className="input"
                      value={intakeForm.spo2}
                      onChange={e => setIntakeForm({ ...intakeForm, spo2: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>GCS (3-15)</label>
                    <input
                      type="number"
                      className="input"
                      min={3}
                      max={15}
                      value={intakeForm.glasgowComaScale}
                      onChange={e => setIntakeForm({ ...intakeForm, glasgowComaScale: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>ER Bed</label>
                    <input
                      type="text"
                      className="input"
                      value={intakeForm.erBed}
                      onChange={e => setIntakeForm({ ...intakeForm, erBed: e.target.value })}
                    />
                  </div>
                </div>

                {/* MLC Checkbox */}
                <div style={{ padding: 10, background: intakeForm.isMLC ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-base)', borderRadius: 6, border: intakeForm.isMLC ? '1px solid var(--color-danger)' : '1px solid transparent' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={intakeForm.isMLC}
                      onChange={e => setIntakeForm({ ...intakeForm, isMLC: e.target.checked })}
                    />
                    <span>Medico-Legal Case (MLC) / Accident / Poisoning / Assault</span>
                  </label>
                  {intakeForm.isMLC && (
                    <div style={{ marginTop: 8 }}>
                      <label className="label">Police Station & FIR / GD Intimation Details</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Madhapur PS (GD No. 104/2026)"
                        value={intakeForm.policeStation}
                        onChange={e => setIntakeForm({ ...intakeForm, policeStation: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIntakeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" style={{ fontWeight: 700 }}>
                  Admit to ER Triage Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
