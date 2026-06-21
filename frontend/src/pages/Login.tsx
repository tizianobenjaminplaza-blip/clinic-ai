import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login slice. Real auth is Auth0 + 2FA; here we accept a clinicId so the
 * dashboard can be explored against the seeded demo clinic.
 */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId.trim()) return;
    login(clinicId.trim(), 'demo-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-2xl font-bold text-brand-600 mb-1">🦷 Clinic AI</div>
        <p className="text-sm text-slate-500 mb-6">Accede al panel de tu clínica</p>

        <label className="block text-sm font-medium text-slate-700 mb-1">Clinic ID</label>
        <input
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          placeholder="cuid de la clínica (ver seed)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <button
          type="submit"
          className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          Entrar
        </button>
        <p className="mt-4 text-xs text-slate-400">
          En producción: Auth0 + 2FA (SMS/Email).
        </p>
      </form>
    </div>
  );
}
