import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Lead, LeadStatus } from '../../services/api';

const statusStyles: Record<LeadStatus, string> = {
  NEW: 'bg-ivory-400/12 text-ivory-300',
  ENGAGED: 'bg-emerald-500/12 text-emerald-200',
  QUALIFIED: 'bg-emerald-500/15 text-emerald-200',
  CONVERTED: 'bg-emerald-500/12 text-emerald-300',
  LOST: 'bg-rose-500/12 text-rose-300',
};

const statusDot: Record<LeadStatus, string> = {
  NEW: 'bg-ivory-400',
  ENGAGED: 'bg-emerald-400',
  QUALIFIED: 'bg-emerald-300',
  CONVERTED: 'bg-emerald-400',
  LOST: 'bg-rose-400',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  );
}

function initials(name: string | null, phone: string) {
  if (name) return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return phone.slice(-2);
}

export function LeadMetricsPanel({ leads }: { leads: Lead[] }) {
  const navigate = useNavigate();
  return (
    <div className="card-premium overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10">
        <h2 className="text-sm font-semibold text-ivory-200 tracking-tight">Leads recientes</h2>
        <button
          onClick={() => navigate('/leads')}
          className="text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
        >
          Ver todos →
        </button>
      </div>
      <div className="divide-y divide-emerald-500/[0.06]">
        {leads.length === 0 && (
          <p className="px-5 py-10 text-center text-ivory-500 text-sm">Sin leads todavía</p>
        )}
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
            whileHover={{ backgroundColor: 'rgba(16,185,129,0.05)' }}
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-500/20 bg-emerald-soft text-xs font-semibold text-emerald-200">
              {initials(lead.name, lead.phone)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ivory-200 truncate tracking-tight">{lead.name ?? 'Sin nombre'}</p>
              <p className="text-xs font-mono text-ivory-500">{lead.phone}</p>
            </div>
            <StatusBadge status={lead.status} />
            <div className="hidden sm:flex items-center gap-1.5 text-ivory-500 text-sm w-14 justify-end">
              <span className="text-xs">❝</span>
              <span className="font-medium text-ivory-300">{lead.messageCount}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
