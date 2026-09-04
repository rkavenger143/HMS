import React, { useState } from 'react';
import { Ambulance, MapPin, Phone, AlertTriangle, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { DEMO_AMBULANCES } from '../../data/seedData';

const STATUS_COLORS = {
  available: 'var(--color-success)',
  dispatched: 'var(--color-warning)',
  on_duty: 'var(--color-primary)',
  maintenance: 'var(--text-tertiary)',
};

export default function AmbulanceModule() {
  const [showDispatch, setShowDispatch] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb"><span>Home</span><span className="breadcrumb-sep">›</span><span>Ambulance</span></div>
          <div className="page-title">Emergency & Ambulance</div>
          <div className="page-subtitle">Fleet management and emergency dispatch</div>
        </div>
        <button className="btn btn-danger" onClick={() => setShowDispatch(true)}>
          <AlertTriangle size={15} /> Emergency Dispatch
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-4 mb-6" style={{ gap: 12 }}>
        {[
          { label: 'Total Fleet', value: DEMO_AMBULANCES.length, color: 'var(--color-primary)' },
          { label: 'Available', value: DEMO_AMBULANCES.filter(a => a.status === 'available').length, color: 'var(--color-success)' },
          { label: 'Dispatched', value: DEMO_AMBULANCES.filter(a => a.status === 'dispatched').length, color: 'var(--color-warning)' },
          { label: 'Maintenance', value: DEMO_AMBULANCES.filter(a => a.status === 'maintenance').length, color: 'var(--text-tertiary)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ambulance Cards */}
      <div className="grid grid-cols-3" style={{ gap: 14 }}>
        {DEMO_AMBULANCES.map(amb => {
          const sc = STATUS_COLORS[amb.status];
          return (
            <div key={amb.id} className="card" style={{ padding: '16px', borderLeft: `3px solid ${sc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{amb.vehicleNumber}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{amb.type}</div>
                </div>
                <span className="badge" style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40` }}>
                  <span className="badge-dot" style={{ background: sc }} />
                  {amb.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Phone size={11} /> Driver: {amb.driverName} · {amb.driverPhone}
                </div>
                {amb.lastLocation && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <MapPin size={11} /> {amb.lastLocation}
                  </div>
                )}
                {amb.currentPatientId && (
                  <div style={{ padding: '6px 10px', background: 'var(--color-warning-muted)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warning)', marginTop: 4 }}>
                    🚨 On emergency call
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                {amb.status === 'available' && (
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowDispatch(true)}>
                    Dispatch
                  </button>
                )}
                <button className="btn btn-secondary btn-sm">Track</button>
              </div>
            </div>
          );
        })}
      </div>

      {showDispatch && (
        <div className="modal-backdrop" onClick={() => setShowDispatch(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(255,69,58,0.1), rgba(255,107,53,0.05))', borderColor: 'rgba(255,69,58,0.2)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
              <span className="modal-title" style={{ color: 'var(--color-danger)' }}>Emergency Ambulance Dispatch</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowDispatch(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Select Ambulance <span className="required">*</span></label>
                  <select className="form-select">
                    {DEMO_AMBULANCES.filter(a => a.status === 'available').map(a => (
                      <option key={a.id}>{a.vehicleNumber} — {a.type} (Driver: {a.driverName})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Caller Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Caller Phone <span className="required">*</span></label>
                  <input className="form-input" type="tel" placeholder="Mobile number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Address <span className="required">*</span></label>
                  <input className="form-input" placeholder="Full address with landmark" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Type <span className="required">*</span></label>
                  <select className="form-select">
                    <option>🔴 Cardiac Emergency</option>
                    <option>🚑 Accident / Trauma</option>
                    <option>🩸 Severe Bleeding</option>
                    <option>🫁 Respiratory Distress</option>
                    <option>⚡ Neurological Emergency</option>
                    <option>🤰 Obstetric Emergency</option>
                    <option>🟠 Other Emergency</option>
                  </select>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--color-danger-muted)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-danger)' }}>
                  ⚡ Dispatching ambulance will immediately alert the driver and assign case. Hospital emergency line: <strong>0120-4000-911</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDispatch(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => setShowDispatch(false)}>
                <Ambulance size={14} /> Dispatch Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
