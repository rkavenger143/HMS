import React, { useState } from 'react';
import {
  FlaskConical, Plus, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, ShieldAlert, FileText, Download, Printer, Eye, Truck, Barcode,
  IndianRupee, ArrowRight
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import CreateLabOrderModal from './modals/CreateLabOrderModal';
import PrintLabReportModal from './modals/PrintLabReportModal';
import PrintSampleBarcodeModal from './modals/PrintSampleBarcodeModal';
import type { ComprehensiveLabOrder, LabSampleRecord } from '../../../types';

export default function LabDashboard() {
  const {
    kpis,
    labOrders,
    labSamples,
    criticalAlerts,
    setActiveTab,
    setSelectedOrderId,
  } = useLab();

  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewReportOrder, setViewReportOrder] = useState<ComprehensiveLabOrder | null>(null);
  const [printBarcodeSample, setPrintBarcodeSample] = useState<LabSampleRecord | null>(null);

  const activeCritical = criticalAlerts.filter(a => a.status === 'new');
  const totalRevenue = labOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filteredOrders = labOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.doctorName.toLowerCase().includes(q);

    const matchesPriority = selectedPriority === 'ALL' || ord.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || ord.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenReport = (order: ComprehensiveLabOrder) => {
    setViewReportOrder(order);
  };

  const handleOpenOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Critical Results Urgent Notification Callout Banner */}
      {activeCritical.length > 0 && (
        <div
          style={{
            background: 'var(--color-danger-muted)',
            border: '2px solid var(--color-danger)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldAlert size={22} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-danger)' }}>
                {activeCritical.length} CRITICAL LABORATORY VALUE{activeCritical.length > 1 ? 'S' : ''} DETECTED
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 2 }}>
                Life-threatening laboratory thresholds exceeded for{' '}
                <strong>{activeCritical.map(c => `${c.patientName} (${c.parameterName}: ${c.resultValue})`).join(', ')}</strong>. Mandatory clinical escalation required.
              </div>
            </div>
          </div>

          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('critical_results')}>
            Review Critical Results →
          </button>
        </div>
      )}

      {/* 8 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* 1. Today's Orders */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <FlaskConical size={17} />
          </div>
          <div className="stat-value">{kpis.totalOrdersToday}</div>
          <div className="stat-label">Today's Orders</div>
        </div>

        {/* 2. Pending Samples */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('sample_collection')}>
          <div className="stat-icon" style={{ background: 'rgba(255, 159, 10, 0.12)', color: 'var(--color-warning)' }}>
            <Barcode size={17} />
          </div>
          <div className="stat-value">{kpis.sampleCollectionPending}</div>
          <div className="stat-label">Pending Samples</div>
        </div>

        {/* 3. Samples Collected */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('sample_receiving')}>
          <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}>
            <Truck size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.samplesCollected}</div>
          <div className="stat-label">Samples Collected</div>
        </div>

        {/* 4. Tests In Progress */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('test_processing')}>
          <div className="stat-icon" style={{ background: 'rgba(10, 132, 255, 0.12)', color: 'var(--color-primary)' }}>
            <FlaskConical size={17} />
          </div>
          <div className="stat-value">{kpis.samplesInProcessing}</div>
          <div className="stat-label">Tests In Progress</div>
        </div>

        {/* 5. Pending Results / Verification */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('result_verification')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.reportsPendingVerification}</div>
          <div className="stat-label">Pending Results</div>
        </div>

        {/* 6. Completed Tests */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>
          <div className="stat-icon" style={{ background: 'rgba(50, 215, 75, 0.12)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.testsCompleted}</div>
          <div className="stat-label">Completed Tests</div>
        </div>

        {/* 7. Critical Results */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('critical_results')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalResultsCount}</div>
          <div className="stat-label">Critical Results</div>
        </div>

        {/* 8. Today's Lab Revenue */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing')}>
          <div className="stat-icon" style={{ background: 'rgba(50, 215, 75, 0.12)', color: 'var(--color-success)' }}>
            <IndianRupee size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Today's Lab Revenue</div>
        </div>
      </div>

      {/* Filter & Live Orders Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Live Laboratory Diagnostic Worklist</span>
              <div className="card-subtitle">Orders, phlebotomy, analyzer runs, pathologist signoff & reports</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={13} /> Order Lab Tests
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '12px 18px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search patient, UHID, order #, doctor..."
              style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 140 }}
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT Panic</option>
          </select>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 160 }}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing">In Processing</option>
            <option value="completed">Verified / Completed</option>
          </select>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Referring Doctor</th>
                  <th>Tests Ordered</th>
                  <th>Priority</th>
                  <th>Sample Status</th>
                  <th>Result Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{ord.orderNumber}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ord.orderDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{ord.patientName}</div>
                      <div className="patient-id" style={{ fontSize: 10 }}>{ord.patientId} · {ord.encounterType.toUpperCase()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>Dr. {ord.doctorName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ord.department}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>
                        {ord.items.map(t => t.testName).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${ord.priority === 'stat' ? 'danger' : ord.priority === 'urgent' ? 'warning' : 'neutral'}`}>
                        {ord.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ord.status === 'ordered' ? 'badge-warning' : 'badge-success'}`}>
                        {ord.status === 'ordered' ? 'Pending Coll.' : 'Collected'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ord.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>
                        {ord.status === 'completed' ? 'VERIFIED' : ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => handleOpenOrder(ord.id)}
                        >
                          Process
                        </button>
                        {ord.status === 'completed' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenReport(ord)}
                          >
                            <FileText size={11} /> Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateLabOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {viewReportOrder && (
        <PrintLabReportModal
          order={viewReportOrder}
          onClose={() => setViewReportOrder(null)}
        />
      )}
    </div>
  );
}
