import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, Bell, AlertTriangle, X, ChevronRight,
  Brain, Mic, User, Settings, LogOut
} from 'lucide-react';
import { performGlobalSearch, AISearchResult } from '../../services/aiCommandEngine';
import MedicalIcon from '../common/MedicalIcons';
import AICommandBoard from '../ai/AICommandBoard';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [autoStartVoice, setAutoStartVoice] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = 3;

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const results = performGlobalSearch(searchQuery, state.user?.role || 'super_admin');
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setSearchResults([]);
    }
  }, [searchQuery, state.user?.role]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K to open AI Command Board
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAiInitialQuery('');
        setAutoStartVoice(false);
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
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result: AISearchResult) => {
    navigate(result.route);
    setSearchQuery('');
    setShowSearch(false);
  };

  const openAIBoard = (q = '', voice = false) => {
    setShowSearch(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setAiInitialQuery(q);
    setAutoStartVoice(voice);
    setIsAIOpen(true);
  };

  const initials = state.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* 1. Global Search Box */}
        <div className="header-search" ref={searchRef}>
          <Search size={15} className="header-search-icon" />
          <input
            id="global-search"
            type="text"
            className="header-search-input"
            placeholder="Search patients, beds, bills or speak (Ctrl+K)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 1 && setShowSearch(true)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                openAIBoard(searchQuery, false);
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}

          {/* Dropdown Instant Search Results */}
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
                <span>Global Hospital Results ({searchResults.length})</span>
                <span
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => openAIBoard(searchQuery, false)}
                >
                  Ask AI Command Center →
                </span>
              </div>
              {searchResults.map(result => (
                <div key={result.id} className="search-result-item" onClick={() => handleResultClick(result)}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MedicalIcon name={result.category as any} size={14} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.subtitle}
                    </div>
                  </div>
                  {result.badgeText && (
                    <span className={`badge ${result.badgeVariant ? `badge-${result.badgeVariant}` : 'badge-neutral'}`} style={{ fontSize: 9 }}>
                      {result.badgeText}
                    </span>
                  )}
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}

          {showSearch && searchQuery.trim().length >= 1 && searchResults.length === 0 && (
            <div className="search-results" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              <div>No exact match for "{searchQuery}"</div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => openAIBoard(searchQuery, false)}
              >
                <Brain size={13} /> Ask AI Command Center
              </button>
            </div>
          )}
        </div>

        <div className="header-spacer" />

        {/* 2. Actions: AI | AI Voice Command | Emergency | Notification | Profile */}
        <div className="header-actions">
          {/* AI Button */}
          <button
            id="header-ai-btn"
            className="header-ai-btn"
            onClick={() => openAIBoard('', false)}
            title="Open AI Command Center (Ctrl+K)"
            aria-label="Open AI Command Center"
          >
            <Brain size={16} />
            <span>AI</span>
          </button>

          {/* AI Voice Command Button */}
          <button
            id="ai-voice-btn"
            className="header-voice-btn"
            onClick={() => openAIBoard('', true)}
            title="Start AI Voice Command in English or Telugu (మాట్లాడండి)"
            aria-label="Start AI Voice Command"
          >
            <Mic size={15} />
            <span className="voice-btn-label">AI Voice Command</span>
            <span className="voice-lang-badge">TE + EN</span>
          </button>

          {/* Emergency Button */}
          <button
            id="emergency-btn"
            className="emergency-btn"
            onClick={() => setShowEmergency(true)}
            aria-label="Emergency and Ambulance Request"
            title="Emergency Care & Ambulance Dispatch"
          >
            <AlertTriangle size={15} />
            <span>Emergency</span>
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              id="notifications-btn"
              className="header-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              title="Notifications"
              aria-label="Notifications"
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
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <div
              id="header-user-profile-btn"
              className="user-avatar"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              title={`${state.user?.name} (${state.user?.role})`}
              role="button"
              tabIndex={0}
            >
              {initials}
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="profile-menu-header">
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    {state.user?.name || 'Hospital User'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {state.user?.email || 'user@alnhms.com'}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ fontSize: 10, textTransform: 'capitalize' }}>
                      {(state.user?.role || 'User').replace(/_/g, ' ')}
                    </span>
                    {state.user?.department && (
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {state.user.department}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                >
                  <Settings size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span>Settings & Preferences</span>
                </div>

                <div
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    openAIBoard('', false);
                  }}
                >
                  <Brain size={14} style={{ color: 'var(--color-ai)' }} />
                  <span>AI Command Center</span>
                </div>

                <div
                  className="profile-menu-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Command Center Modal Dialog */}
      <AICommandBoard
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialQuery={aiInitialQuery}
        autoStartVoice={autoStartVoice}
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
