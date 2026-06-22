import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useI18n } from '../../i18n/I18nProvider';
import { authenticateWithBiometric, canUseBiometric } from '../../lib/biometric';
import { getMpinHash, hashMpin } from '../../lib/auth-store';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MpinUnlock'>;

export function MpinUnlockScreen({ navigation }: Props) {
  const { t } = useI18n();
  const setMpinVerified = useSessionStore((state) => state.setMpinVerified);
  const [mpin, setMpin] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  async function unlockSuccess() {
    setMpinVerified(true);
    navigation.replace('Dashboard');
  }

  async function handleUnlock() {
    const stored = await getMpinHash();
    if (!stored || hashMpin(mpin) !== stored) {
      Alert.alert(t('common.error'), t('mobile.mpin.invalid'));
      return;
    }
    await unlockSuccess();
  }

  async function handleBiometric() {
    const ok = await authenticateWithBiometric(t('mobile.biometric.prompt'));
    if (ok) await unlockSuccess();
  }

  useEffect(() => {
    void (async () => {
      const available = await canUseBiometric();
      setBiometricAvailable(available);
      if (available) await handleBiometric();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.mpin.unlockTitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('mobile.mpin.enter')}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={mpin}
        onChangeText={setMpin}
      />
      {biometricAvailable ? (
        <Pressable style={styles.secondaryButton} onPress={handleBiometric}>
          <Text style={styles.secondaryText}>{t('mobile.biometric.prompt')}</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.button} onPress={handleUnlock}>
        <Text style={styles.buttonText}>{t('mobile.login.signIn')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f7fb' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#102a43' },
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
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  secondaryText: { color: '#127fbf', fontWeight: '600' },
});
