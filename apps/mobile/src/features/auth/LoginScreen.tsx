import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useI18n } from '../../i18n/I18nProvider';
import {
  fetchEmployeeProfile,
  bootstrapMasters,
  loginWithPassword,
} from '../../lib/sync-service';
import { getMpinHash, hashMpin, saveSession } from '../../lib/auth-store';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t, language } = useI18n();
  const setSession = useSessionStore((state) => state.setSession);
  const [userName, setUserName] = useState('mr1');
  const [password, setPassword] = useState('Mr@123');
  const [compCode, setCompCode] = useState('SYN');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const token = await loginWithPassword({ userName, password, compCode, language });
      const profile = await fetchEmployeeProfile(token.access_token, language);
      const employee = JSON.parse(token.employeeObj) as {
        firstName: string;
        lastName?: string;
        roleName?: string;
        userName: string;
      };

      const session = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        compCode: token.compCode,
        compName: token.compName,
        empId: token.empId,
        headQuarterId: profile.headQuarterId,
        employee: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          roleName: employee.roleName,
          userName: employee.userName,
        },
      };

      await saveSession(session);
      setSession(session);

      if (profile.headQuarterId) {
        await bootstrapMasters(token.access_token, language, profile.headQuarterId);
      }

      const mpin = await getMpinHash();
      navigation.replace(mpin ? 'MpinUnlock' : 'MpinSetup');
    } catch {
      Alert.alert(t('common.error'), t('mobile.login.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.login.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.login.subtitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('mobile.login.userName')}
        autoCapitalize="none"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('mobile.login.password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('mobile.login.compCode')}
        autoCapitalize="characters"
        value={compCode}
        onChangeText={setCompCode}
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('mobile.login.signIn')}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f7fb' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#102a43' },
  subtitle: { fontSize: 14, color: '#486581', marginBottom: 24 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#127fbf',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
