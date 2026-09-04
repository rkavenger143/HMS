import React, { useState, useMemo } from 'react';
import {
  ReceiptText, Search, Filter, Plus, Printer, CreditCard, DollarSign,
  CheckCircle2, AlertCircle, Undo2, ArrowRight, Download, FileText,
  Clock, ShieldCheck, User, Pill
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { useBilling } from '../../billing/context/BillingContext';
import PrintInvoiceModal from '../../billing/components/modals/PrintInvoiceModal';
import PrintPaymentReceiptModal from '../../billing/components/modals/PrintPaymentReceiptModal';
import RecordPaymentModal from '../../billing/components/modals/RecordPaymentModal';
import ProcessRefundModal from '../../billing/components/modals/ProcessRefundModal';
import type { CentralInvoiceItem, BillingPaymentRecord, DepartmentChargeItem } from '../../../types';

export default function PharmacyBillingTab() {
  const { prescriptions, sales, medicines } = usePharmacy();
  const { invoices, payments, departmentCharges, addDepartmentCharge, createInvoice } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState<CentralInvoiceItem | null>(null);
  const [printInvoice, setPrintInvoice] = useState<CentralInvoiceItem | null>(null);
  const [printPayment, setPrintPayment] = useState<BillingPaymentRecord | null>(null);
  const [refundInvoice, setRefundInvoice] = useState<CentralInvoiceItem | null>(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState<BillingPaymentRecord | null>(null);

  // Filter Pharmacy Invoices from Central Billing
  const pharmInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv.department.toLowerCase().includes('pharmacy') ||
      inv.items.some(item => item.department === 'pharmacy' || item.sourceModule === 'pharmacy')
    );
  }, [invoices]);

  // Compute Pharmacy Billing Statistics
  const pharmStats = useMemo(() => {
    const totalSalesCount = sales.length;
    const totalBilled = pharmInvoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
    const totalCollected = pharmInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = pharmInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const paidCount = pharmInvoices.filter(inv => inv.status === 'paid').length;
    const partialCount = pharmInvoices.filter(inv => inv.status === 'partially_paid').length;
    const unpaidCount = pharmInvoices.filter(inv => inv.status === 'draft' || inv.status === 'overdue').length;

    return {
      totalSalesCount,
      totalBilled,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount,
    };
  }, [sales, pharmInvoices]);

  // Filtered List
  const filteredInvoices = pharmInvoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.uhid.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Generate Pharmacy Bill from a Prescription
  const handleGenerateInvoiceForPrescription = (rx: any) => {
    const medList = rx.medicines || [];
    const totalRxPrice = medList.reduce((sum: number, item: any) => sum + ((item.prescribedQty || item.quantity || 10) * 25), 0) || 450;

    const chargeItems: DepartmentChargeItem[] = medList.map((item: any, idx: number) => ({
      id: `chg-pharm-${Date.now()}-${idx}`,
      patientId: rx.patientId,
      department: 'pharmacy' as const,
      sourceModule: 'pharmacy',
      sourceRecordId: rx.prescriptionNumber || rx.id,
      serviceCode: `MED-${idx + 1}`,
      description: item.medicineName,
      quantity: item.prescribedQty || item.quantity || 10,
      unitPrice: 25,
      discountAmount: 0,
      taxRate: 5,
      totalAmount: (item.prescribedQty || item.quantity || 10) * 25,
      chargeDate: new Date().toISOString().slice(0, 10),
      createdBy: 'Pharmacy Dispenser',
      isBilled: true,
    }));

    const newInvoice = createInvoice({
      patientId: rx.patientId,
      patientName: rx.patientName,
      uhid: rx.patientId,
      encounterType: 'opd',
      doctorName: rx.doctorName,
      department: 'Pharmacy Dispensary & OTC',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: chargeItems.length > 0 ? chargeItems : [{
        id: `chg-pharm-${Date.now()}`,
        patientId: rx.patientId,
        department: 'pharmacy' as const,
        sourceModule: 'pharmacy',
        sourceRecordId: rx.prescriptionNumber || rx.id,
        serviceCode: 'MED-ITEMS',
        description: 'Dispensed Prescription Medications',
        quantity: 1,
        unitPrice: totalRxPrice,
        discountAmount: 0,
        taxRate: 5,
        totalAmount: totalRxPrice,
        chargeDate: new Date().toISOString().slice(0, 10),
        createdBy: 'Pharmacy Dispenser',
        isBilled: true,
      }],
      grossAmount: totalRxPrice,
      discountAmount: 0,
      taxAmount: 0,
      insuranceAmount: 0,
      advanceAdjusted: 0,
      netPayable: totalRxPrice,
      paidAmount: 0,
      outstandingBalance: totalRxPrice,
      status: 'draft',
      createdBy: 'Pharmacy Cash Counter',
    });

    alert(`Pharmacy Prescription Invoice ${newInvoice.invoiceNumber} generated for ${rx.patientName} (₹${totalRxPrice}).`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Billing, POS Payment Collection & Official Receipts</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Prescription fulfillment & OTC billing: Drug Batch Tariffs → Central Invoices → Multi-Tender Payments → Thermal POS Receipts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Pharmacy Collections:</div>
            <strong style={{ fontSize: 16, color: 'var(--color-success)' }}>₹{pharmStats.totalCollected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* 8 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="stat-card">
          <div className="stat-value">{prescriptions.length}</div>
          <div className="stat-label">Total Prescriptions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{pharmStats.totalBilled.toLocaleString()}</div>
          <div className="stat-label">Total Pharmacy Invoiced</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{pharmStats.totalCollected.toLocaleString()}</div>
          <div className="stat-label">Total Collections</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: pharmStats.totalOutstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            ₹{pharmStats.totalOutstanding.toLocaleString()}
          </div>
          <div className="stat-label">Outstanding Dues</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{pharmStats.paidCount}</div>
          <div className="stat-label">Fully Paid Bills</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{pharmStats.partialCount}</div>
          <div className="stat-label">Partially Paid</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{pharmStats.unpaidCount}</div>
          <div className="stat-label">Unpaid Bills</div>
        </div>
      </div>

      {/* Payment Success Banner */}
      {paymentSuccessData && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={24} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46' }}>
                Pharmacy Payment Recorded · Receipt #{paymentSuccessData.receiptNumber}
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
              placeholder="Search Pharmacy Invoice #, Patient Name, UHID..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Pharmacy Invoice Statuses ({pharmInvoices.length})</option>
            <option value="draft">Unpaid / Draft</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Pharmacy Invoices Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Pharmacy Medication Invoices & Payments</span>
          <span className="badge badge-primary">{filteredInvoices.length} Invoices</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Doctor</th>
                  <th>Dispensed Medicines</th>
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
                      <div>{inv.doctorName || 'Dr. Rajesh Kumar'}</div>
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
                      No pharmacy billing invoices found matching current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unbilled Prescriptions Queue */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pending Unbilled Prescription Queue</span>
          <span className="badge badge-warning">Action Required</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Prescribed Drugs</th>
                  <th>Estimated Total (₹)</th>
                  <th>Dispensing Status</th>
                  <th style={{ textAlign: 'right' }}>Generate Bill</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.slice(0, 4).map(rx => {
                  const meds = rx.medicines || [];
                  return (
                    <tr key={rx.id}>
                      <td>
                        <strong>{rx.prescriptionNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rx.date}</div>
                      </td>

                      <td>
                        <strong>{rx.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rx.patientId}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{meds.map((i: any) => i.medicineName).join(', ') || 'Prescribed Medicines'}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{(meds.length * 150 || 300).toLocaleString()}</strong>
                      </td>

                      <td>
                        <span className="badge badge-neutral">{(rx.dispensingStatus || 'pending').toUpperCase()}</span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleGenerateInvoiceForPrescription(rx)}
                        >
                          <Plus size={11} /> Create Pharmacy Bill
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
          department="Pharmacy Dispensary"
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
