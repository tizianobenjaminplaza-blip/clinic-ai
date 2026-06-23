import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/motion/AnimatedBackground';

const DEMO_ID = 'cmqoifat40000vm7s87stjkjg';

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
    const id = clinicId.trim();
    if (!id) return;
    login(id, 'demo-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-soft text-3xl mb-5">
            🦷
          </div>
          <h1 className="font-display text-3xl font-medium text-emerald-grad tracking-tight">Clinic AI</h1>
          <p className="text-sm text-ivory-400 mt-2 tracking-tight">El agente que vende mientras duermes</p>
        </motion.div>

        <form onSubmit={submit} className="glass-strong rounded-3xl p-8">
          <label className="block text-sm font-medium text-ivory-300 mb-2 tracking-tight">Clinic ID</label>
          <input
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            placeholder="Identificador de tu clínica"
            className="w-full rounded-xl border border-emerald-500/15 bg-white/[0.03] text-ivory-100 placeholder:text-ivory-500 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-transparent transition"
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full bg-emerald-gradient text-carbon-900 font-semibold py-3 rounded-xl shadow-glow transition tracking-tight"
          >
            Entrar al panel →
          </motion.button>

          <button
            type="button"
            onClick={() => setClinicId(DEMO_ID)}
            className="mt-3 w-full text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
          >
            Usar clínica de demostración
          </button>

          <p className="mt-5 text-center text-xs text-ivory-500">
            En producción: Auth0 + verificación en 2 pasos
          </p>
        </form>
      </motion.div>
    </div>
  );
}
