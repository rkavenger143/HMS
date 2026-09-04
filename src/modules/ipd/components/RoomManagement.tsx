import React, { useState } from 'react';
import {
  Building2, Plus, BedDouble, Layers, Search, Filter,
  CheckCircle2, AlertCircle, Edit3, ShieldCheck
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';

export default function RoomManagement() {
  const { beds, wards } = useIPD();
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Group beds by room
  const roomsMap: Record<string, { roomNumber: string; ward: string; floor: number; beds: typeof beds }> = {};

  beds.forEach(b => {
    const key = `${b.ward}_${b.roomNumber}`;
    if (!roomsMap[key]) {
      roomsMap[key] = {
        roomNumber: b.roomNumber,
        ward: b.ward,
        floor: b.floor || 1,
        beds: [],
      };
    }
    roomsMap[key].beds.push(b);
  });

  const roomsList = Object.values(roomsMap).filter(r => {
    const matchSearch = !search || r.roomNumber.includes(search) || r.ward.toLowerCase().includes(search.toLowerCase());
    const matchWard = !selectedWard || r.ward === selectedWard;
    return matchSearch && matchWard;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
            Inpatient Rooms & Suite Units Management
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Room configuration, private/deluxe suite tariffs, oxygen outlets, and attached bathroom amenities
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> + Add Room
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Room # or Ward..."
            style={{ paddingLeft: 30, height: 34, fontSize: 13 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-select"
            style={{ height: 34, fontSize: 13 }}
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
          >
            <option value="">All Clinical Wards</option>
            {wards.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Ward & Location</th>
                <th>Floor</th>
                <th>Total Beds</th>
                <th>Available Beds</th>
                <th>Occupied Beds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roomsList.map((rm, i) => {
                const total = rm.beds.length;
                const occupied = rm.beds.filter(b => b.status === 'occupied').length;
                const available = rm.beds.filter(b => b.status === 'available').length;

                return (
                  <tr key={i}>
                    <td>
                      <strong style={{ fontSize: 14, color: 'var(--color-primary)' }}>Room {rm.roomNumber}</strong>
                    </td>
                    <td>
                      <div><strong>{rm.ward}</strong></div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Building A · Wing North</div>
                    </td>
                    <td>Floor {rm.floor}</td>
                    <td><strong>{total}</strong> beds</td>
                    <td><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{available}</span></td>
                    <td><span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{occupied}</span></td>
                    <td>
                      <span className={`badge ${available > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {available > 0 ? `${available} Vacant` : 'Full'}
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
  );
}
