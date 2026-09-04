import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed, LayoutDashboard, Users, User, Scale, Stethoscope,
  ChefHat, Truck, AlertCircle, Ban, Apple, ShieldAlert, History,
  UserCheck, Bell, BarChart3, FileText, Settings, Search, Plus
} from 'lucide-react';
import { DietProvider, useDiet, DietTab } from './context/DietContext';
import DietDashboard from './components/DietDashboard';
import PatientDietList from './components/PatientDietList';
import PatientDietProfile from './components/PatientDietProfile';
import NutritionAssessmentView from './components/NutritionAssessmentView';
import DoctorDietOrders from './components/DoctorDietOrders';
import DailyMealPlans from './components/DailyMealPlans';
import KitchenService from './components/KitchenService';
import MealDeliveryTracker from './components/MealDeliveryTracker';
import MealRefusalLog from './components/MealRefusalLog';
import NPOManagement from './components/NPOManagement';
import FoodItemMaster from './components/FoodItemMaster';
import AllergiesRestrictions from './components/AllergiesRestrictions';
import DietHistoryAudit from './components/DietHistoryAudit';
import DietitianManagement from './components/DietitianManagement';
import DietAlertCenter from './components/DietAlertCenter';
import DietAnalytics from './components/DietAnalytics';
import DietReports from './components/DietReports';
import DietSettings from './components/DietSettings';
import DietSearchModal from './components/DietSearchModal';
import CreateDietChartModal from './components/modals/CreateDietChartModal';

function DietModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
    dietAlerts,
    npoPatients,
    doctorOrders,
    admissions,
  } = useDiet();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unackAlerts = dietAlerts.filter(a => a.status === 'new').length;
  const activeNPO = npoPatients.filter(n => n.status === 'active').length;
  const newDoctorOrders = doctorOrders.filter(o => o.status === 'new').length;

  const NAV_TABS = [
    { id: 'dashboard', label: '1. Diet Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'patient_diets', label: '2. Patient Diet Charts', icon: <Users size={14} />, badge: kpis.patientsWithDiet },
    { id: 'patient_profile', label: '3. Patient Nutrition Profile', icon: <User size={14} /> },
    { id: 'doctor_orders', label: '4. Diet Orders', icon: <Stethoscope size={14} />, badge: newDoctorOrders > 0 ? newDoctorOrders : undefined },
    { id: 'daily_meal_plans', label: '5. Meal Schedule', icon: <ChefHat size={14} /> },
    { id: 'npo_management', label: '6. NPO Patients', icon: <Ban size={14} />, badge: activeNPO > 0 ? activeNPO : undefined },
    { id: 'allergies_restrictions', label: '7. Allergies & Restrictions', icon: <ShieldAlert size={14} /> },
    { id: 'nutrition_assessment', label: '8. Nutrition Assessment', icon: <Scale size={14} /> },
    { id: 'meal_delivery', label: '9. Meal Status & Delivery', icon: <Truck size={14} /> },
    { id: 'food_items', label: '10. Food Master', icon: <Apple size={14} /> },
    { id: 'dietitian_management', label: '11. Dietitians', icon: <UserCheck size={14} /> },
    { id: 'diet_history', label: '12. Diet History', icon: <History size={14} /> },
    { id: 'reports', label: '13. Diet Reports', icon: <BarChart3 size={14} /> },
    { id: 'settings', label: '14. Diet Settings', icon: <Settings size={14} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Clinical Care</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Diet Charts</span>
          </div>
          <div className="page-title">Diet Charts & Clinical Nutrition Management</div>
          <div className="page-subtitle">
            Hospital nutrition workflow: Diet Assessment → Diet Order → Allergy Check → Chart Creation → Approval → Kitchen Schedule → Meal Delivery
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Quick Search Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Search Nutrition <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Active NPO Callout Badge */}
          {activeNPO > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('npo_management')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Ban size={13} /> {activeNPO} NPO Patient{activeNPO > 1 ? 's' : ''}
            </button>
          )}

          {/* Live Alert Badge */}
          {unackAlerts > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setActiveTab('alerts')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bell size={13} /> {unackAlerts} Nutrition Alert{unackAlerts > 1 ? 's' : ''}
            </button>
          )}

          {/* Prescribe Diet Chart CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} /> Prescribe Diet Chart
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar (Scrollable with Badges) */}
      <div
        className="card"
        style={{
          padding: '6px',
          marginBottom: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DietTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? 'white' : 'var(--color-warning)',
                      color: isActive ? 'var(--color-primary)' : 'var(--text-inverse)',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'dashboard' && <DietDashboard />}
        {activeTab === 'patient_diets' && <PatientDietList />}
        {activeTab === 'patient_profile' && <PatientDietProfile />}
        {activeTab === 'nutrition_assessment' && <NutritionAssessmentView />}
        {activeTab === 'doctor_orders' && <DoctorDietOrders />}
        {activeTab === 'daily_meal_plans' && <DailyMealPlans />}
        {activeTab === 'kitchen_service' && <KitchenService />}
        {activeTab === 'meal_delivery' && <MealDeliveryTracker />}
        {activeTab === 'meal_refusals' && <MealRefusalLog />}
        {activeTab === 'npo_management' && <NPOManagement />}
        {activeTab === 'food_items' && <FoodItemMaster />}
        {activeTab === 'allergies_restrictions' && <AllergiesRestrictions />}
        {activeTab === 'diet_history' && <DietHistoryAudit />}
        {activeTab === 'dietitian_management' && <DietitianManagement />}
        {activeTab === 'alerts' && <DietAlertCenter />}
        {activeTab === 'analytics' && <DietAnalytics />}
        {activeTab === 'reports' && <DietReports />}
        {activeTab === 'settings' && <DietSettings />}
      </div>

      {/* Modals */}
      {showSearchModal && (
        <DietSearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {showCreateModal && (
        <CreateDietChartModal
          initialAdmissionId={admissions[0]?.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default function DietModule() {
  return (
    <DietProvider>
      <DietModuleContent />
    </DietProvider>
  );
}
