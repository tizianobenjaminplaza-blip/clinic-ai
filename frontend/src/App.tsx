import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { ABTesting } from './pages/ABTesting';
import { Reports } from './pages/Reports';
import { LeadDetail } from './pages/LeadDetail';
import { Demo } from './pages/Demo';
import { Billing } from './pages/Billing';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { LiquidGlassFilter } from './components/motion/LiquidGlassFilter';
import type { ReactNode } from 'react';

function RequireAuth({ children }: { children: ReactNode }) {
  const { clinicId } = useAuth();
  return clinicId ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <LiquidGlassFilter />
      <BrowserRouter>
        <Routes>
          {/* Public sales funnel */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding/:clinicId" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/leads"
            element={
              <RequireAuth>
                <Leads />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/ab-testing"
            element={
              <RequireAuth>
                <ABTesting />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            }
          />
          <Route
            path="/leads/:leadId"
            element={
              <RequireAuth>
                <LeadDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/demo"
            element={
              <RequireAuth>
                <Demo />
              </RequireAuth>
            }
          />
          <Route
            path="/billing"
            element={
              <RequireAuth>
                <Billing />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
