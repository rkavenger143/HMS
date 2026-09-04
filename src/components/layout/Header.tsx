import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, Bell, AlertTriangle, X, ChevronRight,
  Brain, Mic, Sparkles
} from 'lucide-react';
import { performGlobalSearch, AISearchResult } from '../../services/aiCommandEngine';
import MedicalIcon from '../common/MedicalIcons';
import AICommandBoard from '../ai/AICommandBoard';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [autoStartVoice, setAutoStartVoice] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K or / to open AI Command Board
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
    setAiInitialQuery(q);
    setAutoStartVoice(voice);
    setIsAIOpen(true);
  };

  const initials = state.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Global Search with AI Command & Direct Microphone Integration */}
        <div className="header-search" ref={searchRef}>
          <Search size={14} className="header-search-icon" />
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

          {/* Inline Microphone Button */}
          <button
            id="header-inline-mic-btn"
            className="btn btn-ghost btn-icon btn-icon-sm"
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              color: 'var(--color-primary)',
              background: 'rgba(5, 150, 105, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              marginRight: 4,
              flexShrink: 0,
              border: '1px solid rgba(5, 150, 105, 0.2)',
            }}
            onClick={() => openAIBoard('', true)}
            aria-label="Start voice command (English & Telugu)"
            title="Start Voice Command in English or Telugu (మాట్లాడండి)"
          >
            <Mic size={14} />
          </button>

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
            onClick={() => openAIBoard(searchQuery, false)}
            title="Open AI Command Board & Voice Assistant (Ctrl+K)"
          >
            <Brain size={12} />
            <span>AI</span>
            <kbd style={{ fontSize: 9, opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: 3 }}>⌘K</kbd>
          </button>

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
                  Ask AI Command Board →
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
            onClick={() => openAIBoard('', true)}
            title="Open AI Command Center & Voice Control"
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

