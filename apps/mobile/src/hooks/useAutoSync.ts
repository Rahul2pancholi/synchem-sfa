import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { database } from '../database';
import type { DailyCallReport, GpsCheckIn } from '../database/models';
import { pushPendingChanges } from '../lib/sync-service';

export function useAutoSync(accessToken: string | undefined, language: string, enabled = true) {
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !accessToken) return;

    async function trySync() {
      if (syncingRef.current || !accessToken) return;
      syncingRef.current = true;
      const token = accessToken;
      try {
        const dcrs = await database.get<DailyCallReport>('daily_call_reports').query().fetch();
        const gps = await database.get<GpsCheckIn>('gps_check_ins').query().fetch();
        const pending =
          dcrs.filter((row) => row.localSyncState !== 'synced').length +
          gps.filter((row) => row.localSyncState !== 'synced').length;
        if (pending === 0) return;
        await pushPendingChanges(token, language);
      } catch {
        // silent retry on next foreground
      } finally {
        syncingRef.current = false;
      }
    }

    void trySync();

    function onAppStateChange(state: AppStateStatus) {
      if (state === 'active') void trySync();
    }

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [accessToken, enabled, language]);
}
