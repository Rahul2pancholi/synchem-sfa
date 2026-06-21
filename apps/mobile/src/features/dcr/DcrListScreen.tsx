import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useI18n } from '../../i18n/I18nProvider';
import { database } from '../../database';
import type { DailyCallReport } from '../../database/models';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DcrList'>;

function statusLabel(dcr: DailyCallReport, t: (key: MessageKey) => string) {
  if (dcr.localSyncState === 'synced') return t('mobile.dcr.statusSynced');
  if (dcr.approveStatus === 'SUBMITTED') return t('mobile.dcr.statusSubmitted');
  return t('mobile.dcr.statusDraft');
}

export function DcrListScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [rows, setRows] = useState<DailyCallReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      void database
        .get<DailyCallReport>('daily_call_reports')
        .query()
        .fetch()
        .then(setRows);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.dcr.title')}</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('mobile.dcr.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.workDate}</Text>
            <Text style={styles.cardMeta}>{statusLabel(item, t)}</Text>
          </View>
        )}
      />
      <Pressable style={styles.button} onPress={() => navigation.navigate('DcrCreate')}>
        <Text style={styles.buttonText}>{t('mobile.dashboard.newDcr')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fb' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#102a43' },
  empty: { color: '#486581', marginTop: 24, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  cardTitle: { fontWeight: '700', color: '#102a43' },
  cardMeta: { color: '#486581', marginTop: 4 },
  button: {
    backgroundColor: '#127fbf',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
