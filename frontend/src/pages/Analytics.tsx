import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../hooks/useMetrics';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { FunnelChart } from '../components/analytics/FunnelChart';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { Reveal } from '../components/motion/PageTransition';

const statusMeta: Record<string, { icon: string; accent: 'emerald' | 'platinum' | 'neutral' }> = {
  NEW: { icon: '○', accent: 'neutral' },
  ENGAGED: { icon: '◐', accent: 'platinum' },
  QUALIFIED: { icon: '◓', accent: 'platinum' },
  CONVERTED: { icon: '●', accent: 'emerald' },
  LOST: { icon: '✕', accent: 'neutral' },
};

export function Analytics() {
  const { clinicId } = useAuth();
  const { metrics, loading, error } = useMetrics(clinicId);

  return (
    <DashboardLayout title="Analytics">
      {loading && <p className="text-ivory-400">Cargando…</p>}
      {error && <p className="text-rose-400">Error: {error}</p>}

      {metrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {Object.entries(metrics.byStatus).map(([status, count]) => {
              const meta = statusMeta[status] ?? { icon: '•', accent: 'neutral' as const };
              return (
                <MetricsCard key={status} label={status} value={count} icon={meta.icon} accent={meta.accent} />
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Reveal>
              <ConversionChart data={metrics.leadsOverTime} />
            </Reveal>
            <Reveal>
              <FunnelChart data={metrics.funnel} />
            </Reveal>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
