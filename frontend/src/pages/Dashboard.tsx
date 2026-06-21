import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../hooks/useMetrics';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { LeadMetricsPanel } from '../components/dashboard/LeadMetricsPanel';
import { FunnelChart } from '../components/analytics/FunnelChart';

export function Dashboard() {
  const { clinicId } = useAuth();
  const { metrics, leads, loading, error } = useMetrics(clinicId);

  return (
    <DashboardLayout title="Dashboard">
      {loading && <p className="text-slate-400">Cargando métricas…</p>}
      {error && <p className="text-rose-600">Error: {error}</p>}

      {metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricsCard label="Total leads" value={metrics.totalLeads} />
            <MetricsCard
              label="Tasa de conversión"
              value={`${metrics.conversionRate}%`}
              accent="green"
            />
            <MetricsCard
              label="Convertidos"
              value={metrics.byStatus['CONVERTED'] ?? 0}
              accent="green"
            />
            <MetricsCard label="Mensajes totales" value={metrics.totalMessages} accent="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ConversionChart data={metrics.leadsOverTime} />
            <FunnelChart data={metrics.funnel} />
          </div>

          <LeadMetricsPanel leads={leads.slice(0, 8)} />
        </>
      )}
    </DashboardLayout>
  );
}
