import React, { useMemo } from 'react';
import {
  BedDouble, Building2, CheckCircle2, AlertTriangle, Download,
  Printer, FileSpreadsheet, ShieldCheck, Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

const BED_STATUS_COLORS: { [key: string]: string } = {
  occupied: '#dc2626',
  available: '#059669',
  reserved: '#0284c7',
  cleaning: '#d97706',
  maintenance: '#64748b',
};

export default function BedOccupancyReports() {
  const { beds, filters, exportCSV } = useReports();

  const filtered = useMemo(() => {
    return beds.filter(b => {
      const q = (filters.patientSearch || '').toLowerCase();
      const ms = !q || b.bedNumber?.toLowerCase().includes(q) || b.ward?.toLowerCase().includes(q) || b.roomNumber?.toLowerCase().includes(q);
      const md = filters.department === 'ALL' || b.ward?.toLowerCase().includes(filters.department.toLowerCase());
      return ms && md;
    });
  }, [beds, filters]);

  const totalBeds = filtered.length;
  const occupiedBeds = filtered.filter(b => b.status === 'occupied').length;
  const availableBeds = filtered.filter(b => b.status === 'available').length;
  const maintenanceBeds = filtered.filter(b => b.status === 'maintenance' || b.status === 'cleaning').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Status Chart Data
  const statusData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filtered.forEach(b => {
      map[b.status] = (map[b.status] || 0) + 1;
    });
    return Object.keys(map).map(status => ({
      name: status.toUpperCase(),
      value: map[status],
      color: BED_STATUS_COLORS[status] || '#64748b',
    }));
  }, [filtered]);

  // Ward Breakdown
  const wardSummary = useMemo(() => {
    const map: { [key: string]: { total: number; occupied: number; available: number } } = {};
    filtered.forEach(b => {
      const w = b.ward || 'General Ward';
      if (!map[w]) map[w] = { total: 0, occupied: 0, available: 0 };
      map[w].total++;
      if (b.status === 'occupied') map[w].occupied++;
      if (b.status === 'available') map[w].available++;
    });

    return Object.keys(map).map(w => ({
      ward: w,
      total: map[w].total,
      occupied: map[w].occupied,
      available: map[w].available,
      rate: Math.round((map[w].occupied / map[w].total) * 100),
    }));
  }, [filtered]);

  const handleExportCSV = () => {
    const rows = filtered.map(b => [
      b.id,
      b.bedNumber,
      b.ward,
      b.roomNumber || '—',
      b.type || 'Standard',
      b.dailyRate ? `₹${b.dailyRate}` : '₹1,500',
      b.currentPatientName ? `${b.currentPatientName} (${b.currentPatientId})` : 'None',
      b.status.toUpperCase(),
    ]);

    exportCSV(
      'Hospital_Bed_Occupancy_Report',
      ['Bed ID', 'Bed Number', 'Ward Name', 'Room #', 'Bed Type', 'Daily Rate', 'Current Patient', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Hospital Bed Occupancy & Infrastructure Utilization Report"
        onExportCSV={handleExportCSV}
        showDoctorFilter={false}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{totalBeds}</div>
          <div className="stat-label">Total Beds Configured</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>{occupiedBeds}</div>
          <div className="stat-label">Currently Occupied Beds</div>
          <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
            {occupancyRate}% Overall Occupancy
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{availableBeds}</div>
          <div className="stat-label">Immediately Available Beds</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{maintenanceBeds}</div>
          <div className="stat-label">Cleaning / Maintenance</div>
        </div>
      </div>

      {/* Ward-Wise Progress Cards */}
      <div className="card">
        <div className="card-header">
          <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Ward-Wise Bed Utilization Benchmarks</span>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {wardSummary.map(w => (
              <div key={w.ward} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{w.ward}</strong>
                  <span className={`badge ${w.rate >= 80 ? 'badge-danger' : w.rate >= 50 ? 'badge-warning' : 'badge-success'}`}>
                    {w.rate}% Occupied
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {w.occupied} Occupied · {w.available} Available · {w.total} Total
                </div>

                <div className="progress" style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${w.rate}%`, background: w.rate >= 80 ? '#dc2626' : '#059669', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bed Matrix Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Bed Master Inventory Ledger</span>
          <span className="badge badge-primary">{filtered.length} Beds</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bed Number</th>
                  <th>Ward Name</th>
                  <th>Room #</th>
                  <th>Bed Type</th>
                  <th>Daily Tariff</th>
                  <th>Occupant Patient</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{b.bedNumber}</strong>
                    </td>
                    <td><strong>{b.ward}</strong></td>
                    <td>{b.roomNumber || '—'}</td>
                    <td>{b.type || 'Standard Care'}</td>
                    <td>₹{b.dailyRate || 1500} / day</td>
                    <td>
                      {b.currentPatientName ? (
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          {b.currentPatientName}
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>({b.currentPatientId})</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>Vacant</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'occupied' ? 'badge-danger' : b.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                        {b.status.toUpperCase()}
                      </span>
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
