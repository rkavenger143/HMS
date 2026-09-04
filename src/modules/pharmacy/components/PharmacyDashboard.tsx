import React, { useState } from 'react';
import {
  LayoutDashboard, Pill, AlertTriangle, TrendingDown, ShoppingCart,
  CheckCircle2, Clock, Package, IndianRupee, ArrowRight, ShieldCheck, Printer, FileText,
  Search
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import DispenseMedicineModal from './modals/DispenseMedicineModal';
import PrintPharmacyReceiptModal from './modals/PrintPharmacyReceiptModal';
import type { ComprehensivePrescription } from '../../../types';

export default function PharmacyDashboard() {
  const {
    kpis,
    prescriptions,
    setActiveTab,
    setSelectedPrescriptionId,
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [dispenseTarget, setDispenseTarget] = useState<ComprehensivePrescription | null>(null);
  const [printTarget, setPrintTarget] = useState<ComprehensivePrescription | null>(null);

  const filtered = prescriptions.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.patientName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.prescriptionNumber.toLowerCase().includes(q) ||
      p.doctorName.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || p.dispensingStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 9 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* 1. Today's Prescriptions */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('prescriptions')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <FileText size={17} />
          </div>
          <div className="stat-value">{kpis.totalPrescriptionsToday}</div>
          <div className="stat-label">Today's Prescriptions</div>
        </div>

        {/* 2. Pending Dispensing */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('prescriptions')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.pendingPrescriptions}</div>
          <div className="stat-label">Pending Dispensing</div>
        </div>

        {/* 3. Dispensed Today */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dispensing')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.dispensedPrescriptions}</div>
          <div className="stat-label">Dispensed Today</div>
        </div>

        {/* 4. Total Medicine Stock */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('medicines')}>
          <div className="stat-icon" style={{ background: 'rgba(10,132,255,0.1)', color: 'var(--color-primary)' }}>
            <Pill size={17} />
          </div>
          <div className="stat-value">{kpis.totalMedicines}</div>
          <div className="stat-label">Total Medicine Stock</div>
        </div>

        {/* 5. Low Stock */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('low_stock')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <TrendingDown size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.lowStockMedicines}</div>
          <div className="stat-label">Low Stock</div>
        </div>

        {/* 6. Out of Stock */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('low_stock')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.outOfStockMedicines}</div>
          <div className="stat-label">Out of Stock</div>
        </div>

        {/* 7. Near Expiry */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('expiry')}>
          <div className="stat-icon" style={{ background: 'rgba(255,159,10,0.15)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value">{kpis.nearExpiryMedicines}</div>
          <div className="stat-label">Near Expiry (&lt;90d)</div>
        </div>

        {/* 8. Expired */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('expiry')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.expiredMedicines}</div>
          <div className="stat-label">Expired Batches</div>
        </div>

        {/* 9. Today's Sales */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <IndianRupee size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{Math.round(kpis.todaySalesAmount).toLocaleString('en-IN')}</div>
          <div className="stat-label">Today's Sales</div>
        </div>
      </div>

      {/* Live Prescriptions & Dispensing Queue */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Pharmacy Dispensing & Prescription Queue</span>
              <div className="card-subtitle">Doctor e-Prescriptions, FEFO batch selection, barcoding & patient checkout</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('pos')}>
              POS Counter
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('prescriptions')}>
              View Full Queue <ArrowRight size={13} />
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
              placeholder="Search patient, UHID, Rx #, doctor..."
              style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 160 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_dispensed">Partially Dispensed</option>
            <option value="dispensed">Fully Dispensed</option>
          </select>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Prescribing Doctor</th>
                  <th>Medicines / Items</th>
                  <th>Payment Status</th>
                  <th>Dispensing Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rx => (
                  <tr key={rx.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{rx.prescriptionNumber}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{rx.date}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{rx.patientName}</div>
                      <div className="patient-id" style={{ fontSize: 10 }}>{rx.patientId} · {rx.encounterType.toUpperCase()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>Dr. {rx.doctorName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{rx.department}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>
                        {rx.medicines.map(i => `${i.medicineName} (${i.prescribedQty})`).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${rx.paymentStatus === 'paid' ? 'badge-success' : rx.paymentStatus === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                        {rx.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${rx.dispensingStatus === 'dispensed' ? 'badge-success' : rx.dispensingStatus === 'partially_dispensed' ? 'badge-warning' : 'badge-danger'}`}>
                        {rx.dispensingStatus.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {rx.dispensingStatus !== 'dispensed' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setDispenseTarget(rx)}
                          >
                            Dispense
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => setPrintTarget(rx)}
                        >
                          <Printer size={11} /> Print
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
      {dispenseTarget && (
        <DispenseMedicineModal
          prescription={dispenseTarget}
          onClose={() => setDispenseTarget(null)}
        />
      )}

      {printTarget && (
        <PrintPharmacyReceiptModal
          prescription={printTarget}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}
