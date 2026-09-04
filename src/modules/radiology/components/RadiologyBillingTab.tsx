import React, { useState, useMemo } from 'react';
import {
  ReceiptText, Search, Filter, Plus, Printer, CreditCard, DollarSign,
  CheckCircle2, AlertCircle, Undo2, ArrowRight, Download, FileText,
  Clock, ShieldCheck, User, Scan
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import { useBilling } from '../../billing/context/BillingContext';
import PrintInvoiceModal from '../../billing/components/modals/PrintInvoiceModal';
import PrintPaymentReceiptModal from '../../billing/components/modals/PrintPaymentReceiptModal';
import RecordPaymentModal from '../../billing/components/modals/RecordPaymentModal';
import ProcessRefundModal from '../../billing/components/modals/ProcessRefundModal';
import type { CentralInvoiceItem, BillingPaymentRecord, DepartmentChargeItem } from '../../../types';

export default function RadiologyBillingTab() {
  const { radiologyOrders, examinations } = useRadiology();
  const { invoices, payments, departmentCharges, addDepartmentCharge, createInvoice } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState<CentralInvoiceItem | null>(null);
  const [printInvoice, setPrintInvoice] = useState<CentralInvoiceItem | null>(null);
  const [printPayment, setPrintPayment] = useState<BillingPaymentRecord | null>(null);
  const [refundInvoice, setRefundInvoice] = useState<CentralInvoiceItem | null>(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState<BillingPaymentRecord | null>(null);

  // Filter Radiology Invoices from Central Billing
  const radInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv.department.toLowerCase().includes('radiology') ||
      inv.department.toLowerCase().includes('imaging') ||
      inv.items.some(item => item.department === 'radiology' || item.sourceModule === 'radiology')
    );
  }, [invoices]);

  // Compute Radiology Billing Statistics
  const radStats = useMemo(() => {
    const totalStudies = radiologyOrders.length;
    const totalBilled = radInvoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
    const totalCollected = radInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = radInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const paidCount = radInvoices.filter(inv => inv.status === 'paid').length;
    const partialCount = radInvoices.filter(inv => inv.status === 'partially_paid').length;
    const unpaidCount = radInvoices.filter(inv => inv.status === 'draft' || inv.status === 'overdue').length;

    return {
      totalStudies,
      totalBilled,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount,
    };
  }, [radiologyOrders, radInvoices]);

  // Filtered List
  const filteredInvoices = radInvoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.uhid.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Generate Radiology Charge & Invoice from an active scan order
  const handleGenerateInvoiceForOrder = (order: any) => {
    const totalScanPrice = order.price || 2500;

    const chargeItem: DepartmentChargeItem = {
      id: `chg-rad-${Date.now()}`,
      patientId: order.patientId,
      department: 'radiology' as const,
      sourceModule: 'radiology',
      sourceRecordId: order.accessionNumber || order.orderNumber || order.id,
      serviceCode: order.examId || 'RAD-SCAN',
      description: `${(order.modalityType || 'SCAN').toUpperCase()}: ${order.examName || 'Diagnostic Scan'}`,
      quantity: 1,
      unitPrice: totalScanPrice,
      discountAmount: 0,
      taxRate: 0,
      totalAmount: totalScanPrice,
      chargeDate: new Date().toISOString().slice(0, 10),
      createdBy: 'Radiology Desk',
      isBilled: true,
    };

    const newInvoice = createInvoice({
      patientId: order.patientId,
      patientName: order.patientName,
      uhid: order.patientId,
      encounterType: 'opd',
      doctorName: order.referringDoctorName || order.radiologistName || 'Dr. Sneha Roy',
      department: 'Radiology & Imaging Services (RIS)',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [chargeItem],
      grossAmount: totalScanPrice,
      discountAmount: 0,
      taxAmount: 0,
      insuranceAmount: 0,
      advanceAdjusted: 0,
      netPayable: totalScanPrice,
      paidAmount: 0,
      outstandingBalance: totalScanPrice,
      status: 'draft',
      createdBy: 'Radiology Billing Counter',
    });

    alert(`Radiology Diagnostic Tax Invoice ${newInvoice.invoiceNumber} generated for ${order.patientName} (₹${totalScanPrice}).`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scan size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology & Imaging Billing, Payments & Official Receipts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Diagnostic imaging tariff billing: Modality Scans (X-Ray, CT, MRI, USG) → Central Billing → Multi-Tender Settlements → POS Receipts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Radiology Collections:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-success)' }}>₹{radStats.totalCollected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* 8 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="stat-card">
          <div className="stat-value">{radStats.totalStudies}</div>
          <div className="stat-label">Total Imaging Studies</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{radStats.totalBilled.toLocaleString()}</div>
          <div className="stat-label">Total Invoiced (₹)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{radStats.totalCollected.toLocaleString()}</div>
          <div className="stat-label">Total Collections (₹)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: radStats.totalOutstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            ₹{radStats.totalOutstanding.toLocaleString()}
          </div>
          <div className="stat-label">Outstanding Dues</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{radStats.paidCount}</div>
          <div className="stat-label">Fully Paid Scans</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{radStats.partialCount}</div>
          <div className="stat-label">Partially Paid</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{radStats.unpaidCount}</div>
          <div className="stat-label">Unpaid Scans</div>
        </div>
      </div>

      {/* Payment Success Banner */}
      {paymentSuccessData && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={24} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46' }}>
                Radiology Payment Recorded · Receipt #{paymentSuccessData.receiptNumber}
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
              placeholder="Search Radiology Invoice #, Patient Name, UHID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Radiology Invoice Statuses ({radInvoices.length})</option>
            <option value="draft">Unpaid / Draft</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Radiology Invoices Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Radiology & Imaging Invoices & Payments</span>
          <span className="badge badge-primary">{filteredInvoices.length} Invoices</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Referring Doctor</th>
                  <th>Modality & Examination</th>
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
                      No radiology billing invoices found matching current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unbilled Radiology Orders Queue */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pending Unbilled Radiology Studies Queue</span>
          <span className="badge badge-warning">Action Required</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Modality & Scan</th>
                  <th>Standard Tariff (₹)</th>
                  <th>Study Status</th>
                  <th style={{ textAlign: 'right' }}>Generate Bill</th>
                </tr>
              </thead>
              <tbody>
                {radiologyOrders.slice(0, 4).map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{order.accessionNumber || order.orderNumber}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.orderDate}</div>
                    </td>

                    <td>
                      <strong>{order.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.patientId}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ marginRight: 6 }}>{(order.modalityType || 'SCAN').toUpperCase()}</span>
                      <span>{order.examName || 'Diagnostic Scan'}</span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{(order.price || 2500).toLocaleString()}</strong>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{order.status.toUpperCase()}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleGenerateInvoiceForOrder(order)}
                      >
                        <Plus size={11} /> Create Scan Bill
                      </button>
                    </td>
                  </tr>
                ))}
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
          department="Radiology & Diagnostic Imaging"
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
