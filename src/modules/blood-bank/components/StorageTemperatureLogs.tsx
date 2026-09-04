import React, { useState } from 'react';
import {
  Thermometer, AlertTriangle, CheckCircle2, ShieldAlert,
  Clock, Plus, ShieldCheck, Activity, Save
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';

export default function StorageTemperatureLogs() {
  const { storageUnits, temperatureLogs, recordTemperatureLog } = useBloodBank();

  const [selectedUnitId, setSelectedUnitId] = useState(storageUnits[0]?.id || 'ST-FRIDGE-01');
  const [currentTemp, setCurrentTemp] = useState<number>(4.2);
  const [recordedBy, setRecordedBy] = useState('Deepak Verma (Lab Tech)');

  const selectedUnit = storageUnits.find(u => u.id === selectedUnitId) || storageUnits[0];

  const handleLogTemp = (e: React.FormEvent) => {
    e.preventDefault();

    let status: 'normal' | 'warning' | 'alert' = 'normal';
    if (selectedUnit.type === 'refrigerator_2_6') {
      if (currentTemp < 2 || currentTemp > 6) status = 'alert';
      else if (currentTemp >= 5.5 || currentTemp <= 2.5) status = 'warning';
    } else if (selectedUnit.type === 'freezer_minus_30') {
      if (currentTemp > -20) status = 'alert';
      else if (currentTemp > -25) status = 'warning';
    } else if (selectedUnit.type === 'platelet_agitator_22') {
      if (currentTemp < 20 || currentTemp > 24) status = 'alert';
      else if (currentTemp >= 23.5 || currentTemp <= 20.5) status = 'warning';
    }

    recordTemperatureLog({
      storageUnitId: selectedUnit.id,
      storageUnitName: selectedUnit.name,
      temperatureC: Number(currentTemp),
      status,
      recordedBy,
    });

    alert(`Temperature ${currentTemp}°C logged for ${selectedUnit.name}.\nStatus: ${status.toUpperCase()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Cold Chain Storage Units & 24/7 Temperature Monitoring
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Real-time monitoring of blood refrigerators (2–6°C), deep plasma freezers (-30°C), and platelet agitators (22°C)
            </div>
          </div>
        </div>
      </div>

      {/* Storage Units Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {storageUnits.map(unit => (
          <div
            key={unit.id}
            className="card"
            style={{
              padding: '18px',
              borderTop: `4px solid ${unit.tempStatus === 'normal' ? 'var(--color-success)' : unit.tempStatus === 'warning' ? '#d97706' : 'var(--color-danger)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{unit.name}</strong>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{unit.location}</div>
              </div>

              <span className={`badge ${unit.tempStatus === 'normal' ? 'badge-success' : unit.tempStatus === 'warning' ? 'badge-warning' : 'badge-danger'}`}>
                {unit.tempStatus.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Current Temp</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: unit.tempStatus === 'normal' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                  {unit.currentTempC}°C
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Target Range</span>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{unit.targetTempC}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Capacity: <strong>{unit.currentUtilization} / {unit.capacityUnits} Bags</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Add Temp Log Form + Temp Logs Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left: Record Temp Form */}
        <div className="card">
          <div className="card-header">
            <Thermometer size={17} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Record Storage Unit Temperature Check</span>
          </div>

          <form onSubmit={handleLogTemp}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Storage Unit <span className="required">*</span></label>
                <select className="form-select" value={selectedUnitId} onChange={e => setSelectedUnitId(e.target.value)}>
                  {storageUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name} (Target: {u.targetTempC})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Observed Temperature (°C) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={currentTemp}
                  onChange={e => setCurrentTemp(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recorded By (Staff / Technician) <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={recordedBy}
                  onChange={e => setRecordedBy(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={13} /> Log Temperature Reading
              </button>
            </div>
          </form>
        </div>

        {/* Right: Temperature Audit History */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">24-Hour Temperature Audit Logs</span>
            <span className="badge badge-primary">{temperatureLogs.length} Readings</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Storage Unit</th>
                    <th>Observed Temp</th>
                    <th>Status</th>
                    <th>Recorded By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {temperatureLogs.map(log => (
                    <tr key={log.id}>
                      <td><strong>{log.storageUnitName}</strong></td>
                      <td><strong>{log.temperatureC}°C</strong></td>
                      <td>
                        <span className={`badge ${log.status === 'normal' ? 'badge-success' : log.status === 'warning' ? 'badge-warning' : 'badge-danger'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 11 }}>{log.recordedBy}</td>
                      <td>{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
