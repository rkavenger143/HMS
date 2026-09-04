import React, { useState } from 'react';
import {
  BedDouble, Users, UserPlus, Clock, ArrowRightLeft, ShieldAlert,
  Activity, CheckCircle2, AlertTriangle, Sparkles, ChevronRight,
  Plus, Search, Stethoscope, HeartPulse, FileText, Eye, AlertCircle
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Admission, Bed } from '../../../types';
import BedDetailsModal from './modals/BedDetailsModal';
import TransferModal from './modals/TransferModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Admitted', color: 'var(--color-primary)', bg: 'var(--color-primary-muted)' },
  stable: { label: 'Stable', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  critical: { label: 'Critical / ICU', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  planned_discharge: { label: 'Planned Discharge', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  discharged: { label: 'Discharged', color: 'var(--text-tertiary)', bg: 'var(--bg-surface)' },
  transferred: { label: 'Transferred', color: 'var(--color-ai)', bg: 'var(--color-ai-muted)' },
};

export default function IPDDashboard() {
  const {
    admissions,
    beds,
    kpis,
    setActiveTab,
    setSelectedAdmissionId,
    doctors,
    wards,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 10 KPI Summary Cards Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {/* Total Inpatients */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <span className="badge badge-primary">Active</span>
          </div>
          <div className="stat-value">{kpis.totalInpatients}</div>
          <div className="stat-label">Total Inpatients (IPD)</div>
        </div>

        {/* Today's Admissions */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}>
              <UserPlus size={20} />
            </div>
            <span className="badge badge-info">Today</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.todayAdmissions}</div>
          <div className="stat-label">Today's Admissions</div>
        </div>

        {/* Today's Discharges */}
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

        {/* Available Beds */}
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

        {/* Occupied Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
              <BedDouble size={20} />
            </div>
            <span className="badge badge-danger">{kpis.bedOccupancyRate}% Total</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.occupiedBeds}</div>
          <div className="stat-label">Occupied Beds</div>
        </div>

        {/* Reserved Beds */}
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

        {/* Cleaning Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-info)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}>
              <Sparkles size={20} />
            </div>
            <span className="badge badge-info">Sanitizing</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.cleaningBeds}</div>
          <div className="stat-label">Beds in Cleaning</div>
        </div>

        {/* Maintenance Beds */}
        <div className="stat-card" style={{ '--stat-color': 'var(--text-muted)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
              <AlertTriangle size={20} />
            </div>
            <span className="badge badge-neutral">Repairs</span>
          </div>
          <div className="stat-value">{kpis.maintenanceBeds}</div>
          <div className="stat-label">Maintenance / Blocked</div>
        </div>

        {/* ICU Occupancy Rate */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-danger)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
              <HeartPulse size={20} />
            </div>
            <span className="badge badge-danger">Critical</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.icuOccupancyRate}%</div>
          <div className="stat-label">ICU / HDU Occupancy</div>
        </div>

        {/* General Ward Occupancy Rate */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-ai)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-icon" style={{ background: 'var(--color-ai-muted)', color: 'var(--color-ai)' }}>
              <BedDouble size={20} />
            </div>
            <span className="badge badge-ai">Wards</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-ai)' }}>{kpis.generalWardOccupancyRate}%</div>
          <div className="stat-label">General Ward Occupancy</div>
        </div>
      </div>

      {/* Highlights Bar: Emergency / High Priority / Awaiting Bed Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {/* Emergency Callout */}
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={20} style={{ color: 'var(--color-danger)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-danger)' }}>
                {kpis.highPriorityPatients} High-Priority / Critical Inpatients
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ICU & Emergency beds under continuous cardiac monitoring</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('nursing')}>
            Open Vitals
          </button>
        </div>

        {/* Awaiting Bed / Triage */}
        <div style={{ padding: '12px 16px', background: 'var(--color-warning-muted)', border: '1px solid rgba(255,214,10,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: 'var(--color-warning)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-warning)' }}>
                {kpis.patientsAwaitingBed} Patients Awaiting Bed Allocation
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>OPD/Emergency triage pending ward admission</div>
            </div>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => setActiveTab('admission')}>
            Admit Now
          </button>
        </div>
      </div>

      {/* Main Active Inpatient Roster Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BedDouble size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>Current Inpatient Admissions ({activeAdmissions.length})</div>
              <div className="card-subtitle">Live ward census, bed assignments, and attending consultants</div>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('bed_board')}>
              <BedDouble size={13} /> Live Bed Board
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
              <Plus size={13} /> Admit Patient
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: '16px 20px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
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

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Adm ID / UHID</th>
                  <th>Patient Details</th>
                  <th>Ward & Bed</th>
                  <th>Attending Doctor</th>
                  <th>Admission Date / Stay</th>
                  <th>Primary Diagnosis</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map(adm => {
                    const days = Math.floor((new Date().getTime() - new Date(adm.admissionDate).getTime()) / 86400000) + 1;
                    const isICU = adm.ward.toLowerCase().includes('icu');
                    const isEM = adm.bedNumber.startsWith('EM');

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

                        <td style={{ maxWidth: 200 }}>
                          <div className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {adm.diagnosis.join(', ')}
                          </div>
                        </td>

                        <td>
                          <span className="badge" style={{ background: isICU ? 'var(--color-danger-muted)' : 'var(--color-success-muted)', color: isICU ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            <span className="badge-dot" />
                            {isICU ? 'ICU Care' : 'Admitted'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 10px', fontSize: 11 }}
                              onClick={() => handleOpenProfile(adm.id)}
                            >
                              <Eye size={12} /> View EHR
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="Transfer Bed"
                              onClick={() => setTransferAdmission(adm)}
                            >
                              <ArrowRightLeft size={11} /> Transfer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
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
