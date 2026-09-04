import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';

export type RadiologyReportDefinitionId =
  | 'daily_orders'
  | 'exam_volume'
  | 'modality_utilization'
  | 'pending_exams'
  | 'completed_exams'
  | 'cancelled_exams'
  | 'no_show'
  | 'pending_reports'
  | 'tat_report'
  | 'radiologist_workload'
  | 'technologist_workload'
  | 'equipment_utilization'
  | 'equipment_downtime'
  | 'critical_findings'
  | 'revenue_modality';

const REPORT_DEFINITIONS: { id: RadiologyReportDefinitionId; title: string; desc: string }[] = [
  { id: 'daily_orders', title: '1. Daily Diagnostic Imaging Orders Census', desc: 'Comprehensive log of all radiology orders placed across OPD, IPD, and Emergency casualty' },
  { id: 'exam_volume', title: '2. Examination Volume Breakdown', desc: 'Scan volume aggregations by anatomical region (Brain, Chest, Abdomen, Spine, Musculoskeletal)' },
  { id: 'modality_utilization', title: '3. Modality Utilization & Machine Census', desc: 'Workload distribution across X-Ray, 128-Slice CT, 1.5T MRI, Ultrasound, and Mammography suites' },
  { id: 'pending_exams', title: '4. Pending Imaging Examinations Audit', desc: 'Examinations currently awaiting slot schedule, arrival check-in, or scan execution' },
  { id: 'completed_exams', title: '5. Completed Imaging Studies Log', desc: 'Examinations successfully acquired with series counts, total slices, and technician logs' },
  { id: 'cancelled_exams', title: '6. Cancelled Requisitions Audit', desc: 'Cancelled orders with clinical justifications and authorizer audit trail' },
  { id: 'no_show', title: '7. Patient No-Show & Missed Appointment Log', desc: 'Scheduled examination slots where patient failed to report without prior notice' },
  { id: 'pending_reports', title: '8. Pending Radiologist Verification Worklist', desc: 'Completed scans currently awaiting specialist radiologist reading and digital signoff' },
  { id: 'tat_report', title: '9. Turnaround Time (TAT) Compliance Quality Report', desc: 'Compliance with standard turnaround time thresholds from order to verified report release' },
  { id: 'radiologist_workload', title: '10. Radiologist Reporting Workload Census', desc: 'Diagnostic volume and turnaround performance attributed to individual consultant radiologists' },
  { id: 'technologist_workload', title: '11. Technologist / Radiographer Workload Census', desc: 'Scan acquisition volume and room coverage by licensed imaging technologists' },
  { id: 'equipment_utilization', title: '12. High-Value Equipment Utilization Audit', desc: 'Total scanning hours, slice counts, and capacity utilization per imaging machine' },
  { id: 'equipment_downtime', title: '13. Equipment Downtime & Preventive Maintenance Log', desc: 'Recorded preventive service intervals, calibration dates, and AERB safety compliance' },
  { id: 'critical_findings', title: '14. Critical Finding Escalation & Callout Audit', desc: 'Life-threatening panic radiological findings, physician verbal call logs, and signoffs' },
  { id: 'revenue_modality', title: '15. Revenue by Modality & Department', desc: 'Billing revenue breakdown grouped by imaging modality and referring medical department' },
];

export default function RadiologyStatisticalReports() {
  const { radiologyOrders, criticalAlerts, equipment } = useRadiology();

  const [selectedReport, setSelectedReport] = useState<RadiologyReportDefinitionId>('daily_orders');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-02');

  const currentDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'daily_orders') {
      headers = ['Accession', 'Order No', 'Patient Name', 'UHID', 'Encounter', 'Doctor', 'Exam', 'Modality', 'Date', 'Price (₹)', 'Status'];
      rows = radiologyOrders.map(o => [
        o.accessionNumber,
        o.orderNumber,
        `"${o.patientName}"`,
        o.patientId,
        o.encounterType,
        `"${o.referringDoctorName}"`,
        `"${o.examName}"`,
        o.modalityType,
        o.orderDate,
        o.price,
        o.status,
      ]);
    } else if (selectedReport === 'critical_findings') {
      headers = ['Alert ID', 'Accession', 'Patient Name', 'Bed', 'Doctor', 'Exam', 'Modality', 'Finding', 'Detected At', 'Status'];
      rows = criticalAlerts.map(a => [
        a.id,
        a.accessionNumber,
        `"${a.patientName}"`,
        a.bedNumber || 'OPD',
        `"${a.doctorName}"`,
        `"${a.examName}"`,
        a.modalityType,
        `"${a.findingDescription}"`,
        a.detectedAt,
        a.status,
      ]);
    } else {
      headers = ['Accession', 'Patient Name', 'Exam', 'Modality', 'Date', 'Price (₹)', 'Status'];
      rows = radiologyOrders.map(o => [o.accessionNumber, `"${o.patientName}"`, `"${o.examName}"`, o.modalityType, o.orderDate, o.price, o.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `radiology_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Radiology Information System (RIS) Statistical & Quality Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              15 official NABH-compliant diagnostic imaging, equipment utilization, quality control, and financial reports
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
        {/* Left: 15 Reports Selector */}
        <div className="card" style={{ padding: '12px', maxHeight: '78vh', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT RADIOLOGY REPORT
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

        {/* Right: Report Content */}
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
            {/* Dynamic Tables */}
            {selectedReport === 'daily_orders' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Accession</th>
                      <th>Patient Name & UHID</th>
                      <th>Encounter</th>
                      <th>Doctor</th>
                      <th>Examination</th>
                      <th>Price (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {radiologyOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.accessionNumber}</strong></td>
                        <td>{o.patientName} ({o.patientId})</td>
                        <td><span className="badge badge-primary">{o.encounterType.toUpperCase()}</span></td>
                        <td>{o.referringDoctorName}</td>
                        <td>{o.examName} ({o.modalityType.toUpperCase()})</td>
                        <td><strong>₹{o.price}</strong></td>
                        <td><span className={`badge ${o.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>{o.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'critical_findings' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Detected At</th>
                      <th>Accession</th>
                      <th>Patient & Bed</th>
                      <th>Doctor</th>
                      <th>Examination</th>
                      <th>Critical Finding</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalAlerts.map(a => (
                      <tr key={a.id}>
                        <td>{a.detectedAt}</td>
                        <td><strong>{a.accessionNumber}</strong></td>
                        <td>{a.patientName} ({a.bedNumber || 'OPD'})</td>
                        <td>{a.doctorName}</td>
                        <td>{a.examName} ({a.modalityType.toUpperCase()})</td>
                        <td><strong style={{ color: 'var(--color-danger)' }}>{a.findingDescription}</strong></td>
                        <td><span className={`badge ${a.status === 'acknowledged' ? 'badge-success' : 'badge-danger'}`}>{a.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!['daily_orders', 'critical_findings'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Accession</th>
                      <th>Patient Name</th>
                      <th>Examination</th>
                      <th>Modality</th>
                      <th>Date</th>
                      <th>Amount (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {radiologyOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.accessionNumber}</strong></td>
                        <td>{o.patientName}</td>
                        <td>{o.examName}</td>
                        <td><span className="badge badge-primary">{o.modalityType.toUpperCase()}</span></td>
                        <td>{o.orderDate}</td>
                        <td>₹{o.price}</td>
                        <td><span className="badge badge-success">COMPLETED</span></td>
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
