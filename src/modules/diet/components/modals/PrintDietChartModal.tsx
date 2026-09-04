import React from 'react';
import { Printer, X, UtensilsCrossed, ShieldAlert } from 'lucide-react';
import type { ComprehensiveDietChart } from '../../../../types';

interface PrintDietChartModalProps {
  chart: ComprehensiveDietChart;
  onClose: () => void;
}

export default function PrintDietChartModal({ chart, onClose }: PrintDietChartModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 840, background: '#ffffff', color: '#1a1a1a' }}
      >
        <div className="modal-header no-print" style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={18} style={{ color: '#0284c7' }} />
            <div className="modal-title" style={{ color: '#111827', fontSize: 16, fontWeight: 700 }}>
              Official Inpatient Diet Chart
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Chart
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={13} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body print-area" style={{ padding: '32px 36px', fontSize: 13, lineHeight: 1.5, color: '#111827' }}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>
                ALN GENERAL HOSPITAL & MEDICAL RESEARCH CENTER
              </div>
              <div style={{ fontSize: 12, color: '#4b5563' }}>
                Department of Clinical Nutrition & Dietetics · NABH Accredited Tertiary Care
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Hospital Road, Medical District · Ph: +91 11 2345 6789 · dietetics@alnhospital.com
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', background: '#f3f4f6', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>
                DIET CHART #{chart.id.toUpperCase()} (v{chart.version})
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>
                Status: <strong>{chart.status.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          {/* Patient Details Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 14, borderRadius: 6, marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Patient Name:</span>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{chart.patientName}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>UHID / Patient ID:</span>
              <div style={{ fontWeight: 600 }}>{chart.patientId}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Ward / Bed:</span>
              <div style={{ fontWeight: 700, color: '#0284c7' }}>{chart.bedNumber} ({chart.ward})</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Attending Physician:</span>
              <div style={{ fontWeight: 600 }}>{chart.doctorName}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Clinical Dietitian:</span>
              <div style={{ fontWeight: 600 }}>{chart.dietitianName}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Prescribed Diet Type:</span>
              <div style={{ fontWeight: 800, color: '#dc2626' }}>{chart.dietType.toUpperCase().replace('_', ' ')}</div>
            </div>
          </div>

          {/* Allergies & Restrictions Alert */}
          {(chart.allergies.length > 0 || chart.restrictions.length > 0) && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 6, marginBottom: 20 }}>
              {chart.allergies.length > 0 && (
                <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                  ⚠️ ALLERGIES RECORDED: {chart.allergies.join(', ')}
                </div>
              )}
              {chart.restrictions.length > 0 && (
                <div style={{ color: '#991b1b', fontSize: 12 }}>
                  <strong>Dietary Restrictions:</strong> {chart.restrictions.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* Caloric & Macronutrient Breakdown */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '12px 16px', marginBottom: 20, background: '#fcfcfd' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>
              Target Macronutrient & Caloric Allowance
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ borderRight: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0284c7' }}>{chart.estimatedCalories}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Calories (kcal)</div>
              </div>
              <div style={{ borderRight: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{chart.proteinGrams}g</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Protein</div>
              </div>
              <div style={{ borderRight: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>{chart.carbsGrams}g</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Carbohydrates</div>
              </div>
              <div style={{ borderRight: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#9333ea' }}>{chart.fatGrams}g</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Fats</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0891b2' }}>{chart.fluidRequirementMl || '—'} ml</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Fluid / 24h</div>
              </div>
            </div>
          </div>

          {/* Meal Schedule Timetable */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              Prescribed Meal Schedule & Menu Plan
            </div>

            {chart.mealSchedules.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', width: '15%' }}>Time</th>
                    <th style={{ padding: '8px 10px', width: '20%' }}>Meal Category</th>
                    <th style={{ padding: '8px 10px', width: '45%' }}>Food Items & Portion</th>
                    <th style={{ padding: '8px 10px', width: '20%' }}>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.mealSchedules.map((ms, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0284c7' }}>{ms.scheduledTime}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{ms.mealType.toUpperCase().replace('_', ' ')}</td>
                      <td style={{ padding: '8px 10px' }}>
                        {ms.foodItems.map((fi, i) => (
                          <div key={i} style={{ marginBottom: 2 }}>
                            • <strong>{fi.foodName}</strong> ({fi.portion})
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#64748b' }}>{ms.specialInstructions || 'Standard prep'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, background: '#f9fafb', borderRadius: 4, color: '#6b7280' }}>
                Patient is currently under Nil Per Os (NPO) fasting protocol. No oral meal items scheduled.
              </div>
            )}
          </div>

          {/* Clinical Instructions */}
          {chart.specialInstructions && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 6, marginBottom: 24, fontSize: 12 }}>
              <strong>Clinical & Kitchen Instructions:</strong> {chart.specialInstructions}
            </div>
          )}

          {/* Signatures */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
            <div>
              <div style={{ height: 35 }}></div>
              <div style={{ borderTop: '1px solid #111827', width: 220, fontSize: 11, fontWeight: 700 }}>
                {chart.dietitianName}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Registered Clinical Dietitian</div>
            </div>

            <div>
              <div style={{ height: 35 }}></div>
              <div style={{ borderTop: '1px solid #111827', width: 220, fontSize: 11, fontWeight: 700 }}>
                {chart.doctorName}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Attending Physician Signoff</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
