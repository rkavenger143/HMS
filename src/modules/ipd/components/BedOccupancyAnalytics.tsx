import React from 'react';
import {
  Activity, TrendingUp, Users, BedDouble, HeartPulse,
  Layers, CheckCircle2, AlertTriangle, Sparkles, Building2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useIPD } from '../context/IPDContext';

export default function BedOccupancyAnalytics() {
  const { beds, wards, kpis, admissions } = useIPD();

  // Status Distribution Data for Pie Chart
  const statusPieData = [
    { name: 'Available', value: beds.filter(b => b.status === 'available').length, color: '#30D158' },
    { name: 'Occupied', value: beds.filter(b => b.status === 'occupied').length, color: '#FF453A' },
    { name: 'Reserved', value: beds.filter(b => b.status === 'reserved').length, color: '#FFD60A' },
    { name: 'Cleaning', value: beds.filter(b => b.status === 'cleaning').length, color: '#0A84FF' },
    { name: 'Maintenance', value: beds.filter(b => b.status === 'maintenance').length, color: '#8E8E93' },
  ].filter(d => d.value > 0);

  // Ward Occupancy Bar Data
  const wardOccupancyData = wards.map(w => {
    const wardBeds = beds.filter(b => b.wardId === w.id || b.ward === w.name);
    const occupied = wardBeds.filter(b => b.status === 'occupied').length;
    const available = wardBeds.filter(b => b.status === 'available').length;
    const rate = wardBeds.length > 0 ? Math.round((occupied / wardBeds.length) * 100) : 0;

    return {
      ward: w.name.replace(' Ward', ''),
      total: wardBeds.length,
      occupied,
      available,
      rate,
    };
  });

  // Floor Occupancy Data
  const floorData = [
    { floor: 'Floor 0 (ER)', occupied: beds.filter(b => b.floor === 0 && b.status === 'occupied').length, total: beds.filter(b => b.floor === 0).length },
    { floor: 'Floor 1 (GW)', occupied: beds.filter(b => b.floor === 1 && b.status === 'occupied').length, total: beds.filter(b => b.floor === 1).length },
    { floor: 'Floor 2 (Pvt)', occupied: beds.filter(b => b.floor === 2 && b.status === 'occupied').length, total: beds.filter(b => b.floor === 2).length },
    { floor: 'Floor 3 (ICU)', occupied: beds.filter(b => b.floor === 3 && b.status === 'occupied').length, total: beds.filter(b => b.floor === 3).length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Bed Occupancy Analytics & Capacity</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Real-time ward census metrics, ICU utilization rates, and departmental capacity forecasting
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-4" style={{ gap: 12 }}>
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div className="stat-label">Hospital Bed Occupancy Rate</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.bedOccupancyRate}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{kpis.occupiedBeds} of {kpis.totalOperationalBeds} operational beds</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div className="stat-label">ICU & HDU Occupancy</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.icuOccupancyRate}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Critical care utilization metric</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div className="stat-label">Vacant Beds Available</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.availableBeds}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Ready for immediate intake</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <div className="stat-label">Cleaning & Turnaround</div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.cleaningBeds}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Post-discharge sanitization queue</div>
        </div>
      </div>

      {/* 2-Column Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Ward Occupancy Bar Chart */}
        <div className="card">
          <div className="card-header">
            <Layers size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Ward Occupancy Breakdown (Occupied vs Available)</span>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="ward" stroke="#8E8E93" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#8E8E93" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8, color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#FF453A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#30D158" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <BedDouble size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Bed Status Distribution</span>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8, color: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Floor-by-Floor Capacity Table */}
      <div className="card">
        <div className="card-header">
          <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Floor-by-Floor Capacity & Utilization Matrix</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital Floor / Wing</th>
                  <th>Total Beds</th>
                  <th>Occupied</th>
                  <th>Available</th>
                  <th>Utilization Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {floorData.map((f, i) => {
                  const rate = f.total > 0 ? Math.round((f.occupied / f.total) * 100) : 0;
                  const free = f.total - f.occupied;

                  return (
                    <tr key={i}>
                      <td><strong>{f.floor}</strong></td>
                      <td>{f.total} Beds</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{f.occupied}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{free}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ width: 120, height: 6 }}>
                            <div className={`progress-bar ${rate > 80 ? 'danger' : rate > 50 ? 'warning' : 'success'}`} style={{ width: `${rate}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${rate > 80 ? 'badge-danger' : rate > 50 ? 'badge-warning' : 'badge-success'}`}>
                          {rate > 80 ? 'High Occupancy' : rate > 50 ? 'Moderate' : 'Optimal Capacity'}
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
