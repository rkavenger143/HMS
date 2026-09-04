import React, { useState } from 'react';
import {
  Scan, X, ZoomIn, ZoomOut, RotateCw, Contrast, Layers, Maximize2,
  ChevronLeft, ChevronRight, Play, Pause, Ruler, Sliders, ShieldCheck
} from 'lucide-react';
import type { ComprehensiveRadiologyOrder } from '../../../../types';

interface PACSViewerModalProps {
  order: ComprehensiveRadiologyOrder;
  onClose: () => void;
}

export default function PACSViewerModal({ order, onClose }: PACSViewerModalProps) {
  const [currentSlice, setCurrentSlice] = useState(12);
  const [totalSlices] = useState(order.imageCount || 32);
  const [zoom, setZoom] = useState(100);
  const [windowPreset, setWindowPreset] = useState<'brain' | 'bone' | 'lung' | 'soft_tissue'>('brain');
  const [isInverted, setIsInverted] = useState(false);
  const [isPlayingCine, setIsPlayingCine] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 960,
          height: '88vh',
          background: '#090d16',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #1f293d',
        }}
      >
        {/* PACS Topbar */}
        <div style={{ padding: '10px 18px', background: '#111827', borderBottom: '1px solid #1f293d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scan size={18} style={{ color: '#0A84FF' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                ALN DICOM PACS Viewer — {order.examName} ({order.modalityType.toUpperCase()})
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                Accession: <strong style={{ color: '#0A84FF' }}>{order.accessionNumber}</strong> · UID: {order.studyUid || '1.2.840.113619.2.55.3.2831164'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>DICOM 3.0 PROTOCOL</span>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} style={{ color: '#ffffff' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PACS Main Workspace */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
          {/* Left: Series & Presets Toolbar */}
          <div style={{ background: '#0d131f', borderRight: '1px solid #1f293d', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6 }}>
                Patient Information
              </div>
              <div style={{ fontWeight: 800 }}>{order.patientName}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>UHID: {order.patientId}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.gender.toUpperCase()}, {order.age}y</div>
            </div>

            {/* Window / Level Presets */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6 }}>
                Window / Level Presets
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { id: 'brain', label: 'Brain (W:80 L:40)' },
                  { id: 'bone', label: 'Bone (W:2000 L:500)' },
                  { id: 'lung', label: 'Lung (W:1500 L:-600)' },
                  { id: 'soft_tissue', label: 'Soft Tissue (W:350 L:50)' },
                ].map(p => (
                  <button
                    key={p.id}
                    className={`btn btn-sm ${windowPreset === p.id ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: 11, justifyContent: 'flex-start', height: 26, color: windowPreset === p.id ? '#ffffff' : '#9CA3AF' }}
                    onClick={() => setWindowPreset(p.id as any)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Tools */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6 }}>
                DICOM Tools
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, height: 26 }} onClick={() => setZoom(z => Math.min(z + 20, 200))}>
                  <ZoomIn size={12} />
                </button>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, height: 26 }} onClick={() => setZoom(z => Math.max(z - 20, 60))}>
                  <ZoomOut size={12} />
                </button>
                <button className={`btn btn-sm ${isInverted ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: 11, height: 26 }} onClick={() => setIsInverted(v => !v)}>
                  <Contrast size={12} /> Invert
                </button>
              </div>
            </div>

            {/* Study Acquisition Stats */}
            <div style={{ marginTop: 'auto', background: '#111827', padding: '10px', borderRadius: 4, fontSize: 11, color: '#9CA3AF' }}>
              <div>Series: <strong>{order.seriesCount || 2}</strong></div>
              <div>Matrix: <strong>512 x 512</strong></div>
              <div>Slice Thickness: <strong>1.25 mm</strong></div>
              <div>KVP: <strong>120 kV</strong> · mA: <strong>250</strong></div>
            </div>
          </div>

          {/* Right: Simulated High-Resolution Scan Display */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#000000', position: 'relative' }}>
            {/* Viewport Canvas Simulation */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Patient Corner Overlays (DICOM standard) */}
              <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, color: '#38BDF8', fontFamily: 'monospace', textShadow: '0 1px 2px #000' }}>
                <div>{order.patientName}</div>
                <div>ID: {order.patientId}</div>
                <div>{order.gender.toUpperCase()} / {order.age}Y</div>
              </div>

              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 11, color: '#38BDF8', fontFamily: 'monospace', textAlign: 'right', textShadow: '0 1px 2px #000' }}>
                <div>ALN CURE DIAGNOSTICS</div>
                <div>{order.modalityType.toUpperCase()} {order.bodyPart}</div>
                <div>{order.technicianAt || order.orderDate}</div>
              </div>

              <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 11, color: '#38BDF8', fontFamily: 'monospace', textShadow: '0 1px 2px #000' }}>
                <div>Slice: {currentSlice} / {totalSlices}</div>
                <div>Zoom: {zoom}%</div>
              </div>

              <div style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 11, color: '#38BDF8', fontFamily: 'monospace', textAlign: 'right', textShadow: '0 1px 2px #000' }}>
                <div>Preset: {windowPreset.toUpperCase()}</div>
                <div>KV: 120 / mA: 250</div>
              </div>

              {/* Simulated Anatomical DICOM Slice Display */}
              <div
                style={{
                  width: `${zoom * 3.4}px`,
                  height: `${zoom * 3.4}px`,
                  maxWidth: '75%',
                  maxHeight: '75%',
                  borderRadius: order.modalityType === 'ct' || order.modalityType === 'mri' ? '50%' : 12,
                  border: '2px solid rgba(255,255,255,0.15)',
                  background: isInverted
                    ? 'radial-gradient(circle, #f3f4f6 0%, #d1d5db 40%, #9ca3af 70%, #111827 95%)'
                    : windowPreset === 'bone'
                    ? 'radial-gradient(circle, #1e293b 0%, #334155 40%, #e2e8f0 75%, #000000 95%)'
                    : windowPreset === 'lung'
                    ? 'radial-gradient(circle, #020617 0%, #0f172a 50%, #64748b 80%, #000000 95%)'
                    : 'radial-gradient(circle, #334155 0%, #1e293b 45%, #0f172a 75%, #000000 95%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(0,0,0,0.8)',
                  position: 'relative',
                }}
              >
                {/* Visual Internal Anatomy Simulation */}
                <div style={{ textAlign: 'center', opacity: 0.85 }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>
                    {order.modalityType === 'xray' ? '🦴' : order.modalityType === 'mri' ? '🏥' : '🧠'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isInverted ? '#111827' : '#E2E8F0', letterSpacing: 1 }}>
                    {order.bodyPart.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: isInverted ? '#4B5563' : '#94A3B8', marginTop: 2 }}>
                    SLICE {currentSlice} OF {totalSlices} (AXIAL)
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Navigation Slider & Controls */}
            <div style={{ padding: '10px 18px', background: '#111827', borderTop: '1px solid #1f293d', display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#ffffff', padding: '4px 8px' }}
                onClick={() => setCurrentSlice(s => Math.max(s - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <input
                type="range"
                min={1}
                max={totalSlices}
                value={currentSlice}
                onChange={e => setCurrentSlice(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#0A84FF', cursor: 'pointer' }}
              />

              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#ffffff', padding: '4px 8px' }}
                onClick={() => setCurrentSlice(s => Math.min(s + 1, totalSlices))}
              >
                Next <ChevronRight size={16} />
              </button>

              <span style={{ fontSize: 12, color: '#9CA3AF', minWidth: 80, textAlign: 'right' }}>
                {currentSlice} / {totalSlices} Slices
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
