import React, { useState } from 'react';
import {
  DollarSign, Search, Plus, Printer, CheckCircle2,
  FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useBilling } from '../../billing/context/BillingContext';
import { useBloodBank } from '../context/BloodBankContext';

export default function BloodBankBillingTab() {
  const { invoices, recordPayment } = useBilling();
  const { bloodRequests } = useBloodBank();

  const [search, setSearch] = useState('');

  // Filter invoices belonging to blood bank / transfusion
  const bloodInvoices = invoices.filter(inv =>
    (inv.items || []).some(item => item.sourceModule === 'blood_bank' || item.description?.toLowerCase().includes('blood') || item.description?.toLowerCase().includes('prbc'))
  );

  const handleCollect = (inv: any) => {
    recordPayment({
      invoiceId: inv.id,
      patientId: inv.patientId,
      patientName: inv.patientName,
      amount: inv.netPayable || inv.grossAmount,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      receivedBy: 'Blood Bank Cashier Desk',
      status: 'successful',
      counterName: 'Blood Bank Cash Counter 01',
    });
    alert(`Payment of ₹${inv.netPayable} collected successfully for ${inv.patientName}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Bank Billing, Payment Collection & Central Invoices
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Centralized billing for blood components, serology cross-matching, and transfusion consumables
            </div>
          </div>
        </div>
      </div>

      {/* Billable Standard Tariff Reference Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Packed RBC (PRBC)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>₹1,500 / Unit</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Includes NAT/Serology screening</div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Fresh Frozen Plasma (FFP)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>₹800 / Unit</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Cryo-fractionated</div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Platelet Concentrate (RDP)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>₹1,000 / Unit</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Agitator incubated</div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Cross-Match Compatibility Test</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>₹400 / Test</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Major + Minor + Coombs</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Blood Bank Central Billing Invoices ({bloodInvoices.length})</span>
          <span className="badge badge-primary">{bloodInvoices.filter(i => i.status === 'paid').length} Paid</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient Name & UHID</th>
                  <th>Service Description</th>
                  <th>Amount (₹)</th>
                  <th>Invoice Date</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bloodInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{inv.id}</strong>
                    </td>

                    <td>
                      <strong>{inv.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inv.uhid}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>
                        {inv.items?.[0]?.description || 'Blood Bank Component Issue & Processing'}
                      </div>
                    </td>

                    <td>
                      <strong style={{ fontSize: 14 }}>₹{inv.netPayable || inv.grossAmount}</strong>
                    </td>

                    <td>{inv.invoiceDate}</td>

                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {inv.status !== 'paid' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => handleCollect(inv)}
                          >
                            Collect ₹{inv.netPayable}
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: 26, fontSize: 11 }}
                          onClick={() => window.print()}
                        >
                          <Printer size={11} /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {bloodInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No blood bank invoices generated yet. Invoices are automatically generated upon blood bag issue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
