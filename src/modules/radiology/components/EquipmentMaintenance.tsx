import React, { useState } from 'react';
import { Settings, Plus, Search, Filter, Wrench, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import type { RadiologyEquipmentItem } from '../../../types';

export default function EquipmentMaintenance() {
  const { equipment, addEquipment, updateEquipment, recordMaintenance } = useRadiology();

  const [search, setSearch] = useState('');
  const [serviceTarget, setServiceTarget] = useState<RadiologyEquipmentItem | null>(null);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('2026-12-15');
  const [serviceNotes, setServiceNotes] = useState('Quarterly preventive maintenance and tube calibration completed successfully.');

  const filtered = equipment.filter(eq => {
    const q = search.toLowerCase();
    return (
      !search ||
      eq.equipmentName.toLowerCase().includes(q) ||
      eq.manufacturer.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.serialNumber.toLowerCase().includes(q)
    );
  });

  const handleConfirmService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTarget) return;

    recordMaintenance(serviceTarget.id, nextMaintenanceDate, serviceNotes);
    setServiceTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Equipment Registry & Preventive Maintenance</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              High-value imaging hardware calibration logs, AERB radiation quality checks, and service maintenance tracking
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipment Name & Model</th>
                  <th>Modality & Room</th>
                  <th>Manufacturer & Serial</th>
                  <th>Operating Status</th>
                  <th>Last Maintenance</th>
                  <th>Next Scheduled Service</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(eq => (
                  <tr key={eq.id}>
                    <td>
                      <strong style={{ fontSize: 13 }}>{eq.equipmentName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Model: {eq.model}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary">{eq.modalityType.toUpperCase()}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{eq.roomLocation}</div>
                    </td>

                    <td>
                      <div>{eq.manufacturer}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>SN: {eq.serialNumber}</div>
                    </td>

                    <td>
                      <span className={`badge ${eq.status === 'available' ? 'badge-success' : eq.status === 'in_use' ? 'badge-info' : 'badge-warning'}`}>
                        {eq.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{eq.lastMaintenanceDate}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{eq.nextMaintenanceDate}</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, height: 26 }}
                        onClick={() => {
                          setServiceTarget(eq);
                          setNextMaintenanceDate('2026-12-15');
                        }}
                      >
                        <Wrench size={11} /> Log Service
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Service Dialog Modal */}
      {serviceTarget && (
        <div className="modal-backdrop" onClick={() => setServiceTarget(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <Wrench size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Record Preventive Maintenance Service</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {serviceTarget.equipmentName} ({serviceTarget.roomLocation})
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setServiceTarget(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmService}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Service Execution Date</label>
                    <input type="date" className="form-input" defaultValue={new Date().toISOString().slice(0, 10)} readOnly />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Scheduled Service Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={nextMaintenanceDate} onChange={e => setNextMaintenanceDate(e.target.value)} required />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Biomedical Engineer Service Notes & AERB Calibration</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={serviceNotes}
                      onChange={e => setServiceNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setServiceTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Update Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
