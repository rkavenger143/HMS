import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, Bell, AlertTriangle, X, ChevronRight, Loader2,
  Users, Calendar, FileText, Pill, ReceiptText, BedDouble,
  Brain, Mic, Sparkles
} from 'lucide-react';
import { DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_DOCTORS } from '../../data/seedData';
import type { SearchResult } from '../../types';
import MedicalIcon from '../common/MedicalIcons';
import AICommandBoard from '../ai/AICommandBoard';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

function getSearchResults(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  DEMO_PATIENTS.forEach(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (fullName.includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q)) {
      results.push({
        id: p.id, type: 'patient',
        title: `${p.firstName} ${p.lastName}`,
        subtitle: `${p.id} · ${p.phone} · ${p.bloodGroup}`,
        route: `/patients/${p.id}`
      });
    }
  });

  DEMO_DOCTORS.forEach(d => {
    if (d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)) {
      results.push({
        id: d.id, type: 'doctor',
        title: d.name,
        subtitle: `${d.specialization} · ${d.department}`,
        route: `/doctors/${d.id}`
      });
    }
  });

  DEMO_APPOINTMENTS.forEach(a => {
    if (a.patientName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) {
      results.push({
        id: a.id, type: 'appointment',
        title: `Apt: ${a.patientName}`,
        subtitle: `${a.date} ${a.time} · Dr. ${a.doctorName} · ${a.status}`,
        route: `/appointments`
      });
    }
  });

  return results.slice(0, 8);
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  patient: <MedicalIcon name="patients" size={14} color="var(--color-primary)" />,
  doctor: <MedicalIcon name="doctors" size={14} color="var(--color-ai)" />,
  appointment: <MedicalIcon name="appointments" size={14} color="var(--color-success)" />,
  lab_report: <MedicalIcon name="laboratory" size={14} color="var(--color-warning)" />,
  bill: <MedicalIcon name="billing" size={14} color="var(--color-accent)" />,
  medicine: <MedicalIcon name="pharmacy" size={14} color="#0d9488" />,
  admission: <MedicalIcon name="ipd" size={14} color="#d97706" />,
};

const TYPE_COLORS: Record<string, string> = {
  patient: 'var(--color-primary)',
  doctor: 'var(--color-ai)',
  appointment: 'var(--color-success)',
  lab_report: 'var(--color-warning)',
  bill: 'var(--color-accent)',
};

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = 3;

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = getSearchResults(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K or / to open AI Command Board
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAiInitialQuery('');
        setIsAIOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setSearchQuery('');
    setShowSearch(false);
  };

  const openAIBoard = (q = '') => {
    setShowSearch(false);
    setAiInitialQuery(q);
    setIsAIOpen(true);
  };

  const initials = state.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Global Search with AI Command Integration */}
        <div className="header-search" ref={searchRef}>
          <Search size={14} className="header-search-icon" />
          <input
            id="global-search"
            type="text"
            className="header-search-input"
            placeholder="Search HMS or ask AI in English / తెలుగు... (Ctrl+K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                openAIBoard(searchQuery);
              }
            }}
          />

          {/* Quick AI Trigger Button */}
          <button
            className="btn btn-ghost btn-sm"
            style={{
              padding: '2px 8px',
              height: 24,
              fontSize: 11,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 6,
              background: 'var(--color-primary-muted)',
              border: '1px solid rgba(5,150,105,0.2)',
            }}
            onClick={() => openAIBoard(searchQuery)}
            title="Open AI Command Board & Voice Assistant (Ctrl+K)"
          >
            <Brain size={12} />
            <span>AI</span>
            <kbd style={{ fontSize: 9, opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: 3 }}>⌘K</kbd>
          </button>

          {showSearch && searchResults.length > 0 && (
            <div className="search-results">
              <div
                style={{
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border-default)',
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>Quick Results</span>
                <span
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => openAIBoard(searchQuery)}
                >
                  Ask AI Command Board →
                </span>
              </div>
              {searchResults.map(result => (
                <div key={result.id} className="search-result-item" onClick={() => handleResultClick(result)}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: `${TYPE_COLORS[result.type] || 'var(--color-primary)'}20`,
                    color: TYPE_COLORS[result.type] || 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {TYPE_ICONS[result.type]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.subtitle}</div>
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}

          {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="search-results" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              <div>No instant match for "{searchQuery}"</div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => openAIBoard(searchQuery)}
              >
                <Brain size={13} /> Ask AI Assistant
              </button>
            </div>
          )}
        </div>

        <div className="header-spacer" />

        {/* Actions */}
        <div className="header-actions">
          {/* AI Voice Assistant Header Pill Button */}
          <button
            id="ai-voice-btn"
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(16,185,129,0.06))',
              color: 'var(--color-primary)',
              border: '1px solid rgba(5,150,105,0.3)',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(5,150,105,0.1)',
            }}
            onClick={() => openAIBoard()}
            title="Open AI Command Board & Voice Assistant"
          >
            <Mic size={14} style={{ color: 'var(--color-primary)' }} />
            <span>AI Voice Command</span>
            <span style={{ fontSize: 10, background: 'var(--color-primary)', color: 'white', padding: '1px 5px', borderRadius: 10 }}>
              TE + EN
            </span>
          </button>

          {/* Emergency Button */}
          <button
            id="emergency-btn"
            className="emergency-btn"
            onClick={() => setShowEmergency(true)}
          >
            <AlertTriangle size={14} />
            Emergency
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              id="notifications-btn"
              className="header-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && <span className="header-btn-badge" />}
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>Notifications</div>
                  <span className="badge badge-danger">{unreadCount} new</span>
                </div>
                {[
                  { iconName: 'heart-pulse' as const, variant: 'danger' as const, title: 'Critical Lab Result', msg: 'Troponin I elevated — Ramesh Yadav (ALN-2026-00001)', time: '8:05 AM', unread: true },
                  { iconName: 'ambulance' as const, variant: 'warning' as const, title: 'Emergency Admission', msg: 'Deepak Mehta — Acute MI, admitted to MICU-01', time: '2:20 AM', unread: true },
                  { iconName: 'pharmacy' as const, variant: 'teal' as const, title: 'Low Stock Alert', msg: '4 medicines below reorder level', time: '9:00 AM', unread: true },
                  { iconName: 'opd' as const, variant: 'success' as const, title: 'OPD Session', msg: 'You have 5 patients today from 09:30 AM', time: '7:00 AM', unread: false },
                ].map((n, i) => (
                  <div key={i} className={`notification-item ${n.unread ? 'unread' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MedicalIcon name={n.iconName} size={14} badge variant={n.variant} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.msg}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="user-avatar" title={state.user?.name}>
            {initials}
          </div>
        </div>
      </header>

      {/* AI Command Board Modal Dialog */}
      <AICommandBoard
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialQuery={aiInitialQuery}
      />

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="modal-backdrop" onClick={() => setShowEmergency(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(255,69,58,0.15), rgba(255,107,53,0.1))', borderColor: 'rgba(255,69,58,0.3)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
              <span className="modal-title" style={{ color: 'var(--color-danger)' }}>🚨 Emergency / Ambulance Request</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowEmergency(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Patient / Caller Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number <span className="required">*</span></label>
                  <input className="form-input" placeholder="Mobile number" type="tel" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Pickup Location <span className="required">*</span></label>
                  <input className="form-input" placeholder="Full address / landmark" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Patient Condition</label>
                  <textarea className="form-textarea" placeholder="Describe the emergency..." rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select">
                    <option value="critical">🔴 Critical — Life Threatening</option>
                    <option value="high">🟠 High — Serious</option>
                    <option value="medium">🟡 Medium — Moderate</option>
                    <option value="low">🟢 Low — Non-urgent</option>
                  </select>
                </div>
              </div>
              <div style={{
                marginTop: '16px', padding: '12px 16px',
                background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)',
                borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-danger)'
              }}>
                ⚡ For immediate life-threatening emergencies, also call hospital emergency: <strong>0120-4000-911</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEmergency(false)}>Cancel</button>
              <button
                id="dispatch-ambulance-btn"
                className="btn btn-danger"
                onClick={() => { setShowEmergency(false); }}
              >
                <AlertTriangle size={14} />
                Dispatch Ambulance Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
