import React, { useState } from 'react';
import {
  BedDouble, Search, Filter, Building2, Layers, CheckCircle2,
  Sparkles, AlertTriangle, Clock, ArrowRightLeft, User, Eye, Plus
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

export default function BedManagement() {
  const {
    beds,
    wards,
    admissions,
    setActiveTab,
    setSelectedAdmissionId,
    updateBedStatus,
    markBedCleaned,
  } = useIPD();

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('');
  const [wardFilter, setWardFilter] = useState('');
  const [bedTypeFilter, setBedTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'available' | 'occupied' | 'cleaning'>('all');

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
      (quickFilter === 'cleaning' && b.status === 'cleaning');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Bed Hierarchy & Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Building → Floor → Ward → Room → Bed hierarchy and status monitoring
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Quick Filter Pill Tabs */}
          <div className="tabs">
            <button className={`tab ${quickFilter === 'all' ? 'active' : ''}`} onClick={() => setQuickFilter('all')}>
              All ({beds.length})
            </button>
            <button className={`tab ${quickFilter === 'available' ? 'active' : ''}`} onClick={() => setQuickFilter('available')}>
              Available ({beds.filter(b => b.status === 'available').length})
            </button>
            <button className={`tab ${quickFilter === 'occupied' ? 'active' : ''}`} onClick={() => setQuickFilter('occupied')}>
              Occupied ({beds.filter(b => b.status === 'occupied').length})
            </button>
            <button className={`tab ${quickFilter === 'cleaning' ? 'active' : ''}`} onClick={() => setQuickFilter('cleaning')}>
              Cleaning ({beds.filter(b => b.status === 'cleaning').length})
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
            <Plus size={14} /> Admit Patient
          </button>
        </div>
      </div>

      {/* Hierarchy Search & Multi-Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Bed #, Room, Patient, UHID, Doctor..."
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

          {/* Floor */}
          <div>
            <select
              className="form-select"
              style={{ height: 36, fontSize: 13 }}
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
            >
              <option value="">All Floors</option>
              <option value="0">Ground Floor (ER/Triage)</option>
              <option value="1">1st Floor (General Wards)</option>
              <option value="2">2nd Floor (Private Wards)</option>
              <option value="3">3rd Floor (ICU/HDU)</option>
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
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filteredBeds.map(bed => {
          const sc = STATUS_CONFIG[bed.status] || STATUS_CONFIG.available;
          const isOccupied = bed.status === 'occupied';

          return (
            <div
              key={bed.id}
              className="card"
              onClick={() => handleBedClick(bed)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                borderLeft: `4px solid ${sc.color}`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Top Row: Bed # and Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BedDouble size={18} style={{ color: sc.color }} />
                  <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)' }}>{bed.bedNumber}</span>
                </div>
                <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 10 }}>
                  <span className="badge-dot" />
                  {sc.label}
                </span>
              </div>

              {/* Ward & Hierarchy Info */}
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                {bed.building || 'Building A'} · Floor {bed.floor} · {bed.ward} {bed.roomNumber && `· Room ${bed.roomNumber}`}
              </div>

              {/* Inpatient Occupant Snapshot if Occupied */}
              {isOccupied ? (
                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 12 }}>
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
                  ✨ Bed undergoing post-discharge sanitization
                </div>
              ) : (
                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 10, fontSize: 11, color: 'var(--color-success)' }}>
                  ✓ Ready for immediate inpatient admission
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
                      style={{ padding: '2px 6px', fontSize: 10 }}
                      onClick={e => { e.stopPropagation(); markBedCleaned(bed.id); }}
                    >
                      Mark Cleaned
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

      {/* Bed Details Modal */}
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
