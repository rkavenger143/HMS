import React from 'react';
import { Printer, X, ChefHat } from 'lucide-react';
import type { ComprehensiveDietChart, MealDeliveryRecord } from '../../../../types';

interface PrintKitchenBatchModalProps {
  mealType: string;
  date: string;
  deliveries: MealDeliveryRecord[];
  charts: ComprehensiveDietChart[];
  onClose: () => void;
}

export default function PrintKitchenBatchModal({ mealType, date, deliveries, charts, onClose }: PrintKitchenBatchModalProps) {
  const handlePrint = () => {
    window.print();
  };

  // Group deliveries by Diet Type
  const dietGroups: Record<string, MealDeliveryRecord[]> = {};

  deliveries.forEach(del => {
    const chart = charts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
    const type = chart?.dietType || 'regular';
    if (!dietGroups[type]) dietGroups[type] = [];
    dietGroups[type].push(del);
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 840, background: '#ffffff', color: '#1a1a1a' }}
      >
        <div className="modal-header no-print" style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChefHat size={18} style={{ color: '#0284c7' }} />
            <div className="modal-title" style={{ color: '#111827', fontSize: 16, fontWeight: 700 }}>
              Kitchen Food Service — Meal Preparation Batch Sheet
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print Kitchen Batch
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={13} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body print-area" style={{ padding: '32px 36px', fontSize: 13, color: '#111827' }}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>
                ALN HOSPITAL CENTRAL DIETARY & FOOD SERVICES
              </div>
              <div style={{ fontSize: 12, color: '#4b5563' }}>
                Daily Meal Batch Production Sheet · Food Hygiene & Safety Protocol
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0284c7' }}>
                MEAL: {mealType.toUpperCase().replace('_', ' ')}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Date: {date} · Total Trays: {deliveries.length}</div>
            </div>
          </div>

          {/* Grouped Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {Object.keys(dietGroups).map(dietType => {
              const items = dietGroups[dietType];

              return (
                <div key={dietType} style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#f0f9ff', borderBottom: '1px solid #bae6fd', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0369a1', fontSize: 14 }}>
                      {dietType.toUpperCase().replace('_', ' ')} ({items.length} Trays)
                    </strong>
                    <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>Kitchen Section: Batch Prep</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px', width: '20%' }}>Bed & Ward</th>
                        <th style={{ padding: '6px 10px', width: '25%' }}>Patient Name</th>
                        <th style={{ padding: '6px 10px', width: '35%' }}>Food Items / Menu</th>
                        <th style={{ padding: '6px 10px', width: '20%' }}>Allergy Alert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(del => {
                        const chart = charts.find(c => c.id === del.dietChartId || c.admissionId === del.admissionId);
                        const schedule = chart?.mealSchedules.find(s => s.mealType === mealType);

                        return (
                          <tr key={del.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0284c7' }}>
                              {del.bedNumber} ({del.ward})
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>{del.patientName}</td>
                            <td style={{ padding: '6px 10px' }}>
                              {schedule?.foodItems.map(f => f.foodName).join(', ') || 'Standard diet menu'}
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              {chart?.allergies && chart.allergies.length > 0 ? (
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ {chart.allergies.join(', ')}</span>
                              ) : (
                                <span style={{ color: '#16a34a' }}>None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 14, fontSize: 11, color: '#6b7280' }}>
            <div>Head Chef Signoff: _____________________</div>
            <div>Dietetics Supervisor: _____________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
