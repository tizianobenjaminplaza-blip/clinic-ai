import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: string | number;
  accent?: string;
}

export function MetricsCard({ label, value, accent = '#2563eb' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  value: { fontSize: 26, fontWeight: '700' },
});
