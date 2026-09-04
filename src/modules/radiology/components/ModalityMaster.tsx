import React, { useState } from 'react';
import { Tag, Plus, Search, Filter, Edit, CheckCircle2, Ban, MapPin, Scan } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import type { RadiologyModalityItem, RadiologyModalityType } from '../../../types';

export default function ModalityMaster() {
  const { modalities, addModalityMaster, updateModalityMaster, toggleModalityStatus } = useRadiology();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMod, setEditingMod] = useState<RadiologyModalityItem | null>(null);

  // Form State
  const [modalityCode, setModalityCode] = useState('');
  const [modalityName, setModalityName] = useState('');
  const [modalityType, setModalityType] = useState<RadiologyModalityType>('ct');
  const [department, setDepartment] = useState('Diagnostic Radiology');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [machineName, setMachineName] = useState('');
  const [manufacturer, setManufacturer] = useState('GE Healthcare');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('Radiology Ground Floor Wing');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'in_use' | 'maintenance' | 'out_of_service'>('available');

  const filtered = modalities.filter(m => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.modalityName.toLowerCase().includes(q) ||
      m.modalityCode.toLowerCase().includes(q) ||
      m.machineName.toLowerCase().includes(q) ||
      m.roomNumber.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingMod(null);
    setModalityCode(`MOD-${Math.floor(10 + Math.random() * 90)}`);
    setModalityName('');
    setModalityType('ct');
    setDepartment('Advanced Imaging');
    setRoomNumber('Room 105');
    setMachineName('');
    setManufacturer('GE Healthcare');
    setModel('');
    setLocation('Radiology Wing B');
    setAvailabilityStatus('available');
    setShowAddModal(true);
  };

  const handleOpenEdit = (mod: RadiologyModalityItem) => {
    setEditingMod(mod);
    setModalityCode(mod.modalityCode);
    setModalityName(mod.modalityName);
    setModalityType(mod.modalityType);
    setDepartment(mod.department);
    setRoomNumber(mod.roomNumber);
    setMachineName(mod.machineName);
    setManufacturer(mod.manufacturer);
    setModel(mod.model);
    setLocation(mod.location);
    setAvailabilityStatus(mod.availabilityStatus);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMod) {
      updateModalityMaster(editingMod.id, {
        modalityCode,
        modalityName,
        modalityType,
        department,
        roomNumber,
        machineName,
        manufacturer,
        model,
        location,
        availabilityStatus,
      });
    } else {
      addModalityMaster({
        modalityCode,
        modalityName,
        modalityType,
        department,
        roomNumber,
        machineName,
        manufacturer,
        model,
        location,
        availabilityStatus,
        isActive: true,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Modality & Examination Suite Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configurable diagnostic imaging modalities, physical rooms, and high-tech equipment assignments
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Modality Suite
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Modality, Room, Machine..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modality Code & Name</th>
                  <th>Type</th>
                  <th>Assigned Room & Location</th>
                  <th>Primary Machine & Manufacturer</th>
                  <th>Availability Status</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(mod => (
                  <tr key={mod.id} style={{ opacity: mod.isActive ? 1 : 0.6 }}>
                    <td>
                      <strong style={{ fontSize: 13 }}>{mod.modalityName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{mod.modalityCode} · {mod.department}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary">{mod.modalityType.toUpperCase()}</span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{mod.roomNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{mod.location}</div>
                    </td>

                    <td>
                      <div>{mod.machineName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{mod.manufacturer} {mod.model}</div>
                    </td>

                    <td>
                      <span className={`badge ${mod.availabilityStatus === 'available' ? 'badge-success' : 'badge-warning'}`}>
                        {mod.availabilityStatus.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${mod.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {mod.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleOpenEdit(mod)} title="Edit Modality">
                          <Edit size={13} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => toggleModalityStatus(mod.id)} title={mod.isActive ? 'Deactivate' : 'Activate'}>
                          <Ban size={13} style={{ color: mod.isActive ? 'var(--color-warning)' : 'var(--color-success)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <Tag size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">{editingMod ? 'Edit Modality Suite' : 'Add New Modality Suite'}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Modality Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={modalityCode} onChange={e => setModalityCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modality Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={modalityName} onChange={e => setModalityName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modality Classification</label>
                    <select className="form-select" value={modalityType} onChange={e => setModalityType(e.target.value as any)}>
                      <option value="xray">Digital Radiography (X-Ray)</option>
                      <option value="ct">Computed Tomography (CT)</option>
                      <option value="mri">Magnetic Resonance Imaging (MRI)</option>
                      <option value="ultrasound">Ultrasound & Doppler</option>
                      <option value="mammography">Mammography</option>
                      <option value="dexa">DEXA Bone Density</option>
                      <option value="pet">PET-CT Scan</option>
                      <option value="fluoroscopy">Fluoroscopy / Cath Lab</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department Location</label>
                    <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Room Number <span className="required">*</span></label>
                    <input type="text" className="form-input" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Machine / Equipment Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={machineName} onChange={e => setMachineName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <input type="text" className="form-input" value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Equipment Model</label>
                    <input type="text" className="form-input" value={model} onChange={e => setModel(e.target.value)} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Location / Wing</label>
                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingMod ? 'Update Suite' : 'Save Modality'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
