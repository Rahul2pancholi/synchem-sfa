import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { MpinSetupScreen } from './src/features/auth/MpinSetupScreen';
import { MpinUnlockScreen } from './src/features/auth/MpinUnlockScreen';
import { DashboardScreen } from './src/features/dashboard/DashboardScreen';
import { DcrListScreen } from './src/features/dcr/DcrListScreen';
import { DcrCreateScreen } from './src/features/dcr/DcrCreateScreen';
import { RtpCalendarScreen } from './src/features/rtp/RtpCalendarScreen';
import { I18nProvider } from './src/i18n/I18nProvider';
import { getMpinHash, loadSession } from './src/lib/auth-store';
import type { RootStackParamList } from './src/navigation/types';
import { useSessionStore } from './src/store/session-store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    void (async () => {
      const session = await loadSession();
      if (!session) {
        setInitialRoute('Login');
        setBooting(false);
        return;
      }
      setSession(session);
      const mpin = await getMpinHash();
      setInitialRoute(mpin ? 'MpinUnlock' : 'MpinSetup');
      setBooting(false);
    })();
  }, [setSession]);

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <I18nProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: true }}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MpinSetup" component={MpinSetupScreen} />
          <Stack.Screen name="MpinUnlock" component={MpinUnlockScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="DcrList" component={DcrListScreen} />
          <Stack.Screen name="DcrCreate" component={DcrCreateScreen} />
          <Stack.Screen name="RtpCalendar" component={RtpCalendarScreen} options={{ title: 'RTP' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nProvider>
  );
}
