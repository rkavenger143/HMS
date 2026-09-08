// ============================================================
// ALN Cure HMS — Patient Insurance Registration
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Building2,
  ShieldCheck,
  Calendar,
  CreditCard,
  Percent,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  HeartHandshake
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { DEMO_PATIENTS } from '../../../data/seedData';
import type { PatientInsurancePolicy, PolicyStatus } from '../../../types/insurance';

export default function PatientInsuranceRegistration() {
  const { providers, plans, registerPolicy, policies, setActiveTab, logAuditAction } = useInsurance();

  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0]?.id || '');

  // Form State
  const [providerId, setProviderId] = useState<string>(providers[0]?.id || '');
  const [planId, setPlanId] = useState<string>(plans[0]?.id || '');
  const [policyNumber, setPolicyNumber] = useState<string>(`POL-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [memberId, setMemberId] = useState<string>(`MEM-88${Math.floor(1000 + Math.random() * 9000)}`);
  const [policyHolderName, setPolicyHolderName] = useState<string>('');
  const [relationship, setRelationship] = useState<PatientInsurancePolicy['relationship']>('self');
  const [policyType, setPolicyType] = useState<PatientInsurancePolicy['policyType']>('individual');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [coPayPercentage, setCoPayPercentage] = useState<number>(10);
  const [deductible, setDeductible] = useState<number>(0);
  const [roomRentLimit, setRoomRentLimit] = useState<number>(5000);
  const [icuLimit, setIcuLimit] = useState<number>(10000);
  const [policyStatus, setPolicyStatus] = useState<PolicyStatus>('pending_verification');
  const [notes, setNotes] = useState<string>('Enrolled through Hospital Insurance Desk. Ready for policy document verification.');
  const [successSlip, setSuccessSlip] = useState<PatientInsurancePolicy | null>(null);

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return DEMO_PATIENTS.slice(0, 8);
    const q = patientSearch.toLowerCase();
    return DEMO_PATIENTS.filter(
      p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }, [patientSearch]);

  const activePatient = useMemo(() => {
    return DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  }, [selectedPatientId]);

  const activePatientFullName = activePatient ? `${activePatient.firstName} ${activePatient.lastName}` : '';

  // Provider-filtered plans
  const availablePlans = useMemo(() => {
    return plans.filter(p => p.providerId === providerId && p.status === 'active');
  }, [plans, providerId]);

  // When selected patient changes, default policyholder name to patient name if self
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const pt = DEMO_PATIENTS.find(p => p.id === pId);
    if (pt && relationship === 'self') {
      setPolicyHolderName(`${pt.firstName} ${pt.lastName}`);
    }
  };

  // When plan changes, auto-populate coverage parameters
  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const targetPlan = plans.find(p => p.id === selectedPlanId);
    if (targetPlan) {
      setSumInsured(targetPlan.maxCoverageAmount);
      setCoPayPercentage(targetPlan.coPaymentPercentage);
      setDeductible(targetPlan.deductibleAmount);
      if (targetPlan.insuranceType === 'family') setPolicyType('family_floater');
      else if (targetPlan.insuranceType === 'corporate') setPolicyType('group_corporate');
      else if (targetPlan.insuranceType === 'government') setPolicyType('government_scheme');
      else setPolicyType('individual');
    }
  };

  const handleProviderChange = (newProvId: string) => {
    setProviderId(newProvId);
    const provPlans = plans.filter(p => p.providerId === newProvId);
    if (provPlans.length > 0) {
      handlePlanChange(provPlans[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    const selProvider = providers.find(p => p.id === providerId) || providers[0];
    const selPlan = plans.find(p => p.id === planId) || plans[0];
    const finalHolderName = relationship === 'self' ? activePatientFullName : policyHolderName || activePatientFullName;

    const newPolicy = registerPolicy({
      patientId: activePatient.id,
      patientName: activePatientFullName,
      uhid: activePatient.id,
      providerId: selProvider.id,
      providerName: selProvider.companyName,
      planId: selPlan.id,
      planName: selPlan.planName,
      tpaName: selProvider.tpaName,
      policyNumber,
      memberId,
      policyHolderName: finalHolderName,
      relationship,
      policyType,
      startDate,
      endDate,
      sumInsured: Number(sumInsured),
      remainingCoverage: Number(sumInsured),
      coPayPercentage: Number(coPayPercentage),
      deductible: Number(deductible),
      roomRentLimitPerDay: Number(roomRentLimit),
      icuLimitPerDay: Number(icuLimit),
      status: policyStatus,
      verificationNotes: notes,
      documents: {
        insuranceCard: `CARD-${memberId}.pdf`,
        policyDoc: `POLICY-${policyNumber}.pdf`
      }
    });

    setSuccessSlip(newPolicy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus className="text-primary" size={24} />
            Patient Insurance Registration
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Link health insurance policies, cashless covers, and government health schemes directly to existing patient records.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('patient-policies')}
          className="btn btn-secondary"
          style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          View All Enrolled Policies
        </button>
      </div>

      {successSlip ? (
        /* Registration Success Receipt Slip */
        <div className="card" style={{ padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.12)', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Insurance Policy Enrolled Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Policy #{successSlip.policyNumber} has been linked to {successSlip.patientName} ({successSlip.uhid}).
            </p>
          </div>

          <div style={{ background: 'var(--bg-base)', borderRadius: '10px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{successSlip.patientName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Patient UHID:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{successSlip.uhid}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Insurance Provider:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{successSlip.providerName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Plan Name:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{successSlip.planName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Policy & Member ID:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{successSlip.policyNumber} / {successSlip.memberId}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Coverage Amount:</span>
              <div style={{ fontWeight: 700, color: '#059669' }}>₹{successSlip.sumInsured.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Co-Payment / Deductible:</span>
              <div style={{ fontWeight: 600 }}>{successSlip.coPayPercentage}% / ₹{successSlip.deductible.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Validity Period:</span>
              <div style={{ fontWeight: 600 }}>{successSlip.startDate} to {successSlip.endDate}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => {
                setSuccessSlip(null);
                setPolicyNumber(`POL-2026-${Math.floor(100000 + Math.random() * 900000)}`);
              }}
              className="btn btn-secondary"
            >
              Enroll Another Policy
            </button>
            <button
              onClick={() => setActiveTab('policy-verification')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Proceed to Policy Verification <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* Enrollment Split Form */
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Left Column: Select Existing Patient */}
          <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} className="text-primary" />
              1. Select Patient from HMS
            </h3>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '32px', fontSize: '12px' }}
                placeholder="Search UHID, name, mobile..."
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto' }}>
              {filteredPatients.map(patient => {
                const isSelected = patient.id === selectedPatientId;
                const existingPatientPolicies = policies.filter(p => p.patientId === patient.id);
                return (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-default)',
                      background: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--bg-base)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {patient.gender} · {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}y
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>UHID: {patient.id}</span>
                      {existingPatientPolicies.length > 0 && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          {existingPatientPolicies.length} {existingPatientPolicies.length === 1 ? 'Policy' : 'Policies'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Patient Live Card */}
            {activePatient && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(37,99,235,0.08)', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.2)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                  Active Selected Patient
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                  {activePatient.firstName} {activePatient.lastName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  UHID: <strong>{activePatient.id}</strong> | Mobile: {activePatient.phone}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  DOB: {activePatient.dateOfBirth} | Blood Group: {activePatient.bloodGroup}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Policy Details Registration Form */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} className="text-primary" />
              2. Enter Insurance Policy Details
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Row 1: Provider & Plan Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Insurance Provider / Payer *</label>
                  <select
                    className="form-control"
                    value={providerId}
                    onChange={e => handleProviderChange(e.target.value)}
                    required
                  >
                    {providers.map(prov => (
                      <option key={prov.id} value={prov.id}>
                        {prov.companyName} {prov.tpaName ? `(${prov.tpaName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Insurance Plan *</label>
                  <select
                    className="form-control"
                    value={planId}
                    onChange={e => handlePlanChange(e.target.value)}
                    required
                  >
                    {availablePlans.length > 0 ? (
                      availablePlans.map(pl => (
                        <option key={pl.id} value={pl.id}>
                          {pl.planName} (Max ₹{(pl.maxCoverageAmount / 100000).toFixed(1)}L)
                        </option>
                      ))
                    ) : (
                      <option value="">No active plans for this provider</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Policy & Member Identification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Policy Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. POL-STAR-889021"
                    value={policyNumber}
                    onChange={e => setPolicyNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Member / TPA Card ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MEM-992144"
                    value={memberId}
                    onChange={e => setMemberId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Policy Type</label>
                  <select
                    className="form-control"
                    value={policyType}
                    onChange={e => setPolicyType(e.target.value as any)}
                  >
                    <option value="individual">Individual Cover</option>
                    <option value="family_floater">Family Floater</option>
                    <option value="group_corporate">Corporate / Group</option>
                    <option value="government_scheme">Government Scheme</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Policy Holder & Relation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Relationship with Patient</label>
                  <select
                    className="form-control"
                    value={relationship}
                    onChange={e => {
                      const rel = e.target.value as any;
                      setRelationship(rel);
                      if (rel === 'self' && activePatient) {
                        setPolicyHolderName(activePatientFullName);
                      }
                    }}
                  >
                    <option value="self">Self (Patient is Policyholder)</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child / Dependant</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Policy Holder Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full name of primary insured"
                    value={policyHolderName || (relationship === 'self' ? activePatientFullName : '')}
                    onChange={e => setPolicyHolderName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Validity Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Policy Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Policy Expiry Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Financial Coverage Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Sum Insured (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="10000"
                    step="10000"
                    value={sumInsured}
                    onChange={e => setSumInsured(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Co-Pay (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="100"
                    value={coPayPercentage}
                    onChange={e => setCoPayPercentage(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Deductible (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="500"
                    value={deductible}
                    onChange={e => setDeductible(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Initial Status</label>
                  <select
                    className="form-control"
                    value={policyStatus}
                    onChange={e => setPolicyStatus(e.target.value as any)}
                  >
                    <option value="pending_verification">Pending Verification</option>
                    <option value="active">Active & Verified</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Notes */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Registration Notes & Verification Instructions</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special remarks or TPA pre-conditions..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('patient-policies')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px', fontSize: '14px' }}>
                  Save & Register Insurance Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
