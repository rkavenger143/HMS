import React, { useState, useMemo } from 'react';
import {
  ReceiptText, Search, Filter, Plus, Printer, CreditCard, DollarSign,
  CheckCircle2, AlertCircle, Undo2, ArrowRight, Download, FileText,
  Clock, ShieldCheck, User
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { useBilling } from '../../billing/context/BillingContext';
import { useToast } from '../../../contexts/ToastContext';
import PrintInvoiceModal from '../../billing/components/modals/PrintInvoiceModal';
import PrintPaymentReceiptModal from '../../billing/components/modals/PrintPaymentReceiptModal';
import RecordPaymentModal from '../../billing/components/modals/RecordPaymentModal';
import ProcessRefundModal from '../../billing/components/modals/ProcessRefundModal';
import type { CentralInvoiceItem, BillingPaymentRecord, DepartmentChargeItem } from '../../../types';

export default function LabBillingTab() {
  const { showToast } = useToast();
  const { labOrders } = useLab();
  const { invoices, payments, departmentCharges, addDepartmentCharge, createInvoice } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState<CentralInvoiceItem | null>(null);
  const [printInvoice, setPrintInvoice] = useState<CentralInvoiceItem | null>(null);
  const [printPayment, setPrintPayment] = useState<BillingPaymentRecord | null>(null);
  const [refundInvoice, setRefundInvoice] = useState<CentralInvoiceItem | null>(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState<BillingPaymentRecord | null>(null);

  // Filter Lab Invoices from Central Billing
  const labInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv.department.toLowerCase().includes('lab') ||
      inv.items.some(item => item.department === 'laboratory' || item.sourceModule === 'laboratory')
    );
  }, [invoices]);

  // Compute Lab Billing Statistics
  const labStats = useMemo(() => {
    const totalOrders = labOrders.length;
    const totalBilled = labInvoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
    const totalCollected = labInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = labInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const paidCount = labInvoices.filter(inv => inv.status === 'paid').length;
    const partialCount = labInvoices.filter(inv => inv.status === 'partially_paid').length;
    const unpaidCount = labInvoices.filter(inv => inv.status === 'draft' || inv.status === 'overdue').length;

    return {
      totalOrders,
      totalBilled,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount,
    };
  }, [labOrders, labInvoices]);

  // Filtered List
  const filteredInvoices = labInvoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.uhid.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Generate Lab Charge & Instant Invoice from an active lab order
  const handleGenerateInvoiceForOrder = (order: any) => {
    const totalTestPrice = (order.items || []).reduce((sum: number, t: any) => sum + (t.price || 350), 0) || order.totalAmount || 500;

    const chargeItems: DepartmentChargeItem[] = (order.items || []).map((t: any, idx: number) => ({
      id: `chg-lab-${Date.now()}-${idx}`,
      patientId: order.patientId,
      department: 'laboratory' as const,
      sourceModule: 'laboratory',
      sourceRecordId: order.orderNumber || order.id,
      serviceCode: t.testCode || `TEST-${idx + 1}`,
      description: t.testName,
      quantity: 1,
      unitPrice: t.price || 350,
      discountAmount: 0,
      taxRate: 0,
      totalAmount: t.price || 350,
      chargeDate: new Date().toISOString().slice(0, 10),
      createdBy: 'Lab Phlebotomist / Reception',
      isBilled: true,
    }));

    // Ingest charge and generate consolidated Central Invoice
    const newInvoice = createInvoice({
      patientId: order.patientId,
      patientName: order.patientName,
      uhid: order.patientId,
      encounterType: 'opd',
      doctorName: order.doctorName,
      department: 'Laboratory Diagnostic Services',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: chargeItems.length > 0 ? chargeItems : [{
        id: `chg-lab-${Date.now()}`,
        patientId: order.patientId,
        department: 'laboratory' as const,
        sourceModule: 'laboratory',
        sourceRecordId: order.orderNumber || order.id,
        serviceCode: 'LAB-TESTS',
        description: 'Comprehensive Lab Diagnostic Panel',
        quantity: 1,
        unitPrice: totalTestPrice,
        discountAmount: 0,
        taxRate: 0,
        totalAmount: totalTestPrice,
        chargeDate: new Date().toISOString().slice(0, 10),
        createdBy: 'Lab Phlebotomist / Reception',
        isBilled: true,
      }],
      grossAmount: totalTestPrice,
      discountAmount: 0,
      taxAmount: 0,
      insuranceAmount: 0,
      advanceAdjusted: 0,
      netPayable: totalTestPrice,
      paidAmount: 0,
      outstandingBalance: totalTestPrice,
      status: 'draft',
      createdBy: 'Laboratory Billing Desk',
    });

    showToast(`Laboratory Diagnostic Tax Invoice ${newInvoice.invoiceNumber} generated for ${order.patientName} (₹${totalTestPrice}).`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Billing, Payment Collection & Official Receipts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              End-to-end diagnostic billing: Test Master Tariffs → Central Billing Invoices → Multi-Tender Payments → Thermal POS & A4 Tax Receipts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Lab Collections:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-success)' }}>₹{labStats.totalCollected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* 8 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="stat-card">
          <div className="stat-value">{labStats.totalOrders}</div>
          <div className="stat-label">Total Lab Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{labStats.totalBilled.toLocaleString()}</div>
          <div className="stat-label">Total Lab Invoiced</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{labStats.totalCollected.toLocaleString()}</div>
          <div className="stat-label">Total Collections</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: labStats.totalOutstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            ₹{labStats.totalOutstanding.toLocaleString()}
          </div>
          <div className="stat-label">Outstanding Dues</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{labStats.paidCount}</div>
          <div className="stat-label">Fully Paid Bills</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{labStats.partialCount}</div>
          <div className="stat-label">Partially Paid</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{labStats.unpaidCount}</div>
          <div className="stat-label">Unpaid Orders</div>
        </div>
      </div>

      {/* Payment Success Banner with Instant Print Actions */}
      {paymentSuccessData && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={24} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46' }}>
                Payment Successfully Recorded · Receipt #{paymentSuccessData.receiptNumber}
              </div>
              <div style={{ fontSize: 12, color: '#047857' }}>
                ₹{paymentSuccessData.amount.toLocaleString()} received via {paymentSuccessData.paymentMethod.toUpperCase()} from {paymentSuccessData.patientName} ({paymentSuccessData.patientId})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setPrintPayment(paymentSuccessData)}>
              <Printer size={12} /> Print POS Receipt
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPaymentSuccessData(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Lab Invoice #, Patient Name, UHID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Lab Invoice Statuses ({labInvoices.length})</option>
            <option value="draft">Unpaid / Draft</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Lab Invoices Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Laboratory Diagnostic Invoices & Payments</span>
          <span className="badge badge-primary">{filteredInvoices.length} Invoices</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Prescribing Doctor</th>
                  <th>Tests & Services</th>
                  <th>Gross Bill (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Balance Due (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>{inv.invoiceNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.invoiceDate}</div>
                    </td>

                    <td>
                      <strong>{inv.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.uhid}</div>
                    </td>

                    <td>
                      <div>{inv.doctorName || 'Dr. Sneha Roy'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.items.map(i => i.description).join(', ')}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.items.length} item(s)</div>
                    </td>

                    <td>
                      <strong>₹{inv.grossAmount.toFixed(2)}</strong>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-success)' }}>₹{inv.paidAmount.toFixed(2)}</strong>
                    </td>

                    <td>
                      <strong style={{ color: inv.outstandingBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: 13 }}>
                        ₹{inv.outstandingBalance.toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partially_paid' ? 'badge-warning' : 'badge-danger'}`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {inv.outstandingBalance > 0 && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => setActiveInvoiceForPay(inv)}
                          >
                            <CreditCard size={11} /> Collect Pay
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: 26, fontSize: 11 }}
                          onClick={() => setPrintInvoice(inv)}
                          title="Print A4 Tax Invoice"
                        >
                          <Printer size={11} /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No laboratory billing invoices found matching current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unbilled Lab Orders Queue (Allows 1-click Invoice Generation) */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pending Unbilled Lab Orders Queue</span>
          <span className="badge badge-warning">Action Required</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Requested Tests</th>
                  <th>Estimated Tariff (₹)</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: 'right' }}>Generate Bill</th>
                </tr>
              </thead>
              <tbody>
                {labOrders.slice(0, 4).map(order => {
                  const estTariff = (order.items || []).reduce((sum: number, t: any) => sum + (t.price || 350), 0) || order.totalAmount || 500;
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.orderDate}</div>
                      </td>

                      <td>
                        <strong>{order.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.patientId}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{(order.items || []).map((t: any) => t.testName).join(', ') || 'Standard Lab Diagnostics'}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{estTariff.toLocaleString()}</strong>
                      </td>

                      <td>
                        <span className="badge badge-neutral">{order.status.toUpperCase()}</span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleGenerateInvoiceForOrder(order)}
                        >
                          <Plus size={11} /> Create Lab Bill
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

      {/* Modals Suite */}
      {activeInvoiceForPay && (
        <RecordPaymentModal
          invoice={activeInvoiceForPay}
          onClose={() => setActiveInvoiceForPay(null)}
          onSuccess={pay => {
            setPaymentSuccessData(pay);
            setActiveInvoiceForPay(null);
          }}
        />
      )}

      {printInvoice && (
        <PrintInvoiceModal invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}

      {printPayment && (
        <PrintPaymentReceiptModal
          payment={printPayment}
          department="Laboratory Diagnostics"
          onClose={() => setPrintPayment(null)}
        />
      )}

      {refundInvoice && (
        <ProcessRefundModal
          invoice={refundInvoice}
          onClose={() => setRefundInvoice(null)}
        />
      )}
    </div>
  );
}
