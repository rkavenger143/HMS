import React, { useMemo } from 'react';
import {
  Pill, AlertTriangle, CheckCircle2, Clock, DollarSign,
  Download, Printer, BarChart2, FileSpreadsheet, Package
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function PharmacyReports() {
  const { medicines, dispensings, filters, exportCSV } = useReports();

  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysLater = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  // Normalize medicine stock and batch details
  const enrichedMedicines = useMemo(() => {
    return medicines.map(m => {
      const stock = m.currentStock ?? (m.batches?.reduce((acc, b) => acc + (b.quantity || 0), 0) || 50);
      const firstBatch = m.batches?.[0];
      const batchNumber = firstBatch?.batchNumber || 'B-9021';
      const expiryDate = m.expiryDate || firstBatch?.expiryDate || '2027-12-31';
      const unitPrice = m.price || m.sellingPrice || firstBatch?.sellingPrice || 25;

      return {
        ...m,
        calculatedStock: stock,
        batchNumber,
        expiryDate,
        unitPrice,
        stockValuation: stock * unitPrice,
      };
    });
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return enrichedMedicines.filter(m => {
      const q = (filters.patientSearch || '').toLowerCase();
      return (
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.batchNumber?.toLowerCase().includes(q)
      );
    });
  }, [enrichedMedicines, filters]);

  const totalStockValue = filteredMedicines.reduce((acc, m) => acc + m.stockValuation, 0);
  const expiringSoonCount = filteredMedicines.filter(m => m.expiryDate >= todayStr && m.expiryDate <= thirtyDaysLater).length;
  const expiredCount = filteredMedicines.filter(m => m.expiryDate < todayStr).length;

  const handleExportCSV = () => {
    const rows = filteredMedicines.map(m => {
      const isExpired = m.expiryDate < todayStr;
      const isExpiringSoon = !isExpired && m.expiryDate <= thirtyDaysLater;
      const status = isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'IN STOCK';

      return [
        m.id,
        m.name,
        m.genericName || '—',
        m.batchNumber,
        m.calculatedStock,
        `₹${m.unitPrice}`,
        `₹${m.stockValuation}`,
        m.expiryDate,
        status,
      ];
    });

    exportCSV(
      'Pharmacy_Inventory_Stock_Expiry_Report',
      ['Medicine ID', 'Brand Name', 'Generic Name', 'Batch Number', 'Current Stock (Units)', 'Unit Price', 'Stock Valuation', 'Expiry Date', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Pharmacy Inventory, Stock Valuation & Expiry Audits Report"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
        showDepartmentFilter={false}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filteredMedicines.length}</div>
          <div className="stat-label">Total Pharmacy SKUs</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Inventory Valuation</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{expiringSoonCount}</div>
          <div className="stat-label">Expiring Soon (&le;30 Days)</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>{expiredCount}</div>
          <div className="stat-label">Expired Stock (Quarantined)</div>
        </div>
      </div>

      {/* Medicines Inventory Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Pharmacy Medicine Stock & Expiration Ledger</span>
          <span className="badge badge-primary">{filteredMedicines.length} Items</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Batch #</th>
                  <th>Stock (Units)</th>
                  <th>Unit Price (₹)</th>
                  <th>Total Value (₹)</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map(m => {
                  const isExpired = m.expiryDate < todayStr;
                  const isExpiringSoon = !isExpired && m.expiryDate <= thirtyDaysLater;

                  return (
                    <tr key={m.id} style={{ background: isExpired ? '#fef2f2' : isExpiringSoon ? '#fffbeb' : undefined }}>
                      <td>
                        <strong>{m.name}</strong>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.id}</div>
                      </td>
                      <td>{m.genericName || '—'}</td>
                      <td>
                        <strong style={{ fontFamily: 'monospace' }}>{m.batchNumber}</strong>
                      </td>
                      <td>
                        <strong style={{ color: m.calculatedStock < 20 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {m.calculatedStock}
                        </strong>
                        {m.calculatedStock < 20 && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 9 }}>LOW</span>}
                      </td>
                      <td>₹{m.unitPrice}</td>
                      <td><strong>₹{m.stockValuation.toLocaleString('en-IN')}</strong></td>
                      <td>
                        <strong style={{ color: isExpired ? 'var(--color-danger)' : isExpiringSoon ? '#d97706' : 'var(--text-primary)' }}>
                          {m.expiryDate}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : isExpiringSoon ? 'badge-warning' : 'badge-success'}`}>
                          {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'IN STOCK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
