import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, Shield, Smartphone, Loader2, ChevronRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { loginWithCredentials, state } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const DEMO_ROLES = [
    { label: 'Super Admin', email: 'admin@alnhms.com', pass: 'Admin@123', color: '#059669' },
    { label: 'Doctor (Rajesh)', email: 'dr.rajesh@alnhms.com', pass: 'Doctor@123', color: '#0284c7' },
    { label: 'Nurse', email: 'nurse@alnhms.com', pass: 'Nurse@123', color: '#ec4899' },
    { label: 'Receptionist', email: 'receptionist@alnhms.com', pass: 'Staff@123', color: '#f59e0b' },
    { label: 'Pharmacy', email: 'pharma@alnhms.com', pass: 'Staff@123', color: '#10b981' },
    { label: 'Laboratory', email: 'lab@alnhms.com', pass: 'Staff@123', color: '#8b5cf6' },
    { label: 'Billing Staff', email: 'billing@alnhms.com', pass: 'Staff@123', color: '#3b82f6' },
    { label: 'Dietitian', email: 'dietitian@alnhms.com', pass: 'Staff@123', color: '#14b8a6' },
  ];

  const handleSelectRole = (r: typeof DEMO_ROLES[0]) => {
    setEmail(r.email);
    setPassword(r.pass);
  };

  const handleQuickLogin = async (r: typeof DEMO_ROLES[0]) => {
    setEmail(r.email);
    setPassword(r.pass);
    const result = await loginWithCredentials(r.email, r.pass);
    if (!result.success) {
      toast.error('Login Failed', result.error);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginWithCredentials(email, password);
    if (!result.success) {
      toast.error('Login Failed', result.error);
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
      </div>

      <div className="login-container">
        {/* Left Panel — Branding */}
        <div className="login-brand">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L4 7V14C4 19.55 8.34 24.74 14 26C19.66 24.74 24 19.55 24 14V7L14 2Z" fill="white" fillOpacity="0.3"/>
                <path d="M14 6L6 10V14C6 18.41 9.47 22.6 14 23.93C18.53 22.6 22 18.41 22 14V10L14 6Z" fill="white" fillOpacity="0.5"/>
                <path d="M13 11H15V13H17V15H15V17H13V15H11V13H13V11Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="login-logo-name">ALN Cure HMS</div>
              <div className="login-logo-tag">AI-Enabled Hospital Management</div>
            </div>
          </div>

          <h1 className="login-hero-title">
            Smarter Hospital<br />Management
          </h1>
          <p className="login-hero-desc">
            Complete enterprise hospital operations platform connecting clinical workflows, OPD, IPD, diagnostics, pharmacy, billing, and administration through one intelligent system.
          </p>

          <div className="login-features">
            {[
              { icon: '🏥', text: 'Integrated Patient Journey & Records' },
              { icon: '🤖', text: 'AI-Assisted Multi-Department Intelligence' },
              { icon: '📊', text: 'Real-Time Hospital Operations Analytics' },
              { icon: '🔒', text: 'Enterprise-Grade Security & RBAC Matrix' },
              { icon: '⚡', text: 'Emergency & Ambulance Command Ready' },
              { icon: '🛡️', text: 'Clinical Decision Support Safeguards' },
            ].map((f, i) => (
              <div key={i} className="login-feature-item">
                <span className="login-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-ai-badge">
            <span style={{ color: 'var(--color-primary)' }}>✦</span>
            ALN Cure AI — Intelligent hospital assistance
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="login-form-header">
              <div className="login-card-icon-badge">
                <Lock size={20} style={{ color: 'var(--color-primary, #059669)' }} />
              </div>
              <h2 className="login-form-title">Staff Portal Sign In</h2>
              <p className="login-form-sub">Select a role or enter authorized hospital staff credentials</p>
            </div>

            {/* Quick One-Click Role Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quick Demo Access:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DEMO_ROLES.map(r => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => handleQuickLogin(r)}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: email === r.email ? 'var(--color-primary-muted)' : 'var(--bg-surface)',
                      border: `1px solid ${email === r.email ? 'var(--color-primary)' : 'var(--border-default)'}`,
                      color: email === r.email ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color }} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleStaffLogin} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Hospital Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="name@alnhms.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{ paddingLeft: '38px' }}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)', pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: '38px', paddingRight: '44px' }}
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)', pointerEvents: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary login-submit-btn"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <><Loader2 size={16} className="spin" /> Authenticating...</>
                ) : (
                  <>Sign In to Workspace <ChevronRight size={16} /></>
                )}
              </button>
            </form>

            <div className="login-security-notice">
              <Shield size={14} style={{ color: 'var(--color-primary, #059669)', flexShrink: 0 }} />
              <span>Protected by end-to-end encrypted hospital access governance & session audit logging</span>
            </div>
          </div>

          <p className="login-footer-text">
            © 2026 ALN Technologies · ALN Cure HMS Enterprise<br />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Authorized healthcare personnel only. Unauthorized access attempts are monitored and logged.
            </span>
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          background: var(--bg-base);
          position: relative;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .login-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .orb-1 { width: 600px; height: 600px; background: #059669; top: -200px; left: -200px; }
        .orb-2 { width: 400px; height: 400px; background: #10b981; bottom: -100px; right: 200px; }
        .orb-3 { width: 300px; height: 300px; background: #047857; top: 50%; right: -100px; }
        .login-container {
          position: relative; z-index: 1;
          display: flex; width: 100%; min-height: 100vh; min-height: 100dvh;
        }
        .login-brand {
          flex: 1; padding: 48px 56px;
          display: flex; flex-direction: column; gap: 24px;
          background: linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.04));
          border-right: 1px solid var(--border-default);
          justify-content: center;
        }
        .login-logo { display: flex; align-items: center; gap: 14px; }
        .login-logo-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #065f46, #059669);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
          flex-shrink: 0;
        }
        .login-logo-name { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .login-logo-tag { font-size: 11.5px; color: var(--color-primary); font-weight: 600; letter-spacing: 0.5px; }
        .login-hero-title {
          font-size: 44px; font-weight: 800; line-height: 1.15;
          letter-spacing: -1.5px; color: var(--text-primary);
          background: linear-gradient(135deg, var(--text-primary) 30%, #059669);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .login-hero-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.7; max-width: 460px; }
        .login-features { display: flex; flex-direction: column; gap: 12px; margin: 8px 0; }
        .login-feature-item {
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: var(--text-secondary);
        }
        .login-feature-icon { font-size: 18px; width: 24px; text-align: center; }
        .login-ai-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--color-primary-muted, #ecfdf5); border: 1px solid var(--color-primary-border, #a7f3d0);
          border-radius: var(--radius-full);
          padding: 8px 16px; font-size: 13px; font-weight: 600;
          color: var(--color-primary-dark, #065f46); width: fit-content;
        }
        .login-form-panel {
          width: 520px; padding: 48px 44px;
          display: flex; flex-direction: column; gap: 24px;
          justify-content: center; background: var(--bg-base);
        }
        .login-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: 34px 28px;
          display: flex; flex-direction: column; gap: 22px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .login-card-icon-badge {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: var(--color-primary-muted, #ecfdf5);
          border: 1px solid var(--color-primary-border, #a7f3d0);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .login-form-title { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .login-form-sub { font-size: 13px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; }
        .login-form { display: flex; flex-direction: column; gap: 18px; }
        .login-submit-btn {
          width: 100%; justify-content: center; padding: 13px;
          font-size: 14.5px; font-weight: 700; border-radius: var(--radius-md);
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 3px 10px rgba(5, 150, 105, 0.28);
          border: none;
          transition: all var(--transition-fast);
        }
        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #047857 0%, #065f46 100%);
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(5, 150, 105, 0.36);
        }
        .login-security-notice {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: var(--text-tertiary);
          background: var(--bg-surface);
          padding: 9px 12px; border-radius: var(--radius-md);
          border: 1px solid var(--border-muted);
          line-height: 1.4;
        }
        .login-footer-text { font-size: 11.5px; color: var(--text-tertiary); text-align: center; line-height: 1.7; }
        @media (max-width: 1024px) {
          .login-brand { display: none; }
          .login-form-panel { width: 100%; padding: 24px 16px; justify-content: flex-start; min-height: 100dvh; }
          .login-form-card { padding: 24px 18px; gap: 18px; }
        }
      `}</style>
    </div>
  );
}
