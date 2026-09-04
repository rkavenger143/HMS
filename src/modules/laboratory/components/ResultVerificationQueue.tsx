import React, { useState } from 'react';
import {
  ShieldCheck, Search, Filter, Eye, CheckCircle2, AlertTriangle,
  FileEdit, Printer, UserCheck, Clock
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import PrintLabReportModal from './modals/PrintLabReportModal';
import ReportAmendmentModal from './modals/ReportAmendmentModal';
import type { ComprehensiveLabOrder, LabOrderItem } from '../../../types';

export default function ResultVerificationQueue() {
  const { labOrders, verifyTestResults } = useLab();

  const [search, setSearch] = useState('');
  const [pathologistName, setPathologistName] = useState('Dr. Sunita Rao, MD (Pathology)');
  const [viewReportOrder, setViewReportOrder] = useState<ComprehensiveLabOrder | null>(null);
  const [amendTarget, setAmendTarget] = useState<{ order: ComprehensiveLabOrder; item: LabOrderItem } | null>(null);

  // Filter orders that are completed (awaiting verification) or verified
  const verificationQueue: { order: ComprehensiveLabOrder; item: LabOrderItem }[] = [];
  labOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.results.length > 0) {
        verificationQueue.push({ order, item });
      }
    });
  });

  const filtered = verificationQueue.filter(({ order, item }) => {
    const q = search.toLowerCase();
    return (
      !search ||
      order.patientName.toLowerCase().includes(q) ||
      order.orderNumber.toLowerCase().includes(q) ||
      item.testName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Consultant Pathologist Verification & Clinical Review Desk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Specialist result validation, reference interval verification, critical value authorization, and digital signing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Verifying Pathologist:</span>
          <input
            type="text"
            className="form-input"
            style={{ width: 240, height: 32, fontSize: 12 }}
            value={pathologistName}
            onChange={e => setPathologistName(e.target.value)}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Patient, Order #, Test..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Verification Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(({ order, item }) => {
          const isVerified = item.status === 'verified';
          const hasCrit = item.results.some(r => r.isCritical);

          return (
            <div
              key={`${order.id}-${item.id}`}
              className="card"
              style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${hasCrit ? 'var(--color-danger)' : isVerified ? 'var(--color-success)' : 'var(--color-warning)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{item.testName}</span>
                    <span className="badge badge-primary">{item.testCode}</span>
                    <span className={`badge ${order.priority === 'stat' ? 'badge-danger' : 'badge-neutral'}`}>
                      {order.priority.toUpperCase()}
                    </span>
                    {hasCrit && <span className="badge badge-danger">⚠️ CRITICAL VALUES</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Patient: <strong>{order.patientName}</strong> ({order.patientId}) · Order: <strong>{order.orderNumber}</strong> · Ref Doctor: <strong>{order.doctorName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}>
                    {item.status.toUpperCase()}
                  </span>

                  {!isVerified ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => verifyTestResults(order.id, item.testId, pathologistName, 'Results verified by consultant pathologist.')}
                    >
                      <ShieldCheck size={12} /> Authorize & Signoff
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewReportOrder(order)}>
                        <Printer size={12} /> View Report
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-warning)' }} onClick={() => setAmendTarget({ order, item })}>
                        <FileEdit size={12} /> Amend Report
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Observed Results Grid */}
              <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {item.results.map((res, rIdx) => (
                    <div key={rIdx} style={{ fontSize: 12 }}>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{res.parameterName} ({res.referenceRange} {res.unit})</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: res.isCritical ? 'var(--color-danger)' : res.status !== 'normal' ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                        {res.value} {res.unit}
                        <span className={`badge ${res.isCritical ? 'badge-danger' : res.status !== 'normal' ? 'badge-warning' : 'badge-success'}`} style={{ marginLeft: 6, fontSize: 10 }}>
                          {res.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <div>Entered by MLT: <strong>{item.technicianName}</strong> ({item.technicianAt})</div>
                {isVerified && <div>Verified by: <strong>{item.verifiedBy}</strong> ({item.verifiedAt})</div>}
              </div>
            </div>
          );
        })}
      </div>

      {viewReportOrder && <PrintLabReportModal order={viewReportOrder} onClose={() => setViewReportOrder(null)} />}
      {amendTarget && <ReportAmendmentModal order={amendTarget.order} item={amendTarget.item} onClose={() => setAmendTarget(null)} />}
    </div>
  );
}
