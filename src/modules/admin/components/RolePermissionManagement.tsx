import React, { useState } from 'react';
import {
  ShieldCheck, Shield, Plus, CheckCircle2, Lock, Save,
  Users, AlertCircle, Info, Sparkles, Trash2
} from 'lucide-react';
import { useAdmin, AdminRole } from '../context/AdminContext';
import AddEditRoleModal from './modals/AddEditRoleModal';
import ConfirmActionModal from './modals/ConfirmActionModal';

// Granular HMS Permissions Taxonomy
interface PermissionModuleGroup {
  module: string;
  label: string;
  permissions: { key: string; label: string; description: string }[];
}

const PERMISSION_GROUPS: PermissionModuleGroup[] = [
  {
    module: 'dashboard',
    label: 'Overview & Dashboard',
    permissions: [
      { key: 'dashboard.view', label: 'View Dashboard Stats', description: 'Access executive telemetry & department KPI counters' },
      { key: 'ai.access', label: 'Access AI Clinical Copilot', description: 'Use ALN Cure AI for clinical notes & diagnostics support' },
    ],
  },
  {
    module: 'patients',
    label: 'Patients & Demographics',
    permissions: [
      { key: 'patients.view', label: 'View Patient Records', description: 'Search & view patient clinical history and profiles' },
      { key: 'patients.create', label: 'Register New Patient', description: 'Create new patient charts, MRNs & demographics' },
      { key: 'patients.edit', label: 'Edit Patient Demographics', description: 'Update patient contact details and insurance info' },
      { key: 'patients.delete', label: 'Archive / Delete Patient', description: 'High privilege patient chart deactivation' },
      { key: 'patients.export', label: 'Export Patient Data', description: 'Download CSV and demographic registries' },
    ],
  },
  {
    module: 'opd',
    label: 'Outpatient (OPD)',
    permissions: [
      { key: 'opd.registration', label: 'OPD Check-In & Token', description: 'Issue consultation tokens and queue arrivals' },
      { key: 'opd.queue', label: 'Queue Management', description: 'Call tokens, manage doctor consulting rooms' },
      { key: 'opd.consultation', label: 'Conduct Clinical Consultation', description: 'Doctor clinical notes, ICD codes, and examination' },
      { key: 'opd.prescription', label: 'Issue e-Prescriptions', description: 'Author electronic prescriptions and dosage plans' },
    ],
  },
  {
    module: 'ipd',
    label: 'Inpatient (IPD) & Beds',
    permissions: [
      { key: 'ipd.view', label: 'View Inpatient Census', description: 'View admitted patients and active ward status' },
      { key: 'ipd.admit', label: 'Admit Inpatient', description: 'Process patient admission and bed reservation' },
      { key: 'ipd.transfer', label: 'Bed / Ward Transfer', description: 'Transfer inpatients between wards, rooms and ICUs' },
      { key: 'ipd.rounds', label: 'Doctor Bedside Rounds', description: 'Record daily physician clinical notes & vitals' },
      { key: 'ipd.discharge', label: 'Authorize Discharge', description: 'Generate final discharge summaries and instructions' },
    ],
  },
  {
    module: 'nursing',
    label: 'Nursing & Bedside Care',
    permissions: [
      { key: 'nursing.vitals', label: 'Record Patient Vitals', description: 'Record BP, SpO2, Temperature, Pulse, and Pain scores' },
      { key: 'nursing.mar', label: 'Medication Administration (MAR)', description: 'Log scheduled medication delivery and IV drips' },
      { key: 'nursing.notes', label: 'Nursing Shift Notes', description: 'Write shift handover notes and clinical observations' },
      { key: 'nursing.incident', label: 'Report Clinical Incidents', description: 'Log patient falls, medication errors or reaction events' },
    ],
  },
  {
    module: 'laboratory',
    label: 'Laboratory & LIS',
    permissions: [
      { key: 'laboratory.order', label: 'Order Diagnostic Tests', description: 'Prescribe lab investigations from OPD / IPD' },
      { key: 'laboratory.sample', label: 'Sample Phlebotomy & Accession', description: 'Collect specimens and generate barcode labels' },
      { key: 'laboratory.results', label: 'Enter Test Results', description: 'Input analyte values, units, and reference ranges' },
      { key: 'laboratory.verify', label: 'Verify & Authorize Lab Reports', description: 'Pathologist signoff and report publication' },
    ],
  },
  {
    module: 'radiology',
    label: 'Radiology & RIS',
    permissions: [
      { key: 'radiology.order', label: 'Order Imaging Studies', description: 'Order X-Ray, CT, MRI, Ultrasound exams' },
      { key: 'radiology.schedule', label: 'Schedule Modality Exams', description: 'Assign exam slots and technician teams' },
      { key: 'radiology.report', label: 'Write Radiology Reports', description: 'Radiologist findings, impression, and PACs verification' },
    ],
  },
  {
    module: 'pharmacy',
    label: 'Pharmacy & Stock',
    permissions: [
      { key: 'pharmacy.dispense', label: 'Dispense Prescriptions', description: 'Fill outpatient prescriptions and verify dosages' },
      { key: 'pharmacy.inventory', label: 'Manage Stock & Purchase Orders', description: 'Stock-in batches, suppliers, and PO workflows' },
      { key: 'pharmacy.pos', label: 'Pharmacy POS Retail Sales', description: 'Counter billing, OTC medicines, and receipts' },
      { key: 'pharmacy.returns', label: 'Process Medicine Returns', description: 'Accept returned sealed stock and credit notes' },
    ],
  },
  {
    module: 'blood_bank',
    label: 'Blood Bank & Transfusion',
    permissions: [
      { key: 'blood_bank.donors', label: 'Manage Donors & Phlebotomy', description: 'Donor screening, blood collection sessions' },
      { key: 'blood_bank.screen', label: 'TTI Serology & Quarantine', description: 'Infectious disease testing & quarantine release' },
      { key: 'blood_bank.crossmatch', label: 'Cross-Match & Compatibility', description: 'Major/minor cross-match and certificate issue' },
      { key: 'blood_bank.issue', label: 'Safety Handover & Unit Issue', description: '8-point pre-transfusion safety verification' },
      { key: 'blood_bank.transfuse', label: 'Bedside Transfusion & Reactions', description: 'Transfusion monitoring and hemovigilance reports' },
    ],
  },
  {
    module: 'billing',
    label: 'Central Billing & Accounts',
    permissions: [
      { key: 'billing.create', label: 'Generate Invoices', description: 'Create unified bills across all hospital services' },
      { key: 'billing.payments', label: 'Accept Cash & POS Payments', description: 'Collect cash, card, UPI and issue receipts' },
      { key: 'billing.discount', label: 'Authorize Concessions & Discounts', description: 'Apply promotional and hardship discounts' },
      { key: 'billing.refunds', label: 'Process Financial Refunds', description: 'Approve cash and digital refund transactions' },
    ],
  },
  {
    module: 'reports',
    label: 'Analytics & Executive Reports',
    permissions: [
      { key: 'reports.view', label: 'View Hospital Reports', description: 'Access departmental analytics and graphs' },
      { key: 'reports.financial', label: 'View Revenue & Financial Analytics', description: 'Inspect revenue trajectory, collections & AR' },
      { key: 'reports.export', label: 'Export Data to CSV & Print', description: 'Download complete ledgers and print official audits' },
    ],
  },
  {
    module: 'admin',
    label: 'System Administration',
    permissions: [
      { key: 'admin.users', label: 'Manage User Accounts', description: 'Create, lock, and reset credentials for staff' },
      { key: 'admin.roles', label: 'Configure Roles & RBAC Matrix', description: 'Define custom roles and change access rights' },
      { key: 'admin.settings', label: 'Hospital Settings & Tariffs', description: 'Change hospital tariffs, taxes, and profile' },
      { key: 'admin.audit', label: 'View Security Audit Logs', description: 'Inspect system access trails and security events' },
    ],
  },
];

export default function RolePermissionManagement() {
  const { roles, updateRolePermissions, deleteRole } = useAdmin();

  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('doctor');
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; role: AdminRole | null }>({ open: false, role: null });

  const activeRole = roles.find(r => r.roleKey === selectedRoleKey) || roles[0];
  const isSuperAdmin = activeRole.roleKey === 'super_admin';

  // Toggle single permission
  const handleTogglePermission = (permKey: string) => {
    if (isSuperAdmin) return; // Super admin always has *

    let current = [...activeRole.permissions];
    if (current.includes(permKey)) {
      current = current.filter(k => k !== permKey);
    } else {
      current.push(permKey);
    }

    updateRolePermissions(activeRole.roleKey, current);
    showSavedToast();
  };

  // Select all for a module
  const handleSelectModuleAll = (moduleGroup: PermissionModuleGroup) => {
    if (isSuperAdmin) return;
    const moduleKeys = moduleGroup.permissions.map(p => p.key);
    const hasAll = moduleKeys.every(k => activeRole.permissions.includes(k));

    let updated = [...activeRole.permissions];
    if (hasAll) {
      updated = updated.filter(k => !moduleKeys.includes(k));
    } else {
      moduleKeys.forEach(k => {
        if (!updated.includes(k)) updated.push(k);
      });
    }

    updateRolePermissions(activeRole.roleKey, updated);
    showSavedToast();
  };

  const showSavedToast = () => {
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Role-Based Access Control (RBAC) & Permissions Matrix</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure fine-grained module privileges and authority levels for all hospital staff positions
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddRoleOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Create Custom Role
          </button>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500 }}>
          <CheckCircle2 size={15} style={{ color: '#059669' }} />
          Role permissions matrix successfully saved and synced across active staff sessions!
        </div>
      )}

      {/* Role Cards Horizontal Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
        }}
      >
        {roles.map(r => {
          const isSelected = r.roleKey === selectedRoleKey;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoleKey(r.roleKey)}
              style={{
                flexShrink: 0,
                padding: '12px 16px',
                borderRadius: 10,
                border: isSelected ? `2px solid ${r.color}` : '1px solid var(--border-default)',
                background: isSelected ? `${r.color}10` : 'var(--bg-card)',
                color: isSelected ? r.color : 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: 170,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: r.color,
                  }}
                />
                {r.isSystem && (
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>
                    SYSTEM
                  </span>
                )}
              </div>
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{r.name}</strong>
              <div style={{ fontSize: 11, opacity: 0.8, color: 'var(--text-secondary)' }}>
                {r.permissions.includes('*') ? 'All Privileges (*)' : `${r.permissions.length} Permissions`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Header Card */}
      <div className="card" style={{ borderLeft: `4px solid ${activeRole.color}` }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: activeRole.color, fontWeight: 700 }}>{activeRole.name}</h3>
              <span className="badge" style={{ background: `${activeRole.color}20`, color: activeRole.color, fontFamily: 'monospace' }}>
                {activeRole.roleKey}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              {activeRole.description}
            </p>
          </div>

          {!activeRole.isSystem && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirmDelete({ open: true, role: activeRole })}
              style={{ color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Trash2 size={13} /> Delete Custom Role
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Special Callout */}
      {isSuperAdmin && (
        <div style={{ padding: '14px 18px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={20} style={{ color: '#7c3aed', flexShrink: 0 }} />
          <div style={{ fontSize: 13 }}>
            <strong>Super Admin Role:</strong> Possesses universal wildcard (<code>*</code>) authority over every clinical, financial, administrative, and database endpoint. Individual permission checkboxes are permanently enabled.
          </div>
        </div>
      )}

      {/* Granular Permission Matrix by Module */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {PERMISSION_GROUPS.map(group => {
          const groupKeys = group.permissions.map(p => p.key);
          const hasAll = isSuperAdmin || groupKeys.every(k => activeRole.permissions.includes(k));
          const hasSome = !hasAll && groupKeys.some(k => activeRole.permissions.includes(k));

          return (
            <div key={group.module} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)' }}>
                <span className="card-title" style={{ fontSize: 14 }}>{group.label}</span>
                {!isSuperAdmin && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleSelectModuleAll(group)}
                    style={{ fontSize: 11, padding: '2px 8px' }}
                  >
                    {hasAll ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              <div className="card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.permissions.map(perm => {
                  const isChecked = isSuperAdmin || activeRole.permissions.includes(perm.key);

                  return (
                    <label
                      key={perm.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: isChecked ? 'var(--bg-surface)' : 'transparent',
                        cursor: isSuperAdmin ? 'default' : 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isSuperAdmin}
                        onChange={() => handleTogglePermission(perm.key)}
                        style={{ marginTop: 2 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: 12, color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {perm.label}
                          </strong>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                            {perm.key}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddEditRoleModal
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
      />

      <ConfirmActionModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, role: null })}
        onConfirm={() => {
          if (confirmDelete.role) {
            deleteRole(confirmDelete.role.id);
            setSelectedRoleKey('doctor');
          }
        }}
        title="Delete Custom Role"
        message={`Are you sure you want to delete role "${confirmDelete.role?.name}"? Users assigned to this role will lose their custom permissions.`}
        confirmLabel="Delete Role"
        confirmVariant="danger"
      />
    </div>
  );
}
