// ============================================================
// ALN Cure HMS — Insurance Management Dashboard
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
  Building2,
  FileText,
  PlusCircle,
  Search,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Sparkles,
  ReceiptText
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';

export default function InsuranceDashboard() {
  const { stats, providers, claims, preAuthRequests, policies, settlements, setActiveTab } = useInsurance();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Date filtering logic
  const filteredClaims = useMemo(() => {
    if (dateFilter === 'all') return claims;
    const today = new Date().toISOString().split('T')[0];

    if (dateFilter === 'today') {
      return claims.filter(c => (c.submissionDate || c.claimDate || c.createdAt?.split('T')[0]) === today);
    }
    if (dateFilter === 'this_week') {
      const d = new Date();
      const firstDay = new Date(d.setDate(d.getDate() - d.getDay() + 1)).toISOString().split('T')[0];
      return claims.filter(c => {
        const cd = c.submissionDate || c.claimDate || c.createdAt?.split('T')[0] || '';
        return cd >= firstDay && cd <= today;
      });
    }
    if (dateFilter === 'this_month') {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      return claims.filter(c => {
        const cd = c.submissionDate || c.claimDate || c.createdAt?.split('T')[0] || '';
        return cd >= firstDay && cd <= today;
      });
    }
    if (dateFilter === 'custom' && customFrom && customTo) {
      return claims.filter(c => {
        const cd = c.submissionDate || c.claimDate || c.createdAt?.split('T')[0] || '';
        return cd >= customFrom && cd <= customTo;
      });
    }
    return claims;
  }, [claims, dateFilter, customFrom, customTo]);

  // Derived Metrics
  const totalProvidersCount = providers.length;
  const activePoliciesCount = policies.filter(p => p.status === 'active').length;
  const uniqueInsuredPatientsCount = new Set(policies.map(p => p.patientId)).size;
  
  const expiringSoonCount = useMemo(() => {
    const now = new Date().getTime();
    return policies.filter(p => {
      const diffDays = (new Date(p.endDate).getTime() - now) / (1000 * 3600 * 24);
      return diffDays <= 60 && diffDays >= 0 && p.status === 'active';
    }).length;
  }, [policies]);

  const pendingVerificationCount = stats.pendingVerifications;
  const pendingPreAuthCount = stats.pendingPreAuths;
  const pendingClaimsCount = filteredClaims.filter(c =>
    c.status === 'draft' ||
    c.status === 'pending_documents' ||
    c.status === 'ready_for_submission' ||
    c.status === 'submitted' ||
    c.status === 'under_review' ||
    c.status === 'additional_info_required'
  ).length;

  const approvedClaimsCount = filteredClaims.filter(c => c.status === 'approved' || c.status === 'settled').length;
  const rejectedClaimsCount = filteredClaims.filter(c => c.status === 'rejected').length;
  const settledClaimsCount = settlements.length;

  const totalClaimAmount = filteredClaims.reduce((sum, c) => sum + (c.claimedAmount || c.claimAmount || 0), 0);
  const totalApprovedAmount = filteredClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
  const totalSettledAmount = settlements.reduce((sum, s) => sum + (s.settledAmount || 0), 0);
  const pendingInsuranceAmount = Math.max(0, totalClaimAmount - totalApprovedAmount - totalSettledAmount);

  // Claims by Provider aggregation
  const providerDistribution: Record<string, { count: number; totalAmount: number; approvedAmount: number }> = {};
  filteredClaims.forEach(c => {
    const provName = c.providerName || c.insuranceProvider || 'Other Provider';
    if (!providerDistribution[provName]) {
      providerDistribution[provName] = { count: 0, totalAmount: 0, approvedAmount: 0 };
    }
    providerDistribution[provName].count += 1;
    providerDistribution[provName].totalAmount += (c.claimedAmount || c.claimAmount || 0);
    providerDistribution[provName].approvedAmount += (c.approvedAmount || 0);
  });

  const providerList = Object.entries(providerDistribution).sort((a, b) => b[1].totalAmount - a[1].totalAmount);

  // Monthly Claim Volume Trend
  const monthlyTrends = [
    { month: 'Apr', volume: 18, amount: 24.5, approved: 22.8 },
    { month: 'May', volume: 24, amount: 32.0, approved: 29.5 },
    { month: 'Jun', volume: 29, amount: 41.2, approved: 38.6 },
    { month: 'Jul', volume: 35, amount: 48.0, approved: 44.2 },
    { month: 'Aug', volume: 42, amount: 56.8, approved: 52.1 },
    { month: 'Sep (Current)', volume: filteredClaims.length, amount: +(totalClaimAmount / 100000).toFixed(1), approved: +(totalApprovedAmount / 100000).toFixed(1) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Banner & Quick Actions */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(37,99,235,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Insurance & TPA Command Center
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                Cashless authorizations, policy eligibility verification, claim settlement adjudication & auditing
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setActiveTab('patient-registration')}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '13px' }}
            >
              <Users size={14} /> + Enroll Policy
            </button>
            <button
              className="btn"
              onClick={() => setActiveTab('pre-auth')}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '13px' }}
            >
              <Clock size={14} /> + Pre-Auth Request
            </button>
            <button
              className="btn"
              onClick={() => setActiveTab('claims')}
              style={{ background: '#ffffff', color: '#2563eb', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '13px' }}
            >
              <FileText size={14} /> + Create Claim
            </button>
          </div>
        </div>
      </div>

      {/* 2. Date Filter Toolbar */}
      <div className="card" style={{ padding: '12px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} className="text-primary" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analytics Period:
          </span>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px' }}>
            {(['all', 'today', 'this_week', 'this_month', 'custom'] as const).map(p => (
              <button
                key={p}
                onClick={() => setDateFilter(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: dateFilter === p ? '#2563eb' : 'transparent',
                  color: dateFilter === p ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'this_week' ? 'This Week' : p === 'this_month' ? 'This Month' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              className="form-control"
              style={{ fontSize: '12px', padding: '4px 8px' }}
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="form-control"
              style={{ fontSize: '12px', padding: '4px 8px' }}
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 3. Executive Financial Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #2563eb', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Claimed Amount</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            ₹{totalClaimAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across {filteredClaims.length} active hospital claims
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #059669', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Approved Insurance Amount</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalApprovedAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
            {stats.approvalRate}% overall approval rate
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #d97706', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Insurance Amount</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            ₹{pendingInsuranceAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Under review & verification
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #7c3aed', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Settled Revenue Disbursed</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            ₹{totalSettledAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {settledClaimsCount} settled payment vouchers
          </div>
        </div>
      </div>

      {/* 4. Operational Pulse Cards Grid (8 Essential Indicators) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div
          onClick={() => setActiveTab('providers')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <Building2 size={18} color="#2563eb" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalProvidersCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Providers / TPAs</div>
        </div>

        <div
          onClick={() => setActiveTab('patient-policies')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <ShieldCheck size={18} color="#059669" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{activePoliciesCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Policies</div>
        </div>

        <div
          onClick={() => setActiveTab('patient-policies')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <Users size={18} color="#2563eb" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{uniqueInsuredPatientsCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Insured Patients</div>
        </div>

        <div
          onClick={() => setActiveTab('patient-policies')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <Clock size={18} color="#d97706" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: expiringSoonCount > 0 ? '#d97706' : 'var(--text-primary)' }}>
            {expiringSoonCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expiring Soon</div>
        </div>

        <div
          onClick={() => setActiveTab('policy-verification')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <FileCheck size={18} color="#d97706" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: pendingVerificationCount > 0 ? '#d97706' : 'var(--text-primary)' }}>
            {pendingVerificationCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending Verify</div>
        </div>

        <div
          onClick={() => setActiveTab('pre-auth')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <Clock size={18} color="#2563eb" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{pendingPreAuthCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending Pre-Auth</div>
        </div>

        <div
          onClick={() => setActiveTab('claims')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <FileText size={18} color="#2563eb" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{pendingClaimsCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending Claims</div>
        </div>

        <div
          onClick={() => setActiveTab('claims')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <CheckCircle2 size={18} color="#059669" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>{approvedClaimsCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved Claims</div>
        </div>

        <div
          onClick={() => setActiveTab('claims')}
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-card)' }}
        >
          <XCircle size={18} color="#dc2626" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>{rejectedClaimsCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rejected Claims</div>
        </div>
      </div>

      {/* 5. Core Operational Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Chart 1: Claim Status Overview */}
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            Claim Status Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Approved & Settled ({approvedClaimsCount})</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{filteredClaims.length > 0 ? Math.round((approvedClaimsCount / filteredClaims.length) * 100) : 0}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${filteredClaims.length > 0 ? (approvedClaimsCount / filteredClaims.length) * 100 : 0}%`, height: '100%', background: '#059669' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Pending Documentation & Review ({pendingClaimsCount})</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{filteredClaims.length > 0 ? Math.round((pendingClaimsCount / filteredClaims.length) * 100) : 0}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${filteredClaims.length > 0 ? (pendingClaimsCount / filteredClaims.length) * 100 : 0}%`, height: '100%', background: '#2563eb' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Rejected / Repudiated ({rejectedClaimsCount})</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{filteredClaims.length > 0 ? Math.round((rejectedClaimsCount / filteredClaims.length) * 100) : 0}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${filteredClaims.length > 0 ? (rejectedClaimsCount / filteredClaims.length) * 100 : 0}%`, height: '100%', background: '#dc2626' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Insurance Claims Trend */}
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            Monthly Insurance Volume Trend (₹ Lakhs)
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', paddingTop: '10px' }}>
            {monthlyTrends.map(item => (
              <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>₹{item.amount}L</div>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '90px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: `${Math.min(100, item.amount * 1.5)}%`,
                      background: '#2563eb',
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Claimed: ₹${item.amount}L`}
                  />
                  <div
                    style={{
                      width: '14px',
                      height: `${Math.min(100, item.approved * 1.5)}%`,
                      background: '#059669',
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Approved: ₹${item.approved}L`}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Insurance Provider Distribution */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Insurance Provider Distribution & Claim Volume
          </h3>
          <button onClick={() => setActiveTab('providers')} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
            Manage All Providers →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                <th style={{ padding: '10px 16px' }}>Total Claims</th>
                <th style={{ padding: '10px 16px' }}>Total Claimed Amount</th>
                <th style={{ padding: '10px 16px' }}>Approved Amount</th>
                <th style={{ padding: '10px 16px' }}>Approval Rate</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providerList.map(([provName, provData]) => {
                const provApprovalRate = provData.totalAmount > 0
                  ? Math.round((provData.approvedAmount / provData.totalAmount) * 100)
                  : 100;
                return (
                  <tr key={provName} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} className="text-primary" />
                        <span>{provName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{provData.count} Claims</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      ₹{provData.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>
                      ₹{provData.approvedAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: provApprovalRate >= 80 ? '#059669' : '#d97706' }}>
                        {provApprovalRate}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => setActiveTab('claims')} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        View Claims
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
