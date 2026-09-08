import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Filter, ShieldCheck, User, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordNoteModal from './modals/RecordNoteModal';

export default function NursingNotesManagement() {
  const { admissions, nursingNotes } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmissionForModal, setSelectedAdmissionForModal] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredNotes = nursingNotes.filter(n => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (n.patientName && n.patientName.toLowerCase().includes(q)) ||
      (n.nurseName && n.nurseName.toLowerCase().includes(q)) ||
      (n.observations && n.observations.toLowerCase().includes(q)) ||
      (n.nursingProcedures && n.nursingProcedures.toLowerCase().includes(q)) ||
      (n.careInstructions && n.careInstructions.toLowerCase().includes(q));

    const matchesPatient = selectedPatient === 'ALL' || n.admissionId === selectedPatient;
    const matchesShift = selectedShift === 'ALL' || n.shift === selectedShift;

    return matchesSearch && matchesPatient && matchesShift;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Clinical Nursing Notes & Observations</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bedside patient observation notes, condition tracking, care provided, and important nursing remarks
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedAdmissionForModal(activeAdmissions[0] || null);
            setShowAddModal(true);
          }}
        >
          <Plus size={13} /> Add Nursing Note
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Note Content, Patient, Nurse..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="ALL">All Inpatients ({activeAdmissions.length})</option>
            {activeAdmissions.map(a => (
              <option key={a.id} value={a.id}>{a.patientName} (Bed {a.bedNumber})</option>
            ))}
          </select>

          <select className="form-select" value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
            <option value="ALL">All Duty Shifts</option>
            <option value="morning">Morning Shift (07:00 - 15:00)</option>
            <option value="evening">Evening Shift (15:00 - 23:00)</option>
            <option value="night">Night Shift (23:00 - 07:00)</option>
          </select>
        </div>
      </div>

      {/* Chronological Notes Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => {
            const adm = admissions.find(a => a.id === note.admissionId);
            const isCritical = note.observations?.toLowerCase().includes('critical') || note.observations?.toLowerCase().includes('deteriorat');

            return (
              <div
                key={note.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderLeft: `4px solid ${isCritical ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                      {adm?.patientName || note.patientName || 'Inpatient'} · <span style={{ color: 'var(--color-primary)' }}>Bed {adm?.bedNumber || 'Bed'} ({adm?.ward || 'General'})</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span><User size={11} style={{ display: 'inline', marginRight: 3 }} /><strong>{note.nurseName}</strong></span>
                      <span>•</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{note.noteDate} at {note.noteTime}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{note.shift.toUpperCase()} SHIFT</span>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} /> SIGNED
                    </span>
                  </div>
                </div>

                {/* Observation content */}
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  {note.observations}
                </div>

                {/* Care Provided */}
                {note.nursingProcedures && (
                  <div style={{ fontSize: 12, marginTop: 10, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <Stethoscope size={14} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Care Provided / Procedures:</strong> {note.nursingProcedures}
                    </div>
                  </div>
                )}

                {/* Important remarks */}
                {note.careInstructions && (
                  <div style={{ fontSize: 12, marginTop: 6, color: 'var(--color-warning)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <AlertCircle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Important Remarks / Next Shift:</strong> {note.careInstructions}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <ClipboardList size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Clinical Notes Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Click "Add Nursing Note" to record patient observations and bedside care.
            </div>
          </div>
        )}
      </div>

      {/* Record Note Modal */}
      {showAddModal && (
        <RecordNoteModal
          admission={selectedAdmissionForModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedAdmissionForModal(null);
          }}
        />
      )}
    </div>
  );
}
