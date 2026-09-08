// ============================================================
// ALN Cure HMS — Treatment & Coverage Eligibility Checker
// ============================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Stethoscope,
  BedDouble,
  Activity,
  Layers,
  User,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS, DEMO_DOCTORS, DEMO_ADMISSIONS } from '../../../data/seedData';

interface TreatmentServiceItem {
  id: string;
  treatmentName: string;
  category: 'opd' | 'ipd' | 'surgery' | 'diagnostic' | 'pharmacy';
  procedure: string;
  department: string;
  doctorName: string;
  estimatedCost: number;
  coverageStatus: 'covered' | 'partially_covered' | 'not_covered' | 'requires_approval';
  coveragePercentage: number;
}

const COMMON_TREATMENTS: TreatmentServiceItem[] = [
  {
    id: 'TRT-001',
    treatmentName: 'Coronary Angiography + PTCA Stenting',
    category: 'surgery',
    procedure: 'Percutaneous Transluminal Coronary Angioplasty with DES Stent',
    department: 'Cardiology',
    doctorName: 'Dr. Rajesh Kumar',
    estimatedCost: 140000,
    coverageStatus: 'requires_approval',
    coveragePercentage: 90
  },
  {
    id: 'TRT-002',
    treatmentName: 'Laparoscopic Cholecystectomy',
    category: 'surgery',
    procedure: 'Minimally Invasive Gallbladder Removal',
    department: 'General Surgery',
    doctorName: 'Dr. Sneha Patel',
    estimatedCost: 65000,
    coverageStatus: 'covered',
    coveragePercentage: 100
  },
  {
    id: 'TRT-003',
    treatmentName: 'ICU Critical Care & Ventilator Support (Per Day)',
    category: 'ipd',
    procedure: 'Level 3 Intensive Care Management',
    department: 'Critical Care',
    doctorName: 'Dr. Priya Nair',
    estimatedCost: 22000,
    coverageStatus: 'partially_covered',
    coveragePercentage: 80
  },
  {
    id: 'TRT-004',
    treatmentName: 'OPD Specialist Consultation & ECG',
    category: 'opd',
    procedure: 'Outpatient Clinical Evaluation & 12-Lead ECG',
    department: 'Cardiology',
    doctorName: 'Dr. Rajesh Kumar',
    estimatedCost: 1500,
    coverageStatus: 'covered',
    coveragePercentage: 100
  },
  {
    id: 'TRT-005',
    treatmentName: 'MRI Brain with Contrast',
    category: 'diagnostic',
    procedure: '3 Tesla High-Resolution Neuro Imaging',
    department: 'Radiology',
    doctorName: 'Dr. Amit Trivedi',
    estimatedCost: 8500,
    coverageStatus: 'covered',
    coveragePercentage: 90
  },
  {
    id: 'TRT-006',
    treatmentName: 'Chemotherapy Infusion Session',
    category: 'ipd',
    procedure: 'Targeted Oncology Chemotherapeutic Infusion',
    department: 'Oncology',
    doctorName: 'Dr. Sanjay Gupta',
    estimatedCost: 45000,
    coverageStatus: 'requires_approval',
    coveragePercentage: 90
  },
  {
    id: 'TRT-007',
    treatmentName: 'Cosmetic Rhinoplasty / Scar Revision',
    category: 'surgery',
    procedure: 'Elective Aesthetic Plastic Surgery',
    department: 'Plastic Surgery',
    doctorName: 'Dr. Sneha Patel',
    estimatedCost: 80000,
    coverageStatus: 'not_covered',
    coveragePercentage: 0
  }
];

export default function CoverageEligibility() {
  const { policies, coverageRules, setActiveTab } = useInsurance();

  const [selectedPatientId, setSelectedPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(COMMON_TREATMENTS[0]?.id || 'TRT-001');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const activePatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const activePolicy = policies.find(p => p.patientId === selectedPatientId);
  const selectedTreatment = COMMON_TREATMENTS.find(t => t.id === selectedTreatmentId) || COMMON_TREATMENTS[0];

  // Active admission for patient if any
  const activeAdmission = DEMO_ADMISSIONS.find(a => a.patientId === selectedPatientId && a.status === 'active');

  // Calculate Coverage Split
  const copayPct = activePolicy ? activePolicy.coPayPercentage : 10;
  const coverageRate = selectedTreatment.coverageStatus === 'not_covered' ? 0 : selectedTreatment.coveragePercentage;
  const maxCoverable = Math.round((selectedTreatment.estimatedCost * coverageRate) / 100);
  const copayAmount = Math.round((maxCoverable * copayPct) / 100);
  const insurancePays = Math.min(activePolicy ? activePolicy.remainingCoverage : 0, maxCoverable - copayAmount);
  const patientPays = selectedTreatment.estimatedCost - insurancePays;

  const filteredTreatments = COMMON_TREATMENTS.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.treatmentName.toLowerCase().includes(q) ||
      t.procedure.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.doctorName.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Treatment & Coverage Eligibility Matrix</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Evaluate OPD/IPD clinical procedures, estimate insurer coverage, co-pay ratios, and patient responsibility
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('pre-auth')}>
          + Raise Pre-Auth Request
        </button>
      </div>

      {/* Patient Selector Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar avatar-md" style={{ background: '#2563eb', color: '#ffffff' }}>
            {activePatient.firstName[0]}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>
              {activePatient.firstName} {activePatient.lastName} <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>({activePatient.id})</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {activePolicy ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  Active Policy: {activePolicy.providerName} (Sum Insured: ₹{activePolicy.sumInsured.toLocaleString()} · Remaining: ₹{activePolicy.remainingCoverage.toLocaleString()})
                </span>
              ) : (
                <span style={{ color: '#dc2626' }}>No active insurance policy on file</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Switch Patient:</label>
          <select
            className="form-select"
            style={{ width: '240px' }}
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
          >
            {DEMO_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Grid: Treatment Selector (Left) & Real-Time Coverage Adjudication Split (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left: Treatment Directory */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Hospital Services & Treatments</span>
            <select
              className="form-select"
              style={{ width: '150px', height: '32px', fontSize: '12px' }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="surgery">Surgeries</option>
              <option value="ipd">IPD & ICU</option>
              <option value="opd">OPD Consultation</option>
              <option value="diagnostic">Diagnostics</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto', padding: '0 16px 16px' }}>
            {filteredTreatments.map(t => {
              const isSelected = selectedTreatmentId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTreatmentId(t.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-default)',
                    background: isSelected ? 'rgba(37,99,235,0.04)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: isSelected ? '#1e40af' : 'var(--text-primary)' }}>
                        {t.treatmentName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {t.department} · Consultant: {t.doctorName}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        t.coverageStatus === 'covered'
                          ? 'badge-success'
                          : t.coverageStatus === 'requires_approval'
                          ? 'badge-warning'
                          : t.coverageStatus === 'partially_covered'
                          ? 'badge-primary'
                          : 'badge-danger'
                      }`}
                    >
                      {t.coverageStatus.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Est. Hospital Cost:</span>
                    <strong style={{ color: '#0f172a' }}>₹{t.estimatedCost.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Coverage & Patient Responsibility Breakdown Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header">
            <Zap size={18} color="#2563eb" />
            <span className="card-title">Real-Time Benefit & Copay Calculator</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: 0 }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-muted)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Selected Clinical Procedure</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>{selectedTreatment.treatmentName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedTreatment.procedure}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Department: {selectedTreatment.department} · Treating Doctor: {selectedTreatment.doctorName}
              </div>
            </div>

            {/* Financial Split Breakdown Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Estimated Hospital Bill:</span>
                <strong>₹{selectedTreatment.estimatedCost.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)', color: '#059669' }}>
                <span>Covered by Policy ({coverageRate}%):</span>
                <strong>₹{maxCoverable.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)', color: '#d97706' }}>
                <span>Patient Co-Pay ({copayPct}%):</span>
                <strong>₹{copayAmount.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid #2563eb', fontSize: '14px' }}>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>Net Insurance Sanction Estimate:</span>
                <strong style={{ color: '#2563eb', fontSize: '16px' }}>₹{insurancePays.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                <span style={{ fontWeight: 700, color: '#ea580c' }}>Estimated Patient Payable Responsibility:</span>
                <strong style={{ color: '#ea580c', fontSize: '16px' }}>₹{patientPays.toLocaleString()}</strong>
              </div>
            </div>

            {selectedTreatment.coverageStatus === 'requires_approval' && (
              <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '12px', color: '#b45309' }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                This treatment requires mandatory pre-authorization sanction from {activePolicy?.providerName || 'the insurer'} prior to hospital admission.
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              onClick={() => setActiveTab('pre-auth')}
            >
              <Zap size={14} /> Proceed to Pre-Authorization Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
