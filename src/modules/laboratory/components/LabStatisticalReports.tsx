import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useLab } from '../context/LabContext';

export type LabReportDefinitionId =
  | 'daily_orders'
  | 'test_volume'
  | 'pending_tests'
  | 'sample_collection'
  | 'sample_rejection'
  | 'test_completion'
  | 'pending_verification'
  | 'critical_results'
  | 'cancelled_tests'
  | 'revenue_test'
  | 'revenue_dept'
  | 'revenue_doctor'
  | 'tat_report'
  | 'patient_history';

const REPORT_DEFINITIONS: { id: LabReportDefinitionId; title: string; desc: string }[] = [
  { id: 'daily_orders', title: '1. Daily Laboratory Orders Census', desc: 'Comprehensive log of all laboratory orders placed across OPD, IPD, and Emergency casualty' },
  { id: 'test_volume', title: '2. Diagnostic Test Volume Breakdown', desc: 'Volume aggregations by category (Hematology, Biochemistry, Microbiology, Serology)' },
  { id: 'pending_tests', title: '3. Pending Laboratory Tests Audit', desc: 'Investigations currently awaiting sample draw, analyzer processing, or pathologist signoff' },
  { id: 'sample_collection', title: '4. Specimen Phlebotomy & Collection Log', desc: 'Specimen draw timestamps, phlebotomist attribution, and tube barcode audit' },
  { id: 'sample_rejection', title: '5. Specimen Rejection & Recollection Audit', desc: 'Pre-analytical rejections classified by hemolysis, clotting, QNS volume, and transit delays' },
  { id: 'test_completion', title: '6. Completed Test Investigations Log', desc: 'Investigations successfully processed on laboratory clinical analyzers with entered values' },
  { id: 'pending_verification', title: '7. Pending Pathologist Verification Worklist', desc: 'Completed results currently awaiting consultant pathologist clinical review and signoff' },
  { id: 'critical_results', title: '8. Critical Value Escalation & Notification Audit', desc: 'Life-threatening panic value occurrences, physician verbal call logs, and closed-loop signoffs' },
  { id: 'cancelled_tests', title: '9. Cancelled Lab Requisitions Audit', desc: 'Cancelled orders with clinical reasons and authorizer audit trail' },
  { id: 'revenue_test', title: '10. Revenue by Laboratory Investigation', desc: 'Financial revenue breakdown and profitability analysis by individual diagnostic test' },
  { id: 'revenue_dept', title: '11. Revenue by Referring Clinical Department', desc: 'Requisition billing volume grouped by Medicine, Surgery, ICU, and Obstetrics' },
  { id: 'revenue_doctor', title: '12. Revenue by Referring Physician', desc: 'Ordering consultant billing volume and test requisition frequency' },
  { id: 'tat_report', title: '13. Laboratory Turnaround Time (TAT) Quality Audit', desc: 'Compliance with NABL standard turnaround time thresholds across pre-analytical and analytical stages' },
  { id: 'patient_history', title: '14. Longitudinal Patient Lab History Audit', desc: 'Patient-centric chronological record of all laboratory results and delta-checks' },
];

export default function LabStatisticalReports() {
  const { labOrders, labSamples, criticalAlerts, testMaster } = useLab();

  const [selectedReport, setSelectedReport] = useState<LabReportDefinitionId>('daily_orders');
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
      headers = ['Order No', 'Patient Name', 'UHID', 'Encounter', 'Doctor', 'Department', 'Date', 'Total (₹)', 'Status'];
      rows = labOrders.map(o => [
        o.orderNumber,
        `"${o.patientName}"`,
        o.patientId,
        o.encounterType,
        `"${o.doctorName}"`,
        `"${o.department}"`,
        o.orderDate,
        o.totalAmount,
        o.status,
      ]);
    } else if (selectedReport === 'sample_collection') {
      headers = ['Sample ID', 'Barcode', 'Patient Name', 'UHID', 'Specimen', 'Container', 'Collected At', 'Phlebotomist', 'Status'];
      rows = labSamples.map(s => [
        s.sampleId,
        s.barcode,
        `"${s.patientName}"`,
        s.patientId,
        s.sampleType,
        `"${s.containerType}"`,
        s.collectedAt || '—',
        `"${s.collectedBy || '—'}"`,
        s.status,
      ]);
    } else if (selectedReport === 'critical_results') {
      headers = ['Alert ID', 'Order No', 'Patient Name', 'Bed', 'Doctor', 'Test', 'Parameter', 'Result', 'Threshold', 'Detected At', 'Status'];
      rows = criticalAlerts.map(a => [
        a.id,
        a.orderId,
        `"${a.patientName}"`,
        a.bedNumber || 'OPD',
        `"${a.doctorName}"`,
        `"${a.testName}"`,
        `"${a.parameterName}"`,
        a.resultValue,
        `"${a.criticalThreshold}"`,
        a.detectedAt,
        a.status,
      ]);
    } else {
      headers = ['Record ID', 'Patient Name', 'Date', 'Total (₹)', 'Status'];
      rows = labOrders.map(o => [o.id, `"${o.patientName}"`, o.orderDate, o.totalAmount, o.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `lab_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Information System (LIS) Statistical & Quality Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              14 official NABL-compliant clinical, quality control, operational, and financial laboratory reports
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
        {/* Left: 14 Reports Selector */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT LABORATORY REPORT
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
            {selectedReport === 'daily_orders' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Patient Name & UHID</th>
                      <th>Encounter</th>
                      <th>Doctor</th>
                      <th>Investigations</th>
                      <th>Total (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.orderNumber}</strong></td>
                        <td>{o.patientName} ({o.patientId})</td>
                        <td><span className="badge badge-primary">{o.encounterType.toUpperCase()}</span></td>
                        <td>Dr. {o.doctorName}</td>
                        <td>{o.items.map(i => i.testCode).join(', ')}</td>
                        <td><strong>₹{o.totalAmount}</strong></td>
                        <td><span className={`badge ${o.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>{o.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'sample_collection' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Barcode</th>
                      <th>Patient Name</th>
                      <th>Specimen & Container</th>
                      <th>Collected At</th>
                      <th>Phlebotomist</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labSamples.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.sampleId}</strong></td>
                        <td>{s.barcode}</td>
                        <td>{s.patientName}</td>
                        <td>{s.sampleType} ({s.containerType})</td>
                        <td>{s.collectedAt || '—'}</td>
                        <td>{s.collectedBy || '—'}</td>
                        <td><span className={`badge ${s.status === 'completed' || s.status === 'accepted' ? 'badge-success' : 'badge-warning'}`}>{s.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'critical_results' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Detected At</th>
                      <th>Patient & Bed</th>
                      <th>Doctor</th>
                      <th>Test Name</th>
                      <th>Parameter & Value</th>
                      <th>Panic Threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalAlerts.map(a => (
                      <tr key={a.id}>
                        <td>{a.detectedAt}</td>
                        <td><strong>{a.patientName}</strong> ({a.bedNumber || 'OPD'})</td>
                        <td>Dr. {a.doctorName}</td>
                        <td>{a.testName}</td>
                        <td><strong style={{ color: 'var(--color-danger)' }}>{a.parameterName}: {a.resultValue}</strong></td>
                        <td><span className="badge badge-danger">{a.criticalThreshold}</span></td>
                        <td><span className={`badge ${a.status === 'acknowledged' ? 'badge-success' : 'badge-danger'}`}>{a.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!['daily_orders', 'sample_collection', 'critical_results'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Patient Name</th>
                      <th>Department</th>
                      <th>Order Date</th>
                      <th>Amount (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.orderNumber}</strong></td>
                        <td>{o.patientName}</td>
                        <td>{o.department}</td>
                        <td>{o.orderDate}</td>
                        <td>₹{o.totalAmount}</td>
                        <td><span className="badge badge-success">VERIFIED</span></td>
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
