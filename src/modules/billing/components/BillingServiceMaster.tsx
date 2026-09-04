import React, { useState } from 'react';
import { Layers, Plus, Search, Filter, Edit, CheckCircle2, DollarSign } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import type { BillingServiceItem, BillingDepartment } from '../../../types';

export default function BillingServiceMaster() {
  const { serviceMasters, addServiceMaster, updateServiceMaster, toggleServiceStatus } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<BillingServiceItem | null>(null);

  // Form State
  const [serviceCode, setServiceCode] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [department, setDepartment] = useState<BillingDepartment>('opd');
  const [category, setCategory] = useState('Consultation');
  const [basePrice, setBasePrice] = useState(500);
  const [gstRate, setGstRate] = useState(0);
  const [hsnCode, setHsnCode] = useState('999311');
  const [discountAllowed, setDiscountAllowed] = useState(true);
  const [insuranceEligible, setInsuranceEligible] = useState(true);

  const filtered = serviceMasters.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.serviceName.toLowerCase().includes(q) ||
      s.serviceCode.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setServiceCode(`SRV-${Math.floor(100 + Math.random() * 900)}`);
    setServiceName('');
    setDepartment('opd');
    setCategory('General');
    setBasePrice(500);
    setGstRate(0);
    setHsnCode('999311');
    setDiscountAllowed(true);
    setInsuranceEligible(true);
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: BillingServiceItem) => {
    setEditingService(s);
    setServiceCode(s.serviceCode);
    setServiceName(s.serviceName);
    setDepartment(s.department);
    setCategory(s.category);
    setBasePrice(s.basePrice);
    setGstRate(s.gstRate);
    setHsnCode(s.hsnCode || '999311');
    setDiscountAllowed(s.discountAllowed);
    setInsuranceEligible(s.insuranceEligible);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      updateServiceMaster(editingService.id, {
        serviceCode,
        serviceName,
        department,
        category,
        basePrice: Number(basePrice),
        gstRate: Number(gstRate),
        hsnCode,
        discountAllowed,
        insuranceEligible,
      });
    } else {
      addServiceMaster({
        serviceCode,
        serviceName,
        department,
        category,
        basePrice: Number(basePrice),
        gstRate: Number(gstRate),
        hsnCode,
        discountAllowed,
        insuranceEligible,
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
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Standard Service & Pricing Master Tariff</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configured standard price points, HSN/SAC statutory codes, and GST rates across all clinical departments
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Billable Service
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Service Name, Code, Category..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="ALL">All Departments ({serviceMasters.length})</option>
            <option value="opd">OPD Consultations</option>
            <option value="ipd">IPD Inpatient & Beds</option>
            <option value="laboratory">Laboratory Pathology</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="nursing">Nursing</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Code</th>
                  <th>Service Description</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Base Tariff (₹)</th>
                  <th>SAC Code</th>
                  <th>GST Rate</th>
                  <th>Insurance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{s.serviceCode}</strong>
                    </td>

                    <td>
                      <strong>{s.serviceName}</strong>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        {s.department}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{s.category}</span>
                    </td>

                    <td>
                      <strong style={{ fontSize: 14, color: 'var(--color-primary)' }}>₹{s.basePrice.toLocaleString()}</strong>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.hsnCode || '999311'}</span>
                    </td>

                    <td>
                      <div>{s.gstRate}%</div>
                    </td>

                    <td>
                      <span className={`badge ${s.insuranceEligible ? 'badge-success' : 'badge-neutral'}`}>
                        {s.insuranceEligible ? 'YES' : 'NO'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(s)}>
                        <Edit size={11} /> Edit
                      </button>
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
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <Layers size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">{editingService ? 'Edit Billable Service Tariff' : 'Add Billable Service Tariff'}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Service Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={serviceCode} onChange={e => setServiceCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={department} onChange={e => setDepartment(e.target.value as any)}>
                      <option value="opd">OPD Consultation</option>
                      <option value="ipd">IPD Inpatient</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="radiology">Radiology</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="nursing">Nursing</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" className="form-input" value={category} onChange={e => setCategory(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Base Price (₹) <span className="required">*</span></label>
                    <input type="number" step="10" min="0" className="form-input" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SAC / HSN Code</label>
                    <input type="text" className="form-input" value={hsnCode} onChange={e => setHsnCode(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST Rate (%)</label>
                    <select className="form-select" value={gstRate} onChange={e => setGstRate(Number(e.target.value))}>
                      <option value="0">0% (Healthcare Exempt)</option>
                      <option value="5">5% (Medical Supplies)</option>
                      <option value="12">12% (Medicines / Pharmaceuticals)</option>
                      <option value="18">18% (Standard Commercial)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingService ? 'Update Tariff' : 'Save Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
