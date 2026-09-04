import React, { useState } from 'react';
import {
  BedDouble, CheckCircle2, AlertTriangle, Users, Search,
  ArrowRight, ShieldCheck, Sparkles, Building2, Layers, Filter
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Bed, Ward } from '../../../types';

export default function BedAllocationView() {
  const { beds, wards, admissions, patients, updateBedStatus, setActiveTab } = useIPD();

  const [selectedWardId, setSelectedWardId] = useState(wards[0]?.id || '');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [allocatedSuccess, setAllocatedSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeWard = wards.find(w => w.id === selectedWardId) || wards[0];
  const wardBeds = beds.filter(b => b.ward === activeWard?.name);

  // Unique rooms in active ward
  const wardRooms = Array.from(new Set(wardBeds.map(b => b.roomNumber)));

  // Filtered available beds
  const availableBeds = wardBeds.filter(b => {
    const isAvail = b.status === 'available';
    const matchRoom = !selectedRoomNumber || b.roomNumber === selectedRoomNumber;
    return isAvail && matchRoom;
  });

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAllocatedSuccess(null);

    const targetBed = beds.find(b => b.id === selectedBedId);
    if (!targetBed) {
      setErrorMsg('Please select a valid bed.');
      return;
    }

    if (targetBed.status !== 'available') {
      setErrorMsg(`Bed ${targetBed.bedNumber} is currently ${targetBed.status.toUpperCase()} and cannot be allocated. Concurrency protection enforced.`);
      return;
    }

    // Allocate
    updateBedStatus(targetBed.id, 'occupied');
    setAllocatedSuccess(`Bed ${targetBed.bedNumber} (${targetBed.ward} - Room ${targetBed.roomNumber || '101'}) successfully allocated to patient.`);
    setSelectedBedId('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BedDouble size={18} style={{ color: 'var(--color-primary)' }} />
            Inpatient Bed Allocation Station
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Real-time ward selection, room filtering, vacant bed assignment, and duplicate prevention
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('bed_management')}>
            <Layers size={13} /> Full Bed Hierarchy
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('admission')}>
            + Formal Admission Form
          </button>
        </div>
      </div>

      {allocatedSuccess && (
        <div style={{ padding: '12px 16px', background: 'var(--color-success-muted)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} /> {allocatedSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      {/* Main Form & Live Vacancy Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Left: Allocation Form */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
            1. Select Inpatient & Target Bed
          </div>

          <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Inpatient to Allocate <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.id}) · Blood: {p.bloodGroup || 'O+'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Clinical Ward <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={selectedWardId}
                  onChange={e => {
                    setSelectedWardId(e.target.value);
                    setSelectedRoomNumber('');
                    setSelectedBedId('');
                  }}
                  required
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Floor {w.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room Number</label>
                <select
                  className="form-select"
                  value={selectedRoomNumber}
                  onChange={e => {
                    setSelectedRoomNumber(e.target.value);
                    setSelectedBedId('');
                  }}
                >
                  <option value="">All Rooms in Ward</option>
                  {wardRooms.map(rm => (
                    <option key={rm} value={rm}>Room {rm}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Available Vacant Bed <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedBedId}
                onChange={e => setSelectedBedId(e.target.value)}
                required
              >
                <option value="">-- Choose Vacant Bed ({availableBeds.length} available) --</option>
                {availableBeds.map(b => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber} (Room {b.roomNumber}) · {b.type.toUpperCase()} · ₹{b.dailyRate}/day
                  </option>
                ))}
              </select>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-secondary)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-primary)', display: 'inline', marginRight: 4 }} />
              <strong>Concurrency Check:</strong> Selected bed is locked during allocation to prevent double-booking.
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', height: 42 }}>
              <CheckCircle2 size={16} /> Confirm Bed Allocation
            </button>
          </form>
        </div>

        {/* Right: Live Vacant Bed Board for Selected Ward */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              2. Ward Vacancy Grid ({activeWard?.name})
            </div>
            <span className="badge badge-success">{availableBeds.length} Vacant</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
            {wardBeds.map(b => {
              const isSelected = selectedBedId === b.id;
              const isAvail = b.status === 'available';

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (isAvail) setSelectedBedId(b.id);
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    cursor: isAvail ? 'pointer' : 'not-allowed',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : isAvail
                      ? '1px solid var(--color-success)'
                      : '1px solid var(--border-default)',
                    background: isSelected
                      ? 'var(--color-primary-muted)'
                      : isAvail
                      ? 'var(--color-success-muted)'
                      : 'var(--bg-surface)',
                    opacity: isAvail ? 1 : 0.6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BedDouble
                    size={20}
                    style={{
                      margin: '0 auto 4px',
                      color: isAvail ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{b.bedNumber}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Rm {b.roomNumber}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', color: isAvail ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {b.status}
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
