import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/motion/AnimatedBackground';
import { salesApi } from '../services/salesApi';

interface ServiceRow { name: string; price: string }
interface FaqRow { question: string; answer: string }
interface TeamRow { name: string; role: string }

export function Onboarding() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [services, setServices] = useState<ServiceRow[]>([{ name: '', price: '' }]);
  const [faqs, setFaqs] = useState<FaqRow[]>([{ question: '', answer: '' }]);
  const [team, setTeam] = useState<TeamRow[]>([{ name: '', role: '' }]);

  useEffect(() => {
    if (!clinicId) return;
    salesApi
      .getContext(clinicId)
      .then((ctx) => {
        setName(ctx.clinic.name);
        setWhatsapp(ctx.clinic.whatsappPhone ?? '');
        if (ctx.services.length) setServices(ctx.services.map((s) => ({ name: s.name, price: String(s.price) })));
        if (ctx.faqs.length) setFaqs(ctx.faqs.map((f) => ({ question: f.question, answer: f.answer })));
        if (ctx.teamMembers.length) setTeam(ctx.teamMembers.map((t) => ({ name: t.name, role: t.role })));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [clinicId]);

  const save = async () => {
    if (!clinicId) return;
    setSaving(true);
    try {
      await salesApi.saveOnboarding(clinicId, {
        name: name.trim() || undefined,
        whatsappPhone: whatsapp.trim(),
        services: services
          .filter((s) => s.name.trim())
          .map((s) => ({ name: s.name.trim(), price: Number(s.price) || 0 })),
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
        teamMembers: team.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), role: t.role.trim() || 'Equipo' })),
      });
      setDone(true);
    } catch {
      alert('No se pudo guardar. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const goToDashboard = () => {
    if (!clinicId) return;
    login(clinicId, 'onboarding-token');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <AnimatedBackground />
        <p className="text-ivory-400">Cargando…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <AnimatedBackground />
        <div className="card-premium p-8 text-center max-w-sm">
          <p className="text-ivory-200">No encontramos esta clínica.</p>
          <button onClick={() => navigate('/landing')} className="mt-4 text-emerald-300 text-sm">← Volver</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <AnimatedBackground />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-premium p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-medium text-ivory-100 mb-2">¡Tu agente está listo!</h2>
          <p className="text-sm text-ivory-400 mb-6">
            Ya responde a tus pacientes 24/7 con el contexto de tu clínica. Entra a tu panel para ver los leads en tiempo real.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goToDashboard}
            className="w-full bg-emerald-gradient text-carbon-900 font-semibold py-3 rounded-xl shadow-glow"
          >
            Ir a mi panel →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-emerald-500/15 bg-white/[0.03] text-ivory-100 placeholder:text-ivory-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition';

  return (
    <div className="relative min-h-screen py-10 px-4">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-emerald-300 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pago confirmado · Plan PRO activo
          </div>
          <h1 className="font-display text-3xl font-medium text-ivory-100 tracking-tight">Personaliza tu agente</h1>
          <p className="text-sm text-ivory-400 mt-2">Esto es lo que tu agente sabrá sobre tu clínica al responder.</p>
        </div>

        {/* Clinic basics */}
        <section className="card-premium p-6 mb-4">
          <h3 className="text-sm font-semibold text-ivory-200 mb-4">Datos de la clínica</h3>
          <div className="space-y-3">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la clínica" />
            <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp Business (ej. 34611223344)" />
          </div>
        </section>

        {/* Services */}
        <ListSection
          title="Servicios y precios"
          rows={services}
          onAdd={() => setServices([...services, { name: '', price: '' }])}
          onRemove={(i) => setServices(services.filter((_, x) => x !== i))}
          render={(row, i) => (
            <div className="flex gap-2">
              <input className={inputCls} value={row.name} onChange={(e) => setServices(services.map((s, x) => x === i ? { ...s, name: e.target.value } : s))} placeholder="Servicio (ej. Limpieza)" />
              <input className={`${inputCls} w-28`} value={row.price} onChange={(e) => setServices(services.map((s, x) => x === i ? { ...s, price: e.target.value } : s))} placeholder="€" inputMode="decimal" />
            </div>
          )}
        />

        {/* FAQs */}
        <ListSection
          title="Preguntas frecuentes"
          rows={faqs}
          onAdd={() => setFaqs([...faqs, { question: '', answer: '' }])}
          onRemove={(i) => setFaqs(faqs.filter((_, x) => x !== i))}
          render={(row, i) => (
            <div className="space-y-2">
              <input className={inputCls} value={row.question} onChange={(e) => setFaqs(faqs.map((f, x) => x === i ? { ...f, question: e.target.value } : f))} placeholder="Pregunta (ej. ¿Tienen parking?)" />
              <input className={inputCls} value={row.answer} onChange={(e) => setFaqs(faqs.map((f, x) => x === i ? { ...f, answer: e.target.value } : f))} placeholder="Respuesta" />
            </div>
          )}
        />

        {/* Team */}
        <ListSection
          title="Equipo"
          rows={team}
          onAdd={() => setTeam([...team, { name: '', role: '' }])}
          onRemove={(i) => setTeam(team.filter((_, x) => x !== i))}
          render={(row, i) => (
            <div className="flex gap-2">
              <input className={inputCls} value={row.name} onChange={(e) => setTeam(team.map((t, x) => x === i ? { ...t, name: e.target.value } : t))} placeholder="Nombre (ej. Dra. Ana)" />
              <input className={inputCls} value={row.role} onChange={(e) => setTeam(team.map((t, x) => x === i ? { ...t, role: e.target.value } : t))} placeholder="Rol (ej. Ortodoncista)" />
            </div>
          )}
        />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={save}
          disabled={saving}
          className="w-full bg-emerald-gradient text-carbon-900 font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-50 transition mt-2"
        >
          {saving ? 'Guardando…' : 'Activar mi agente con este contexto →'}
        </motion.button>
      </div>
    </div>
  );
}

function ListSection<T>({
  title, rows, onAdd, onRemove, render,
}: {
  title: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (row: T, i: number) => React.ReactNode;
}) {
  return (
    <section className="card-premium p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ivory-200">{title}</h3>
        <button onClick={onAdd} className="text-xs font-medium text-emerald-300 hover:text-emerald-200">+ Añadir</button>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">{render(row, i)}</div>
            {rows.length > 1 && (
              <button onClick={() => onRemove(i)} className="text-ivory-500 hover:text-rose-400 text-lg leading-none mt-1.5">×</button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
