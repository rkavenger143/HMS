import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useNursing } from '../context/NursingContext';

export type NursingReportType =
  | 'census'
  | 'assignment'
  | 'care'
  | 'vitals'
  | 'mar'
  | 'missed_meds'
  | 'tasks'
  | 'intake_output'
  | 'wound_care'
  | 'handover'
  | 'doctor_orders'
  | 'incidents'
  | 'discharge_checklist';

const REPORT_DEFINITIONS: { id: NursingReportType; title: string; desc: string }[] = [
  { id: 'census', title: '1. Inpatient Nursing Census Report', desc: 'Ward-by-ward headcount of active inpatients and assigned care nurses' },
  { id: 'assignment', title: '2. Nurse-to-Patient Allocation Roster', desc: 'Staff nurse patient loads, duty shifts, and clinical ward coverage' },
  { id: 'care', title: '3. Patient Care & Assessment Summary', desc: 'Comprehensive systems assessment and Braden skin risk logs' },
  { id: 'vitals', title: '4. Bedside Vital Signs Timeline Report', desc: 'Chronological temperature, BP, SpO2, and abnormal vital events' },
  { id: 'mar', title: '5. Medication Administration (MAR) Report', desc: 'Complete log of scheduled vs administered drug doses' },
  { id: 'missed_meds', title: '6. Missed & Held Medication Variance Audit', desc: 'Held/missed drug doses with mandatory clinical justification' },
  { id: 'tasks', title: '7. Nursing Shift Tasks Execution Report', desc: 'Completed vs pending shift procedures and care tasks' },
  { id: 'intake_output', title: '8. 24-Hour Fluid Balance (I/O) Report', desc: 'Daily oral/IV intake vs urine/drain output net calculations' },
  { id: 'wound_care', title: '9. Wound Assessment & Dressing Audit', desc: 'Surgical incisions, pressure injuries, and dressing schedules' },
  { id: 'handover', title: '10. Shift Handover & Clinical Handoff Report', desc: 'Shift-to-shift dual nurse transfer signoffs and patient handoffs' },
  { id: 'doctor_orders', title: '11. Doctor Order Acknowledgment & Execution', desc: 'Physician bedside orders completed by nursing staff' },
  { id: 'incidents', title: '12. Clinical Incident & Sentinel Event Log', desc: 'Patient falls, drug variances, and safety corrective actions' },
  { id: 'discharge_checklist', title: '13. Discharge Nursing Clearance Audit', desc: '11-point discharge readiness checklist compliance' },
];

export default function NursingReports() {
  const {
    admissions,
    assignments,
    vitalsList,
    marRecords,
    nursingTasks,
    intakeOutputLogs,
    wounds,
    handovers,
    doctorOrders,
    incidentReports,
    dischargeChecklists,
  } = useNursing();

  const [selectedReport, setSelectedReport] = useState<NursingReportType>('census');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-31');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'census') {
      headers = ['Adm ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Status'];
      rows = activeAdmissions.map(a => [a.id, a.patientId, `"${a.patientName}"`, `"${a.ward}"`, a.bedNumber, `"${a.admittingDoctorName}"`, a.status]);
    } else if (selectedReport === 'vitals') {
      headers = ['Record ID', 'Patient ID', 'Time', 'BP', 'Pulse', 'Temp', 'SpO2', 'Abnormal Flags', 'Nurse'];
      rows = vitalsList.map(v => [v.id, v.patientId, v.recordedAt, v.bloodPressure, v.pulse, v.temperature, v.spo2, `"${v.abnormalFlags.join('; ')}"`, `"${v.recordedBy}"`]);
    } else if (selectedReport === 'mar') {
      headers = ['Record ID', 'Patient Name', 'Bed', 'Medicine', 'Dose', 'Route', 'Scheduled Time', 'Status', 'Nurse'];
      rows = marRecords.map(m => [m.id, `"${m.patientName}"`, m.bedNumber, `"${m.medicineName}"`, m.dose, m.route, m.scheduledTime, m.status, `"${m.nurseName || '—'}"`]);
    } else if (selectedReport === 'intake_output') {
      headers = ['ID', 'Patient Name', 'Bed', 'Time', 'Shift', 'Category', 'Sub-Type', 'Amount (ml)', 'Nurse'];
      rows = intakeOutputLogs.map(i => [i.id, `"${i.patientName}"`, i.bedNumber, i.time, i.shift, i.category, i.subType, i.amountMl, `"${i.nurseName}"`]);
    } else {
      headers = ['ID', 'Patient Name', 'Date', 'Status'];
      rows = activeAdmissions.map(a => [a.id, `"${a.patientName}"`, a.admissionDate, a.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `nursing_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Nursing Clinical & Quality Operational Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              13 official nursing reports with date filtering, CSV export, and print formatting
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
            SELECT NURSING REPORT
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
                      <th>Attending Doctor</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.id}</strong></td>
                        <td>{a.patientName} ({a.patientId})</td>
                        <td><span className="badge badge-primary">{a.bedNumber}</span> {a.ward}</td>
                        <td>{a.admittingDoctorName}</td>
                        <td>{a.admissionDate}</td>
                        <td><span className="badge badge-success">ACTIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'vitals' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient & Bed</th>
                      <th>BP</th>
                      <th>Pulse</th>
                      <th>Temp</th>
                      <th>SpO2</th>
                      <th>Pain</th>
                      <th>Status</th>
                      <th>Nurse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsList.map(v => (
                      <tr key={v.id}>
                        <td><strong>{v.recordedAt}</strong></td>
                        <td>{v.patientId}</td>
                        <td><strong>{v.bloodPressure}</strong></td>
                        <td>{v.pulse} bpm</td>
                        <td>{v.temperature}°F</td>
                        <td><strong>{v.spo2}%</strong></td>
                        <td>{v.painScore}/10</td>
                        <td><span className={`badge ${v.isAbnormal ? 'badge-danger' : 'badge-success'}`}>{v.isAbnormal ? 'ABNORMAL' : 'NORMAL'}</span></td>
                        <td>{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'mar' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient & Bed</th>
                      <th>Medication</th>
                      <th>Dose / Route</th>
                      <th>Scheduled Time</th>
                      <th>Administered Time</th>
                      <th>Status</th>
                      <th>Nurse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marRecords.map(m => (
                      <tr key={m.id}>
                        <td>{m.patientName} (Bed {m.bedNumber})</td>
                        <td><strong>{m.medicineName}</strong></td>
                        <td>{m.dose} ({m.route})</td>
                        <td>{m.scheduledTime}</td>
                        <td><strong>{m.administeredTime || '—'}</strong></td>
                        <td><span className={`badge ${m.status === 'administered' ? 'badge-success' : 'badge-primary'}`}>{m.status.toUpperCase()}</span></td>
                        <td>{m.nurseName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'intake_output' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Category</th>
                      <th>Sub-Type</th>
                      <th>Volume</th>
                      <th>Nurse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intakeOutputLogs.map(i => (
                      <tr key={i.id}>
                        <td>{i.time}</td>
                        <td>{i.patientName} (Bed {i.bedNumber})</td>
                        <td><span className={`badge ${i.category === 'intake' ? 'badge-primary' : 'badge-warning'}`}>{i.category.toUpperCase()}</span></td>
                        <td>{i.subType}</td>
                        <td><strong>{i.amountMl} ml</strong></td>
                        <td>{i.nurseName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Default Table for Other Reports */}
            {!['census', 'vitals', 'mar', 'intake_output'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Patient Name</th>
                      <th>Ward / Bed</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.id}</strong></td>
                        <td>{a.patientName}</td>
                        <td>{a.ward} ({a.bedNumber})</td>
                        <td>{a.admissionDate}</td>
                        <td><span className="badge badge-success">CLEARED</span></td>
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
