import React, { useMemo } from 'react';
import {
  Droplets, HeartPulse, AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, Plus, ArrowRight, UserPlus, FlaskConical, Thermometer,
  FileText, ShieldCheck, Activity, DollarSign, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodGroup } from '../../../types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COLORS = ['#dc2626', '#059669', '#0284c7', '#d97706', '#7c3aed'];

export default function BloodBankDashboard() {
  const {
    stockByGroup,
    totalUnitsCount,
    availableUnitsCount,
    reservedUnitsCount,
    quarantineUnitsCount,
    expiringSoonCount,
    expiredUnitsCount,
    emergencyRequestsCount,
    bloodBags,
    donations,
    bloodRequests,
    crossMatches,
    issues,
    discards,
    setActiveTab,
    setSelectedBagId,
  } = useBloodBank();

  // Component breakdown for Pie Chart
  const componentData = useMemo(() => {
    const compMap: Record<string, number> = {
      'Packed RBC': 0,
      'Fresh Frozen Plasma': 0,
      'Platelets': 0,
      'Whole Blood': 0,
      'Cryoprecipitate': 0,
    };
    bloodBags.forEach(b => {
      if (b.status === 'available') {
        if (b.component === 'packed_rbc') compMap['Packed RBC']++;
        else if (b.component === 'fresh_frozen_plasma') compMap['Fresh Frozen Plasma']++;
        else if (b.component === 'platelets') compMap['Platelets']++;
        else if (b.component === 'whole_blood') compMap['Whole Blood']++;
        else if (b.component === 'cryoprecipitate') compMap['Cryoprecipitate']++;
      }
    });
    return Object.entries(compMap).map(([name, value]) => ({ name, value }));
  }, [bloodBags]);

  // Group Stock Chart Data
  const groupStockChartData = useMemo(() => {
    return BLOOD_GROUPS.map(bg => ({
      group: bg,
      available: stockByGroup[bg] || 0,
      reserved: bloodBags.filter(b => b.bloodGroup === bg && b.status === 'reserved').length,
      quarantine: bloodBags.filter(b => b.bloodGroup === bg && b.status === 'quarantine').length,
    }));
  }, [stockByGroup, bloodBags]);

  // Emergency & Urgent requests
  const urgentRequests = bloodRequests.filter(
    r => (r.priority === 'emergency' || r.priority === 'urgent') && r.status !== 'completed' && r.status !== 'cancelled'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 🚨 Critical Emergency Alert Banner */}
      {emergencyRequestsCount > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #fef2f2, #fff1f2)',
          border: '2px solid #ef4444',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#ef4444', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.5s infinite'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#991b1b', letterSpacing: '-0.2px' }}>
                🚨 ACTIVE EMERGENCY BLOOD REQUEST ({emergencyRequestsCount} PENDING)
              </div>
              <div style={{ fontSize: 12, color: '#7f1d1d' }}>
                Immediate blood compatibility matching & STAT issue required for Trauma / ICU resuscitation.
              </div>
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            style={{ fontWeight: 800, padding: '8px 18px', fontSize: 13 }}
            onClick={() => setActiveTab('requests')}
          >
            Open Emergency Desk <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Quick Action Buttons Bar */}
      <div className="card" style={{ padding: '12px 16px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: 4 }}>
            Blood Bank Actions:
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('donors')}>
            <UserPlus size={13} /> Register Donor
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('donations')}>
            <Droplets size={13} style={{ color: 'var(--color-danger)' }} /> Record Donation
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('screening')}>
            <FlaskConical size={13} style={{ color: '#0284c7' }} /> Screening & Quarantine ({quarantineUnitsCount})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('requests')}>
            <AlertTriangle size={13} style={{ color: '#d97706' }} /> Blood Requests ({bloodRequests.length})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('crossmatch')}>
            <Activity size={13} style={{ color: 'var(--color-success)' }} /> Cross-Matching Desk
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('issue')}>
            <ShieldCheck size={13} style={{ color: '#7c3aed' }} /> Safety Issue Desk
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('storage_temp')}>
            <Thermometer size={13} style={{ color: '#0d9488' }} /> Temp Monitoring
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('billing')}>
            <DollarSign size={13} style={{ color: 'var(--color-primary)' }} /> Blood Billing
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{totalUnitsCount}</div>
          <div className="stat-label">Total Blood Units in Master</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {availableUnitsCount} available · {reservedUnitsCount} reserved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{availableUnitsCount}</div>
          <div className="stat-label">Available for Issue</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Tested, screened & released to shelf
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>{quarantineUnitsCount}</div>
          <div className="stat-label">Quarantine / Testing Bay</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Pending infectious disease screening
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{expiringSoonCount}</div>
          <div className="stat-label">Units Expiring Soon (&le;7 Days)</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            FEFO priority for issue
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{expiredUnitsCount + discards.length}</div>
          <div className="stat-label">Expired / Discarded Units</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Quarantined for biohazard discard
          </div>
        </div>
      </div>

      {/* 8-Blood Group Real-Time Stock Matrix */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Real-Time Blood Stock Matrix by Group</span>
              <div className="card-subtitle">Live available unit balances with automated low-stock warnings</div>
            </div>
          </div>
          <span className="badge badge-primary">8 Blood Groups</span>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {BLOOD_GROUPS.map(bg => {
              const count = stockByGroup[bg] || 0;
              const isCriticallyLow = count < 2;
              const isLow = count >= 2 && count < 5;

              return (
                <div
                  key={bg}
                  style={{
                    background: isCriticallyLow ? '#fef2f2' : isLow ? '#fffbeb' : 'var(--bg-surface)',
                    border: `1.5px solid ${isCriticallyLow ? '#fca5a5' : isLow ? '#fde68a' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onClick={() => setActiveTab('inventory')}
                  title="Click to view blood bags for this group in Inventory"
                >
                  <div style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: isCriticallyLow ? '#dc2626' : isLow ? '#d97706' : 'var(--color-primary)',
                    letterSpacing: '-0.5px'
                  }}>
                    {bg}
                  </div>

                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>units ready</div>

                  {isCriticallyLow ? (
                    <span className="badge badge-danger" style={{ fontSize: 10, padding: '2px 6px', marginTop: 4 }}>
                      CRITICAL LOW
                    </span>
                  ) : isLow ? (
                    <span className="badge badge-warning" style={{ fontSize: 10, padding: '2px 6px', marginTop: 4 }}>
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px', marginTop: 4 }}>
                      SUFFICIENT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row: Stock by Group Bar Chart & Component Breakdown Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* Blood Group Stock Distribution */}
        <div className="card">
          <div className="card-header">
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Blood Group Inventory Distribution</span>
          </div>
          <div className="card-body" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupStockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="group" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="available" name="Available" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reserved" name="Reserved" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quarantine" name="Quarantine" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Breakdown Pie Chart */}
        <div className="card">
          <div className="card-header">
            <HeartPulse size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Available Units by Blood Component</span>
          </div>
          <div className="card-body" style={{ height: 250, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={componentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {componentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent & Emergency Patient Requests Register */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
            <div>
              <span className="card-title">Urgent & Emergency Patient Blood Requests</span>
              <div className="card-subtitle">Active requests awaiting matching, reservation, or issue handover</div>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('requests')}>
            View All Requests <ArrowRight size={12} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Name & UHID</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Units</th>
                  <th>Priority</th>
                  <th>Department / Bed</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {urgentRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{req.id}</strong>
                    </td>

                    <td>
                      <strong>{req.patientName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.patientId}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ fontWeight: 800 }}>{req.bloodGroup}</span>
                    </td>

                    <td>{req.component.replace(/_/g, ' ').toUpperCase()}</td>
                    <td><strong>{req.unitsRequested} Unit(s)</strong></td>

                    <td>
                      <span className={`badge ${req.priority === 'emergency' ? 'badge-danger' : 'badge-warning'}`}>
                        {req.priority.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div>{req.department}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.ward} · {req.bed}</div>
                    </td>

                    <td>
                      <span className={`badge ${req.status === 'ready_for_issue' ? 'badge-success' : req.status === 'reserved' ? 'badge-primary' : 'badge-warning'}`}>
                        {req.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: 11 }}
                        onClick={() => setActiveTab('crossmatch')}
                      >
                        Cross-Match
                      </button>
                    </td>
                  </tr>
                ))}

                {urgentRequests.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No active urgent or emergency requests at this moment.
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
