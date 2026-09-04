import React, { useState, useMemo } from 'react';
import {
  BedDouble, Plus, Search, Edit3, Building2, CheckCircle2,
  AlertTriangle, DollarSign, Activity, Download, FileSpreadsheet
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Bed, BedStatus, BedType } from '../../../types';
import AddEditBedModal from './modals/AddEditBedModal';

export default function WardBedConfig() {
  const { beds, toggleBedStatus, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        b.bedNumber.toLowerCase().includes(q) ||
        b.ward.toLowerCase().includes(q) ||
        b.roomNumber?.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q);

      const matchWard = wardFilter === 'ALL' || b.ward === wardFilter;
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchSearch && matchWard && matchStatus;
    });
  }, [beds, searchQuery, wardFilter, statusFilter]);

  // Unique wards
  const uniqueWards = useMemo(() => {
    const set = new Set<string>();
    beds.forEach(b => { if (b.ward) set.add(b.ward); });
    return Array.from(set);
  }, [beds]);

  const handleExportCSV = () => {
    const rows = filteredBeds.map(b => [
      b.id,
      b.bedNumber,
      b.ward,
      b.roomNumber || '—',
      b.type.toUpperCase(),
      `₹${b.dailyRate || 1500}`,
      b.status.toUpperCase(),
    ]);

    exportCSV(
      'HMS_Ward_Bed_Infrastructure_Config',
      ['Bed ID', 'Bed Number', 'Ward Name', 'Room #', 'Bed Type', 'Daily Tariff (INR)', 'Current Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Inpatient Wards, Rooms & Bed Configuration</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure building infrastructure, floor plans, bed daily tariffs, and sanitization/maintenance states
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FileSpreadsheet size={13} /> Export CSV
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedBed(null);
                setIsAddEditOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Add Bed Unit
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search bed, ward, room #..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={wardFilter}
              onChange={e => setWardFilter(e.target.value)}
            >
              <option value="ALL">All Hospital Wards ({uniqueWards.length})</option>
              {uniqueWards.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Operational Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning / Sanitizing</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="blocked">Blocked / Reserved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bed Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Hospital Bed Inventory & Tariff Register</span>
          <span className="badge badge-primary">{filteredBeds.length} Beds Configured</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bed Number</th>
                  <th>Ward & Floor</th>
                  <th>Room / Bay</th>
                  <th>Bed Type</th>
                  <th>Daily Tariff</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map(b => {
                  const isOcc = b.status === 'occupied';
                  const isAvail = b.status === 'available';

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 13 }}>
                          {b.bedNumber}
                        </strong>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{b.id}</div>
                      </td>
                      <td>
                        <div><strong>{b.ward}</strong></div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Floor {b.floor || 1}</div>
                      </td>
                      <td>{b.roomNumber || '—'}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {b.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{b.dailyRate || 1500}</strong> / day
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={b.status}
                          onChange={e => toggleBedStatus(b.id, e.target.value as BedStatus)}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            fontWeight: 600,
                            borderRadius: 6,
                            borderColor: isAvail ? '#10b981' : isOcc ? '#ef4444' : '#f59e0b',
                            color: isAvail ? '#059669' : isOcc ? '#dc2626' : '#d97706',
                          }}
                        >
                          <option value="available">AVAILABLE</option>
                          <option value="occupied">OCCUPIED</option>
                          <option value="cleaning">CLEANING</option>
                          <option value="maintenance">MAINTENANCE</option>
                          <option value="blocked">BLOCKED</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Edit Bed"
                          onClick={() => {
                            setSelectedBed(b);
                            setIsAddEditOpen(true);
                          }}
                        >
                          <Edit3 size={13} />
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

      {/* Modal */}
      <AddEditBedModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        bed={selectedBed}
      />
    </div>
  );
}
