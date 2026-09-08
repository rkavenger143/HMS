import React, { useState } from 'react';
import {
  BedDouble, Users, UserPlus, Clock, ArrowRightLeft,
  CheckCircle2, AlertTriangle, Sparkles, Plus, Search,
  Eye, FileText, Layers, TrendingUp, Calendar
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, Bed } from '../../../types';
import BedDetailsModal from './modals/BedDetailsModal';
import TransferModal from './modals/TransferModal';

export default function IPDDashboard() {
  const {
    admissions,
    beds,
    kpis,
    wards,
    setActiveTab,
    setSelectedAdmissionId,
    updateAdmissionReadiness,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [inspectBed, setInspectBed] = useState<Bed | null>(null);
  const [transferAdmission, setTransferAdmission] = useState<Admission | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredAdmissions = activeAdmissions.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.bedNumber.toLowerCase().includes(q) ||
      a.admittingDoctorName.toLowerCase().includes(q);

    const matchWard = !wardFilter || a.ward === wardFilter;
    return matchSearch && matchWard;
  });

  const handleOpenProfile = (admissionId: string) => {
    setSelectedAdmissionId(admissionId);
    setActiveTab('inpatient_profile');
  };

  const handleDischargePatient = (admissionId: string) => {
    setSelectedAdmissionId(admissionId);
    setActiveTab('discharge');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Exact 8 Essential KPI Stat Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {/* 1. Total Admitted Patients */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
              <Users size={20} />
            </div>
            <span className="badge badge-primary">Active</span>
          </div>
          <div className="stat-value">{kpis.totalInpatients}</div>
          <div className="stat-label">Total Admitted Patients</div>
        </div>

        {/* 2. Available Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}>
              <BedDouble size={20} />
            </div>
            <span className="badge badge-success">Ready</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.availableBeds}</div>
          <div className="stat-label">Available Vacant Beds</div>
        </div>

        {/* 3. Occupied Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
              <BedDouble size={20} />
            </div>
            <span className="badge badge-danger">{kpis.bedOccupancyRate}%</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.occupiedBeds}</div>
          <div className="stat-label">Occupied Beds</div>
        </div>

        {/* 4. Reserved Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-warning)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
              <Clock size={20} />
            </div>
            <span className="badge badge-warning">Hold</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.reservedBeds}</div>
          <div className="stat-label">Reserved Beds</div>
        </div>

        {/* 5. Beds Under Cleaning */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}>
              <Sparkles size={20} />
            </div>
            <span className="badge badge-info">Sanitizing</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.cleaningBeds}</div>
          <div className="stat-label">Beds Under Cleaning</div>
        </div>

        {/* 6. Beds Under Maintenance */}
        <div className="stat-card" style={{ '--stat-color': 'var(--text-muted)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
              <AlertTriangle size={20} />
            </div>
            <span className="badge badge-neutral">Repairs</span>
          </div>
          <div className="stat-value">{kpis.maintenanceBeds}</div>
          <div className="stat-label">Beds Under Maintenance</div>
        </div>

        {/* 7. Today's Admissions */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
              <UserPlus size={20} />
            </div>
            <span className="badge badge-primary">Today</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.todayAdmissions}</div>
          <div className="stat-label">Today's Admissions</div>
        </div>

        {/* 8. Today's Discharges */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-success)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-success-muted)', color: 'var(--color-success)' }}>
              <CheckCircle2 size={20} />
            </div>
            <span className="badge badge-success">Done</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.todayDischarges}</div>
          <div className="stat-label">Today's Discharges</div>
        </div>
      </div>

      {/* 2 Clean Informative Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* Chart 1: Ward-Wise Bed Availability & Occupancy */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Ward-wise Bed Occupancy & Availability</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Capacity census across clinical wards</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('beds')} style={{ fontSize: 12 }}>
              View All Beds ›
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wards.map(ward => {
              const wardBeds = beds.filter(b => b.wardId === ward.id || b.ward === ward.name);
              const occ = wardBeds.filter(b => b.status === 'occupied').length;
              const avail = wardBeds.filter(b => b.status === 'available').length;
              const total = wardBeds.length || ward.totalBeds;
              const pct = total > 0 ? Math.round((occ / total) * 100) : 0;

              return (
                <div key={ward.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{ward.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--color-danger)' }}>{occ}</strong> occ / <strong style={{ color: 'var(--color-success)' }}>{avail}</strong> free ({pct}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: 7, background: 'var(--border-default)', borderRadius: 4 }}>
                    <div
                      className={`progress-bar ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'success'}`}
                      style={{ width: `${pct}%`, borderRadius: 4 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Bed Status Distribution */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Live Hospital Bed Status Distribution</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Operational Beds: {beds.length}</div>
              </div>
            </div>
            <span className="badge badge-primary">{kpis.bedOccupancyRate}% Occupancy</span>
          </div>

          {/* Visual Proportion Bar */}
          <div style={{ display: 'flex', height: 14, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: `${(kpis.occupiedBeds / beds.length) * 100}%`, background: 'var(--color-danger)' }} title={`Occupied: ${kpis.occupiedBeds}`} />
            <div style={{ width: `${(kpis.availableBeds / beds.length) * 100}%`, background: 'var(--color-success)' }} title={`Available: ${kpis.availableBeds}`} />
            <div style={{ width: `${(kpis.cleaningBeds / beds.length) * 100}%`, background: 'var(--color-info)' }} title={`Cleaning: ${kpis.cleaningBeds}`} />
            <div style={{ width: `${(kpis.reservedBeds / beds.length) * 100}%`, background: 'var(--color-warning)' }} title={`Reserved: ${kpis.reservedBeds}`} />
            <div style={{ width: `${(kpis.maintenanceBeds / beds.length) * 100}%`, background: 'var(--text-muted)' }} title={`Maintenance: ${kpis.maintenanceBeds}`} />
          </div>

          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12 }}>
            <div style={{ padding: '8px 10px', background: 'var(--color-success-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                Available Vacant
              </span>
              <strong>{kpis.availableBeds}</strong>
            </div>

            <div style={{ padding: '8px 10px', background: 'var(--color-danger-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                Occupied
              </span>
              <strong>{kpis.occupiedBeds}</strong>
            </div>

            <div style={{ padding: '8px 10px', background: 'var(--color-info-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-info)' }} />
                Under Cleaning
              </span>
              <strong>{kpis.cleaningBeds}</strong>
            </div>

            <div style={{ padding: '8px 10px', background: 'var(--color-warning-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />
                Reserved / Hold
              </span>
              <strong>{kpis.reservedBeds}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Active Inpatient Roster */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>Current Admitted Patients ({activeAdmissions.length})</div>
              <div className="card-subtitle">Live inpatient admission tracking, condition, and expected discharge</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('beds')}>
              <BedDouble size={13} /> Live Bed Board
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
              <Plus size={13} /> Admit Patient
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: '16px 20px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient, UHID, bed, doctor..."
                style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ height: 36, fontSize: 13 }}
                value={wardFilter}
                onChange={e => setWardFilter(e.target.value)}
              >
                <option value="">All Wards & Units</option>
                {wards.map(w => (
                  <option key={w.id} value={w.name}>{w.name} (Floor {w.floor})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Adm ID / UHID</th>
                  <th>Patient Details</th>
                  <th>Ward & Bed</th>
                  <th>Attending Doctor</th>
                  <th>Admitted / Stay</th>
                  <th>Expected Discharge</th>
                  <th>Condition & Priority</th>
                  <th>Readiness</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map(adm => {
                    const days = Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000) + 1;
                    const isICU = adm.ward.toLowerCase().includes('icu');
                    const isEM = adm.bedNumber.startsWith('EM');

                    const isCritical = adm.condition === 'critical' || isICU;
                    const isImproving = adm.condition === 'improving';

                    return (
                      <tr key={adm.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>{adm.id}</div>
                          <div className="patient-id" style={{ fontSize: 10, marginTop: 2 }}>{adm.patientId}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{adm.patientName}</div>
                          {adm.mlc && <span className="badge badge-danger" style={{ fontSize: 9, marginTop: 2 }}>MLC CASE</span>}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`badge ${isICU ? 'badge-danger' : isEM ? 'badge-warning' : 'badge-primary'}`} style={{ fontWeight: 800, fontSize: 12 }}>
                              {adm.bedNumber}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{adm.ward}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{adm.admittingDoctorName}</div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{adm.admissionDate}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                            Day {days} ({days}d)
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
                            {adm.expectedDischargeDate || '2026-09-04'}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span
                              className="badge"
                              style={{
                                background: isCritical ? 'var(--color-danger-muted)' : isImproving ? 'var(--color-success-muted)' : 'var(--color-primary-muted)',
                                color: isCritical ? 'var(--color-danger)' : isImproving ? 'var(--color-success)' : 'var(--color-primary)',
                                textTransform: 'capitalize',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              <span className="badge-dot" />
                              {adm.condition || 'Stable'}
                            </span>
                            {adm.priority && adm.priority !== 'routine' && (
                              <span className={`badge ${adm.priority === 'emergency' || adm.priority === 'critical' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 9, padding: '1px 5px' }}>
                                {adm.priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <select
                            className="form-select"
                            style={{ height: 28, fontSize: 11, padding: '2px 6px' }}
                            value={adm.dischargeReadiness || 'under_treatment'}
                            onChange={e => updateAdmissionReadiness(adm.id, e.target.value as any)}
                          >
                            <option value="under_treatment">Under Treatment</option>
                            <option value="planned_discharge">Planned Discharge</option>
                            <option value="medically_cleared">Medically Cleared</option>
                            <option value="ready_for_discharge">Ready for Bed Release</option>
                          </select>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 10px', fontSize: 11 }}
                              onClick={() => handleOpenProfile(adm.id)}
                            >
                              <Eye size={12} /> EHR
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="Transfer Bed"
                              onClick={() => setTransferAdmission(adm)}
                            >
                              <ArrowRightLeft size={11} /> Transfer
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11, color: 'var(--color-success)' }}
                              title="Discharge"
                              onClick={() => handleDischargePatient(adm.id)}
                            >
                              <CheckCircle2 size={11} /> Discharge
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-state-icon"><BedDouble size={28} /></div>
                        <div className="empty-state-title">No Inpatient Admissions Found</div>
                        <div className="empty-state-desc">Try changing filters or admit a new patient.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bed Transfer Modal */}
      {transferAdmission && (
        <TransferModal
          admission={transferAdmission}
          onClose={() => setTransferAdmission(null)}
        />
      )}

      {/* Bed Details Modal */}
      {inspectBed && (
        <BedDetailsModal
          bed={inspectBed}
          onClose={() => setInspectBed(null)}
        />
      )}
    </div>
  );
}
