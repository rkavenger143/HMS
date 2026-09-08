import React, { useState } from 'react';
import {
  Users, Plus, Search, Filter, Phone, Mail, Award, Clock,
  Edit2, Trash2, CheckCircle2, UserCheck, Shield, Eye, X
} from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import type { Nurse } from '../../../types';

export default function NurseManagement() {
  const { nurses, wards, addNurse, updateNurse, deleteNurse } = useNursing();

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [viewingNurse, setViewingNurse] = useState<Nurse | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('General Ward');
  const [ward, setWard] = useState(wards[0]?.name || 'General Ward A');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('B.Sc Nursing');
  const [experienceYears, setExperienceYears] = useState(3);
  const [status, setStatus] = useState<Nurse['status']>('active');
  const [shift, setShift] = useState<Nurse['shift']>('morning');

  const filteredNurses = nurses.filter(n => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      n.name.toLowerCase().includes(q) ||
      n.employeeId.toLowerCase().includes(q) ||
      n.ward.toLowerCase().includes(q) ||
      n.qualification.toLowerCase().includes(q) ||
      n.phone.includes(q);

    const matchesWard = wardFilter === 'ALL' || n.ward === wardFilter;
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;

    return matchesSearch && matchesWard && matchesStatus;
  });

  const handleOpenAdd = () => {
    const nextEmpId = `EMP-NUR-${100 + nurses.length + 1}`;
    setName('');
    setEmployeeId(nextEmpId);
    setDepartment('General Ward');
    setWard(wards[0]?.name || 'General Ward A');
    setPhone('');
    setEmail('');
    setQualification('B.Sc Nursing');
    setExperienceYears(3);
    setStatus('active');
    setShift('morning');
    setShowAddModal(true);
  };

  const handleOpenEdit = (n: Nurse) => {
    setEditingNurse(n);
    setName(n.name);
    setEmployeeId(n.employeeId);
    setDepartment(n.department);
    setWard(n.ward);
    setPhone(n.phone);
    setEmail(n.email || '');
    setQualification(n.qualification);
    setExperienceYears(n.experienceYears);
    setStatus(n.status);
    setShift(n.shift || 'morning');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addNurse({
      name,
      employeeId,
      department,
      ward,
      phone,
      email,
      qualification,
      experienceYears: Number(experienceYears) || 1,
      status,
      shift,
    });
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNurse) return;
    updateNurse(editingNurse.id, {
      name,
      employeeId,
      department,
      ward,
      phone,
      email,
      qualification,
      experienceYears: Number(experienceYears) || 1,
      status,
      shift,
    });
    setEditingNurse(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nurse Staff Directory & Profile Management</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hospital nursing roster, duty status, qualifications, clinical experience, and ward assignments
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={14} /> Add Nurse
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Nurse Name, Employee ID, Phone, Ward..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={wardFilter} onChange={e => setWardFilter(e.target.value)}>
            <option value="ALL">All Wards ({wards.length})</option>
            {wards.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses ({nurses.length})</option>
            <option value="on_duty">● On Duty ({nurses.filter(n => n.status === 'on_duty').length})</option>
            <option value="active">Active Staff ({nurses.filter(n => n.status === 'active').length})</option>
            <option value="on_leave">On Leave ({nurses.filter(n => n.status === 'on_leave').length})</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Nurses Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title">Registered Nursing Personnel</span>
            <span className="badge badge-primary">{filteredNurses.length} Nurses</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nurse ID & Name</th>
                  <th>Department & Ward</th>
                  <th>Contact Details</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Assigned Shift</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNurses.length > 0 ? (
                  filteredNurses.map(nurse => {
                    const isOnDuty = nurse.status === 'on_duty';
                    const isOnLeave = nurse.status === 'on_leave';

                    return (
                      <tr key={nurse.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm">
                              {nurse.name[0]}
                            </div>
                            <div>
                              <strong style={{ fontSize: 14 }}>{nurse.name}</strong>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{nurse.employeeId}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>{nurse.ward}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{nurse.department}</div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <Phone size={11} style={{ color: 'var(--color-primary)' }} />
                            <span>{nurse.phone}</span>
                          </div>
                          {nurse.email && (
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{nurse.email}</div>
                          )}
                        </td>

                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                            {nurse.qualification}
                          </span>
                        </td>

                        <td>
                          <strong>{nurse.experienceYears} yrs</strong>
                        </td>

                        <td>
                          <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: 10 }}>
                            {nurse.shift || 'Morning'}
                          </span>
                        </td>

                        <td>
                          {isOnDuty ? (
                            <span className="badge badge-success">
                              <span className="badge-dot" /> On Duty
                            </span>
                          ) : isOnLeave ? (
                            <span className="badge badge-warning">On Leave</span>
                          ) : (
                            <span className="badge badge-neutral">Active</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="View Profile"
                              onClick={() => setViewingNurse(nurse)}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              title="Edit Nurse"
                              onClick={() => handleOpenEdit(nurse)}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 6px', color: 'var(--color-danger)' }}
                              title="Remove Nurse"
                              onClick={() => {
                                if (confirm(`Remove nurse ${nurse.name} from roster?`)) {
                                  deleteNurse(nurse.id);
                                }
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: '32px' }}>
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <div className="empty-state-title">No Nurses Found</div>
                        <div className="empty-state-desc">Click "Add Nurse" to register nursing personnel.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD NURSE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Register New Nurse</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Kavitha Nair" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee ID <span className="required">*</span></label>
                    <input type="text" className="form-input" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Ward <span className="required">*</span></label>
                    <select className="form-select" value={ward} onChange={e => setWard(e.target.value)}>
                      {wards.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input type="tel" className="form-input" placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="nurse@hospital.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification <span className="required">*</span></label>
                    <select className="form-select" value={qualification} onChange={e => setQualification(e.target.value)}>
                      <option value="B.Sc Nursing">B.Sc Nursing</option>
                      <option value="M.Sc Critical Care Nursing">M.Sc Critical Care Nursing</option>
                      <option value="GNM (General Nursing & Midwifery)">GNM</option>
                      <option value="Post Basic B.Sc Nursing">Post Basic B.Sc Nursing</option>
                      <option value="ANM">ANM</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years) <span className="required">*</span></label>
                    <input type="number" min="0" max="40" className="form-input" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Shift</label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Evening (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duty Status</label>
                    <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                      <option value="on_duty">On Duty</option>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Nurse Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NURSE MODAL */}
      {editingNurse && (
        <div className="modal-backdrop" onClick={() => setEditingNurse(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Edit2 size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">Edit Nurse: {editingNurse.name}</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setEditingNurse(null)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee ID <span className="required">*</span></label>
                    <input type="text" className="form-input" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Ward <span className="required">*</span></label>
                    <select className="form-select" value={ward} onChange={e => setWard(e.target.value)}>
                      {wards.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification <span className="required">*</span></label>
                    <select className="form-select" value={qualification} onChange={e => setQualification(e.target.value)}>
                      <option value="B.Sc Nursing">B.Sc Nursing</option>
                      <option value="M.Sc Critical Care Nursing">M.Sc Critical Care Nursing</option>
                      <option value="GNM (General Nursing & Midwifery)">GNM</option>
                      <option value="Post Basic B.Sc Nursing">Post Basic B.Sc Nursing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input type="number" min="0" max="40" className="form-input" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Shift</label>
                    <select className="form-select" value={shift} onChange={e => setShift(e.target.value as any)}>
                      <option value="morning">Morning (07:00 - 15:00)</option>
                      <option value="afternoon">Evening (15:00 - 23:00)</option>
                      <option value="night">Night (23:00 - 07:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duty Status</label>
                    <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                      <option value="on_duty">On Duty</option>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingNurse(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Update Nurse Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW NURSE PROFILE MODAL */}
      {viewingNurse && (
        <div className="modal-backdrop" onClick={() => setViewingNurse(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="avatar avatar-md">{viewingNurse.name[0]}</div>
              <div>
                <div className="modal-title">{viewingNurse.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{viewingNurse.employeeId} · {viewingNurse.ward}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setViewingNurse(null)} style={{ marginLeft: 'auto' }}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div>Qualification: <strong>{viewingNurse.qualification}</strong></div>
                  <div>Experience: <strong>{viewingNurse.experienceYears} Years</strong></div>
                  <div>Phone: <strong>{viewingNurse.phone}</strong></div>
                  <div>Shift: <strong style={{ textTransform: 'capitalize' }}>{viewingNurse.shift || 'Morning'}</strong></div>
                  <div>Department: <strong>{viewingNurse.department}</strong></div>
                  <div>Status: <span className={`badge ${viewingNurse.status === 'on_duty' ? 'badge-success' : 'badge-neutral'}`}>{viewingNurse.status.toUpperCase()}</span></div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingNurse(null)}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={() => { const n = viewingNurse; setViewingNurse(null); handleOpenEdit(n); }}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
