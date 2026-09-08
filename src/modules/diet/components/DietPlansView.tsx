import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Scale,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Edit,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import CreateDietChartModal from './modals/CreateDietChartModal';
import NutritionAssessmentModal from './modals/NutritionAssessmentModal';
import PrintDietChartModal from './modals/PrintDietChartModal';
import PrintBedsideDietCardModal from './modals/PrintBedsideDietCardModal';
import type { ComprehensiveDietChart, NutritionAssessmentRecord } from '../../../types';

export default function DietPlansView() {
  const {
    admissions,
    dietCharts,
    assessments,
    selectedAdmissionId,
    setSelectedAdmissionId,
    setActiveTab,
    modifyDietChart,
  } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAdmForAction, setSelectedAdmForAction] = useState<string | undefined>(undefined);
  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);

  // Active admissions
  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const activeSelectedAdm = activeAdmissions.find(a => a.id === selectedAdmissionId) || activeAdmissions[0];

  const currentChart = dietCharts.find(c => c.admissionId === activeSelectedAdm?.id && c.status === 'active');
  const patientAssessment = assessments.find(a => a.admissionId === activeSelectedAdm?.id);

  const filteredAdmissions = activeAdmissions.filter(adm => {
    const q = search.toLowerCase();
    const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
    const matchesSearch =
      !search ||
      adm.patientName.toLowerCase().includes(q) ||
      adm.patientId.toLowerCase().includes(q) ||
      adm.bedNumber.toLowerCase().includes(q) ||
      adm.admittingDoctorName.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'ALL' || adm.ward === selectedWard;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (chart ? chart.status === selectedStatus : selectedStatus === 'no_plan');

    return matchesSearch && matchesWard && matchesStatus;
  });

  const handleOpenDailyChart = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('daily_diet_chart');
  };

  const handleOpenNewAssessment = (admId: string) => {
    setSelectedAdmForAction(admId);
    setShowAssessmentModal(true);
  };

  const handleOpenNewPlan = (admId: string) => {
    setSelectedAdmForAction(admId);
    setShowCreateModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Patient Assessment & Summary Banner */}
      {activeSelectedAdm && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderLeft: '5px solid var(--color-primary)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{activeSelectedAdm.patientName}</span>
                <span className="badge badge-primary">{activeSelectedAdm.bedNumber} ({activeSelectedAdm.ward})</span>
                {currentChart ? (
                  <span className="badge badge-success">{currentChart.dietType.toUpperCase().replace('_', ' ')}</span>
                ) : (
                  <span className="badge badge-warning">Needs Diet Plan</span>
                )}
              </div>

              {/* Assessment Metrics Line */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>UHID: <strong style={{ color: 'var(--text-primary)' }}>{activeSelectedAdm.patientId}</strong></span>
                <span>Doctor: <strong style={{ color: 'var(--text-primary)' }}>{activeSelectedAdm.admittingDoctorName}</strong></span>
                <span>Diagnosis: <strong style={{ color: 'var(--text-primary)' }}>{activeSelectedAdm.diagnosis[0] || 'Clinical Care'}</strong></span>
                {patientAssessment && (
                  <>
                    <span>Height: <strong style={{ color: 'var(--text-primary)' }}>{patientAssessment.heightCm} cm</strong></span>
                    <span>Weight: <strong style={{ color: 'var(--text-primary)' }}>{patientAssessment.weightKg} kg</strong></span>
                    <span>BMI: <strong style={{ color: 'var(--color-primary)' }}>{patientAssessment.bmi} kg/m²</strong></span>
                    <span>Nutritional Risk: <strong style={{ color: patientAssessment.nutritionalRisk === 'high' ? 'var(--color-danger)' : 'var(--color-success)' }}>{patientAssessment.nutritionalRisk.toUpperCase()}</strong></span>
                  </>
                )}
              </div>

              {/* Allergies & Restrictions */}
              <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                {currentChart?.allergies && currentChart.allergies.length > 0 ? (
                  <span className="badge badge-danger" style={{ fontSize: 11 }}>
                    ⚠️ Allergies: {currentChart.allergies.join(', ')}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>No known food allergies</span>
                )}

                {currentChart?.restrictions && currentChart.restrictions.length > 0 && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    <strong>Restrictions:</strong> {currentChart.restrictions.join(', ')}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenNewAssessment(activeSelectedAdm.id)}>
                <Scale size={13} /> {patientAssessment ? 'Update Assessment' : 'New Assessment'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenNewPlan(activeSelectedAdm.id)}>
                <Plus size={13} /> {currentChart ? 'Modify Diet Plan' : 'Create Diet Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Name, UHID, Bed #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Wards ({activeAdmissions.length})</option>
            <option value="General Ward A">General Ward A</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Private Ward">Private Ward</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Plan Statuses</option>
            <option value="active">Active Plans</option>
            <option value="draft">Draft Plans</option>
            <option value="modified">Modified Plans</option>
            <option value="completed">Completed Plans</option>
            <option value="no_plan">No Diet Plan</option>
          </select>

          <button className="btn btn-primary btn-sm" style={{ justifySelf: 'end' }} onClick={() => handleOpenNewPlan(activeAdmissions[0]?.id)}>
            <Plus size={13} /> New Diet Plan
          </button>
        </div>
      </div>

      {/* Diet Plans Master Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Inpatient Diet Plans & Clinical Assessment Status</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Demographics</th>
                  <th>Ward & Bed</th>
                  <th>Assessment / BMI</th>
                  <th>Diet Plan & Calories</th>
                  <th>Dietitian</th>
                  <th>Start / Review Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(adm => {
                  const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
                  const asm = assessments.find(a => a.admissionId === adm.id);

                  return (
                    <tr
                      key={adm.id}
                      style={{ background: adm.id === activeSelectedAdm?.id ? 'var(--bg-surface)' : undefined }}
                    >
                      {/* Patient */}
                      <td>
                        <div
                          style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }}
                          onClick={() => setSelectedAdmissionId(adm.id)}
                        >
                          {adm.patientName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          UHID: {adm.patientId} · {adm.admittingDoctorName}
                        </div>
                      </td>

                      {/* Ward & Bed */}
                      <td>
                        <span className="badge badge-primary">{adm.bedNumber}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adm.ward}</div>
                      </td>

                      {/* Assessment */}
                      <td>
                        {asm ? (
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{asm.bmi} BMI</span> ({asm.weightKg}kg)
                            <div style={{ fontSize: 11, color: asm.nutritionalRisk === 'high' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {asm.nutritionalRisk.toUpperCase()} RISK
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={() => handleOpenNewAssessment(adm.id)}
                          >
                            + Assess
                          </button>
                        )}
                      </td>

                      {/* Diet Plan */}
                      <td>
                        {chart ? (
                          <div>
                            <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                              {chart.dietType.toUpperCase().replace('_', ' ')}
                            </span>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              {chart.estimatedCalories} kcal · {chart.dietConsistency}
                            </div>
                          </div>
                        ) : (
                          <span className="badge badge-warning">No Plan Prescribed</span>
                        )}
                      </td>

                      {/* Dietitian */}
                      <td>
                        <div style={{ fontSize: 12 }}>{chart?.dietitianName || 'Unassigned'}</div>
                      </td>

                      {/* Dates */}
                      <td>
                        <div style={{ fontSize: 11 }}>
                          Start: <strong>{chart?.startDate || chart?.createdAt.slice(0, 10) || '—'}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Review: <strong>{chart?.reviewDate || 'In 7 Days'}</strong>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${chart?.status === 'active' ? 'badge-success' : chart?.status === 'draft' ? 'badge-warning' : 'badge-neutral'}`}>
                          {chart?.status ? chart.status.toUpperCase() : 'PENDING'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {chart ? (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => handleOpenDailyChart(adm.id)}
                              >
                                Daily Chart
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Bedside Card"
                                onClick={() => setPrintBedsideCard(chart)}
                              >
                                <UtensilsCrossed size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Diet Chart"
                                onClick={() => setPrintChart(chart)}
                              >
                                <Printer size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 10px', fontSize: 11 }}
                              onClick={() => handleOpenNewPlan(adm.id)}
                            >
                              <Plus size={11} /> Prescribe
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssessmentModal && (
        <NutritionAssessmentModal
          initialAdmissionId={selectedAdmForAction || activeSelectedAdm?.id}
          onClose={() => setShowAssessmentModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateDietChartModal
          initialAdmissionId={selectedAdmForAction || activeSelectedAdm?.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {printChart && <PrintDietChartModal chart={printChart} onClose={() => setPrintChart(null)} />}
      {printBedsideCard && <PrintBedsideDietCardModal chart={printBedsideCard} onClose={() => setPrintBedsideCard(null)} />}
    </div>
  );
}
