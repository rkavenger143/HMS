import React, { useState } from 'react';
import {
  Layers, CheckCircle2, Droplets, ArrowRight, ShieldCheck,
  Plus, Clock, Thermometer, Sparkles
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodBagRecord, BloodComponentType } from '../context/BloodBankContext';

export default function ComponentProcessing() {
  const { bloodBags, processComponents, setActiveTab } = useBloodBank();

  // Find whole blood units available for separation
  const wholeBloodUnits = bloodBags.filter(b => b.component === 'whole_blood' && b.status === 'available');

  const [selectedBagId, setSelectedBagId] = useState<string>(wholeBloodUnits[0]?.id || '');
  const [generatePrbc, setGeneratePrbc] = useState(true);
  const [generateFfp, setGenerateFfp] = useState(true);
  const [generatePlt, setGeneratePlt] = useState(true);
  const [generateCryo, setGenerateCryo] = useState(false);

  const selectedBag = bloodBags.find(b => b.id === selectedBagId);

  const handleSeparateComponents = () => {
    if (!selectedBag) {
      alert('Please select a valid Whole Blood unit for component separation.');
      return;
    }

    const compList: { type: BloodComponentType; volumeMl: number; daysValid: number }[] = [];
    if (generatePrbc) compList.push({ type: 'packed_rbc', volumeMl: 280, daysValid: 42 });
    if (generateFfp) compList.push({ type: 'fresh_frozen_plasma', volumeMl: 200, daysValid: 365 });
    if (generatePlt) compList.push({ type: 'platelets', volumeMl: 60, daysValid: 5 });
    if (generateCryo) compList.push({ type: 'cryoprecipitate', volumeMl: 20, daysValid: 365 });

    if (compList.length === 0) {
      alert('Please select at least one component to separate.');
      return;
    }

    processComponents(selectedBag.id, compList);
    alert(`Centrifuge separation complete for ${selectedBag.id}.\nGenerated ${compList.length} distinct blood components in Inventory.`);
    setActiveTab('inventory');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(124,58,237,0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Component Separation & Fractionation Master
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Centrifuge processing: Whole Blood &rarr; Packed RBC (PRBC) + Fresh Frozen Plasma (FFP) + Platelet Concentrate (PC) + Cryoprecipitate
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector + Component Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left: Select Parent Whole Blood Unit */}
        <div className="card">
          <div className="card-header">
            <Droplets size={17} style={{ color: 'var(--color-danger)' }} />
            <span className="card-title">Select Available Whole Blood Unit ({wholeBloodUnits.length} Eligible)</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {wholeBloodUnits.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wholeBloodUnits.map(b => {
                  const isSelected = b.id === selectedBagId;
                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                        background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onClick={() => setSelectedBagId(b.id)}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{b.id}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Collected on {b.collectionDate} · Vol: {b.volumeMl}ml
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-danger" style={{ fontWeight: 800 }}>{b.bloodGroup}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                No whole blood units currently waiting for component processing.
              </div>
            )}
          </div>
        </div>

        {/* Right: Component Fractionation Configuration */}
        <div className="card">
          <div className="card-header">
            <Layers size={17} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Fractionation & Storage Specifications</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>1. Packed Red Blood Cells (PRBC)</strong>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Volume: ~280 mL · Shelf Life: 42 Days · Temp: 2°C to 6°C</div>
              </div>
              <input type="checkbox" checked={generatePrbc} onChange={e => setGeneratePrbc(e.target.checked)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>2. Fresh Frozen Plasma (FFP)</strong>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Volume: ~200 mL · Shelf Life: 1 Year (365 Days) · Temp: -30°C</div>
              </div>
              <input type="checkbox" checked={generateFfp} onChange={e => setGenerateFfp(e.target.checked)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>3. Platelet Concentrate (Random Donor Platelet)</strong>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Volume: ~60 mL · Shelf Life: 5 Days · Temp: 22°C Agitation</div>
              </div>
              <input type="checkbox" checked={generatePlt} onChange={e => setGeneratePlt(e.target.checked)} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>4. Cryoprecipitate (Factor VIII / Fibrinogen)</strong>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Volume: ~20 mL · Shelf Life: 1 Year · Temp: -30°C</div>
              </div>
              <input type="checkbox" checked={generateCryo} onChange={e => setGenerateCryo(e.target.checked)} />
            </label>

            <div style={{ marginTop: 10 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                disabled={!selectedBag}
                onClick={handleSeparateComponents}
              >
                <Layers size={14} /> Execute Component Separation & Stock Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
