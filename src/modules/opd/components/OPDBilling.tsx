import React, { useState } from 'react';
import {
  ReceiptText, Search, CheckCircle2, AlertCircle, Clock,
  Printer, IndianRupee, CreditCard, ShieldCheck, Download, Filter,
  FileText, ArrowRight, ExternalLink, RefreshCw, Eye, RotateCcw
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { Bill, BillItem, PaymentMode, Patient, OPDVisit, Appointment } from '../../../types';
import PrintBillModal from './modals/PrintBillModal';
import AppointmentBillingModal from './modals/AppointmentBillingModal';

export default function OPDBilling() {
  const {
    visits,
    patients,
    doctors,
    appointments,
    bills,
  } = useOPD();

  const [billSearch, setBillSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-31');

  // Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [billingModalApt, setBillingModalApt] = useState<any | null>(null);

  // Map bills & appointments to unified billing table
  const unifiedBillingList = appointments.map(apt => {
    const matchedBill = bills.find(b => b.patientId === apt.patientId || b.id.includes(apt.id));
    const isPaid = apt.status === 'completed' || matchedBill?.status === 'paid';
    const isPartial = matchedBill?.status === 'partial';
    const isPending = !isPaid && !isPartial;

    const amount = apt.consultationFee || 600;
    const paid = isPaid ? amount : isPartial ? amount / 2 : 0;
    const balance = amount - paid;
    const paymentStatus = isPaid ? 'paid' : isPartial ? 'partially_paid' : 'pending';

    return {
      id: matchedBill?.id || `bill-${apt.id}`,
      invoiceNumber: matchedBill?.billNumber || `INV-2026-0${apt.id.replace(/\D/g, '') || '101'}`,
      receiptNumber: isPaid ? `RCPT-2026-0${apt.id.replace(/\D/g, '') || '101'}` : '',
      patientId: apt.patientId,
      patientName: apt.patientName,
      appointmentId: apt.id,
      doctorName: apt.doctorName,
      department: apt.department,
      amount,
      paid,
      balance,
      paymentStatus,
      date: apt.date,
      time: apt.time,
      appointment: apt,
      bill: matchedBill,
    };
  });

  // Filter list
  const filteredList = unifiedBillingList.filter(item => {
    const q = billSearch.toLowerCase();
    const matchSearch =
      !q ||
      item.patientName.toLowerCase().includes(q) ||
      item.patientId.toLowerCase().includes(q) ||
      item.invoiceNumber.toLowerCase().includes(q) ||
      item.appointmentId.toLowerCase().includes(q) ||
      item.doctorName.toLowerCase().includes(q);

    const matchStatus = !statusFilter || item.paymentStatus === statusFilter;
    const matchDate = !dateFilter || item.date === dateFilter;

    return matchSearch && matchStatus && matchDate;
  });

  // Summary Metrics
  const totalBillsToday = filteredList.length;
  const paidCount = filteredList.filter(i => i.paymentStatus === 'paid').length;
  const partialCount = filteredList.filter(i => i.paymentStatus === 'partially_paid').length;
  const pendingCount = filteredList.filter(i => i.paymentStatus === 'pending').length;
  const totalRevenue = filteredList.reduce((sum, i) => sum + i.paid, 0);
  const totalRefunds = 0; // standard zero refunds in demo

  const handlePrintReceipt = (item: any) => {
    const billObj: Bill = item.bill || {
      id: item.id,
      billNumber: item.invoiceNumber,
      patientId: item.patientId,
      patientName: item.patientName,
      patientType: 'opd',
      date: item.date,
      dueDate: item.date,
      items: [
        {
          id: 'item-1',
          category: 'consultation',
          description: `OPD Consultation — Dr. ${item.doctorName} (${item.department})`,
          quantity: 1,
          unitPrice: item.amount,
          totalPrice: item.amount,
          date: item.date,
        },
      ],
      subtotal: item.amount,
      discount: 0,
      tax: 0,
      totalAmount: item.amount,
      paidAmount: item.paid,
      balanceDue: item.balance,
      status: item.paymentStatus === 'paid' ? 'paid' : item.paymentStatus === 'partially_paid' ? 'partial' : 'pending',
      paymentMode: 'cash',
      createdDate: item.date,
      createdTime: item.time,
      createdAt: item.date,
    };

    setSelectedBillForPrint(billObj);
    setShowPrintModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>OPD Appointment Billing & Revenue Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Connected to Central Billing: Invoices, fee collection, settlements, and receipt generation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/billing'}>
            <ExternalLink size={13} /> Central Billing Desk
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Requirement 14) */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {/* Total Bills Today */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon"><ReceiptText size={16} /></div>
            <span className="badge badge-primary">Total</span>
          </div>
          <div className="stat-value">{totalBillsToday}</div>
          <div className="stat-label">Total Bills Today</div>
        </div>

        {/* Paid */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}><CheckCircle2 size={16} /></div>
            <span className="badge badge-success">Done</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{paidCount}</div>
          <div className="stat-label">Paid Invoices</div>
        </div>

        {/* Partially Paid */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-warning)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}><Clock size={16} /></div>
            <span className="badge badge-warning">Partial</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{partialCount}</div>
          <div className="stat-label">Partially Paid</div>
        </div>

        {/* Pending */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}><AlertCircle size={16} /></div>
            <span className="badge badge-danger">Due</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{pendingCount}</div>
          <div className="stat-label">Pending Payment</div>
        </div>

        {/* Revenue */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}><IndianRupee size={16} /></div>
            <span className="badge badge-success">Revenue</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total OPD Revenue</div>
        </div>

        {/* Refunds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--text-tertiary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}><RotateCcw size={16} /></div>
            <span className="badge badge-neutral">0</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>₹{totalRefunds}</div>
          <div className="stat-label">Refunds Issued</div>
        </div>
      </div>

      {/* Filter and Invoices Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Outpatient Invoices & Receipts Table ({filteredList.length})</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '16px 20px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient, invoice, appointment..."
                style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
                value={billSearch}
                onChange={e => setBillSearch(e.target.value)}
              />
            </div>

            <div>
              <input
                type="date"
                className="form-input"
                style={{ height: 36, fontSize: 13 }}
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 36, fontSize: 13 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="paid">Fully Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Appointment</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>
                        {item.invoiceNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{item.patientName}</div>
                        <div className="patient-id" style={{ fontSize: 10 }}>{item.patientId}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {item.appointmentId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{item.doctorName}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.department}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>
                        ₹{item.paid.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.balance > 0 ? 'var(--color-danger)' : 'var(--text-tertiary)' }}>
                        ₹{item.balance.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.paymentStatus === 'paid'
                              ? 'badge-success'
                              : item.paymentStatus === 'partially_paid'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {item.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{item.date}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{item.time}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {item.paymentStatus !== 'paid' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => setBillingModalApt(item.appointment)}
                            >
                              <CreditCard size={11} /> Pay
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={() => handlePrintReceipt(item)}
                            >
                              <Printer size={11} /> Print Receipt
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="View Invoice Details"
                            onClick={() => handlePrintReceipt(item)}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-state-icon"><ReceiptText size={28} /></div>
                        <div className="empty-state-title">No Outpatient Invoices Found</div>
                        <div className="empty-state-desc">Try modifying the date range or clear search filters.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Bill Modal */}
      {showPrintModal && selectedBillForPrint && (
        <PrintBillModal
          bill={selectedBillForPrint}
          patient={patients.find(p => p.id === selectedBillForPrint.patientId) || null}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Payment / Checkout Modal */}
      {billingModalApt && (
        <AppointmentBillingModal
          appointment={billingModalApt}
          onClose={() => setBillingModalApt(null)}
          onPaymentComplete={() => setBillingModalApt(null)}
        />
      )}
    </div>
  );
}
