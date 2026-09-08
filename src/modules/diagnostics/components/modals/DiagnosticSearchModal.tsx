import React, { useState, useEffect } from 'react';
import { Search, Activity, FileText, ArrowRight, User } from 'lucide-react';
import { useDiagnostic, DiagnosticTab } from '../../context/DiagnosticContext';

interface DiagnosticSearchModalProps {
  onClose: () => void;
}

export default function DiagnosticSearchModal({ onClose }: DiagnosticSearchModalProps) {
  const { requests, testMaster, setSelectedRequestId, setActiveTab } = useDiagnostic();
  const [query, setQuery] = useState('');

  const filteredRequests = requests.filter(r => {
    const q = query.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q)
    );
  });

  const handleSelectRequest = (reqId: string, targetTab: DiagnosticTab) => {
    setSelectedRequestId(reqId);
    setActiveTab(targetTab);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 580, padding: 0, overflow: 'hidden' }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Quick search Patient, Test, Doctor, Request ID... (Ctrl+K)"
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 14, boxShadow: 'none' }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 12px' }}>
          {filteredRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredRequests.map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSelectRequest(r.id, r.status === 'requested' ? 'sample_collection' : r.status === 'processing' ? 'results' : 'reports')}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{r.patientName}</span>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>{r.requestId}</span>
                      <span className={`badge ${r.priority === 'emergency' ? 'badge-danger' : r.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: 9 }}>
                        {r.priority.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {r.testName} · Ref: {r.doctorName} · {r.bedNumber ? `Bed ${r.bedNumber}` : 'OPD'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: 10 }}>
                      {r.status.toUpperCase().replace('_', ' ')}
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No diagnostic test requests found matching "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
