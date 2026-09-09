// ============================================================
// ALN Cure HMS — Housekeeping & Facilities Management Module
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  Building2,
  Flame,
  Zap,
  Droplets,
  Wind,
  Gauge,
  Calendar,
  CheckSquare,
  Square,
  UserCheck,
  ArrowRight,
  ClipboardList,
  Layers,
  Activity
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import type {
  CleaningTask,
  CleaningTaskStatus,
  CleaningRequestType,
  CleaningPriority,
  FacilityMaintenanceRequest,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  FacilityAsset
} from '../../types';

export default function HousekeepingModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'turnover' | 'maintenance' | 'assets' | 'schedules'>('dashboard');
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>(() => storageService.getCleaningTasks());
  const [maintenanceRequests, setMaintenanceRequests] = useState<FacilityMaintenanceRequest[]>(() => storageService.getFacilityRequests());
  const [facilityAssets, setFacilityAssets] = useState<FacilityAsset[]>(() => storageService.getFacilityAssets());

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewMaintModal, setShowNewMaintModal] = useState(false);

  // Form states for new cleaning task
  const [newTaskForm, setNewTaskForm] = useState<{
    title: string;
    type: CleaningRequestType;
    location: string;
    ward: string;
    bedNumber: string;
    priority: CleaningPriority;
    requestedBy: string;
    specialInstructions: string;
  }>({
    title: '',
    type: 'bed_turnover',
    location: '',
    ward: 'Ward A',
    bedNumber: '',
    priority: 'urgent',
    requestedBy: 'Nursing Desk',
    specialInstructions: '',
  });

  // Form states for new maintenance ticket
  const [newMaintForm, setNewMaintForm] = useState<{
    title: string;
    category: MaintenanceCategory;
    description: string;
    location: string;
    department: string;
    priority: MaintenancePriority;
    reportedBy: string;
    assignedTechnician: string;
    technicianPhone: string;
    estimatedCost: number;
  }>({
    title: '',
    category: 'biomedical_equipment',
    description: '',
    location: '',
    department: 'Intensive Care Unit',
    priority: 'high',
    reportedBy: 'Staff In-charge',
    assignedTechnician: '',
    technicianPhone: '',
    estimatedCost: 0,
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCleaningTasks(storageService.getCleaningTasks());
      setMaintenanceRequests(storageService.getFacilityRequests());
      setFacilityAssets(storageService.getFacilityAssets());
    };
    window.addEventListener('hms_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleStorageUpdate);
  }, []);

  // Handler: Update cleaning task status
  const handleUpdateTaskStatus = (id: string, newStatus: CleaningTaskStatus) => {
    const updates: Partial<CleaningTask> = { status: newStatus };
    if (newStatus === 'in_progress') updates.startedAt = new Date().toISOString();
    if (newStatus === 'completed') updates.completedAt = new Date().toISOString();
    if (newStatus === 'verified') {
      updates.verifiedBy = 'Supervisor';
      updates.verifiedAt = new Date().toISOString();
    }
    storageService.updateCleaningTask(id, updates);
    setCleaningTasks(storageService.getCleaningTasks());
  };

  // Handler: Toggle checklist item
  const handleToggleChecklist = (taskId: string, index: number) => {
    const task = cleaningTasks.find(t => t.id === taskId);
    if (!task) return;
    const newChecklist = [...task.checklist];
    newChecklist[index].done = !newChecklist[index].done;
    storageService.updateCleaningTask(taskId, { checklist: newChecklist });
    setCleaningTasks(storageService.getCleaningTasks());
  };

  // Handler: Create Cleaning Task
  const handleCreateCleaningTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.location) return;

    const defaultChecklists: Record<CleaningRequestType, { item: string; done: boolean }[]> = {
      bed_turnover: [
        { item: 'Strip soiled bed linens into biohazard bag', done: false },
        { item: 'Disinfect bed frame, rails and IV pole', done: false },
        { item: 'Wipe bedside locker & cardiac table', done: false },
        { item: 'Replace with fresh sanitized linen set', done: false },
        { item: 'Wet mop floor with hospital disinfectant', done: false },
      ],
      ot_sterile: [
        { item: 'Dispose of surgical waste to biohazard bins', done: false },
        { item: 'Disinfect OT lights, table and boom arms', done: false },
        { item: 'Run 30-min UV-C disinfection cycle', done: false },
        { item: 'Record air pressure & sterility log', done: false },
      ],
      room_terminal: [
        { item: 'Strip all linens and curtains', done: false },
        { item: 'Disinfect high-touch points and remote controls', done: false },
        { item: 'Steam-clean mattress and sofa upholstery', done: false },
        { item: 'Restock patient amenity kit', done: false },
      ],
      ward_routine: [
        { item: 'Morning wet mopping with antimicrobial solution', done: false },
        { item: 'Dust window sills and ledges', done: false },
        { item: 'Empty and sanitize waste receptacles', done: false },
      ],
      emergency_spill: [
        { item: 'Cordon off spill zone with yellow hazard cones', done: false },
        { item: 'Apply 1% sodium hypochlorite absorbent agent', done: false },
        { item: 'Seal biohazard waste and disinfect area', done: false },
      ],
      common_area: [
        { item: 'Mop corridors and waiting lounge', done: false },
        { item: 'Sanitize handrails and lift buttons', done: false },
      ],
      toilet_sanitation: [
        { item: 'Disinfect washbasin and toilet fixtures', done: false },
        { item: 'Restock hand soap & hand towels', done: false },
        { item: 'Dry mop floor and verify anti-skid floor', done: false },
      ],
    };

    storageService.addCleaningTask({
      title: newTaskForm.title,
      type: newTaskForm.type,
      location: newTaskForm.location,
      ward: newTaskForm.ward || undefined,
      bedNumber: newTaskForm.bedNumber || undefined,
      priority: newTaskForm.priority,
      status: 'pending',
      requestedBy: newTaskForm.requestedBy,
      specialInstructions: newTaskForm.specialInstructions || undefined,
      checklist: defaultChecklists[newTaskForm.type] || [{ item: 'Standard sanitization', done: false }],
    });

    setShowNewTaskModal(false);
    setNewTaskForm({
      title: '',
      type: 'bed_turnover',
      location: '',
      ward: 'Ward A',
      bedNumber: '',
      priority: 'urgent',
      requestedBy: 'Nursing Desk',
      specialInstructions: '',
    });
    setCleaningTasks(storageService.getCleaningTasks());
  };

  // Handler: Create Maintenance Ticket
  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintForm.title || !newMaintForm.location) return;

    storageService.addFacilityRequest({
      title: newMaintForm.title,
      category: newMaintForm.category,
      description: newMaintForm.description,
      location: newMaintForm.location,
      department: newMaintForm.department,
      priority: newMaintForm.priority,
      status: 'pending',
      reportedBy: newMaintForm.reportedBy,
      assignedTechnician: newMaintForm.assignedTechnician || undefined,
      technicianPhone: newMaintForm.technicianPhone || undefined,
      estimatedCost: Number(newMaintForm.estimatedCost) || 0,
    });

    setShowNewMaintModal(false);
    setNewMaintForm({
      title: '',
      category: 'biomedical_equipment',
      description: '',
      location: '',
      department: 'Intensive Care Unit',
      priority: 'high',
      reportedBy: 'Staff In-charge',
      assignedTechnician: '',
      technicianPhone: '',
      estimatedCost: 0,
    });
    setMaintenanceRequests(storageService.getFacilityRequests());
  };

  // Handler: Update Maintenance Status
  const handleUpdateMaintStatus = (id: string, newStatus: MaintenanceStatus) => {
    const updates: Partial<FacilityMaintenanceRequest> = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolutionNotes = 'Work verified and resolved by facility engineering team.';
    }
    storageService.updateFacilityRequest(id, updates);
    setMaintenanceRequests(storageService.getFacilityRequests());
  };

  // Computed Metrics
  const pendingCleanings = cleaningTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length;
  const inProgressCleanings = cleaningTasks.filter(t => t.status === 'in_progress').length;
  const completedToday = cleaningTasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
  const urgentCleanings = cleaningTasks.filter(t => (t.priority === 'stat_emergency' || t.priority === 'urgent') && t.status !== 'verified').length;

  const openMaintTickets = maintenanceRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length;
  const criticalMaint = maintenanceRequests.filter(r => r.priority === 'critical' && r.status !== 'resolved').length;

  // Filtered lists
  const filteredTasks = cleaningTasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchCat = categoryFilter === 'all' || task.type === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const filteredMaint = maintenanceRequests.filter(req => {
    const matchSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchCat = categoryFilter === 'all' || req.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="housekeeping-module" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Operations & Support</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Housekeeping & Facilities</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
            Housekeeping & Facilities Management
          </div>
          <div className="page-subtitle">
            Hospital Sanitation, Bed Turnover Workflow, OT Sterile Cleandown, Biomedical Maintenance & Infrastructure SLA
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCleaningTasks(storageService.getCleaningTasks());
              setMaintenanceRequests(storageService.getFacilityRequests());
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNewMaintModal(true)}
          >
            <Wrench size={14} /> Log Maintenance Ticket
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus size={14} /> Request Sanitization / Bed Turnover
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active Cleaning Queue</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCleanings + inProgressCleanings} Tasks</div>
            <div style={{ fontSize: 11, color: pendingCleanings > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
              {pendingCleanings} pending dispatch · {inProgressCleanings} in progress
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>STAT / Urgent Requests</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: urgentCleanings > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{urgentCleanings}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Emergency spills & OT turnovers</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completed & Sanitized</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>{completedToday}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Turnovers sanitized today</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Facility Maintenance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: criticalMaint > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{openMaintTickets} Open</div>
            <div style={{ fontSize: 11, color: criticalMaint > 0 ? 'var(--color-danger)' : 'var(--text-tertiary)', fontWeight: 600 }}>
              {criticalMaint} Critical Medical Gas/HVAC
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="card" style={{ padding: '6px', background: 'var(--bg-surface)', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: 'Operations Overview', icon: <Layers size={14} /> },
          { id: 'turnover', label: `Bed & Ward Turnover (${pendingCleanings + inProgressCleanings})`, icon: <Sparkles size={14} /> },
          { id: 'maintenance', label: `Maintenance Tickets (${openMaintTickets})`, icon: <Wrench size={14} /> },
          { id: 'assets', label: `Hospital Assets (${facilityAssets.length})`, icon: <Building2 size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id as any); setStatusFilter('all'); setCategoryFilter('all'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
              background: activeTab === t.id ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Operations Overview Dashboard */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left Column: Live Bed Turnover Stream */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                Bed & Ward Turnover Queue
              </div>
              <button
                className="btn btn-secondary btn-xs"
                onClick={() => setActiveTab('turnover')}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cleaningTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    background: task.priority === 'stat_emergency' ? 'rgba(239,68,68,0.05)' : 'var(--bg-base)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>{task.taskNumber} · {task.location}</span>
                    <span
                      className={`badge badge-${
                        task.status === 'completed' || task.status === 'verified'
                          ? 'success'
                          : task.status === 'in_progress'
                          ? 'primary'
                          : task.priority === 'stat_emergency'
                          ? 'danger'
                          : 'warning'
                      }`}
                      style={{ fontSize: 10, textTransform: 'capitalize' }}
                    >
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Requested by: <strong>{task.requestedBy}</strong> · Priority: <strong style={{ color: task.priority === 'stat_emergency' ? 'var(--color-danger)' : 'inherit' }}>{task.priority.toUpperCase()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High Priority Maintenance Alerts */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} style={{ color: 'var(--color-warning)' }} />
                Facility & Equipment Tickets
              </div>
              <button
                className="btn btn-secondary btn-xs"
                onClick={() => setActiveTab('maintenance')}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {maintenanceRequests.slice(0, 4).map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    background: req.priority === 'critical' ? 'rgba(239,68,68,0.05)' : 'var(--bg-base)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                      {req.ticketNumber} · {req.category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span
                      className={`badge badge-${
                        req.status === 'resolved'
                          ? 'success'
                          : req.status === 'in_progress'
                          ? 'primary'
                          : req.priority === 'critical'
                          ? 'danger'
                          : 'warning'
                      }`}
                      style={{ fontSize: 10, textTransform: 'capitalize' }}
                    >
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{req.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Location: <strong>{req.location}</strong> ({req.department}) · Assigned: <strong>{req.assignedTechnician || 'Unassigned'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bed & Ward Turnover Worklist */}
      {activeTab === 'turnover' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search by bed, ward, task #, or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
              />
            </div>

            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 140, fontSize: 12 }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
            </select>

            <select
              className="input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: 160, fontSize: 12 }}
            >
              <option value="all">All Categories</option>
              <option value="bed_turnover">Bed Turnover</option>
              <option value="ot_sterile">OT Sterile Cleaning</option>
              <option value="room_terminal">Room Terminal</option>
              <option value="emergency_spill">Emergency Spill</option>
              <option value="toilet_sanitation">Restroom Sanitation</option>
            </select>
          </div>

          {/* Tasks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderLeft: `4px solid ${
                    task.priority === 'stat_emergency'
                      ? 'var(--color-danger)'
                      : task.priority === 'urgent'
                      ? 'var(--color-warning)'
                      : 'var(--color-primary)'
                  }`,
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>{task.taskNumber}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{task.location}</div>
                  </div>
                  <span
                    className={`badge badge-${
                      task.status === 'verified'
                        ? 'success'
                        : task.status === 'completed'
                        ? 'success'
                        : task.status === 'in_progress'
                        ? 'primary'
                        : task.priority === 'stat_emergency'
                        ? 'danger'
                        : 'warning'
                    }`}
                    style={{ textTransform: 'capitalize', fontSize: 11 }}
                  >
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Instructions */}
                {task.specialInstructions && (
                  <div style={{ fontSize: 11.5, background: 'var(--bg-base)', padding: 8, borderRadius: 6, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{task.specialInstructions}"
                  </div>
                )}

                {/* Sanitization Checklist */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Sterility / Sanitization Checklist
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {task.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleChecklist(task.id, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          cursor: 'pointer',
                          color: item.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          textDecoration: item.done ? 'line-through' : 'none',
                        }}
                      >
                        {item.done ? (
                          <CheckSquare size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                        ) : (
                          <Square size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        )}
                        <span>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff & Timestamp Footer */}
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-default)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Staff: <strong>{task.assignedStaffName || 'Unassigned'}</strong></span>
                  <span>Req: {new Date(task.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Quick Workflow Action Buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  {task.status === 'pending' && (
                    <button
                      className="btn btn-primary btn-xs"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    >
                      Start Cleaning
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      className="btn btn-success btn-xs"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    >
                      Mark Completed
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button
                      className="btn btn-secondary btn-xs"
                      style={{ flex: 1, borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                      onClick={() => handleUpdateTaskStatus(task.id, 'verified')}
                    >
                      <ShieldCheck size={12} /> Verify & Release Bed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance Tickets Desk */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters */}
          <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search ticket #, asset, location, or problem..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
              />
            </div>

            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 140, fontSize: 12 }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: 170, fontSize: 12 }}
            >
              <option value="all">All Categories</option>
              <option value="medical_gas">Medical Gas & O2</option>
              <option value="hvac">HVAC & Air Handling</option>
              <option value="electrical">Electrical & Genset</option>
              <option value="biomedical_equipment">Biomedical Equipment</option>
              <option value="plumbing">Plumbing & Water</option>
            </select>
          </div>

          {/* Maintenance Tickets Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Issue & Asset</th>
                  <th>Location / Dept</th>
                  <th>Priority</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaint.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>{req.ticketNumber}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {req.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{req.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.description}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{req.location}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.department}</div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          req.priority === 'critical'
                            ? 'danger'
                            : req.priority === 'high'
                            ? 'warning'
                            : 'secondary'
                        }`}
                        style={{ fontSize: 10, textTransform: 'uppercase' }}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{req.assignedTechnician || 'Unassigned'}</div>
                      {req.technicianPhone && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{req.technicianPhone}</div>}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          req.status === 'resolved'
                            ? 'success'
                            : req.status === 'in_progress'
                            ? 'primary'
                            : 'warning'
                        }`}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}
                      >
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status !== 'resolved' ? (
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() => handleUpdateMaintStatus(req.id, 'resolved')}
                        >
                          Resolve & Close
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Hospital Asset Master */}
      {activeTab === 'assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Asset Code</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Manufacturer / Model</th>
                  <th>Last Service</th>
                  <th>Next Service Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {facilityAssets.map(ast => (
                  <tr key={ast.id}>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>{ast.assetCode}</td>
                    <td style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ast.name}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {ast.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{ast.location}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {ast.manufacturer} · {ast.modelNumber}
                    </td>
                    <td style={{ fontSize: 12 }}>{ast.lastServiceDate}</td>
                    <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{ast.nextServiceDue}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          ast.status === 'operational'
                            ? 'success'
                            : ast.status === 'under_maintenance'
                            ? 'warning'
                            : 'danger'
                        }`}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}
                      >
                        {ast.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Cleaning / Bed Turnover Request */}
      {showNewTaskModal && (
        <div className="modal-overlay" onClick={() => setShowNewTaskModal(false)}>
          <div className="modal-container" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                New Sanitization / Bed Turnover Request
              </div>
              <button className="modal-close" onClick={() => setShowNewTaskModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCleaningTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Cleaning Type *</label>
                  <select
                    className="input"
                    value={newTaskForm.type}
                    onChange={e => setNewTaskForm({ ...newTaskForm, type: e.target.value as CleaningRequestType })}
                    required
                  >
                    <option value="bed_turnover">Bed Turnover (Post-Discharge)</option>
                    <option value="ot_sterile">OT Post-Op Sterile Cleandown</option>
                    <option value="room_terminal">Room Terminal Sanitization</option>
                    <option value="emergency_spill">Emergency Fluid / Blood Spill</option>
                    <option value="ward_routine">Ward Routine Disinfection</option>
                    <option value="toilet_sanitation">Restroom Deep Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="label">Task Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Bed W-A-04 Discharge Deep Cleaning"
                    value={newTaskForm.title}
                    onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Location / Ward *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. General Ward A"
                      value={newTaskForm.location}
                      onChange={e => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Bed / Room Number</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. W-A-04"
                      value={newTaskForm.bedNumber}
                      onChange={e => setNewTaskForm({ ...newTaskForm, bedNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Priority *</label>
                    <select
                      className="input"
                      value={newTaskForm.priority}
                      onChange={e => setNewTaskForm({ ...newTaskForm, priority: e.target.value as CleaningPriority })}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat_emergency">STAT / Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Requested By</label>
                    <input
                      type="text"
                      className="input"
                      value={newTaskForm.requestedBy}
                      onChange={e => setNewTaskForm({ ...newTaskForm, requestedBy: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Special Instructions / Isolation Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Patient had contact precautions, use phenolic disinfectant..."
                    value={newTaskForm.specialInstructions}
                    onChange={e => setNewTaskForm({ ...newTaskForm, specialInstructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Dispatch Cleaning Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Maintenance Ticket */}
      {showNewMaintModal && (
        <div className="modal-overlay" onClick={() => setShowNewMaintModal(false)}>
          <div className="modal-container" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={18} style={{ color: 'var(--color-warning)' }} />
                Log Facility / Biomedical Maintenance Ticket
              </div>
              <button className="modal-close" onClick={() => setShowNewMaintModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateMaintenance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Category *</label>
                    <select
                      className="input"
                      value={newMaintForm.category}
                      onChange={e => setNewMaintForm({ ...newMaintForm, category: e.target.value as MaintenanceCategory })}
                      required
                    >
                      <option value="medical_gas">Medical Gas Pipeline (O2/Air/Vacuum)</option>
                      <option value="biomedical_equipment">Biomedical Equipment</option>
                      <option value="hvac">HVAC / Air Conditioning</option>
                      <option value="electrical">Electrical & Genset</option>
                      <option value="plumbing">Plumbing & Water</option>
                      <option value="fire_safety">Fire Safety & Alarm</option>
                      <option value="civil_carpentry">Civil / Carpentry</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority *</label>
                    <select
                      className="input"
                      value={newMaintForm.priority}
                      onChange={e => setNewMaintForm({ ...newMaintForm, priority: e.target.value as MaintenancePriority })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical (Life Support / ICU)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Issue Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Oxygen flowmeter pressure jitter Bed 04"
                    value={newMaintForm.title}
                    onChange={e => setNewMaintForm({ ...newMaintForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Location *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. MICU Floor 3, Bed 04"
                      value={newMaintForm.location}
                      onChange={e => setNewMaintForm({ ...newMaintForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input
                      type="text"
                      className="input"
                      value={newMaintForm.department}
                      onChange={e => setNewMaintForm({ ...newMaintForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Detailed Problem Description</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Describe symptoms, error codes, and immediate safety measures..."
                    value={newMaintForm.description}
                    onChange={e => setNewMaintForm({ ...newMaintForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Assigned Technician</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Anil Verma (Biomedical)"
                      value={newMaintForm.assignedTechnician}
                      onChange={e => setNewMaintForm({ ...newMaintForm, assignedTechnician: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Technician Phone</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. +91 98480 11223"
                      value={newMaintForm.technicianPhone}
                      onChange={e => setNewMaintForm({ ...newMaintForm, technicianPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewMaintModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
