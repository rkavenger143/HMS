import React, { useState } from 'react';
import {
  FlaskConical, Plus, Trash2, Printer, CheckCircle2, AlertCircle,
  Search, Clock, History, FileText, Activity
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import { DEMO_LAB_TESTS } from '../../../data/seedData';
import type { LabRequest, LabRequestItem } from '../../../types';
import PrintLabOrderModal from './modals/PrintLabOrderModal';

export default function LabOrdersManagement() {
  const {
    visits,
    patients,
    labRequests,
    selectedVisit,
    createLabOrder,
    setActiveTab,
  } = useOPD();

  const activeVisit = selectedVisit || visits.find(v => v.status === 'in_consultation') || visits[0];
  const activePatient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) : null;

  // Selected tests in order cart
  const [selectedTests, setSelectedTests] = useState<LabRequestItem[]>([
    {
      testId: 'lt-001',
      testName: 'Complete Blood Count (CBC)',
      sampleType: 'Blood (EDTA)',
      price: 350,
      status: 'ordered',
    },
    {
      testId: 'lt-005',
      testName: 'Lipid Profile',
      sampleType: 'Blood (Serum)',
      price: 750,
      status: 'ordered',
    }
  ]);

  const [testSearch, setTestSearch] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalNotes, setClinicalNotes] = useState('Correlate with acute outpatient clinical symptoms.');

  // Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<LabRequest | null>(null);

  // Search in Lab Catalog
  const matchingTests = DEMO_LAB_TESTS.filter(t => {
    if (!testSearch) return false;
    const q = testSearch.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const handleAddTest = (test: typeof DEMO_LAB_TESTS[0]) => {
    if (!selectedTests.some(t => t.testId === test.id)) {
      setSelectedTests(prev => [
        ...prev,
        {
          testId: test.id,
          testName: test.name,
          sampleType: test.sampleType,
          price: test.price,
          status: 'ordered',
        }
      ]);
    }
    setTestSearch('');
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTests(prev => prev.filter(t => t.testId !== testId));
  };

  const totalAmount = selectedTests.reduce((acc, t) => acc + t.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit || selectedTests.length === 0) return;

    const order = createLabOrder({
      patientId: activeVisit.patientId,
      patientName: activeVisit.patientName,
      doctorId: activeVisit.doctorId,
      doctorName: activeVisit.doctorName,
      priority,
      tests: selectedTests,
      totalAmount,
      aiInsight: clinicalNotes,
    });

    setSubmittedOrder(order);
    setShowPrintModal(true);
  };

  // Previous Lab Requests for this patient
  const patientPastLabOrders = labRequests.filter(lr => lr.patientId === activeVisit?.patientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-info-muted)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Investigation Requisition</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Ordering for: <strong>{activeVisit?.patientName}</strong> ({activeVisit?.patientId}) · Doctor: <strong>{activeVisit?.doctorName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintModal(true)} disabled={selectedTests.length === 0}>
            <Printer size={13} /> Print Requisition Slip
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={selectedTests.length === 0}>
            <CheckCircle2 size={13} /> Submit Lab Order
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Test Catalog Search & Active Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Test Search Card */}
          <div className="card">
            <div className="card-header">
              <Plus size={16} style={{ color: 'var(--color-info)' }} />
              <span className="card-title">Select Laboratory Investigation</span>
            </div>
            <div className="card-body">
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <label className="form-label">Search Pathology & Lab Tests</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search test name (e.g. CBC, Lipid Profile, LFT, KFT, HbA1c, Thyroid, Widal)..."
                  value={testSearch}
                  onChange={e => setTestSearch(e.target.value)}
                />

                {matchingTests.length > 0 && (
                  <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                    {matchingTests.map(t => (
                      <div
                        key={t.id}
                        className="search-result-item"
                        onClick={() => handleAddTest(t)}
                      >
                        <FlaskConical size={14} style={{ color: 'var(--color-info)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.category} · Sample: {t.sampleType} · TAT: {t.turnaroundHours}h</div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-success)' }}>₹{t.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Quick Add:</span>
                {DEMO_LAB_TESTS.slice(0, 6).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => handleAddTest(t)}
                  >
                    + {t.name.split('(')[0]} (₹{t.price})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Tests Table */}
          <div className="card">
            <div className="card-header">
              <FlaskConical size={16} style={{ color: 'var(--color-info)' }} />
              <div className="card-title" style={{ fontSize: 15 }}>
                Selected Tests for Order ({selectedTests.length} Items)
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--color-success)', fontSize: 14 }}>
                Total: ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Test Name</th>
                      <th>Sample Type</th>
                      <th style={{ textAlign: 'right' }}>Price (₹)</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTests.length > 0 ? (
                      selectedTests.map((test, idx) => (
                        <tr key={test.testId}>
                          <td style={{ color: 'var(--text-tertiary)', width: 30 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {test.testName}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{test.sampleType || 'Blood'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>₹{test.price}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              style={{ color: 'var(--color-danger)' }}
                              onClick={() => handleRemoveTest(test.testId)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <div className="empty-state-icon"><FlaskConical size={28} /></div>
                            <div className="empty-state-title">No Lab Tests Selected</div>
                            <div className="empty-state-desc">Search above or click quick preset buttons to add investigations.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Priority, Instructions & Past Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Details Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 14 }}>Order Requisition Details</span>
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Priority Level <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                  >
                    <option value="routine">Routine (Standard Turnaround)</option>
                    <option value="urgent">Urgent (Priority Reporting)</option>
                    <option value="stat">STAT (Immediate Emergency / 1 hr)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Indication & Phlebotomy Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Clinical reason, fast status, special collection instructions..."
                    value={clinicalNotes}
                    onChange={e => setClinicalNotes(e.target.value)}
                  />
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Estimated Charges:</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className={`badge ${priority === 'stat' ? 'badge-danger' : priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                    {priority.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 42 }}
                  onClick={handleSubmit}
                  disabled={selectedTests.length === 0}
                >
                  <CheckCircle2 size={15} /> Submit Order to Pathology
                </button>
              </div>
            </div>
          </div>

          {/* Past Lab History */}
          <div className="card">
            <div className="card-header">
              <History size={16} style={{ color: 'var(--color-info)' }} />
              <span className="card-title" style={{ fontSize: 14 }}>Previous Lab Requests ({patientPastLabOrders.length})</span>
            </div>
            <div className="card-body" style={{ padding: '12px 16px', maxHeight: 360, overflowY: 'auto' }}>
              {patientPastLabOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {patientPastLabOrders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{order.id}</span>
                        <span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{order.requestDate} · Dr. {order.doctorName}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {order.tests.map((t, idx) => (
                          <span key={idx} className="badge badge-neutral" style={{ fontSize: 10 }}>{t.testName}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
                  No previous laboratory requests for this patient.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Lab Modal */}
      {showPrintModal && (
        <PrintLabOrderModal
          labOrder={submittedOrder || {
            id: 'lr-temp',
            patientId: activeVisit?.patientId,
            patientName: activeVisit?.patientName,
            doctorId: activeVisit?.doctorId,
            doctorName: activeVisit?.doctorName,
            requestDate: '2026-08-31',
            priority,
            tests: selectedTests,
            totalAmount,
            aiInsight: clinicalNotes,
          }}
          patient={activePatient}
          visit={activeVisit}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
