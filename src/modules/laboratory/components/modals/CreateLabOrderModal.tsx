import React, { useState } from 'react';
import { FlaskConical, Plus, X, Search, CheckCircle2, Package, Tag, AlertCircle } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../../data/seedData';
import type { LabPriority } from '../../../../types';

interface CreateLabOrderModalProps {
  initialPatientId?: string;
  onClose: () => void;
}

export default function CreateLabOrderModal({ initialPatientId, onClose }: CreateLabOrderModalProps) {
  const { testMaster, packageMaster, createLabOrder, setActiveTab } = useLab();

  const [patientId, setPatientId] = useState(initialPatientId || DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [encounterType, setEncounterType] = useState<'opd' | 'ipd' | 'emergency'>('opd');
  const [bedNumber, setBedNumber] = useState('');
  const [ward, setWard] = useState('');
  const [doctorId, setDoctorId] = useState(DEMO_DOCTORS[0]?.id || 'doc-001');
  const [priority, setPriority] = useState<LabPriority>('routine');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [selectedTests, setSelectedTests] = useState<string[]>(['test-cbc']);
  const [activeTestTab, setActiveTestTab] = useState<'individual' | 'packages'>('individual');
  const [testSearch, setTestSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];
  const selectedDoctor = DEMO_DOCTORS.find(d => d.id === doctorId) || DEMO_DOCTORS[0];

  const filteredTests = testMaster.filter(t => {
    const q = testSearch.toLowerCase();
    const matchesSearch = !testSearch || t.testName.toLowerCase().includes(q) || t.testCode.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat && t.isActive;
  });

  const handleTogglePackage = (pkgTestIds: string[]) => {
    setSelectedTests(prev => {
      const allIncluded = pkgTestIds.every(id => prev.includes(id));
      if (allIncluded) {
        return prev.filter(id => !pkgTestIds.includes(id));
      } else {
        const set = new Set([...prev, ...pkgTestIds]);
        return Array.from(set);
      }
    });
  };

  const totalPrice = testMaster
    .filter(t => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const hasFasting = testMaster
    .filter(t => selectedTests.includes(t.id))
    .some(t => t.fastingRequired);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      alert('Please select at least one laboratory investigation.');
      return;
    }

    createLabOrder({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      age: (selectedPatient as any).age || 35,
      gender: selectedPatient.gender || 'female',
      encounterType,
      bedNumber: encounterType === 'ipd' ? bedNumber || 'GW-01' : undefined,
      ward: encounterType === 'ipd' ? ward || 'General Ward A' : undefined,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      priority,
      diagnosis,
      clinicalNotes,
      testIds: selectedTests,
    });

    onClose();
    setActiveTab('orders');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 840 }}>
        <div className="modal-header">
          <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <span className="modal-title">Clinical Laboratory Investigation Order</span>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Physician test requisition, health panel selection, and phlebotomy routing
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Patient & Doctor Demographics Grid */}
            <div className="form-grid form-grid-2" style={{ gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Patient <span className="required">*</span></label>
                <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  {DEMO_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} — {p.id} ({p.gender}, {(p as any).age || 35}y)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Encounter Classification</label>
                <select className="form-select" value={encounterType} onChange={e => setEncounterType(e.target.value as any)}>
                  <option value="opd">Outpatient Department (OPD)</option>
                  <option value="ipd">Inpatient Department (IPD Admitted)</option>
                  <option value="emergency">Emergency / Trauma Casualty</option>
                </select>
              </div>

              {encounterType === 'ipd' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Ward Name</label>
                    <input type="text" className="form-input" placeholder="e.g. General Ward A" value={ward} onChange={e => setWard(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bed Number</label>
                    <input type="text" className="form-input" placeholder="e.g. GW-01" value={bedNumber} onChange={e => setBedNumber(e.target.value)} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Ordering Physician <span className="required">*</span></label>
                <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  {DEMO_DOCTORS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Requisition Priority <span className="required">*</span></label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="routine">Routine (Standard Turnaround)</option>
                  <option value="urgent">Urgent (Priority Processing)</option>
                  <option value="stat">STAT (Critical Life-Threatening Requisition)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Indication / Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suspected Dengue Fever / Routine Diabetic Evaluation"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Physician Notes for Laboratory</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Patient on anticoagulants, verify Platelet count twice..."
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Test Selection Tabs Header */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTestTab === 'individual' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTestTab('individual')}
                  >
                    <Tag size={13} /> Individual Lab Tests ({testMaster.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTestTab === 'packages' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTestTab('packages')}
                  >
                    <Package size={13} /> Health Check Packages ({packageMaster.length})
                  </button>
                </div>

                {hasFasting && (
                  <span className="badge badge-warning" style={{ fontSize: 11 }}>
                    ⚠️ Fasting Required for selected tests
                  </span>
                )}
              </div>

              {activeTestTab === 'individual' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 10, marginBottom: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search test name or code..."
                        style={{ paddingLeft: 32, height: 36 }}
                        value={testSearch}
                        onChange={e => setTestSearch(e.target.value)}
                      />
                    </div>

                    <select className="form-select" style={{ height: 36 }} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                      <option value="ALL">All Categories</option>
                      <option value="hematology">Hematology</option>
                      <option value="biochemistry">Biochemistry</option>
                      <option value="urine">Urine / Stool</option>
                      <option value="hormones">Hormones / Thyroid</option>
                      <option value="serology">Serology / Immunology</option>
                    </select>
                  </div>

                  {/* Tests List Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                    {filteredTests.map(test => {
                      const isSelected = selectedTests.includes(test.id);

                      return (
                        <label
                          key={test.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            background: isSelected ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedTests(prev => [...prev, test.id]);
                              } else {
                                setSelectedTests(prev => prev.filter(id => id !== test.id));
                              }
                            }}
                            style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{test.testName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              Code: {test.testCode} · {test.sampleType} ({test.containerType}) · TAT: {test.turnaroundHours}h {test.fastingRequired && '· ⚠️ Fasting'}
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                            ₹{test.price}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Health Check Packages */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
                  {packageMaster.map(pkg => {
                    const allIncluded = pkg.testIds.every(id => selectedTests.includes(id));

                    return (
                      <div
                        key={pkg.id}
                        style={{
                          padding: '12px 14px',
                          background: allIncluded ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                          border: `1px solid ${allIncluded ? 'var(--color-primary)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{pkg.packageName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{pkg.description}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--color-primary)' }}>₹{pkg.price}</div>
                            <span className="badge badge-success" style={{ fontSize: 10 }}>{pkg.discountPercentage}% OFF</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Contains {pkg.testIds.length} investigations
                          </span>
                          <button
                            type="button"
                            className={`btn btn-sm ${allIncluded ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => handleTogglePackage(pkg.testIds)}
                          >
                            {allIncluded ? 'Remove Package' : 'Add Package Tests'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price & Selection Summary Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                marginTop: 14,
                border: '1px solid var(--border-default)',
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Selected Tests ({selectedTests.length}): </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {testMaster.filter(t => selectedTests.includes(t.id)).map(t => t.testCode).join(', ') || 'None'}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-primary)' }}>
                Total: ₹{totalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={13} /> Confirm & Place Lab Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
