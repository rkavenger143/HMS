import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ChefHat,
  Apple,
  FileText,
  Activity,
  History,
  BarChart3,
  Search,
  Plus,
} from 'lucide-react';
import { DietProvider, useDiet, DietTab } from './context/DietContext';
import DietDashboard from './components/DietDashboard';
import DietPlansView from './components/DietPlansView';
import DailyDietChartView from './components/DailyDietChartView';
import MealScheduleView from './components/MealScheduleView';
import FoodDatabaseView from './components/FoodDatabaseView';
import SpecialDietsView from './components/SpecialDietsView';
import DietMonitoringView from './components/DietMonitoringView';
import DietReviewHistoryView from './components/DietReviewHistoryView';
import DietReportsView from './components/DietReportsView';
import DietSearchModal from './components/DietSearchModal';
import CreateDietChartModal from './components/modals/CreateDietChartModal';

function DietModuleContent() {
  const {
    activeTab,
    setActiveTab,
    kpis,
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

  // 9 Clean Logical Hospital Navigation Tabs in Exact Order
  const NAV_TABS = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'diet_plans', label: '2. Diet Plans', icon: <Users size={14} />, badge: kpis.activeDietPlans },
    { id: 'daily_diet_chart', label: '3. Daily Diet Chart', icon: <UtensilsCrossed size={14} /> },
    { id: 'meal_schedule', label: '4. Meal Schedule & Status', icon: <ChefHat size={14} />, badge: kpis.pendingMeals > 0 ? kpis.pendingMeals : undefined },
    { id: 'diet_monitoring', label: '5. Diet Monitoring', icon: <Activity size={14} />, badge: kpis.missedMeals > 0 ? kpis.missedMeals : undefined },
    { id: 'food_database', label: '6. Food Database', icon: <Apple size={14} /> },
    { id: 'special_diets', label: '7. Special Diets', icon: <FileText size={14} />, badge: kpis.specialDietPatients },
    { id: 'diet_review_history', label: '8. Diet Review & History', icon: <History size={14} /> },
    { id: 'reports', label: '9. Reports', icon: <BarChart3 size={14} /> },
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
          <div className="page-title">Diet Charts & Nutrition Management</div>
          <div className="page-subtitle">
            Patient Assessment → Diet Plan → Daily Diet Chart → Meal Schedule → Meal Delivery/Status → Diet Monitoring → Diet Review → Diet History → Reports
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Universal Quick Search */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(true)}
            title="Press Ctrl+K to search anytime"
          >
            <Search size={14} /> Quick Search <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>Ctrl+K</kbd>
          </button>

          {/* Create Diet Plan CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} /> Prescribe Diet Plan
          </button>
        </div>
      </div>

      {/* 9-Tab Navigation Bar */}
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
                      background: isActive ? 'white' : 'var(--color-primary-muted)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-primary)',
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
        {activeTab === 'diet_plans' && <DietPlansView />}
        {activeTab === 'daily_diet_chart' && <DailyDietChartView />}
        {activeTab === 'meal_schedule' && <MealScheduleView />}
        {activeTab === 'diet_monitoring' && <DietMonitoringView />}
        {activeTab === 'food_database' && <FoodDatabaseView />}
        {activeTab === 'special_diets' && <SpecialDietsView />}
        {activeTab === 'diet_review_history' && <DietReviewHistoryView />}
        {activeTab === 'reports' && <DietReportsView />}
      </div>

      {/* Universal Search Modal */}
      {showSearchModal && (
        <DietSearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {/* Prescribe Diet Chart Modal */}
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
