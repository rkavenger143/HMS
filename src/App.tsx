import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './modules/auth/LoginPage';

// Lazy module imports
import Dashboard from './modules/dashboard/Dashboard';
import AIAssistant from './modules/ai/AIAssistant';
import PatientsModule from './modules/patients/PatientsModule';
import AppointmentsModule from './modules/appointments/AppointmentsModule';
import OPDModule from './modules/opd/OPDModule';
import IPDModule from './modules/ipd/IPDModule';
import NursingModule from './modules/nursing/NursingModule';
import LaboratoryModule from './modules/laboratory/LaboratoryModule';
import RadiologyModule from './modules/radiology/RadiologyModule';
import PharmacyModule from './modules/pharmacy/PharmacyModule';
import BillingModule from './modules/billing/BillingModule';
import DoctorsModule from './modules/doctors/DoctorsModule';
import AmbulanceModule from './modules/ambulance/AmbulanceModule';
import BloodBankModule from './modules/blood-bank/BloodBankModule';
import ReportsModule from './modules/reports/ReportsModule';
import AdminPanel from './modules/admin/AdminPanel';
import SettingsModule from './modules/settings/SettingsModule';
import DietModule from './modules/diet/DietModule';
import PatientPortal from './modules/portal/PatientPortal';

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
          width: 52, height: 52, background: 'linear-gradient(135deg, #0A84FF, #00D4AA)',
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(10,132,255,0.4)'
        }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M13 11H15V13H17V15H15V17H13V15H11V13H13V11Z" fill="white" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>ALN Cure HMS</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Loading...</div>
        </div>
        <div className="spin" style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  const isPatient = state.user?.role === 'patient';

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="main-area">
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="main-content">
          {isPatient ? (
            <Routes>
              <Route path="/" element={<Navigate to="/portal" replace />} />
              <Route path="/portal" element={<PatientPortal />} />
              <Route path="/portal/*" element={<PatientPortal />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/patients" element={<PatientsModule />} />
              <Route path="/patients/:id" element={<PatientsModule />} />
              <Route path="/appointments" element={<AppointmentsModule />} />
              <Route path="/opd" element={<OPDModule />} />
              <Route path="/ipd" element={<IPDModule />} />
              <Route path="/nursing" element={<NursingModule />} />
              <Route path="/laboratory" element={<LaboratoryModule />} />
              <Route path="/radiology" element={<RadiologyModule />} />
              <Route path="/pharmacy" element={<PharmacyModule />} />
              <Route path="/billing" element={<BillingModule />} />
              <Route path="/doctors" element={<DoctorsModule />} />
              <Route path="/ambulance" element={<AmbulanceModule />} />
              <Route path="/blood-bank" element={<BloodBankModule />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/diet" element={<DietModule />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/settings" element={<SettingsModule />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          )}
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
