import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, Edit, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import type { PharmacySupplierItem } from '../../../types';

export default function SupplierMaster() {
  const { suppliers, addSupplier, updateSupplier } = usePharmacy();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSup, setEditingSup] = useState<PharmacySupplierItem | null>(null);

  // Form State
  const [supplierCode, setSupplierCode] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [drugLicenseNo, setDrugLicenseNo] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.supplierName.toLowerCase().includes(q) ||
      s.supplierCode.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingSup(null);
    setSupplierCode(`SUP-${Math.floor(10 + Math.random() * 90)}`);
    setSupplierName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGstin('29AAACS' + Math.floor(1000 + Math.random() * 9000) + 'Q1ZN');
    setDrugLicenseNo('KA-B1-20B-' + Math.floor(10000 + Math.random() * 90000));
    setPaymentTerms('Net 30 Days');
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: PharmacySupplierItem) => {
    setEditingSup(s);
    setSupplierCode(s.supplierCode);
    setSupplierName(s.supplierName);
    setContactPerson(s.contactPerson);
    setPhone(s.phone);
    setEmail(s.email);
    setAddress(s.address);
    setGstin(s.gstin || '');
    setDrugLicenseNo(s.drugLicenseNo || '');
    setPaymentTerms(s.paymentTerms);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSup) {
      updateSupplier(editingSup.id, {
        supplierCode,
        supplierName,
        contactPerson,
        phone,
        email,
        address,
        gstin,
        drugLicenseNo,
        paymentTerms,
      });
    } else {
      addSupplier({
        supplierCode,
        supplierName,
        contactPerson,
        phone,
        email,
        address,
        gstin,
        drugLicenseNo,
        paymentTerms,
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
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pharmaceutical Distributor & Vendor Master</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Authorized medicine suppliers, drug licenses, GST credentials, and commercial payment terms
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Supplier
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Supplier Name, Code, Contact..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Suppliers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(sup => (
          <div
            key={sup.id}
            className="card"
            style={{
              padding: 20,
              borderLeft: '4px solid var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{sup.supplierName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sup.supplierCode}</div>
                </div>
                <span className="badge badge-success">{sup.status.toUpperCase()}</span>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 12, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{sup.contactPerson}: <strong>{sup.phone}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{sup.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sup.address}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                <div>DL: <strong>{sup.drugLicenseNo || 'Form 20B'}</strong></div>
                <div>Terms: <strong>{sup.paymentTerms}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(sup)}>
                <Edit size={12} /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <Truck size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">{editingSup ? 'Edit Supplier' : 'Register Pharmaceutical Supplier'}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Supplier Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={supplierCode} onChange={e => setSupplierCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supplier / Agency Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={supplierName} onChange={e => setSupplierName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-input" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax Number</label>
                    <input type="text" className="form-input" value={gstin} onChange={e => setGstin(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Drug License No. (Form 20B/21B)</label>
                    <input type="text" className="form-input" value={drugLicenseNo} onChange={e => setDrugLicenseNo(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <select className="form-select" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                      <option value="Net 15 Days">Net 15 Days</option>
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                      <option value="Immediate / Advance">Immediate / Advance</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Warehouse Address</label>
                    <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingSup ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
