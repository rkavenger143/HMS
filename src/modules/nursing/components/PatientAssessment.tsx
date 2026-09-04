import React, { useState } from 'react';
import { Stethoscope, Plus, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { SystemAssessment } from '../../../types';

export default function PatientAssessment() {
  const { admissions, assessments, recordSystemAssessment } = useNursing();

  const [selectedAdmId, setSelectedAdmId] = useState<string>(admissions[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [generalCondition, setGeneralCondition] = useState('Conscious, oriented, resting in bed, comfortable.');
  const [consciousness, setConsciousness] = useState<SystemAssessment['consciousness']>('alert');
  const [orientation, setOrientation] = useState<SystemAssessment['orientation']>('oriented_x3');
  const [mobility, setMobility] = useState<SystemAssessment['mobility']>('assisted');
  const [respiratoryCondition, setRespiratoryCondition] = useState('Bilateral air entry equal, no wheeze or crepitations.');
  const [oxygenSupport, setOxygenSupport] = useState('Room Air');
  const [spo2, setSpo2] = useState(98);
  const [cardiovascularCondition, setCardiovascularCondition] = useState('S1 S2 normal, pulse regular, peripheral pulses palpable.');
  const [pulse, setPulse] = useState(74);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [skinCondition, setSkinCondition] = useState('Warm, dry, intact skin. No pressure sores noted.');
  const [bradenScore, setBradenScore] = useState(18);
  const [pressureInjuryRisk, setPressureInjuryRisk] = useState<SystemAssessment['pressureInjuryRisk']>('low');
  const [nutritionAppetite, setNutritionAppetite] = useState('Good, hospital regular diet tolerated.');
  const [feedingMethod, setFeedingMethod] = useState('Oral Self');
  const [urineOutputStatus, setUrineOutputStatus] = useState('Adequate, clear straw color.');
  const [bowelMovementStatus, setBowelMovementStatus] = useState('Regular, soft stool passed.');
  const [remarks, setRemarks] = useState('Patient educated on fall prevention and call bell usage.');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdm = admissions.find(a => a.id === selectedAdmId) || admissions[0];

  const patientAssessments = assessments.filter(a => a.admissionId === selectedAdmId);

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();

    recordSystemAssessment({
      admissionId: selectedAdm.id,
      patientId: selectedAdm.patientId,
      patientName: selectedAdm.patientName,
      bedNumber: selectedAdm.bedNumber,
      generalCondition,
      consciousness,
      orientation,
      mobility,
      respiratoryCondition,
      oxygenSupport,
      spo2: Number(spo2) || 98,
      cardiovascularCondition,
      pulse: Number(pulse) || 72,
      bloodPressure,
      skinCondition,
      bradenScore: Number(bradenScore) || 18,
      pressureInjuryRisk,
      nutritionAppetite,
      feedingMethod,
      urineOutputStatus,
      bowelMovementStatus,
      remarks,
    });

    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Head-to-Toe Clinical Systems Assessment</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Neurological, respiratory, cardiovascular, Braden skin risk score, nutrition, and elimination evaluations
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Record Head-to-Toe Assessment
        </button>
      </div>

      {/* Patient Selector */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Select Inpatient:</label>
          <select className="form-select" style={{ maxWidth: 360 }} value={selectedAdmId} onChange={e => setSelectedAdmId(e.target.value)}>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} — Bed {a.bedNumber} ({a.ward})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment History Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patientAssessments.length > 0 ? (
          patientAssessments.map(asmt => (
            <div key={asmt.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid var(--border-muted)', paddingBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    Systems Assessment — {asmt.patientName} (Bed {asmt.bedNumber})
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Documented by <strong>{asmt.nurseName}</strong> on {asmt.date} at {asmt.time}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-primary">Braden: {asmt.bradenScore} (Risk: {asmt.pressureInjuryRisk.toUpperCase()})</span>
                  <span className="badge badge-success">AVPU: {asmt.consciousness.toUpperCase()}</span>
                </div>
              </div>

              {/* Systems Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, fontSize: 12 }}>
                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>1. Neurological & General</strong>
                  <div style={{ marginTop: 4 }}>Condition: {asmt.generalCondition}</div>
                  <div>Orientation: {asmt.orientation} · Mobility: {asmt.mobility}</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>2. Respiratory System</strong>
                  <div style={{ marginTop: 4 }}>{asmt.respiratoryCondition}</div>
                  <div>O2 Support: {asmt.oxygenSupport || 'Room Air'} · SpO2: {asmt.spo2}%</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>3. Cardiovascular System</strong>
                  <div style={{ marginTop: 4 }}>{asmt.cardiovascularCondition}</div>
                  <div>Pulse: {asmt.pulse} bpm · BP: {asmt.bloodPressure} mmHg</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>4. Skin & Pressure Injury</strong>
                  <div style={{ marginTop: 4 }}>{asmt.skinCondition}</div>
                  <div>Braden Risk: <strong>{asmt.pressureInjuryRisk.toUpperCase()}</strong> ({asmt.bradenScore}/23)</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>5. Nutrition & GI</strong>
                  <div style={{ marginTop: 4 }}>Appetite: {asmt.nutritionAppetite}</div>
                  <div>Feeding: {asmt.feedingMethod}</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>6. Elimination System</strong>
                  <div style={{ marginTop: 4 }}>Urine: {asmt.urineOutputStatus}</div>
                  <div>Bowel: {asmt.bowelMovementStatus}</div>
                </div>
              </div>

              {asmt.remarks && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Nurse Observations:</strong> {asmt.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Stethoscope size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Assessment Recorded for this Patient</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Click "Record Head-to-Toe Assessment" to document.</div>
          </div>
        )}
      </div>

      {/* Add Assessment Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Record Head-to-Toe Systems Assessment</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssessment}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">General Condition & Appearance <span className="required">*</span></label>
                    <input type="text" className="form-input" value={generalCondition} onChange={e => setGeneralCondition(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consciousness (AVPU)</label>
                    <select className="form-select" value={consciousness} onChange={e => setConsciousness(e.target.value as any)}>
                      <option value="alert">A — Alert & Oriented</option>
                      <option value="voice">V — Voice</option>
                      <option value="pain">P — Pain</option>
                      <option value="unresponsive">U — Unresponsive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobility Status</label>
                    <select className="form-select" value={mobility} onChange={e => setMobility(e.target.value as any)}>
                      <option value="independent">Independent</option>
                      <option value="assisted">Assisted</option>
                      <option value="bedridden">Bedridden</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Respiratory Assessment</label>
                    <input type="text" className="form-input" value={respiratoryCondition} onChange={e => setRespiratoryCondition(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Oxygen Support</label>
                    <input type="text" className="form-input" value={oxygenSupport} onChange={e => setOxygenSupport(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SpO2 (%)</label>
                    <input type="number" className="form-input" value={spo2} onChange={e => setSpo2(Number(e.target.value))} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Cardiovascular Assessment</label>
                    <input type="text" className="form-input" value={cardiovascularCondition} onChange={e => setCardiovascularCondition(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skin Condition & Wounds</label>
                    <input type="text" className="form-input" value={skinCondition} onChange={e => setSkinCondition(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Braden Scale Pressure Ulcer Risk</label>
                    <select className="form-select" value={pressureInjuryRisk} onChange={e => setPressureInjuryRisk(e.target.value as any)}>
                      <option value="low">Low Risk (&gt;15)</option>
                      <option value="moderate">Moderate Risk (13-14)</option>
                      <option value="high">High Risk (10-12)</option>
                      <option value="severe">Severe Risk (&le;9)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nutrition & Diet</label>
                    <input type="text" className="form-input" value={nutritionAppetite} onChange={e => setNutritionAppetite(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Elimination (Urine & Bowel)</label>
                    <input type="text" className="form-input" value={urineOutputStatus} onChange={e => setUrineOutputStatus(e.target.value)} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Clinical Remarks & Nursing Interventions</label>
                    <input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
