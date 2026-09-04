import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Filter, ShieldCheck, User } from 'lucide-react';
import { useNursing } from '../context/NursingContext';
import RecordNoteModal from './modals/RecordNoteModal';

export default function NursingNotesManagement() {
  const { admissions, nursingNotes } = useNursing();

  const [search, setSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [activeNoteAdm, setActiveNoteAdm] = useState<any | null>(null);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredNotes = nursingNotes.filter(n => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      n.patientName?.toLowerCase().includes(q) ||
      n.nurseName.toLowerCase().includes(q) ||
      n.observations.toLowerCase().includes(q);

    const matchesShift = selectedShift === 'ALL' || n.shift === selectedShift;

    return matchesSearch && matchesShift;
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
              General nursing notes, shift handover summaries, procedure documentation, and permanent clinical audit logs
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setActiveNoteAdm(activeAdmissions[0])}>
          <Plus size={13} /> Add Clinical Note
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Note Content, Patient, or Nurse..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
            <option value="ALL">All Duty Shifts</option>
            <option value="morning">Morning Shift (07:00 - 15:00)</option>
            <option value="afternoon">Afternoon Shift (15:00 - 23:00)</option>
            <option value="night">Night Shift (23:00 - 07:00)</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => {
            const adm = admissions.find(a => a.id === note.admissionId);
            return (
              <div key={note.id} className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                      {adm?.patientName || note.patientName || 'Inpatient'} · <span style={{ color: 'var(--color-primary)' }}>Bed {adm?.bedNumber || 'GA-01'} ({adm?.ward})</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Logged by <strong>{note.nurseName}</strong> · {note.shift.toUpperCase()} SHIFT · {note.noteDate} at {note.noteTime}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-primary">{note.shift.toUpperCase()} SHIFT</span>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} /> SIGNED & FINALIZED
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  {note.observations}
                </div>

                {note.nursingProcedures && (
                  <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text-secondary)' }}>
                    <strong>Procedures Performed:</strong> {note.nursingProcedures}
                  </div>
                )}

                {note.careInstructions && (
                  <div style={{ fontSize: 12, marginTop: 4, color: 'var(--color-warning)' }}>
                    <strong>Special Shift Instructions:</strong> {note.careInstructions}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <ClipboardList size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Nursing Notes Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Click "Add Clinical Note" to document patient care.</div>
          </div>
        )}
      </div>

      {/* Record Note Modal */}
      {activeNoteAdm && (
        <RecordNoteModal admission={activeNoteAdm} onClose={() => setActiveNoteAdm(null)} />
      )}
    </div>
  );
}
