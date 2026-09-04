import React, { useState } from 'react';
import {
  DollarSign, ReceiptText, CreditCard, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Undo2, ShieldCheck, Plus, ShoppingBag,
  Building2, Activity, Pill, Microscope, Radio, HeartPulse, Search,
  ArrowRight, Printer, IndianRupee
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import PrintInvoiceModal from './modals/PrintInvoiceModal';
import type { CentralInvoiceItem, BillingPaymentRecord } from '../../../types';

export default function BillingDashboard() {
  const { kpis, invoices, payments, setActiveTab, setSelectedInvoiceId } = useBilling();

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [printInvoice, setPrintInvoice] = useState<CentralInvoiceItem | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.patientId.toLowerCase().includes(q);

    const matchesDept = filterDept === 'ALL' || inv.department === filterDept;
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    setActiveTab('invoices');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 7 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {/* 1. Total Bills Today */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('invoices')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <ReceiptText size={17} />
          </div>
          <div className="stat-value">{kpis.totalInvoicesToday}</div>
          <div className="stat-label">Total Bills Today</div>
        </div>

        {/* 2. Total Revenue Today */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('invoices')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <IndianRupee size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{kpis.todayTotalRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Revenue Today</div>
        </div>

        {/* 3. Paid Bills */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('invoices')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value">{kpis.paidInvoicesCount}</div>
          <div className="stat-label">Paid</div>
        </div>

        {/* 4. Realized Collections */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('payments')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>₹{kpis.todayCollections.toLocaleString('en-IN')}</div>
          <div className="stat-label">Collections Today</div>
        </div>

        {/* 5. Unpaid Bills */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('invoices')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertCircle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.unpaidInvoicesCount}</div>
          <div className="stat-label">Unpaid</div>
        </div>

        {/* 6. Outstanding Amount */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('ledger')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>₹{kpis.totalOutstanding.toLocaleString('en-IN')}</div>
          <div className="stat-label">Outstanding</div>
        </div>

        {/* 7. Refunds */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('refunds')}>
          <div className="stat-icon" style={{ background: 'rgba(255,159,10,0.1)', color: 'var(--color-warning)' }}>
            <Undo2 size={17} />
          </div>
          <div className="stat-value">₹{(kpis.refundsToday || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Refunds</div>
        </div>
      </div>

      {/* Multi-Department Charge Breakdown Bar */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
            <span>Multi-Department Central Billing Contributions</span>
          </div>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>Consolidated Financials</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>OPD Consultations</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>₹{kpis.opdRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>IPD Inpatient</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-success)', marginTop: 2 }}>₹{kpis.ipdRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Laboratory</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#BF5AF2', marginTop: 2 }}>₹{kpis.labRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Radiology</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#64D2FF', marginTop: 2 }}>₹{kpis.radRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pharmacy</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#FF9F0A', marginTop: 2 }}>₹{kpis.pharmacyRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Recent Bills Ledger Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ReceiptText size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Recent Invoices & Central Billing Ledger</span>
              <div className="card-subtitle">Unified hospital billing charges, cash collection & printable receipts</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('cash_counters')}>
              Cash Counter
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('workspace')}>
              <Plus size={13} /> Create Central Bill
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '12px 18px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search invoice #, patient, UHID..."
              style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 140 }}
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="opd">OPD</option>
            <option value="ipd">IPD</option>
            <option value="laboratory">Laboratory</option>
            <option value="radiology">Radiology</option>
            <option value="pharmacy">Pharmacy</option>
          </select>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 140 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="generated">Unpaid / Generated</option>
          </select>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Department</th>
                  <th>Gross Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{inv.invoiceDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{inv.patientName}</div>
                      <div className="patient-id" style={{ fontSize: 10 }}>{inv.uhid || inv.patientId} · {inv.encounterType?.toUpperCase()}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{inv.department.toUpperCase()}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>₹{inv.netPayable.toLocaleString('en-IN')}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-success)' }}>₹{inv.paidAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12, color: inv.outstandingBalance > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                        ₹{inv.outstandingBalance.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partially_paid' ? 'badge-warning' : 'badge-danger'}`}>
                        {inv.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => setPrintInvoice(inv)}
                        >
                          <Printer size={11} /> Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {printInvoice && (
        <PrintInvoiceModal
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
}
