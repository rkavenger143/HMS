import React from 'react';
import {
  Calendar, Filter, Search, RotateCcw, Printer, Download,
  Building2, UserCheck, Stethoscope, FileSpreadsheet
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';

interface GlobalReportFilterBarProps {
  reportTitle?: string;
  onExportCSV?: () => void;
  showDoctorFilter?: boolean;
  showDepartmentFilter?: boolean;
  showPatientSearch?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: { label: string; value: string }[];
}

export default function GlobalReportFilterBar({
  reportTitle = 'Report',
  onExportCSV,
  showDoctorFilter = true,
  showDepartmentFilter = true,
  showPatientSearch = true,
  showStatusFilter = false,
  statusOptions = [],
}: GlobalReportFilterBarProps) {
  const { filters, updateFilter, resetFilters, printReport, doctors } = useReports();

  return (
    <div className="card no-print" style={{ padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Top Control Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Report Filters & Parameter Controls
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={resetFilters} title="Reset all filters to default">
              <RotateCcw size={13} /> Reset
            </button>

            {onExportCSV && (
              <button className="btn btn-secondary btn-sm" onClick={onExportCSV}>
                <FileSpreadsheet size={13} /> Export CSV
              </button>
            )}

            <button className="btn btn-primary btn-sm" onClick={() => printReport(reportTitle)}>
              <Printer size={13} /> Print Report
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          {/* Date Range Preset */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Date Range</label>
            <select
              className="form-select"
              value={filters.datePreset}
              onChange={e => updateFilter('datePreset', e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="previous_month">Previous Month</option>
              <option value="this_year">This Year (2026)</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Start Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={e => {
                updateFilter('datePreset', 'custom');
                updateFilter('startDate', e.target.value);
              }}
            />
          </div>

          {/* End Date */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>End Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={e => {
                updateFilter('datePreset', 'custom');
                updateFilter('endDate', e.target.value);
              }}
            />
          </div>

          {/* Department Filter */}
          {showDepartmentFilter && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Department</label>
              <select
                className="form-select"
                value={filters.department}
                onChange={e => updateFilter('department', e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="OPD">OPD (Outpatient)</option>
                <option value="IPD">IPD (Inpatient)</option>
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Blood Bank">Blood Bank</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          )}

          {/* Doctor Filter */}
          {showDoctorFilter && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Attending Doctor</label>
              <select
                className="form-select"
                value={filters.doctorId}
                onChange={e => updateFilter('doctorId', e.target.value)}
              >
                <option value="ALL">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Search */}
          {showPatientSearch && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Search Patient / ID</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Patient name or ID..."
                  style={{ paddingLeft: 28 }}
                  value={filters.patientSearch}
                  onChange={e => updateFilter('patientSearch', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          {showStatusFilter && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status Filter</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={e => updateFilter('status', e.target.value)}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
