import React, { useState } from 'react';
import { Droplets, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBloodBank } from '../../context/BloodBankContext';
import type { BloodDonorRecord } from '../../context/BloodBankContext';

interface RecordDonationModalProps {
  donor: BloodDonorRecord;
  onClose: () => void;
}

export default function RecordDonationModal({ donor, onClose }: RecordDonationModalProps) {
  const { recordDonation, bloodBags } = useBloodBank();

  const [assignedBagId] = useState(`BAG-2026-${String(bloodBags.length + 101).padStart(5, '0')}`);
  const [collectionVolumeMl, setCollectionVolumeMl] = useState<number>(450);
  const [donationType, setDonationType] = useState<'voluntary' | 'replacement' | 'directed'>(donor.donorType || 'voluntary');
  const [phlebotomistName, setPhlebotomistName] = useState('Nurse Sunita Rao (Phlebotomist)');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState(74);
  const [temp, setTemp] = useState(98.4);
  const [hb, setHb] = useState(donor.hemoglobinGdl || 14.2);
  const [remarks, setRemarks] = useState('Satisfactory collection without adverse event.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordDonation({
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      donationDate: new Date().toISOString().slice(0, 10),
      donationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      donationType,
      collectionVolumeMl: Number(collectionVolumeMl),
      assignedBagId,
      phlebotomistName,
      screeningStatus: 'pending',
      status: 'collected',
      vitals: { bp, pulse: Number(pulse), temp: Number(temp), hb: Number(hb) },
      remarks,
    });

    alert(`Blood Donation successfully recorded.\nBlood Bag ${assignedBagId} (${donor.bloodGroup} · ${collectionVolumeMl}ml) placed into Quarantine Bay.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <Droplets size={18} style={{ color: 'var(--color-danger)' }} />
          <div>
            <div className="modal-title">Record Blood Collection & Bag Generation</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Donor: {donor.name} ({donor.bloodGroup}) · Assigned Bag: {assignedBagId}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Donor Header Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <strong style={{ fontSize: 14, color: '#991b1b' }}>{donor.name}</strong>
                <div style={{ fontSize: 11, color: '#7f1d1d' }}>
                  UHID/Donor ID: {donor.id} · {donor.age} yrs · {donor.gender} · {donor.phone}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>{donor.bloodGroup}</div>
                <div style={{ fontSize: 10, color: '#7f1d1d' }}>{donor.totalDonations} previous donations</div>
              </div>
            </div>

            {/* Collection Parameters */}
            <div className="form-grid form-grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Assigned Blood Bag ID</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-primary)' }}
                  value={assignedBagId}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collection Volume</label>
                <select className="form-select" value={collectionVolumeMl} onChange={e => setCollectionVolumeMl(Number(e.target.value))}>
                  <option value={350}>350 mL (Single Bag)</option>
                  <option value={450}>450 mL (Quadruple Component Bag)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Donation Type</label>
                <select className="form-select" value={donationType} onChange={e => setDonationType(e.target.value as any)}>
                  <option value="voluntary">Voluntary Donation</option>
                  <option value="replacement">Replacement Donation</option>
                  <option value="directed">Directed Donation</option>
                </select>
              </div>
            </div>

            {/* Pre-Bleed Vitals */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                Pre-Bleed Donor Clinical Vitals
              </div>

              <div className="form-grid form-grid-4" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">BP (mmHg)</label>
                  <input type="text" className="form-input" value={bp} onChange={e => setBp(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input type="number" className="form-input" value={pulse} onChange={e => setPulse(Number(e.target.value))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Temp (°F)</label>
                  <input type="number" step="0.1" className="form-input" value={temp} onChange={e => setTemp(Number(e.target.value))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Hb (g/dL)</label>
                  <input type="number" step="0.1" className="form-input" value={hb} onChange={e => setHb(Number(e.target.value))} required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phlebotomist Staff Member <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={phlebotomistName}
                onChange={e => setPhlebotomistName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Post-Donation Observation & Remarks</label>
              <input
                type="text"
                className="form-input"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={14} /> Confirm Collection & Send to Quarantine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
