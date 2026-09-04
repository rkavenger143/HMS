import React from 'react';
import {
  Users, UserCheck, Stethoscope, Building2, BedDouble, HeartPulse,
  FlaskConical, Scan, Pill, Droplet, DollarSign, ShieldCheck,
  Activity, ArrowRight, ShieldAlert, KeyRound, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAdmin, AdminTab } from '../context/AdminContext';

export default function AdminDashboard() {
  const { dashboardStats, setActiveTab, roles, users, departments, beds } = useAdmin();

  // Role distribution data for Pie Chart
  const roleDistribution = React.useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      map[u.role] = (map[u.role] || 0) + 1;
    });

    const colors = ['#8b5cf6', '#0284c7', '#10b981', '#06b6d4', '#f97316', '#ec4899', '#eab308', '#f59e0b', '#3b82f6', '#ef4444'];
    return Object.entries(map).map(([role, count], idx) => ({
      name: role.replace(/_/g, ' ').toUpperCase(),
      value: count,
      color: colors[idx % colors.length],
    }));
  }, [users]);

  // Bed status distribution
  const bedStatusData = React.useMemo(() => [
    { name: 'Occupied', count: dashboardStats.occupiedBeds, color: '#dc2626' },
    { name: 'Available', count: dashboardStats.availableBeds, color: '#10b981' },
    { name: 'Maintenance', count: Math.max(0, dashboardStats.totalBeds - dashboardStats.occupiedBeds - dashboardStats.availableBeds), color: '#d97706' },
  ], [dashboardStats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark, #065f46) 0%, var(--color-primary, #059669) 100%)',
          color: '#fff',
          padding: '24px',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
              <ShieldCheck size={14} /> HOSPITAL GOVERNANCE & CONTROL HUB
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
              Central Hospital Administration Cockpit
            </h2>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 13 }}>
              Real-time administrative telemetry, RBAC access control, master data & multi-department configuration
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setActiveTab('users')}
              style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 600, border: 'none' }}
            >
              <Users size={15} /> Manage Users
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setActiveTab('system_settings')}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* 12 Live System Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {/* Total Users */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{dashboardStats.totalUsers}</div>
            <Users size={20} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Total System Users</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
            {dashboardStats.activeUsers} Active · {dashboardStats.inactiveUsers} Inactive
          </div>
        </div>

        {/* Doctors */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('doctors')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#0284c7' }}>{dashboardStats.totalDoctors}</div>
            <Stethoscope size={20} style={{ color: '#0284c7', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Consultant Physicians</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Clinical tariffs & room config
          </div>
        </div>

        {/* Staff Members */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('staff')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{dashboardStats.totalStaff}</div>
            <UserCheck size={20} style={{ color: '#8b5cf6', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Enrolled Staff & Shifts</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            4 Duty Shifts Configured
          </div>
        </div>

        {/* Departments */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('departments')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{dashboardStats.totalDepartments}</div>
            <Building2 size={20} style={{ color: '#f59e0b', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Active Departments</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Clinical & Administrative
          </div>
        </div>

        {/* Total Beds */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('wards_beds')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#dc2626' }}>{dashboardStats.totalBeds}</div>
            <BedDouble size={20} style={{ color: '#dc2626', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Total Hospital Beds</div>
          <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
            {dashboardStats.occupiedBeds} Occupied · {dashboardStats.availableBeds} Available
          </div>
        </div>

        {/* Patients & Encounters */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('clinical_settings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#10b981' }}>{dashboardStats.totalPatients}</div>
            <HeartPulse size={20} style={{ color: '#10b981', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Total Registered Patients</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {dashboardStats.opdToday} OPD · {dashboardStats.ipdToday} Inpatients
          </div>
        </div>

        {/* Pending Diagnostics */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('clinical_settings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#06b6d4' }}>{dashboardStats.pendingLab + dashboardStats.pendingRadiology}</div>
            <FlaskConical size={20} style={{ color: '#06b6d4', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Pending Diagnostic Orders</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {dashboardStats.pendingLab} Lab · {dashboardStats.pendingRadiology} Radiology
          </div>
        </div>

        {/* Pharmacy Stock Alerts */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('clinical_settings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#eab308' }}>{dashboardStats.lowStockMedicines}</div>
            <Pill size={20} style={{ color: '#eab308', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Low Stock Medicines</div>
          <div style={{ fontSize: 11, color: '#eab308', marginTop: 4 }}>
            Reorder threshold reached
          </div>
        </div>

        {/* Blood Bank Available */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('clinical_settings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#ef4444' }}>{dashboardStats.availableBloodUnits}</div>
            <Droplet size={20} style={{ color: '#ef4444', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Blood Bank Units Safe</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            8 Blood Groups Tracked
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing_insurance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>₹{dashboardStats.todayRevenue.toLocaleString('en-IN')}</div>
            <DollarSign size={20} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Today's Realized Revenue</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Cash, Cards, UPI & TPA
          </div>
        </div>

        {/* Outstanding AR */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing_insurance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#dc2626' }}>₹{dashboardStats.outstandingBilling.toLocaleString('en-IN')}</div>
            <Activity size={20} style={{ color: '#dc2626', opacity: 0.7 }} />
          </div>
          <div className="stat-label">Outstanding Receivables</div>
          <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
            Aging matrix active
          </div>
        </div>

        {/* Security & Audit */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('audit_logs')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>100%</div>
            <ShieldCheck size={20} style={{ color: '#8b5cf6', opacity: 0.7 }} />
          </div>
          <div className="stat-label">NABH Audit Compliance</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
            Immutable logging active
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* User Roles Pie Chart */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">User Distribution by Role</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('roles_permissions')}>
              View Roles <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Status Breakdown */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Hospital Bed Utilization Breakdown</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('wards_beds')}>
              Configure Beds <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedStatusData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip />
                <Bar dataKey="count" name="Beds" radius={[4, 4, 0, 0]}>
                  {bedStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Launchers */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Administrative Quick Actions</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { title: 'Hospital Profile', desc: 'Identity, statutory codes & branding', icon: Building2, tab: 'hospital_profile' as AdminTab, color: '#059669' },
              { title: 'User & RBAC Permissions', desc: 'Granular access control matrix', icon: ShieldCheck, tab: 'roles_permissions' as AdminTab, color: '#8b5cf6' },
              { title: 'Departments & HODs', desc: 'Clinical & admin departments', icon: Building2, tab: 'departments' as AdminTab, color: '#0284c7' },
              { title: 'Doctor Clinical Tariffs', desc: 'Consultation fees & room setups', icon: Stethoscope, tab: 'doctors' as AdminTab, color: '#10b981' },
              { title: 'Wards & Bed Tariffs', desc: 'Configure ICU, General & Private', icon: BedDouble, tab: 'wards_beds' as AdminTab, color: '#dc2626' },
              { title: 'Billing & Insurance / TPA', desc: 'Service tariffs & corporate accounts', icon: DollarSign, tab: 'billing_insurance' as AdminTab, color: '#ec4899' },
              { title: 'System Security Policies', desc: 'Session timeout & lockout limits', icon: KeyRound, tab: 'system_settings' as AdminTab, color: '#f59e0b' },
              { title: 'Immutable Audit Trail', desc: 'Audit logging & security traces', icon: Activity, tab: 'audit_logs' as AdminTab, color: '#06b6d4' },
            ].map(q => {
              const Icon = q.icon;
              return (
                <div
                  key={q.tab}
                  onClick={() => setActiveTab(q.tab)}
                  style={{
                    padding: '14px',
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = q.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: `${q.color}15`, color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} />
                    </div>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{q.title}</strong>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{q.desc}</p>
                  <div style={{ fontSize: 11, fontWeight: 600, color: q.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open Configuration <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
