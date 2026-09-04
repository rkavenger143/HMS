import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Edit3, Trash2, KeyRound,
  Lock, Unlock, CheckCircle2, XCircle, ShieldCheck, Download, FileSpreadsheet
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { User } from '../../../types';
import AddEditUserModal from './modals/AddEditUserModal';
import ResetPasswordModal from './modals/ResetPasswordModal';
import ConfirmActionModal from './modals/ConfirmActionModal';

export default function UserManagement() {
  const { users, roles, departments, toggleUserStatus, lockUser, deleteUser, exportCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [passUser, setPassUser] = useState<User | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchDept = deptFilter === 'ALL' || u.department === deptFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);

      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [users, searchQuery, roleFilter, deptFilter, statusFilter]);

  const handleExportCSV = () => {
    const rows = filteredUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.phone || '—',
      u.role.replace(/_/g, ' ').toUpperCase(),
      u.department || '—',
      u.isActive ? 'ACTIVE' : 'INACTIVE',
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '—',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—',
    ]);

    exportCSV(
      'HMS_System_Users_Directory',
      ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Department', 'Account Status', 'Last Login', 'Created Date'],
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
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hospital User Management & Access Provisioning</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Provision accounts, assign role privileges, lock/unlock accounts, and reset secure credentials
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
                setSelectedUser(null);
                setIsAddEditOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <UserPlus size={14} /> Provision New User
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          {/* Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search user, email, phone..."
                style={{ paddingLeft: 30 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles ({users.length})</option>
              {roles.map(r => (
                <option key={r.id} value={r.roleKey}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Locked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Master Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Hospital Personnel Directory</span>
          <span className="badge badge-primary">{filteredUsers.length} Users Listed</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Role & Privileges</th>
                  <th>Department</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const roleObj = roles.find(r => r.roleKey === u.role);
                  const roleColor = roleObj?.color || '#0284c7';

                  return (
                    <tr key={u.id} style={{ background: !u.isActive ? '#fef2f2' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              backgroundColor: `${roleColor}20`,
                              color: roleColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: 13 }}>{u.name}</strong>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: `${roleColor}15`,
                            color: roleColor,
                            fontWeight: 600,
                            border: `1px solid ${roleColor}30`,
                          }}
                        >
                          {roleObj?.name || u.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{u.department || '—'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.phone || '—'}</div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(u.id)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          title="Click to toggle account status"
                        >
                          <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`} style={{ cursor: 'pointer' }}>
                            <span className="badge-dot" />
                            {u.isActive ? 'Active' : 'Locked / Inactive'}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never logged in'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="Reset Password"
                            onClick={() => {
                              setPassUser(u);
                              setIsResetPassOpen(true);
                            }}
                            style={{ color: '#d97706' }}
                          >
                            <KeyRound size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="Edit User"
                            onClick={() => {
                              setSelectedUser(u);
                              setIsAddEditOpen(true);
                            }}
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="Delete User"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setConfirmDelete({ open: true, user: u })}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No user accounts found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEditUserModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        user={selectedUser}
      />

      <ResetPasswordModal
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        user={passUser}
      />

      <ConfirmActionModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, user: null })}
        onConfirm={() => {
          if (confirmDelete.user) {
            deleteUser(confirmDelete.user.id);
          }
        }}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${confirmDelete.user?.name}" (${confirmDelete.user?.email})? This action will be recorded in compliance audit logs.`}
        confirmLabel="Delete User"
        confirmVariant="danger"
      />
    </div>
  );
}
