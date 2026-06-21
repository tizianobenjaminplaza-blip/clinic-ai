import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { LeadsScreen } from '../screens/leads/LeadsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { authStorage } from '../services/auth';

const Tab = createBottomTabNavigator();

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 18 }}>{icon}</Text>;
}

export function RootNavigator() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authStorage.getClinicId().then((id) => {
      setClinicId(id);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  if (!clinicId) {
    return (
      <NavigationContainer>
        <LoginScreen onLogin={(id) => setClinicId(id)} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { color: '#0f172a', fontWeight: '700' },
          tabBarStyle: { borderTopColor: '#e2e8f0' },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          options={{ tabBarIcon: () => <TabIcon icon="📊" /> }}
        >
          {() => <DashboardScreen clinicId={clinicId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Leads"
          options={{ tabBarIcon: () => <TabIcon icon="👥" /> }}
        >
          {() => <LeadsScreen clinicId={clinicId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Analytics"
          options={{ tabBarIcon: () => <TabIcon icon="📈" /> }}
        >
          {() => <AnalyticsScreen clinicId={clinicId} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
