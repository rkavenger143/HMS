import React, { useState } from 'react';
import {
  Stethoscope, LayoutDashboard, UserRound, Clock, Calendar,
  Users, BedDouble, FileText, Activity, Settings, Plus, Search
} from 'lucide-react';
import { DoctorProvider, useDoctor, DoctorTab } from './context/DoctorContext';
import { BillingProvider } from '../billing/context/BillingContext';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorDirectory from './components/DoctorDirectory';
import DoctorScheduleAvailability from './components/DoctorScheduleAvailability';
import DoctorLeaveManagement from './components/DoctorLeaveManagement';
import DoctorOPDQueue from './components/DoctorOPDQueue';
import DoctorConsultationDesk from './components/DoctorConsultationDesk';
import DoctorIPDRounds from './components/DoctorIPDRounds';
import DoctorPatientHistory from './components/DoctorPatientHistory';
import DoctorReports from './components/DoctorReports';
import DoctorSettings from './components/DoctorSettings';
import AddEditDoctorModal from './components/modals/AddEditDoctorModal';

function DoctorsModuleContent() {
  const { activeTab, setActiveTab, doctors } = useDoctor();
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Doctor Management</span>
          </div>
          <div className="page-title">Doctor & Clinical Staff Management Module</div>
          <div className="page-subtitle">
            Complete clinical lifecycle: Physician Roster → OPD Queue & Calling → Patient Consultation & Diagnosis → Electronic Rx → Diagnostic Orders → IPD Bedside Rounds → Central Billing
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('consultation')}>
            <Stethoscope size={14} /> Consultation Desk
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddDoctorModal(true)}>
            <Plus size={15} /> Add New Doctor
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div
        className="tabs"
        style={{
          marginBottom: 20,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: 4,
          display: 'flex',
          gap: 4,
        }}
      >
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={14} /> Doctor Dashboard
        </button>

        <button
          className={`tab ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          <UserRound size={14} /> Doctor Directory ({doctors.length})
        </button>

        <button
          className={`tab ${activeTab === 'opd_queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('opd_queue')}
        >
          <Users size={14} /> OPD Consultation Queue
        </button>

        <button
          className={`tab ${activeTab === 'consultation' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultation')}
        >
          <Stethoscope size={14} /> Consultation Workspace
        </button>

        <button
          className={`tab ${activeTab === 'ipd_rounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('ipd_rounds')}
        >
          <BedDouble size={14} /> IPD Ward Rounds
        </button>

        <button
          className={`tab ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          <Clock size={14} /> Availability & Rosters
        </button>

        <button
          className={`tab ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Calendar size={14} /> Leave Management
        </button>

        <button
          className={`tab ${activeTab === 'patient_history' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient_history')}
        >
          <FileText size={14} /> Patient EHR History
        </button>

        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Activity size={14} /> Caseload Analytics & Reports
        </button>

        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={14} /> Preferences
        </button>
      </div>

      {/* Main Tab View Container */}
      <div>
        {activeTab === 'dashboard' && <DoctorDashboard />}
        {activeTab === 'directory' && <DoctorDirectory />}
        {activeTab === 'opd_queue' && <DoctorOPDQueue />}
        {activeTab === 'consultation' && <DoctorConsultationDesk />}
        {activeTab === 'ipd_rounds' && <DoctorIPDRounds />}
        {activeTab === 'availability' && <DoctorScheduleAvailability />}
        {activeTab === 'leave' && <DoctorLeaveManagement />}
        {activeTab === 'patient_history' && <DoctorPatientHistory />}
        {activeTab === 'reports' && <DoctorReports />}
        {activeTab === 'settings' && <DoctorSettings />}
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <AddEditDoctorModal onClose={() => setShowAddDoctorModal(false)} />
      )}
    </div>
  );
}

export default function DoctorsModule() {
  return (
    <BillingProvider>
      <DoctorProvider>
        <DoctorsModuleContent />
      </DoctorProvider>
    </BillingProvider>
  );
}
