import * as Location from 'expo-location';
import type { GpsCheckIn } from '../database/models';
import { database } from '../database';

export async function recordGpsCheckIn(eventType: 'CHECK_IN' | 'CHECK_OUT') {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('LOCATION_DENIED');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const clientId = crypto.randomUUID();
  const recordedAt = new Date().toISOString();

  await database.write(async () => {
    await database.get<GpsCheckIn>('gps_check_ins').create((record) => {
      record.clientId = clientId;
      record.latitude = position.coords.latitude;
      record.longitude = position.coords.longitude;
      record.eventType = eventType;
      record.recordedAt = recordedAt;
      record.localSyncState = 'pending';
    });
  });

  return {
    clientId,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    recordedAt,
  };
}
