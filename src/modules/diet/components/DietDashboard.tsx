import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  AlertCircle,
  ChefHat,
  UserCheck,
  Plus,
  Printer,
  Search,
  ArrowRight,
  Eye,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  XCircle,
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import PrintBedsideDietCardModal from './modals/PrintBedsideDietCardModal';
import CreateDietChartModal from './modals/CreateDietChartModal';
import type { ComprehensiveDietChart } from '../../../types';

export default function DietDashboard() {
  const {
    kpis,
    admissions,
    dietCharts,
    mealDeliveries,
    doctorOrders,
    assessments,
    setSelectedAdmissionId,
    setActiveTab,
  } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAdmId, setCreateAdmId] = useState<string | undefined>(undefined);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  // Filter admissions
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
    return matchesSearch && matchesWard;
  });

  // Patients requiring review list
  const reviewPatients = activeAdmissions.filter(adm => {
    const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
    const hasNewOrder = doctorOrders.some(o => o.admissionId === adm.id && o.status === 'new');
    const hasAssessment = assessments.some(a => a.admissionId === adm.id);
    return !chart || hasNewOrder || !hasAssessment;
  });

  const handleOpenDietPlan = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('diet_plans');
  };

  const handleOpenDailyChart = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('daily_diet_chart');
  };

  const handlePrescribe = (admId?: string) => {
    setCreateAdmId(admId || activeAdmissions[0]?.id);
    setShowCreateModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 6 Essential Required KPI Cards in Clean Spaced Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {/* 1. Active Diet Plans */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-primary)' }}
          onClick={() => setActiveTab('diet_plans')}
        >
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <UtensilsCrossed size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {kpis.activeDietPlans}
          </div>
          <div className="stat-label">Active Diet Plans</div>
        </div>

        {/* 2. Today's Scheduled Meals */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-success)' }}
          onClick={() => setActiveTab('meal_schedule')}
        >
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.12)', color: 'var(--color-success)' }}>
            <ChefHat size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {kpis.todayScheduledMeals}
          </div>
          <div className="stat-label">Today's Scheduled Meals</div>
        </div>

        {/* 3. Pending Meals */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-warning)' }}
          onClick={() => setActiveTab('meal_schedule')}
        >
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {kpis.pendingMeals}
          </div>
          <div className="stat-label">Pending Meals</div>
        </div>

        {/* 4. Missed Meals */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444' }}
          onClick={() => setActiveTab('diet_monitoring')}
        >
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {kpis.missedMeals}
          </div>
          <div className="stat-label">Missed Meals</div>
        </div>

        {/* 5. Special Diet Patients */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}
          onClick={() => setActiveTab('special_diets')}
        >
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            <FileText size={20} />
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {kpis.specialDietPatients}
          </div>
          <div className="stat-label">Special Diet Patients</div>
        </div>

        {/* 6. Patients Requiring Diet Review */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: '4px solid #f97316' }}
          onClick={() => setActiveTab('diet_plans')}
        >
          <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-value" style={{ color: '#f97316' }}>
            {kpis.patientsRequiringReview}
          </div>
          <div className="stat-label">Patients Requiring Review</div>
        </div>
      </div>

      {/* 2-Column Action & Summary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Today's Meal Service Status */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChefHat size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Today's Meal Service Status</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('meal_schedule')}>
              Meal Workflow <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-warning)' }}>
                  {mealDeliveries.filter(m => m.status === 'scheduled' || m.status === 'pending' || m.status === 'preparing').length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>In Preparation</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {mealDeliveries.filter(m => m.status === 'ready' || m.status === 'delivered').length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Dispatched / Delivered</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)' }}>
                  {mealDeliveries.filter(m => m.status === 'consumed' || m.status === 'served').length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Consumed</div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live hospital meal schedule is synchronized with active inpatient diet charts.</span>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('diet_monitoring')}>
                Record Intake
              </button>
            </div>
          </div>
        </div>

        {/* Patients Requiring Review List */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={16} style={{ color: '#f97316' }} />
              <span className="card-title">Patients Requiring Diet Review</span>
            </div>
            <span className="badge badge-warning">{reviewPatients.length} Actions</span>
          </div>
          <div className="card-body" style={{ padding: '8px 16px' }}>
            {reviewPatients.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reviewPatients.slice(0, 3).map(adm => {
                  const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
                  const hasAssessment = assessments.some(a => a.admissionId === adm.id);

                  return (
                    <div
                      key={adm.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                          {adm.patientName}{' '}
                          <span className="badge badge-primary" style={{ fontSize: 10 }}>
                            {adm.bedNumber}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {!chart ? '⚠️ No active diet plan' : !hasAssessment ? '⚠️ Needs Nutrition Assessment' : '⚠️ Diet review due'}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: 11 }}
                        onClick={() => handleOpenDietPlan(adm.id)}
                      >
                        Review Plan
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-success)', fontSize: 13 }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                All active inpatients have up-to-date diet plans and assessments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inpatient Diet Allocation Roster */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Inpatient Diet Roster & Plans</span>
              <div className="card-subtitle">Active inpatient diet plans, calories, food allergies & status</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search Patient, Bed #..."
                style={{ paddingLeft: 32, height: 32, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ height: 32, fontSize: 12, width: 140 }}
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
            >
              <option value="ALL">All Wards</option>
              <option value="General Ward A">General Ward A</option>
              <option value="Medical ICU">Medical ICU</option>
              <option value="Private Ward">Private Ward</option>
            </select>

            <button className="btn btn-primary btn-sm" onClick={() => handlePrescribe()}>
              <Plus size={13} /> Create Diet Plan
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Diet Classification</th>
                  <th>Calories & Consistency</th>
                  <th>Food Allergies & Restrictions</th>
                  <th>Diet Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(adm => {
                  const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');

                  return (
                    <tr key={adm.id}>
                      {/* Patient Details */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }} onClick={() => handleOpenDailyChart(adm.id)}>
                          {adm.patientName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          UHID: {adm.patientId} · {adm.admittingDoctorName}
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="badge badge-primary">{adm.bedNumber}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adm.ward}</div>
                      </td>

                      {/* Diet Type */}
                      <td>
                        {chart ? (
                          <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                            {chart.dietType.toUpperCase().replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="badge badge-warning">Needs Assessment</span>
                        )}
                      </td>

                      {/* Calories & Consistency */}
                      <td>
                        {chart ? (
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{chart.estimatedCalories} kcal</span>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{chart.dietConsistency} · {chart.feedingMethod}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</span>
                        )}
                      </td>

                      {/* Allergies */}
                      <td>
                        {chart?.allergies && chart.allergies.length > 0 ? (
                          <span className="badge badge-danger" style={{ fontSize: 10 }}>
                            ⚠️ {chart.allergies.join(', ')}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No known allergies</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${chart?.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                          {chart?.status ? chart.status.toUpperCase() : 'NO PLAN'}
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
                                title="View Daily Diet Chart"
                                onClick={() => handleOpenDailyChart(adm.id)}
                              >
                                Daily Chart
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Bedside Tray Card"
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
                              onClick={() => handlePrescribe(adm.id)}
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
      {printChart && <PrintDietChartModal chart={printChart} onClose={() => setPrintChart(null)} />}
      {printBedsideCard && <PrintBedsideDietCardModal chart={printBedsideCard} onClose={() => setPrintBedsideCard(null)} />}
      {showCreateModal && (
        <CreateDietChartModal
          initialAdmissionId={createAdmId}
          onClose={() => {
            setShowCreateModal(false);
            setCreateAdmId(undefined);
          }}
        />
      )}
    </div>
  );
}
