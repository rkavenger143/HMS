import React, { useState } from 'react';
import { FlaskConical, Search, Filter, Play, CheckCircle2, AlertTriangle, Clock, User } from 'lucide-react';
import { useLab } from '../context/LabContext';
import ResultEntryModal from './modals/ResultEntryModal';
import type { ComprehensiveLabOrder, LabOrderItem } from '../../../types';

export default function TestProcessingQueue() {
  const { labOrders, startTestProcessing } = useLab();

  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [technicianName, setTechnicianName] = useState('Aarti Kulkarni, MLT');
  const [activeEntry, setActiveEntry] = useState<{ order: ComprehensiveLabOrder; item: LabOrderItem } | null>(null);

  // Flatten order items for technician worklist
  const worklistItems: { order: ComprehensiveLabOrder; item: LabOrderItem }[] = [];
  labOrders.forEach(order => {
    order.items.forEach(item => {
      worklistItems.push({ order, item });
    });
  });

  const filteredWorklist = worklistItems.filter(({ order, item }) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      order.patientName.toLowerCase().includes(q) ||
      order.orderNumber.toLowerCase().includes(q) ||
      item.testName.toLowerCase().includes(q) ||
      item.testCode.toLowerCase().includes(q);

    const matchesDept = selectedDepartment === 'ALL' || order.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Analytical Worklist & Processing Queue</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bench technician worklists, instrument analyzer status, result entry triggers, and processing timers
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Technologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 200, height: 32, fontSize: 12 }}
            value={technicianName}
            onChange={e => setTechnicianName(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Test Name, Code, Patient..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
            <option value="ALL">All Clinical Departments</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Critical Care & Cardiology">Critical Care & Cardiology</option>
            <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
          </select>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Code & Name</th>
                  <th>Patient Name & Location</th>
                  <th>Specimen & Container</th>
                  <th>Priority</th>
                  <th>Processing Status</th>
                  <th>Assigned MLT</th>
                  <th>Timestamps</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorklist.map(({ order, item }) => {
                  const isOrdered = item.status === 'ordered' || item.status === 'sample_collected';
                  const isProcessing = item.status === 'processing';
                  const isCompleted = item.status === 'completed';
                  const isVerified = item.status === 'verified';

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{item.testName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.testCode} · Order #{order.orderNumber}</div>
                      </td>

                      <td>
                        <strong>{order.patientName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {order.patientId} {order.bedNumber ? `· Bed ${order.bedNumber}` : '· OPD'}
                        </div>
                      </td>

                      <td>
                        <div>{item.sampleType}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{item.containerType}</div>
                      </td>

                      <td>
                        <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : order.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${isVerified ? 'badge-success' : isCompleted ? 'badge-info' : isProcessing ? 'badge-warning' : 'badge-neutral'}`}>
                          {item.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{item.technicianName || '—'}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Ordered: {order.orderDate}
                        </div>
                        {item.technicianAt && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Run: {item.technicianAt}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {isOrdered && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => startTestProcessing(order.id, item.testId, technicianName)}
                            >
                              <Play size={11} /> Start Run
                            </button>
                          )}

                          {!isVerified && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                              onClick={() => setActiveEntry({ order, item })}
                            >
                              {item.results.length > 0 ? 'Edit Result' : 'Enter Result'}
                            </button>
                          )}

                          {isVerified && (
                            <span className="badge badge-success">✓ VERIFIED</span>
                          )}
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

      {/* Result Entry Modal */}
      {activeEntry && (
        <ResultEntryModal
          order={activeEntry.order}
          item={activeEntry.item}
          onClose={() => setActiveEntry(null)}
        />
      )}
    </div>
  );
}
