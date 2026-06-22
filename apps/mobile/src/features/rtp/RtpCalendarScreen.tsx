import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../../i18n/I18nProvider';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

import { API_BASE } from '../../config/api-base';

interface TourDay {
  dayOfMonth: number;
  workType: string;
  routeId: string | null;
}

interface TourProgramme {
  id: string;
  planMonth: number;
  planYear: number;
  approveStatus: string;
  days: TourDay[];
}

type Props = NativeStackScreenProps<RootStackParamList, 'RtpCalendar'>;

export function RtpCalendarScreen(_props: Props) {
  const { t, language } = useI18n();
  const session = useSessionStore((state) => state.session);
  const [loading, setLoading] = useState(true);
  const [programme, setProgramme] = useState<TourProgramme | null>(null);

  const loadRtp = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const listRes = await fetch(`${API_BASE}/api/v1/tour-programmes?month=${month}&year=${year}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'X-App-Language': language,
        },
      });
      if (!listRes.ok) {
        setProgramme(null);
        return;
      }
      const listJson = (await listRes.json()) as { data: { items: Array<{ id: string }> } };
      const first = listJson.data.items[0];
      if (!first) {
        setProgramme(null);
        return;
      }
      const detailRes = await fetch(`${API_BASE}/api/v1/tour-programmes/${first.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'X-App-Language': language,
        },
      });
      if (!detailRes.ok) {
        setProgramme(null);
        return;
      }
      const detailJson = (await detailRes.json()) as { data: TourProgramme };
      setProgramme(detailJson.data);
    } catch {
      setProgramme(null);
    } finally {
      setLoading(false);
    }
  }, [language, session]);

  useFocusEffect(
    useCallback(() => {
      void loadRtp();
    }, [loadRtp]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!programme) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('mobile.rtp.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {t('mobile.rtp.title')} — {programme.planMonth}/{programme.planYear}
      </Text>
      <Text style={styles.status}>{programme.approveStatus}</Text>
      {programme.days.map((day) => (
        <View key={day.dayOfMonth} style={styles.row}>
          <Text style={styles.day}>{day.dayOfMonth}</Text>
          <Text style={styles.type}>{day.workType}</Text>
          <Text style={styles.route}>{day.routeId ?? '—'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#102a43', marginBottom: 4 },
  status: { color: '#486581', marginBottom: 16 },
  empty: { color: '#486581', fontSize: 16 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  day: { width: 36, fontWeight: '700', color: '#102a43' },
  type: { flex: 1, color: '#334e68' },
  route: { color: '#627d98', fontSize: 12, maxWidth: 120 },
});
