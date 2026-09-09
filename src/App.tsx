import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './modules/auth/LoginPage';

// Module imports
import Dashboard from './modules/dashboard/Dashboard';
import AIAssistant from './modules/ai/AIAssistant';
import PatientsModule from './modules/patients/PatientsModule';
import AppointmentsModule from './modules/appointments/AppointmentsModule';
import OPDModule from './modules/opd/OPDModule';
import EmergencyModule from './modules/emergency/EmergencyModule';
import IPDModule from './modules/ipd/IPDModule';
import DoctorsModule from './modules/doctors/DoctorsModule';
import NursingModule from './modules/nursing/NursingModule';
import LaboratoryModule from './modules/laboratory/LaboratoryModule';
import RadiologyModule from './modules/radiology/RadiologyModule';
import DiagnosticsModule from './modules/diagnostics/DiagnosticsModule';
import PharmacyModule from './modules/pharmacy/PharmacyModule';
import DietModule from './modules/diet/DietModule';
import BillingModule from './modules/billing/BillingModule';
import InsuranceModule from './modules/insurance/InsuranceModule';
import AmbulanceModule from './modules/ambulance/AmbulanceModule';
import BloodBankModule from './modules/blood-bank/BloodBankModule';
import HousekeepingModule from './modules/housekeeping/HousekeepingModule';
import HRModule from './modules/hr/HRModule';
import SupportDeskModule from './modules/support/SupportDeskModule';
import ReportsModule from './modules/reports/ReportsModule';
import NotificationsModule from './modules/notifications/NotificationsModule';
import AdminPanel from './modules/admin/AdminPanel';
import SettingsModule from './modules/settings/SettingsModule';
function AppLayout() {
  const { state } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (state.isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--bg-base)'
      }}>
        <div style={{
          width: 52, height: 52, background: 'linear-gradient(135deg, #1e40af, #2563eb)',
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(37,99,235,0.3)'
        }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M13 11H15V13H17V15H15V17H13V15H11V13H13V11Z" fill="white" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a8a' }}>ALN Cure HMS</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Loading Hospital Suite...</div>
        </div>
        <div className="spin" style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTopColor: '#2563eb', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="main-area">
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* 1. Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai" element={<AIAssistant />} />

            {/* 2. Patients */}
            <Route path="/patients" element={<PatientsModule />} />
            <Route path="/patients/:id" element={<PatientsModule />} />

            {/* 3. Appointments */}
            <Route path="/appointments" element={<AppointmentsModule />} />

            {/* 4. OPD */}
            <Route path="/opd" element={<OPDModule />} />

            {/* 5. Emergency */}
            <Route path="/emergency" element={<EmergencyModule />} />

            {/* 6. IPD & Beds */}
            <Route path="/ipd" element={<IPDModule />} />

            {/* 7. Doctors */}
            <Route path="/doctors" element={<DoctorsModule />} />

            {/* 8. Nursing */}
            <Route path="/nursing" element={<NursingModule />} />

            {/* 9. Laboratory (Dedicated LIS) */}
            <Route path="/laboratory" element={<LaboratoryModule />} />

            {/* 10. Diagnostics & Radiology (Dedicated RIS) */}
            <Route path="/radiology" element={<RadiologyModule />} />
            <Route path="/diagnostics" element={<DiagnosticsModule />} />

            {/* 11. Pharmacy */}
            <Route path="/pharmacy" element={<PharmacyModule />} />

            {/* 12. Diet & Nutrition */}
            <Route path="/diet" element={<DietModule />} />

            {/* 13. Billing & Finance */}
            <Route path="/billing" element={<BillingModule />} />

            {/* 14. Insurance */}
            <Route path="/insurance" element={<InsuranceModule />} />
            <Route path="/insurance/*" element={<InsuranceModule />} />

            {/* 15. Ambulance */}
            <Route path="/ambulance" element={<AmbulanceModule />} />

            {/* 16. Blood Bank */}
            <Route path="/blood-bank" element={<BloodBankModule />} />

            {/* 17. Housekeeping & Facilities */}
            <Route path="/housekeeping" element={<HousekeepingModule />} />

            {/* 18. HR & Employees */}
            <Route path="/hr" element={<HRModule />} />

            {/* 19. Help & Support Desk */}
            <Route path="/support" element={<SupportDeskModule />} />

            {/* 20. Reports */}
            <Route path="/reports" element={<ReportsModule />} />

            {/* 21. Notifications */}
            <Route path="/notifications" element={<NotificationsModule />} />

            {/* 22. Administration / Settings */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/settings" element={<SettingsModule />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
