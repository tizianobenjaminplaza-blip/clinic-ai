import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../hooks/useMetrics';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { FunnelChart } from '../components/analytics/FunnelChart';
import { MetricsCard } from '../components/dashboard/MetricsCard';

export function Analytics() {
  const { clinicId } = useAuth();
  const { metrics, loading, error } = useMetrics(clinicId);

  return (
    <DashboardLayout title="Analytics">
      {loading && <p className="text-slate-400">Cargando…</p>}
      {error && <p className="text-rose-600">Error: {error}</p>}

      {metrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <MetricsCard key={status} label={status} value={count} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionChart data={metrics.leadsOverTime} />
            <FunnelChart data={metrics.funnel} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
