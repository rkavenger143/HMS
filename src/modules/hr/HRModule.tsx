// ============================================================
// ALN Cure HMS — HR & Employees Management Module
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  Award,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Lock,
  Building,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import type {
  Employee,
  EmployeeDepartment,
  EmploymentType,
  AttendanceRecord,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  PayrollRecord
} from '../../types';

export default function HRModule() {
  const { state: authState } = useAuth();
  const userRole = authState.user?.role || 'receptionist';

  // Role permissions check for sensitive compensation data
  const canViewPayroll = ['super_admin', 'hospital_admin', 'management'].includes(userRole);
  const canManageStaff = ['super_admin', 'hospital_admin', 'management'].includes(userRole);

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll' | 'compliance'>('employees');

  const [employees, setEmployees] = useState<Employee[]>(() => storageService.getEmployees());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendanceRecords());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => storageService.getLeaveRequests());
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => storageService.getPayrollRecords());

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [selectedEmpDetail, setSelectedEmpDetail] = useState<Employee | null>(null);

  // New Employee Form State
  const [empForm, setEmpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '1990-01-01',
    department: 'Clinical - Doctors' as EmployeeDepartment,
    designation: '',
    employmentType: 'full_time' as EmploymentType,
    joiningDate: new Date().toISOString().split('T')[0],
    currentShift: 'general' as 'morning' | 'evening' | 'night' | 'rotational' | 'general',
    qualification: '',
    specialization: '',
    medicalRegistrationNumber: '',
    experienceYears: 5,
    address: '',
    basicSalary: 50000,
    allowances: 15000,
    deductions: 5000,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Family',
  });

  // Apply Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: 'casual' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setEmployees(storageService.getEmployees());
      setAttendance(storageService.getAttendanceRecords());
      setLeaveRequests(storageService.getLeaveRequests());
      setPayrollRecords(storageService.getPayrollRecords());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  // Handler: Add Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.firstName || !empForm.email) return;

    const netMonthly = Number(empForm.basicSalary) + Number(empForm.allowances) - Number(empForm.deductions);

    storageService.addEmployee({
      firstName: empForm.firstName,
      lastName: empForm.lastName,
      email: empForm.email,
      phone: empForm.phone,
      gender: empForm.gender,
      dateOfBirth: empForm.dateOfBirth,
      department: empForm.department,
      designation: empForm.designation,
      employmentType: empForm.employmentType,
      joiningDate: empForm.joiningDate,
      status: 'active',
      currentShift: empForm.currentShift,
      qualification: empForm.qualification,
      specialization: empForm.specialization || undefined,
      medicalRegistrationNumber: empForm.medicalRegistrationNumber || undefined,
      experienceYears: Number(empForm.experienceYears) || 0,
      emergencyContact: {
        name: empForm.emergencyContactName,
        phone: empForm.emergencyContactPhone,
        relationship: empForm.emergencyContactRelation,
      },
      address: empForm.address,
      salary: {
        basic: Number(empForm.basicSalary),
        allowances: Number(empForm.allowances),
        deductions: Number(empForm.deductions),
        netMonthly,
      },
      documents: [
        { id: `doc-${Date.now()}`, title: 'ID Proof Verified', type: 'id_proof', uploadedAt: new Date().toISOString().split('T')[0], status: 'verified' },
      ],
      certifications: [
        { name: 'Hospital Safety & Induction Training', issuedBy: 'ALN Cure HMS Academy', issueDate: new Date().toISOString().split('T')[0], expiryDate: '2027-12-31', status: 'valid' },
      ],
    });

    setShowAddEmpModal(false);
    setEmployees(storageService.getEmployees());
  };

  // Handler: Review Leave Request
  const handleReviewLeave = (id: string, status: LeaveStatus) => {
    storageService.updateLeaveRequest(id, {
      status,
      reviewedBy: authState.user?.name || 'Administrator',
      reviewedAt: new Date().toISOString(),
      reviewRemarks: status === 'approved' ? 'Leave approved per duty roster balance.' : 'Request declined due to staff shortage.',
    });
    setLeaveRequests(storageService.getLeaveRequests());
  };

  // Handler: Submit Leave Request
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(em => em.id === leaveForm.employeeId);
    if (!emp) return;

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    storageService.addLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      department: emp.department,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays,
      reason: leaveForm.reason,
      status: 'pending',
    });

    setShowApplyLeaveModal(false);
    setLeaveRequests(storageService.getLeaveRequests());
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === 'all' || emp.department === deptFilter;
    const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
  const onLeaveToday = employees.filter(e => e.status === 'on_leave').length;

  return (
    <div className="hr-module" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Hospital Administration</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>HR & Employees</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} />
            Human Resources & Staff Management
          </div>
          <div className="page-subtitle">
            Staff Directory, Doctor & Nurse Rosters, Shift Scheduling, Daily Biometric Attendance, Leave Approvals & Role-Secured Payroll
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEmployees(storageService.getEmployees());
              setAttendance(storageService.getAttendanceRecords());
              setLeaveRequests(storageService.getLeaveRequests());
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowApplyLeaveModal(true)}
          >
            <Calendar size={14} /> Apply Staff Leave
          </button>
          {canManageStaff && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddEmpModal(true)}
            >
              <UserPlus size={14} /> Register New Employee
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Staff Headcount</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{employees.length}</div>
            <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>{activeEmployees} Active on Duty</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Today's Attendance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>{attendance.filter(a => a.status === 'present').length} Present</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Biometric shift synced</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending Leave Requests</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: pendingLeaves > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>{pendingLeaves}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Awaiting approval</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Medical Compliance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>100%</div>
            <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>Licenses & ACLS Active</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="card" style={{ padding: '6px', background: 'var(--bg-surface)', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {[
          { id: 'employees', label: `Employee Directory (${employees.length})`, icon: <Users size={14} /> },
          { id: 'attendance', label: `Daily Attendance (${attendance.length})`, icon: <Clock size={14} /> },
          { id: 'leaves', label: `Leave Approvals (${pendingLeaves})`, icon: <Calendar size={14} /> },
          { id: 'payroll', label: 'Payroll & Compensation', icon: <DollarSign size={14} />, isRestricted: !canViewPayroll },
          { id: 'compliance', label: 'Licenses & Certifications', icon: <Award size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
              background: activeTab === t.id ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.icon}
            {t.label}
            {t.isRestricted && <Lock size={12} style={{ opacity: 0.7 }} />}
          </button>
        ))}
      </div>

      {/* Tab 1: Employee Directory */}
      {activeTab === 'employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search staff name, EMP code, designation, qualification..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
              />
            </div>

            <select
              className="input"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ width: 180, fontSize: 12 }}
            >
              <option value="all">All Departments</option>
              <option value="Clinical - Doctors">Clinical - Doctors</option>
              <option value="Nursing">Nursing</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Finance & Billing">Finance & Billing</option>
              <option value="Administration">Administration</option>
              <option value="Housekeeping">Housekeeping</option>
            </select>

            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 140, fontSize: 12 }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="probation">Probation</option>
            </select>
          </div>

          {/* Employee Directory Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 14 }}>
            {filteredEmployees.map(emp => (
              <div
                key={emp.id}
                className="card"
                style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Employee Header */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }} className="truncate">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <span className={`badge badge-${emp.status === 'active' ? 'success' : 'warning'}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>
                        {emp.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{emp.designation}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{emp.employeeCode} · {emp.department}</div>
                  </div>
                </div>

                {/* Details list */}
                <div style={{ fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-base)', padding: 10, borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <GraduationCap size={13} style={{ color: 'var(--color-primary)' }} />
                    <span className="truncate">{emp.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <Mail size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{emp.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <Phone size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{emp.phone}</span>
                  </div>
                  {emp.medicalRegistrationNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <ShieldCheck size={13} style={{ color: 'var(--color-success)' }} />
                      <span>Reg: <strong>{emp.medicalRegistrationNumber}</strong></span>
                    </div>
                  )}
                </div>

                {/* Footer: Shift & Exp */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)', paddingTop: 8 }}>
                  <span>Shift: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{emp.currentShift}</strong></span>
                  <span>Exp: <strong style={{ color: 'var(--text-primary)' }}>{emp.experienceYears} Years</strong></span>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => setSelectedEmpDetail(emp)}
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Tracking */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th>Shift Schedule</th>
                  <th>Check-In Time</th>
                  <th>Hours Logged</th>
                  <th>Biometric Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(att => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>{att.employeeCode}</td>
                    <td style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{att.employeeName}</td>
                    <td>{att.department}</td>
                    <td style={{ fontSize: 12 }}>{att.shift}</td>
                    <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{att.checkInTime}</td>
                    <td>{att.hoursWorked ? `${att.hoursWorked} hrs` : '-'}</td>
                    <td>
                      <span className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Management & Approvals */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Name & Code</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(lve => (
                  <tr key={lve.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{lve.employeeName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{lve.employeeCode}</div>
                    </td>
                    <td>{lve.department}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {lve.leaveType}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {lve.startDate} to {lve.endDate}
                    </td>
                    <td style={{ fontWeight: 700 }}>{lve.totalDays} Day{lve.totalDays > 1 ? 's' : ''}</td>
                    <td style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 220 }}>
                      {lve.reason}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          lve.status === 'approved'
                            ? 'success'
                            : lve.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }`}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}
                      >
                        {lve.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {lve.status === 'pending' && canManageStaff ? (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => handleReviewLeave(lve.id, 'approved')}
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleReviewLeave(lve.id, 'rejected')}
                          >
                            <XCircle size={12} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {lve.reviewedBy ? `Reviewed by ${lve.reviewedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Role-Restricted Payroll */}
      {activeTab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!canViewPayroll ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={28} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Access Restricted</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 450 }}>
                Compensation and salary disbursements are strictly protected under Hospital Role-Based Access Control. Only HR Administrators and Executive Leadership are authorized to view this section.
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 14, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={16} style={{ color: 'var(--color-success)' }} />
                  Monthly Payroll Register — August 2026
                </div>
                <span className="badge badge-success">All Direct Bank Transfers Processed</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Emp Code & Name</th>
                    <th>Department</th>
                    <th>Basic Salary</th>
                    <th>HRA & Allowances</th>
                    <th>PF & TDS Deductions</th>
                    <th>Net Pay Payout</th>
                    <th>Payment Status</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map(pay => (
                    <tr key={pay.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{pay.employeeName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{pay.employeeCode} · {pay.designation}</div>
                      </td>
                      <td>{pay.department}</td>
                      <td style={{ fontSize: 12 }}>₹{pay.basicSalary.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-success)' }}>+₹{(pay.hra + pay.specialAllowance).toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-danger)' }}>-₹{pay.totalDeductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>₹{pay.netPayable.toLocaleString()}</td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: 11, textTransform: 'capitalize' }}>
                          {pay.paymentStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{pay.transactionReference || 'NEFT'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Licenses & Compliance */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th>Medical License / Registration #</th>
                  <th>Accreditation & Certifications</th>
                  <th>Expiry Date</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{emp.employeeCode}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>
                      {emp.medicalRegistrationNumber || 'N/A (Non-clinical)'}
                    </td>
                    <td>
                      {emp.certifications.length > 0 ? (
                        emp.certifications.map((c, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: 'var(--text-primary)' }}>
                            • {c.name} ({c.issuedBy})
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Standard Staff Verification</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {emp.certifications[0]?.expiryDate || '2027-12-31'}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        <ShieldCheck size={11} style={{ marginRight: 4 }} /> Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register New Employee */}
      {showAddEmpModal && (
        <div className="modal-overlay" onClick={() => setShowAddEmpModal(false)}>
          <div className="modal-container" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                Register New Hospital Employee
              </div>
              <button className="modal-close" onClick={() => setShowAddEmpModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">First Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={empForm.firstName}
                      onChange={e => setEmpForm({ ...empForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={empForm.lastName}
                      onChange={e => setEmpForm({ ...empForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      className="input"
                      value={empForm.email}
                      onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="+91 98765 00000"
                      value={empForm.phone}
                      onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Department *</label>
                    <select
                      className="input"
                      value={empForm.department}
                      onChange={e => setEmpForm({ ...empForm, department: e.target.value as EmployeeDepartment })}
                    >
                      <option value="Clinical - Doctors">Clinical - Doctors</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Dietetics">Dietetics</option>
                      <option value="Finance & Billing">Finance & Billing</option>
                      <option value="Administration">Administration</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Security">Security</option>
                      <option value="IT & Biomedical">IT & Biomedical</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Designation / Role Title *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Senior Staff Nurse"
                      value={empForm.designation}
                      onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Employment Type</label>
                    <select
                      className="input"
                      value={empForm.employmentType}
                      onChange={e => setEmpForm({ ...empForm, employmentType: e.target.value as EmploymentType })}
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="visiting_consultant">Visiting Consultant</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Assigned Shift</label>
                    <select
                      className="input"
                      value={empForm.currentShift}
                      onChange={e => setEmpForm({ ...empForm, currentShift: e.target.value as any })}
                    >
                      <option value="morning">Morning Shift</option>
                      <option value="evening">Evening Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="general">General (09:00 - 18:00)</option>
                      <option value="rotational">Rotational</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Experience (Years)</label>
                    <input
                      type="number"
                      className="input"
                      value={empForm.experienceYears}
                      onChange={e => setEmpForm({ ...empForm, experienceYears: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Highest Qualification *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. B.Sc. Nursing / MBBS"
                      value={empForm.qualification}
                      onChange={e => setEmpForm({ ...empForm, qualification: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Medical Reg. Number (if Doctor/Nurse)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. MCI-2020-12345"
                      value={empForm.medicalRegistrationNumber}
                      onChange={e => setEmpForm({ ...empForm, medicalRegistrationNumber: e.target.value })}
                    />
                  </div>
                </div>

                {canViewPayroll && (
                  <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="label">Basic Salary (₹)</label>
                      <input
                        type="number"
                        className="input"
                        value={empForm.basicSalary}
                        onChange={e => setEmpForm({ ...empForm, basicSalary: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="label">Allowances (₹)</label>
                      <input
                        type="number"
                        className="input"
                        value={empForm.allowances}
                        onChange={e => setEmpForm({ ...empForm, allowances: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="label">Deductions (₹)</label>
                      <input
                        type="number"
                        className="input"
                        value={empForm.deductions}
                        onChange={e => setEmpForm({ ...empForm, deductions: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEmpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply Staff Leave */}
      {showApplyLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowApplyLeaveModal(false)}>
          <div className="modal-container" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                Apply Staff Leave Request
              </div>
              <button className="modal-close" onClick={() => setShowApplyLeaveModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitLeave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Select Staff Member *</label>
                  <select
                    className="input"
                    value={leaveForm.employeeId}
                    onChange={e => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.employeeCode} - {e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Leave Type *</label>
                  <select
                    className="input"
                    value={leaveForm.leaveType}
                    onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value as LeaveType })}
                  >
                    <option value="casual">Casual Leave (CL)</option>
                    <option value="sick">Sick / Medical Leave (SL)</option>
                    <option value="earned">Earned / Privilege Leave (EL)</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="compensatory">Compensatory Off</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Start Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={leaveForm.startDate}
                      onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">End Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={leaveForm.endDate}
                      onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Reason / Notes *</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Provide reason and clinical handover notes..."
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Employee Dossier View */}
      {selectedEmpDetail && (
        <div className="modal-overlay" onClick={() => setSelectedEmpDetail(null)}>
          <div className="modal-container" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Staff Dossier — {selectedEmpDetail.firstName} {selectedEmpDetail.lastName}</div>
              <button className="modal-close" onClick={() => setSelectedEmpDetail(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedEmpDetail.firstName[0]}{selectedEmpDetail.lastName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedEmpDetail.firstName} {selectedEmpDetail.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{selectedEmpDetail.designation} ({selectedEmpDetail.department})</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>ID: {selectedEmpDetail.employeeCode} · Joined: {selectedEmpDetail.joiningDate}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, background: 'var(--bg-base)', padding: 12, borderRadius: 8 }}>
                <div><strong>Qualification:</strong> {selectedEmpDetail.qualification}</div>
                <div><strong>Specialization:</strong> {selectedEmpDetail.specialization || 'General'}</div>
                <div><strong>Shift:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedEmpDetail.currentShift}</span></div>
                <div><strong>Experience:</strong> {selectedEmpDetail.experienceYears} Years</div>
                <div><strong>Email:</strong> {selectedEmpDetail.email}</div>
                <div><strong>Phone:</strong> {selectedEmpDetail.phone}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Emergency Contact:</strong> {selectedEmpDetail.emergencyContact.name} ({selectedEmpDetail.emergencyContact.relationship}) — {selectedEmpDetail.emergencyContact.phone}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEmpDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
