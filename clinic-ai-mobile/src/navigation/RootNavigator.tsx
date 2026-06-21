import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { LeadsScreen } from '../screens/leads/LeadsScreen';
import { LeadDetailScreen } from '../screens/leads/LeadDetailScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { authStorage } from '../services/auth';
import type { LeadsStackParamList } from './types';

const Tab = createBottomTabNavigator();
const LeadsStack = createNativeStackNavigator<LeadsStackParamList>();

function LeadsNavigator({ clinicId }: { clinicId: string }) {
  return (
    <LeadsStack.Navigator>
      <LeadsStack.Screen name="LeadsList" options={{ title: 'Leads' }}>
        {() => <LeadsScreen clinicId={clinicId} />}
      </LeadsStack.Screen>
      <LeadsStack.Screen
        name="LeadDetail"
        component={LeadDetailScreen}
        options={{ title: 'Detalle de lead' }}
      />
    </LeadsStack.Navigator>
  );
}

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
          options={{ tabBarIcon: () => <TabIcon icon="👥" />, headerShown: false }}
        >
          {() => <LeadsNavigator clinicId={clinicId} />}
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
