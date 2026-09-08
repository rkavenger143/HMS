// ============================================================
// ALN Cure HMS — Comprehensive Insurance Reports Module
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Search,
  Filter,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileText,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';

type ReportKey =
  | 'patient_insurance_report'
  | 'policy_expiry_report'
  | 'provider_report'
  | 'pending_claims_report'
  | 'approved_claims_report'
  | 'rejected_claims_report'
  | 'settlement_report'
  | 'insurance_revenue_report';

export default function InsuranceReports() {
  const { policies, claims, settlements, providers, plans } = useInsurance();

  const [activeReportKey, setActiveReportKey] = useState<ReportKey>('patient_insurance_report');
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [policyStatusFilter, setPolicyStatusFilter] = useState('ALL');
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 8 Exact Reports in Specified Order (Section 17)
  const REPORT_LIST: { key: ReportKey; index: number; label: string; description: string }[] = [
    { key: 'patient_insurance_report', index: 1, label: '1. Patient Insurance Report', description: 'Patients with active and inactive insurance policies and remaining coverage limits.' },
    { key: 'policy_expiry_report', index: 2, label: '2. Policy Expiry Report', description: 'Insurance policies that have expired or are expiring within the next 30 to 60 days.' },
    { key: 'provider_report', index: 3, label: '3. Insurance Provider Report', description: 'Provider-wise policy enrollment, active plans, total claims submitted, and empanelment SLA.' },
    { key: 'pending_claims_report', index: 4, label: '4. Pending Claims Report', description: 'Claims waiting for documents, submission, insurer review, or adjudication approval.' },
    { key: 'approved_claims_report', index: 5, label: '5. Approved Claims Report', description: 'Fully and partially approved insurance claims with approved sums and approval numbers.' },
    { key: 'rejected_claims_report', index: 6, label: '6. Rejected Claims Report', description: 'Repudiated claims with rejection dates, disallowed amounts, and official denial reasons.' },
    { key: 'settlement_report', index: 7, label: '7. Claim Settlement Report', description: 'Insurance payments disbursed by payers, received amounts, UTR tracking, and TDS deducted.' },
    { key: 'insurance_revenue_report', index: 8, label: '8. Insurance Revenue Report', description: 'Financial overview of total hospital billing, insurance covered revenue, and patient copay collected.' },
  ];

  // Apply Date Range Preset
  const handlePresetChange = (preset: 'all' | 'today' | 'this_week' | 'this_month' | 'custom') => {
    setDateRangePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === 'this_week') {
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0];
      setDateFrom(firstDayOfWeek);
      setDateTo(todayStr);
    } else if (preset === 'this_month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setDateFrom(firstDayOfMonth);
      setDateTo(todayStr);
    } else if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  };

  const activeReport = REPORT_LIST.find(r => r.key === activeReportKey) || REPORT_LIST[0];

  // Filtered Policies Data
  const filteredPolicies = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return policies.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.patientName.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.policyNumber.toLowerCase().includes(q);
      const matchesProvider = providerFilter === 'ALL' || p.providerId === providerFilter || p.providerName.includes(providerFilter);
      const matchesPolicyStatus = policyStatusFilter === 'ALL' || p.status === policyStatusFilter;

      let matchesDate = true;
      if (dateFrom && p.startDate < dateFrom) matchesDate = false;
      if (dateTo && p.startDate > dateTo) matchesDate = false;

      if (activeReportKey === 'policy_expiry_report') {
        const daysToExpiry = (new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        const isExpiringSoon = p.status === 'expired' || (daysToExpiry <= 60 && daysToExpiry >= 0);
        return matchesSearch && matchesProvider && isExpiringSoon;
      }

      return matchesSearch && matchesProvider && matchesPolicyStatus && matchesDate;
    });
  }, [policies, search, providerFilter, policyStatusFilter, dateFrom, dateTo, activeReportKey]);

  // Filtered Claims Data
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (c.patientName || '').toLowerCase().includes(q) ||
        (c.uhid || '').toLowerCase().includes(q) ||
        (c.claimNumber || '').toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q);
      const matchesProvider = providerFilter === 'ALL' || c.providerId === providerFilter || (c.providerName || c.insuranceProvider || '').includes(providerFilter);
      const matchesClaimStatus = claimStatusFilter === 'ALL' || c.status === claimStatusFilter;

      let matchesDate = true;
      const claimDate = c.submissionDate || c.claimDate || c.createdAt?.split('T')[0] || '';
      if (dateFrom && claimDate < dateFrom) matchesDate = false;
      if (dateTo && claimDate > dateTo) matchesDate = false;

      if (activeReportKey === 'pending_claims_report') {
        const isPending =
          c.status === 'draft' ||
          c.status === 'pending_documents' ||
          c.status === 'ready_for_submission' ||
          c.status === 'submitted' ||
          c.status === 'under_review' ||
          c.status === 'additional_info_required';
        return matchesSearch && matchesProvider && matchesDate && isPending;
      }

      if (activeReportKey === 'approved_claims_report') {
        const isApproved = c.status === 'approved' || c.status === 'partially_approved' || c.status === 'settled';
        return matchesSearch && matchesProvider && matchesDate && isApproved;
      }

      if (activeReportKey === 'rejected_claims_report') {
        return matchesSearch && matchesProvider && matchesDate && c.status === 'rejected';
      }

      return matchesSearch && matchesProvider && matchesClaimStatus && matchesDate;
    });
  }, [claims, search, providerFilter, claimStatusFilter, dateFrom, dateTo, activeReportKey]);

  // Filtered Settlements Data
  const filteredSettlements = useMemo(() => {
    return settlements.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        s.patientName.toLowerCase().includes(q) ||
        s.claimNumber.toLowerCase().includes(q) ||
        s.settlementNumber.toLowerCase().includes(q) ||
        s.paymentReference.toLowerCase().includes(q);
      const matchesProvider = providerFilter === 'ALL' || s.providerName.includes(providerFilter);

      let matchesDate = true;
      if (dateFrom && s.settlementDate < dateFrom) matchesDate = false;
      if (dateTo && s.settlementDate > dateTo) matchesDate = false;

      return matchesSearch && matchesProvider && matchesDate;
    });
  }, [settlements, search, providerFilter, dateFrom, dateTo]);

  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `${activeReportKey}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReportKey === 'patient_insurance_report' || activeReportKey === 'policy_expiry_report') {
      rows.push(['UHID', 'Patient Name', 'Provider', 'Policy Number', 'Member ID', 'Plan Name', 'Sum Insured', 'Remaining Coverage', 'Start Date', 'Expiry Date', 'Status']);
      filteredPolicies.forEach(p => {
        rows.push([p.uhid, p.patientName, p.providerName, p.policyNumber, p.memberId, p.planName, String(p.sumInsured), String(p.remainingCoverage), p.startDate, p.endDate, p.status]);
      });
    } else if (activeReportKey === 'provider_report') {
      rows.push(['Provider ID', 'Provider Name', 'Code', 'Type', 'Contact Person', 'Phone', 'Email', 'Active Policies', 'Status']);
      providers.forEach(prov => {
        const provPolicies = policies.filter(p => p.providerId === prov.id);
        rows.push([prov.id, prov.companyName, prov.code, prov.providerType, prov.contactPerson, prov.phone, prov.email, String(provPolicies.length), prov.status]);
      });
    } else if (activeReportKey === 'settlement_report') {
      rows.push(['Settlement #', 'Date', 'Claim #', 'Patient', 'Provider', 'Approved Amount', 'Received Amount', 'TDS Deducted', 'UTR Reference', 'Payment Mode', 'Status']);
      filteredSettlements.forEach(s => {
        rows.push([s.settlementNumber, s.settlementDate, s.claimNumber, s.patientName, s.providerName, String(s.approvedAmount), String(s.settledAmount), String(s.tdsDeducted || 0), s.paymentReference, s.paymentMode, s.status]);
      });
    } else if (activeReportKey === 'insurance_revenue_report') {
      rows.push(['Claim #', 'Patient', 'Provider', 'Total Hospital Bill', 'Claimed Amount', 'Approved Amount', 'Patient Payable', 'Settled Amount', 'Status']);
      filteredClaims.forEach(c => {
        rows.push([c.claimNumber || c.id, c.patientName || '', c.providerName || '', String(c.totalHospitalBill || 0), String(c.claimedAmount || 0), String(c.approvedAmount || 0), String(c.patientPayableAmount || 0), String(c.settledAmount || 0), c.status || 'draft']);
      });
    } else {
      // Claims reports (pending, approved, rejected)
      rows.push(['Claim #', 'Submission Date', 'Patient Name', 'UHID', 'Provider', 'Total Bill', 'Claimed Amount', 'Approved Amount', 'Patient Share', 'Status', 'Notes/Reason']);
      filteredClaims.forEach(c => {
        rows.push([
          c.claimNumber || c.id,
          c.submissionDate || c.claimDate || '',
          c.patientName || '',
          c.uhid || '',
          c.providerName || '',
          String(c.totalHospitalBill || 0),
          String(c.claimedAmount || 0),
          String(c.approvedAmount || 0),
          String(c.patientPayableAmount || 0),
          c.status || 'draft',
          c.rejectionReason || c.reviewerNotes || ''
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 className="text-primary" size={24} />
            Insurance Management Reports
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Official insurance audit reports, policy validity lists, adjudication metrics, and payer revenue summaries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Printer size={15} /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Download size={15} /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* 8 Report Tabs Selector */}
      <div
        className="card"
        style={{
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)'
        }}
      >
        {REPORT_LIST.map(r => {
          const isActive = activeReportKey === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setActiveReportKey(r.key)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#2563eb' : 'var(--bg-base)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{r.label}</div>
              <div style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Multi-Parameter Filters Toolbar */}
      <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search patient, UHID, claim #, policy #..."
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Provider Filter */}
          <div style={{ flex: '1 1 180px' }}>
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

          {/* Date Range Quick Presets */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-base)', padding: '3px', borderRadius: '8px' }}>
            {(['all', 'today', 'this_week', 'this_month', 'custom'] as const).map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: dateRangePreset === preset ? '#2563eb' : 'transparent',
                  color: dateRangePreset === preset ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {preset === 'all' ? 'All Time' : preset === 'today' ? 'Today' : preset === 'this_week' ? 'This Week' : preset === 'this_month' ? 'This Month' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateRangePreset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="form-control"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                className="form-control"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {activeReportKey === 'patient_insurance_report' || activeReportKey === 'policy_expiry_report' ? (
          <>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Records</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {filteredPolicies.length}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Verified</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                {filteredPolicies.filter(p => p.status === 'active').length}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Coverage Value</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                ₹{(filteredPolicies.reduce((acc, p) => acc + p.sumInsured, 0) / 100000).toFixed(1)}L
              </div>
            </div>
          </>
        ) : activeReportKey === 'settlement_report' ? (
          <>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disbursed Settlements</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {filteredSettlements.length}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Settled Revenue</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                ₹{filteredSettlements.reduce((acc, s) => acc + s.settledAmount, 0).toLocaleString()}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total TDS Accounted</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                ₹{filteredSettlements.reduce((acc, s) => acc + (s.tdsDeducted || 0), 0).toLocaleString()}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Filtered Claims</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {filteredClaims.length}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Hospital Billed</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                ₹{filteredClaims.reduce((acc, c) => acc + (c.totalHospitalBill || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved Claim Amount</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                ₹{filteredClaims.reduce((acc, c) => acc + (c.approvedAmount || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patient Copay Share</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                ₹{filteredClaims.reduce((acc, c) => acc + (c.patientPayableAmount || 0), 0).toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Report Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {activeReport.label}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activeReport.description}</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {activeReportKey === 'patient_insurance_report' || activeReportKey === 'policy_expiry_report' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Patient Details</th>
                  <th style={{ padding: '10px 16px' }}>Payer & Plan</th>
                  <th style={{ padding: '10px 16px' }}>Policy / Member ID</th>
                  <th style={{ padding: '10px 16px' }}>Coverage Limits</th>
                  <th style={{ padding: '10px 16px' }}>Validity</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No policies found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map(pol => (
                    <tr key={pol.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pol.patientName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UHID: {pol.uhid}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{pol.providerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pol.planName}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{pol.policyNumber}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Member: {pol.memberId}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#059669' }}>₹{pol.sumInsured.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rem: ₹{pol.remainingCoverage.toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        <div>{pol.startDate} to {pol.endDate}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: pol.status === 'active' ? 'rgba(16,185,129,0.12)' : pol.status === 'expired' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                            color: pol.status === 'active' ? '#059669' : pol.status === 'expired' ? '#dc2626' : '#d97706'
                          }}
                        >
                          {pol.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : activeReportKey === 'provider_report' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Provider Name & Code</th>
                  <th style={{ padding: '10px 16px' }}>Type</th>
                  <th style={{ padding: '10px 16px' }}>Contact Person</th>
                  <th style={{ padding: '10px 16px' }}>Contact Details</th>
                  <th style={{ padding: '10px 16px' }}>Available Plans</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(prov => {
                  const provPlans = plans.filter(p => p.providerId === prov.id);
                  return (
                    <tr key={prov.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prov.companyName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code: {prov.code} | {prov.tpaName || 'Direct'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ textTransform: 'capitalize', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                          {prov.providerType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{prov.contactPerson}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        <div>{prov.phone}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{prov.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{provPlans.length} Plans</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: prov.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: prov.status === 'active' ? '#059669' : '#dc2626' }}>
                          {prov.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : activeReportKey === 'settlement_report' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Settlement & Claim #</th>
                  <th style={{ padding: '10px 16px' }}>Patient</th>
                  <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                  <th style={{ padding: '10px 16px' }}>Approved vs Received</th>
                  <th style={{ padding: '10px 16px' }}>Payment Reference / UTR</th>
                  <th style={{ padding: '10px 16px' }}>Date & Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No settlement records found.
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map(setl => (
                    <tr key={setl.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{setl.settlementNumber}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Claim #{setl.claimNumber}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{setl.patientName}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{setl.providerName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#059669' }}>Received: ₹{setl.settledAmount.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved: ₹{setl.approvedAmount.toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {setl.paymentReference}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        <div>{setl.settlementDate}</div>
                        <span style={{ textTransform: 'uppercase', fontSize: '10px', color: 'var(--text-muted)' }}>{setl.paymentMode}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Claims / Revenue Table */
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 16px' }}>Claim # & Date</th>
                  <th style={{ padding: '10px 16px' }}>Patient Details</th>
                  <th style={{ padding: '10px 16px' }}>Insurance Provider</th>
                  <th style={{ padding: '10px 16px' }}>Total Hospital Bill</th>
                  <th style={{ padding: '10px 16px' }}>Claimed vs Approved</th>
                  <th style={{ padding: '10px 16px' }}>Patient Payable</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No claims found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{c.claimNumber || c.id}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.submissionDate || c.claimDate || 'Draft'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{c.patientName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UHID: {c.uhid}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{c.providerName || c.insuranceProvider}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        ₹{(c.totalHospitalBill || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: c.approvedAmount ? '#059669' : 'var(--text-primary)' }}>
                          Appr: ₹{(c.approvedAmount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Req: ₹{(c.claimedAmount || c.claimAmount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#d97706' }}>
                        ₹{(c.patientPayableAmount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: c.status === 'approved' || c.status === 'settled'
                              ? 'rgba(16,185,129,0.12)'
                              : c.status === 'rejected'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(37,99,235,0.12)',
                            color: c.status === 'approved' || c.status === 'settled'
                              ? '#059669'
                              : c.status === 'rejected'
                              ? '#dc2626'
                              : '#2563eb'
                          }}
                        >
                          {(c.status || 'draft').replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
