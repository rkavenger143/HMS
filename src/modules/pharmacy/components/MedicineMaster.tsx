import React, { useState } from 'react';
import { Pill, Plus, Search, Filter, Edit, Ban, CheckCircle2, Tag } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import type {
  ComprehensiveMedicineItem,
  MedicineCategory,
  DosageForm,
  MedicineClassification,
} from '../../../types';

export default function MedicineMaster() {
  const { medicines, addMedicineMaster, updateMedicineMaster, toggleMedicineStatus } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState<ComprehensiveMedicineItem | null>(null);

  // Form State
  const [medicineCode, setMedicineCode] = useState('');
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('antibiotics');
  const [dosageForm, setDosageForm] = useState<DosageForm>('tablet');
  const [strength, setStrength] = useState('500mg');
  const [unit, setUnit] = useState('Strip (10 Tab)');
  const [manufacturer, setManufacturer] = useState('');
  const [packSize, setPackSize] = useState(10);
  const [hsnCode, setHsnCode] = useState('30049099');
  const [gstRate, setGstRate] = useState(12);
  const [purchasePrice, setPurchasePrice] = useState(50);
  const [sellingPrice, setSellingPrice] = useState(75);
  const [reorderLevel, setReorderLevel] = useState(30);
  const [maxStockLevel, setMaxStockLevel] = useState(300);
  const [classification, setClassification] = useState<MedicineClassification>('schedule_h');
  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [storageLocation, setStorageLocation] = useState('Rack A-05');

  const filtered = medicines.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.medicineCode.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedicineCode(`MED-${Math.floor(100 + Math.random() * 900)}`);
    setBrandName('');
    setGenericName('');
    setCategory('antibiotics');
    setDosageForm('tablet');
    setStrength('500mg');
    setUnit('Strip (10 Tab)');
    setManufacturer('Cipla Ltd');
    setPackSize(10);
    setHsnCode('30049099');
    setGstRate(12);
    setPurchasePrice(50);
    setSellingPrice(75);
    setReorderLevel(30);
    setMaxStockLevel(300);
    setClassification('schedule_h');
    setPrescriptionRequired(true);
    setStorageLocation('Rack B-01');
    setShowAddModal(true);
  };

  const handleOpenEdit = (med: ComprehensiveMedicineItem) => {
    setEditingMed(med);
    setMedicineCode(med.medicineCode);
    setBrandName(med.brandName);
    setGenericName(med.genericName);
    setCategory(med.category);
    setDosageForm(med.dosageForm);
    setStrength(med.strength);
    setUnit(med.unit);
    setManufacturer(med.manufacturer);
    setPackSize(med.packSize);
    setHsnCode(med.hsnCode || '30049099');
    setGstRate(med.gstRate);
    setPurchasePrice(med.purchasePrice);
    setSellingPrice(med.sellingPrice);
    setReorderLevel(med.reorderLevel);
    setMaxStockLevel(med.maxStockLevel);
    setClassification(med.classification);
    setPrescriptionRequired(med.prescriptionRequired);
    setStorageLocation(med.storageLocation || 'Rack A-01');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMed) {
      updateMedicineMaster(editingMed.id, {
        medicineCode,
        brandName,
        genericName,
        category,
        dosageForm,
        strength,
        unit,
        manufacturer,
        packSize: Number(packSize),
        hsnCode,
        gstRate: Number(gstRate),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        reorderLevel: Number(reorderLevel),
        maxStockLevel: Number(maxStockLevel),
        classification,
        prescriptionRequired,
        storageLocation,
      });
    } else {
      addMedicineMaster({
        medicineCode,
        brandName,
        genericName,
        category,
        dosageForm,
        strength,
        unit,
        manufacturer,
        packSize: Number(packSize),
        hsnCode,
        gstRate: Number(gstRate),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        reorderLevel: Number(reorderLevel),
        maxStockLevel: Number(maxStockLevel),
        classification,
        prescriptionRequired,
        isActive: true,
        storageLocation,
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
            <Pill size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmaceutical Formulary & Medicine Master Catalog</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configurable generic compositions, drug strengths, dosage forms, schedule classifications, and pricing
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Medicine
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Brand, Generic, Manufacturer..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories ({medicines.length})</option>
            <option value="antibiotics">Antibiotics</option>
            <option value="analgesics">Analgesics & Antipyretics</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="antidiabetics">Antidiabetics</option>
            <option value="gastrointestinal">Gastrointestinal</option>
            <option value="respiratory">Respiratory</option>
            <option value="iv_fluids">IV Fluids</option>
            <option value="vitamins">Vitamins & Minerals</option>
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
                  <th>Brand & Generic Name</th>
                  <th>Form & Strength</th>
                  <th>Category</th>
                  <th>Schedule / Rx</th>
                  <th>Total Stock</th>
                  <th>Purchase Price</th>
                  <th>Selling Price (MRP)</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(med => {
                  const isLow = med.totalStock <= med.reorderLevel;

                  return (
                    <tr key={med.id} style={{ opacity: med.isActive ? 1 : 0.6 }}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{med.brandName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {med.genericName} · {med.medicineCode}
                        </div>
                      </td>

                      <td>
                        <div>{med.strength}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                          {med.dosageForm} · {med.unit}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {med.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${med.classification === 'narcotic_controlled' ? 'badge-danger' : med.classification === 'schedule_h1' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: 10 }}>
                          {med.classification.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      <td>
                        <strong style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {med.totalStock}
                        </strong>
                        {isLow && <div style={{ fontSize: 10, color: 'var(--color-danger)' }}>REORDER</div>}
                      </td>

                      <td>
                        <div>₹{med.purchasePrice.toFixed(2)}</div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>₹{med.sellingPrice.toFixed(2)}</strong>
                      </td>

                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{med.storageLocation || '—'}</div>
                      </td>

                      <td>
                        <span className={`badge ${med.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {med.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => handleOpenEdit(med)} title="Edit Medicine">
                            <Edit size={13} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => toggleMedicineStatus(med.id)} title={med.isActive ? 'Deactivate' : 'Activate'}>
                            <Ban size={13} style={{ color: med.isActive ? 'var(--color-warning)' : 'var(--color-success)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
            <div className="modal-header">
              <Pill size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">{editingMed ? 'Edit Medicine Master' : 'Add New Medicine to Master'}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Medicine Item Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={medicineCode} onChange={e => setMedicineCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand / Trade Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={brandName} onChange={e => setBrandName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Generic / Chemical Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={genericName} onChange={e => setGenericName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Therapeutic Category</label>
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                      <option value="antibiotics">Antibiotics</option>
                      <option value="analgesics">Analgesics & Antipyretics</option>
                      <option value="cardiovascular">Cardiovascular</option>
                      <option value="antidiabetics">Antidiabetics</option>
                      <option value="gastrointestinal">Gastrointestinal</option>
                      <option value="respiratory">Respiratory</option>
                      <option value="iv_fluids">IV Fluids</option>
                      <option value="vitamins">Vitamins & Minerals</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="neurology">Neurology</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dosage Form</label>
                    <select className="form-select" value={dosageForm} onChange={e => setDosageForm(e.target.value as any)}>
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="syrup">Syrup</option>
                      <option value="suspension">Suspension</option>
                      <option value="injection">Injection</option>
                      <option value="iv_infusion">IV Infusion</option>
                      <option value="inhaler">Inhaler / Respirator</option>
                      <option value="cream">Cream / Ointment</option>
                      <option value="drops">Drops</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Drug Strength <span className="required">*</span></label>
                    <input type="text" className="form-input" value={strength} onChange={e => setStrength(e.target.value)} placeholder="e.g. 500mg, 1g" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Packaging Unit & Size <span className="required">*</span></label>
                    <input type="text" className="form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Strip (10 Tab), Vial" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manufacturer Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Rate per Unit (₹) <span className="required">*</span></label>
                    <input type="number" step="0.01" className="form-input" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selling MRP per Unit (₹) <span className="required">*</span></label>
                    <input type="number" step="0.01" className="form-input" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Reorder Level (Units)</label>
                    <input type="number" className="form-input" value={reorderLevel} onChange={e => setReorderLevel(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Regulatory Classification</label>
                    <select className="form-select" value={classification} onChange={e => setClassification(e.target.value as any)}>
                      <option value="normal">Normal / OTC</option>
                      <option value="prescription_required">Prescription Required</option>
                      <option value="schedule_h">Schedule H</option>
                      <option value="schedule_h1">Schedule H1 (High-Alert)</option>
                      <option value="narcotic_controlled">Schedule X / Narcotic Controlled</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Dispensary Storage Location / Rack</label>
                    <input type="text" className="form-input" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingMed ? 'Update Drug Master' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
