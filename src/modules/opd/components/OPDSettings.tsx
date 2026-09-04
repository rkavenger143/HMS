import React, { useState } from 'react';
import { Settings, Save, Sliders, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import { useOPD } from '../context/OPDContext';

export default function OPDSettings() {
  const { doctors, departments } = useOPD();
  const [saved, setSaved] = useState(false);
  const [defaultFee, setDefaultFee] = useState(600);
  const [tokenPrefix, setTokenPrefix] = useState('OPD-');
  const [autoCallVoice, setAutoCallVoice] = useState(true);
  const [maxWaitingCap, setMaxWaitingCap] = useState(50);
  const [consultationDuration, setConsultationDuration] = useState(15);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} style={{ color: 'var(--color-primary)' }} />
            Outpatient Department (OPD) Configuration & Chamber Settings
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Configure token generation rules, default tariffs, voice announcements, and chamber slots
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '12px 16px', background: 'var(--color-success-muted)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} /> OPD Configuration saved successfully.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Standard OPD Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={defaultFee}
                onChange={e => setDefaultFee(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Token Number Prefix</label>
              <input
                type="text"
                className="form-input"
                value={tokenPrefix}
                onChange={e => setTokenPrefix(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Consultation Duration (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={consultationDuration}
                onChange={e => setConsultationDuration(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Queue Waiting Capacity</label>
              <input
                type="number"
                className="form-input"
                value={maxWaitingCap}
                onChange={e => setMaxWaitingCap(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <input
              type="checkbox"
              id="autoCallVoice"
              checked={autoCallVoice}
              onChange={e => setAutoCallVoice(e.target.checked)}
            />
            <label htmlFor="autoCallVoice" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Enable Automated Voice Token Announcement in OPD Waiting Hall
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={14} /> Save OPD Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
