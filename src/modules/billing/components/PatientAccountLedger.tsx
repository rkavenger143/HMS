import React, { useState } from 'react';
import { BookOpen, Search, Download, Printer, Filter, DollarSign, Calendar } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DEMO_PATIENTS } from '../../../data/seedData';

export default function PatientAccountLedger() {
  const { departmentCharges, payments, advances, refunds, invoices, getPatientFinancialAccount } = useBilling();

  const [selectedPatientId, setSelectedPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId) || DEMO_PATIENTS[0];
  const summary = getPatientFinancialAccount(selectedPatientId);

  // Assemble chronological ledger events
  const ledgerEntries: {
    id: string;
    date: string;
    department: string;
    description: string;
    reference: string;
    debit: number; // Charges (+)
    credit: number; // Payments / Advances / Discounts (-)
    type: 'charge' | 'payment' | 'advance' | 'refund' | 'discount';
  }[] = [];

  // 1. Department Charges (Debits)
  departmentCharges
    .filter(c => c.patientId === selectedPatientId)
    .forEach(c => {
      ledgerEntries.push({
        id: c.id,
        date: c.chargeDate,
        department: c.department.toUpperCase(),
        description: c.description,
        reference: `${c.sourceModule.toUpperCase()}: ${c.sourceRecordId}`,
        debit: c.totalAmount,
        credit: 0,
        type: 'charge',
      });
    });

  // 2. Payments (Credits)
  payments
    .filter(p => p.patientId === selectedPatientId)
    .forEach(p => {
      ledgerEntries.push({
        id: p.id,
        date: p.paymentDate,
        department: 'BILLING',
        description: `Payment Received (${p.paymentMethod.toUpperCase()}) ${p.transactionRef ? `Ref: ${p.transactionRef}` : ''}`,
        reference: p.receiptNumber,
        debit: 0,
        credit: p.amount,
        type: 'payment',
      });
    });

  // 3. Advances (Credits)
  advances
    .filter(a => a.patientId === selectedPatientId)
    .forEach(a => {
      ledgerEntries.push({
        id: a.id,
        date: a.date,
        department: 'BILLING',
        description: `Patient Booking Deposit / Advance (${a.paymentMethod.toUpperCase()}) - ${a.reference || ''}`,
        reference: a.advanceNumber,
        debit: 0,
        credit: a.amount,
        type: 'advance',
      });
    });

  // 4. Refunds (Debits back to balance)
  refunds
    .filter(r => r.patientId === selectedPatientId)
    .forEach(r => {
      ledgerEntries.push({
        id: r.id,
        date: r.processedAt,
        department: 'BILLING',
        description: `Patient Refund Disbursed (${r.refundMethod.toUpperCase()}) - Reason: ${r.reason}`,
        reference: r.refundNumber,
        debit: r.amount,
        credit: 0,
        type: 'refund',
      });
    });

  // Sort chronologically
  ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Running balance calculation
  let runningBal = 0;
  const computedLedger = ledgerEntries.map(entry => {
    runningBal += entry.debit - entry.credit;
    return {
      ...entry,
      balance: runningBal,
    };
  });

  const filtered = computedLedger.filter(e => {
    return selectedDept === 'ALL' || e.department === selectedDept;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Department', 'Description', 'Reference #', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)'];
    const rows = filtered.map(e => [
      e.date,
      e.department,
      `"${e.description}"`,
      e.reference,
      e.debit,
      e.credit,
      e.balance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `patient_ledger_${selectedPatient.id}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Centralized Patient Financial Account Ledger & Statement</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete chronological audit ledger of all debits (charges), credits (payments/advances), and running net balance
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Patient Selector */}
          <select
            className="form-select"
            style={{ width: 280 }}
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
          >
            {DEMO_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — {p.id}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Patient Header & Balances */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-md">{selectedPatient.firstName[0]}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatient.firstName} {selectedPatient.lastName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                UHID: <strong>{selectedPatient.id}</strong> · Phone: {selectedPatient.phone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Debits (Charges)</div>
              <strong style={{ fontSize: 14 }}>₹{summary.totalBilled.toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Credits (Paid/Adv)</div>
              <strong style={{ fontSize: 14, color: 'var(--color-success)' }}>₹{(summary.totalPaid + summary.totalAdvance).toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Final Net Balance Due</div>
              <strong style={{ fontSize: 16, color: summary.netOutstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                ₹{summary.netOutstanding.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Filter Department:</span>
          <select className="form-select" style={{ width: 220 }} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="ALL">All Departments ({computedLedger.length})</option>
            <option value="OPD">OPD Consultations</option>
            <option value="IPD">IPD Inpatient / Bed</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="RADIOLOGY">Radiology</option>
            <option value="PHARMACY">Pharmacy</option>
            <option value="NURSING">Nursing</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="BILLING">Billing (Payments / Advances)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Department</th>
                  <th>Description & Particulars</th>
                  <th>Reference #</th>
                  <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <div style={{ fontSize: 12 }}>{entry.date}</div>
                    </td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {entry.department}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: 13 }}>{entry.description}</strong>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 11 }}>
                        {entry.reference}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {entry.debit > 0 ? (
                        <strong style={{ color: 'var(--color-danger)' }}>₹{entry.debit.toFixed(2)}</strong>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {entry.credit > 0 ? (
                        <strong style={{ color: 'var(--color-success)' }}>₹{entry.credit.toFixed(2)}</strong>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: entry.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        ₹{entry.balance.toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
