import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  clinicId: string | null;
  token: string | null;
  login: (clinicId: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Minimal auth context. In production this is backed by Auth0 + 2FA; here it
 * persists the active clinicId/token in localStorage so the dashboard can
 * scope its API calls.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [clinicId, setClinicId] = useState<string | null>(
    () => localStorage.getItem('clinic_ai_clinicId'),
  );
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('clinic_ai_token'),
  );

  const login = (id: string, tk: string) => {
    localStorage.setItem('clinic_ai_clinicId', id);
    localStorage.setItem('clinic_ai_token', tk);
    setClinicId(id);
    setToken(tk);
  };

  const logout = () => {
    localStorage.removeItem('clinic_ai_clinicId');
    localStorage.removeItem('clinic_ai_token');
    setClinicId(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ clinicId, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
