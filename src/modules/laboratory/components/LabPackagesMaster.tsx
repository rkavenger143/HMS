import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit, CheckCircle2, Ban } from 'lucide-react';
import { useLab } from '../context/LabContext';
import type { LabPackageMasterItem } from '../../../types';

export default function LabPackagesMaster() {
  const { packageMaster, testMaster, addLabPackage, updateLabPackage, toggleLabPackageStatus } = useLab();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<LabPackageMasterItem | null>(null);

  // Form State
  const [packageCode, setPackageCode] = useState('');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1500);
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  const filtered = packageMaster.filter(p => {
    const q = search.toLowerCase();
    return (
      !search ||
      p.packageName.toLowerCase().includes(q) ||
      p.packageCode.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setPackageCode(`PKG-${Math.floor(100 + Math.random() * 900)}`);
    setPackageName('');
    setDescription('');
    setPrice(1500);
    setDiscountPercentage(15);
    setSelectedTestIds(['test-cbc', 'test-lft']);
    setShowAddModal(true);
  };

  const handleOpenEdit = (pkg: LabPackageMasterItem) => {
    setEditingPkg(pkg);
    setPackageCode(pkg.packageCode);
    setPackageName(pkg.packageName);
    setDescription(pkg.description || '');
    setPrice(pkg.price);
    setDiscountPercentage(pkg.discountPercentage);
    setSelectedTestIds(pkg.testIds);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPkg) {
      updateLabPackage(editingPkg.id, {
        packageCode,
        packageName,
        description,
        price: Number(price) || 0,
        discountPercentage: Number(discountPercentage) || 0,
        testIds: selectedTestIds,
      });
    } else {
      addLabPackage({
        packageCode,
        packageName,
        description,
        price: Number(price) || 0,
        discountPercentage: Number(discountPercentage) || 0,
        testIds: selectedTestIds,
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
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Diagnostic Profiles & Health Packages Directory</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bundled test panels, discounted wellness packages, constituent investigations, and package pricing
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Health Package
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Package Name, Code..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(pkg => {
          const constituentTests = testMaster.filter(t => pkg.testIds.includes(t.id));

          return (
            <div
              key={pkg.id}
              className="card"
              style={{
                padding: 20,
                borderLeft: '4px solid var(--color-primary)',
                opacity: pkg.isActive ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{pkg.packageName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{pkg.packageCode}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-primary)' }}>₹{pkg.price}</div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>{pkg.discountPercentage}% DISCOUNT</span>
                </div>
              </div>

              {pkg.description && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {pkg.description}
                </div>
              )}

              {/* Included Tests Chips */}
              <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                  INCLUDED INVESTIGATIONS ({constituentTests.length})
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {constituentTests.map(t => (
                    <span key={t.id} className="badge badge-neutral" style={{ fontSize: 11 }}>
                      {t.testName}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${pkg.isActive ? 'badge-success' : 'badge-neutral'}`}>
                  {pkg.isActive ? 'ACTIVE PACKAGE' : 'INACTIVE'}
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(pkg)}>
                    <Edit size={12} /> Edit Package
                  </button>
                  <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => toggleLabPackageStatus(pkg.id)}>
                    <Ban size={13} style={{ color: pkg.isActive ? 'var(--color-warning)' : 'var(--color-success)' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <Package size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">{editingPkg ? 'Edit Health Check Package' : 'Create Health Check Package'}</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Package Code <span className="required">*</span></label>
                    <input type="text" className="form-input" value={packageCode} onChange={e => setPackageCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Package Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={packageName} onChange={e => setPackageName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Package Bundle Price (₹) <span className="required">*</span></label>
                    <input type="number" className="form-input" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input type="number" className="form-input" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Package Clinical Description</label>
                    <input type="text" className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Constituent Investigations ({selectedTestIds.length} Selected)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', background: 'var(--bg-surface)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                      {testMaster.map(t => (
                        <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={selectedTestIds.includes(t.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedTestIds(prev => [...prev, t.id]);
                              } else {
                                setSelectedTestIds(prev => prev.filter(id => id !== t.id));
                              }
                            }}
                          />
                          <span>{t.testName} ({t.testCode}) — ₹{t.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingPkg ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
