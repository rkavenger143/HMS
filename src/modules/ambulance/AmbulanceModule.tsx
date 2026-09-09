import React, { useState, useEffect } from 'react';
import {
  Ambulance, MapPin, Phone, AlertTriangle, Clock, Plus,
  CheckCircle2, Navigation, Radio, Battery, Gauge, User, ShieldCheck, X
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import type { AmbulanceVehicle } from '../../data/seedData';
import { useToast } from '../../contexts/ToastContext';

const STATUS_COLORS = {
  available: 'var(--color-success)',
  dispatched: 'var(--color-warning)',
  on_duty: 'var(--color-primary)',
  maintenance: 'var(--text-tertiary)',
};

export default function AmbulanceModule() {
  const { showToast } = useToast();
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>(() => storageService.getAmbulances());
  const [showDispatch, setShowDispatch] = useState(false);
  const [trackingVehicle, setTrackingVehicle] = useState<AmbulanceVehicle | null>(null);

  // Dispatch Form State
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('🔴 Cardiac Emergency');
  const [patientCondition, setPatientCondition] = useState('Severe distress, unconscious');

  useEffect(() => {
    const handleUpdate = () => {
      setAmbulances(storageService.getAmbulances());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  const availableVehicles = ambulances.filter(a => a.status === 'available');

  const handleOpenDispatch = (ambulanceId?: string) => {
    if (ambulanceId) {
      setSelectedAmbulanceId(ambulanceId);
    } else if (availableVehicles.length > 0) {
      setSelectedAmbulanceId(availableVehicles[0].id);
    } else {
      setSelectedAmbulanceId(ambulances[0]?.id || '');
    }
    setCallerName('');
    setCallerPhone('');
    setPickupAddress('Sector 62, Near Metro Station, Noida');
    setEmergencyType('🔴 Cardiac Emergency');
    setPatientCondition('Severe chest pain and difficulty breathing');
    setShowDispatch(true);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbulanceId) {
      showToast('Please select an available ambulance for dispatch', 'warning');
      return;
    }
    if (!callerName.trim() || !callerPhone.trim() || !pickupAddress.trim()) {
      showToast('Please fill in caller name, phone number, and pickup address', 'warning');
      return;
    }

    const dispatched = storageService.dispatchAmbulance(selectedAmbulanceId, {
      callerName,
      phone: callerPhone,
      address: pickupAddress,
      emergencyType,
    });

    if (dispatched) {
      showToast(`Ambulance ${dispatched.vehicleNumber} dispatched to ${pickupAddress}`, 'success');
      setAmbulances(storageService.getAmbulances());
    }
    setShowDispatch(false);
  };

  const handleMarkAvailable = (ambulanceId: string, vehicleNumber: string) => {
    storageService.updateAmbulance(ambulanceId, {
      status: 'available',
      lastLocation: 'Hospital Emergency Bay (Base)',
      currentPatientId: undefined,
    });
    setAmbulances(storageService.getAmbulances());
    showToast(`Ambulance ${vehicleNumber} marked as Available at Base`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Emergency Services</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Ambulance Fleet</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ambulance size={24} style={{ color: 'var(--color-danger)' }} />
            Ambulance Fleet & Emergency Dispatch Command
          </div>
          <div className="page-subtitle">
            24x7 ALS / BLS Rapid Response Fleet, Live Telemetry Tracking, Driver Routing & Real-time Emergency Dispatch
          </div>
        </div>
        <button className="btn btn-danger" onClick={() => handleOpenDispatch()}>
          <AlertTriangle size={15} /> Emergency Dispatch
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-4" style={{ gap: 12 }}>
        {[
          { label: 'Total Fleet', value: ambulances.length, color: 'var(--color-primary)' },
          { label: 'Available at Base', value: ambulances.filter(a => a.status === 'available').length, color: 'var(--color-success)' },
          { label: 'Dispatched / Active', value: ambulances.filter(a => a.status === 'dispatched' || a.status === 'on_duty').length, color: 'var(--color-warning)' },
          { label: 'In Maintenance', value: ambulances.filter(a => a.status === 'maintenance').length, color: 'var(--text-tertiary)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ambulance Cards Grid */}
      <div className="grid grid-cols-3" style={{ gap: 14 }}>
        {ambulances.map(amb => {
          const sc = STATUS_COLORS[amb.status] || STATUS_COLORS.available;
          return (
            <div
              key={amb.id}
              className="card"
              style={{
                padding: '16px',
                borderLeft: `4px solid ${sc}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{amb.vehicleNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{amb.type}</div>
                  </div>
                  <span className="badge" style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40`, fontWeight: 700 }}>
                    <span className="badge-dot" style={{ background: sc }} />
                    {amb.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Phone size={12} style={{ color: 'var(--color-primary)' }} />
                    <span>Driver: <strong>{amb.driverName}</strong> ({amb.driverPhone})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <MapPin size={12} style={{ color: 'var(--color-danger)' }} />
                    <span>Location: <strong>{amb.lastLocation || 'Hospital Campus'}</strong></span>
                  </div>
                  {amb.status === 'dispatched' && (
                    <div style={{ padding: '8px 10px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '6px', color: '#d97706', fontSize: 11, fontWeight: 600 }}>
                      🚨 Active emergency response call in progress
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
                {amb.status === 'available' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleOpenDispatch(amb.id)}
                  >
                    <AlertTriangle size={13} /> Dispatch
                  </button>
                ) : amb.status === 'dispatched' ? (
                  <button
                    className="btn btn-success btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleMarkAvailable(amb.id, amb.vehicleNumber)}
                  >
                    <CheckCircle2 size={13} /> Complete Call
                  </button>
                ) : null}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTrackingVehicle(amb)}
                >
                  <Navigation size={13} /> Live Track
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Dispatch Modal */}
      {showDispatch && (
        <div className="modal-backdrop" onClick={() => setShowDispatch(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05))', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
              <span className="modal-title" style={{ color: 'var(--color-danger)' }}>Rapid Emergency Ambulance Dispatch</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowDispatch(false)}>✕</button>
            </div>
            <form onSubmit={handleConfirmDispatch}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Select Ambulance Vehicle <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedAmbulanceId}
                      onChange={e => setSelectedAmbulanceId(e.target.value)}
                      required
                    >
                      {ambulances.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.vehicleNumber} — {a.type} ({a.status.toUpperCase()} · Driver: {a.driverName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Caller / Attendant Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        placeholder="Caller name"
                        value={callerName}
                        onChange={e => setCallerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Caller Mobile Phone <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="10-digit mobile"
                        value={callerPhone}
                        onChange={e => setCallerPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pickup Address / Landmark <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="Full street address, apartment, or landmark"
                      value={pickupAddress}
                      onChange={e => setPickupAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Category <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={emergencyType}
                      onChange={e => setEmergencyType(e.target.value)}
                    >
                      <option value="🔴 Cardiac Emergency">🔴 Cardiac Emergency (Chest Pain / Arrest)</option>
                      <option value="🚑 Road Traffic Accident">🚑 Road Traffic Accident / Trauma</option>
                      <option value="🩸 Severe Hemorrhage">🩸 Severe Hemorrhage / Acute Blood Loss</option>
                      <option value="🫁 Respiratory Failure">🫁 Respiratory Distress / Low SpO2</option>
                      <option value="⚡ Acute Stroke / Neuro">⚡ Acute Stroke / Paralysis / Neurological</option>
                      <option value="🤰 Obstetric / Labor Emergency">🤰 High-Risk Obstetric / Labor Emergency</option>
                      <option value="🟠 General Acute Emergency">🟠 Other Acute Medical Emergency</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Patient Condition / Symptoms</label>
                    <input
                      className="form-input"
                      placeholder="Brief triage summary"
                      value={patientCondition}
                      onChange={e => setPatientCondition(e.target.value)}
                    />
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    ⚡ Dispatching this ambulance alerts the emergency paramedic driver instantly and registers a high-priority alarm on the ER Board. Hospital emergency line: <strong>0120-4000-911</strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDispatch(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">
                  <Ambulance size={14} /> Confirm & Dispatch Ambulance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Fleet Tracking Modal */}
      {trackingVehicle && (
        <div className="modal-backdrop" onClick={() => setTrackingVehicle(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Navigation size={18} style={{ color: 'var(--color-primary)' }} />
              <span className="modal-title">Live Telemetry & GPS Tracking — {trackingVehicle.vehicleNumber}</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setTrackingVehicle(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-base)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: STATUS_COLORS[trackingVehicle.status], marginTop: 2, textTransform: 'capitalize' }}>
                      {trackingVehicle.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-base)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>ETA to Base / Site</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                      {trackingVehicle.status === 'dispatched' ? '12 Mins' : 'At Base'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-base)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Speed</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                      {trackingVehicle.status === 'dispatched' ? '48 km/h' : '0 km/h'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-base)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>O2 Cylinder Level</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                      94% (Full)
                    </div>
                  </div>
                </div>

                {/* Simulated GPS Radar Map Area */}
                <div
                  style={{
                    height: 220,
                    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '1px solid #334155'
                  }}
                >
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  
                  {/* Ambulance Blip */}
                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #38bdf8', animation: 'pulse 2s infinite' }}>
                      <Ambulance size={24} style={{ color: '#38bdf8' }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: '#ffffff' }}>
                      {trackingVehicle.vehicleNumber} ({trackingVehicle.type})
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      GPS Coordinates: 28.6280° N, 77.3649° E · Last Ping: 2s ago
                    </div>
                  </div>
                </div>

                {/* Driver & Crew Details */}
                <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Designated Paramedic Driver: {trackingVehicle.driverName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Mobile: {trackingVehicle.driverPhone} · Base: Hospital Emergency Wing Bay 1
                    </div>
                  </div>
                  <a
                    href={`tel:${trackingVehicle.driverPhone}`}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Phone size={13} /> Call Driver
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setTrackingVehicle(null)}>Close Tracker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
