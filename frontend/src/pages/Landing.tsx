import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/motion/AnimatedBackground';
import { salesApi } from '../services/salesApi';

const PAIN_POINTS = [
  ['📵', 'Pierdes pacientes', 'El 60% de las consultas llegan fuera de horario y nadie responde a tiempo.'],
  ['⏳', 'Recepción saturada', 'Tu equipo no da abasto entre el teléfono, WhatsApp y los pacientes en sala.'],
  ['💸', 'Leads que se enfrían', 'Una respuesta tardía es una cita perdida que se va a la competencia.'],
];

const FEATURES = [
  ['🤖', 'Responde 24/7', 'Tu agente contesta al instante, de día y de noche, con el tono de tu clínica.'],
  ['🎯', 'Capta y califica leads', 'Cada conversación queda registrada y puntuada en tu panel.'],
  ['📅', 'Agenda citas solo', 'Entiende fechas y horarios aunque el paciente escriba con prisa o faltas.'],
  ['🧠', 'Conoce tu clínica', 'Servicios, precios, FAQs y equipo: responde con tu contexto real.'],
  ['📊', 'Analítica en vivo', 'Conversión, mensajes y embudo en tiempo real.'],
  ['🔒', 'Sin contratos', 'Activa o cancela cuando quieras. Cumplimiento GDPR/CCPA.'],
];

const PLAN_FEATURES = [
  'Agente IA en WhatsApp 24/7',
  'Leads ilimitados y captura automática',
  'Agendado inteligente de citas',
  'Panel de analítica en tiempo real',
  'A/B testing de mensajes con IA',
  'Reportes PDF mensuales',
];

export function Landing() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      // Try real Stripe first; fall back to demo activation when not configured.
      try {
        const { url } = await salesApi.checkout(email.trim(), name.trim() || undefined);
        window.location.href = url;
        return;
      } catch {
        const { onboardingUrl } = await salesApi.signupActivate(email.trim(), name.trim() || undefined);
        navigate(onboardingUrl);
      }
    } catch {
      setErr('No se pudo iniciar la activación. Inténtalo de nuevo.');
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      {/* Nav */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-soft text-emerald-300">🦷</div>
          <span className="font-display text-lg font-medium text-emerald-grad tracking-tight">Clinic AI</span>
        </div>
        <button onClick={() => navigate('/login')} className="text-sm text-ivory-300 hover:text-ivory-100 transition">
          Acceder al panel →
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center pt-16 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-emerald-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Agente de IA para clínicas dentales
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-ivory-100 leading-[1.05]">
            El agente que <span className="text-emerald-grad">vende</span> mientras tu clínica duerme
          </h1>
          <p className="mt-6 text-lg text-ivory-300 max-w-2xl mx-auto leading-relaxed">
            Responde WhatsApp 24/7, capta y califica cada lead, y agenda citas solo —
            con el contexto real de tu clínica. Sin que tu equipo levante el teléfono.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(true)}
              className="bg-emerald-gradient text-carbon-900 font-semibold px-7 py-3.5 rounded-xl shadow-glow text-base"
            >
              Activar mi agente →
            </motion.button>
            <span className="text-sm text-ivory-400">Listo en 2 minutos · sin permanencia</span>
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-ivory-500 mb-8">¿Te suena?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIN_POINTS.map(([icon, title, body], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-premium p-6"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-ivory-100 mb-1.5">{title}</h3>
              <p className="text-sm text-ivory-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution / features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-medium text-center text-ivory-100 mb-3 tracking-tight">
          Tu recepcionista de IA, siempre despierta
        </h2>
        <p className="text-center text-ivory-400 mb-10 max-w-2xl mx-auto">
          Se conecta a tu WhatsApp y convierte cada mensaje en una oportunidad.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(([icon, title, body], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-premium p-5"
            >
              <div className="text-xl mb-2.5">{icon}</div>
              <h3 className="font-semibold text-ivory-100 text-[15px] mb-1">{title}</h3>
              <p className="text-sm text-ivory-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-6 py-12">
        <div className="card-premium p-8 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 blur-3xl" />
          <div className="relative text-center">
            <div className="inline-flex rounded-full bg-emerald-500/12 text-emerald-300 px-3 py-1 text-xs font-medium mb-4">Plan PRO</div>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="font-display text-5xl font-medium text-ivory-100">€149</span>
              <span className="text-ivory-400 mb-2">/mes</span>
            </div>
            <p className="text-sm text-ivory-400 mb-6">Todo incluido. Sin permanencia.</p>
            <ul className="space-y-2.5 text-left mb-7">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ivory-300">
                  <span className="text-emerald-400 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              className="w-full bg-emerald-gradient text-carbon-900 font-semibold py-3.5 rounded-xl shadow-glow"
            >
              Activar mi agente →
            </motion.button>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-ivory-500 py-10">
        © {new Date().getFullYear()} Clinic AI · Hecho para clínicas que no quieren perder pacientes
      </footer>

      {/* Signup modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={() => !busy && setOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl p-8 w-full max-w-md"
          >
            <h3 className="font-display text-2xl font-medium text-ivory-100 mb-1">Activa tu agente</h3>
            <p className="text-sm text-ivory-400 mb-6">Te llevamos al pago seguro y luego personalizas tu agente.</p>
            <form onSubmit={startCheckout} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de tu clínica"
                className="w-full rounded-xl border border-emerald-500/15 bg-white/[0.03] text-ivory-100 placeholder:text-ivory-500 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email de la clínica"
                className="w-full rounded-xl border border-emerald-500/15 bg-white/[0.03] text-ivory-100 placeholder:text-ivory-500 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
              />
              {err && <p className="text-xs text-rose-400">{err}</p>}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
                className="w-full bg-emerald-gradient text-carbon-900 font-semibold py-3 rounded-xl shadow-glow disabled:opacity-50 transition"
              >
                {busy ? 'Procesando…' : 'Continuar al pago →'}
              </motion.button>
            </form>
            <p className="mt-4 text-center text-[11px] text-ivory-500">
              Pago seguro con Stripe · Recibirás un email para personalizar tu agente
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
