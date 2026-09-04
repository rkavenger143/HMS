import React, { useState } from 'react';
import {
  Palette, Sun, Moon, Monitor, CheckCircle2, Save,
  RotateCcw, Layout, Rows, Eye
} from 'lucide-react';
import { useSettings, AppearanceConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function AppearanceSettingsTab() {
  const { appearance, updateAppearance, resetToDefaults } = useSettings();
  const [formData, setFormData] = useState<AppearanceConfig>(appearance);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppearance(formData);
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
              <Palette size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Appearance, Theme & Visual Density</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure application theme (Green + White default), accent colors, table spacing, and layout conventions
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
              <Save size={13} /> Save Appearance
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Theme preferences and layout styling successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Theme Mode Selector */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">System Theme Mode</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { id: 'light', label: 'Light Green + White (Standard HMS)', desc: 'Clean high-contrast clinical interface', icon: Sun, color: '#059669' },
                { id: 'dark', label: 'Dark Charcoal Mode', desc: 'Low-light clinical night shift mode', icon: Moon, color: '#0284c7' },
                { id: 'system', label: 'System Automatic', desc: 'Syncs with operating system mode', icon: Monitor, color: '#8b5cf6' },
              ].map(themeOpt => {
                const Icon = themeOpt.icon;
                const isSelected = formData.theme === themeOpt.id;

                return (
                  <div
                    key={themeOpt.id}
                    onClick={() => setFormData({ ...formData, theme: themeOpt.id as any })}
                    style={{
                      padding: '16px',
                      borderRadius: 10,
                      border: isSelected ? `2px solid ${themeOpt.color}` : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? `${themeOpt.color}10` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <Icon size={18} style={{ color: themeOpt.color }} />
                      <strong style={{ fontSize: 13, color: isSelected ? themeOpt.color : 'var(--text-primary)' }}>
                        {themeOpt.label}
                      </strong>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                      {themeOpt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brand Accent Colors */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Brand Accents & Primary Palette</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Brand Accent (Default HMS Green)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    style={{ width: 44, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Secondary Action Accent (Default Blue)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                    style={{ width: 44, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.secondaryColor}
                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table & Layout Spacing */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Layout Density & Sidebar State</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Data Table Row Density</label>
                <select
                  className="form-select"
                  value={formData.tableDensity}
                  onChange={e => setFormData({ ...formData, tableDensity: e.target.value as any })}
                >
                  <option value="comfortable">Comfortable Spacing (Default)</option>
                  <option value="compact">Compact Dense Rows (High Information Density)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default Sidebar State</label>
                <select
                  className="form-select"
                  value={formData.sidebarStyle}
                  onChange={e => setFormData({ ...formData, sidebarStyle: e.target.value as any })}
                >
                  <option value="expanded">Expanded Full Width</option>
                  <option value="collapsed">Mini Icon Only</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Login Screen Subtitle Branding</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.loginPageBrandingText}
                  onChange={e => setFormData({ ...formData, loginPageBrandingText: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save Appearance Settings
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults('appearance');
          setFormData(appearance);
        }}
        categoryName="Appearance & Theme Styling"
      />
    </div>
  );
}
