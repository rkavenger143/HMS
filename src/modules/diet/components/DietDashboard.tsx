import React, { useState } from 'react';
import {
  UtensilsCrossed, Users, CheckCircle2, Clock, AlertTriangle, ShieldAlert,
  ChefHat, Truck, Ban, Plus, Printer, Search, ArrowRight, Activity, Eye, FileText
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
    dietAlerts,
    npoPatients,
    setSelectedAdmissionId,
    setActiveTab,
  } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const unackAlerts = dietAlerts.filter(a => a.status === 'new');
  const activeNPOList = npoPatients.filter(n => n.status === 'active');

  const filteredAdmissions = activeAdmissions.filter(adm => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      adm.patientName.toLowerCase().includes(q) ||
      adm.patientId.toLowerCase().includes(q) ||
      adm.bedNumber.toLowerCase().includes(q) ||
      adm.admittingDoctorName.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'ALL' || adm.ward === selectedWard;
    return matchesSearch && matchesWard;
  });

  const handleOpenProfile = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Active High-Priority Alerts Callout */}
      {unackAlerts.length > 0 && (
        <div
          className="card"
          style={{
            background: 'rgba(255, 69, 58, 0.08)',
            border: '1px solid var(--color-danger)',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
            <div>
              <span style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 13 }}>
                {unackAlerts.length} Active Nutrition & Allergen Alert{unackAlerts.length > 1 ? 's' : ''}:
              </span>
              <span style={{ color: 'var(--text-primary)', marginLeft: 6, fontSize: 12 }}>
                {unackAlerts[0].message}
              </span>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('alerts')}>
            View Alert Center <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* 10 Standardized Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {/* 1. Total Inpatients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patient_diets')}>
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            <Users size={17} />
          </div>
          <div className="stat-value">{kpis.totalInpatients}</div>
          <div className="stat-label">Total Inpatients</div>
        </div>

        {/* 2. Active Diet Charts */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patient_diets')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <UtensilsCrossed size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.patientsWithDiet}</div>
          <div className="stat-label">Active Diet Charts</div>
        </div>

        {/* 3. Pending Diet Orders */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('doctor_orders')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.dietPendingApproval}</div>
          <div className="stat-label">Pending Diet Orders</div>
        </div>

        {/* 4. Approved Diet Charts */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patient_diets')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} />
          </div>
          <div className="stat-value">{kpis.dietApproved}</div>
          <div className="stat-label">Approved Diet Charts</div>
        </div>

        {/* 5. Diet Changes */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('diet_history')}>
          <div className="stat-icon" style={{ background: 'rgba(10,132,255,0.1)', color: 'var(--color-primary)' }}>
            <Activity size={17} />
          </div>
          <div className="stat-value">{kpis.dietChangesToday}</div>
          <div className="stat-label">Diet Changes</div>
        </div>

        {/* 6. Special Diet Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('patient_diets')}>
          <div className="stat-icon" style={{ background: 'rgba(255,159,10,0.1)', color: 'var(--color-warning)' }}>
            <ChefHat size={17} />
          </div>
          <div className="stat-value">{kpis.specialDietCount}</div>
          <div className="stat-label">Special Diet Patients</div>
        </div>

        {/* 7. Allergy Alerts */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('allergies_restrictions')}>
          <div className="stat-icon" style={{ background: 'rgba(255,69,58,0.1)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{kpis.allergyCount}</div>
          <div className="stat-label">Allergy Alerts</div>
        </div>

        {/* 8. NPO Patients */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('npo_management')}>
          <div className="stat-icon" style={{ background: 'rgba(255,69,58,0.1)', color: 'var(--color-danger)' }}>
            <Ban size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{activeNPOList.length}</div>
          <div className="stat-label">NPO Patients</div>
        </div>

        {/* 9. Meals Pending */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('daily_meal_plans')}>
          <div className="stat-icon" style={{ background: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}>
            <Clock size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{kpis.mealsPending}</div>
          <div className="stat-label">Meals Pending</div>
        </div>

        {/* 10. Meals Served */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('meal_delivery')}>
          <div className="stat-icon" style={{ background: 'rgba(50,215,75,0.1)', color: 'var(--color-success)' }}>
            <Truck size={17} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{kpis.mealsServed}</div>
          <div className="stat-label">Meals Served</div>
        </div>
      </div>

      {/* Active Inpatients Diet Roster */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span className="card-title">Inpatient Nutrition Roster & Diet Allocation</span>
              <div className="card-subtitle">Active diet charts, calorie targets, allergies & kitchen orders</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('daily_meal_plans')}>
              Kitchen Schedule
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={13} /> Create Diet Chart
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & UHID</th>
                  <th>Location (Ward & Bed)</th>
                  <th>Attending Doctor</th>
                  <th>Active Diet Type</th>
                  <th>Calories</th>
                  <th>Allergies / Restrictions</th>
                  <th>Diet Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(adm => {
                  const chart = dietCharts.find(c => c.admissionId === adm.id);
                  const isNPO = chart?.dietConsistency === 'npo' || chart?.feedingMethod === 'npo';

                  return (
                    <tr key={adm.id}>
                      {/* Patient Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {adm.patientName[0]}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 13 }}
                              onClick={() => handleOpenProfile(adm.id)}
                            >
                              {adm.patientName}
                            </div>
                            <div className="patient-id" style={{ fontSize: 10 }}>{adm.patientId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          <span className="badge badge-primary">{adm.bedNumber}</span> {adm.ward}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{adm.admittingDoctorName}</div>
                      </td>

                      {/* Active Diet Type */}
                      <td>
                        {chart ? (
                          <span className={`badge ${isNPO ? 'badge-danger' : 'badge-primary'}`} style={{ fontWeight: 700 }}>
                            {chart.dietType.toUpperCase().replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="badge badge-warning">Needs Assessment</span>
                        )}
                      </td>

                      {/* Calorie Target */}
                      <td>
                        {chart?.estimatedCalories ? (
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{chart.estimatedCalories} kcal</div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>—</span>
                        )}
                      </td>

                      {/* Allergies */}
                      <td>
                        {chart?.allergies && chart.allergies.length > 0 ? (
                          <span className="badge badge-danger" style={{ fontSize: 10 }}>
                            {chart.allergies.join(', ')}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>NKDA</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${chart?.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                          {chart?.status ? chart.status.toUpperCase() : 'PENDING'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleOpenProfile(adm.id)}
                          >
                            View Chart
                          </button>
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
      {showCreateModal && (
        <CreateDietChartModal
          initialAdmissionId={admissions[0]?.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
