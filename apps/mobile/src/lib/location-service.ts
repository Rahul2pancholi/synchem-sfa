import Geolocation, { type GeoPosition } from 'react-native-geolocation-service';
import type { GpsCheckIn } from '../database/models';
import { database } from '../database';

async function requestLocationPermission(): Promise<boolean> {
  const status = await Geolocation.requestAuthorization('whenInUse');
  return status === 'granted';
}

function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 10000,
    });
  });
}

export async function recordGpsCheckIn(eventType: 'CHECK_IN' | 'CHECK_OUT') {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('LOCATION_DENIED');
  }

  const position = await getCurrentPosition();

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
