import React, { useState, useMemo } from 'react';
import {
  Building2, Plus, Search, Edit3, CheckCircle2, XCircle,
  Phone, Mail, MapPin, UserCheck, Download, FileSpreadsheet
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Department } from '../../../types';
import AddEditDepartmentModal from './modals/AddEditDepartmentModal';

export default function DepartmentManagement() {
  const { departments, toggleDepartmentStatus, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.headName?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'active' && d.isActive) ||
        (statusFilter === 'inactive' && !d.isActive);

      return matchSearch && matchStatus;
    });
  }, [departments, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const rows = filteredDepts.map(d => [
      d.id,
      d.name,
      d.code,
      d.headName || '—',
      d.phone || '—',
      d.email || '—',
      d.location || '—',
      d.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);

    exportCSV(
      'HMS_Hospital_Departments_Registry',
      ['Department ID', 'Department Name', 'Dept Code', 'Head of Department (HOD)', 'Phone', 'Email', 'Location', 'Status'],
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
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Department Directory & Governance</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure clinical specialities, administrative units, HOD appointments, and physical wings
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
              <FileSpreadsheet size={13} /> Export CSV
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedDept(null);
                setIsAddEditOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Add Department
            </button>
          </div>
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
                placeholder="Search department, HOD, location..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({departments.length})</option>
              <option value="active">Active Departments Only</option>
              <option value="inactive">Inactive Departments Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Cards / Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filteredDepts.map(d => (
          <div
            key={d.id}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: d.isActive ? 1 : 0.7,
              borderLeft: `3px solid ${d.isActive ? 'var(--color-primary)' : '#94a3b8'}`,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{d.name}</strong>
                    <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {d.code}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>ID: {d.id}</div>
                </div>

                <span className={`badge ${d.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {d.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={13} style={{ color: 'var(--color-primary)' }} />
                  <span><strong>HOD:</strong> {d.headName || 'Not Assigned'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} style={{ color: '#0284c7' }} />
                  <span>{d.location || 'Hospital Main Building'}</span>
                </div>

                {d.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{d.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-default)' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => toggleDepartmentStatus(d.id)}
                style={{ fontSize: 11, color: d.isActive ? 'var(--color-danger)' : 'var(--color-primary)', padding: 0 }}
              >
                {d.isActive ? 'Deactivate Dept' : 'Activate Dept'}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSelectedDept(d);
                  setIsAddEditOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Edit3 size={13} /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AddEditDepartmentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        department={selectedDept}
      />
    </div>
  );
}
