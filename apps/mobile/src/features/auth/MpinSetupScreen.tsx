import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useI18n } from '../../i18n/I18nProvider';
import { getMpinHash, hashMpin, saveMpinHash } from '../../lib/auth-store';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MpinSetup'>;

export function MpinSetupScreen({ navigation }: Props) {
  const { t } = useI18n();
  const setMpinVerified = useSessionStore((state) => state.setMpinVerified);
  const [mpin, setMpin] = useState('');
  const [confirm, setConfirm] = useState('');

  async function handleSave() {
    if (!/^\d{4}$/.test(mpin) || mpin !== confirm) {
      Alert.alert(t('common.error'), t('mobile.mpin.invalid'));
      return;
    }
    await saveMpinHash(hashMpin(mpin));
    setMpinVerified(true);
    navigation.replace('Dashboard');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.mpin.setupTitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('mobile.mpin.enter')}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={mpin}
        onChangeText={setMpin}
      />
      <TextInput
        style={styles.input}
        placeholder={t('mobile.mpin.confirm')}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={confirm}
        onChangeText={setConfirm}
      />
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{t('mobile.mpin.save')}</Text>
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
