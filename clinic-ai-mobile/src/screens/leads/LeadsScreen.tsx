import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LeadCard } from '../../components/LeadCard';
import { metricsApi, type Lead } from '../../services/api';
import type { LeadsStackParamList } from '../../navigation/types';

interface Props {
  clinicId: string;
}

type Nav = NativeStackNavigationProp<LeadsStackParamList, 'LeadsList'>;

export function LeadsScreen({ clinicId }: Props) {
  const navigation = useNavigation<Nav>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metricsApi
      .leads(clinicId)
      .then(setLeads)
      .catch((e: unknown) => setError((e as Error)?.message ?? 'Error'))
      .finally(() => setLoading(false));
  }, [clinicId]);

  const filtered = filter
    ? leads.filter(
        (l) =>
          l.name?.toLowerCase().includes(filter.toLowerCase()) ||
          l.phone.includes(filter),
      )
    : leads;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={filter}
        onChangeText={setFilter}
        placeholder="Buscar por nombre o teléfono…"
        placeholderTextColor="#94a3b8"
        clearButtonMode="while-editing"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })}>
            <LeadCard lead={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay leads que coincidan</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  error: { color: '#ef4444', textAlign: 'center', marginBottom: 8 },
});
