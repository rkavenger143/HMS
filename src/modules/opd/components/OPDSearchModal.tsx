import React, { useState } from 'react';
import {
  Search, X, User, Stethoscope, Clock, ReceiptText, Pill,
  Printer, ArrowRight, Eye, Phone, Calendar
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import type { OPDVisit } from '../../../types';

interface OPDSearchModalProps {
  onClose: () => void;
}

export default function OPDSearchModal({ onClose }: OPDSearchModalProps) {
  const {
    visits,
    patients,
    setActiveTab,
    startConsultationForVisit,
    setSelectedPatientId,
  } = useOPD();

  const [query, setQuery] = useState('');

  const results = visits.filter(v => {
    if (!query || query.length < 2) return false;
    const q = query.toLowerCase();
    return (
      v.patientName.toLowerCase().includes(q) ||
      v.patientId.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.tokenNumber.toString().includes(q) ||
      (v.patientPhone && v.patientPhone.includes(q)) ||
      v.doctorName.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <div className="modal-title">Universal OPD Search</div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Big Search Input */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              autoFocus
              className="form-input"
              placeholder="Search by Patient Name, UHID, Mobile, Visit ID, Doctor, or Token #..."
              style={{ paddingLeft: 40, height: 44, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Search Result Count */}
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {query.length >= 2 ? `Found ${results.length} matching outpatient records:` : 'Type at least 2 characters to search outpatient encounters.'}
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
            {results.map(v => (
              <div
                key={v.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    #{v.tokenNumber}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      {v.patientName}
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      <span className="patient-id" style={{ fontSize: 10 }}>{v.patientId}</span>
                      <span>·</span>
                      <span>Visit: {v.id}</span>
                      <span>·</span>
                      <span>Dr. {v.doctorName} ({v.department})</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => {
                      startConsultationForVisit(v);
                      onClose();
                    }}
                  >
                    <Stethoscope size={11} /> Consult
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => {
                      setSelectedPatientId(v.patientId);
                      setActiveTab('patients');
                      onClose();
                    }}
                  >
                    <Eye size={11} /> Patient Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
