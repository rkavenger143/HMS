import React, { useState } from 'react';
import {
  Activity, Search, HeartPulse, CheckCircle2,
  Clock, AlertCircle, User, Stethoscope, Save
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import { useToast } from '../../../contexts/ToastContext';
import type { OPDVisit, Vitals } from '../../../types';

export default function OPDVitalsStation() {
  const { visits, updateVisitVitals } = useOPD();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<OPDVisit | null>(null);

  // Vitals form state
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulse, setPulse] = useState(76);
  const [temperature, setTemperature] = useState(98.6);
  const [spo2, setSpo2] = useState(98);
  const [respiratoryRate, setRespiratoryRate] = useState(18);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);

  // Filter visits for waiting patients
  const queueVisits = visits.filter(v => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.patientName.toLowerCase().includes(q) ||
      v.patientId.toLowerCase().includes(q) ||
      v.tokenNumber.toString().includes(q);

    return matchSearch && (v.status === 'waiting' || v.status === 'called' || v.status === 'in_consultation');
  });

  const handleSelectVisit = (v: OPDVisit) => {
    setSelectedVisit(v);
    if (v.vitals) {
      setBloodPressure(v.vitals.bloodPressure || '120/80');
      setPulse(v.vitals.pulse || 76);
      setTemperature(v.vitals.temperature || 98.6);
      setSpo2(v.vitals.spo2 || 98);
      setRespiratoryRate(v.vitals.respiratoryRate || 18);
      setHeight(v.vitals.height || 170);
      setWeight(v.vitals.weight || 70);
    } else {
      setBloodPressure('120/80');
      setPulse(76);
      setTemperature(98.6);
      setSpo2(98);
      setRespiratoryRate(18);
      setHeight(170);
      setWeight(70);
    }
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    const bmiCalc = height > 0 ? parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1)) : 24.2;

    const vitalsData: Vitals = {
      bloodPressure,
      pulse,
      temperature,
      spo2,
      respiratoryRate,
      height,
      weight,
      bmi: bmiCalc,
    };

    updateVisitVitals(selectedVisit.id, vitalsData);
    toast.success('Vitals Recorded', `Triage vitals recorded for Token #${selectedVisit.tokenNumber} (${selectedVisit.patientName})`);
  };

  const bmi = height > 0 ? (weight / ((height / 100) * (height / 100))).toFixed(1) : '24.2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>OPD Nursing Triage & Vitals Station</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Capture vital sign measurements, calculate BMI, and prepare patient records for consultation
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 16 }}>
        {/* Left Column: Waiting Patient Queue */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Waiting Queue ({queueVisits.length})</span>
            <div style={{ position: 'relative', width: 160 }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                style={{ paddingLeft: 24, height: 28, fontSize: 11 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body" style={{ padding: '10px 14px', maxHeight: 520, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {queueVisits.map(v => {
                const isSelected = selectedVisit?.id === v.id;
                const hasVitals = !!v.vitals;

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVisit(v)}
                    style={{
                      padding: '10px 12px',
                      background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--color-primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800
                      }}>
                        {v.tokenNumber}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{v.patientName}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          Dr. {v.doctorName} · {v.visitTime}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${hasVitals ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                      {hasVitals ? 'Recorded' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Vitals Form */}
        <div className="card">
          <div className="card-header">
            <HeartPulse size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">
              {selectedVisit ? `Record Vitals — Token #${selectedVisit.tokenNumber} (${selectedVisit.patientName})` : 'Select Patient to Record Vitals'}
            </span>
          </div>
          <div className="card-body">
            {selectedVisit ? (
              <form onSubmit={handleSaveVitals}>
                <div className="form-grid form-grid-3" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="120/80"
                      value={bloodPressure}
                      onChange={e => setBloodPressure(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pulse / Heart Rate (bpm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pulse}
                      onChange={e => setPulse(parseInt(e.target.value, 10) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Oxygen Saturation SpO2 (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={spo2}
                      onChange={e => setSpo2(parseInt(e.target.value, 10) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Respiratory Rate (breaths/min)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={respiratoryRate}
                      onChange={e => setRespiratoryRate(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={height}
                      onChange={e => setHeight(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={weight}
                      onChange={e => setWeight(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calculated BMI</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`${bmi} kg/m²`}
                      disabled
                      style={{ background: 'var(--bg-surface)', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} /> Save Triage Vitals
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-state" style={{ padding: '40px 16px' }}>
                <div className="empty-state-icon"><Activity size={28} /></div>
                <div className="empty-state-title">Select a Waiting Patient</div>
                <div className="empty-state-desc">Choose a patient from the queue on the left to input clinical triage vitals.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
