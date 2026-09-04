import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { User } from '../../../../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const { resetUserPassword } = useAdmin();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new temporary password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    resetUserPassword(user.id, password);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPassword('');
      setConfirmPassword('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: 440, width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="modal-title">Reset User Password</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px' }}>Password Successfully Reset</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Temporary credentials dispatched to {user.email}. User will be prompted to reset upon next login.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>
                  {error}
                </div>
              )}

              <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: 12, color: 'var(--text-secondary)' }}>
                Administrator password override requires compliance logging. The user's active web sessions will be invalidated.
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Temporary Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="notifyUserCheck"
                  checked={notifyUser}
                  onChange={e => setNotifyUser(e.target.checked)}
                />
                <label htmlFor="notifyUserCheck" style={{ fontSize: 12, cursor: 'pointer' }}>
                  Send notification email with temporary credentials to user
                </label>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                Reset & Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
