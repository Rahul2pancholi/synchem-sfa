import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useI18n } from '../../i18n/I18nProvider';
import { database } from '../../database';
import type { Doctor } from '../../database/models';
import { createOfflineDcr, submitOfflineDcr } from '../../lib/sync-service';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DcrCreate'>;

export function DcrCreateScreen({ navigation }: Props) {
  const { t } = useI18n();
  const session = useSessionStore((state) => state.session);
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [draftClientId, setDraftClientId] = useState<string | null>(null);

  useEffect(() => {
    void database
      .get<Doctor>('doctors')
      .query()
      .fetch()
      .then((rows) => {
        setDoctors(rows);
        if (rows[0]) setSelectedDoctorId(rows[0].serverId);
      });
  }, []);

  async function handleSaveDraft() {
    if (!selectedDoctorId) return;
    const clientId = await createOfflineDcr({
      workDate,
      headQuarterId: session?.headQuarterId,
      routeId: doctors.find((d) => d.serverId === selectedDoctorId)?.routeId,
      doctorServerId: selectedDoctorId,
    });
    setDraftClientId(clientId);
    Alert.alert(t('common.create'), t('mobile.dcr.statusDraft'));
  }

  async function handleSubmit() {
    let clientId = draftClientId;
    if (!clientId) {
      if (!selectedDoctorId) return;
      clientId = await createOfflineDcr({
        workDate,
        headQuarterId: session?.headQuarterId,
        routeId: doctors.find((d) => d.serverId === selectedDoctorId)?.routeId,
        doctorServerId: selectedDoctorId,
      });
      setDraftClientId(clientId);
    }
    await submitOfflineDcr(clientId);
    Alert.alert(t('mobile.dcr.submitSuccess'));
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.dcr.createTitle')}</Text>
      <Text style={styles.label}>{t('mobile.dcr.workDate')}</Text>
      <TextInput style={styles.input} value={workDate} onChangeText={setWorkDate} />
      <Text style={styles.label}>{t('mobile.dcr.doctor')}</Text>
      {doctors.map((doctor) => (
        <Pressable
          key={doctor.id}
          style={[
            styles.doctorRow,
            selectedDoctorId === doctor.serverId && styles.doctorRowSelected,
          ]}
          onPress={() => setSelectedDoctorId(doctor.serverId)}
        >
          <Text>{doctor.doctorName}</Text>
        </Pressable>
      ))}
      <Pressable style={styles.secondaryButton} onPress={handleSaveDraft}>
        <Text style={styles.secondaryText}>{t('mobile.dcr.saveDraft')}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t('mobile.dcr.submit')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fb' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#102a43' },
  label: { color: '#486581', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  doctorRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  doctorRowSelected: { borderColor: '#127fbf', backgroundColor: '#e6f6ff' },
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
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  secondaryText: { color: '#102a43', fontWeight: '600' },
});
