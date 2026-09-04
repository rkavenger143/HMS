import React, { useState } from 'react';
import {
  Scan, AlertTriangle, Clock, CheckCircle2, Calendar, FileText,
  Plus, Eye, Printer, Filter, Search, Play, ShieldCheck, Camera,
  IndianRupee, ArrowRight
} from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';
import PrintRadiologyReportModal from './modals/PrintRadiologyReportModal';
import PACSViewerModal from './modals/PACSViewerModal';
import CreateRadiologyOrderModal from './modals/CreateRadiologyOrderModal';
import type { ComprehensiveRadiologyOrder } from '../../../types';

export default function RadiologyDashboard() {
  const {
    kpis,
    radiologyOrders,
    criticalAlerts,
    setActiveTab,
    setSelectedOrderId,
    startExamination,
  } = useRadiology();

  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [printOrder, setPrintOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [viewPACSOrder, setViewPACSOrder] = useState<ComprehensiveRadiologyOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredOrders = radiologyOrders.filter(ord => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ord.patientName.toLowerCase().includes(q) ||
      ord.patientId.toLowerCase().includes(q) ||
      ord.accessionNumber.toLowerCase().includes(q) ||
      ord.examName.toLowerCase().includes(q);

    const matchesMod = selectedModality === 'ALL' || ord.modalityType === selectedModality;
    const matchesStat = selectedStatus === 'ALL' || ord.status === selectedStatus;
    return matchesSearch && matchesMod && matchesStat;
  });

  const unackCritical = criticalAlerts.filter(a => a.status === 'new');
  const totalRevenue = radiologyOrders.reduce((sum, o) => sum + (o.price || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Critical Panic Findings Callout Banner */}
      {unackCritical.length > 0 && (
        <div
          style={{
            background: 'var(--color-danger-muted)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-danger)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-danger)' }}>
                {unackCritical.length} CRITICAL / PANIC RADIOLOGY FINDING(S)
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 2 }}>
                Latest: <strong>{unackCritical[0]?.findingDescription}</strong> for <strong>{unackCritical[0]?.patientName}</strong>
              </div>
            </div>
          </div>

          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('critical_findings')}>
            Critical Findings Desk →
          </button>
        </div>
      )}

      {/* 8 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* 1. Today's Studies */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Scan size={17} />
          </div>
          <div className="stat-value">{kpis.totalOrdersToday}</div>
          <div className="stat-label">Today's Studies</div>
        </div>

        {/* 2. Pending Orders */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.pendingOrders}</div>
          <div className="stat-label">Pending Orders</div>
        </div>

        {/* 3. Scheduled Studies */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('scheduling')}>
          <div className="stat-icon" style={{ background: 'var(--color-info-muted)', color: 'var(--color-info)' }}>
            <Calendar size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{kpis.scheduledExaminations}</div>
          <div className="stat-label">Scheduled Studies</div>
        </div>

        {/* 4. In Progress */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('worklist')}>
          <div className="stat-icon" style={{ background: 'rgba(10, 132, 255, 0.1)', color: 'var(--color-primary)' }}>
            <Play size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{kpis.examinationsInProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>

        {/* 5. Reports Pending */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reporting')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <FileText size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.reportsPending}</div>
          <div className="stat-label">Reports Pending</div>
        </div>

        {/* 6. Completed Reports */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reports_archive')}>
          <div className="stat-icon" style={{ background: 'rgba(50, 215, 75, 0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.completedExaminations}</div>
          <div className="stat-label">Completed Reports</div>
        </div>

        {/* 7. Critical Findings */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('critical_findings')}>
          <div className="stat-icon" style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.criticalReportsCount}</div>
          <div className="stat-label">Critical Findings</div>
        </div>

        {/* 8. Today's Revenue */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('billing')}>
          <div className="stat-icon" style={{ background: 'rgba(50, 215, 75, 0.1)', color: 'var(--color-success)' }}>
            <IndianRupee size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Today's Revenue</div>
        </div>
      </div>

      {/* Filter & Live Imaging Orders Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scan size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Live Radiology & Imaging Worklist</span>
              <div className="card-subtitle">Orders, DICOM PACS acquisition, radiologist reporting & verification</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={13} /> Order Study
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
              placeholder="Search patient, UHID, accession #, exam..."
              style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 130 }}
            value={selectedModality}
            onChange={e => setSelectedModality(e.target.value)}
          >
            <option value="ALL">All Modalities</option>
            <option value="X-Ray">X-Ray</option>
            <option value="CT">CT Scan</option>
            <option value="MRI">MRI</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="Mammography">Mammography</option>
          </select>

          <select
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 150 }}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="scheduled">Scheduled</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession # & Date</th>
                  <th>Patient Name & UHID</th>
                  <th>Modality & Study</th>
                  <th>Referring Doctor</th>
                  <th>Priority</th>
                  <th>Imaging Status</th>
                  <th>Report Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{ord.accessionNumber}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ord.orderDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{ord.patientName}</div>
                      <div className="patient-id" style={{ fontSize: 10 }}>{ord.patientId} · {ord.encounterType.toUpperCase()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>
                        <span className="badge badge-primary">{ord.modalityType}</span> {ord.examName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>Dr. {ord.referringDoctorName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ord.department}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${ord.priority === 'stat' ? 'danger' : ord.priority === 'urgent' ? 'warning' : 'neutral'}`}>
                        {ord.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ord.status === 'completed' || ord.status === 'released' ? 'badge-success' : 'badge-warning'}`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ord.reportStatus === 'verified' ? 'badge-success' : 'badge-neutral'}`}>
                        {ord.reportStatus ? ord.reportStatus.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {ord.status === 'scheduled' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => startExamination(ord.id, 'Rad Tech')}
                          >
                            <Play size={11} /> Start Study
                          </button>
                        )}
                        {ord.reportStatus === 'verified' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setPrintOrder(ord)}
                          >
                            <Printer size={11} /> Print Report
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
        <CreateRadiologyOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {printOrder && (
        <PrintRadiologyReportModal
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}

      {viewPACSOrder && (
        <PACSViewerModal
          order={viewPACSOrder}
          onClose={() => setViewPACSOrder(null)}
        />
      )}
    </div>
  );
}
