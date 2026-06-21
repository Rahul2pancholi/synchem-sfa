import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useI18n } from '../../i18n/I18nProvider';
import { getMpinHash, hashMpin } from '../../lib/auth-store';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MpinUnlock'>;

export function MpinUnlockScreen({ navigation }: Props) {
  const { t } = useI18n();
  const setMpinVerified = useSessionStore((state) => state.setMpinVerified);
  const [mpin, setMpin] = useState('');

  async function handleUnlock() {
    const stored = await getMpinHash();
    if (!stored || hashMpin(mpin) !== stored) {
      Alert.alert(t('common.error'), t('mobile.mpin.invalid'));
      return;
    }
    setMpinVerified(true);
    navigation.replace('Dashboard');
  }

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
});
