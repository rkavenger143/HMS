// ============================================================
// ALN Cure HMS — Patient Insurance Policy Master Component
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit2,
  Calendar,
  User,
  CreditCard,
  Building2,
  FileText,
  Phone,
  Layers,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../contexts/ToastContext';
import type { PatientInsurancePolicy, PolicyStatus, InsurancePlan } from '../../../types/insurance';
import type { Patient } from '../../../types/index';

export default function PatientInsuranceManagement() {
  const {
    policies,
    providers,
    plans,
    registerPolicy,
    updatePolicy,
    verifyPolicy,
    expirePolicy,
    logAuditAction
  } = useInsurance();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Live HMS Patients State
  const [allPatients, setAllPatients] = useState<Patient[]>(() => storageService.getPatients());

  useEffect(() => {
    const handleStorage = () => setAllPatients(storageService.getPatients());
    window.addEventListener('hms_storage_updated', handleStorage);
    return () => window.removeEventListener('hms_storage_updated', handleStorage);
  }, []);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentPolicy, setCurrentPolicy] = useState<Partial<PatientInsurancePolicy>>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Policies
  const filteredPolicies = policies.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.patientName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.policyNumber.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q);

    const matchesProvider = selectedProviderFilter === 'ALL' || p.providerId === selectedProviderFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.status === selectedStatusFilter;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Available plans for currently selected provider in modal
  const providerPlans = useMemo(() => {
    if (!currentPolicy.providerId) return [];
    return plans.filter(plan => plan.providerId === currentPolicy.providerId && plan.status === 'active');
  }, [plans, currentPolicy.providerId]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setFormError(null);

    const initialPatient = allPatients[0] || null;
    const initialProvider = providers.find(p => p.status === 'active') || providers[0] || null;
    const initialPlans = initialProvider ? plans.filter(p => p.providerId === initialProvider.id && p.status === 'active') : [];
    const initialPlan = initialPlans[0] || null;

    const patientFullName = initialPatient ? `${initialPatient.firstName} ${initialPatient.lastName}` : '';

    setSelectedPatient(initialPatient);
    setSelectedPlanId(initialPlan?.id || '');

    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setCurrentPolicy({
      patientId: initialPatient?.id || '',
      patientName: patientFullName,
      uhid: initialPatient?.id || '',
      providerId: initialProvider?.id || '',
      providerName: initialProvider?.companyName || '',
      planId: initialPlan?.id || undefined,
      planName: initialPlan?.planName || 'Comprehensive Health Shield Plan',
      tpaName: initialProvider?.tpaName || 'Direct Cashless Desk',
      policyNumber: '',
      memberId: '',
      policyHolderName: patientFullName,
      relationship: 'self',
      policyType: initialPlan?.insuranceType === 'family' ? 'family_floater' : initialPlan?.insuranceType === 'corporate' ? 'group_corporate' : initialPlan?.insuranceType === 'government' ? 'government_scheme' : 'individual',
      startDate: todayStr,
      endDate: nextYearStr,
      sumInsured: initialPlan?.maxCoverageAmount || 500000,
      remainingCoverage: initialPlan?.maxCoverageAmount || 500000,
      coPayPercentage: initialPlan?.coPaymentPercentage ?? 10,
      deductible: initialPlan?.deductibleAmount ?? 0,
      roomRentLimitPerDay: 5000,
      icuLimitPerDay: 10000,
      status: 'active',
      verificationNotes: 'Registered at Hospital Insurance Desk. Ready for cashless processing.'
    });

    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: PatientInsurancePolicy) => {
    setModalMode('edit');
    setFormError(null);
    setCurrentPolicy({ ...p });

    const patient = allPatients.find(pt => pt.id === p.patientId) || null;
    setSelectedPatient(patient);
    setSelectedPlanId(p.planId || '');

    setShowModal(true);
  };

  // Open View Modal
  const handleOpenView = (p: PatientInsurancePolicy) => {
    setModalMode('view');
    setFormError(null);
    setCurrentPolicy({ ...p });

    const patient = allPatients.find(pt => pt.id === p.patientId) || null;
    setSelectedPatient(patient);

    setShowModal(true);
  };

  // When patient is selected in the form
  const handlePatientChange = (patientId: string) => {
    const patient = allPatients.find(p => p.id === patientId) || null;
    setSelectedPatient(patient);

    if (patient) {
      const fullName = `${patient.firstName} ${patient.lastName}`;
      setCurrentPolicy(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: fullName,
        uhid: patient.id,
        policyHolderName: prev.relationship === 'self' ? fullName : (prev.policyHolderName || fullName)
      }));
    }
  };

  // When provider is selected in the form
  const handleProviderChange = (provId: string) => {
    const prov = providers.find(p => p.id === provId);
    if (!prov) return;

    const matchingPlans = plans.filter(p => p.providerId === provId && p.status === 'active');
    const firstPlan = matchingPlans[0] || null;

    setSelectedPlanId(firstPlan?.id || '');

    setCurrentPolicy(prev => ({
      ...prev,
      providerId: prov.id,
      providerName: prov.companyName,
      tpaName: prov.tpaName || 'Direct Cashless Desk',
      planId: firstPlan?.id || undefined,
      planName: firstPlan?.planName || prev.planName || 'Standard Health Plan',
      sumInsured: firstPlan?.maxCoverageAmount || prev.sumInsured || 500000,
      remainingCoverage: firstPlan?.maxCoverageAmount || prev.remainingCoverage || 500000,
      coPayPercentage: firstPlan?.coPaymentPercentage ?? prev.coPayPercentage ?? 10,
      deductible: firstPlan?.deductibleAmount ?? prev.deductible ?? 0
    }));
  };

  // When plan is selected in the form
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setCurrentPolicy(prev => ({
        ...prev,
        planId: selectedPlan.id,
        planName: selectedPlan.planName,
        sumInsured: selectedPlan.maxCoverageAmount,
        remainingCoverage: selectedPlan.maxCoverageAmount,
        coPayPercentage: selectedPlan.coPaymentPercentage,
        deductible: selectedPlan.deductibleAmount,
        policyType: selectedPlan.insuranceType === 'family' ? 'family_floater' : selectedPlan.insuranceType === 'corporate' ? 'group_corporate' : selectedPlan.insuranceType === 'government' ? 'government_scheme' : 'individual'
      }));
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pid = currentPolicy.patientId?.trim();
    const provId = currentPolicy.providerId?.trim();
    const polNum = currentPolicy.policyNumber?.trim();
    const memId = currentPolicy.memberId?.trim();
    const holder = currentPolicy.policyHolderName?.trim();
    const start = currentPolicy.startDate;
    const end = currentPolicy.endDate;
    const sumIns = Number(currentPolicy.sumInsured || 0);

    // Form Validations
    if (!pid) {
      setFormError('Please select a valid Patient.');
      return;
    }
    if (!provId) {
      setFormError('Please select an Insurance Provider.');
      return;
    }
    if (!polNum) {
      setFormError('Policy Number is required.');
      return;
    }
    if (!memId) {
      setFormError('Member ID / Health Card ID is required.');
      return;
    }
    if (!holder) {
      setFormError('Policy Holder Name is required.');
      return;
    }
    if (!start) {
      setFormError('Policy Start Date is required.');
      return;
    }
    if (!end) {
      setFormError('Policy Expiry Date is required.');
      return;
    }
    if (new Date(end) < new Date(start)) {
      setFormError('Policy Expiry Date cannot be earlier than Policy Start Date.');
      return;
    }
    if (sumIns <= 0) {
      setFormError('Sum Insured coverage amount must be greater than zero.');
      return;
    }

    // Duplicate Policy Number Check
    const duplicate = policies.find(
      p => p.policyNumber.trim().toLowerCase() === polNum.toLowerCase() && (modalMode === 'add' || p.id !== currentPolicy.id)
    );
    if (duplicate) {
      setFormError(`A policy with Policy Number "${polNum}" is already registered for patient ${duplicate.patientName} (${duplicate.patientId}).`);
      toast.error(`Duplicate Policy Number: "${polNum}" already exists.`);
      return;
    }

    const providerObj = providers.find(p => p.id === provId);
    const finalProviderName = providerObj?.companyName || currentPolicy.providerName || 'Insurance Provider';
    const finalPatientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : (currentPolicy.patientName || 'Patient');

    try {
      if (modalMode === 'add') {
        registerPolicy({
          patientId: pid,
          patientName: finalPatientName,
          uhid: pid,
          providerId: provId,
          providerName: finalProviderName,
          planId: currentPolicy.planId,
          tpaId: currentPolicy.tpaId,
          tpaName: currentPolicy.tpaName || providerObj?.tpaName || 'Direct Cashless Desk',
          policyNumber: polNum,
          memberId: memId,
          policyHolderName: holder,
          relationship: currentPolicy.relationship || 'self',
          planName: currentPolicy.planName || 'Comprehensive Health Plan',
          policyType: currentPolicy.policyType || 'individual',
          startDate: start,
          endDate: end,
          sumInsured: sumIns,
          remainingCoverage: Number(currentPolicy.remainingCoverage || sumIns),
          coPayPercentage: Number(currentPolicy.coPayPercentage || 0),
          deductible: Number(currentPolicy.deductible || 0),
          roomRentLimitPerDay: Number(currentPolicy.roomRentLimitPerDay || 5000),
          icuLimitPerDay: Number(currentPolicy.icuLimitPerDay || 10000),
          status: (currentPolicy.status as PolicyStatus) || 'active',
          verificationNotes: currentPolicy.verificationNotes
        });
      } else if (modalMode === 'edit' && currentPolicy.id) {
        updatePolicy(currentPolicy.id, {
          patientId: pid,
          patientName: finalPatientName,
          uhid: pid,
          providerId: provId,
          providerName: finalProviderName,
          planId: currentPolicy.planId,
          tpaName: currentPolicy.tpaName || providerObj?.tpaName,
          policyNumber: polNum,
          memberId: memId,
          policyHolderName: holder,
          relationship: currentPolicy.relationship || 'self',
          planName: currentPolicy.planName,
          policyType: currentPolicy.policyType || 'individual',
          startDate: start,
          endDate: end,
          sumInsured: sumIns,
          remainingCoverage: Number(currentPolicy.remainingCoverage ?? sumIns),
          coPayPercentage: Number(currentPolicy.coPayPercentage || 0),
          deductible: Number(currentPolicy.deductible || 0),
          roomRentLimitPerDay: Number(currentPolicy.roomRentLimitPerDay || 5000),
          icuLimitPerDay: Number(currentPolicy.icuLimitPerDay || 10000),
          status: (currentPolicy.status as PolicyStatus) || 'active',
          verificationNotes: currentPolicy.verificationNotes
        });
      }

      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register policy. Please verify fields and try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Patient Insurance Registration & Policy Master ({policies.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Link patient UHID with active insurance policies, calculate co-pays, track remaining sums, and verify eligibility
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd} id="btn-register-patient-policy">
          <Plus size={15} /> Register Patient Policy
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search UHID, Patient, Policy #, Member ID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedProviderFilter} onChange={e => setSelectedProviderFilter(e.target.value)}>
            <option value="ALL">All Insurers ({providers.length})</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.companyName}</option>
            ))}
          </select>

          <select className="form-select" value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)}>
            <option value="ALL">All Policy Statuses</option>
            <option value="active">Active & Verified ({policies.filter(p => p.status === 'active').length})</option>
            <option value="pending_verification">Pending Verification ({policies.filter(p => p.status === 'pending_verification').length})</option>
            <option value="expired">Expired ({policies.filter(p => p.status === 'expired').length})</option>
            <option value="suspended">Suspended ({policies.filter(p => p.status === 'suspended').length})</option>
            <option value="cancelled">Cancelled ({policies.filter(p => p.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      {/* Policies Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & UHID</th>
                  <th>Insurance Provider & TPA</th>
                  <th>Policy & Member ID</th>
                  <th>Plan & Validity</th>
                  <th>Sum Insured (₹)</th>
                  <th>Remaining (₹)</th>
                  <th>Co-Pay / Ded.</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{p.patientName}</strong>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>{p.uhid}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Holder: {p.policyHolderName} ({p.relationship})
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: '#1e40af' }}>{p.providerName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>TPA: {p.tpaName || 'Direct'}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '12px' }}>{p.policyNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Member: {p.memberId}</div>
                    </td>

                    <td>
                      <div className="truncate" style={{ maxWidth: '160px', fontWeight: 600 }}>{p.planName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {p.startDate} to {p.endDate}
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{p.sumInsured.toLocaleString()}</strong>
                    </td>

                    <td>
                      <strong style={{ color: p.remainingCoverage < 100000 ? '#ea580c' : '#059669' }}>
                        ₹{p.remainingCoverage.toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.coPayPercentage}% Co-pay</div>
                      {p.deductible > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>₹{p.deductible} Ded.</div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          p.status === 'active'
                            ? 'badge-success'
                            : p.status === 'pending_verification'
                            ? 'badge-warning'
                            : p.status === 'expired'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenView(p)} title="View Full Details">
                          <Eye size={13} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(p)} title="Edit Policy">
                          <Edit2 size={13} />
                        </button>
                        {p.status === 'pending_verification' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => verifyPolicy(p.id, 'Insurance Desk Coordinator')}
                            title="Verify & Activate Policy"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {p.status === 'active' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => expirePolicy(p.id)}
                            title="Mark as Expired"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredPolicies.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <CreditCard size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>No patient insurance policies found</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Register an active policy for an existing patient to enable cashless hospitalization.
          </div>
        </div>
      )}

      {/* Add / Edit / View Policy Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#2563eb" />
                <span className="modal-title">
                  {modalMode === 'add'
                    ? 'Register Patient Insurance Policy'
                    : modalMode === 'edit'
                    ? `Edit Policy: ${currentPolicy.policyNumber}`
                    : `Policy Dossier: ${currentPolicy.policyNumber}`}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {modalMode === 'view' ? (
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Patient Header Summary */}
                <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{currentPolicy.patientName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        UHID: <strong>{currentPolicy.uhid}</strong> · Primary Holder: <strong>{currentPolicy.policyHolderName}</strong> ({currentPolicy.relationship})
                      </div>
                      {selectedPatient && (
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          DOB: {selectedPatient.dateOfBirth} · Gender: {selectedPatient.gender} · Mobile: {selectedPatient.phone}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${currentPolicy.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {currentPolicy.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Insurance Provider:</strong> {currentPolicy.providerName}</div>
                  <div><strong>TPA Cashless Desk:</strong> {currentPolicy.tpaName || 'Direct'}</div>
                  <div><strong>Policy Number:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{currentPolicy.policyNumber}</span></div>
                  <div><strong>Member ID / Card No:</strong> {currentPolicy.memberId}</div>
                  <div><strong>Plan Product:</strong> {currentPolicy.planName}</div>
                  <div><strong>Policy Type:</strong> {currentPolicy.policyType?.replace(/_/g, ' ')}</div>
                  <div><strong>Total Sum Insured:</strong> ₹{currentPolicy.sumInsured?.toLocaleString()}</div>
                  <div><strong>Remaining Balance:</strong> ₹{currentPolicy.remainingCoverage?.toLocaleString()}</div>
                  <div><strong>Co-Pay Percentage:</strong> {currentPolicy.coPayPercentage}%</div>
                  <div><strong>Deductible Amount:</strong> ₹{currentPolicy.deductible}</div>
                  <div><strong>Room Rent Limit:</strong> ₹{currentPolicy.roomRentLimitPerDay}/day</div>
                  <div><strong>ICU Room Limit:</strong> ₹{currentPolicy.icuLimitPerDay}/day</div>
                  <div><strong>Policy Start Date:</strong> {currentPolicy.startDate}</div>
                  <div><strong>Policy Expiry Date:</strong> {currentPolicy.endDate}</div>
                </div>

                {currentPolicy.verificationNotes && (
                  <div style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.05)', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(37,99,235,0.1)' }}>
                    <strong>Verification & Underwriting Notes:</strong> {currentPolicy.verificationNotes}
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => setModalMode('edit')}>Edit Policy</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
                  {formError && (
                    <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 1. Patient Selection from HMS Database */}
                  <div className="form-group">
                    <label className="form-label">Select Patient from HMS Database *</label>
                    <select
                      className="form-select"
                      required
                      value={currentPolicy.patientId || ''}
                      onChange={e => handlePatientChange(e.target.value)}
                      id="select-patient"
                    >
                      <option value="">-- Choose Existing Patient --</option>
                      {allPatients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} (UHID: {p.id}) · {p.gender} · Phone: {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-Loaded Patient Demographics Card */}
                  {selectedPatient && (
                    <div style={{ padding: '10px 14px', background: 'rgba(37,99,235,0.06)', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.15)', fontSize: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Patient:</span> <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>UHID:</span> <strong>{selectedPatient.id}</strong></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>DOB:</span> <strong>{selectedPatient.dateOfBirth || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Gender:</span> <strong style={{ textTransform: 'capitalize' }}>{selectedPatient.gender}</strong></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Mobile:</span> <strong>{selectedPatient.phone}</strong></div>
                    </div>
                  )}

                  {/* 2. Insurance Provider & Plan Selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Insurance Provider *</label>
                      <select
                        className="form-select"
                        required
                        value={currentPolicy.providerId || ''}
                        onChange={e => handleProviderChange(e.target.value)}
                        id="select-provider"
                      >
                        <option value="">-- Choose Insurance Company --</option>
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.companyName} ({p.code}) {p.status === 'inactive' ? '[Inactive]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Insurance Plan (Auto-filters for Provider)</label>
                      <select
                        className="form-select"
                        value={selectedPlanId}
                        onChange={e => handlePlanChange(e.target.value)}
                        id="select-plan"
                      >
                        <option value="">-- Select Pre-configured Plan or Custom --</option>
                        {providerPlans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.planName} (Max: ₹{plan.maxCoverageAmount.toLocaleString()} · {plan.coPaymentPercentage}% Copay)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Plan Name & Policy Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Plan / Product Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. Comprehensive Health Shield Plan"
                        value={currentPolicy.planName || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, planName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Policy Type *</label>
                      <select
                        className="form-select"
                        value={currentPolicy.policyType || 'individual'}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, policyType: e.target.value as any })}
                      >
                        <option value="individual">Individual</option>
                        <option value="family_floater">Family Floater</option>
                        <option value="group_corporate">Corporate Group Health</option>
                        <option value="government_scheme">Government Scheme</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Policy Number & Member ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Policy Number * (Unique)</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. STAR-IND-2026-981241"
                        value={currentPolicy.policyNumber || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, policyNumber: e.target.value })}
                        id="input-policy-number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Member ID / Health Card ID *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. MEM-STAR-098214"
                        value={currentPolicy.memberId || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, memberId: e.target.value })}
                        id="input-member-id"
                      />
                    </div>
                  </div>

                  {/* 4. Policy Holder & Relationship */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Policy Holder Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="Name of primary insured member"
                        value={currentPolicy.policyHolderName || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, policyHolderName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Relationship with Patient *</label>
                      <select
                        className="form-select"
                        value={currentPolicy.relationship || 'self'}
                        onChange={e => {
                          const rel = e.target.value as any;
                          const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : (currentPolicy.patientName || '');
                          setCurrentPolicy({
                            ...currentPolicy,
                            relationship: rel,
                            policyHolderName: rel === 'self' && patientName ? patientName : currentPolicy.policyHolderName
                          });
                        }}
                      >
                        <option value="self">Self (Patient is Primary Holder)</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="other">Other Dependent</option>
                      </select>
                    </div>
                  </div>

                  {/* 5. Policy Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Policy Start Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={currentPolicy.startDate || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, startDate: e.target.value })}
                        id="input-start-date"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Policy Expiry Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={currentPolicy.endDate || ''}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, endDate: e.target.value })}
                        id="input-end-date"
                      />
                    </div>
                  </div>

                  {/* 6. Sum Insured, Co-Pay, Deductible */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Total Sum Insured (₹) *</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min="1000"
                        step="1000"
                        value={currentPolicy.sumInsured ?? 500000}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCurrentPolicy({
                            ...currentPolicy,
                            sumInsured: val,
                            remainingCoverage: modalMode === 'add' ? val : currentPolicy.remainingCoverage
                          });
                        }}
                        id="input-sum-insured"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Co-Pay (%)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max="100"
                        value={currentPolicy.coPayPercentage ?? 0}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, coPayPercentage: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Deductible (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={currentPolicy.deductible ?? 0}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, deductible: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* 7. Limits & Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Room Rent Cap (₹/day)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={currentPolicy.roomRentLimitPerDay ?? 5000}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, roomRentLimitPerDay: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ICU Rent Cap (₹/day)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={currentPolicy.icuLimitPerDay ?? 10000}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, icuLimitPerDay: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Policy Status *</label>
                      <select
                        className="form-select"
                        value={currentPolicy.status || 'active'}
                        onChange={e => setCurrentPolicy({ ...currentPolicy, status: e.target.value as PolicyStatus })}
                      >
                        <option value="active">Active</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label className="form-label">Verification & Underwriting Notes</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Special clauses, pre-existing condition waiting periods, room caps..."
                      value={currentPolicy.verificationNotes || ''}
                      onChange={e => setCurrentPolicy({ ...currentPolicy, verificationNotes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" id="btn-save-policy">
                    {modalMode === 'add' ? 'Save Patient Policy' : 'Update Policy'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
