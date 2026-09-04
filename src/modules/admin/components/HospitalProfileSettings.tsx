import React, { useState } from 'react';
import {
  Building2, Upload, Image, Save, CheckCircle2, ShieldCheck,
  Phone, Mail, Globe, MapPin, Clock, DollarSign
} from 'lucide-react';
import { useAdmin, HospitalProfile } from '../context/AdminContext';

export default function HospitalProfileSettings() {
  const { hospitalProfile, updateHospitalProfile } = useAdmin();
  const [formData, setFormData] = useState<HospitalProfile>(hospitalProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital Profile & Statutory Identity</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure hospital branding, legal registration codes, tax IDs, and global localization settings
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} /> Save Hospital Profile
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Hospital profile configuration and letterhead branding successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Branding & Logo */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Identity & Branding</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
              {/* Logo Box */}
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
                    <Upload size={13} /> Upload Hospital Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    PNG, JPG, or SVG. Used on Invoices, Prescriptions & Certificates.
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

              {/* Hospital Name & Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hospital Registered Legal Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hospital Facility Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory & Legal Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Statutory Registration & Tax Codes</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Medical Registration / License # *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.registrationNumber}
                  onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                />
              </div>

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
                <label className="form-label">PAN (Permanent Account Number)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Physical Address */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Contact Information & Physical Location</span>
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

        {/* Localization & Formats */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Localization, Currency & Formatting</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Time Zone</label>
                <select
                  className="form-select"
                  value={formData.timeZone}
                  onChange={e => setFormData({ ...formData, timeZone: e.target.value })}
                >
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC (GMT +0:00)">UTC (GMT +0:00)</option>
                  <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
                  <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Currency</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date Format</label>
                <select
                  className="form-select"
                  value={formData.dateFormat}
                  onChange={e => setFormData({ ...formData, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 02/09/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-02)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/02/2026)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            <Save size={16} /> Save Hospital Profile Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
