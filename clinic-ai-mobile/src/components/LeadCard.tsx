import { StyleSheet, Text, View } from 'react-native';
import type { Lead } from '../services/api';

const statusColors: Record<string, string> = {
  NEW: '#94a3b8',
  ENGAGED: '#3b82f6',
  QUALIFIED: '#f59e0b',
  CONVERTED: '#10b981',
  LOST: '#ef4444',
};

export function LeadCard({ lead }: { lead: Lead }) {
  const color = statusColors[lead.status] ?? '#94a3b8';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{lead.name ?? 'Sin nombre'}</Text>
          <Text style={styles.phone}>{lead.phone}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.badgeText, { color }]}>{lead.status}</Text>
        </View>
      </View>
      <Text style={styles.messages}>💬 {lead.messageCount} mensajes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  phone: { fontSize: 12, color: '#64748b', fontFamily: 'monospace', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  messages: { fontSize: 12, color: '#94a3b8' },
});
