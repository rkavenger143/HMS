import React, { useState } from 'react';
import {
  Building2, Plus, BedDouble, Users, Layers, Search, Filter,
  CheckCircle2, AlertCircle, Edit3
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Ward } from '../../../types';

export default function WardManagement() {
  const { wards, beds, admissions } = useIPD();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWards = wards.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
            Hospital Clinical Wards & Wings Directory
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Configure hospital buildings, floor wings, capacity quotas, nurse-in-charge assignments, and tariffs
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> + Add Clinical Ward
          </button>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filteredWards.map(ward => {
          const wardBedsList = beds.filter(b => b.ward === ward.name);
          const occupiedCount = wardBedsList.filter(b => b.status === 'occupied').length;
          const availableCount = wardBedsList.filter(b => b.status === 'available').length;
          const occupancyRate = wardBedsList.length > 0
            ? Math.round((occupiedCount / wardBedsList.length) * 100)
            : 0;

          return (
            <div key={ward.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{ward.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Main Clinical Block · Floor {ward.floor}
                  </div>
                </div>
                <span className={`badge ${occupancyRate > 80 ? 'badge-danger' : occupancyRate > 50 ? 'badge-warning' : 'badge-success'}`}>
                  {occupancyRate}% Occupied
                </span>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span>{occupiedCount} Occupied</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{availableCount} Vacant</span>
                  <span>{wardBedsList.length || ward.totalBeds} Total</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className={`progress-bar ${occupancyRate > 80 ? 'danger' : occupancyRate > 50 ? 'warning' : 'success'}`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Meta details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
                <div><strong>Ward Type:</strong> <span style={{ textTransform: 'capitalize' }}>{ward.type}</span></div>
                <div><strong>Nurse Incharge:</strong> {ward.inchargeName || 'Sister in charge'}</div>
                <div><strong>Phone / Ext:</strong> {ward.phone || 'Ext 204'}</div>
                <div><strong>Floor:</strong> Floor {ward.floor}</div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Hospital Ward</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Ward Name</label>
                  <input className="form-input" placeholder="e.g. Surgical Ward - B" />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <input className="form-input" type="number" placeholder="2" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Bed Capacity</label>
                  <input className="form-input" type="number" placeholder="10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nurse Incharge</label>
                  <input className="form-input" placeholder="e.g. Sr. Mary" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>Save Ward</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
