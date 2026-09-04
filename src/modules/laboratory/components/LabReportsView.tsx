import React, { useState } from 'react';
import { FileText, Search, Filter, Printer, Download, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLab } from '../context/LabContext';
import PrintLabReportModal from './modals/PrintLabReportModal';
import type { ComprehensiveLabOrder } from '../../../types';

export default function LabReportsView() {
  const { labOrders } = useLab();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewOrder, setViewOrder] = useState<ComprehensiveLabOrder | null>(null);

  const verifiedOrders = labOrders.filter(o => o.status === 'verified');

  const filtered = verifiedOrders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.patientName.toLowerCase().includes(q) ||
      o.patientId.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.doctorName.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || o.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Verified Diagnostic Reports & Patient Electronic Release Archive</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consultant pathologist authorized laboratory reports available for immediate printing, EHR sharing, and PDF export
            </div>
          </div>
        </div>

        <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: 12 }}>
          {verifiedOrders.length} Released Report{verifiedOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Patient Name, UHID, Order #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="ALL">All Clinical Departments</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Critical Care & Cardiology">Critical Care & Cardiology</option>
            <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report # & Version</th>
                  <th>Patient Name & Demographics</th>
                  <th>Referring Doctor</th>
                  <th>Investigations Contained</th>
                  <th>Release Date</th>
                  <th>Pathologist Authorization</th>
                  <th>Report Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const hasCrit = order.items.some(i => i.results.some(r => r.isCritical));

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{order.orderNumber}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Version {order.version} {order.version > 1 && '(Amended)'}
                        </div>
                      </td>

                      <td>
                        <strong>{order.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {order.patientId} · {order.gender.toUpperCase()}, {order.age}y
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>Dr. {order.doctorName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.department}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>
                          {order.items.map(i => i.testName).join(', ')}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{order.items[0]?.verifiedAt || order.orderDate}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{order.items[0]?.verifiedBy || 'Consultant Pathologist'}</div>
                      </td>

                      <td>
                        <span className="badge badge-success">RELEASED</span>
                        {hasCrit && (
                          <div style={{ fontSize: 10, color: 'var(--color-danger)', fontWeight: 800, marginTop: 2 }}>
                            ⚠️ CRITICAL
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, height: 26 }}
                            onClick={() => setViewOrder(order)}
                          >
                            <Printer size={12} /> View / Print Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewOrder && <PrintLabReportModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}
