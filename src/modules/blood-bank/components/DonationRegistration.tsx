import React, { useState } from 'react';
import {
  Droplets, Search, Plus, Calendar, Clock, CheckCircle2,
  AlertTriangle, FlaskConical, ArrowRight, User
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import RecordDonationModal from './modals/RecordDonationModal';

export default function DonationRegistration() {
  const { donations, donors, setActiveTab } = useBloodBank();

  const [search, setSearch] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDonorForDonation, setSelectedDonorForDonation] = useState(donors[0] || null);

  const filtered = donations.filter(d => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.donorName.toLowerCase().includes(q) ||
      d.assignedBagId.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Donation Sessions & Collection Register
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Phlebotomy collection logs: Pre-bleed vitals → Blood Bag Labeling → Quarantine Bay transfer
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedDonorForDonation(donors.find(d => d.isEligible) || donors[0]);
            setShowDonationModal(true);
          }}
        >
          <Plus size={15} /> Record Blood Collection
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search donation ID, donor name, bag ID, blood group..."
            style={{ paddingLeft: 34 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Donations Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Blood Donation Logs</span>
          <span className="badge badge-primary">{donations.length} Donations</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor Name & ID</th>
                  <th>Blood Group</th>
                  <th>Collection Date & Time</th>
                  <th>Volume (mL)</th>
                  <th>Assigned Bag ID</th>
                  <th>Phlebotomist</th>
                  <th>Screening Status</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{d.id}</strong>
                    </td>

                    <td>
                      <strong>{d.donorName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.donorId}</div>
                    </td>

                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>{d.bloodGroup}</span>
                    </td>

                    <td>
                      <div>{d.donationDate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.donationTime}</div>
                    </td>

                    <td><strong>{d.collectionVolumeMl} mL</strong></td>

                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{d.assignedBagId}</strong>
                    </td>

                    <td>{d.phlebotomistName}</td>

                    <td>
                      <span className={`badge ${d.screeningStatus === 'passed' ? 'badge-success' : d.screeningStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {d.screeningStatus.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${d.status === 'completed' ? 'badge-success' : d.status === 'discarded' ? 'badge-danger' : 'badge-neutral'}`}>
                        {d.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: 26, fontSize: 11 }}
                        onClick={() => setActiveTab('screening')}
                      >
                        <FlaskConical size={11} /> Test & Screen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showDonationModal && selectedDonorForDonation && (
        <RecordDonationModal
          donor={selectedDonorForDonation}
          onClose={() => setShowDonationModal(false)}
        />
      )}
    </div>
  );
}
