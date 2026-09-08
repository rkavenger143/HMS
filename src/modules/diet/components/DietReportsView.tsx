import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';

export type EssentialReportType =
  | 'patient_diet_chart'
  | 'daily_meal_report'
  | 'missed_meal_report'
  | 'special_diet_report'
  | 'diet_plan_report';

const ESSENTIAL_REPORTS: { id: EssentialReportType; title: string; desc: string; icon: string }[] = [
  {
    id: 'patient_diet_chart',
    title: '1. Patient Diet Chart Report',
    desc: 'Individual patient daily meal schedules, prescribed calories, and dietitian authorization.',
    icon: '📋',
  },
  {
    id: 'daily_meal_report',
    title: '2. Daily Meal Report',
    desc: 'Total hospital meal deliveries scheduled, prepared, dispatched, and served for today.',
    icon: '🍲',
  },
  {
    id: 'missed_meal_report',
    title: '3. Missed Meal & Variance Report',
    desc: 'Documented skipped meals, patient refusals, clinical nausea, and food intolerance reasons.',
    icon: '⚠️',
  },
  {
    id: 'special_diet_report',
    title: '4. Special Diet Report',
    desc: 'Distribution of therapeutic diets (Diabetic, Cardiac, Renal, High Protein, Low Salt).',
    icon: '🥗',
  },
  {
    id: 'diet_plan_report',
    title: '5. Diet Plan Master Report',
    desc: 'Summary of all active and modified inpatient diet plans, start dates, and review schedules.',
    icon: '📊',
  },
];

export default function DietReportsView() {
  const { admissions, dietCharts, mealDeliveries } = useDiet();

  const [selectedReport, setSelectedReport] = useState<EssentialReportType>('patient_diet_chart');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-07');
  const [patientFilter, setPatientFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentDef = ESSENTIAL_REPORTS.find(r => r.id === selectedReport) || ESSENTIAL_REPORTS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'patient_diet_chart' || selectedReport === 'diet_plan_report') {
      headers = ['Plan ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Diet Type', 'Calories (kcal)', 'Dietitian', 'Status'];
      rows = activeAdmissions.map(adm => {
        const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
        return [
          chart?.id || '—',
          adm.patientId,
          `"${adm.patientName}"`,
          `"${adm.ward}"`,
          adm.bedNumber,
          `"${adm.admittingDoctorName}"`,
          chart?.dietType || 'None',
          chart?.estimatedCalories || 0,
          `"${chart?.dietitianName || 'Unassigned'}"`,
          chart?.status || 'No Plan',
        ];
      });
    } else if (selectedReport === 'daily_meal_report') {
      headers = ['Meal ID', 'Patient Name', 'Ward', 'Bed', 'Meal Slot', 'Scheduled Time', 'Delivered Time', 'Status'];
      rows = mealDeliveries.map(m => [
        m.id,
        `"${m.patientName}"`,
        `"${m.ward}"`,
        m.bedNumber,
        m.mealType,
        m.scheduledTime,
        m.deliveredTime || '—',
        m.status,
      ]);
    } else if (selectedReport === 'missed_meal_report') {
      headers = ['Meal ID', 'Patient Name', 'Ward', 'Bed', 'Meal Slot', 'Date', 'Problem / Reason', 'Patient Feedback'];
      const missed = mealDeliveries.filter(m => m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused');
      rows = missed.map(m => [
        m.id,
        `"${m.patientName}"`,
        `"${m.ward}"`,
        m.bedNumber,
        m.mealType,
        m.date,
        `"${m.foodProblem || m.refusalReason || 'Missed'}"`,
        `"${m.patientFeedback || '—'}"`,
      ]);
    } else if (selectedReport === 'special_diet_report') {
      headers = ['UHID', 'Patient Name', 'Ward', 'Bed', 'Special Diet Category', 'Calories', 'Allergies', 'Dietitian'];
      const special = activeAdmissions.filter(adm => {
        const c = dietCharts.find(ch => ch.admissionId === adm.id && ch.status === 'active');
        return c && c.dietType !== 'regular';
      });
      rows = special.map(adm => {
        const c = dietCharts.find(ch => ch.admissionId === adm.id && ch.status === 'active');
        return [
          adm.patientId,
          `"${adm.patientName}"`,
          `"${adm.ward}"`,
          adm.bedNumber,
          c?.dietType || 'Special',
          c?.estimatedCalories || 0,
          `"${c?.allergies?.join('; ') || 'None'}"`,
          `"${c?.dietitianName || 'Unassigned'}"`,
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `diet_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Dietetics & Clinical Nutrition Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              5 essential hospital diet reports with Date, Patient, Department filters, Print and CSV Export
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Left: 5 Essential Reports Selector */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT ESSENTIAL REPORT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ESSENTIAL_REPORTS.map(r => {
              const isSelected = selectedReport === r.id;
              return (
                <button
                  key={r.id}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '10px 12px',
                    height: 'auto',
                  }}
                  onClick={() => setSelectedReport(r.id)}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Report Content & Filters */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-title" style={{ fontSize: 16 }}>{currentDef.title}</span>
              <div className="card-subtitle">{currentDef.desc}</div>
            </div>

            {/* Filter Controls: Date, Patient, Department */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="form-input"
                style={{ height: 32, fontSize: 11, width: 120 }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ height: 32, fontSize: 11, width: 120 }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />

              <select
                className="form-select"
                style={{ height: 32, fontSize: 11, width: 140 }}
                value={wardFilter}
                onChange={e => setWardFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="General Ward A">General Ward A</option>
                <option value="Medical ICU">Medical ICU</option>
                <option value="Private Ward">Private Ward</option>
              </select>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {/* Report 1: Patient Diet Chart Report / Report 5: Diet Plan Report */}
            {(selectedReport === 'patient_diet_chart' || selectedReport === 'diet_plan_report') && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name & UHID</th>
                      <th>Location</th>
                      <th>Attending Doctor</th>
                      <th>Prescribed Diet</th>
                      <th>Calories</th>
                      <th>Dietitian</th>
                      <th>Plan Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(adm => {
                      const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
                      return (
                        <tr key={adm.id}>
                          <td>
                            <strong>{adm.patientName}</strong>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adm.patientId}</div>
                          </td>
                          <td>
                            <span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}
                          </td>
                          <td>{adm.admittingDoctorName}</td>
                          <td>
                            <span className="badge badge-primary">
                              {chart?.dietType.toUpperCase().replace('_', ' ') || 'NO PLAN'}
                            </span>
                          </td>
                          <td>{chart?.estimatedCalories ? `${chart.estimatedCalories} kcal` : '—'}</td>
                          <td>{chart?.dietitianName || 'Unassigned'}</td>
                          <td>
                            <span className={`badge ${chart?.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                              {chart?.status ? chart.status.toUpperCase() : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Report 2: Daily Meal Report */}
            {selectedReport === 'daily_meal_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Meal ID</th>
                      <th>Patient Name</th>
                      <th>Location</th>
                      <th>Meal Slot</th>
                      <th>Scheduled Time</th>
                      <th>Delivered Time</th>
                      <th>Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealDeliveries.map(m => (
                      <tr key={m.id}>
                        <td><strong>#{m.id.toUpperCase()}</strong></td>
                        <td>{m.patientName}</td>
                        <td>{m.bedNumber} ({m.ward})</td>
                        <td><strong style={{ color: 'var(--color-primary)' }}>{m.mealType.toUpperCase().replace('_', ' ')}</strong></td>
                        <td>{m.scheduledTime}</td>
                        <td>{m.deliveredTime || '—'}</td>
                        <td>
                          <span className={`badge ${m.status === 'consumed' || m.status === 'served' ? 'badge-success' : m.status === 'delivered' ? 'badge-primary' : 'badge-warning'}`}>
                            {m.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Report 3: Missed Meal Report */}
            {selectedReport === 'missed_meal_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Location</th>
                      <th>Meal Slot</th>
                      <th>Scheduled Date</th>
                      <th>Clinical Problem / Variance Reason</th>
                      <th>Patient Feedback</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealDeliveries.filter(m => m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused').length > 0 ? (
                      mealDeliveries
                        .filter(m => m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused')
                        .map(m => (
                          <tr key={m.id}>
                            <td><strong>{m.patientName}</strong></td>
                            <td>{m.bedNumber} ({m.ward})</td>
                            <td><strong>{m.mealType.toUpperCase()}</strong></td>
                            <td>{m.date}</td>
                            <td>
                              <strong style={{ color: 'var(--color-danger)' }}>
                                {m.foodProblem || m.refusalReason || 'Patient Refused / Fasting'}
                              </strong>
                            </td>
                            <td>{m.patientFeedback || '—'}</td>
                            <td><span className="badge badge-danger">MISSED</span></td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--color-success)' }}>
                          No missed meals or refused trays recorded today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Report 4: Special Diet Report */}
            {selectedReport === 'special_diet_report' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Details</th>
                      <th>Ward & Bed</th>
                      <th>Special Diet Category</th>
                      <th>Target Calories</th>
                      <th>Macronutrient Split</th>
                      <th>Allergies / Restrictions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions
                      .filter(adm => {
                        const c = dietCharts.find(ch => ch.admissionId === adm.id && ch.status === 'active');
                        return c && c.dietType !== 'regular';
                      })
                      .map(adm => {
                        const c = dietCharts.find(ch => ch.admissionId === adm.id && ch.status === 'active');
                        return (
                          <tr key={adm.id}>
                            <td>
                              <strong>{adm.patientName}</strong>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UHID: {adm.patientId}</div>
                            </td>
                            <td><span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}</td>
                            <td><span className="badge badge-primary">{c?.dietType.toUpperCase().replace('_', ' ')}</span></td>
                            <td><strong>{c?.estimatedCalories} kcal</strong></td>
                            <td>P: {c?.proteinGrams}g · C: {c?.carbsGrams}g · F: {c?.fatGrams}g</td>
                            <td>
                              {c?.allergies && c.allergies.length > 0 ? (
                                <span className="badge badge-danger" style={{ fontSize: 10 }}>⚠️ {c.allergies.join(', ')}</span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
