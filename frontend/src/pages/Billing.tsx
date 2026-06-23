import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Reveal } from '../components/motion/PageTransition';
import { billingApi, type SubscriptionStatus } from '../services/billingApi';

const PLAN = {
  name: 'PRO',
  price: '149',
  period: '/mes',
  features: [
    'Agente IA en WhatsApp 24/7',
    'Leads ilimitados y captura automática',
    'Panel de analítica en tiempo real',
    'A/B testing de mensajes con IA',
    'Reportes PDF mensuales',
    'Soporte prioritario',
  ],
};

export function Billing() {
  const { clinicId } = useAuth();
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    if (!clinicId) return;
    billingApi.status(clinicId).then(setSub).finally(() => setLoading(false));
  };
  useEffect(load, [clinicId]);

  const active = sub?.isAgentActive;

  const payWithStripe = async () => {
    if (!clinicId) return;
    setBusy(true);
    setMsg(null);
    try {
      const { url } = await billingApi.checkout(clinicId);
      window.location.href = url; // redirect to Stripe Checkout
    } catch {
      setMsg('Stripe aún no está configurado. Usa la activación de demostración mientras tanto.');
      setBusy(false);
    }
  };

  const activateDemo = async () => {
    if (!clinicId) return;
    setBusy(true);
    setMsg(null);
    try {
      await billingApi.demoActivate(clinicId);
      setMsg('✅ ¡Agente activado! Se ha enviado el email de bienvenida (simulado).');
      load();
    } catch {
      setMsg('No se pudo activar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout title="Activación">
      {loading && <p className="text-ivory-400">Cargando…</p>}

      {sub && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Status card */}
          <Reveal>
            <div className="card-premium p-6">
              <h3 className="text-sm font-semibold text-ivory-200 mb-4 tracking-tight">Estado de tu agente</h3>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`h-3 w-3 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-ivory-500'}`}
                />
                <span className={`text-lg font-display font-medium ${active ? 'text-emerald-300' : 'text-ivory-300'}`}>
                  {active ? 'Activo · respondiendo 24/7' : 'Inactivo'}
                </span>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ivory-500">Plan</dt>
                  <dd className="text-ivory-200 font-medium">{sub.plan}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ivory-500">Estado suscripción</dt>
                  <dd className="text-ivory-200">{sub.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ivory-500">Desde</dt>
                  <dd className="text-ivory-200">
                    {sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-ES') : '—'}
                  </dd>
                </div>
              </dl>
              {sub.stripeMockMode && (
                <p className="mt-4 text-[11px] text-amber-300/80 bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2">
                  Modo demostración: Stripe no está configurado. La activación simula el pago real.
                </p>
              )}
            </div>
          </Reveal>

          {/* Plan / pricing card */}
          <Reveal>
            <div className="card-premium p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 text-emerald-300 px-2.5 py-1 text-xs font-medium mb-3">
                  Plan {PLAN.name}
                </div>
                <div className="flex items-end gap-1 mb-5">
                  <span className="font-display text-4xl font-medium text-ivory-100">€{PLAN.price}</span>
                  <span className="text-ivory-400 mb-1">{PLAN.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {PLAN.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ivory-300">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {active ? (
                  <div className="text-center text-sm text-emerald-300 bg-emerald-500/10 rounded-xl py-3 font-medium">
                    Tu plan está activo 🎉
                  </div>
                ) : (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={busy}
                      onClick={payWithStripe}
                      className="w-full bg-emerald-gradient text-carbon-900 font-semibold py-3 rounded-xl shadow-glow disabled:opacity-50 transition"
                    >
                      {busy ? 'Procesando…' : 'Pagar y activar con Stripe'}
                    </motion.button>
                    <button
                      disabled={busy}
                      onClick={activateDemo}
                      className="w-full text-xs font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-50 transition py-1"
                    >
                      ✨ Simular activación (demo, sin pago real)
                    </button>
                  </div>
                )}
                {msg && <p className="mt-3 text-xs text-ivory-300">{msg}</p>}
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </DashboardLayout>
  );
}
