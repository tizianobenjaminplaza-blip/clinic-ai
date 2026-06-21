import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/dashboard/LeadMetricsPanel';
import { leadDetailApi, type LeadWithHistory } from '../services/leadApi';

function ChatBubble({ role, content, timestamp }: { role: 'LEAD' | 'AGENT'; content: string; timestamp: string }) {
  const isAgent = role === 'AGENT';
  const time = new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  return (
    <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isAgent
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
        }`}
      >
        {content}
      </div>
      <p className="text-[10px] text-slate-400 mt-1 px-1">
        {isAgent ? '🤖 Agente IA' : '👤 Lead'} · {date} {time}
      </p>
    </div>
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
        className="mb-4 text-sm text-brand-600 hover:underline flex items-center gap-1"
      >
        ← Volver
      </button>

      {loading && <p className="text-slate-400">Cargando…</p>}
      {error && <p className="text-rose-600">{error}</p>}

      {lead && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-semibold text-slate-800">{lead.name ?? 'Sin nombre'}</p>
                <p className="text-sm font-mono text-slate-500">{lead.phone}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <StatusBadge status={lead.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-700">{lead.email ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mensajes</span>
                <span className="font-semibold text-brand-600">{lead.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interacciones</span>
                <span className="font-semibold">{lead.interactions.length}</span>
              </div>
              {lead.tags.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conversation history */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Historial de conversación</span>
              <span className="text-xs text-slate-400">({lead.interactions.length} mensajes)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 min-h-[400px] max-h-[600px]">
              {lead.interactions.length === 0 && (
                <p className="text-center text-slate-400 text-sm mt-8">Sin mensajes todavía</p>
              )}
              {lead.interactions.map((i) => (
                <ChatBubble
                  key={i.id}
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
