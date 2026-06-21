import type { Lead, LeadStatus } from '../../services/api';

const statusStyles: Record<LeadStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  ENGAGED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-amber-100 text-amber-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-rose-100 text-rose-700',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

export function LeadMetricsPanel({ leads }: { leads: Lead[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <h2 className="text-sm font-semibold text-slate-700 px-5 py-4 border-b border-slate-100">
        Leads recientes
      </h2>
      <table className="w-full text-sm">
        <thead className="text-left text-slate-400">
          <tr>
            <th className="px-5 py-2 font-medium">Nombre</th>
            <th className="px-5 py-2 font-medium">Teléfono</th>
            <th className="px-5 py-2 font-medium">Estado</th>
            <th className="px-5 py-2 font-medium text-right">Mensajes</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                Sin leads todavía
              </td>
            </tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-slate-50 hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-700">{lead.name ?? '—'}</td>
              <td className="px-5 py-3 font-mono text-slate-500">{lead.phone}</td>
              <td className="px-5 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-5 py-3 text-right text-slate-600">{lead.messageCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
