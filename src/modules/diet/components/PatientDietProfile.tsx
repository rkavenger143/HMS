import React, { useState } from 'react';
import {
  UtensilsCrossed, User, Activity, FileText, Scale, History,
  ShieldAlert, Plus, Printer, Edit, CheckCircle2, ArrowLeft,
  AlertTriangle, Clock, ChefHat
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import PrintBedsideDietCardModal from './modals/PrintBedsideDietCardModal';
import CreateDietChartModal from './modals/CreateDietChartModal';
import NutritionAssessmentModal from './modals/NutritionAssessmentModal';
import type { ComprehensiveDietChart, NutritionAssessmentRecord } from '../../../types';

type ProfileTab = 'overview' | 'diet_chart' | 'assessment' | 'meal_history' | 'diet_history' | 'allergies';

export default function PatientDietProfile() {
  const {
    admissions,
    dietCharts,
    assessments,
    mealDeliveries,
    npoPatients,
    selectedAdmissionId,
    setSelectedAdmissionId,
    setActiveTab,
    approveDietChart,
  } = useDiet();

  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>('overview');
  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const selectedAdmission = admissions.find(a => a.id === selectedAdmissionId) || activeAdmissions[0];

  if (!selectedAdmission) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <UtensilsCrossed size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>No Active Inpatient Selected</div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveTab('patient_diets')}>
          Select Inpatient from Roster
        </button>
      </div>
    );
  }

  const currentChart = dietCharts.find(c => c.admissionId === selectedAdmission.id && (c.status === 'active' || c.status === 'approved'));
  const allPatientCharts = dietCharts.filter(c => c.admissionId === selectedAdmission.id);
  const patientAssessments = assessments.filter(a => a.admissionId === selectedAdmission.id);
  const patientDeliveries = mealDeliveries.filter(m => m.admissionId === selectedAdmission.id);
  const isNPO = npoPatients.some(n => n.admissionId === selectedAdmission.id && n.status === 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Navigation & Patient Selector */}
      <div className="card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patient_diets')}>
            <ArrowLeft size={13} /> Back to Roster
          </button>
          <div style={{ borderLeft: '1px solid var(--border-muted)', paddingLeft: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>ACTIVE INPATIENT:</label>
            <select
              className="form-select"
              style={{ height: 32, fontSize: 12, minWidth: 260 }}
              value={selectedAdmission.id}
              onChange={e => setSelectedAdmissionId(e.target.value)}
            >
              {activeAdmissions.map(a => (
                <option key={a.id} value={a.id}>
                  {a.patientName} — Bed {a.bedNumber} ({a.ward})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {currentChart && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setPrintBedsideCard(currentChart)}>
                <UtensilsCrossed size={13} /> Bedside Card
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPrintChart(currentChart)}>
                <Printer size={13} /> Print Chart
              </button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={13} /> {currentChart ? 'Modify Diet' : 'Create Diet Chart'}
          </button>
        </div>
      </div>

      {/* Patient Demographic Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: isNPO ? 'rgba(255, 69, 58, 0.05)' : undefined,
          borderLeft: `5px solid ${isNPO ? 'var(--color-danger)' : 'var(--color-primary)'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg" style={{ background: isNPO ? 'var(--color-danger)' : undefined }}>
              {selectedAdmission.patientName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{selectedAdmission.patientName}</span>
                {isNPO && <span className="badge badge-danger">STRICT NPO</span>}
                {currentChart && <span className="badge badge-primary">{currentChart.dietType.toUpperCase().replace('_', ' ')}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>UHID: <strong>{selectedAdmission.patientId}</strong></span>
                <span>Gender/Age: <strong>{((selectedAdmission as any).gender || 'F').toUpperCase()}, {(selectedAdmission as any).age || 35}y</strong></span>
                <span>Bed: <strong style={{ color: 'var(--color-primary)' }}>{selectedAdmission.bedNumber} ({selectedAdmission.ward})</strong></span>
                <span>Doctor: <strong>{selectedAdmission.admittingDoctorName}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssessmentModal(true)}>
              <Scale size={13} /> Nutrition Assessment
            </button>
          </div>
        </div>
      </div>

      {/* 6-Tab Sub-Navigation */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        <button className={`tab ${activeSubTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveSubTab('overview')}>
          <User size={13} /> 1. Overview
        </button>
        <button className={`tab ${activeSubTab === 'diet_chart' ? 'active' : ''}`} onClick={() => setActiveSubTab('diet_chart')}>
          <UtensilsCrossed size={13} /> 2. Current Diet Chart
        </button>
        <button className={`tab ${activeSubTab === 'assessment' ? 'active' : ''}`} onClick={() => setActiveSubTab('assessment')}>
          <Scale size={13} /> 3. Nutrition Assessment ({patientAssessments.length})
        </button>
        <button className={`tab ${activeSubTab === 'meal_history' ? 'active' : ''}`} onClick={() => setActiveSubTab('meal_history')}>
          <ChefHat size={13} /> 4. Meal History ({patientDeliveries.length})
        </button>
        <button className={`tab ${activeSubTab === 'diet_history' ? 'active' : ''}`} onClick={() => setActiveSubTab('diet_history')}>
          <History size={13} /> 5. Diet History ({allPatientCharts.length})
        </button>
        <button className={`tab ${activeSubTab === 'allergies' ? 'active' : ''}`} onClick={() => setActiveSubTab('allergies')}>
          <ShieldAlert size={13} /> 6. Allergies & Restrictions
        </button>
      </div>

      {/* Sub-Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Admission & Clinical Information</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div><strong>Admission Date:</strong> {selectedAdmission.admissionDate}</div>
              <div><strong>Clinical Diagnoses:</strong> {selectedAdmission.diagnosis.join(', ') || 'Inpatient Observation'}</div>
              <div><strong>Attending Physician:</strong> {selectedAdmission.admittingDoctorName}</div>
              <div><strong>Location:</strong> {selectedAdmission.bedNumber} — {selectedAdmission.ward}</div>
              <div><strong>Current Diet Status:</strong> <span className="badge badge-success">{currentChart?.status.toUpperCase() || 'NO CHART'}</span></div>
              <div><strong>Assigned Dietitian:</strong> {currentChart?.dietitianName || 'Unassigned'}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Nutritional & Dietary Summary</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div><strong>Prescribed Diet:</strong> <span className="badge badge-primary">{currentChart?.dietType.toUpperCase() || 'Regular'}</span></div>
              <div><strong>Consistency / Texture:</strong> {currentChart?.dietConsistency.toUpperCase() || 'Regular Solid'}</div>
              <div><strong>Feeding Route:</strong> {currentChart?.feedingMethod.toUpperCase() || 'Oral'}</div>
              <div><strong>Estimated Calories:</strong> {currentChart?.estimatedCalories || 1800} kcal/day</div>
              <div><strong>Macronutrients:</strong> P: {currentChart?.proteinGrams || 65}g · C: {currentChart?.carbsGrams || 200}g · F: {currentChart?.fatGrams || 40}g</div>
              <div><strong>Known Food Allergies:</strong> <strong style={{ color: 'var(--color-danger)' }}>{currentChart?.allergies.join(', ') || 'Nil known'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Diet Chart */}
      {activeSubTab === 'diet_chart' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div>
              <span className="card-title">Current Inpatient Diet Chart</span>
              {currentChart && <div className="card-subtitle">Version {currentChart.version} · Approved by {currentChart.approvedBy}</div>}
            </div>
            {currentChart && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPrintChart(currentChart)}>
                  <Printer size={12} /> Print
                </button>
              </div>
            )}
          </div>

          <div className="card-body">
            {currentChart ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Macronutrient Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div className="card" style={{ padding: 12, textAlign: 'center', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>{currentChart.estimatedCalories}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Calories (kcal)</div>
                  </div>
                  <div className="card" style={{ padding: 12, textAlign: 'center', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>{currentChart.proteinGrams}g</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Protein</div>
                  </div>
                  <div className="card" style={{ padding: 12, textAlign: 'center', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-warning)' }}>{currentChart.carbsGrams}g</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Carbohydrates</div>
                  </div>
                  <div className="card" style={{ padding: 12, textAlign: 'center', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-danger)' }}>{currentChart.fatGrams}g</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Fats</div>
                  </div>
                </div>

                {/* Schedules */}
                <div style={{ fontSize: 14, fontWeight: 700 }}>Meal Schedule & Menu Items:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentChart.mealSchedules.map((slot, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong style={{ color: 'var(--color-primary)', fontSize: 13 }}>
                          {slot.scheduledTime} — {slot.mealType.toUpperCase().replace('_', ' ')}
                        </strong>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{slot.specialInstructions || 'Standard'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {slot.foodItems.map((f, i) => (
                          <span key={i} className="badge badge-primary" style={{ padding: '4px 10px' }}>
                            {f.foodName} ({f.portion})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {currentChart.specialInstructions && (
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                    <strong>Special Instructions: </strong>{currentChart.specialInstructions}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}>
                No active diet chart prescribed yet. Click "Create Diet Chart" to prescribe one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Nutrition Assessment */}
      {activeSubTab === 'assessment' && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Nutrition Assessments & Risk Stratification</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAssessmentModal(true)}>
              <Plus size={12} /> New Assessment
            </button>
          </div>
          <div className="card-body">
            {patientAssessments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {patientAssessments.map(a => (
                  <div key={a.id} style={{ background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <strong>{a.date}</strong> · Assessed by <strong>{a.dietitianName}</strong>
                      </div>
                      <span className={`badge ${a.nutritionalRisk === 'high' ? 'badge-danger' : a.nutritionalRisk === 'moderate' ? 'badge-warning' : 'badge-success'}`}>
                        {a.nutritionalRisk.toUpperCase()} RISK
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, fontSize: 12, marginBottom: 8 }}>
                      <div>Height: <strong>{a.heightCm} cm</strong></div>
                      <div>Weight: <strong>{a.weightKg} kg</strong></div>
                      <div>BMI: <strong>{a.bmi} kg/m²</strong></div>
                      <div>Appetite: <strong>{a.appetite.toUpperCase()}</strong></div>
                      <div>Feeding: <strong>{a.feedingAbility.toUpperCase()}</strong></div>
                    </div>

                    {a.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong>Notes:</strong> {a.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}>
                No clinical nutrition assessment recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Meal History */}
      {activeSubTab === 'meal_history' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Meal Delivery & Tray Tracking History</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meal Category</th>
                    <th>Scheduled Time</th>
                    <th>Delivered Time</th>
                    <th>Status</th>
                    <th>Kitchen Staff</th>
                    <th>Delivery Staff</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDeliveries.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.mealType.toUpperCase().replace('_', ' ')}</strong></td>
                      <td>{m.scheduledTime}</td>
                      <td>{m.deliveredTime || '—'}</td>
                      <td>
                        <span className={`badge ${m.status === 'served' ? 'badge-success' : m.status === 'refused' ? 'badge-danger' : 'badge-primary'}`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{m.kitchenStaff || '—'}</td>
                      <td>{m.deliveryStaff || '—'}</td>
                      <td>{m.refusalReason || m.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Diet History */}
      {activeSubTab === 'diet_history' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Historical Diet Chart Versions</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allPatientCharts.map(ch => (
                <div key={ch.id} style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <strong>Version {ch.version}</strong> — <span className="badge badge-primary">{ch.dietType.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>Created: {ch.createdAt}</span>
                    </div>
                    <span className={`badge ${ch.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{ch.status.toUpperCase()}</span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Dietitian: {ch.dietitianName} · Calories: {ch.estimatedCalories} kcal
                    {ch.modificationReason && <div style={{ color: 'var(--color-warning)', marginTop: 2 }}>Modification Reason: {ch.modificationReason}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: Allergies & Restrictions */}
      {activeSubTab === 'allergies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Food Allergies</span>
            </div>
            <div className="card-body">
              {currentChart?.allergies && currentChart.allergies.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentChart.allergies.map((al, idx) => (
                    <div key={idx} style={{ background: 'var(--color-danger-muted)', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontWeight: 700 }}>
                      ⚠️ {al}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No food allergies recorded for this patient.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Dietary Restrictions</span>
            </div>
            <div className="card-body">
              {currentChart?.restrictions && currentChart.restrictions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentChart.restrictions.map((res, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                      • {res}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No special dietary restrictions specified.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {printChart && <PrintDietChartModal chart={printChart} onClose={() => setPrintChart(null)} />}
      {printBedsideCard && <PrintBedsideDietCardModal chart={printBedsideCard} onClose={() => setPrintBedsideCard(null)} />}
      {showCreateModal && <CreateDietChartModal initialAdmissionId={selectedAdmission.id} onClose={() => setShowCreateModal(false)} />}
      {showAssessmentModal && <NutritionAssessmentModal initialAdmissionId={selectedAdmission.id} onClose={() => setShowAssessmentModal(false)} />}
    </div>
  );
}
