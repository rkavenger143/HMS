import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';

export type DietReportType =
  | 'census'
  | 'patient_diet'
  | 'diet_type'
  | 'ward_diet'
  | 'meal_prep'
  | 'meal_delivery'
  | 'meal_refusal'
  | 'npo_report'
  | 'allergy_report'
  | 'special_diet'
  | 'diet_changes'
  | 'dietitian_workload'
  | 'assessments';

const REPORT_DEFINITIONS: { id: DietReportType; title: string; desc: string }[] = [
  { id: 'census', title: '1. Inpatient Daily Diet Census', desc: 'Ward-by-ward headcount of active inpatients and prescribed diet classifications' },
  { id: 'patient_diet', title: '2. Patient Detailed Diet Plan Report', desc: 'Comprehensive meal menus, caloric specs, and dietitian authorization' },
  { id: 'diet_type', title: '3. Diet Type & Classification Audit', desc: 'Breakdown across Regular, Diabetic, Renal, Cardiac, and Liquid diets' },
  { id: 'ward_diet', title: '4. Ward-Wise Diet Distribution', desc: 'Meal tray counts grouped by hospital clinical ward and bed allocations' },
  { id: 'meal_prep', title: '5. Kitchen Batch Preparation Report', desc: 'Daily culinary batch production requirements for kitchen staff' },
  { id: 'meal_delivery', title: '6. Meal Delivery & Tray Handover Report', desc: 'Dispatch times, delivered status, and staff fulfillment logs' },
  { id: 'meal_refusal', title: '7. Meal Refusal & Intake Variance Audit', desc: 'Documented skipped meals, clinical nausea/emesis reasons, and alerts' },
  { id: 'npo_report', title: '8. Nil Per Os (NPO) Fasting Safety Audit', desc: 'Patients with active fasting orders and surgery clearance status' },
  { id: 'allergy_report', title: '9. Food Allergies & Cross-Match Audit', desc: 'Registered food allergen warnings, anaphylaxis risk, and reaction logs' },
  { id: 'special_diet', title: '10. Therapeutic & Special Diets Report', desc: 'High-protein, salt-restricted, pureed, and renal patient diets' },
  { id: 'diet_changes', title: '11. Diet Modification & Revision Log', desc: 'Versioned chart modifications, doctor orders, and modification reasons' },
  { id: 'dietitian_workload', title: '12. Clinical Dietitian Workload Report', desc: 'Patient caseload, review timeliness, and pending chart approvals' },
  { id: 'assessments', title: '13. Nutrition Assessment & BMI Report', desc: 'Nutritional risk levels, BMI distribution, and dysphagia records' },
];

export default function DietReports() {
  const {
    admissions,
    dietCharts,
    mealDeliveries,
    npoPatients,
    assessments,
    doctorOrders,
  } = useDiet();

  const [selectedReport, setSelectedReport] = useState<DietReportType>('census');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-02');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'census') {
      headers = ['Adm ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Diet Type', 'Status'];
      rows = activeAdmissions.map(a => {
        const c = dietCharts.find(ch => ch.admissionId === a.id && (ch.status === 'active' || ch.status === 'approved'));
        return [a.id, a.patientId, `"${a.patientName}"`, `"${a.ward}"`, a.bedNumber, `"${a.admittingDoctorName}"`, c?.dietType || 'None', c?.status || 'Pending'];
      });
    } else if (selectedReport === 'meal_delivery') {
      headers = ['ID', 'Patient Name', 'Bed', 'Ward', 'Meal Slot', 'Scheduled Time', 'Delivered Time', 'Status', 'Delivery Staff'];
      rows = mealDeliveries.map(m => [m.id, `"${m.patientName}"`, m.bedNumber, `"${m.ward}"`, m.mealType, m.scheduledTime, m.deliveredTime || '—', m.status, `"${m.deliveryStaff || '—'}"`]);
    } else if (selectedReport === 'assessments') {
      headers = ['ID', 'Patient Name', 'Bed', 'Date', 'Height (cm)', 'Weight (kg)', 'BMI', 'Nutritional Risk', 'Dietitian'];
      rows = assessments.map(a => [a.id, `"${a.patientName}"`, a.bedNumber, a.date, a.heightCm, a.weightKg, a.bmi, a.nutritionalRisk, `"${a.dietitianName}"`]);
    } else {
      headers = ['ID', 'Patient Name', 'Date', 'Status'];
      rows = activeAdmissions.map(a => [a.id, `"${a.patientName}"`, a.admissionDate, a.status]);
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
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Hospital Dietetics & Nutrition Statistical Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              13 official clinical and administrative nutrition reports with date filtering, CSV export, and print formatting
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
        {/* Left: 13 Reports Selector */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT DIET & NUTRITION REPORT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {REPORT_DEFINITIONS.map(r => (
              <button
                key={r.id}
                className={`btn btn-sm ${selectedReport === r.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 12px', height: 'auto' }}
                onClick={() => setSelectedReport(r.id)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Report Content */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-title" style={{ fontSize: 16 }}>{currentDef.title}</span>
              <div className="card-subtitle">{currentDef.desc}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {/* Dynamic Tables based on selectedReport */}
            {selectedReport === 'census' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm ID</th>
                      <th>Patient Name & UHID</th>
                      <th>Ward & Bed</th>
                      <th>Doctor</th>
                      <th>Prescribed Diet</th>
                      <th>Diet Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(a => {
                      const c = dietCharts.find(ch => ch.admissionId === a.id && (ch.status === 'active' || ch.status === 'approved'));
                      return (
                        <tr key={a.id}>
                          <td><strong>{a.id}</strong></td>
                          <td>{a.patientName} ({a.patientId})</td>
                          <td><span className="badge badge-primary">{a.bedNumber}</span> {a.ward}</td>
                          <td>{a.admittingDoctorName}</td>
                          <td><span className="badge badge-primary">{c?.dietType.toUpperCase() || 'NO CHART'}</span></td>
                          <td><span className="badge badge-success">{c?.status.toUpperCase() || 'PENDING'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'meal_delivery' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Meal ID</th>
                      <th>Patient Name</th>
                      <th>Location</th>
                      <th>Meal Slot</th>
                      <th>Scheduled</th>
                      <th>Delivered</th>
                      <th>Status</th>
                      <th>Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealDeliveries.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.id}</strong></td>
                        <td>{m.patientName}</td>
                        <td>{m.bedNumber} ({m.ward})</td>
                        <td><strong>{m.mealType.toUpperCase()}</strong></td>
                        <td>{m.scheduledTime}</td>
                        <td>{m.deliveredTime || '—'}</td>
                        <td><span className={`badge ${m.status === 'served' ? 'badge-success' : 'badge-primary'}`}>{m.status.toUpperCase()}</span></td>
                        <td>{m.deliveryStaff || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'assessments' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient & Bed</th>
                      <th>Height / Weight</th>
                      <th>BMI</th>
                      <th>Appetite</th>
                      <th>Nutritional Risk</th>
                      <th>Dietitian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.date}</strong></td>
                        <td>{a.patientName} (Bed {a.bedNumber})</td>
                        <td>{a.heightCm}cm / {a.weightKg}kg</td>
                        <td><strong>{a.bmi}</strong></td>
                        <td>{a.appetite.toUpperCase()}</td>
                        <td><span className={`badge ${a.nutritionalRisk === 'high' ? 'badge-danger' : 'badge-success'}`}>{a.nutritionalRisk.toUpperCase()}</span></td>
                        <td>{a.dietitianName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!['census', 'meal_delivery', 'assessments'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Patient Name</th>
                      <th>Ward / Bed</th>
                      <th>Date</th>
                      <th>Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.id}</strong></td>
                        <td>{a.patientName}</td>
                        <td>{a.ward} ({a.bedNumber})</td>
                        <td>{a.admissionDate}</td>
                        <td><span className="badge badge-success">ACTIVE</span></td>
                      </tr>
                    ))}
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
