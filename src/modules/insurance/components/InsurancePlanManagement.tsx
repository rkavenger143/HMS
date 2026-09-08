// ============================================================
// ALN Cure HMS — Insurance Plan Management
// ============================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Building2,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import type { InsurancePlan, InsurancePlanType, PlanStatus } from '../../../types/insurance';

const ALL_SERVICES = [
  'OPD Consultation',
  'IPD Room Charges',
  'Surgery & OT',
  'ICU Care',
  'Diagnostics & Lab',
  'Radiology & Scans',
  'Pharmacy Dispensation',
  'Emergency & Trauma',
  'Maternity & Newborn Care',
  'Day Care Procedures'
];

export default function InsurancePlanManagement() {
  const { plans, providers, addPlan, updatePlan, togglePlanStatus, setActiveTab } = useInsurance();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<InsurancePlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    providerId: providers[0]?.id || '',
    planName: '',
    planCode: '',
    insuranceType: 'individual' as InsurancePlanType,
    coverageDetails: '',
    maxCoverageAmount: 500000,
    coPaymentPercentage: 10,
    deductibleAmount: 0,
    validityPeriodMonths: 12,
    eligibleServices: ['OPD Consultation', 'IPD Room Charges', 'Surgery & OT', 'Diagnostics & Lab', 'Pharmacy'],
    excludedServices: ['Cosmetic Surgery', 'Experimental Drugs'],
    status: 'active' as PlanStatus
  });

  const [excludedInput, setExcludedInput] = useState('Cosmetic Procedures, Dental Care');

  const filteredPlans = plans.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.planName.toLowerCase().includes(q) ||
      p.planCode.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q);
    const matchesProvider = providerFilter === 'ALL' || p.providerId === providerFilter;
    const matchesType = typeFilter === 'ALL' || p.insuranceType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesProvider && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      providerId: providers[0]?.id || '',
      planName: '',
      planCode: '',
      insuranceType: 'individual',
      coverageDetails: '',
      maxCoverageAmount: 500000,
      coPaymentPercentage: 10,
      deductibleAmount: 0,
      validityPeriodMonths: 12,
      eligibleServices: ['OPD Consultation', 'IPD Room Charges', 'Surgery & OT', 'Diagnostics & Lab', 'Pharmacy'],
      excludedServices: ['Cosmetic Surgery', 'Experimental Drugs'],
      status: 'active'
    });
    setExcludedInput('Cosmetic Surgery, Experimental Treatments');
    setShowAddModal(true);
  };

  const handleOpenEdit = (plan: InsurancePlan) => {
    setEditingPlan(plan);
    setFormData({
      providerId: plan.providerId,
      planName: plan.planName,
      planCode: plan.planCode,
      insuranceType: plan.insuranceType,
      coverageDetails: plan.coverageDetails,
      maxCoverageAmount: plan.maxCoverageAmount,
      coPaymentPercentage: plan.coPaymentPercentage,
      deductibleAmount: plan.deductibleAmount,
      validityPeriodMonths: plan.validityPeriodMonths,
      eligibleServices: plan.eligibleServices,
      excludedServices: plan.excludedServices,
      status: plan.status
    });
    setExcludedInput(plan.excludedServices.join(', '));
    setShowAddModal(true);
  };

  const handleToggleService = (svc: string) => {
    if (formData.eligibleServices.includes(svc)) {
      setFormData(prev => ({ ...prev, eligibleServices: prev.eligibleServices.filter(s => s !== svc) }));
    } else {
      setFormData(prev => ({ ...prev, eligibleServices: [...prev.eligibleServices, svc] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selProvider = providers.find(p => p.id === formData.providerId) || providers[0];
    const excludedList = excludedInput.split(',').map(s => s.trim()).filter(Boolean);

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        providerId: selProvider.id,
        providerName: selProvider.companyName,
        planName: formData.planName,
        planCode: formData.planCode || `PLAN-${Math.floor(1000 + Math.random() * 9000)}`,
        insuranceType: formData.insuranceType,
        coverageDetails: formData.coverageDetails,
        maxCoverageAmount: Number(formData.maxCoverageAmount),
        coPaymentPercentage: Number(formData.coPaymentPercentage),
        deductibleAmount: Number(formData.deductibleAmount),
        validityPeriodMonths: Number(formData.validityPeriodMonths),
        eligibleServices: formData.eligibleServices,
        excludedServices: excludedList,
        status: formData.status
      });
    } else {
      addPlan({
        providerId: selProvider.id,
        providerName: selProvider.companyName,
        planName: formData.planName,
        planCode: formData.planCode || `PLAN-${Math.floor(1000 + Math.random() * 9000)}`,
        insuranceType: formData.insuranceType,
        coverageDetails: formData.coverageDetails,
        maxCoverageAmount: Number(formData.maxCoverageAmount),
        coPaymentPercentage: Number(formData.coPaymentPercentage),
        deductibleAmount: Number(formData.deductibleAmount),
        validityPeriodMonths: Number(formData.validityPeriodMonths),
        eligibleServices: formData.eligibleServices,
        excludedServices: excludedList,
        status: formData.status
      });
    }

    setShowAddModal(false);
    setEditingPlan(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="text-primary" size={24} />
            Insurance Plan Management
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Configure and maintain policy plans, sum insured tiers, co-payment rules, and service eligibility per insurer.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('patient-registration')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            Enroll Patient Policy
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Insurance Plan
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search plan name, code, insurer..."
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              style={{ fontSize: '13px' }}
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
            >
              <option value="ALL">All Insurance Providers ({providers.length})</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-control"
              style={{ fontSize: '13px' }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Plan Types</option>
              <option value="individual">Individual Plan</option>
              <option value="family">Family Floater</option>
              <option value="corporate">Corporate Group</option>
              <option value="government">Government Scheme</option>
              <option value="employee">Employee Scheme</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <select
              className="form-control"
              style={{ fontSize: '13px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Plans</option>
              <option value="inactive">Inactive Plans</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
            Master Plan Registry ({filteredPlans.length} Plans)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>Plan Name & Code</th>
                <th style={{ padding: '12px 16px' }}>Insurance Provider</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Max Coverage</th>
                <th style={{ padding: '12px 16px' }}>Co-Pay %</th>
                <th style={{ padding: '12px 16px' }}>Deductible</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No insurance plans found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredPlans.map(plan => (
                  <tr key={plan.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.planName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code: {plan.planCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} className="text-secondary" />
                        <span>{plan.providerName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          background: plan.insuranceType === 'government' ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                          color: plan.insuranceType === 'government' ? '#059669' : '#2563eb'
                        }}
                      >
                        {plan.insuranceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      ₹{plan.maxCoverageAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600, color: plan.coPaymentPercentage === 0 ? '#059669' : '#d97706' }}>
                        {plan.coPaymentPercentage}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {plan.deductibleAmount > 0 ? `₹${plan.deductibleAmount.toLocaleString()}` : 'Nil'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: plan.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: plan.status === 'active' ? '#059669' : '#dc2626'
                        }}
                      >
                        {plan.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => setViewingPlan(plan)}
                          className="btn btn-secondary btn-sm"
                          title="View Plan Details"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(plan)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Plan"
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => togglePlanStatus(plan.id)}
                          className={`btn btn-sm ${plan.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                          title={plan.status === 'active' ? 'Deactivate Plan' : 'Activate Plan'}
                          style={{ padding: '4px 8px' }}
                        >
                          {plan.status === 'active' ? <ToggleRight size={14} color="#059669" /> : <ToggleLeft size={14} color="#dc2626" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                {editingPlan ? `Edit Plan: ${editingPlan.planName}` : 'Add New Insurance Plan'}
              </h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Insurance Provider *</label>
                    <select
                      className="form-control"
                      value={formData.providerId}
                      onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                      required
                    >
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Insurance Type *</label>
                    <select
                      className="form-control"
                      value={formData.insuranceType}
                      onChange={e => setFormData({ ...formData, insuranceType: e.target.value as any })}
                      required
                    >
                      <option value="individual">Individual Insurance</option>
                      <option value="family">Family Floater</option>
                      <option value="corporate">Corporate Insurance</option>
                      <option value="government">Government Insurance</option>
                      <option value="employee">Employee Insurance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Plan Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Optima Secure Family Platinum"
                      value={formData.planName}
                      onChange={e => setFormData({ ...formData, planName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Plan Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. STAR-PLAT-01"
                      value={formData.planCode}
                      onChange={e => setFormData({ ...formData, planCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Coverage Details & Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief description of coverage benefits, waiting periods, or room rent limits..."
                    value={formData.coverageDetails}
                    onChange={e => setFormData({ ...formData, coverageDetails: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Max Sum Insured (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="10000"
                      step="10000"
                      value={formData.maxCoverageAmount}
                      onChange={e => setFormData({ ...formData, maxCoverageAmount: Number(e.target.value) })}
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
                      value={formData.coPaymentPercentage}
                      onChange={e => setFormData({ ...formData, coPaymentPercentage: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Deductible (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="500"
                      value={formData.deductibleAmount}
                      onChange={e => setFormData({ ...formData, deductibleAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Eligible Clinical Services</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                    {ALL_SERVICES.map(svc => (
                      <label key={svc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.eligibleServices.includes(svc)}
                          onChange={() => handleToggleService(svc)}
                        />
                        <span>{svc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Excluded Services (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Cosmetic Surgery, Dental Treatments, Experimental Drugs"
                    value={excludedInput}
                    onChange={e => setExcludedInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Details Modal */}
      {viewingPlan && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Plan Overview</h3>
              <button className="close-btn" onClick={() => setViewingPlan(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {viewingPlan.providerName}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {viewingPlan.planName}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Plan Code: <strong>{viewingPlan.planCode}</strong> | Type: <strong style={{ textTransform: 'capitalize' }}>{viewingPlan.insuranceType}</strong>
                </div>
              </div>

              {viewingPlan.coverageDetails && (
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', fontSize: '13px' }}>
                  {viewingPlan.coverageDetails}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Sum Insured</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{viewingPlan.maxCoverageAmount.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Co-Payment</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                    {viewingPlan.coPaymentPercentage}%
                  </div>
                </div>
                <div style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deductible</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{viewingPlan.deductibleAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Eligible Services:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewingPlan.eligibleServices.map(s => (
                    <span key={s} style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.1)', color: '#059669', borderRadius: '6px', fontSize: '11px', fontWeight: 500 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Excluded Services:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewingPlan.excludedServices.map(s => (
                    <span key={s} style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: '6px', fontSize: '11px', fontWeight: 500 }}>
                      ✕ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingPlan(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
