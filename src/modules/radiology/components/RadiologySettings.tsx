import React, { useState } from 'react';
import { Settings, CheckCircle2, ShieldCheck, Tag, AlertTriangle } from 'lucide-react';

export default function RadiologySettings() {
  const [aerbRegNo, setAerbRegNo] = useState('AERB-RAD-KAR-55420-2026');
  const [leadApronInspectionDate, setLeadApronInspectionDate] = useState('2026-07-20');
  const [radiationSafetyOfficer, setRadiationSafetyOfficer] = useState('Dr. S. K. Narayan, Medical Physicist & RSO');
  const [disclaimerText, setDisclaimerText] = useState(
    'Radiological findings are based on imaging features and must be interpreted in conjunction with complete clinical history, physical examination, and laboratory data. Electronic report signed under AERB and NABH guidelines.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology & Imaging Information System (RIS) Master Configurations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              AERB radiation safety credentials, ALARA protocols, contrast safety mandates, and official report disclaimers
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            ✓ Radiology Configurations Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* AERB & Radiation Protection */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Radiation Protection & AERB Compliance</span>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">AERB Registration & License Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={aerbRegNo}
                  onChange={e => setAerbRegNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Certified Radiation Safety Officer (RSO)</label>
                <input
                  type="text"
                  className="form-input"
                  value={radiationSafetyOfficer}
                  onChange={e => setRadiationSafetyOfficer(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Apron & Thyroid Shield Fluoroscopy Testing Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={leadApronInspectionDate}
                  onChange={e => setLeadApronInspectionDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pre-Contrast eGFR Minimum Threshold (ml/min/1.73m²)</label>
                <input
                  type="number"
                  className="form-input"
                  defaultValue={30}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Official Radiology Diagnostic Report Disclaimer</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={disclaimerText}
                  onChange={e => setDisclaimerText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Radiation Safety Principles (ALARA) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Institutional ALARA Radiation Safety Protocols</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Safety Domain</th>
                    <th>Institutional Policy</th>
                    <th>Safety Verification Check</th>
                    <th>Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Pediatric Radiation Dose Optimization</strong></td>
                    <td>Automatic tube current modulation (kVp/mAs) adapted for pediatric body habitus</td>
                    <td>Mandatory pediatric protocol selection</td>
                    <td><span className="badge badge-success">ACTIVE & AUDITED</span></td>
                  </tr>
                  <tr>
                    <td><strong>Female 10-Day Rule / Pregnancy</strong></td>
                    <td>Mandatory LMP and pregnancy screening prior to ionizing radiation exposures</td>
                    <td>Pre-procedure safety checklist validation</td>
                    <td><span className="badge badge-success">ACTIVE & AUDITED</span></td>
                  </tr>
                  <tr>
                    <td><strong>MRI Ferromagnetic Metal Screening</strong></td>
                    <td>Zone IV strict ferromagnetic lockout; screening for pacemakers & surgical clips</td>
                    <td>Physical metal detection screening</td>
                    <td><span className="badge badge-success">ACTIVE & AUDITED</span></td>
                  </tr>
                  <tr>
                    <td><strong>Contrast Induced Nephropathy (CIN)</strong></td>
                    <td>Pre-procedure serum creatinine and adequate pre/post-procedure hydration</td>
                    <td>Creatinine & allergy clearance checklist</td>
                    <td><span className="badge badge-success">ACTIVE & AUDITED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={14} /> Save Master Settings
          </button>
        </div>
      </form>
    </div>
  );
}
