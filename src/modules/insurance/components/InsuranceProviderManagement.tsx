// ============================================================
// ALN Cure HMS — Insurance Provider Management Component
// ============================================================

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  Shield,
  Layers,
  Percent,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import { useToast } from '../../../contexts/ToastContext';
import type { InsuranceProvider, InsuranceProviderType, ProviderStatus } from '../../../types/insurance';

export default function InsuranceProviderManagement() {
  const { providers, addProvider, updateProvider, toggleProviderStatus } = useInsurance();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentProvider, setCurrentProvider] = useState<Partial<InsuranceProvider>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const filteredProviders = providers.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.companyName.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q));

    const matchesType = selectedType === 'ALL' || p.providerType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormError(null);
    setCurrentProvider({
      companyName: '',
      code: '',
      providerType: 'private',
      contactPerson: '',
      phone: '',
      tollFree: '',
      email: '',
      claimEmail: '',
      address: '',
      website: '',
      portalUrl: '',
      status: 'active',
      discountPercent: 0,
      empanelledDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: InsuranceProvider) => {
    setModalMode('edit');
    setFormError(null);
    setCurrentProvider({ ...p });
    setShowModal(true);
  };

  const handleOpenView = (p: InsuranceProvider) => {
    setModalMode('view');
    setFormError(null);
    setCurrentProvider({ ...p });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = currentProvider.companyName?.trim();
    const code = currentProvider.code?.trim().toUpperCase();
    const type = currentProvider.providerType as InsuranceProviderType;
    const contact = currentProvider.contactPerson?.trim();
    const phone = currentProvider.phone?.trim();
    const email = currentProvider.email?.trim();
    const address = currentProvider.address?.trim();
    const status = (currentProvider.status as ProviderStatus) || 'active';

    // Required Field Validations
    if (!name) {
      setFormError('Provider Name is required.');
      return;
    }
    if (!code) {
      setFormError('Provider Code is required (e.g., STAR-HLTH, PM-JAY).');
      return;
    }
    if (!contact) {
      setFormError('Nodal Contact Person is required.');
      return;
    }
    if (!phone) {
      setFormError('Mobile / Phone number is required.');
      return;
    }
    if (!email || !email.includes('@')) {
      setFormError('A valid Official Email Address is required.');
      return;
    }
    if (!address) {
      setFormError('Registered Office Address is required.');
      return;
    }

    // Duplicate Checks (Case-Insensitive for Name & Code)
    const duplicateName = providers.find(
      p => p.companyName.trim().toLowerCase() === name.toLowerCase() && (modalMode === 'add' || p.id !== currentProvider.id)
    );
    if (duplicateName) {
      setFormError(`An insurance provider with the name "${name}" already exists.`);
      toast.error(`Provider name "${name}" is already registered.`);
      return;
    }

    const duplicateCode = providers.find(
      p => p.code.trim().toUpperCase() === code.toUpperCase() && (modalMode === 'add' || p.id !== currentProvider.id)
    );
    if (duplicateCode) {
      setFormError(`Provider Code "${code}" is already in use by ${duplicateCode.companyName}.`);
      toast.error(`Provider Code "${code}" is already assigned.`);
      return;
    }

    try {
      if (modalMode === 'add') {
        addProvider({
          companyName: name,
          code: code,
          providerType: type || 'private',
          contactPerson: contact,
          phone: phone,
          tollFree: currentProvider.tollFree?.trim() || undefined,
          email: email,
          claimEmail: currentProvider.claimEmail?.trim() || undefined,
          address: address,
          website: currentProvider.website?.trim() || undefined,
          portalUrl: currentProvider.portalUrl?.trim() || undefined,
          status: status,
          discountPercent: Number(currentProvider.discountPercent || 0),
          empanelledDate: currentProvider.empanelledDate || new Date().toISOString().split('T')[0],
          tpaName: currentProvider.tpaName?.trim() || undefined
        });
      } else if (modalMode === 'edit' && currentProvider.id) {
        updateProvider(currentProvider.id, {
          companyName: name,
          code: code,
          providerType: type || 'private',
          contactPerson: contact,
          phone: phone,
          tollFree: currentProvider.tollFree?.trim() || undefined,
          email: email,
          claimEmail: currentProvider.claimEmail?.trim() || undefined,
          address: address,
          website: currentProvider.website?.trim() || undefined,
          portalUrl: currentProvider.portalUrl?.trim() || undefined,
          status: status,
          discountPercent: Number(currentProvider.discountPercent || 0),
          empanelledDate: currentProvider.empanelledDate || new Date().toISOString().split('T')[0],
          tpaName: currentProvider.tpaName?.trim() || undefined
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save insurance provider. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Control Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Empanelled Insurance Providers & TPAs ({providers.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Configure private health insurers, government schemes, corporate healthcare panels, and TPA desks
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd} id="btn-add-insurance-provider">
          <Plus size={15} /> Add Insurance Provider
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Provider, Code, Contact, Email..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="ALL">All Provider Types ({providers.length})</option>
            <option value="private">Private Insurance Company</option>
            <option value="government">Government Scheme (PM-JAY/CGHS)</option>
            <option value="corporate">Corporate Insurance</option>
            <option value="tpa">Third-Party Administrator (TPA)</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="active">Active Empanelment ({providers.filter(p => p.status === 'active').length})</option>
            <option value="inactive">Inactive / Suspended ({providers.filter(p => p.status === 'inactive').length})</option>
          </select>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredProviders.map(p => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: `4px solid ${p.providerType === 'government' ? '#059669' : p.providerType === 'tpa' ? '#8b5cf6' : p.providerType === 'corporate' ? '#d97706' : '#2563eb'}`,
              opacity: p.status === 'inactive' ? 0.75 : 1
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{p.companyName}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                    Code: {p.code} · ID: {p.id}
                  </div>
                </div>
                <span
                  className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {p.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span
                  className="badge badge-primary"
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    background: p.providerType === 'government' ? 'rgba(16,185,129,0.1)' : p.providerType === 'tpa' ? 'rgba(139,92,246,0.1)' : p.providerType === 'corporate' ? 'rgba(217,119,6,0.1)' : 'rgba(37,99,235,0.1)',
                    color: p.providerType === 'government' ? '#059669' : p.providerType === 'tpa' ? '#7c3aed' : p.providerType === 'corporate' ? '#b45309' : '#1e40af'
                  }}
                >
                  {p.providerType === 'private' ? 'Private Insurance Company' : p.providerType === 'government' ? 'Government Scheme' : p.providerType === 'corporate' ? 'Corporate Insurance' : 'Third-Party Administrator (TPA)'}
                </span>
                {p.discountPercent !== undefined && p.discountPercent > 0 && (
                  <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                    {p.discountPercent}% Tariff Discount
                  </span>
                )}
              </div>

              {/* Contact Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span><strong>Mobile:</strong> {p.phone} {p.tollFree ? `(Toll-free: ${p.tollFree})` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span className="truncate"><strong>Email:</strong> {p.email}</span>
                </div>
                {p.contactPerson && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span><strong>Nodal Person:</strong> {p.contactPerson}</span>
                  </div>
                )}
                {p.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                    <MapPin size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }} />
                    <span className="truncate"><strong>Address:</strong> {p.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-muted)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Empanelled: {p.empanelledDate || 'Active'}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenView(p)} title="View Details">
                  <Eye size={13} /> View
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(p)} title="Edit Provider">
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  className={`btn btn-sm ${p.status === 'active' ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => toggleProviderStatus(p.id)}
                  title={p.status === 'active' ? 'Deactivate Provider' : 'Activate Provider'}
                  style={{ color: p.status === 'active' ? '#dc2626' : undefined }}
                >
                  {p.status === 'active' ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle2 size={13} /> Activate</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Building2 size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>No insurance providers found</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Try adjusting your search criteria or register a new provider with the button above.
          </div>
        </div>
      )}

      {/* Add / Edit / View Provider Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#2563eb" />
                <span className="modal-title">
                  {modalMode === 'add' ? 'Add New Insurance Provider / TPA' : modalMode === 'edit' ? `Edit Provider: ${currentProvider.companyName}` : `Provider Details: ${currentProvider.companyName}`}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {modalMode === 'view' ? (
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{currentProvider.companyName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Code: <strong>{currentProvider.code}</strong> · ID: {currentProvider.id} · Type: {currentProvider.providerType?.toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Nodal Contact Person:</strong> {currentProvider.contactPerson || 'N/A'}</div>
                  <div><strong>Status:</strong> <span className={`badge ${currentProvider.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{currentProvider.status}</span></div>
                  <div><strong>Mobile / Phone:</strong> {currentProvider.phone || 'N/A'}</div>
                  <div><strong>Toll-Free Helpline:</strong> {currentProvider.tollFree || 'N/A'}</div>
                  <div><strong>Official Email:</strong> {currentProvider.email || 'N/A'}</div>
                  <div><strong>Cashless Desk Email:</strong> {currentProvider.claimEmail || 'N/A'}</div>
                  <div><strong>Tariff Discount:</strong> {currentProvider.discountPercent || 0}%</div>
                  <div><strong>Empanelment Date:</strong> {currentProvider.empanelledDate || 'N/A'}</div>
                </div>
                {currentProvider.website && (
                  <div><strong>Website / Portal:</strong> <a href={currentProvider.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{currentProvider.website}</a></div>
                )}
                {currentProvider.address && (
                  <div><strong>Registered Office Address:</strong> <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{currentProvider.address}</div></div>
                )}
                <div className="modal-footer" style={{ marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => setModalMode('edit')}>Edit Details</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                  {formError && (
                    <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Provider Name */}
                  <div className="form-group">
                    <label className="form-label">Provider / Insurance Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Star Health & Allied Insurance Co Ltd"
                      value={currentProvider.companyName || ''}
                      onChange={e => {
                        const name = e.target.value;
                        const autoCode = modalMode === 'add' && !currentProvider.code ? name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() : currentProvider.code;
                        setCurrentProvider({ ...currentProvider, companyName: name, code: autoCode });
                      }}
                    />
                  </div>

                  {/* Provider Type & Code */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Provider Type *</label>
                      <select
                        className="form-select"
                        value={currentProvider.providerType || 'private'}
                        onChange={e => setCurrentProvider({ ...currentProvider, providerType: e.target.value as InsuranceProviderType })}
                      >
                        <option value="private">Private Insurance Company</option>
                        <option value="government">Government Scheme</option>
                        <option value="corporate">Corporate Insurance</option>
                        <option value="tpa">Third-Party Administrator (TPA)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Provider Code * (Unique Identifier)</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. STAR-HLTH"
                        value={currentProvider.code || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>

                  {/* Contact Person & Mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Nodal Contact Person *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. Rajesh Sharma (Zonal Manager)"
                        value={currentProvider.contactPerson || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, contactPerson: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mobile / Phone Number *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="+91 98765 43210"
                        value={currentProvider.phone || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Official Email & Cashless Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Official Email Address *</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        placeholder="claims@starhealth.in"
                        value={currentProvider.email || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cashless Claim Desk Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="cashless.desk@starhealth.in"
                        value={currentProvider.claimEmail || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, claimEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Status, Discount & Toll-Free */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Status *</label>
                      <select
                        className="form-select"
                        value={currentProvider.status || 'active'}
                        onChange={e => setCurrentProvider({ ...currentProvider, status: e.target.value as ProviderStatus })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tariff Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-input"
                        placeholder="e.g. 10"
                        value={currentProvider.discountPercent ?? 0}
                        onChange={e => setCurrentProvider({ ...currentProvider, discountPercent: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Toll-Free Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1800-425-2255"
                        value={currentProvider.tollFree || ''}
                        onChange={e => setCurrentProvider({ ...currentProvider, tollFree: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Website / Portal URL */}
                  <div className="form-group">
                    <label className="form-label">Online Claim Portal / Website URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://providerportal.com/login"
                      value={currentProvider.website || ''}
                      onChange={e => setCurrentProvider({ ...currentProvider, website: e.target.value })}
                    />
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <label className="form-label">Registered Office Address *</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      required
                      placeholder="Enter provider registered office / regional correspondence address"
                      value={currentProvider.address || ''}
                      onChange={e => setCurrentProvider({ ...currentProvider, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" id="btn-save-provider">
                    {modalMode === 'add' ? 'Save Provider' : 'Update Provider'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
