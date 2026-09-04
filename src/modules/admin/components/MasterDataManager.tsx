import React, { useState, useMemo } from 'react';
import {
  Database, Plus, Search, Edit3, CheckCircle2,
  FileSpreadsheet, Filter, Tag, Layers
} from 'lucide-react';
import { useAdmin, MasterDataItem } from '../context/AdminContext';
import AddEditMasterItemModal from './modals/AddEditMasterItemModal';

const MASTER_CATEGORIES: MasterDataItem['category'][] = [
  'Specialization',
  'Designation',
  'Sample Type',
  'Blood Component',
  'Payment Method',
  'Room Type',
  'Unit',
  'Service Category',
];

export default function MasterDataManager() {
  const { masterData, toggleMasterItemStatus, exportCSV } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<MasterDataItem['category']>('Specialization');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);

  const filteredItems = useMemo(() => {
    return masterData.filter(m => {
      const matchCat = m.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [masterData, selectedCategory, searchQuery]);

  const handleExportCSV = () => {
    const rows = masterData.map(m => [
      m.id,
      m.category,
      m.code,
      m.name,
      m.description || '—',
      m.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);

    exportCSV(
      'HMS_Master_Data_Lookups_Registry',
      ['Item ID', 'Category', 'Code', 'Display Name', 'Description', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital Master Data & Taxonomy Management</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure standardized lookups, clinical specialities, lab sample types, and financial enumeration lists
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FileSpreadsheet size={13} /> Export All Masters
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedItem(null);
                setIsAddEditOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Add {selectedCategory}
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
        }}
      >
        {MASTER_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = masterData.filter(m => m.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--bg-card)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
                fontSize: 13,
                fontWeight: isSelected ? 600 : 500,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Layers size={13} />
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '12px 18px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={`Search ${selectedCategory} by code or name...`}
            style={{ paddingLeft: 30 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Master Data Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">{selectedCategory} Records</span>
          <span className="badge badge-primary">{filteredItems.length} Entries</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unique Code</th>
                  <th>Display Title</th>
                  <th>Description / Context</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {item.code}
                      </strong>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {item.description || '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleMasterItemStatus(item.id)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsAddEditOpen(true);
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No {selectedCategory} records found. Click &quot;Add {selectedCategory}&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddEditMasterItemModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        item={selectedItem}
        defaultCategory={selectedCategory}
      />
    </div>
  );
}
