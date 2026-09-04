import React, { useState } from 'react';
import {
  Building2, Upload, Image, Save, RotateCcw, CheckCircle2,
  Phone, Mail, Globe, MapPin, ShieldCheck, FileText
} from 'lucide-react';
import { useSettings, HospitalProfileConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function HospitalProfileSettingsTab() {
  const { hospitalProfile, updateHospitalProfile, resetToDefaults } = useSettings();
  const [formData, setFormData] = useState<HospitalProfileConfig>(hospitalProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital Identity, Letterhead & Statutory Profile</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configures hospital branding across Prescriptions, Invoices, Receipts, Lab Reports, and Discharge Summaries
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsResetOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={13} /> Save Profile
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Hospital profile branding and legal details successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Branding & Identity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Identity & Logo Upload</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
              {/* Logo Upload Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 12,
                    border: '2px dashed var(--border-default)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {formData.logo ? (
                    <img src={formData.logo} alt="Hospital Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <Image size={24} style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: 10 }}>No Logo</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Upload size={13} /> Upload New Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    PNG, JPG, or SVG. Printed on all clinical & billing headers.
                  </div>
                  {formData.logo && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                      style={{ color: 'var(--color-danger)', padding: 0, marginTop: 4, fontSize: 11 }}
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Registered Hospital Legal Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hospital Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Registration / License # *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.registrationNumber}
                      onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Contact Lines & Physical Location</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">General Contact Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">24/7 Emergency Line *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Official Website</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statutory & Print Disclaimer */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Statutory Taxes & Legal Footer Disclaimer</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GSTIN (Goods & Services Tax) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">PAN (Income Tax PAN)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hospital Official Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Document Standard Footer Text *</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.footerText}
                onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save Hospital Profile Settings
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults('hospital_profile');
          setFormData(hospitalProfile);
        }}
        categoryName="Hospital Profile & Statutory Identity"
      />
    </div>
  );
}
