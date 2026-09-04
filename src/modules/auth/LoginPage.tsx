import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, Shield, Smartphone, Loader2, ChevronRight } from 'lucide-react';

type LoginMode = 'staff' | 'patient';

const DEMO_ACCOUNTS = [
  { email: 'admin@alnhms.com', password: 'Admin@123', role: 'Super Admin', color: '#BF5AF2' },
  { email: 'dr.rajesh@alnhms.com', password: 'Doctor@123', role: 'Doctor (Cardiology)', color: '#0A84FF' },
  { email: 'dr.sneha@alnhms.com', password: 'Doctor@123', role: 'Doctor (Gen. Medicine)', color: '#0A84FF' },
  { email: 'nurse@alnhms.com', password: 'Nurse@123', role: 'Nurse', color: '#30D158' },
  { email: 'receptionist@alnhms.com', password: 'Staff@123', role: 'Receptionist', color: '#FF6B35' },
  { email: 'pharma@alnhms.com', password: 'Staff@123', role: 'Pharmacist', color: '#64D2FF' },
  { email: 'lab@alnhms.com', password: 'Staff@123', role: 'Lab Technician', color: '#FFD60A' },
  { email: 'billing@alnhms.com', password: 'Staff@123', role: 'Billing Staff', color: '#FF9F0A' },
];

export default function LoginPage() {
  const { loginWithCredentials, loginWithOTP, state } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginWithCredentials(email, password);
    if (!result.success) {
      toast.error('Login Failed', result.error);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error('Invalid Phone', 'Please enter a 10-digit mobile number.');
      return;
    }
    await new Promise(r => setTimeout(r, 600));
    setOtpSent(true);
    toast.success('OTP Sent', `For demo, use OTP: 1234`);
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginWithOTP(phone, otp);
    if (!result.success) {
      toast.error('Login Failed', result.error);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setMode('staff');
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
            Complete hospital operations platform connecting patients, doctors, diagnostics, pharmacy, billing, and administration through one intelligent system.
          </p>

          <div className="login-features">
            {[
              { icon: '🏥', text: 'Complete Patient Journey Management' },
              { icon: '🤖', text: 'AI-Assisted Clinical Operations' },
              { icon: '📊', text: 'Real-Time Hospital Analytics' },
              { icon: '🔒', text: 'Enterprise-Grade Security & RBAC' },
              { icon: '📱', text: 'Mobile-First Patient Portal' },
              { icon: '⚡', text: 'Emergency & Ambulance Ready' },
            ].map((f, i) => (
              <div key={i} className="login-feature-item">
                <span className="login-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-ai-badge">
            <span style={{ color: 'var(--color-ai)' }}>✦</span>
            ALN Cure AI — Intelligent hospital assistance
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="login-form-header">
              <h2 className="login-form-title">Welcome Back</h2>
              <p className="login-form-sub">Sign in to ALN Cure HMS</p>
            </div>

            {/* Mode Toggle */}
            <div className="login-mode-toggle">
              <button
                className={`login-mode-btn ${mode === 'staff' ? 'active' : ''}`}
                onClick={() => setMode('staff')}
                type="button"
              >
                <Shield size={15} />
                Staff Login
              </button>
              <button
                className={`login-mode-btn ${mode === 'patient' ? 'active' : ''}`}
                onClick={() => setMode('patient')}
                type="button"
              >
                <Smartphone size={15} />
                Patient Portal
              </button>
            </div>

            {mode === 'staff' ? (
              <form onSubmit={handleStaffLogin} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="your@alnhms.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
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
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  id="login-submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={state.isLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {state.isLoading ? (
                    <><Loader2 size={16} className="spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ChevronRight size={16} /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={otpSent ? handlePatientLogin : handleSendOTP} className="login-form">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600
                    }}>+91</span>
                    <input
                      id="patient-phone"
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      maxLength={10}
                      style={{ paddingLeft: '48px' }}
                    />
                  </div>
                  <div className="form-hint">Demo: Try 9876543210 (Mohan Das)</div>
                </div>
                {otpSent && (
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input
                      id="patient-otp"
                      type="text"
                      className="form-input"
                      placeholder="4-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                      style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }}
                    />
                    <div className="form-hint">Demo OTP: <strong>1234</strong></div>
                  </div>
                )}
                <button
                  id="patient-login-submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={state.isLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {state.isLoading ? (
                    <><Loader2 size={16} className="spin" /> Processing...</>
                  ) : otpSent ? (
                    <>Verify & Sign In <ChevronRight size={16} /></>
                  ) : (
                    <>Send OTP <ChevronRight size={16} /></>
                  )}
                </button>
                {otpSent && (
                  <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => { setOtpSent(false); setOtp(''); }}>
                    ← Change Number
                  </button>
                )}
              </form>
            )}

            {/* Demo Accounts */}
            {mode === 'staff' && (
              <div className="login-demo-section">
                <div className="login-demo-title">
                  <div className="login-demo-line" />
                  <span>Demo Accounts</span>
                  <div className="login-demo-line" />
                </div>
                <div className="login-demo-grid">
                  {DEMO_ACCOUNTS.map((acc, i) => (
                    <button key={i} type="button" className="login-demo-chip" onClick={() => fillDemo(acc)}>
                      <span className="login-demo-dot" style={{ background: acc.color }} />
                      {acc.role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="login-footer-text">
            © 2026 ALN Technologies. ALN Cure HMS v1.0<br />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              This system is for authorized users only. All access is logged.
            </span>
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-base);
          position: relative;
          overflow: hidden;
        }
        .login-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .orb-1 { width: 600px; height: 600px; background: #0A84FF; top: -200px; left: -200px; }
        .orb-2 { width: 400px; height: 400px; background: #BF5AF2; bottom: -100px; right: 200px; }
        .orb-3 { width: 300px; height: 300px; background: #30D158; top: 50%; right: -100px; }
        .login-container {
          position: relative; z-index: 1;
          display: flex; width: 100%; min-height: 100vh;
        }
        .login-brand {
          flex: 1; padding: 48px 56px;
          display: flex; flex-direction: column; gap: 24px;
          background: linear-gradient(135deg, rgba(10,132,255,0.08), rgba(191,90,242,0.05));
          border-right: 1px solid var(--border-default);
        }
        .login-logo { display: flex; align-items: center; gap: 14px; }
        .login-logo-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #0A84FF, #00D4AA);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--shadow-glow-blue);
          flex-shrink: 0;
        }
        .login-logo-name { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .login-logo-tag { font-size: 11px; color: var(--color-ai); font-weight: 500; letter-spacing: 0.5px; }
        .login-hero-title {
          font-size: 42px; font-weight: 800; line-height: 1.1;
          letter-spacing: -1.5px; color: var(--text-primary);
          background: linear-gradient(135deg, var(--text-primary) 40%, var(--color-primary));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .login-hero-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.7; max-width: 440px; }
        .login-features { display: flex; flex-direction: column; gap: 10px; }
        .login-feature-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: var(--text-secondary);
        }
        .login-feature-icon { font-size: 18px; width: 24px; text-align: center; }
        .login-ai-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--color-ai-muted); border: 1px solid var(--color-ai-border);
          border-radius: var(--radius-full);
          padding: 8px 16px; font-size: 13px; font-weight: 600;
          color: var(--color-ai); width: fit-content;
        }
        .login-form-panel {
          width: 480px; padding: 48px 40px;
          display: flex; flex-direction: column; gap: 24px;
          justify-content: center; background: var(--bg-base);
        }
        .login-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: 32px;
          display: flex; flex-direction: column; gap: 24px;
        }
        .login-form-title { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; }
        .login-form-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
        .login-mode-toggle {
          display: flex; background: var(--bg-surface);
          border-radius: var(--radius-md); padding: 3px; gap: 3px;
        }
        .login-mode-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px; border-radius: calc(var(--radius-md) - 2px);
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all var(--transition-fast);
          background: transparent; color: var(--text-secondary); border: none;
        }
        .login-mode-btn.active {
          background: var(--bg-card); color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-demo-section { display: flex; flex-direction: column; gap: 12px; }
        .login-demo-title {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--text-tertiary); font-weight: 500;
        }
        .login-demo-line { flex: 1; height: 1px; background: var(--border-muted); }
        .login-demo-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .login-demo-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--bg-surface); border: 1px solid var(--border-muted);
          border-radius: var(--radius-full); padding: 4px 10px;
          font-size: 11px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; transition: all var(--transition-fast);
        }
        .login-demo-chip:hover { background: var(--bg-surface-hover); color: var(--text-primary); border-color: var(--border-default); }
        .login-demo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .login-footer-text { font-size: 12px; color: var(--text-tertiary); text-align: center; line-height: 1.8; }
        @media (max-width: 1024px) {
          .login-brand { display: none; }
          .login-form-panel { width: 100%; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
