import React, { useMemo } from 'react';
import {
  FlaskConical, CheckCircle2, Clock, DollarSign, Download,
  Printer, BarChart2, FileSpreadsheet, AlertTriangle, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useReports } from '../context/ReportsContext';
import GlobalReportFilterBar from './GlobalReportFilterBar';

export default function LaboratoryReports() {
  const { labRequests, filters, exportCSV } = useReports();

  const filtered = useMemo(() => {
    return labRequests.filter(l => {
      const q = (filters.patientSearch || '').toLowerCase();
      const testNames = l.tests?.map(t => t.testName).join(' ') || '';
      const ms = !q || l.patientName?.toLowerCase().includes(q) || l.patientId.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || testNames.toLowerCase().includes(q);
      const mdoc = filters.doctorId === 'ALL' || l.doctorId === filters.doctorId || l.doctorName === filters.doctorId;
      const md = filters.department === 'ALL' || (l.tests && l.tests.some(t => t.sampleType?.toLowerCase().includes(filters.department.toLowerCase())));
      return ms && mdoc && md;
    });
  }, [labRequests, filters]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: { [key: string]: { count: number; revenue: number } } = {};
    filtered.forEach(l => {
      const sample = l.tests?.[0]?.sampleType || 'Biochemistry';
      if (!map[sample]) map[sample] = { count: 0, revenue: 0 };
      map[sample].count += l.tests?.length || 1;
      map[sample].revenue += l.totalAmount || 500;
    });
    return Object.keys(map).map(c => ({
      category: c,
      count: map[c].count,
      revenue: map[c].revenue,
    }));
  }, [filtered]);

  const totalRevenue = filtered.reduce((acc, l) => acc + (l.totalAmount || 500), 0);
  const completedCount = filtered.filter(l => l.status === 'completed').length;
  const pendingCount = filtered.filter(l => l.status !== 'completed').length;

  const handleExportCSV = () => {
    const rows = filtered.map(l => [
      l.id,
      l.patientName || l.patientId,
      l.tests?.map(t => t.testName).join('; ') || 'Lab Investigation',
      l.tests?.[0]?.sampleType || 'Biochemistry',
      l.doctorName || l.doctorId || 'Hospital Staff',
      l.requestDate || '2026-09-02',
      `₹${l.totalAmount || 500}`,
      l.status.toUpperCase(),
    ]);

    exportCSV(
      'Laboratory_Diagnostic_Investigations_Report',
      ['Order ID', 'Patient Name', 'Test Names', 'Sample Type', 'Ordering Doctor', 'Date', 'Price (INR)', 'Status'],
      rows
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Global Filter Bar */}
      <GlobalReportFilterBar
        reportTitle="Laboratory Diagnostic Investigations & Revenue Report"
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{filtered.length}</div>
          <div className="stat-label">Total Lab Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{completedCount}</div>
          <div className="stat-label">Completed & Verified Results</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingCount}</div>
          <div className="stat-label">Pending / Processing Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0284c7' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Diagnostic Revenue</div>
        </div>
      </div>

      {/* Category Chart */}
      <div className="card">
        <div className="card-header">
          <FlaskConical size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="card-title">Laboratory Investigation Volume by Specimen / Category</span>
        </div>
        <div className="card-body" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Test Orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Lab Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Laboratory Diagnostic Orders Master Ledger</span>
          <span className="badge badge-primary">{filtered.length} Orders</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient Name & ID</th>
                  <th>Investigation Tests</th>
                  <th>Sample / Specimen</th>
                  <th>Ordering Physician</th>
                  <th>Price (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{l.id}</strong>
                    </td>
                    <td>
                      <strong>{l.patientName || l.patientId}</strong>
                    </td>
                    <td>
                      <strong>{l.tests?.map(t => t.testName).join(', ') || 'Complete Blood Count'}</strong>
                    </td>
                    <td>{l.tests?.[0]?.sampleType || 'Whole Blood'}</td>
                    <td>{l.doctorName || l.doctorId}</td>
                    <td><strong>₹{l.totalAmount || 500}</strong></td>
                    <td>
                      <span className={`badge ${l.status === 'completed' ? 'badge-success' : l.status === 'sample_collected' ? 'badge-primary' : 'badge-warning'}`}>
                        {l.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No laboratory test orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
