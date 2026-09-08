import React, { useState } from 'react';
import {
  BedDouble, Search, Filter, Building2, Layers, CheckCircle2,
  Sparkles, AlertTriangle, Clock, ArrowRightLeft, User, Eye, Plus,
  Grid, Table as TableIcon, LayoutDashboard, Wrench, Shield, Check
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Bed, BedStatus, BedType } from '../../../types';
import BedDetailsModal from './modals/BedDetailsModal';
import TransferModal from './modals/TransferModal';

const STATUS_CONFIG: Record<BedStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  occupied: { label: 'Occupied', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  reserved: { label: 'Reserved', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  cleaning: { label: 'Cleaning', color: 'var(--color-info)', bg: 'var(--color-info-muted)' },
  maintenance: { label: 'Maintenance', color: 'var(--text-muted)', bg: 'var(--bg-surface)' },
  blocked: { label: 'Blocked', color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
};

type ViewMode = 'grid' | 'table' | 'matrix';

export default function BedManagement() {
  const {
    beds,
    wards,
    admissions,
    setActiveTab,
    setSelectedAdmissionId,
    updateBedStatus,
    markBedCleaned,
    reserveBed,
    releaseBed,
    setBedMaintenance,
  } = useIPD();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('');
  const [wardFilter, setWardFilter] = useState('');
  const [bedTypeFilter, setBedTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved'>('all');

  // Modals
  const [selectedInspectBed, setSelectedInspectBed] = useState<Bed | null>(null);
  const [transferAdmission, setTransferAdmission] = useState<any | null>(null);

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.bedNumber.toLowerCase().includes(q) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(q)) ||
      b.ward.toLowerCase().includes(q) ||
      (b.currentPatientName && b.currentPatientName.toLowerCase().includes(q)) ||
      (b.currentPatientId && b.currentPatientId.toLowerCase().includes(q)) ||
      (b.admittingDoctorName && b.admittingDoctorName.toLowerCase().includes(q));

    const matchBuilding = !buildingFilter || b.building === buildingFilter;
    const matchFloor = floorFilter === '' || b.floor.toString() === floorFilter;
    const matchWard = !wardFilter || b.ward === wardFilter;
    const matchType = !bedTypeFilter || b.type === bedTypeFilter;
    const matchStatus = !statusFilter || b.status === statusFilter;

    const matchQuick =
      quickFilter === 'all' ||
      (quickFilter === 'available' && b.status === 'available') ||
      (quickFilter === 'occupied' && b.status === 'occupied') ||
      (quickFilter === 'cleaning' && b.status === 'cleaning') ||
      (quickFilter === 'maintenance' && b.status === 'maintenance') ||
      (quickFilter === 'reserved' && b.status === 'reserved');

    return matchSearch && matchBuilding && matchFloor && matchWard && matchType && matchStatus && matchQuick;
  });

  const handleBedClick = (bed: Bed) => {
    setSelectedInspectBed(bed);
  };

  const handleTransfer = (bed: Bed) => {
    if (bed.currentAdmissionId) {
      const adm = admissions.find(a => a.id === bed.currentAdmissionId);
      if (adm) setTransferAdmission(adm);
    }
  };

  const handleViewEHR = (admissionId: string) => {
    setSelectedAdmissionId(admissionId);
    setActiveTab('inpatient_profile');
  };

  // Group beds by Ward for Grid display
  const wardNames = Array.from(new Set(beds.map(b => b.ward)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Bed Management & Live Allocation Board</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Real-time bed layout, sanitization cycle, reservation, and ward occupancy
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Mode Switcher */}
          <div className="tabs" style={{ background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-sm)' }}>
            <button
              className={`tab ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={13} /> Visual Map
            </button>
            <button
              className={`tab ${viewMode === 'table' ? 'active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={13} /> Detailed Table
            </button>
            <button
              className={`tab ${viewMode === 'matrix' ? 'active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setViewMode('matrix')}
            >
              <LayoutDashboard size={13} /> Ward Matrix
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
            <Plus size={14} /> Admit Patient
          </button>
        </div>
      </div>

      {/* Quick Status Pill Bar */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${quickFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setQuickFilter('all')}
          >
            All Beds ({beds.length})
          </button>
          <button
            className={`btn btn-sm ${quickFilter === 'available' ? 'btn-success' : 'btn-ghost'}`}
            onClick={() => setQuickFilter('available')}
          >
            ● Available ({beds.filter(b => b.status === 'available').length})
          </button>
          <button
            className={`btn btn-sm ${quickFilter === 'occupied' ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => setQuickFilter('occupied')}
          >
            ● Occupied ({beds.filter(b => b.status === 'occupied').length})
          </button>
          <button
            className={`btn btn-sm ${quickFilter === 'cleaning' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ color: quickFilter === 'cleaning' ? undefined : 'var(--color-info)' }}
            onClick={() => setQuickFilter('cleaning')}
          >
            ✨ Cleaning ({beds.filter(b => b.status === 'cleaning').length})
          </button>
          <button
            className={`btn btn-sm ${quickFilter === 'reserved' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ color: quickFilter === 'reserved' ? undefined : 'var(--color-warning)' }}
            onClick={() => setQuickFilter('reserved')}
          >
            🔒 Reserved ({beds.filter(b => b.status === 'reserved').length})
          </button>
          <button
            className={`btn btn-sm ${quickFilter === 'maintenance' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setQuickFilter('maintenance')}
          >
            🔧 Maintenance ({beds.filter(b => b.status === 'maintenance').length})
          </button>
        </div>

        {beds.filter(b => b.status === 'cleaning').length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Sparkles size={14} /> {beds.filter(b => b.status === 'cleaning').length} bed(s) pending housekeeping clearance
          </div>
        )}
      </div>

      {/* Multi-Filter Search Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Bed #, Room, Ward, Patient, Doctor..."
              style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Building */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={buildingFilter}
              onChange={e => setBuildingFilter(e.target.value)}
            >
              <option value="">All Buildings</option>
              <option value="Building A">Building A (Main Block)</option>
              <option value="Building B">Building B (Critical Care)</option>
            </select>
          </div>

          {/* Ward */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={wardFilter}
              onChange={e => setWardFilter(e.target.value)}
            >
              <option value="">All Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Bed Type */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={bedTypeFilter}
              onChange={e => setBedTypeFilter(e.target.value)}
            >
              <option value="">All Bed Types</option>
              <option value="general">General Ward</option>
              <option value="semi_private">Semi-Private</option>
              <option value="private">Private Room</option>
              <option value="icu">ICU</option>
              <option value="hdu">HDU</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: Visual Bed Map */}
      {viewMode === 'grid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {wardNames
            .filter(wName => !wardFilter || wName === wardFilter)
            .map(wName => {
              const wardBeds = filteredBeds.filter(b => b.ward === wName);
              if (wardBeds.length === 0) return null;

              const availCount = wardBeds.filter(b => b.status === 'available').length;
              const occCount = wardBeds.filter(b => b.status === 'occupied').length;
              const cleanCount = wardBeds.filter(b => b.status === 'cleaning').length;

              return (
                <div key={wName} className="card">
                  <div className="card-header" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                      <span className="card-title">{wName}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({wardBeds.length} Beds)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                      <span className="badge badge-success">{availCount} Available</span>
                      <span className="badge badge-danger">{occCount} Occupied</span>
                      {cleanCount > 0 && <span className="badge badge-info">{cleanCount} Cleaning</span>}
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {wardBeds.map(bed => {
                        const sc = STATUS_CONFIG[bed.status] || STATUS_CONFIG.available;
                        const isOccupied = bed.status === 'occupied';

                        return (
                          <div
                            key={bed.id}
                            className="card"
                            onClick={() => handleBedClick(bed)}
                            style={{
                              padding: '14px',
                              cursor: 'pointer',
                              borderLeft: `4px solid ${sc.color}`,
                              background: 'var(--bg-surface)',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                          >
                            {/* Top Row: Bed # and Status Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BedDouble size={17} style={{ color: sc.color }} />
                                <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-primary)' }}>{bed.bedNumber}</span>
                              </div>
                              <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 10 }}>
                                <span className="badge-dot" />
                                {sc.label}
                              </span>
                            </div>

                            {/* Ward & Hierarchy Info */}
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                              {bed.building || 'Building A'} · Fl {bed.floor} {bed.roomNumber && `· Rm ${bed.roomNumber}`} · <span style={{ textTransform: 'capitalize' }}>{bed.type}</span>
                            </div>

                            {/* Inpatient Occupant Snapshot if Occupied */}
                            {isOccupied ? (
                              <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 12, border: '1px solid var(--border-muted)' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{bed.currentPatientName}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                  UHID: {bed.currentPatientId} · {bed.admittingDoctorName}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                                  Admitted: {bed.admissionDate}
                                </div>
                              </div>
                            ) : bed.status === 'cleaning' ? (
                              <div style={{ padding: '8px 10px', background: 'var(--color-info-muted)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 11, color: 'var(--color-info)' }}>
                                ✨ Post-discharge sanitization underway
                              </div>
                            ) : bed.status === 'reserved' ? (
                              <div style={{ padding: '8px 10px', background: 'var(--color-warning-muted)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 11, color: 'var(--color-warning)' }}>
                                🔒 Bed reserved for incoming admission
                              </div>
                            ) : bed.status === 'maintenance' ? (
                              <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                                🔧 Under maintenance / biomedical inspection
                              </div>
                            ) : (
                              <div style={{ padding: '8px 10px', background: 'var(--color-success-muted)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 11, color: 'var(--color-success)' }}>
                                ✓ Ready for immediate admission
                              </div>
                            )}

                            {/* Bottom Row: Tariff & Quick Action */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-muted)', paddingTop: 8, fontSize: 11 }}>
                              <div>
                                <span style={{ color: 'var(--text-tertiary)' }}>Tariff: </span>
                                <strong style={{ color: 'var(--color-success)' }}>₹{bed.dailyRate}/d</strong>
                              </div>

                              <div style={{ display: 'flex', gap: 4 }}>
                                {bed.status === 'cleaning' && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    style={{ padding: '2px 8px', fontSize: 10 }}
                                    onClick={e => { e.stopPropagation(); markBedCleaned(bed.id); }}
                                    title="Mark Bed Sanitized and Ready"
                                  >
                                    <Check size={11} /> Mark Ready
                                  </button>
                                )}
                                {bed.status === 'available' && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '2px 8px', fontSize: 10 }}
                                    onClick={e => { e.stopPropagation(); setActiveTab('admission'); }}
                                  >
                                    Admit
                                  </button>
                                )}
                                {isOccupied && (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '2px 6px', fontSize: 10 }}
                                    onClick={e => { e.stopPropagation(); handleTransfer(bed); }}
                                  >
                                    Transfer
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW 2: Detailed Bed Table */}
      {viewMode === 'table' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bed Number</th>
                    <th>Ward & Floor</th>
                    <th>Room #</th>
                    <th>Bed Type</th>
                    <th>Status</th>
                    <th>Current Inpatient</th>
                    <th>Attending Doctor</th>
                    <th>Daily Tariff</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeds.length > 0 ? (
                    filteredBeds.map(bed => {
                      const sc = STATUS_CONFIG[bed.status] || STATUS_CONFIG.available;

                      return (
                        <tr key={bed.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <BedDouble size={16} style={{ color: sc.color }} />
                              <strong style={{ fontSize: 14 }}>{bed.bedNumber}</strong>
                            </div>
                          </td>
                          <td>
                            <div>{bed.ward}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{bed.building || 'Building A'} · Floor {bed.floor}</div>
                          </td>
                          <td>{bed.roomNumber || '—'}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className="badge badge-neutral" style={{ fontSize: 11 }}>{bed.type}</span>
                          </td>
                          <td>
                            <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 11 }}>
                              <span className="badge-dot" />
                              {sc.label}
                            </span>
                          </td>
                          <td>
                            {bed.currentPatientName ? (
                              <div>
                                <div style={{ fontWeight: 700 }}>{bed.currentPatientName}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{bed.currentPatientId}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>
                            )}
                          </td>
                          <td>{bed.admittingDoctorName || '—'}</td>
                          <td>
                            <strong style={{ color: 'var(--color-success)' }}>₹{bed.dailyRate}</strong>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>/day</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => handleBedClick(bed)}
                              >
                                Inspect
                              </button>

                              {bed.status === 'cleaning' && (
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '3px 8px', fontSize: 11 }}
                                  onClick={() => markBedCleaned(bed.id)}
                                >
                                  Ready
                                </button>
                              )}

                              {bed.status === 'occupied' && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 8px', fontSize: 11 }}
                                  onClick={() => handleTransfer(bed)}
                                >
                                  Transfer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-state" style={{ padding: '30px' }}>
                          <div className="empty-state-icon"><BedDouble size={28} /></div>
                          <div className="empty-state-title">No Beds Found</div>
                          <div className="empty-state-desc">Try clearing your filters or search term.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Ward & Room Availability Matrix */}
      {viewMode === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Hospital Ward Capacity & Availability Matrix</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ward Name</th>
                      <th>Total Beds</th>
                      <th>Available</th>
                      <th>Occupied</th>
                      <th>Cleaning</th>
                      <th>Reserved / Maint.</th>
                      <th>Occupancy %</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map(ward => {
                      const wardBeds = beds.filter(b => b.ward === ward.name);
                      const total = wardBeds.length;
                      const avail = wardBeds.filter(b => b.status === 'available').length;
                      const occ = wardBeds.filter(b => b.status === 'occupied').length;
                      const clean = wardBeds.filter(b => b.status === 'cleaning').length;
                      const other = total - avail - occ - clean;
                      const occPct = total > 0 ? Math.round((occ / total) * 100) : 0;

                      return (
                        <tr key={ward.id}>
                          <td>
                            <strong style={{ fontSize: 14 }}>{ward.name}</strong>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ward.type.toUpperCase()} · In-charge: {ward.inchargeName || 'Staff In-charge'}</div>
                          </td>
                          <td><strong>{total}</strong></td>
                          <td>
                            <span className="badge badge-success" style={{ fontWeight: 800 }}>{avail} Beds</span>
                          </td>
                          <td>
                            <span className="badge badge-danger" style={{ fontWeight: 800 }}>{occ} Beds</span>
                          </td>
                          <td>
                            <span className="badge badge-info">{clean} Beds</span>
                          </td>
                          <td>
                            <span className="badge badge-neutral">{other} Beds</span>
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress" style={{ flex: 1, height: 6 }}>
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${occPct}%`,
                                    background: occPct > 85 ? 'var(--color-danger)' : occPct > 60 ? 'var(--color-warning)' : 'var(--color-success)',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700 }}>{occPct}%</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setWardFilter(ward.name);
                                setViewMode('grid');
                              }}
                            >
                              View Beds
                            </button>
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
      )}

      {/* Bed Details Inspection Modal */}
      {selectedInspectBed && (
        <BedDetailsModal
          bed={selectedInspectBed}
          onClose={() => setSelectedInspectBed(null)}
          onTransfer={bed => handleTransfer(bed)}
          onAdmit={() => setActiveTab('admission')}
          onViewProfile={admId => handleViewEHR(admId)}
        />
      )}

      {/* Bed Transfer Modal */}
      {transferAdmission && (
        <TransferModal
          admission={transferAdmission}
          onClose={() => setTransferAdmission(null)}
        />
      )}
    </div>
  );
}
