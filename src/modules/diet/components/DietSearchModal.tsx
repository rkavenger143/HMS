import React, { useState } from 'react';
import { Search, X, User, UtensilsCrossed, Apple, ArrowRight } from 'lucide-react';
import { useDiet } from '../context/DietContext';

interface DietSearchModalProps {
  onClose: () => void;
}

export default function DietSearchModal({ onClose }: DietSearchModalProps) {
  const { admissions, dietCharts, foodItems, setSelectedAdmissionId, setActiveTab } = useDiet();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const matchedAdmissions = query.length >= 2 ? admissions.filter(a =>
    a.patientName.toLowerCase().includes(q) ||
    a.patientId.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.bedNumber.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchedFoods = query.length >= 2 ? foodItems.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q) ||
    f.allergens.some(a => a.toLowerCase().includes(q))
  ).slice(0, 5) : [];

  const handleSelectAdmission = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
    onClose();
  };

  const handleSelectFood = () => {
    setActiveTab('food_items');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <span className="modal-title">Universal Nutrition Quick Search</span>
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
              placeholder="Search Inpatient Name, UHID, Bed #, or Food Item..."
              style={{ paddingLeft: 36, height: 42, fontSize: 14 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Results */}
          {query.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Inpatients */}
              {matchedAdmissions.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Inpatients ({matchedAdmissions.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedAdmissions.map(adm => {
                      const chart = dietCharts.find(c => c.admissionId === adm.id && (c.status === 'active' || c.status === 'approved'));

                      return (
                        <div
                          key={adm.id}
                          style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleSelectAdmission(adm.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm">{adm.patientName[0]}</div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 13 }}>{adm.patientName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                {adm.patientId} · Bed {adm.bedNumber} ({adm.ward}) · Diet: <strong>{chart?.dietType.toUpperCase() || 'None'}</strong>
                              </div>
                            </div>
                          </div>
                          <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Food Items */}
              {matchedFoods.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Matching Food Master Items ({matchedFoods.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedFoods.map(food => (
                      <div
                        key={food.id}
                        style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={handleSelectFood}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Apple size={16} style={{ color: 'var(--color-primary)' }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{food.name} — {food.calories} kcal</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              Category: {food.category} · Portion: {food.standardPortion} {food.allergens.length > 0 && `· Allergens: ${food.allergens.join(', ')}`}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-primary">{food.category.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedAdmissions.length === 0 && matchedFoods.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No matching inpatients or food items found for "{query}".
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Type at least 2 characters to search inpatients, beds, and food master items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
