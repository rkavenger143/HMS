import React, { useState } from 'react';
import { Search, X, User, FlaskConical, Barcode, ArrowRight, Tag } from 'lucide-react';
import { useLab } from '../context/LabContext';

interface LabSearchModalProps {
  onClose: () => void;
}

export default function LabSearchModal({ onClose }: LabSearchModalProps) {
  const { labOrders, labSamples, testMaster, setSelectedOrderId, setSelectedSampleId, setActiveTab } = useLab();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedOrders = query.length >= 2 ? labOrders.filter(o =>
    o.patientName.toLowerCase().includes(q) ||
    o.patientId.toLowerCase().includes(q) ||
    o.orderNumber.toLowerCase().includes(q) ||
    o.doctorName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSamples = query.length >= 2 ? labSamples.filter(s =>
    s.sampleId.toLowerCase().includes(q) ||
    s.barcode.toLowerCase().includes(q) ||
    s.patientName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedTests = query.length >= 2 ? testMaster.filter(t =>
    t.testName.toLowerCase().includes(q) ||
    t.testCode.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
    onClose();
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setActiveTab('sample_tracking');
    onClose();
  };

  const handleSelectTest = () => {
    setActiveTab('test_master');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Laboratory Quick Search</span>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              autoFocus
              className="form-input"
              placeholder="Search Patient Name, UHID, Order #, Sample Barcode, Test Code..."
              style={{ paddingLeft: 36, height: 42, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {query.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Matched Orders */}
              {matchedOrders.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Lab Orders ({matchedOrders.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedOrders.map(ord => (
                      <div
                        key={ord.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectOrder(ord.id)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                            {ord.orderNumber} — {ord.patientName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            UHID: {ord.patientId} · Status: <strong>{ord.status.toUpperCase()}</strong> · ₹{ord.totalAmount}
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Samples */}
              {matchedSamples.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Specimen Barcodes ({matchedSamples.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedSamples.map(s => (
                      <div
                        key={s.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSelectSample(s.sampleId)}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {s.sampleId} (Barcode: {s.barcode})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Patient: {s.patientName} · {s.sampleType} ({s.containerType}) · Status: {s.status.toUpperCase()}
                          </div>
                        </div>
                        <span className="badge badge-primary">{s.priority.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Tests */}
              {matchedTests.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Test Catalog Items ({matchedTests.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedTests.map(t => (
                      <div
                        key={t.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={handleSelectTest}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {t.testName} ({t.testCode})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Category: {t.category} · Price: ₹{t.price} · TAT: {t.turnaroundHours}h
                          </div>
                        </div>
                        <span className="badge badge-primary">{t.category.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedOrders.length === 0 && matchedSamples.length === 0 && matchedTests.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching laboratory records found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search orders, specimen barcodes, and test codes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
