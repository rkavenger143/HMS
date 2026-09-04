import React, { useState } from 'react';
import {
  FileText, Download, Printer, Filter, Search, Calendar,
  BedDouble, TrendingUp, Users, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';

export type IPDReportType =
  | 'census'
  | 'daily_admissions'
  | 'daily_discharges'
  | 'occupancy'
  | 'available_beds'
  | 'transfers'
  | 'los'
  | 'doctor_admissions'
  | 'dept_admissions'
  | 'mlc'
  | 'mortality'
  | 'medications'
  | 'diagnostics'
  | 'revenue';

const REPORT_DEFINITIONS: { id: IPDReportType; title: string; desc: string }[] = [
  { id: 'census', title: '1. Current Inpatient Census Report', desc: 'Live ward-by-ward headcount of all admitted patients' },
  { id: 'daily_admissions', title: "2. Today's Admissions Summary", desc: 'Patients admitted today with bed allocations and source' },
  { id: 'daily_discharges', title: "3. Today's Discharges Summary", desc: 'Discharged patients, discharge type, and length of stay' },
  { id: 'occupancy', title: '4. Bed Occupancy & Capacity Report', desc: 'Overall hospital bed occupancy rates and ward breakdown' },
  { id: 'available_beds', title: '5. Vacant & Available Beds Report', desc: 'Immediate available beds classified by ward and tariff' },
  { id: 'transfers', title: '6. Bed Transfers Audit Trail', desc: 'Chronological room/bed transfers, reasons, and approvals' },
  { id: 'los', title: '7. Average Length of Stay (ALOS)', desc: 'Patient stay durations by diagnosis and department' },
  { id: 'doctor_admissions', title: '8. Doctor-wise Inpatient Admissions', desc: 'Admissions and rounds conducted by attending doctors' },
  { id: 'dept_admissions', title: '9. Department-wise Inpatient Statistics', desc: 'Admission counts grouped by clinical specialty' },
  { id: 'mlc', title: '10. Medico-Legal Case (MLC) Registry', desc: 'Active and past MLC admissions under police jurisdiction' },
  { id: 'mortality', title: '11. Discharge Type & Mortality Audit', desc: 'Normal, DAMA, Transfer, and Mortality statistics' },
  { id: 'medications', title: '12. Inpatient MAR & Drug Dispensing', desc: 'Medication administration logs and scheduled drug charts' },
  { id: 'diagnostics', title: '13. IPD Diagnostic & Lab Utilization', desc: 'Lab investigations and radiology scans ordered for inpatients' },
  { id: 'revenue', title: '14. Inpatient Revenue & TPA Billing', desc: 'Daily bed tariffs, procedures, pharmacy revenue, and TPA claims' },
];

export default function IPDReports() {
  const {
    admissions,
    beds,
    wards,
    transfers,
    doctors,
    doctorRounds,
    ipdBills,
    dischargeRecords,
  } = useIPD();

  const [selectedReport, setSelectedReport] = useState<IPDReportType>('census');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-31');
  const [search, setSearch] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const currentReportDef = REPORT_DEFINITIONS.find(r => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'census' || selectedReport === 'daily_admissions') {
      headers = ['Admission ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Admission Date', 'Status'];
      rows = admissions.map(a => [a.id, a.patientId, `"${a.patientName}"`, `"${a.ward}"`, a.bedNumber, `"${a.admittingDoctorName}"`, a.admissionDate, a.status]);
    } else if (selectedReport === 'occupancy' || selectedReport === 'available_beds') {
      headers = ['Bed #', 'Ward', 'Floor', 'Type', 'Status', 'Daily Tariff (₹)', 'Occupant'];
      rows = beds.map(b => [b.bedNumber, `"${b.ward}"`, b.floor, b.type, b.status, b.dailyRate, `"${b.currentPatientName || '—'}"`]);
    } else if (selectedReport === 'transfers') {
      headers = ['Transfer ID', 'Patient Name', 'UHID', 'From Bed', 'To Bed', 'Reason', 'Requested By', 'Date'];
      rows = transfers.map(t => [t.id, `"${t.patientName}"`, t.patientId, t.fromBedNumber, t.toBedNumber, `"${t.reason}"`, `"${t.requestedBy}"`, t.transferDate]);
    } else if (selectedReport === 'revenue') {
      headers = ['Bill #', 'Patient Name', 'UHID', 'Ward', 'Bed', 'Total (₹)', 'Paid (₹)', 'Due (₹)', 'Status'];
      rows = ipdBills.map(b => [b.billNumber, `"${b.patientName}"`, b.uhid, `"${b.ward}"`, b.bedNumber, b.total, b.paidAmount, b.balanceDue, b.status]);
    } else {
      headers = ['ID', 'Patient Name', 'Admission Date', 'Doctor', 'Status'];
      rows = admissions.map(a => [a.id, `"${a.patientName}"`, a.admissionDate, `"${a.admittingDoctorName}"`, a.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ipd_report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient (IPD) Statistical & Administrative Reports</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              14 Official inpatient reports with filters, CSV export, and print formatting
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

      {/* 2-Column Layout: Report Selector (Left) & Report View (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Left: 14 Reports List */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 8px' }}>
            SELECT INPATIENT REPORT
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

        {/* Right: Selected Report Content & Table */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-title" style={{ fontSize: 16 }}>{currentReportDef.title}</span>
              <div className="card-subtitle">{currentReportDef.desc}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to</span>
              <input type="date" className="form-input" style={{ height: 32, fontSize: 11 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {/* Dynamic Report Content */}
            {selectedReport === 'census' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm ID</th>
                      <th>Patient Name & UHID</th>
                      <th>Ward & Bed</th>
                      <th>Attending Consultant</th>
                      <th>Admission Date</th>
                      <th>Days Stay</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmissions.map(a => {
                      const days = Math.floor((new Date().getTime() - new Date(a.admissionDate).getTime()) / 86400000) + 1;
                      return (
                        <tr key={a.id}>
                          <td><strong>{a.id}</strong></td>
                          <td>
                            <strong>{a.patientName}</strong>
                            <div className="patient-id" style={{ fontSize: 10 }}>{a.patientId}</div>
                          </td>
                          <td><span className="badge badge-primary">{a.bedNumber}</span> {a.ward}</td>
                          <td>{a.admittingDoctorName}</td>
                          <td>{a.admissionDate}</td>
                          <td><strong>Day {days}</strong></td>
                          <td><span className="badge badge-success">ACTIVE</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {(selectedReport === 'occupancy' || selectedReport === 'available_beds') && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bed #</th>
                      <th>Ward & Floor</th>
                      <th>Bed Category</th>
                      <th>Status</th>
                      <th>Daily Tariff (₹)</th>
                      <th>Occupant Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReport === 'available_beds' ? beds.filter(b => b.status === 'available') : beds).map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.bedNumber}</strong></td>
                        <td>{b.ward} (Floor {b.floor})</td>
                        <td><span className="badge badge-neutral">{b.type.toUpperCase()}</span></td>
                        <td>
                          <span className={`badge ${b.status === 'available' ? 'badge-success' : b.status === 'occupied' ? 'badge-danger' : 'badge-info'}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{b.dailyRate}/d</td>
                        <td>{b.currentPatientName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'transfers' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Transfer ID</th>
                      <th>Patient Name</th>
                      <th>From Bed</th>
                      <th>To Bed</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map(t => (
                      <tr key={t.id}>
                        <td><strong>{t.id}</strong></td>
                        <td>{t.patientName}</td>
                        <td style={{ color: 'var(--color-danger)' }}>{t.fromBedNumber} ({t.fromWard})</td>
                        <td style={{ color: 'var(--color-success)' }}>{t.toBedNumber} ({t.toWard})</td>
                        <td>{t.reason}</td>
                        <td>{t.transferDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'revenue' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Patient & UHID</th>
                      <th>Ward / Bed</th>
                      <th>Total Amount (₹)</th>
                      <th>Paid (₹)</th>
                      <th>Balance Due (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipdBills.length > 0 ? (
                      ipdBills.map(b => (
                        <tr key={b.id}>
                          <td><strong>{b.billNumber}</strong></td>
                          <td>{b.patientName}</td>
                          <td>{b.ward} ({b.bedNumber})</td>
                          <td style={{ fontWeight: 700 }}>₹{b.total}</td>
                          <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>₹{b.paidAmount}</td>
                          <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>₹{b.balanceDue}</td>
                          <td><span className={`badge ${b.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{b.status.toUpperCase()}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state" style={{ padding: 24 }}>No IPD Bills Generated Yet</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fallback table for other reports */}
            {!['census', 'occupancy', 'available_beds', 'transfers', 'revenue'].includes(selectedReport) && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Admission ID</th>
                      <th>Patient Name & UHID</th>
                      <th>Doctor</th>
                      <th>Ward & Bed</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.id}</strong></td>
                        <td>{a.patientName}</td>
                        <td>{a.admittingDoctorName}</td>
                        <td>{a.bedNumber} ({a.ward})</td>
                        <td>{a.admissionDate}</td>
                        <td><span className="badge badge-primary">{a.status}</span></td>
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
