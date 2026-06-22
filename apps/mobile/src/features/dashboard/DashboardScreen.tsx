import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../../i18n/I18nProvider';
import { database } from '../../database';
import type { DailyCallReport, GpsCheckIn } from '../../database/models';
import { recordGpsCheckIn } from '../../lib/location-service';
import { pushPendingChanges } from '../../lib/sync-service';
import { useAutoSync } from '../../hooks/useAutoSync';
import { useMobilePermission } from '../../hooks/useMobilePermission';
import { clearSession } from '../../lib/auth-store';
import { useSessionStore } from '../../store/session-store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { t, language } = useI18n();
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);
  const setMpinVerified = useSessionStore((state) => state.setMpinVerified);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useAutoSync(session?.accessToken, language);
  const { allowed: canDcr } = useMobilePermission('TRN03', 'view');
  const { allowed: canRtp } = useMobilePermission('TRN01', 'view');

  const refreshPending = useCallback(async () => {
    const dcrs = await database.get<DailyCallReport>('daily_call_reports').query().fetch();
    const gps = await database.get<GpsCheckIn>('gps_check_ins').query().fetch();
    const pending =
      dcrs.filter((row) => row.localSyncState !== 'synced').length +
      gps.filter((row) => row.localSyncState !== 'synced').length;
    setPendingCount(pending);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshPending();
    }, [refreshPending]),
  );

  async function handleSync() {
    if (!session) return;
    setSyncing(true);
    try {
      const result = await pushPendingChanges(session.accessToken, language);
      Alert.alert(t('mobile.dashboard.syncSuccess'), String(result.applied));
      await refreshPending();
    } catch {
      Alert.alert(t('common.error'), t('mobile.dashboard.syncFailed'));
    } finally {
      setSyncing(false);
    }
  }

  async function handleGps(eventType: 'CHECK_IN' | 'CHECK_OUT') {
    try {
      await recordGpsCheckIn(eventType);
      await refreshPending();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'LOCATION_DENIED'
          ? t('mobile.dashboard.locationDenied')
          : t('mobile.dashboard.syncFailed');
      Alert.alert(t('common.error'), message);
    }
  }

  async function handleLogout() {
    await clearSession();
    setSession(null);
    setMpinVerified(false);
    navigation.replace('Login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.dashboard.title')}</Text>
      <Text style={styles.subtitle}>
        {t('mobile.dashboard.welcome')}, {session?.employee.firstName} ({session?.compCode})
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('mobile.dashboard.pendingSync')}</Text>
        <Text style={styles.cardValue}>{pendingCount}</Text>
        <Pressable style={styles.button} onPress={handleSync} disabled={syncing}>
          <Text style={styles.buttonText}>
            {syncing ? t('common.loading') : t('mobile.dashboard.syncNow')}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.secondaryButton} onPress={() => handleGps('CHECK_IN')}>
        <Text style={styles.secondaryText}>{t('mobile.dashboard.checkIn')}</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => handleGps('CHECK_OUT')}>
        <Text style={styles.secondaryText}>{t('mobile.dashboard.checkOut')}</Text>
      </Pressable>
      {canDcr ? (
        <>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('DcrCreate')}>
            <Text style={styles.secondaryText}>{t('mobile.dashboard.newDcr')}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('DcrList')}>
            <Text style={styles.secondaryText}>{t('mobile.dashboard.viewDcrs')}</Text>
          </Pressable>
        </>
      ) : null}
      {canRtp ? (
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('RtpCalendar')}>
          <Text style={styles.secondaryText}>{t('mobile.dashboard.viewRtp')}</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('mobile.dashboard.logout')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fb' },
  title: { fontSize: 24, fontWeight: '700', color: '#102a43' },
  subtitle: { fontSize: 14, color: '#486581', marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  cardLabel: { color: '#486581', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#102a43', marginBottom: 12 },
  button: {
    backgroundColor: '#127fbf',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d9e2ec',
  },
  secondaryText: { color: '#102a43', fontWeight: '600' },
  logoutButton: { marginTop: 12, alignItems: 'center' },
  logoutText: { color: '#ba1b1b', fontWeight: '600' },
});
