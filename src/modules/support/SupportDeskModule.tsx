// ============================================================
// ALN Cure HMS — Help & Support Desk Module
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  LifeBuoy,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Send,
  User,
  Shield,
  Layers,
  ArrowRight,
  ChevronRight,
  Eye,
  Tag,
  Flame,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketComment,
  KnowledgeBaseArticle
} from '../../types';

export default function SupportDeskModule() {
  const { state: authState } = useAuth();
  const userName = authState.user?.name || 'Staff User';
  const userRole = authState.user?.role || 'nurse';

  const [activeTab, setActiveTab] = useState<'tickets' | 'kb' | 'analytics'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>(() => storageService.getSupportTickets());
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>(() => storageService.getKBArticles());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals & Selected Ticket
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // New Ticket Form State
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    location: string;
    department: string;
    assignedStaffName: string;
  }>({
    title: '',
    category: 'his_software',
    priority: 'medium',
    description: '',
    location: '',
    department: 'General Ward',
    assignedStaffName: 'Sanjay Kumar (IT Lead)',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(storageService.getSupportTickets());
      setKbArticles(storageService.getKBArticles());
    };
    window.addEventListener('hms_storage_updated', handleUpdate);
    return () => window.removeEventListener('hms_storage_updated', handleUpdate);
  }, []);

  // Handler: Create Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) return;

    // SLA hours calculation
    const slaHours = ticketForm.priority === 'critical' ? 2 : ticketForm.priority === 'high' ? 4 : 8;
    const slaDate = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    storageService.addSupportTicket({
      title: ticketForm.title,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'open',
      description: ticketForm.description,
      location: ticketForm.location || undefined,
      department: ticketForm.department,
      createdBy: userName,
      createdRole: userRole,
      assignedStaffName: ticketForm.assignedStaffName || 'IT Support Queue',
      slaDueDate: slaDate,
    });

    setShowCreateModal(false);
    setTicketForm({
      title: '',
      category: 'his_software',
      priority: 'medium',
      description: '',
      location: '',
      department: 'General Ward',
      assignedStaffName: 'Sanjay Kumar (IT Lead)',
    });
    setTickets(storageService.getSupportTickets());
  };

  // Handler: Add Comment to Ticket
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newCommentText.trim()) return;

    const updated = storageService.addTicketComment(selectedTicket.id, {
      authorName: userName,
      authorRole: userRole.replace(/_/g, ' '),
      content: newCommentText,
      isInternalNote,
    });

    if (updated) setSelectedTicket(updated);
    setNewCommentText('');
    setTickets(storageService.getSupportTickets());
  };

  // Handler: Resolve Ticket
  const handleResolveTicket = (ticketId: string) => {
    const updated = storageService.updateSupportTicket(ticketId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: 'Issue verified and resolved with end-user.',
    });
    if (updated && selectedTicket?.id === ticketId) {
      setSelectedTicket(updated);
    }
    setTickets(storageService.getSupportTickets());
  };

  // Metrics
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedToday = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchPri = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchCat && matchPri;
  });

  return (
    <div className="support-module" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span>Support & IT</span>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Help & Support Desk</span>
          </div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LifeBuoy size={24} style={{ color: 'var(--color-primary)' }} />
            Help & Support Desk
          </div>
          <div className="page-subtitle">
            Hospital IT Helpdesk, Biomedical Equipment Support, HIS Software Troubleshooting, TPA Claim Assistance & SOP Knowledge Base
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTickets(storageService.getSupportTickets());
              setKbArticles(storageService.getKBArticles());
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} /> Create Support Ticket
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Open Tickets</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{openCount}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{inProgressCount} in active progress</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Critical / STAT Tickets</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: criticalCount > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{criticalCount}</div>
            <div style={{ fontSize: 11, color: criticalCount > 0 ? 'var(--color-danger)' : 'var(--text-tertiary)', fontWeight: 600 }}>ICU Telemetry & Billing API</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Resolved Tickets</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>{resolvedToday}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>98.2% SLA Compliance</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(147, 51, 234, 0.12)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Knowledge Base & SOPs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#9333ea' }}>{kbArticles.length} Guides</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Self-service emergency protocols</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card" style={{ padding: '6px', background: 'var(--bg-surface)', display: 'flex', gap: 4 }}>
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontWeight: activeTab === 'tickets' ? 700 : 500,
            color: activeTab === 'tickets' ? 'white' : 'var(--text-secondary)',
            background: activeTab === 'tickets' ? 'var(--color-primary)' : 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LifeBuoy size={14} />
          Support Tickets ({filteredTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('kb')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontWeight: activeTab === 'kb' ? 700 : 500,
            color: activeTab === 'kb' ? 'white' : 'var(--text-secondary)',
            background: activeTab === 'kb' ? 'var(--color-primary)' : 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={14} />
          Knowledge Base & SOPs ({kbArticles.length})
        </button>
      </div>

      {/* Tab 1: Tickets Worklist */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search ticket #, title, description, or staff..."
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
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="input"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{ width: 140, fontSize: 12 }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: 180, fontSize: 12 }}
            >
              <option value="all">All Categories</option>
              <option value="his_software">HIS Software</option>
              <option value="hardware_biomedical">Biomedical Hardware</option>
              <option value="billing_claim_issue">Billing & Insurance</option>
              <option value="pharmacy_system">Pharmacy Hardware</option>
              <option value="clinical_workflow">Clinical Workflow</option>
            </select>
          </div>

          {/* Tickets Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Subject & Details</th>
                  <th>Department / Location</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(tkt => (
                  <tr key={tkt.id}>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>{tkt.ticketNumber}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {tkt.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{tkt.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }} className="truncate">{tkt.description}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Created by {tkt.createdBy} ({tkt.createdRole}) · {new Date(tkt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{tkt.department}</div>
                      {tkt.location && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{tkt.location}</div>}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          tkt.priority === 'critical'
                            ? 'danger'
                            : tkt.priority === 'high'
                            ? 'warning'
                            : 'secondary'
                        }`}
                        style={{ fontSize: 10, textTransform: 'uppercase' }}
                      >
                        {tkt.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{tkt.assignedStaffName || 'Unassigned'}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          tkt.status === 'resolved'
                            ? 'success'
                            : tkt.status === 'in_progress'
                            ? 'primary'
                            : 'warning'
                        }`}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}
                      >
                        {tkt.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => setSelectedTicket(tkt)}
                        >
                          Open Thread ({tkt.comments.length})
                        </button>
                        {tkt.status !== 'resolved' && (
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => handleResolveTicket(tkt.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Knowledge Base & SOP Articles */}
      {activeTab === 'kb' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {kbArticles.map(article => (
            <div
              key={article.id}
              className="card"
              style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
              onClick={() => setSelectedArticle(article)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ fontSize: 10 }}>{article.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={12} /> {article.views} reads
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{article.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{article.snippet}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
                {article.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, background: 'var(--bg-base)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-tertiary)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Support Ticket */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LifeBuoy size={18} style={{ color: 'var(--color-primary)' }} />
                Create Hospital IT / Support Ticket
              </div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Category *</label>
                    <select
                      className="input"
                      value={ticketForm.category}
                      onChange={e => setTicketForm({ ...ticketForm, category: e.target.value as TicketCategory })}
                      required
                    >
                      <option value="his_software">HIS Software / Web Application</option>
                      <option value="hardware_biomedical">Biomedical & ICU Monitors</option>
                      <option value="billing_claim_issue">Billing, TPA & Insurance</option>
                      <option value="network_telecom">Wi-Fi, Telemetry & Network</option>
                      <option value="pharmacy_system">Pharmacy Barcode & Printers</option>
                      <option value="clinical_workflow">Doctor / Nurse Clinical Charting</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority *</label>
                    <select
                      className="input"
                      value={ticketForm.priority}
                      onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value as TicketPriority })}
                    >
                      <option value="low">Low (12h SLA)</option>
                      <option value="medium">Medium (8h SLA)</option>
                      <option value="high">High (4h SLA)</option>
                      <option value="critical">Critical (2h STAT Emergency)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Ticket Subject *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. ICU telemetry monitor disconnected from nurse station"
                    value={ticketForm.title}
                    onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Department *</label>
                    <input
                      type="text"
                      className="input"
                      value={ticketForm.department}
                      onChange={e => setTicketForm({ ...ticketForm, department: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Location / Room</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Floor 3, MICU Bay 3"
                      value={ticketForm.location}
                      onChange={e => setTicketForm({ ...ticketForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Detailed Problem Description *</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Describe error messages, symptoms, equipment asset codes..."
                    value={ticketForm.description}
                    onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Raise Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ticket Conversation Thread */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-container" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  {selectedTicket.ticketNumber} · {selectedTicket.category.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="modal-title">{selectedTicket.title}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedTicket(null)}>×</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Ticket Meta Box */}
              <div style={{ background: 'var(--bg-base)', padding: 12, borderRadius: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div><strong>Description:</strong> {selectedTicket.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Reported by: <strong>{selectedTicket.createdBy}</strong></span>
                  <span>Dept: <strong>{selectedTicket.department}</strong></span>
                  <span>Priority: <strong style={{ color: selectedTicket.priority === 'critical' ? 'var(--color-danger)' : 'inherit' }}>{selectedTicket.priority.toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Comments Thread */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Support & Engineering Activity Thread ({selectedTicket.comments.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {selectedTicket.comments.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      No comments logged yet. Add updates below.
                    </div>
                  ) : (
                    selectedTicket.comments.map(c => (
                      <div
                        key={c.id}
                        style={{
                          padding: 10,
                          borderRadius: 6,
                          background: c.isInternalNote ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface)',
                          border: c.isInternalNote ? '1px dashed var(--color-warning)' : '1px solid var(--border-default)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700 }}>
                            {c.authorName} ({c.authorRole}) {c.isInternalNote && <span style={{ color: 'var(--color-warning)', fontSize: 10 }}>[INTERNAL NOTE]</span>}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-primary)' }}>{c.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Type an update, technical note, or diagnostic finding..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  style={{ fontSize: 12 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={e => setIsInternalNote(e.target.checked)}
                    />
                    <span>Post as IT Internal Note</span>
                  </label>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!newCommentText.trim()}>
                    <Send size={13} /> Post Update
                  </button>
                </div>
              </form>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div>
                {selectedTicket.status !== 'resolved' ? (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                  >
                    <CheckCircle2 size={14} /> Mark Ticket as Resolved
                  </button>
                ) : (
                  <span className="badge badge-success">Resolved & Verified</span>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: SOP / KB Article Full Viewer */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-container" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary" style={{ fontSize: 10 }}>{selectedArticle.category}</span>
                <div className="modal-title" style={{ marginTop: 4 }}>{selectedArticle.title}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedArticle(null)}>×</button>
            </div>
            <div className="modal-body" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {selectedArticle.content}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedArticle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
