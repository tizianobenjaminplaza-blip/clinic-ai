import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import type { LeadsStackParamList } from '../../navigation/types';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Interaction {
  id: string;
  senderRole: 'LEAD' | 'AGENT';
  content: string;
  timestamp: string;
}

interface LeadDetail {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  status: string;
  messageCount: number;
  tags: string[];
  interactions: Interaction[];
}

type Route = RouteProp<LeadsStackParamList, 'LeadDetail'>;

function Bubble({ item }: { item: Interaction }) {
  const isAgent = item.senderRole === 'AGENT';
  const time = new Date(item.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={[styles.bubbleRow, isAgent && styles.bubbleRowRight]}>
      <View style={[styles.bubble, isAgent ? styles.bubbleAgent : styles.bubbleLead]}>
        <Text style={[styles.bubbleText, isAgent && styles.bubbleTextAgent]}>
          {item.content}
        </Text>
        <Text style={[styles.bubbleTime, isAgent && styles.bubbleTimeAgent]}>
          {isAgent ? '🤖' : '👤'} {time}
        </Text>
      </View>
    </View>
  );
}

export function LeadDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { leadId } = route.params;
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatRef = useRef<FlatList<Interaction>>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('clinicId');
        const res = await fetch(`${API}/api/leads/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLead(await res.json());
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error || !lead) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Lead no encontrado'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Info bar */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.leadName}>{lead.name ?? 'Sin nombre'}</Text>
          <Text style={styles.leadPhone}>{lead.phone}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{lead.status}</Text>
        </View>
      </View>

      {/* Chat */}
      <FlatList
        ref={flatRef}
        data={lead.interactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Bubble item={item} />}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sin mensajes todavía</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leadName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  leadPhone: { fontSize: 12, color: '#64748b', fontFamily: 'monospace' },
  statusBadge: { backgroundColor: '#e0e7ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: '#4338ca', fontSize: 11, fontWeight: '600' },
  chatContainer: { padding: 12, gap: 8 },
  bubbleRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 6 },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: '#1e293b', lineHeight: 20 },
  bubbleTextAgent: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  bubbleTimeAgent: { color: '#c7d2fe' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  errorText: { color: '#ef4444', textAlign: 'center' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
});
