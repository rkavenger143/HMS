import React, { useState } from 'react';
import {
  BarChart3, Activity, Server, Save, RotateCcw, CheckCircle2,
  ShieldCheck, Database, Clock, HardDrive, Cpu, Radio
} from 'lucide-react';
import { useSettings, ReportSettingsConfig, AuditSettingsConfig } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

export default function ReportAuditSystemSettingsTab() {
  const {
    reportSettings,
    updateReportSettings,
    auditSettings,
    updateAuditSettings,
    systemInfo,
    resetToDefaults,
  } = useSettings();

  const [activeSub, setActiveSub] = useState<'reports' | 'audit' | 'system'>('reports');
  const [repForm, setRepForm] = useState<ReportSettingsConfig>(reportSettings);
  const [audForm, setAudForm] = useState<AuditSettingsConfig>(auditSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSub === 'reports') updateReportSettings(repForm);
    else if (activeSub === 'audit') updateAuditSettings(audForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeSub === 'reports' ? <BarChart3 size={20} /> : activeSub === 'audit' ? <Activity size={20} /> : <Server size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {activeSub === 'reports' ? 'Report Analytics & PDF Export Settings' : activeSub === 'audit' ? 'Audit Trail Triggers & Retention Policies' : 'System Environment Telemetry & Server Diagnostics'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure report date ranges, export authorizations, HIPAA/NABH compliance logging, and inspect database cluster health
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${activeSub === 'reports' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('reports')}
            >
              Report Layouts
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('audit')}
            >
              Audit Trail
            </button>
            <button
              type="button"
              className={`btn ${activeSub === 'system' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveSub('system')}
            >
              System Info
            </button>
            {activeSub !== 'system' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsResetOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          Configuration rules for {activeSub.toUpperCase()} successfully saved!
        </div>
      )}

      {activeSub !== 'system' ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Reports */}
          {activeSub === 'reports' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Default Analytics Filters & Export Permissions</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Report Analytics Date Range</label>
                    <select
                      className="form-select"
                      value={repForm.defaultDateRange}
                      onChange={e => setRepForm({ ...repForm, defaultDateRange: e.target.value as any })}
                    >
                      <option value="today">Today</option>
                      <option value="this_week">Current Week</option>
                      <option value="this_month">Current Month (Default)</option>
                      <option value="this_quarter">Current Quarter</option>
                      <option value="this_year">Current Financial Year</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Page Size on Reports</label>
                    <input
                      type="number"
                      className="form-input"
                      value={repForm.defaultPageSize}
                      onChange={e => setRepForm({ ...repForm, defaultPageSize: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={repForm.includeAuditSummaryInReports}
                      onChange={e => setRepForm({ ...repForm, includeAuditSummaryInReports: e.target.checked })}
                    />
                    Include Executive Compliance Audit Summary on Official PDF Reports
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={repForm.allowCsvExportForNonAdmins}
                      onChange={e => setRepForm({ ...repForm, allowCsvExportForNonAdmins: e.target.checked })}
                    />
                    Allow Department Staff to Export Raw Data to CSV / Excel
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Audit */}
          {activeSub === 'audit' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Immutable Audit Trail Triggers & Retention Benchmarks</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Audit Log Retention Period (Days) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={audForm.auditRetentionDays}
                      onChange={e => setAudForm({ ...audForm, auditRetentionDays: Number(e.target.value) })}
                      required
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      NABH mandates minimum 365-day immutable retention.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.enableAuditLogging}
                      onChange={e => setAudForm({ ...audForm, enableAuditLogging: e.target.checked })}
                    />
                    Master Audit Trail System Active
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.logUserSignIns}
                      onChange={e => setAudForm({ ...audForm, logUserSignIns: e.target.checked })}
                    />
                    Log User Sign-In & Authentication Events
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.logFinancialTransactions}
                      onChange={e => setAudForm({ ...audForm, logFinancialTransactions: e.target.checked })}
                    />
                    Log Billing Invoices, Payments & Refunds
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.logClinicalPrescriptions}
                      onChange={e => setAudForm({ ...audForm, logClinicalPrescriptions: e.target.checked })}
                    />
                    Log Doctor Electronic Prescriptions & Clinical Notes
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.logSettingsChanges}
                      onChange={e => setAudForm({ ...audForm, logSettingsChanges: e.target.checked })}
                    />
                    Log All Administrative Settings Modifications
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={audForm.logPatientChartViews}
                      onChange={e => setAudForm({ ...audForm, logPatientChartViews: e.target.checked })}
                    />
                    Log Patient EMR Electronic Chart Access Traces
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={15} /> Save {activeSub === 'reports' ? 'Report Settings' : 'Audit Policies'}
            </button>
          </div>
        </form>
      ) : (
        /* System Info */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <span className="card-title">Hospital Application & Server Environment</span>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Radio size={12} className="spin" /> {systemInfo.apiStatus}
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Application Name</div>
                  <strong style={{ fontSize: 14 }}>{systemInfo.appName}</strong>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Software Release Version</div>
                  <strong style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--color-primary)' }}>{systemInfo.version}</strong>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Database Engine</div>
                  <strong style={{ fontSize: 14 }}>{systemInfo.databaseEngine}</strong>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Running Environment</div>
                  <strong style={{ fontSize: 14 }}>{systemInfo.environment}</strong>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>System Service Uptime</div>
                  <strong style={{ fontSize: 14, color: '#10b981' }}>{systemInfo.uptime}</strong>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Last Automated Backup</div>
                  <strong style={{ fontSize: 14 }}>{new Date(systemInfo.lastBackupDate).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults(activeSub as any);
          if (activeSub === 'reports') setRepForm(reportSettings);
          else if (activeSub === 'audit') setAudForm(auditSettings);
        }}
        categoryName={activeSub === 'reports' ? 'Report Analytics Settings' : 'Audit Trail Policies'}
      />
    </div>
  );
}
