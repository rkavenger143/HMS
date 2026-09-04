import React, { useState } from 'react';
import { FlaskConical, X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { OPDVisit, Patient } from '../../../../types';

interface OrderLabRequisitionModalProps {
  visit: OPDVisit;
  patient: Patient | null;
  onClose: () => void;
  onSubmit: (data: {
    tests: Array<{ testId: string; testName: string; price: number; category: string }>;
    priority: 'routine' | 'urgent' | 'stat';
    clinicalNotes: string;
  }) => void;
}

const CATALOG_TESTS = [
  { id: 'LT-001', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 350 },
  { id: 'LT-002', name: 'Comprehensive Metabolic Panel (CMP)', category: 'Biochemistry', price: 800 },
  { id: 'LT-003', name: 'Lipid Profile Comprehensive', category: 'Biochemistry', price: 650 },
  { id: 'LT-004', name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 750 },
  { id: 'LT-005', name: 'Kidney Function Test (KFT / RFT)', category: 'Biochemistry', price: 700 },
  { id: 'LT-006', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', price: 600 },
  { id: 'LT-007', name: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', price: 450 },
  { id: 'LT-008', name: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', price: 120 },
  { id: 'LT-009', name: 'Urine Routine & Microscopy', category: 'Clinical Pathology', price: 200 },
  { id: 'LT-010', name: 'Serum Electrolytes (Na+, K+, Cl-)', category: 'Biochemistry', price: 500 },
  { id: 'LT-011', name: 'Dengue NS1 Antigen & IgM/IgG', category: 'Serology', price: 950 },
  { id: 'LT-012', name: 'C-Reactive Protein (Quantitative CRP)', category: 'Immunology', price: 400 },
  { id: 'LT-013', name: 'Vitamin D (25-Hydroxy)', category: 'Biochemistry', price: 1200 },
  { id: 'LT-014', name: 'Vitamin B12 Assay', category: 'Biochemistry', price: 900 },
  { id: 'LT-015', name: 'Prothrombin Time (PT / INR)', category: 'Hematology', price: 350 },
];

export default function OrderLabRequisitionModal({
  visit,
  patient,
  onClose,
  onSubmit,
}: OrderLabRequisitionModalProps) {
  const [selectedTests, setSelectedTests] = useState<typeof CATALOG_TESTS>([]);
  const [selectedTestId, setSelectedTestId] = useState(CATALOG_TESTS[0].id);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const handleAddTest = () => {
    const item = CATALOG_TESTS.find(t => t.id === selectedTestId);
    if (item && !selectedTests.some(t => t.id === item.id)) {
      setSelectedTests([...selectedTests, item]);
    }
  };

  const handleRemoveTest = (id: string) => {
    setSelectedTests(selectedTests.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) return;
    onSubmit({
      tests: selectedTests.map(t => ({ testId: t.id, testName: t.name, price: t.price, category: t.category })),
      priority,
      clinicalNotes,
    });
    onClose();
  };

  const totalFee = selectedTests.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-info-muted)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16 }}>Clinical Lab Order Requisition</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Requisition will be dispatched to the Central Laboratory queue
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient banner */}
            <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{visit.patientName}</span>
                <span className="patient-id" style={{ marginLeft: 8, fontSize: 10 }}>{visit.patientId}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Dr. {visit.doctorName} ({visit.department})
              </div>
            </div>

            {/* Test Catalog Selector */}
            <div className="form-group">
              <label className="form-label">Select Laboratory Test Catalog</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  value={selectedTestId}
                  onChange={e => setSelectedTestId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {CATALOG_TESTS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) — ₹{t.price}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={handleAddTest}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Selected Tests List */}
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                SELECTED LAB TESTS ({selectedTests.length})
              </div>
              {selectedTests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedTests.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 6 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>{t.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>₹{t.price}</span>
                        <button type="button" className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleRemoveTest(t.id)}>
                          <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-default)', paddingTop: 8, marginTop: 4, fontWeight: 700, fontSize: 13 }}>
                    <span>Estimated Lab Charge:</span>
                    <span style={{ color: 'var(--color-success)' }}>₹{totalFee}</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
                  No lab tests selected yet. Choose from the catalog above.
                </div>
              )}
            </div>

            {/* Priority & Clinical Indications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT (Emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Indication / Special Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rule out anemia, fasting sample required..."
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={selectedTests.length === 0}
            >
              <CheckCircle2 size={14} /> Dispatch Requisition to Laboratory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
