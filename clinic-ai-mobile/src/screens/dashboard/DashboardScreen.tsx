import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MetricsCard } from '../../components/MetricsCard';
import { metricsApi, type DashboardMetrics } from '../../services/api';

interface Props {
  clinicId: string;
}

export function DashboardScreen({ clinicId }: Props) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await metricsApi.overview(clinicId);
      setMetrics(data);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Error cargando métricas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [clinicId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(true); }}
          tintColor="#2563eb"
        />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.grid}>
        <MetricsCard label="Total leads" value={metrics?.totalLeads ?? 0} />
        <MetricsCard
          label="Conversión"
          value={`${metrics?.conversionRate ?? 0}%`}
          accent="#10b981"
        />
      </View>
      <View style={styles.grid}>
        <MetricsCard
          label="Convertidos"
          value={metrics?.byStatus['CONVERTED'] ?? 0}
          accent="#10b981"
        />
        <MetricsCard
          label="Mensajes"
          value={metrics?.totalMessages ?? 0}
          accent="#f59e0b"
        />
      </View>

      <Text style={styles.sectionTitle}>Embudo</Text>
      <View style={styles.funnelCard}>
        {(metrics?.funnel ?? []).map((stage) => (
          <View key={stage.stage} style={styles.funnelRow}>
            <Text style={styles.funnelStage}>{stage.stage}</Text>
            <Text style={styles.funnelCount}>{stage.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  grid: { flexDirection: 'row', marginHorizontal: -6, marginBottom: 4 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  funnelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  funnelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  funnelStage: { fontSize: 14, color: '#475569' },
  funnelCount: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  error: { color: '#ef4444', textAlign: 'center', padding: 16 },
});
