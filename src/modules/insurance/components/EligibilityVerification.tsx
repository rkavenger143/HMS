// ============================================================
// ALN Cure HMS — Insurance Eligibility & Policy Coverage Engine
// ============================================================

import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  Activity,
  Percent,
  Calendar,
  Zap,
  Check
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS } from '../../../data/seedData';

export default function EligibilityVerification() {
  const { policies, eligibilityRecords, runEligibilityCheck, coverageRules, setActiveTab } = useInsurance();

  const [selectedPatientId, setSelectedPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [selectedService, setSelectedService] = useState('All Inpatient & Surgical Services');
  const [lastCheckResult, setLastCheckResult] = useState<any | null>(null);
  const [searchHistory, setSearchHistory] = useState('');

  const activePatientPolicy = policies.find(p => p.patientId === selectedPatientId);
  const activePatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId);

  const handleVerify = () => {
    if (!activePatientPolicy) {
      alert('Selected patient does not have an active insurance policy on record.');
      return;
    }

    const res = runEligibilityCheck(selectedPatientId, activePatientPolicy.id, selectedService);
    setLastCheckResult(res);
  };

  const filteredHistory = eligibilityRecords.filter(r => {
    const q = searchHistory.toLowerCase();
    return (
      !searchHistory ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.policyNumber.toLowerCase().includes(q) ||
      r.providerName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Real-Time Policy Eligibility Verification & Coverage Matrix</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Check pre-admission policy validity, sum insured headroom, benefit caps, co-payments, and service authorizations
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patient-policies')}>
          + Link New Policy
        </button>
      </div>

      {/* Main Verification Interface: 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Interactive Verification Console */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header">
            <Zap size={16} color="#2563eb" />
            <span className="card-title">Pre-Admission Eligibility Checker</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: 0 }}>
            {/* Step 1: Patient Picker */}
            <div className="form-group">
              <label className="form-label">Select Hospital Patient (UHID)</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={e => {
                  setSelectedPatientId(e.target.value);
                  setLastCheckResult(null);
                }}
              >
                {DEMO_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.id} ({p.gender}, {p.bloodGroup})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Patient Policy Info Card */}
            {activePatientPolicy ? (
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e40af' }}>{activePatientPolicy.providerName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Plan: {activePatientPolicy.planName}
                    </div>
                  </div>
                  <span className={`badge ${activePatientPolicy.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {activePatientPolicy.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', fontSize: '12px' }}>
                  <div><strong>Policy #:</strong> <span style={{ fontFamily: 'monospace' }}>{activePatientPolicy.policyNumber}</span></div>
                  <div><strong>Member ID:</strong> {activePatientPolicy.memberId}</div>
                  <div><strong>Total Sum Insured:</strong> ₹{activePatientPolicy.sumInsured.toLocaleString()}</div>
                  <div><strong>Available Balance:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>₹{activePatientPolicy.remainingCoverage.toLocaleString()}</span></div>
                  <div><strong>Co-Pay Clause:</strong> {activePatientPolicy.coPayPercentage}%</div>
                  <div><strong>Valid Upto:</strong> {activePatientPolicy.endDate}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626', fontSize: '13px' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                No insurance policy mapped for this patient. Please link a policy first.
              </div>
            )}

            {/* Step 3: Service Selection */}
            <div className="form-group">
              <label className="form-label">Service / Treatment Required</label>
              <select
                className="form-select"
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
              >
                <option value="All Inpatient & Surgical Services">All Inpatient & Surgical Services</option>
                <option value="IPD Admission & Room Rent">IPD Admission & Room Rent</option>
                <option value="Cardiology Cath Lab & Stents">Cardiology Cath Lab & Stents</option>
                <option value="Laparoscopic General Surgery">Laparoscopic General Surgery</option>
                <option value="Orthopedic Joint Replacement">Orthopedic Joint Replacement</option>
                <option value="Diagnostic CT / MRI Imaging">Diagnostic CT / MRI Imaging</option>
                <option value="Emergency & ICU Care">Emergency & ICU Care</option>
                <option value="OPD Specialist Consultation">OPD Specialist Consultation</option>
              </select>
            </div>

            {/* Verification Button */}
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={!activePatientPolicy}
              style={{ justifyContent: 'center', height: '42px', fontWeight: 700 }}
            >
              <FileCheck size={16} /> Run Automated Eligibility Verification
            </button>
          </div>
        </div>

        {/* Right: Verification Adjudication Result */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <Shield size={16} color="#059669" />
              <span className="card-title">Eligibility Verification Result</span>
            </div>

            <div className="card-body" style={{ paddingTop: 0 }}>
              {lastCheckResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Status Banner */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: lastCheckResult.status === 'verified' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${lastCheckResult.status === 'verified' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    {lastCheckResult.status === 'verified' ? (
                      <CheckCircle2 size={32} color="#059669" />
                    ) : (
                      <XCircle size={32} color="#dc2626" />
                    )}
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: lastCheckResult.status === 'verified' ? '#059669' : '#dc2626' }}>
                        {lastCheckResult.status === 'verified' ? 'ELIGIBILITY VERIFIED — CASHLESS PERMITTED' : 'NOT ELIGIBLE FOR CASHLESS'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Ref: {lastCheckResult.verificationNumber} · Verified By: {lastCheckResult.verifiedBy}
                      </div>
                    </div>
                  </div>

                  {/* Benefit Summary Details */}
                  <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Patient Name:</span>
                      <strong>{lastCheckResult.patientName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Insurance Provider:</span>
                      <strong>{lastCheckResult.providerName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Policy Number:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{lastCheckResult.policyNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Available Sum Insured:</span>
                      <strong style={{ color: '#059669' }}>₹{lastCheckResult.sumInsuredAvailable.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Verification Timestamp:</span>
                      <span>{new Date(lastCheckResult.verificationDate).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Pre-Auth Trigger */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => setActiveTab('pre-auth')}
                    >
                      <Zap size={14} /> Proceed to Pre-Authorization Request
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <FileCheck size={42} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>No check executed yet</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Select a patient from the left and click "Run Automated Eligibility Verification".
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Configured Service Coverage Rules Matrix */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#2563eb" />
            <span className="card-title">Standard Service Coverage & Policy Rule Matrix</span>
          </div>
          <span className="badge badge-primary">Schedule of Tariff</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital Service Category</th>
                  <th>Coverage Status</th>
                  <th>Sub-Limit Cap (₹)</th>
                  <th>Co-Payment %</th>
                  <th>Deductible (₹)</th>
                  <th>Pre-Auth Required?</th>
                  <th>Policy Rule Notes</th>
                </tr>
              </thead>
              <tbody>
                {coverageRules.map((rule, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{rule.categoryLabel}</strong>
                    </td>
                    <td>
                      {rule.isCovered ? (
                        <span className="badge badge-success">Covered</span>
                      ) : (
                        <span className="badge badge-danger">Not Covered</span>
                      )}
                    </td>
                    <td>
                      <strong>{rule.coverageLimit ? `₹${rule.coverageLimit.toLocaleString()}` : 'Sum Insured'}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{rule.coPayPercentage}%</span>
                    </td>
                    <td>
                      <span>₹{rule.deductible}</span>
                    </td>
                    <td>
                      {rule.requiresPreAuth ? (
                        <span className="badge badge-warning">Mandatory</span>
                      ) : (
                        <span className="badge badge-neutral">Auto-approved</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rule.remarks}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Verification History Audit Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#d97706" />
            <span className="card-title">Recent Eligibility Verification Audit Log</span>
          </div>
          <div style={{ width: '220px' }}>
            <input
              type="text"
              className="form-input"
              style={{ height: '32px', fontSize: '12px' }}
              placeholder="Search history..."
              value={searchHistory}
              onChange={e => setSearchHistory(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Insurance Provider</th>
                  <th>Policy Number</th>
                  <th>Sum Available (₹)</th>
                  <th>Result Status</th>
                  <th>Verified By</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(rec => (
                  <tr key={rec.id}>
                    <td>
                      <strong style={{ color: '#1e40af' }}>{rec.verificationNumber}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {new Date(rec.verificationDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <strong>{rec.patientName}</strong>
                      <div style={{ fontSize: '11px', color: '#2563eb' }}>{rec.patientId}</div>
                    </td>
                    <td>{rec.providerName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{rec.policyNumber}</td>
                    <td>
                      <strong style={{ color: '#059669' }}>₹{rec.sumInsuredAvailable.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`badge ${rec.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rec.verifiedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
