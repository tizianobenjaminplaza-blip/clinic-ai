import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/dashboard/LeadMetricsPanel';
import { demoApi, type DemoLead } from '../services/demoApi';

interface Msg {
  id: string;
  role: 'LEAD' | 'AGENT';
  text: string;
  time: string;
}

const DEMO_PHONE = '34699000111';
const SUGGESTIONS = [
  '¿Cuánto cuesta una limpieza dental?',
  '¿Qué horario tenéis?',
  'Tengo un dolor de muelas muy fuerte',
  'Me interesa la ortodoncia invisible',
  'Quiero pedir una cita',
];

function now() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
function rid() {
  return Math.random().toString(36).slice(2);
}

export function Demo() {
  const { clinicId } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [lead, setLead] = useState<DemoLead | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || !clinicId || typing) return;
    setInput('');
    setMessages((m) => [...m, { id: rid(), role: 'LEAD', text, time: now() }]);
    setTyping(true);
    try {
      const res = await demoApi.send(clinicId, DEMO_PHONE, text, 'Paciente Demo');
      // Small delay so the typing indicator reads as "the agent is thinking".
      await new Promise((r) => setTimeout(r, 600));
      setMessages((m) => [...m, { id: rid(), role: 'AGENT', text: res.reply, time: now() }]);
      setLead(res.lead);
    } catch {
      setMessages((m) => [...m, { id: rid(), role: 'AGENT', text: '⚠️ Error de conexión con el agente.', time: now() }]);
    } finally {
      setTyping(false);
    }
  };

  const reset = async () => {
    if (!clinicId) return;
    await demoApi.reset(clinicId, DEMO_PHONE).catch(() => {});
    setMessages([]);
    setLead(null);
  };

  return (
    <DashboardLayout title="Demo en vivo">
      <p className="text-sm text-ivory-400 mb-6 max-w-2xl tracking-tight">
        Escribe como si fueras un paciente en WhatsApp. El agente IA responde solo y verás cómo
        <span className="text-emerald-300"> capta el lead en tiempo real</span> a la derecha.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Phone / WhatsApp ─────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="card-premium overflow-hidden flex flex-col h-[560px]">
            {/* WhatsApp-style header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-500/10">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-gradient text-carbon-900 text-base">
                🦷
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ivory-100">Clínica Dental Demo</p>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  en línea · responde al instante
                </p>
              </div>
              <button onClick={reset} className="text-xs text-ivory-400 hover:text-ivory-100 transition">
                Reiniciar
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-ivory-400 text-sm">
                    Empieza la conversación. Escribe abajo o usa una sugerencia.
                  </p>
                </div>
              )}
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={`flex ${m.role === 'LEAD' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-3.5 py-2 text-sm leading-relaxed shadow-soft ${
                      m.role === 'LEAD'
                        ? 'bg-emerald-gradient text-carbon-900 rounded-2xl rounded-tr-md'
                        : 'bg-white/8 border border-white/10 text-ivory-100 rounded-2xl rounded-tl-md backdrop-blur-md'
                    }`}
                  >
                    {m.text}
                    <span className={`block text-[9px] mt-1 ${m.role === 'LEAD' ? 'text-emerald-900/60' : 'text-ivory-500'}`}>
                      {m.role === 'AGENT' ? '🤖 ' : ''}{m.time}
                    </span>
                  </div>
                </motion.div>
              ))}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions + input */}
            <div className="border-t border-emerald-500/10 p-3">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={typing}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-40 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  className="flex-1 rounded-full border border-emerald-500/15 bg-white/[0.03] text-ivory-100 placeholder:text-ivory-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.92 }}
                  disabled={typing || !input.trim()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-emerald-gradient text-carbon-900 disabled:opacity-40 transition"
                >
                  ➤
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Live lead capture ────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-premium p-5">
            <h3 className="text-sm font-semibold text-ivory-200 mb-4 tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Lead capturado en vivo
            </h3>

            {!lead ? (
              <p className="text-sm text-ivory-500 py-6 text-center">
                Aún no hay lead. Envía el primer mensaje para que el agente lo cree automáticamente.
              </p>
            ) : (
              <motion.div
                key={lead.messageCount}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="space-y-3 text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-ivory-500">Estado</span>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-500">Nombre</span>
                  <span className="text-ivory-200">{lead.name ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-500">Teléfono</span>
                  <span className="font-mono text-ivory-300">{lead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-500">Mensajes</span>
                  <motion.span
                    key={lead.messageCount}
                    initial={{ scale: 1.4, color: '#34D399' }}
                    animate={{ scale: 1, color: '#6EE7B7' }}
                    className="font-display font-semibold text-lg"
                  >
                    {lead.messageCount}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="card-premium p-5">
            <h3 className="text-sm font-semibold text-ivory-200 mb-3 tracking-tight">Qué está pasando</h3>
            <ol className="space-y-2.5 text-[13px] text-ivory-400">
              {[
                ['📩', 'El paciente escribe por WhatsApp'],
                ['🧠', 'El agente IA entiende e improvisa la respuesta con el contexto de la clínica'],
                ['⚡', 'Responde al instante, 24/7, sin intervención humana'],
                ['📊', 'El lead queda registrado y puntuado en el panel'],
              ].map(([icon, txt]) => (
                <li key={txt} className="flex gap-2.5">
                  <span>{icon}</span>
                  <span>{txt}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
