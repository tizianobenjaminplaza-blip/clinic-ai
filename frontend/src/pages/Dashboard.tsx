import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../hooks/useMetrics';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { LeadMetricsPanel } from '../components/dashboard/LeadMetricsPanel';
import { FunnelChart } from '../components/analytics/FunnelChart';
import { Reveal } from '../components/motion/PageTransition';

export function Dashboard() {
  const { clinicId } = useAuth();
  const { metrics, leads, loading, error } = useMetrics(clinicId);

  return (
    <DashboardLayout title="Dashboard">
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-premium p-5 h-28 animate-pulse">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="mt-4 h-7 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-rose-400">Error: {error}</p>}

      {metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricsCard label="Total leads" value={metrics.totalLeads} icon="◉" accent="platinum" trend={12} hint="vs. mes anterior" />
            <MetricsCard
              label="Tasa de conversión"
              value={metrics.conversionRate}
              suffix="%"
              icon="◈"
              accent="emerald"
              trend={5}
            />
            <MetricsCard
              label="Convertidos"
              value={metrics.byStatus['CONVERTED'] ?? 0}
              icon="✓"
              accent="emerald"
              hint="leads cerrados"
            />
            <MetricsCard label="Mensajes totales" value={metrics.totalMessages} icon="❝" accent="neutral" hint="atendidos por IA" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Reveal>
              <ConversionChart data={metrics.leadsOverTime} />
            </Reveal>
            <Reveal>
              <FunnelChart data={metrics.funnel} />
            </Reveal>
          </div>

          <Reveal>
            <LeadMetricsPanel leads={leads.slice(0, 8)} />
          </Reveal>
        </>
      )}
    </DashboardLayout>
  );
}
