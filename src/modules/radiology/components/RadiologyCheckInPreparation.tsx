import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Search, Filter,
  UserCheck, Syringe, Play, User, Clock
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import ContrastAdministrationModal from './modals/ContrastAdministrationModal';
import type { ComprehensiveRadiologyOrder, RadiologySafetyChecklist } from '../../../types';

export default function RadiologyCheckInPreparation() {
  const {
    radiologyOrders,
    selectedOrderId,
    setSelectedOrderId,
    checkInPatient,
    updateSafetyChecklist,
    startExamination,
    setActiveTab,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [contrastOrder, setContrastOrder] = useState<ComprehensiveRadiologyOrder | null>(null);

  const checkInQueue = radiologyOrders.filter(
    o => o.status === 'scheduled' || o.status === 'ready' || o.checkInStatus === 'arrived' || o.checkInStatus === 'waiting'
  );

  const filtered = checkInQueue.filter(ord => {
    const q = search.toLowerCase();
    return (
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q)
    );
  });

  const activeOrder = radiologyOrders.find(o => o.id === selectedOrderId) || filtered[0] || checkInQueue[0];

  const handleToggleCheck = (key: keyof RadiologySafetyChecklist, value: any) => {
    if (!activeOrder) return;
    updateSafetyChecklist(activeOrder.id, { [key]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Patient Arrival Check-In & Pre-Procedure Safety Checklist</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Arrival verification, MRI/CT metal screening, fasting validation, contrast clearance, and radiation safety checks
            </div>
          </div>
        </div>

        <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
          {checkInQueue.length} Patient{checkInQueue.length !== 1 ? 's' : ''} in Queue
        </span>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 20 }}>
        {/* Left: Check-in Queue Table */}
        <div className="card" style={{ padding: 0, maxHeight: '74vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search patient / accession..."
                style={{ paddingLeft: 30, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(ord => {
                const isSelected = activeOrder?.id === ord.id;
                const isReady = ord.checkInStatus === 'ready';

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{ord.accessionNumber}</strong>
                      <span className={`badge ${isReady ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                        {ord.checkInStatus.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700 }}>{ord.patientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {ord.examName} ({ord.modalityType.toUpperCase()})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Pre-Procedure Safety Checklist Form */}
        {activeOrder ? (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  Pre-Procedure Safety & Screening Checklist
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Patient: <strong>{activeOrder.patientName}</strong> ({activeOrder.patientId}) · Scan: <strong>{activeOrder.examName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {activeOrder.contrastRequired && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setContrastOrder(activeOrder)}>
                    <Syringe size={13} /> {activeOrder.contrastRecord ? '✓ Contrast Logged' : 'Record Contrast'}
                  </button>
                )}

                {activeOrder.checkInStatus !== 'ready' ? (
                  <button className="btn btn-primary btn-sm" onClick={() => checkInPatient(activeOrder.id, 'ready')}>
                    <CheckCircle2 size={13} /> Mark Ready for Scan
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      startExamination(activeOrder.id, 'Certified Radiographer');
                      setActiveTab('worklist');
                    }}
                  >
                    <Play size={13} /> Start Examination
                  </button>
                )}
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Item 1: Patient Identity */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={activeOrder.safetyChecklist?.patientIdentityVerified || false}
                  onChange={e => handleToggleCheck('patientIdentityVerified', e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>1. Positive Patient Two-Identifier Verification (NABH IPSG 1)</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Verified patient full name, date of birth / age, and wristband barcode against UHID <strong>{activeOrder.patientId}</strong>.
                  </div>
                </div>
              </label>

              {/* Item 2: Examination & Site Verification */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={activeOrder.safetyChecklist?.examinationVerified || false}
                  onChange={e => handleToggleCheck('examinationVerified', e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>2. Correct Investigation & Anatomical Site Verification</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Confirmed requested procedure is <strong>{activeOrder.examName}</strong> for region <strong>{activeOrder.bodyPart}</strong>.
                  </div>
                </div>
              </label>

              {/* Item 3: Metal & Implant Screening */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={activeOrder.safetyChecklist?.metalRemoved || false}
                  onChange={e => handleToggleCheck('metalRemoved', e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>3. Ferromagnetic Metal & Electronic Implant Clearance (ALARA / MRI Safety)</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Confirmed removal of jewelry, coins, hairpins, watches, and dentures. Verified patient has NO cardiac pacemakers or cochlear implants.
                  </div>
                </div>
              </label>

              {/* Item 4: Fasting & Dietary Preparation */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={activeOrder.safetyChecklist?.fastingConfirmed || false}
                  onChange={e => handleToggleCheck('fastingConfirmed', e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>4. Dietary Fasting & Bladder Preparation Verification</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Patient verbally confirmed compliance with required fasting / hydration protocol.
                  </div>
                </div>
              </label>

              {/* Item 5: Contrast Allergy & Renal Clearance */}
              {activeOrder.contrastRequired && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(255, 159, 10, 0.08)', border: '1px solid var(--color-warning)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginTop: 3 }}
                    checked={activeOrder.safetyChecklist?.contrastAllergyChecked || false}
                    onChange={e => handleToggleCheck('contrastAllergyChecked', e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-warning)' }}>
                      5. Intravenous Contrast Allergy & Renal Clearance Check
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                      Verified no history of asthma, shellfish, or iodine allergies. Serum creatinine evaluated.
                    </div>
                  </div>
                </label>
              )}

              {/* Item 6: Pregnancy Status for Females */}
              {activeOrder.gender === 'female' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginTop: 3 }}
                    checked={activeOrder.safetyChecklist?.pregnancyChecked || false}
                    onChange={e => handleToggleCheck('pregnancyChecked', e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>6. 10-Day Rule & Pregnancy Radiation Safety Screening</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Verified LMP (Last Menstrual Period) and confirmed patient is not pregnant (ALARA radiation principle).
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No patient currently selected in check-in queue.
          </div>
        )}
      </div>

      {contrastOrder && (
        <ContrastAdministrationModal order={contrastOrder} onClose={() => setContrastOrder(null)} />
      )}
    </div>
  );
}
