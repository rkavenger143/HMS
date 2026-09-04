import React, { useState, useEffect } from 'react';
import { X, BedDouble, Building2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { Bed, BedType, BedStatus } from '../../../../types';

interface AddEditBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed?: Bed | null;
}

export default function AddEditBedModal({ isOpen, onClose, bed }: AddEditBedModalProps) {
  const { addBed, updateBed } = useAdmin();

  const [formData, setFormData] = useState({
    bedNumber: '',
    ward: 'ICU',
    wardId: 'ward-icu',
    roomNumber: '',
    floor: 2,
    type: 'icu' as BedType,
    status: 'available' as BedStatus,
    dailyRate: 4500,
    features: ['Oxygen Support', 'Cardiac Monitor', 'Ventilator Ready'],
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (bed) {
      setFormData({
        bedNumber: bed.bedNumber,
        ward: bed.ward,
        wardId: bed.wardId || 'ward-1',
        roomNumber: bed.roomNumber || '',
        floor: bed.floor || 1,
        type: bed.type,
        status: bed.status,
        dailyRate: bed.dailyRate || 2500,
        features: bed.features || ['Oxygen Support'],
      });
    } else {
      setFormData({
        bedNumber: `BED-${Math.floor(100 + Math.random() * 900)}`,
        ward: 'General Ward - Male',
        wardId: 'ward-gen-m',
        roomNumber: '101',
        floor: 1,
        type: 'general',
        status: 'available',
        dailyRate: 1500,
        features: ['Standard Bed', 'Call Bell'],
      });
    }
    setError('');
  }, [bed, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bedNumber || !formData.ward) {
      setError('Please provide bed number and ward name.');
      return;
    }

    if (bed) {
      updateBed(bed.id, formData);
    } else {
      addBed(formData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 500, width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BedDouble size={18} />
            </div>
            <div>
              <h3 className="modal-title">{bed ? 'Edit Bed Setup' : 'Add New Hospital Bed'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Configure bed identifier, ward location, and daily tariff
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bed Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ICU-05 or B-102"
                  value={formData.bedNumber}
                  onChange={e => setFormData({ ...formData, bedNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Room / Bay #</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Room 204"
                  value={formData.roomNumber}
                  onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hospital Ward *</label>
                <select
                  className="form-select"
                  value={formData.ward}
                  onChange={e => {
                    const w = e.target.value;
                    let type: BedType = 'general';
                    let rate = 1500;
                    if (w.includes('ICU')) { type = 'icu'; rate = 4500; }
                    else if (w.includes('Private')) { type = 'private'; rate = 3500; }
                    else if (w.includes('Isolation')) { type = 'isolation'; rate = 4000; }
                    else if (w.includes('Semi')) { type = 'semi_private'; rate = 2200; }

                    setFormData({ ...formData, ward: w, type, dailyRate: rate });
                  }}
                >
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="General Ward - Male">General Ward - Male</option>
                  <option value="General Ward - Female">General Ward - Female</option>
                  <option value="Deluxe Private Wing">Deluxe Private Wing</option>
                  <option value="Semi-Private Ward">Semi-Private Ward</option>
                  <option value="Isolation / Infection Control">Isolation / Infection Control</option>
                  <option value="Emergency Red Bay">Emergency Red Bay</option>
                  <option value="Pediatric Ward">Pediatric Ward</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Floor Level</label>
                <select
                  className="form-select"
                  value={formData.floor}
                  onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
                >
                  <option value={0}>Ground Floor</option>
                  <option value={1}>1st Floor</option>
                  <option value={2}>2nd Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bed Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as BedType })}
                >
                  <option value="general">General Ward</option>
                  <option value="icu">ICU (Intensive Care)</option>
                  <option value="private">Private Room</option>
                  <option value="semi_private">Semi-Private Room</option>
                  <option value="isolation">Isolation Ward</option>
                  <option value="emergency">Emergency / Trauma</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Daily Tariff / Charge (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dailyRate}
                  onChange={e => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as BedStatus })}
              >
                <option value="available">Available (Ready for Admission)</option>
                <option value="cleaning">Cleaning / Sanitization</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="blocked">Blocked / Reserved</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {bed ? 'Save Changes' : 'Create Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
