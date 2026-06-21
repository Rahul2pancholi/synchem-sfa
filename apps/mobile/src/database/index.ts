import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {
  DailyCallReport,
  DcrDoctorVisit,
  Doctor,
  GpsCheckIn,
  Retailer,
  Route,
  SyncMeta,
} from './models';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'synchem_sfa_mobile',
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup failed', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Doctor, Retailer, Route, DailyCallReport, DcrDoctorVisit, GpsCheckIn, SyncMeta],
});

export async function getSyncMeta(key: string): Promise<string | null> {
  const rows = await database.get<SyncMeta>('sync_meta').query().fetch();
  return rows.find((row) => row.key === key)?.value ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  const collection = database.get<SyncMeta>('sync_meta');
  const rows = await collection.query().fetch();
  const existing = rows.find((row) => row.key === key);

  await database.write(async () => {
    if (existing) {
      await existing.update((record) => {
        record.value = value;
      });
      return;
    }
    await collection.create((record) => {
      record.key = key;
      record.value = value;
    });
  });
}
