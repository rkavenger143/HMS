import React, { useState } from 'react';
import { Tag, Plus, Search, Filter, Edit, CheckCircle2, Ban } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import type { RadiologyExaminationItem, RadiologyModalityType } from '../../../types';

export default function ExaminationMaster() {
  const { examinations, addExamMaster, updateExamMaster, toggleExamStatus } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<RadiologyExaminationItem | null>(null);

  // Form State
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');
  const [modalityType, setModalityType] = useState<RadiologyModalityType>('ct');
  const [bodyPart, setBodyPart] = useState('Chest / Thorax');
  const [description, setDescription] = useState('');
  const [preparationInstructions, setPreparationInstructions] = useState('');
  const [contrastRequired, setContrastRequired] = useState(false);
  const [fastingRequired, setFastingRequired] = useState(false);
  const [estimatedDurationMins, setEstimatedDurationMins] = useState(20);
  const [turnaroundHours, setTurnaroundHours] = useState(4);
  const [price, setPrice] = useState(3500);

  const filtered = examinations.filter(ex => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ex.examName.toLowerCase().includes(q) ||
      ex.examCode.toLowerCase().includes(q) ||
      ex.bodyPart.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ex.modalityType === selectedModality;
    return matchesSearch && matchesMod;
  });

  const handleOpenAdd = () => {
    setEditingExam(null);
    setExamCode(`RAD-EX-${Math.floor(100 + Math.random() * 900)}`);
    setExamName('');
    setModalityType('ct');
    setBodyPart('Brain / Cranium');
    setDescription('');
    setPreparationInstructions('Standard patient positioning.');
    setContrastRequired(false);
    setFastingRequired(false);
    setEstimatedDurationMins(20);
    setTurnaroundHours(4);
    setPrice(3500);
    setShowAddModal(true);
  };

  const handleOpenEdit = (ex: RadiologyExaminationItem) => {
    setEditingExam(ex);
    setExamCode(ex.examCode);
    setExamName(ex.examName);
    setModalityType(ex.modalityType);
    setBodyPart(ex.bodyPart);
    setDescription(ex.description);
    setPreparationInstructions(ex.preparationInstructions);
    setContrastRequired(ex.contrastRequired);
    setFastingRequired(ex.fastingRequired);
    setEstimatedDurationMins(ex.estimatedDurationMins);
    setTurnaroundHours(ex.turnaroundHours);
    setPrice(ex.price);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExam) {
      updateExamMaster(editingExam.id, {
        examCode,
        examName,
        modalityType,
        bodyPart,
        description,
        preparationInstructions,
        contrastRequired,
        fastingRequired,
        estimatedDurationMins: Number(estimatedDurationMins) || 20,
        turnaroundHours: Number(turnaroundHours) || 4,
        price: Number(price) || 0,
      });
    } else {
      addExamMaster({
        examCode,
        examName,
        modalityType,
        bodyPart,
        description,
        preparationInstructions,
        contrastRequired,
        fastingRequired,
        estimatedDurationMins: Number(estimatedDurationMins) || 20,
        turnaroundHours: Number(turnaroundHours) || 4,
        price: Number(price) || 0,
        isActive: true,
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Investigation & Examination Master Catalog</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configurable imaging procedures, anatomical regions, preparation protocols, and pricing
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Examination
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
              placeholder="Search Examination Name, Code, Body Part..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedModality} onChange={e => setSelectedModality(e.target.value)}>
            <option value="ALL">All Modalities ({examinations.length})</option>
            <option value="xray">X-Ray</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="mammography">Mammography</option>
            <option value="dexa">DEXA</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code & Examination Name</th>
                  <th>Modality & Body Part</th>
                  <th>Duration</th>
                  <th>Target TAT</th>
                  <th>Price (₹)</th>
                  <th>Contrast / Fasting</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ex => (
                  <tr key={ex.id} style={{ opacity: ex.isActive ? 1 : 0.6 }}>
                    <td>
                      <strong style={{ fontSize: 13 }}>{ex.examName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ex.examCode}</div>
                    </td>

                    <td>
                      <span className="badge badge-primary">{ex.modalityType.toUpperCase()}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{ex.bodyPart}</div>
                    </td>

                    <td>
                      <div>{ex.estimatedDurationMins} Mins</div>
                    </td>

                    <td>
                      <strong>{ex.turnaroundHours} Hours</strong>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{ex.price}</strong>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {ex.contrastRequired && <span className="badge badge-warning" style={{ fontSize: 9 }}>IV Contrast</span>}
                        {ex.fastingRequired && <span className="badge badge-neutral" style={{ fontSize: 9 }}>Fasting</span>}
                        {!ex.contrastRequired && !ex.fastingRequired && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Standard</span>}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${ex.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {ex.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleOpenEdit(ex)} title="Edit Exam">
                          <Edit size={13} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => toggleExamStatus(ex.id)} title={ex.isActive ? 'Deactivate' : 'Activate'}>
                          <Ban size={13} style={{ color: ex.isActive ? 'var(--color-warning)' : 'var(--color-success)' }} />
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

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <Tag size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">{editingExam ? 'Edit Examination Master' : 'Add Examination to Catalog'}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Exam Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={examCode} onChange={e => setExamCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Examination Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={examName} onChange={e => setExamName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modality Type</label>
                    <select className="form-select" value={modalityType} onChange={e => setModalityType(e.target.value as any)}>
                      <option value="xray">Digital Radiography (X-Ray)</option>
                      <option value="ct">Computed Tomography (CT)</option>
                      <option value="mri">Magnetic Resonance Imaging (MRI)</option>
                      <option value="ultrasound">Ultrasound & Doppler</option>
                      <option value="mammography">Mammography</option>
                      <option value="dexa">DEXA Bone Density</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Anatomical Body Part <span className="required">*</span></label>
                    <input type="text" className="form-input" value={bodyPart} onChange={e => setBodyPart(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimated Scan Duration (Minutes)</label>
                    <input type="number" className="form-input" value={estimatedDurationMins} onChange={e => setEstimatedDurationMins(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Turnaround Time (Hours)</label>
                    <input type="number" className="form-input" value={turnaroundHours} onChange={e => setTurnaroundHours(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Standard Price (₹) <span className="required">*</span></label>
                    <input type="number" className="form-input" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 18 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                      <input type="checkbox" checked={contrastRequired} onChange={e => setContrastRequired(e.target.checked)} />
                      <span>IV Contrast Required</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                      <input type="checkbox" checked={fastingRequired} onChange={e => setFastingRequired(e.target.checked)} />
                      <span>Dietary Fasting Required</span>
                    </label>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Patient Preparation Instructions</label>
                    <input type="text" className="form-input" value={preparationInstructions} onChange={e => setPreparationInstructions(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingExam ? 'Update Examination' : 'Save Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
