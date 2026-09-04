import React, { useState, useMemo } from 'react';
import {
  Layers, Search, Droplets, Filter, Printer, Clock, AlertTriangle,
  CheckCircle2, ShieldCheck, Thermometer, ShieldAlert, ArrowUpDown
} from 'lucide-react';
import { useBloodBank } from '../context/BloodBankContext';
import type { BloodBagRecord, BloodGroup, BloodComponentType } from '../context/BloodBankContext';
import PrintBagLabelModal from './modals/PrintBagLabelModal';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodInventory() {
  const { bloodBags, discardBloodBag } = useBloodBank();

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fefoSort, setFefoSort] = useState(true);

  // Label print modal
  const [labelBag, setLabelBag] = useState<BloodBagRecord | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return bloodBags.filter(b => {
      const q = search.toLowerCase();
      const ms = !q || b.id.toLowerCase().includes(q) || b.batchNumber.toLowerCase().includes(q) || b.storageLocation.toLowerCase().includes(q);
      const mg = !groupFilter || b.bloodGroup === groupFilter;
      const mc = !componentFilter || b.component === componentFilter;
      const mst =
        statusFilter === 'ALL' ||
        (statusFilter === 'available' && b.status === 'available') ||
        (statusFilter === 'reserved' && b.status === 'reserved') ||
        (statusFilter === 'quarantine' && b.status === 'quarantine') ||
        (statusFilter === 'expiring_soon' && b.status === 'available' && b.expiryDate >= todayStr && b.expiryDate <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)) ||
        (statusFilter === 'expired' && (b.status === 'expired' || b.expiryDate < todayStr));

      return ms && mg && mc && mst;
    }).sort((a, b) => {
      if (fefoSort) {
        return a.expiryDate.localeCompare(b.expiryDate); // Earliest expiry first
      }
      return b.collectionDate.localeCompare(a.collectionDate);
    });
  }, [bloodBags, search, groupFilter, componentFilter, statusFilter, fefoSort, todayStr]);

  const handleManualDiscard = (bag: BloodBagRecord) => {
    const reason = prompt(`Enter discard reason for ${bag.id}:`, 'Expired / Quality excursion');
    if (!reason) return;

    discardBloodBag({
      bagId: bag.id,
      bloodGroup: bag.bloodGroup,
      component: bag.component,
      reason: 'expired',
      discardedBy: 'Blood Bank Officer',
      authorizedBy: 'Medical Superintendent',
      method: 'autoclave_incineration',
      remarks: reason,
    });
    alert(`Blood bag ${bag.id} marked as discarded.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Blood Bank Live Inventory & FEFO Stock Management
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {bloodBags.length} blood bags tracked across cold chain storage units · First Expiry, First Out (FEFO) automated ordering
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${fefoSort ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFefoSort(!fefoSort)}
          >
            <ArrowUpDown size={13} /> {fefoSort ? 'FEFO Active (Earliest Expiry)' : 'Latest Collected'}
          </button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search bag ID, batch, location..."
              style={{ paddingLeft: 30 }}
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

          <select className="form-select" value={componentFilter} onChange={e => setComponentFilter(e.target.value)}>
            <option value="">All Components</option>
            <option value="packed_rbc">Packed RBC (PRBC)</option>
            <option value="fresh_frozen_plasma">Fresh Frozen Plasma (FFP)</option>
            <option value="platelets">Platelet Concentrate</option>
            <option value="whole_blood">Whole Blood (WB)</option>
            <option value="cryoprecipitate">Cryoprecipitate</option>
          </select>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Inventory Statuses</option>
            <option value="available">Available for Issue</option>
            <option value="reserved">Reserved for Patient</option>
            <option value="quarantine">In Quarantine</option>
            <option value="expiring_soon">Expiring Soon (&le;7 Days)</option>
            <option value="expired">Expired Units</option>
          </select>
        </div>
      </div>

      {/* Live Inventory Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Live Blood Unit Stock Records</span>
          <span className="badge badge-primary">{filtered.length} Units Matching Filter</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Bag ID</th>
                  <th>Component Type</th>
                  <th>Blood Group</th>
                  <th>Volume (mL)</th>
                  <th>Collection Date</th>
                  <th>Expiry Date (FEFO)</th>
                  <th>Storage Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bag, idx) => {
                  const isExpired = bag.status === 'expired' || bag.expiryDate < todayStr;
                  const isExpiringSoon = bag.status === 'available' && !isExpired && bag.expiryDate <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

                  return (
                    <tr key={bag.id} style={{ background: isExpired ? '#fef2f2' : isExpiringSoon ? '#fffbeb' : undefined }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{bag.id}</strong>
                        {idx === 0 && fefoSort && bag.status === 'available' && (
                          <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: 9 }}>
                            FEFO PRIORITY #1
                          </span>
                        )}
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{bag.batchNumber}</div>
                      </td>

                      <td>
                        <strong>{bag.component.replace(/_/g, ' ').toUpperCase()}</strong>
                      </td>

                      <td>
                        <span className="badge badge-danger" style={{ fontWeight: 800 }}>{bag.bloodGroup}</span>
                      </td>

                      <td>{bag.volumeMl} mL</td>
                      <td>{bag.collectionDate}</td>

                      <td>
                        <strong style={{ color: isExpired ? 'var(--color-danger)' : isExpiringSoon ? '#d97706' : 'var(--text-primary)' }}>
                          {bag.expiryDate}
                        </strong>
                        {isExpired && <div style={{ fontSize: 10, color: 'var(--color-danger)', fontWeight: 700 }}>EXPIRED</div>}
                        {isExpiringSoon && <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}>Expiring Soon</div>}
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{bag.storageLocation}</div>
                      </td>

                      <td>
                        <span className={`badge ${bag.status === 'available' ? 'badge-success' : bag.status === 'reserved' ? 'badge-primary' : bag.status === 'quarantine' ? 'badge-warning' : 'badge-danger'}`}>
                          {bag.status.toUpperCase()}
                        </span>
                        {bag.reservedForPatientName && (
                          <div style={{ fontSize: 10, color: 'var(--color-primary)', marginTop: 2 }}>
                            Reserved: {bag.reservedForPatientName}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ height: 26, fontSize: 11 }}
                            onClick={() => setLabelBag(bag)}
                            title="Print Blood Bag Barcode Label"
                          >
                            <Printer size={11} /> Label
                          </button>

                          {isExpired && (
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ height: 26, fontSize: 11 }}
                              onClick={() => handleManualDiscard(bag)}
                            >
                              Discard
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No blood bags matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Label Modal */}
      {labelBag && (
        <PrintBagLabelModal bag={labelBag} onClose={() => setLabelBag(null)} />
      )}
    </div>
  );
}
