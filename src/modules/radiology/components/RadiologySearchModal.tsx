import React, { useState } from 'react';
import { Search, X, Scan, Camera, ArrowRight, Tag } from 'lucide-react';
import { useRadiology } from '../context/RadiologyContext';

interface RadiologySearchModalProps {
  onClose: () => void;
}

export default function RadiologySearchModal({ onClose }: RadiologySearchModalProps) {
  const { radiologyOrders, examinations, setSelectedOrderId, setActiveTab } = useRadiology();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedOrders = query.length >= 2 ? radiologyOrders.filter(o =>
    o.patientName.toLowerCase().includes(q) ||
    o.patientId.toLowerCase().includes(q) ||
    o.accessionNumber.toLowerCase().includes(q) ||
    o.orderNumber.toLowerCase().includes(q) ||
    o.examName.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchedExams = query.length >= 2 ? examinations.filter(e =>
    e.examName.toLowerCase().includes(q) ||
    e.examCode.toLowerCase().includes(q) ||
    e.bodyPart.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
    onClose();
  };

  const handleSelectExam = () => {
    setActiveTab('examinations');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Radiology & Imaging Quick Search</span>
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
              placeholder="Search Patient Name, UHID, Accession #, Examination..."
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
                    Matching Imaging Orders ({matchedOrders.length})
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
                            {ord.accessionNumber} — {ord.patientName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {ord.examName} ({ord.modalityType.toUpperCase()}) · Status: <strong>{ord.status.toUpperCase()}</strong> · ₹{ord.price}
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Exams */}
              {matchedExams.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Examination Catalog Items ({matchedExams.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedExams.map(ex => (
                      <div
                        key={ex.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={handleSelectExam}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {ex.examName} ({ex.examCode})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Modality: {ex.modalityType.toUpperCase()} · Body Part: {ex.bodyPart} · Price: ₹{ex.price}
                          </div>
                        </div>
                        <span className="badge badge-primary">{ex.modalityType.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedOrders.length === 0 && matchedExams.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching radiology records found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search imaging orders, accession numbers, and examination protocols.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
