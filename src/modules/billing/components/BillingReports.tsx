import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

export type BillingReportId =
  | 'daily_revenue'
  | 'daily_collections'
  | 'dept_revenue'
  | 'opd_billing'
  | 'ipd_billing'
  | 'lab_revenue'
  | 'rad_revenue'
  | 'pharm_revenue'
  | 'emr_revenue'
  | 'outstanding_dues'
  | 'advances_ledger'
  | 'refunds_audit'
  | 'discounts_audit'
  | 'insurance_claims'
  | 'corporate_billing'
  | 'cash_sessions'
  | 'tax_gst'
  | 'doctor_fees';

const REPORT_DEFINITIONS: { id: BillingReportId; title: string; desc: string }[] = [
  { id: 'daily_revenue', title: '1. Daily Hospital Revenue Census', desc: 'Consolidated hospital-wide billed charges and revenue across all encounters' },
  { id: 'daily_collections', title: '2. Daily Cashier Collections & Tender Report', desc: 'Cash, Card, UPI, and Bank settlements realized across counters' },
  { id: 'dept_revenue', title: '3. Department-wise Revenue Breakdown', desc: 'Comprehensive financial contribution by OPD, IPD, Lab, Rad, Pharmacy & OT' },
  { id: 'opd_billing', title: '4. OPD Consultation Billing Report', desc: 'Outpatient physician consultation and specialist visit collections' },
  { id: 'ipd_billing', title: '5. IPD Inpatient Billing & Bed Rent Report', desc: 'General ward, private room, and ICU bed charges and nursing services' },
  { id: 'lab_revenue', title: '6. Laboratory Diagnostic Revenue Report', desc: 'Pathology, biochemistry, and microbiology billable test revenues' },
  { id: 'rad_revenue', title: '7. Radiology & Imaging Revenue Report', desc: 'Digital X-Ray, CT scan, MRI, and ultrasound imaging charges' },
  { id: 'pharm_revenue', title: '8. Pharmacy Sales & Dispensing Revenue', desc: 'Inpatient prescription fulfillment and outpatient counter POS sales' },
  { id: 'emr_revenue', title: '9. Emergency & Casualty Billing Report', desc: '24x7 emergency resuscitation, triage, and observation charges' },
  { id: 'outstanding_dues', title: '10. Outstanding & Dues Ageing Report', desc: 'Unpaid patient balances and receivables categorized by payment aging' },
  { id: 'advances_ledger', title: '11. Patient Advance Payment Ledger', desc: 'Inpatient booking deposits, utilized amounts, and available balances' },
  { id: 'refunds_audit', title: '12. Refund & Credit Note Audit Report', desc: 'Disbursed patient refunds with authorization reason and method' },
  { id: 'discounts_audit', title: '13. Discount & Concession Audit Report', desc: 'Hospital waivers, senior citizen discounts, and management concessions' },
  { id: 'insurance_claims', title: '14. Insurance / TPA Claims Settlement Report', desc: 'Cashless pre-authorizations, claim submissions, and settled payments' },
  { id: 'corporate_billing', title: '15. Corporate Credit Billing Ledger', desc: 'Institutional credit accounts, corporate agreements, and credit limits' },
  { id: 'cash_sessions', title: '16. Cash Counter Session Reconciliation', desc: 'Cashier shift opening float, closing totals, and cash drawer variances' },
  { id: 'tax_gst', title: '17. GST / Tax Statutory Collection Report', desc: 'SAC / HSN tax breakdown, CGST, and SGST tax liability statements' },
  { id: 'doctor_fees', title: '18. Doctor-wise Professional Fee & Revenue', desc: 'Consultant-wise revenue generation and clinical procedure fees' },
];

export default function BillingReports() {
  const { invoices, payments, advances, refunds, insuranceClaims, departmentCharges, cashSessions } = useBilling();

  const [selectedReport, setSelectedReport] = useState<BillingReportId>('daily_revenue');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-02');

  const currentDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'daily_revenue' || selectedReport === 'opd_billing' || selectedReport === 'ipd_billing' || selectedReport === 'outstanding_dues') {
      headers = ['Invoice #', 'Date', 'Patient Name', 'UHID', 'Encounter', 'Doctor', 'Gross (₹)', 'Paid (₹)', 'Balance (₹)', 'Status'];
      rows = invoices.map(i => [
        i.invoiceNumber,
        i.invoiceDate,
        `"${i.patientName}"`,
        i.uhid,
        i.encounterType,
        `"${i.doctorName || ''}"`,
        i.grossAmount,
        i.paidAmount,
        i.outstandingBalance,
        i.status,
      ]);
    } else if (selectedReport === 'daily_collections') {
      headers = ['Receipt #', 'Date', 'Patient Name', 'Invoice #', 'Amount (₹)', 'Payment Tender', 'Reference', 'Cashier'];
      rows = payments.map(p => [
        p.receiptNumber,
        p.paymentDate,
        `"${p.patientName}"`,
        p.invoiceId,
        p.amount,
        p.paymentMethod,
        `"${p.transactionRef || ''}"`,
        `"${p.receivedBy}"`,
      ]);
    } else {
      headers = ['Ref #', 'Date', 'Patient', 'Department', 'Description', 'Amount (₹)'];
      rows = departmentCharges.map(c => [
        c.sourceRecordId,
        c.chargeDate,
        c.patientId,
        c.department,
        `"${c.description}"`,
        c.totalAmount,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hospital_billing_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Financial Accounting & Statutory Reports (18 Reports)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              18 comprehensive revenue, collections, department audits, TPA settlements, GST statutory tax, and cashier shift reports
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Left: 18 Reports Selector */}
        <div className="card" style={{ padding: '12px', maxHeight: '78vh', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT FINANCIAL REPORT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {REPORT_DEFINITIONS.map(r => (
              <button
                key={r.id}
                className={`btn btn-sm ${selectedReport === r.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 12px', height: 'auto' }}
                onClick={() => setSelectedReport(r.id)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Table */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-title" style={{ fontSize: 16 }}>{currentDef.title}</span>
              <div className="card-subtitle">{currentDef.desc}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {selectedReport === 'daily_collections' ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date & Time</th>
                      <th>Patient Name</th>
                      <th>Invoice Ref</th>
                      <th>Tender</th>
                      <th>Amount (₹)</th>
                      <th>Cashier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.receiptNumber}</strong></td>
                        <td>{p.paymentDate}</td>
                        <td><strong>{p.patientName}</strong></td>
                        <td>{p.invoiceId}</td>
                        <td><span className="badge badge-primary">{p.paymentMethod.toUpperCase()}</span></td>
                        <td><strong style={{ color: 'var(--color-success)' }}>₹{p.amount.toLocaleString()}</strong></td>
                        <td>{p.receivedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Encounter</th>
                      <th>Consultant</th>
                      <th>Gross Total (₹)</th>
                      <th>Paid (₹)</th>
                      <th>Balance Due (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id}>
                        <td><strong>{inv.invoiceNumber}</strong></td>
                        <td>{inv.invoiceDate}</td>
                        <td><strong>{inv.patientName}</strong></td>
                        <td><span className="badge badge-primary">{inv.encounterType.toUpperCase()}</span></td>
                        <td>{inv.doctorName || '—'}</td>
                        <td><strong>₹{inv.grossAmount.toLocaleString()}</strong></td>
                        <td><strong style={{ color: 'var(--color-success)' }}>₹{inv.paidAmount.toLocaleString()}</strong></td>
                        <td><strong style={{ color: inv.outstandingBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{inv.outstandingBalance.toLocaleString()}</strong></td>
                        <td><span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
