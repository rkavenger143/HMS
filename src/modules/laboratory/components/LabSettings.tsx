import React, { useState } from 'react';
import { Settings, Plus, CheckCircle2, ShieldCheck, Tag, AlertTriangle, FileText } from 'lucide-react';

export default function LabSettings() {
  const [nablNumber, setNablNumber] = useState('NABL-MC-4590-2026');
  const [criticalTimeLimitMins, setCriticalTimeLimitMins] = useState(15);
  const [labDirectorName, setLabDirectorName] = useState('Dr. Sunita Rao, MD (Pathology)');
  const [disclaimerText, setDisclaimerText] = useState(
    'Laboratory results are to be correlated clinically by the attending physician. Test methods comply with ISO 15189:2022 standards. End of Official Report.'
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Information System (LIS) Master Configurations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Accreditation details, critical alert escalation limits, container types, and report header disclaimers
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            ✓ Master Configurations Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Accreditation & Lab Leadership */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Accreditation & Laboratory Leadership</span>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">NABL / ISO 15189 Certificate Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={nablNumber}
                  onChange={e => setNablNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultant Pathologist & Lab Director</label>
                <input
                  type="text"
                  className="form-input"
                  value={labDirectorName}
                  onChange={e => setLabDirectorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Critical Panic Value Verbal Handover Mandate (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={criticalTimeLimitMins}
                  onChange={e => setCriticalTimeLimitMins(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Auto-Flagging Delta Check Tolerance (%)</label>
                <input
                  type="number"
                  className="form-input"
                  defaultValue={30}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Official Report Footer Legal Disclaimer</label>
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

        {/* Standard Specimen Containers Master */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Standard Vacuum Blood & Specimen Tube Types</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tube Container Name</th>
                    <th>Color Cap</th>
                    <th>Additive / Anticoagulant</th>
                    <th>Primary Laboratory Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>EDTA K2 / K3 Tube</strong></td>
                    <td><span className="badge badge-primary" style={{ background: '#7c3aed', color: '#ffffff' }}>Lavender</span></td>
                    <td>K2 / K3 EDTA Anticoagulant</td>
                    <td>Hematology (CBC, Blood Group, HbA1c)</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td><strong>SST / Serum Gel Tube</strong></td>
                    <td><span className="badge badge-warning" style={{ background: '#eab308', color: '#ffffff' }}>Gold / Yellow</span></td>
                    <td>Clot Activator & Polymer Gel Separator</td>
                    <td>Biochemistry, Serology, Immunoassay</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td><strong>Sodium Fluoride Tube</strong></td>
                    <td><span className="badge badge-neutral" style={{ background: '#64748b', color: '#ffffff' }}>Grey</span></td>
                    <td>Sodium Fluoride / Potassium Oxalate</td>
                    <td>Blood Glucose (FBS, PPBS, GTT)</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td><strong>Lithium Heparin Tube</strong></td>
                    <td><span className="badge badge-success" style={{ background: '#16a34a', color: '#ffffff' }}>Green</span></td>
                    <td>Lithium Heparin</td>
                    <td>STAT Electrolytes, hs-Troponin</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td><strong>Sodium Citrate 3.2% Tube</strong></td>
                    <td><span className="badge badge-info" style={{ background: '#0284c7', color: '#ffffff' }}>Light Blue</span></td>
                    <td>3.2% Buffered Sodium Citrate</td>
                    <td>Coagulation (PT/INR, APTT, D-Dimer)</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={14} /> Save Laboratory Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
