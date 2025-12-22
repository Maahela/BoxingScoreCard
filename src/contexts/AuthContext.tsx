import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, UserRole } from '@/types';

interface AuthContextType {
  auth: AuthState;
  login: (
    role: UserRole,
    invigilatorId?: string,
    name?: string,
    eventsAssigned?: string[]
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Load auth state from localStorage
    const stored = localStorage.getItem('boxingAuth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Normalize: if marked authenticated but missing/invalid role, treat as logged out
        const allowedRoles = ['admin', 'invigilator', 'display'];
        if (
          parsed?.isAuthenticated &&
          (!parsed?.role || !allowedRoles.includes(parsed.role))
        ) {
          return { isAuthenticated: false, role: null };
        }
        return parsed;
      } catch {
        return { isAuthenticated: false, role: null };
      }
    }
    return { isAuthenticated: false, role: null };
  });

  useEffect(() => {
    // Persist auth state to localStorage
    localStorage.setItem('boxingAuth', JSON.stringify(auth));
  }, [auth]);

  const login = (
    role: UserRole,
    invigilatorId?: string,
    name?: string,
    eventsAssigned?: string[]
  ) => {
    setAuth({
      isAuthenticated: true,
      role,
      invigilatorId,
      name,
      eventsAssigned,
    });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null });
    localStorage.removeItem('boxingAuth');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
