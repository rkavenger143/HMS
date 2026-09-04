import React, { useState } from 'react';
import {
  BedDouble, Sparkles, AlertTriangle, Clock, CheckCircle2,
  Filter, Layers, User, Plus
} from 'lucide-react';
import { useIPD } from '../context/IPDContext';
import type { Bed, Ward } from '../../../types';
import BedDetailsModal from './modals/BedDetailsModal';
import TransferModal from './modals/TransferModal';

export default function BedBoard() {
  const {
    beds,
    wards,
    admissions,
    setActiveTab,
    setSelectedAdmissionId,
    markBedCleaned,
  } = useIPD();

  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedInspectBed, setSelectedInspectBed] = useState<Bed | null>(null);
  const [transferAdmission, setTransferAdmission] = useState<any | null>(null);

  // Group beds by Ward
  const displayedWards = selectedWardId ? wards.filter(w => w.id === selectedWardId) : wards;

  const handleBedClick = (bed: Bed) => {
    setSelectedInspectBed(bed);
  };

  const handleTransfer = (bed: Bed) => {
    if (bed.currentAdmissionId) {
      const adm = admissions.find(a => a.id === bed.currentAdmissionId);
      if (adm) setTransferAdmission(adm);
    }
  };

  const handleViewEHR = (admissionId: string) => {
    setSelectedAdmissionId(admissionId);
    setActiveTab('inpatient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Real-Time Inpatient Bed Board</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Live hospital visual bed map organized by clinical wards and floors
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)' }} />
            🟢 Available ({beds.filter(b => b.status === 'available').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-danger)' }} />
            🔴 Occupied ({beds.filter(b => b.status === 'occupied').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-warning)' }} />
            🟡 Reserved ({beds.filter(b => b.status === 'reserved').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-info)' }} />
            🔵 Cleaning ({beds.filter(b => b.status === 'cleaning').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-muted)' }} />
            ⚫ Maintenance ({beds.filter(b => b.status === 'maintenance').length})
          </span>
        </div>
      </div>

      {/* Ward Selector Bar */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button
          className={`btn btn-sm ${!selectedWardId ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedWardId('')}
        >
          All Wards ({beds.length} Beds)
        </button>
        {wards.map(w => {
          const wardBeds = beds.filter(b => b.wardId === w.id || b.ward === w.name);
          const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
          return (
            <button
              key={w.id}
              className={`btn btn-sm ${selectedWardId === w.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedWardId(selectedWardId === w.id ? '' : w.id)}
            >
              {w.name} ({occupiedCount}/{wardBeds.length})
            </button>
          );
        })}
      </div>

      {/* Visual Ward-by-Ward Grid Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {displayedWards.map(ward => {
          const wardBeds = beds.filter(b => b.wardId === ward.id || b.ward === ward.name);
          const freeBeds = wardBeds.filter(b => b.status === 'available').length;
          const occBeds = wardBeds.filter(b => b.status === 'occupied').length;
          const cleaningBeds = wardBeds.filter(b => b.status === 'cleaning').length;

          return (
            <div key={ward.id} className="card">
              {/* Ward Header */}
              <div className="card-header" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Layers size={18} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <span className="card-title" style={{ fontSize: 15 }}>{ward.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>
                      Floor {ward.floor} · {ward.inchargeName || 'Nurse Incharge'}
                    </span>
                  </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 12 }}>
                  <span className="badge badge-success">{freeBeds} Available</span>
                  <span className="badge badge-danger">{occBeds} Occupied</span>
                  {cleaningBeds > 0 && <span className="badge badge-info">{cleaningBeds} Cleaning</span>}
                </div>
              </div>

              {/* Bed Cards Inside Ward */}
              <div className="card-body" style={{ padding: '18px' }}>
                <div className="bed-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                  {wardBeds.map(bed => {
                    const isOccupied = bed.status === 'occupied';
                    const isCleaning = bed.status === 'cleaning';
                    const isReserved = bed.status === 'reserved';
                    const isMaintenance = bed.status === 'maintenance';

                    return (
                      <div
                        key={bed.id}
                        className={`bed-card ${bed.status}`}
                        onClick={() => handleBedClick(bed)}
                        style={{
                          height: '95px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '8px',
                          textAlign: 'center',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <BedDouble size={20} />
                        <div style={{ fontWeight: 800, fontSize: 13, marginTop: 2 }}>{bed.bedNumber}</div>

                        {isOccupied && bed.currentPatientName ? (
                          <div style={{ fontSize: 10, fontWeight: 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, opacity: 0.9 }}>
                            {bed.currentPatientName.split(' ')[0]} {bed.currentPatientName.split(' ')[1]?.[0] || ''}
                          </div>
                        ) : isCleaning ? (
                          <div style={{ fontSize: 9, color: 'var(--color-info)', fontWeight: 700, marginTop: 2 }}>
                            Cleaning
                          </div>
                        ) : isReserved ? (
                          <div style={{ fontSize: 9, color: 'var(--color-warning)', fontWeight: 700, marginTop: 2 }}>
                            Reserved
                          </div>
                        ) : isMaintenance ? (
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>
                            Repairs
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: 'var(--color-success)', fontWeight: 700, marginTop: 2 }}>
                            Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Details Modal */}
      {selectedInspectBed && (
        <BedDetailsModal
          bed={selectedInspectBed}
          onClose={() => setSelectedInspectBed(null)}
          onTransfer={bed => handleTransfer(bed)}
          onAdmit={() => setActiveTab('admission')}
          onViewProfile={admId => handleViewEHR(admId)}
        />
      )}

      {/* Bed Transfer Modal */}
      {transferAdmission && (
        <TransferModal
          admission={transferAdmission}
          onClose={() => setTransferAdmission(null)}
        />
      )}
    </div>
  );
}
