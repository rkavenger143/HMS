import React, { useState, useMemo } from 'react';
import {
  UserCheck, Plus, Search, Edit3, Clock, Building2,
  Phone, Mail, Calendar, Download, FileSpreadsheet
} from 'lucide-react';
import { useAdmin, AdminStaff } from '../context/AdminContext';
import AddEditStaffModal from './modals/AddEditStaffModal';

export default function StaffManagement() {
  const { staffList, toggleStaffStatus, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminStaff | null>(null);

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      const matchShift = shiftFilter === 'ALL' || s.shift.includes(shiftFilter);
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchShift && matchStatus;
    });
  }, [staffList, searchQuery, shiftFilter, statusFilter]);

  const handleExportCSV = () => {
    const rows = filteredStaff.map(s => [
      s.employeeId,
      s.name,
      s.department,
      s.designation,
      s.shift,
      s.reportingManager,
      s.phone,
      s.email,
      s.joiningDate,
      s.status.toUpperCase(),
    ]);

    exportCSV(
      'HMS_Staff_Duty_Roster_Register',
      ['Employee ID', 'Full Name', 'Department', 'Designation', 'Duty Shift', 'Reporting Manager', 'Phone', 'Email', 'Joining Date', 'Status'],
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
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital Staff Administration & Duty Rosters</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Maintain employee records, duty shifts, designations, and supervisory reporting hierarchies
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
                setSelectedStaff(null);
                setIsAddEditOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Enroll Staff Member
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
                placeholder="Search name, emp ID, designation..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={shiftFilter}
              onChange={e => setShiftFilter(e.target.value)}
            >
              <option value="ALL">All Duty Shifts</option>
              <option value="Morning">Morning Shift (08:00 - 16:00)</option>
              <option value="Evening">Evening Shift (16:00 - 00:00)</option>
              <option value="Night">Night Shift (00:00 - 08:00)</option>
              <option value="General">General Shift (09:00 - 17:00)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Employment Statuses</option>
              <option value="active">Active Duty</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Enrolled Employee Registry</span>
          <span className="badge badge-primary">{filteredStaff.length} Staff Enrolled</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation & Dept</th>
                  <th>Duty Shift</th>
                  <th>Reporting Manager</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: 13 }}>{s.name}</strong>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{s.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{s.designation}</strong></div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.department}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                        <span>{s.shift}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12 }}>{s.reportingManager || '—'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{s.phone}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'on_leave' ? 'badge-warning' : 'badge-danger'}`}>
                        {s.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          title="Edit Staff"
                          onClick={() => {
                            setSelectedStaff(s);
                            setIsAddEditOpen(true);
                          }}
                        >
                          <Edit3 size={13} />
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

      {/* Modal */}
      <AddEditStaffModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        staff={selectedStaff}
      />
    </div>
  );
}
