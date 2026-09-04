import React, { useState } from 'react';
import {
  FlaskConical, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Droplets, UserCheck, ShieldAlert, ArrowRight, Eye, Check, X
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodBagRecord } from '../context/BloodBankContext';

export default function ScreeningTestingQuarantine() {
  const {
    bloodBags,
    approveScreeningAndRelease,
    rejectScreeningAndDiscard,
    setActiveTab,
  } = useBloodBank();

  const [selectedBag, setSelectedBag] = useState<BloodBagRecord | null>(null);
  const [testedBy, setTestedBy] = useState('Senior Biochemist / Lab Tech');
  const [hivResult, setHivResult] = useState<'negative' | 'positive'>('negative');
  const [hbsagResult, setHbsagResult] = useState<'negative' | 'positive'>('negative');
  const [hcvResult, setHcvResult] = useState<'negative' | 'positive'>('negative');
  const [syphilisResult, setSyphilisResult] = useState<'negative' | 'positive'>('negative');
  const [malariaResult, setMalariaResult] = useState<'negative' | 'positive'>('negative');
  const [groupConfResult, setGroupConfResult] = useState<'confirmed' | 'discrepant'>('confirmed');

  // Quarantined bags
  const quarantineBags = bloodBags.filter(b => b.status === 'quarantine' || b.screeningStatus === 'quarantine');

  const handleOpenTestingModal = (bag: BloodBagRecord) => {
    setSelectedBag(bag);
    setHivResult('negative');
    setHbsagResult('negative');
    setHcvResult('negative');
    setSyphilisResult('negative');
    setMalariaResult('negative');
    setGroupConfResult('confirmed');
  };

  const handleApprove = () => {
    if (!selectedBag) return;

    if (
      hivResult === 'positive' ||
      hbsagResult === 'positive' ||
      hcvResult === 'positive' ||
      syphilisResult === 'positive' ||
      malariaResult === 'positive' ||
      groupConfResult === 'discrepant'
    ) {
      alert('Cannot release unit with positive/reactive infectious markers or grouping discrepancy. Unit must be rejected and discarded.');
      return;
    }

    approveScreeningAndRelease(selectedBag.id, testedBy);
    alert(`Blood Unit ${selectedBag.id} (${selectedBag.bloodGroup}) successfully verified, approved, and released into Available Inventory.`);
    setSelectedBag(null);
  };

  const handleReject = () => {
    if (!selectedBag) return;
    const reason = prompt('Enter mandatory rejection reason for infectious marker or quality failure:', 'Infectious disease marker reactive / Quality failure');
    if (!reason) return;

    rejectScreeningAndDiscard(selectedBag.id, reason, testedBy);
    alert(`Blood Unit ${selectedBag.id} marked as REJECTED and transferred to Biohazard Discard Log.`);
    setSelectedBag(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(2,132,199,0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Mandatory Blood Screening, Serology & Quarantine Release
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Infectious disease testing: HIV, HBV (HBsAg), HCV, Syphilis, Malaria & ABO/Rh confirmation before inventory release
            </div>
          </div>
        </div>
      </div>

      {/* Safety Quarantine Protocol Alert */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#1e40af', fontSize: 12 }}>
        <ShieldCheck size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div>
          <strong>Strict Safety Protocol:</strong> All collected blood units remain locked in the Quarantine Bay until all 5 mandatory infectious disease tests and confirmatory ABO/Rh groupings are verified. No unreleased unit can be reserved or issued.
        </div>
      </div>

      {/* Quarantined Blood Bags Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Quarantined Blood Units Awaiting Screening Release</span>
          <span className="badge badge-warning">{quarantineBags.length} Units in Quarantine</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Bag ID</th>
                  <th>Donation ID & Donor</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Collection Date</th>
                  <th>Current Location</th>
                  <th>Screening Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {quarantineBags.map(bag => (
                  <tr key={bag.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{bag.id}</strong>
                    </td>

                    <td>
                      <div>{bag.donationId}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{bag.donorId}</div>
                    </td>

                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>{bag.bloodGroup}</span>
                    </td>

                    <td>{bag.component.replace(/_/g, ' ').toUpperCase()}</td>
                    <td>{bag.collectionDate}</td>

                    <td>
                      <span className="badge badge-neutral">{bag.storageLocation}</span>
                    </td>

                    <td>
                      <span className="badge badge-warning">IN QUARANTINE</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: 11 }}
                        onClick={() => handleOpenTestingModal(bag)}
                      >
                        <FlaskConical size={11} /> Test & Release
                      </button>
                    </td>
                  </tr>
                ))}

                {quarantineBags.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No blood bags currently in quarantine. All collected units have been tested and released.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testing & Release Modal */}
      {selectedBag && (
        <div className="modal-backdrop" onClick={() => setSelectedBag(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Serology Testing & Quality Clearance Verification</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Unit: {selectedBag.id} ({selectedBag.bloodGroup} · {selectedBag.component})
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setSelectedBag(null)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Unit Info Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>Blood Bag: {selectedBag.id}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Donation: {selectedBag.donationId} · Collected on {selectedBag.collectionDate}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-danger)' }}>
                  {selectedBag.bloodGroup}
                </div>
              </div>

              {/* 5 Mandatory Infectious Markers Grid */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                Mandatory Transfusion-Transmissible Infection (TTI) Screening
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>1. HIV 1 & 2 Antibody / Ag (4th Gen)</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>EIA / CLIA Method</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={hivResult} onChange={e => setHivResult(e.target.value as any)}>
                    <option value="negative">Negative</option>
                    <option value="positive">Reactive</option>
                  </select>
                </div>

                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>2. Hepatitis B Surface Antigen (HBsAg)</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Chemiluminescence</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={hbsagResult} onChange={e => setHbsagResult(e.target.value as any)}>
                    <option value="negative">Negative</option>
                    <option value="positive">Reactive</option>
                  </select>
                </div>

                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>3. Hepatitis C Virus (Anti-HCV)</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Immunoassay</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={hcvResult} onChange={e => setHcvResult(e.target.value as any)}>
                    <option value="negative">Negative</option>
                    <option value="positive">Reactive</option>
                  </select>
                </div>

                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>4. Syphilis Serology (VDRL / TPHA)</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Flocculation / Treponemal</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={syphilisResult} onChange={e => setSyphilisResult(e.target.value as any)}>
                    <option value="negative">Non-Reactive</option>
                    <option value="positive">Reactive</option>
                  </select>
                </div>

                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>5. Malaria Parasite (Smear / RDT)</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Microscopy / Pan-Ag</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={malariaResult} onChange={e => setMalariaResult(e.target.value as any)}>
                    <option value="negative">Negative</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>

                <div style={{ border: '1px solid var(--border-default)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12 }}>6. ABO/Rh Forward & Reverse Group</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Tube Method Confirmation</div>
                  </div>
                  <select className="form-select" style={{ width: 110, height: 30, fontSize: 11 }} value={groupConfResult} onChange={e => setGroupConfResult(e.target.value as any)}>
                    <option value="confirmed">Confirmed</option>
                    <option value="discrepant">Discrepant</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 6 }}>
                <label className="form-label">Testing Medical Technologist / Verified By</label>
                <input
                  type="text"
                  className="form-input"
                  value={testedBy}
                  onChange={e => setTestedBy(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-danger" onClick={handleReject}>
                <XCircle size={14} /> Reject & Discard Unit
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBag(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleApprove}>
                  <CheckCircle2 size={14} /> Approve & Release to Available Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
