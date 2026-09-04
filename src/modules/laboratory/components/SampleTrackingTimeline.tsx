import React, { useState } from 'react';
import {
  Clock, Search, CheckCircle2, AlertCircle, Barcode, ShieldCheck,
  FlaskConical, Truck, FileText, User
} from 'lucide-react';
import { useLab } from '../context/LabContext';

export default function SampleTrackingTimeline() {
  const { labOrders, labSamples } = useLab();

  const [search, setSearch] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(labSamples[0]?.sampleId || '');

  const activeSample = labSamples.find(s => s.sampleId === selectedSampleId) || labSamples[0];
  const associatedOrder = labOrders.find(o => o.id === activeSample?.orderId || o.sampleIds.includes(activeSample?.sampleId));

  const steps = [
    {
      title: 'Lab Order Requisition Created',
      timestamp: associatedOrder?.orderDate || '2026-09-02 08:30',
      user: associatedOrder?.doctorName || 'Dr. Rajesh Sharma',
      desc: `Physician ordered ${associatedOrder?.items.map(i => i.testCode).join(', ')} (${associatedOrder?.priority.toUpperCase()} priority).`,
      completed: true,
      icon: <FileText size={16} />,
    },
    {
      title: 'Phlebotomy Sample Collection',
      timestamp: activeSample?.collectedAt || 'Pending Collection',
      user: activeSample?.collectedBy || 'Phlebotomy Desk',
      desc: activeSample?.collectedAt
        ? `Specimen collected (${activeSample.sampleType} in ${activeSample.containerType}). Barcode generated.`
        : 'Awaiting specimen draw and tube labeling.',
      completed: !!activeSample?.collectedAt,
      icon: <Barcode size={16} />,
    },
    {
      title: 'Laboratory Specimen Intake & Accessioning',
      timestamp: activeSample?.receivedAt || (activeSample?.collectedAt ? 'In Transit to Lab' : 'Pending'),
      user: activeSample?.receivedBy || 'Specimen Reception MLT',
      desc: activeSample?.status === 'rejected'
        ? `REJECTED: ${activeSample.rejectionReason} — ${activeSample.rejectionRemarks}`
        : activeSample?.receivedAt
        ? 'Pre-analytical quality checks passed. Specimen accepted for analyzer loading.'
        : 'Awaiting lab reception accessioning.',
      completed: activeSample?.status === 'accepted' || activeSample?.status === 'completed',
      isDanger: activeSample?.status === 'rejected',
      icon: <Truck size={16} />,
    },
    {
      title: 'Analytical Instrument Test Processing',
      timestamp: associatedOrder?.items[0]?.technicianAt || (associatedOrder?.status === 'processing' ? 'Currently Running' : 'Pending'),
      user: associatedOrder?.items[0]?.technicianName || 'Laboratory Technologist',
      desc: associatedOrder?.status === 'processing'
        ? 'Sample loaded on automated clinical analyzer. Reagents loaded and calibrating.'
        : associatedOrder?.status === 'completed' || associatedOrder?.status === 'verified'
        ? 'Analyte quantification complete. Numeric parameters entered into LIS.'
        : 'Pending analyzer queue.',
      completed: associatedOrder?.status === 'completed' || associatedOrder?.status === 'verified',
      icon: <FlaskConical size={16} />,
    },
    {
      title: 'Consultant Pathologist Verification & Report Release',
      timestamp: associatedOrder?.items[0]?.verifiedAt || 'Pending Pathologist Review',
      user: associatedOrder?.items[0]?.verifiedBy || 'Dr. Sunita Rao, MD (Pathology)',
      desc: associatedOrder?.status === 'verified'
        ? 'Results verified, reference intervals checked, digital signature applied, and report released to EHR.'
        : 'Pending specialist clinical authorization.',
      completed: associatedOrder?.status === 'verified',
      icon: <ShieldCheck size={16} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Laboratory Specimen Tracking & Chain of Custody Audit</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Complete chronological specimen lifecycle tracking from bedside order to pathologist report release
            </div>
          </div>
        </div>

        {/* Specimen Selector */}
        <select
          className="form-select"
          style={{ width: 260 }}
          value={activeSample?.sampleId || ''}
          onChange={e => setSelectedSampleId(e.target.value)}
        >
          {labSamples.map(s => (
            <option key={s.id} value={s.sampleId}>
              {s.sampleId} — {s.patientName} ({s.sampleType})
            </option>
          ))}
        </select>
      </div>

      {/* Specimen Overview Card */}
      {activeSample && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-default)', paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-primary)' }}>
                  {activeSample.sampleId}
                </span>
                <span className="badge badge-primary">Barcode: {activeSample.barcode}</span>
                <span className={`badge ${activeSample.priority === 'stat' ? 'badge-danger' : activeSample.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                  {activeSample.priority.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Associated Lab Order: <strong>{associatedOrder?.orderNumber}</strong> · Patient: <strong>{activeSample.patientName}</strong> ({activeSample.patientId})
              </div>
            </div>

            <span className={`badge ${activeSample.status === 'completed' || activeSample.status === 'accepted' ? 'badge-success' : activeSample.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '6px 14px', fontSize: 12 }}>
              {activeSample.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div>Specimen Type: <strong>{activeSample.sampleType}</strong></div>
            <div>Container: <strong>{activeSample.containerType}</strong></div>
            <div>Location: <strong>{activeSample.bedNumber ? `Bed ${activeSample.bedNumber} (${activeSample.ward})` : 'OPD'}</strong></div>
            <div>Doctor: <strong>{associatedOrder?.doctorName}</strong></div>
          </div>
        </div>
      )}

      {/* Visual Vertical Timeline */}
      <div className="card" style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>
          Chain of Custody Tracking Timeline
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 10,
              bottom: 10,
              width: 2,
              background: 'var(--border-default)',
              zIndex: 1,
            }}
          />

          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              {/* Step Icon Indicator */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: step.isDanger
                    ? 'var(--color-danger)'
                    : step.completed
                    ? 'var(--color-success)'
                    : 'var(--bg-surface)',
                  color: step.completed || step.isDanger ? '#ffffff' : 'var(--text-tertiary)',
                  border: `2px solid ${step.isDanger ? 'var(--color-danger)' : step.completed ? 'var(--color-success)' : 'var(--border-default)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>

              {/* Step Content */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${step.isDanger ? 'var(--color-danger)' : 'var(--border-default)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: step.isDanger ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                    {step.title}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                    {step.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {step.desc}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Action by: <strong>{step.user}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
