import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { User, UserRole, AuthState } from '../types';
import { DEMO_USERS } from '../data/seedData';

// ---- DEMO CREDENTIALS ----
const DEMO_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'admin@alnhms.com': { password: 'Admin@123', userId: 'u-001' },
  'hadmin@alnhms.com': { password: 'Admin@123', userId: 'u-002' },
  'dr.rajesh@alnhms.com': { password: 'Doctor@123', userId: 'u-003' },
  'dr.sneha@alnhms.com': { password: 'Doctor@123', userId: 'u-004' },
  'dr.amit@alnhms.com': { password: 'Doctor@123', userId: 'u-005' },
  'nurse@alnhms.com': { password: 'Nurse@123', userId: 'u-006' },
  'receptionist@alnhms.com': { password: 'Staff@123', userId: 'u-007' },
  'pharma@alnhms.com': { password: 'Staff@123', userId: 'u-008' },
  'lab@alnhms.com': { password: 'Staff@123', userId: 'u-009' },
  'billing@alnhms.com': { password: 'Staff@123', userId: 'u-010' },
  'dietitian@alnhms.com': { password: 'Staff@123', userId: 'u-011' },
};

const PATIENT_OTP = '1234';

// ---- ACTIONS ----
type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ---- CONTEXT ----
interface AuthContextValue {
  state: AuthState;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aln_hms_user');
      if (saved) {
        const user = JSON.parse(saved) as User;
        dispatch({ type: 'LOGIN', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    await new Promise(r => setTimeout(r, 800)); // Simulate API call

    const cred = DEMO_CREDENTIALS[email.toLowerCase()];
    if (!cred || cred.password !== password) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    const user = DEMO_USERS.find(u => u.id === cred.userId);
    if (!user || !user.isActive) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Account not found or inactive. Contact admin.' };
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    localStorage.setItem('aln_hms_user', JSON.stringify(updatedUser));
    dispatch({ type: 'LOGIN', payload: updatedUser });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aln_hms_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    const perms = state.user.permissions;
    if (perms.includes('*')) return true;
    if (perms.includes(permission)) return true;
    // Wildcard match: 'patients.*' matches 'patients.view'
    return perms.some(p => {
      if (p.endsWith('.*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix);
      }
      return false;
    });
  }, [state.user]);

  const isRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    if (Array.isArray(role)) return role.includes(state.user.role);
    return state.user.role === role;
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ state, loginWithCredentials, logout, hasPermission, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
