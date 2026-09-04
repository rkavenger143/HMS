import React, { useState } from 'react';
import { Settings, Plus, Search, Filter, Edit, CheckCircle2, Ban, Tag, AlertTriangle } from 'lucide-react';
import { useLab } from '../context/LabContext';
import type { LabTestMasterItem, LabTestCategory } from '../../../types';

export default function LabTestMaster() {
  const { testMaster, addLabTestMaster, updateLabTestMaster, toggleLabTestStatus } = useLab();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTestMasterItem | null>(null);

  // Form State
  const [testCode, setTestCode] = useState('');
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState<LabTestCategory>('biochemistry');
  const [department, setDepartment] = useState('Clinical Biochemistry');
  const [sampleType, setSampleType] = useState('Serum');
  const [containerType, setContainerType] = useState('SST / Gel (Gold/Yellow Top)');
  const [sampleVolume, setSampleVolume] = useState('3.0 ml');
  const [turnaroundHours, setTurnaroundHours] = useState(3);
  const [price, setPrice] = useState(500);
  const [fastingRequired, setFastingRequired] = useState(false);
  const [preparationInstructions, setPreparationInstructions] = useState('');

  const filteredTests = testMaster.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.testName.toLowerCase().includes(q) ||
      t.testCode.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingTest(null);
    setTestCode(`TEST-${Math.floor(10 + Math.random() * 90)}`);
    setTestName('');
    setCategory('biochemistry');
    setDepartment('Clinical Biochemistry');
    setSampleType('Serum');
    setContainerType('SST / Gel (Gold/Yellow Top)');
    setSampleVolume('3.0 ml');
    setTurnaroundHours(3);
    setPrice(500);
    setFastingRequired(false);
    setPreparationInstructions('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (test: LabTestMasterItem) => {
    setEditingTest(test);
    setTestCode(test.testCode);
    setTestName(test.testName);
    setCategory(test.category);
    setDepartment(test.department);
    setSampleType(test.sampleType);
    setContainerType(test.containerType);
    setSampleVolume(test.sampleVolume);
    setTurnaroundHours(test.turnaroundHours);
    setPrice(test.price);
    setFastingRequired(test.fastingRequired);
    setPreparationInstructions(test.preparationInstructions || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTest) {
      updateLabTestMaster(editingTest.id, {
        testCode,
        testName,
        category,
        department,
        sampleType,
        containerType,
        sampleVolume,
        turnaroundHours: Number(turnaroundHours) || 3,
        price: Number(price) || 0,
        fastingRequired,
        preparationInstructions,
      });
    } else {
      addLabTestMaster({
        testCode,
        testName,
        category,
        department,
        sampleType,
        containerType,
        sampleVolume,
        turnaroundHours: Number(turnaroundHours) || 3,
        price: Number(price) || 0,
        fastingRequired,
        preparationInstructions,
        isActive: true,
        parameters: [
          {
            id: `p-${Date.now()}`,
            parameterName: testName,
            unit: 'U/L',
            referenceRangeMale: 'Standard Biological Range',
            referenceRangeFemale: 'Standard Biological Range',
            format: 'numeric',
          },
        ],
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Investigation Test Master Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configurable test catalog, specimen containers, reference intervals, turnaround targets, and standard pricing
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Lab Test to Master
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Test Name, Code, Department..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories ({testMaster.length})</option>
            <option value="hematology">Hematology</option>
            <option value="biochemistry">Biochemistry</option>
            <option value="urine">Urine & Stool</option>
            <option value="hormones">Hormones & Endocrinology</option>
            <option value="serology">Serology & Immunology</option>
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code & Test Name</th>
                  <th>Category & Department</th>
                  <th>Specimen & Tube Container</th>
                  <th>Target TAT</th>
                  <th>Price (₹)</th>
                  <th>Fasting Policy</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map(test => (
                  <tr key={test.id} style={{ opacity: test.isActive ? 1 : 0.6 }}>
                    <td>
                      <strong style={{ fontSize: 13 }}>{test.testName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{test.testCode} · {test.parameters.length} Parameter(s)</div>
                    </td>

                    <td>
                      <span className="badge badge-primary">{test.category.toUpperCase()}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{test.department}</div>
                    </td>

                    <td>
                      <div>{test.sampleType} ({test.sampleVolume})</div>
                      <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{test.containerType}</div>
                    </td>

                    <td>
                      <strong>{test.turnaroundHours} Hours</strong>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{test.price}</strong>
                    </td>

                    <td>
                      {test.fastingRequired ? (
                        <span className="badge badge-warning" style={{ fontSize: 10 }}>⚠️ Fasting Required</span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Nil Fasting</span>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${test.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {test.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleOpenEdit(test)} title="Edit Test Master">
                          <Edit size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          onClick={() => toggleLabTestStatus(test.id)}
                          title={test.isActive ? 'Deactivate Test' : 'Activate Test'}
                        >
                          <Ban size={13} style={{ color: test.isActive ? 'var(--color-warning)' : 'var(--color-success)' }} />
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

      {/* Add / Edit Test Master Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <Tag size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">{editingTest ? 'Edit Lab Test Master' : 'Add New Lab Test to Directory'}</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Test Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={testCode} onChange={e => setTestCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Test Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={testName} onChange={e => setTestName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Test Category</label>
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                      <option value="hematology">Hematology</option>
                      <option value="biochemistry">Biochemistry</option>
                      <option value="clinical_pathology">Clinical Pathology</option>
                      <option value="microbiology">Microbiology</option>
                      <option value="serology">Serology</option>
                      <option value="immunology">Immunology</option>
                      <option value="hormones">Hormones</option>
                      <option value="urine">Urine Tests</option>
                      <option value="stool">Stool Tests</option>
                      <option value="other">Other Diagnostics</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sample Specimen Type</label>
                    <input type="text" className="form-input" value={sampleType} onChange={e => setSampleType(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Collection Container</label>
                    <input type="text" className="form-input" value={containerType} onChange={e => setContainerType(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Required Volume</label>
                    <input type="text" className="form-input" value={sampleVolume} onChange={e => setSampleVolume(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Turnaround Time (Hours)</label>
                    <input type="number" className="form-input" value={turnaroundHours} onChange={e => setTurnaroundHours(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Standard Price (₹) <span className="required">*</span></label>
                    <input type="number" className="form-input" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={fastingRequired} onChange={e => setFastingRequired(e.target.checked)} />
                      <span style={{ fontWeight: 700, color: fastingRequired ? 'var(--color-warning)' : undefined }}>
                        Fasting Required
                      </span>
                    </label>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Preparation Instructions</label>
                    <input type="text" className="form-input" placeholder="e.g. 8-10 hours overnight fasting required..." value={preparationInstructions} onChange={e => setPreparationInstructions(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingTest ? 'Update Test' : 'Save Test Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
