import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/dashboard/LeadMetricsPanel';
import { leadDetailApi, type LeadWithHistory } from '../services/leadApi';

function ChatBubble({ role, content, timestamp, index }: { role: 'LEAD' | 'AGENT'; content: string; timestamp: string; index: number }) {
  const isAgent = role === 'AGENT';
  const time = new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} mb-3`}
    >
      <div
        className={`max-w-md px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
          isAgent
            ? 'bg-emerald-gradient text-carbon-900 rounded-2xl rounded-tr-md'
            : 'bg-white/8 border border-white/12 text-ivory-100 rounded-2xl rounded-tl-md backdrop-blur-md'
        }`}
      >
        {content}
      </div>
      <p className="text-[10px] text-ivory-500 mt-1 px-1">
        {isAgent ? '🤖 Agente IA' : '👤 Lead'} · {date} {time}
      </p>
    </motion.div>
  );
}

export function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;
    leadDetailApi
      .get(leadId)
      .then(setLead)
      .catch((e: unknown) => setError((e as Error)?.message ?? 'Error'))
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <DashboardLayout title="Detalle de lead">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
      >
        ← Volver
      </button>

      {loading && <p className="text-ivory-400">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}

      {lead && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="card-premium p-5 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-soft border border-white/15 flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-semibold text-ivory-100">{lead.name ?? 'Sin nombre'}</p>
                <p className="text-sm font-mono text-ivory-500">{lead.phone}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ivory-500">Estado</span>
                <StatusBadge status={lead.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-500">Email</span>
                <span className="text-ivory-300">{lead.email ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-500">Mensajes</span>
                <span className="font-semibold text-emerald-300">{lead.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-500">Interacciones</span>
                <span className="font-semibold text-ivory-200">{lead.interactions.length}</span>
              </div>
              {lead.tags.length > 0 && (
                <div>
                  <span className="text-ivory-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 text-ivory-300 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conversation history */}
          <div className="lg:col-span-2 card-premium overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <span className="text-sm font-semibold text-ivory-200">Historial de conversación</span>
              <span className="text-xs text-ivory-500">({lead.interactions.length} mensajes)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-black/20 min-h-[400px] max-h-[600px]">
              {lead.interactions.length === 0 && (
                <p className="text-center text-ivory-400 text-sm mt-8">Sin mensajes todavía</p>
              )}
              {lead.interactions.map((i, idx) => (
                <ChatBubble
                  key={i.id}
                  index={idx}
                  role={i.senderRole}
                  content={i.content}
                  timestamp={i.timestamp}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
