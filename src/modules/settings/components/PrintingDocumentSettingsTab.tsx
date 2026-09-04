import React, { useState } from 'react';
import {
  Printer, Save, RotateCcw, CheckCircle2, FileText,
  ShieldCheck, Layout, Eye
} from 'lucide-react';
import { useSettings, PrintingSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function PrintingDocumentSettingsTab() {
  const { printingSettings, updatePrintingSettings, resetToDefaults } = useSettings();
  const [formData, setFormData] = useState<PrintingSettingsConfig>(printingSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrintingSettings(formData);
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
              <Printer size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Official Document Printing, Letterhead & PDF Layouts</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configures headers, legal footers, paper dimensions, and signature lines across all clinical & financial prints
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
              <Save size={13} /> Save Printing Layouts
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Document printing templates and layout formatting successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header & Footer Text */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Letterhead Banner & Legal Disclaimer</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Top Letterhead Banner Text *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.hospitalHeaderLetterhead}
                  onChange={e => setFormData({ ...formData, hospitalHeaderLetterhead: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bottom Legal Footer Disclaimer *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.footerDisclaimerText}
                  onChange={e => setFormData({ ...formData, footerDisclaimerText: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paper Size & Dimensions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Paper Sizing, Orientation & Margins</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default Paper Dimension</label>
                <select
                  className="form-select"
                  value={formData.defaultPaperSize}
                  onChange={e => setFormData({ ...formData, defaultPaperSize: e.target.value as any })}
                >
                  <option value="A4">Standard A4 (210 x 297 mm)</option>
                  <option value="Letter">US Letter (8.5 x 11 in)</option>
                  <option value="Thermal_80mm">Thermal Receipt Roll (80 mm)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default Page Orientation</label>
                <select
                  className="form-select"
                  value={formData.pageOrientation}
                  onChange={e => setFormData({ ...formData, pageOrientation: e.target.value as any })}
                >
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Top Margin (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.marginTopMm}
                  onChange={e => setFormData({ ...formData, marginTopMm: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bottom Margin (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.marginBottomMm}
                  onChange={e => setFormData({ ...formData, marginBottomMm: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Signatory Line Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.signatoryTitle}
                  onChange={e => setFormData({ ...formData, signatoryTitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.showHospitalLogo}
                    onChange={e => setFormData({ ...formData, showHospitalLogo: e.target.checked })}
                  />
                  Print Hospital Brand Logo on Document Header
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.showAuthorizedSignatoryLine}
                    onChange={e => setFormData({ ...formData, showAuthorizedSignatoryLine: e.target.checked })}
                  />
                  Print Bottom Signature Box & Designation Line
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save Printing Layout Settings
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults('printing');
          setFormData(printingSettings);
        }}
        categoryName="Document Printing & Letterhead Settings"
      />
    </div>
  );
}
