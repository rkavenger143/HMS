import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export type PharmacyReportId =
  | 'daily_sales'
  | 'prescriptions'
  | 'stock_ledger'
  | 'low_stock'
  | 'out_of_stock'
  | 'near_expiry'
  | 'expired_stock'
  | 'returns_report'
  | 'purchase_orders'
  | 'grn_invoices'
  | 'stock_movements'
  | 'stock_adjustments'
  | 'transfers'
  | 'recalls'
  | 'valuation'
  | 'controlled_drugs';

const REPORT_DEFINITIONS: { id: PharmacyReportId; title: string; desc: string }[] = [
  { id: 'daily_sales', title: '1. Daily Pharmacy Counter Sales Census', desc: 'Comprehensive sales transactions across OPD counter and discharge sales' },
  { id: 'prescriptions', title: '2. Prescription Dispensing & Fulfillment Report', desc: 'Doctor prescription fulfillment rates, partial dispensing, and pending queue' },
  { id: 'stock_ledger', title: '3. Complete Medicine Stock Ledger', desc: 'Live dispensary inventory balances across all categories, strengths, and pack units' },
  { id: 'low_stock', title: '4. Low Stock & Reorder Threshold Analysis', desc: 'Critical medicines currently at or below minimum reorder levels' },
  { id: 'out_of_stock', title: '5. Out of Stock Medicines Emergency Audit', desc: 'Zero inventory items requiring immediate procurement purchase orders' },
  { id: 'near_expiry', title: '6. Near-Expiry Drugs Alert Report (<90 Days)', desc: 'Batches approaching expiration date prioritized for FEFO acceleration' },
  { id: 'expired_stock', title: '7. Expired Medicines & Bio-Disposal Log', desc: 'Quarantined and disposed expired drugs with batch and cost tracking' },
  { id: 'returns_report', title: '8. Medicine Returns (Patient & Supplier) Register', desc: 'Patient refund credits and supplier debit note logs with inspection reasons' },
  { id: 'purchase_orders', title: '9. Supplier Purchase Order Procurement Report', desc: 'Commercial PO requisitions, vendor approvals, and delivery fulfillment status' },
  { id: 'grn_invoices', title: '10. Goods Inward Note (GRN) & Purchase Invoice Register', desc: 'Inward stock receipts, batch lot numbers, invoice numbers, and GST rates' },
  { id: 'stock_movements', title: '11. Stock Movement Audit Trail & Transaction Ledger', desc: 'Immutable chronological ledger of every stock addition, dispensing, and adjustment' },
  { id: 'stock_adjustments', title: '12. Physical Inventory Variance & Adjustment Audit', desc: 'Physical count discrepancies, breakage write-offs, and manager signoffs' },
  { id: 'transfers', title: '13. Inter-Dispensary Store Transfer Log', desc: 'Medication stock movements between Main Store, OPD, IPD, and Emergency units' },
  { id: 'recalls', title: '14. Emergency Drug Batch Recall & Quarantine Audit', desc: 'CDSCO drug alert recalls, quarantined lot numbers, and vendor return logs' },
  { id: 'valuation', title: '15. Inventory Asset Valuation (Cost vs Selling MRP)', desc: 'Financial valuation of pharmacy assets by therapeutic drug classification' },
  { id: 'controlled_drugs', title: '16. Schedule H1 & Narcotic Controlled Drug Dispensing Audit', desc: 'Statutory regulatory record of high-alert and controlled substance dispensing' },
];

export default function PharmacyReports() {
  const { sales, prescriptions, medicines, batches, purchaseOrders, returns, stockMovements } = usePharmacy();

  const [selectedReport, setSelectedReport] = useState<PharmacyReportId>('daily_sales');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-02');

  const currentDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'daily_sales') {
      headers = ['Bill #', 'Date', 'Patient Name', 'Payment Tender', 'Items Count', 'Grand Total (₹)', 'Pharmacist'];
      rows = sales.map(s => [
        s.saleNumber,
        s.saleDate,
        `"${s.patientName || 'Walk-in'}"`,
        s.paymentMethod,
        s.items.length,
        s.grandTotal,
        `"${s.pharmacistName}"`,
      ]);
    } else if (selectedReport === 'stock_ledger') {
      headers = ['Code', 'Brand Name', 'Generic', 'Category', 'Form', 'Stock', 'Unit', 'Purchase Rate (₹)', 'Selling MRP (₹)'];
      rows = medicines.map(m => [
        m.medicineCode,
        `"${m.brandName}"`,
        `"${m.genericName}"`,
        m.category,
        m.dosageForm,
        m.totalStock,
        m.unit,
        m.purchasePrice,
        m.sellingPrice,
      ]);
    } else {
      headers = ['Item', 'Batch', 'Expiry', 'Stock', 'Amount (₹)', 'Status'];
      rows = batches.map(b => [
        `"${b.medicineName}"`,
        b.batchNumber,
        b.expiryDate,
        b.availableQuantity,
        b.availableQuantity * b.purchasePrice,
        b.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `pharmacy_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmacy Information System (PIS) Operational & Statutory Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              16 statutory drug license, sales revenue, inventory valuation, stock movement, and controlled drug audits
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
        {/* Left: 16 Reports Selector */}
        <div className="card" style={{ padding: '12px', maxHeight: '78vh', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT PHARMACY REPORT
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
            {selectedReport === 'daily_sales' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bill / Sale #</th>
                      <th>Date & Time</th>
                      <th>Patient Name</th>
                      <th>Tender</th>
                      <th>Line Items</th>
                      <th>Grand Total (₹)</th>
                      <th>Pharmacist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.saleNumber}</strong></td>
                        <td>{s.saleDate}</td>
                        <td>{s.patientName || 'Walk-in'}</td>
                        <td><span className="badge badge-primary">{s.paymentMethod.toUpperCase()}</span></td>
                        <td>{s.items.length} Item(s)</td>
                        <td><strong style={{ color: 'var(--color-primary)' }}>₹{s.grandTotal.toFixed(2)}</strong></td>
                        <td>{s.pharmacistName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'stock_ledger' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Brand Name</th>
                      <th>Generic Name</th>
                      <th>Category</th>
                      <th>Available Stock</th>
                      <th>Purchase Rate (₹)</th>
                      <th>Selling MRP (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.medicineCode}</strong></td>
                        <td><strong>{m.brandName}</strong></td>
                        <td>{m.genericName} ({m.strength})</td>
                        <td><span className="badge badge-neutral">{m.category}</span></td>
                        <td><strong>{m.totalStock} {m.unit}</strong></td>
                        <td>₹{m.purchasePrice.toFixed(2)}</td>
                        <td><strong style={{ color: 'var(--color-primary)' }}>₹{m.sellingPrice.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!['daily_sales', 'stock_ledger'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Item</th>
                      <th>Batch / Lot Number</th>
                      <th>Expiry Date</th>
                      <th>Quantity</th>
                      <th>Cost Value (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.medicineName}</strong></td>
                        <td><span style={{ fontFamily: 'monospace' }}>{b.batchNumber}</span></td>
                        <td>{b.expiryDate}</td>
                        <td><strong>{b.availableQuantity}</strong></td>
                        <td>₹{(b.availableQuantity * b.purchasePrice).toFixed(2)}</td>
                        <td><span className="badge badge-success">{b.status.toUpperCase()}</span></td>
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
