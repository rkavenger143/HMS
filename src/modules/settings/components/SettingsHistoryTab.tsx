import React, { useState, useMemo } from 'react';
import {
  History, Search, Filter, Download, FileSpreadsheet,
  Clock, UserCheck, ShieldCheck, Tag
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsHistoryTab() {
  const { history } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        h.settingName.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.changedBy.toLowerCase().includes(q) ||
        h.newValue.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q);

      const matchCat = categoryFilter === 'ALL' || h.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [history, searchQuery, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    history.forEach(h => set.add(h.category));
    return Array.from(set);
  }, [history]);

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Category', 'Setting Name', 'Old Value', 'New Value', 'Changed By', 'Reason'];
    const rows = filteredHistory.map(h => [
      h.id,
      h.timestamp,
      h.category,
      h.settingName,
      h.oldValue,
      h.newValue,
      h.changedBy,
      h.reason || 'Routine administrative adjustment',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALN_CURE_Settings_Change_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Settings Audit Trail & Configuration Modification History</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Immutable auditable change log recording every hospital parameter, tariff, prefix, and security modification
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileSpreadsheet size={13} /> Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search setting, administrator, values..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Configuration Changes Ledger</span>
          <span className="badge badge-primary">{filteredHistory.length} Recorded Modifications</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>Domain Category</th>
                  <th>Setting Modified</th>
                  <th>Previous State</th>
                  <th>New State</th>
                  <th>Changed By</th>
                  <th>Change Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(record => (
                  <tr key={record.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {record.id}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{record.timestamp}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{record.category}</span>
                    </td>
                    <td>
                      <strong>{record.settingName}</strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 12, textDecoration: 'line-through' }}>
                        {record.oldValue}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}>
                        {record.newValue}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12 }}>{record.changedBy}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {record.reason || 'Standard configuration save'}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No configuration history records match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
