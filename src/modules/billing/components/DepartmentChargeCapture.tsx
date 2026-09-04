import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';
import type { BillingDepartment } from '../../../types';

export default function DepartmentChargeCapture() {
  const { departmentCharges, serviceMasters, addDepartmentCharge } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBilledStatus, setSelectedBilledStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Charge Form State
  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]?.id || 'ALN-2026-00001');
  const [department, setDepartment] = useState<BillingDepartment>('opd');
  const [serviceCode, setServiceCode] = useState(serviceMasters[0]?.serviceCode || 'OPD-CONS-GEN');
  const [description, setDescription] = useState('General Consultation Service');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(500);
  const [taxRate, setTaxRate] = useState(0);
  const [createdBy, setCreatedBy] = useState('Dr. Rajesh Sharma');

  const filtered = departmentCharges.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.patientId.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.sourceRecordId.toLowerCase().includes(q) ||
      c.createdBy.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
    const matchesBilled =
      selectedBilledStatus === 'ALL' ||
      (selectedBilledStatus === 'billed' && c.isBilled) ||
      (selectedBilledStatus === 'unbilled' && !c.isBilled);

    return matchesSearch && matchesDept && matchesBilled;
  });

  const handleSelectService = (srvCode: string) => {
    setServiceCode(srvCode);
    const srv = serviceMasters.find(s => s.serviceCode === srvCode);
    if (srv) {
      setDescription(srv.serviceName);
      setUnitPrice(srv.basePrice);
      setTaxRate(srv.gstRate);
      setDepartment(srv.department);
    }
  };

  const handleSaveCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = DEMO_PATIENTS.find(p => p.id === patientId) || DEMO_PATIENTS[0];

    addDepartmentCharge({
      patientId: patient.id,
      department,
      sourceModule: department,
      sourceRecordId: `MANUAL-${Date.now().toString().slice(-6)}`,
      serviceCode,
      description,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      discountAmount: 0,
      taxRate: Number(taxRate),
      totalAmount: Number(quantity) * Number(unitPrice) * (1 + Number(taxRate) / 100),
      chargeDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdBy,
    });

    alert('Charge captured and attached to patient account.');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Central Multi-Department Charge Ingestion Engine</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Idempotent charge capture from OPD, IPD, Laboratory, Radiology, Pharmacy, Nursing, and Emergency casualty
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} /> Capture Manual Charge
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
              placeholder="Search Charge, Patient UHID, Ref #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="ALL">All Departments</option>
            <option value="opd">OPD Consultations</option>
            <option value="ipd">IPD Inpatient & Beds</option>
            <option value="laboratory">Laboratory Pathology</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="pharmacy">Pharmacy Dispensary</option>
            <option value="nursing">Nursing Procedures</option>
            <option value="emergency">Emergency Casualty</option>
          </select>

          <select className="form-select" value={selectedBilledStatus} onChange={e => setSelectedBilledStatus(e.target.value)}>
            <option value="ALL">All Invoicing Statuses</option>
            <option value="unbilled">Unbilled (Awaiting Invoice)</option>
            <option value="billed">Billed (Attached to Invoice)</option>
          </select>
        </div>
      </div>

      {/* Charges Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp & Ref #</th>
                  <th>Patient UHID</th>
                  <th>Department</th>
                  <th>Service Description & Code</th>
                  <th>Qty</th>
                  <th>Unit Rate (₹)</th>
                  <th>Total Amount (₹)</th>
                  <th>Created By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div>{c.chargeDate}</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {c.sourceRecordId}
                      </div>
                    </td>

                    <td>
                      <strong>{c.patientId}</strong>
                    </td>

                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        {c.department}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: 13 }}>{c.description}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SAC: {c.serviceCode}</div>
                    </td>

                    <td>{c.quantity}</td>
                    <td>₹{c.unitPrice.toFixed(2)}</td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{c.totalAmount.toFixed(2)}</strong>
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{c.createdBy}</div>
                    </td>

                    <td>
                      <span className={`badge ${c.isBilled ? 'badge-success' : 'badge-warning'}`}>
                        {c.isBilled ? 'INVOICED' : 'UNBILLED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Charge Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <Activity size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Capture Department Billable Charge</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Manual clinical service, procedure or supply entry</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSaveCharge}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Patient <span className="required">*</span></label>
                    <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                      {DEMO_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} — {p.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Billable Service Master</label>
                    <select className="form-select" value={serviceCode} onChange={e => handleSelectService(e.target.value)}>
                      {serviceMasters.map(s => (
                        <option key={s.id} value={s.serviceCode}>
                          [{s.department.toUpperCase()}] {s.serviceName} (₹{s.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Service Description</label>
                    <input type="text" className="form-input" value={description} onChange={e => setDescription(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" min="1" className="form-input" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Rate (₹)</label>
                    <input type="number" step="0.01" className="form-input" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} required />
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
                    <label className="form-label">Authorized By Doctor / Nurse</label>
                    <input type="text" className="form-input" value={createdBy} onChange={e => setCreatedBy(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Capture Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
