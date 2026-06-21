import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { metricsApi, type DashboardMetrics } from '../../services/api';

interface Props {
  clinicId: string;
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%` as `${number}%` }]} />
      </View>
      <Text style={barStyles.count}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 80, fontSize: 12, color: '#64748b' },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 5 },
  count: { width: 28, fontSize: 12, color: '#334155', textAlign: 'right' },
});

export function AnalyticsScreen({ clinicId }: Props) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metricsApi
      .overview(clinicId)
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, [clinicId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const maxStatus = Math.max(...Object.values(metrics?.byStatus ?? {}), 1);
  const maxDaily = Math.max(...(metrics?.leadsOverTime ?? []).map((d) => d.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Por estado</Text>
        {Object.entries(metrics?.byStatus ?? {}).map(([status, count]) => (
          <Bar key={status} label={status} value={count} max={maxStatus} />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Leads por día (14 días)</Text>
        {(metrics?.leadsOverTime ?? []).map((d) => (
          <Bar key={d.date} label={d.date.slice(5)} value={d.count} max={maxDaily} />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 12 },
});
