import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authStorage } from '../../services/auth';

interface Props {
  onLogin: (clinicId: string) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [clinicId, setClinicId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!clinicId.trim()) {
      Alert.alert('Error', 'Ingresa tu Clinic ID');
      return;
    }
    setLoading(true);
    // Real: Auth0 + 2FA flow. Here: store clinicId directly.
    await authStorage.save(clinicId.trim(), 'demo-token');
    onLogin(clinicId.trim());
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🦷</Text>
        <Text style={styles.title}>Clinic AI</Text>
        <Text style={styles.subtitle}>Panel de tu clínica</Text>

        <Text style={styles.label}>Clinic ID</Text>
        <TextInput
          style={styles.input}
          value={clinicId}
          onChangeText={setClinicId}
          placeholder="cuid de tu clínica"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Entrando…' : 'Entrar'}</Text>
        </TouchableOpacity>

        <Text style={styles.note}>En producción: Auth0 + 2FA</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#1d4ed8', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
});
