import React, { useState } from 'react';
import {
  UserPlus, Search, Droplets, Plus, Phone, Mail, Award,
  CheckCircle2, AlertCircle, Edit, Eye, Filter, Calendar, HeartPulse
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodDonorRecord, BloodGroup } from '../context/BloodBankContext';
import AddEditDonorModal from './modals/AddEditDonorModal';
import RecordDonationModal from './modals/RecordDonationModal';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorManagement() {
  const { donors, setActiveTab } = useBloodBank();

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDonor, setEditDonor] = useState<BloodDonorRecord | null>(null);
  const [donationDonor, setDonationDonor] = useState<BloodDonorRecord | null>(null);

  const filtered = donors.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.phone.includes(q);
    const mg = !groupFilter || d.bloodGroup === groupFilter;
    const me =
      eligibilityFilter === 'ALL' ||
      (eligibilityFilter === 'eligible' && d.isEligible) ||
      (eligibilityFilter === 'deferred' && !d.isEligible);
    return ms && mg && me;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Donor Registry & Eligibility Screening
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {donors.length} registered voluntary, replacement, and directed blood donors
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Register New Donor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search donor name, ID, phone..."
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select className="form-select" value={eligibilityFilter} onChange={e => setEligibilityFilter(e.target.value)}>
            <option value="ALL">All Eligibility Statuses</option>
            <option value="eligible">Eligible to Donate</option>
            <option value="deferred">Temporarily / Permanently Deferred</option>
          </select>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              Cards
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(donor => (
            <div key={donor.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 4, background: donor.isEligible ? 'var(--color-success)' : 'var(--color-danger)' }} />
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Top Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 16
                    }}>
                      {donor.bloodGroup}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{donor.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{donor.id} · {donor.age}y / {donor.gender}</div>
                    </div>
                  </div>

                  <span className={`badge ${donor.isEligible ? 'badge-success' : 'badge-danger'}`}>
                    {donor.isEligible ? '● Eligible' : '○ Deferred'}
                  </span>
                </div>

                {/* Vitals & Donations Count */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: 'var(--bg-surface)', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: 11 }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Weight</span>
                    <div style={{ fontWeight: 700 }}>{donor.weightKg} kg</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Hemoglobin</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{donor.hemoglobinGdl} g/dL</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Donations</span>
                    <div style={{ fontWeight: 700 }}>{donor.totalDonations} times</div>
                  </div>
                </div>

                {/* Contact & Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div>📞 {donor.phone}</div>
                  <div>🏠 {donor.address}</div>
                  <div>🩸 Type: <strong style={{ textTransform: 'capitalize' }}>{donor.donorType}</strong></div>
                  <div>📅 Last Donation: <strong>{donor.lastDonationDate || 'First time donor'}</strong></div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setEditDonor(donor)}
                  >
                    <Edit size={12} /> Edit
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.5, justifyContent: 'center' }}
                    disabled={!donor.isEligible}
                    onClick={() => setDonationDonor(donor)}
                  >
                    <Droplets size={12} /> Collect Blood
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor ID</th>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Age / Gender</th>
                    <th>Weight & Hb</th>
                    <th>Type</th>
                    <th>Last Donated</th>
                    <th>Eligibility</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td><strong style={{ fontFamily: 'monospace' }}>{d.id}</strong></td>
                      <td>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.phone}</div>
                      </td>
                      <td><span className="badge badge-danger" style={{ fontWeight: 800 }}>{d.bloodGroup}</span></td>
                      <td>{d.age}y / {d.gender}</td>
                      <td>{d.weightKg} kg · {d.hemoglobinGdl} g/dL</td>
                      <td style={{ textTransform: 'capitalize' }}>{d.donorType}</td>
                      <td>{d.lastDonationDate || 'First time'}</td>
                      <td>
                        <span className={`badge ${d.isEligible ? 'badge-success' : 'badge-danger'}`}>
                          {d.isEligible ? 'Eligible' : 'Deferred'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditDonor(d)}>
                            <Edit size={11} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={!d.isEligible}
                            onClick={() => setDonationDonor(d)}
                          >
                            <Droplets size={11} /> Donate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals Suite */}
      {showAddModal && (
        <AddEditDonorModal onClose={() => setShowAddModal(false)} />
      )}

      {editDonor && (
        <AddEditDonorModal donor={editDonor} onClose={() => setEditDonor(null)} />
      )}

      {donationDonor && (
        <RecordDonationModal donor={donationDonor} onClose={() => setDonationDonor(null)} />
      )}
    </div>
  );
}
