import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Scan,
  Activity,
  Cpu,
  Settings,
  Clock,
} from 'lucide-react';
import { useDiagnostic } from '../context/DiagnosticContext';
import CreateDiagnosticRequestModal from './modals/CreateDiagnosticRequestModal';
import type {
  DiagnosticCategory,
  DiagnosticSubCategory,
  DiagnosticEquipmentStatus,
  DiagnosticTestMasterItem,
} from '../../../types';

export default function DiagnosticCategoriesView() {
  const { testMaster, equipmentList, updateEquipmentStatus } = useDiagnostic();

  const [activeCategoryTab, setActiveCategoryTab] = useState<DiagnosticCategory>('laboratory');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEquipmentDrawer, setShowEquipmentDrawer] = useState(false);

  const filteredTests = testMaster.filter(t => {
    const matchesCat = t.category === activeCategoryTab;
    const matchesSub = selectedSubCategory === 'ALL' || t.subCategory === selectedSubCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q);

    return matchesCat && matchesSub && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Test Categories & Equipment Availability</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Standard hospital test catalog (Laboratory, Radiology & Imaging, Other Diagnostics) and live diagnostic equipment availability
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${showEquipmentDrawer ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setShowEquipmentDrawer(!showEquipmentDrawer)}
          >
            <Cpu size={13} /> {showEquipmentDrawer ? 'Hide Equipment Status' : 'Equipment Status (7)'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={13} /> Order Test
          </button>
        </div>
      </div>

      {/* Equipment & Modality Availability Tracker Banner (When toggled or visible) */}
      {showEquipmentDrawer && (
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Diagnostic Equipment & Analyzer Operational Status</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {equipmentList.filter(eq => eq.status === 'available').length} / {equipmentList.length} Units Online
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {equipmentList.map(eq => (
              <div
                key={eq.id}
                style={{
                  background: 'var(--bg-card)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{eq.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {eq.department} · {eq.location}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Model: {eq.modelNumber} · Daily Cap: {eq.dailyCapacity}/day
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <select
                    className={`form-select ${
                      eq.status === 'available'
                        ? 'badge-success'
                        : eq.status === 'maintenance'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                    style={{ height: 26, fontSize: 10, fontWeight: 700, padding: '0 6px', width: 120 }}
                    value={eq.status}
                    onChange={e => updateEquipmentStatus(eq.id, e.target.value as DiagnosticEquipmentStatus)}
                  >
                    <option value="available">AVAILABLE</option>
                    <option value="maintenance">MAINTENANCE</option>
                    <option value="unavailable">UNAVAILABLE</option>
                  </select>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Queued: {eq.currentTestsQueued}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Main Category Tabs (Laboratory, Radiology / Imaging, Other Diagnostics) */}
      <div
        className="card"
        style={{
          padding: '6px',
          background: 'var(--bg-surface)',
          display: 'flex',
          gap: 6,
        }}
      >
        <button
          className={`btn btn-sm ${activeCategoryTab === 'laboratory' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, height: 38, fontSize: 13 }}
          onClick={() => {
            setActiveCategoryTab('laboratory');
            setSelectedSubCategory('ALL');
          }}
        >
          <FlaskConical size={15} /> 1. Laboratory Services ({testMaster.filter(t => t.category === 'laboratory').length})
        </button>

        <button
          className={`btn btn-sm ${activeCategoryTab === 'radiology' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, height: 38, fontSize: 13 }}
          onClick={() => {
            setActiveCategoryTab('radiology');
            setSelectedSubCategory('ALL');
          }}
        >
          <Scan size={15} /> 2. Radiology & Imaging ({testMaster.filter(t => t.category === 'radiology').length})
        </button>

        <button
          className={`btn btn-sm ${activeCategoryTab === 'other' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, height: 38, fontSize: 13 }}
          onClick={() => {
            setActiveCategoryTab('other');
            setSelectedSubCategory('ALL');
          }}
        >
          <Activity size={15} /> 3. Other Diagnostic Tests ({testMaster.filter(t => t.category === 'other').length})
        </button>
      </div>

      {/* Sub-Category Chips & Search Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center' }}>
          {/* Subcategory Filter Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${selectedSubCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => setSelectedSubCategory('ALL')}
            >
              All Subcategories
            </button>

            {activeCategoryTab === 'laboratory' && (
              <>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'blood' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('blood')}
                >
                  Blood Tests
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'urine' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('urine')}
                >
                  Urine Tests
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'stool' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('stool')}
                >
                  Stool Tests
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'other_lab' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('other_lab')}
                >
                  Other Lab Tests
                </button>
              </>
            )}

            {activeCategoryTab === 'radiology' && (
              <>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'xray' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('xray')}
                >
                  X-Ray (Radiography)
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'ultrasound' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('ultrasound')}
                >
                  Ultrasound (USG)
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'ct' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('ct')}
                >
                  CT Scan
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'mri' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('mri')}
                >
                  MRI Scan
                </button>
              </>
            )}

            {activeCategoryTab === 'other' && (
              <>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'ecg' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('ecg')}
                >
                  ECG (12-Lead)
                </button>
                <button
                  className={`btn btn-sm ${selectedSubCategory === 'other_diag' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setSelectedSubCategory('other_diag')}
                >
                  Special Procedures
                </button>
              </>
            )}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Test Name, Code..."
              style={{ paddingLeft: 32, height: 32, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Test Catalog Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Code</th>
                  <th>Test / Investigation Name</th>
                  <th>Department</th>
                  <th>Sample / Specimen Required</th>
                  <th>Turnaround Time</th>
                  <th>Number of Parameters</th>
                  <th>Standard Fee</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {t.code}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                      {t.preparationInstructions && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          ℹ️ {t.preparationInstructions}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: 12 }}>{t.department}</div>
                    </td>

                    <td>
                      {t.sampleType ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{t.sampleType}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{t.containerType}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Direct Examination</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                        {t.turnaroundHours} Hours
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{t.parameters.length} Parameters</span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{t.price}</strong>
                    </td>

                    <td>
                      <span className={`badge ${t.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 11, padding: '3px 10px' }}
                        onClick={() => setShowCreateModal(true)}
                      >
                        Order Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateDiagnosticRequestModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
