import type { SyncBootstrapMasters, SyncChange } from '@synchem-sfa/shared-types';
import { database, getSyncMeta, setSyncMeta } from '../database';
import type { DailyCallReport, DcrDoctorVisit, Doctor, GpsCheckIn, Retailer, Route } from '../database/models';

import { API_BASE } from '../config/api-base';

interface ApiEnvelope<T> {
  responseCode: number;
  data: T;
}

function authHeaders(accessToken: string, language: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-App-Language': language,
  };
}

export async function loginWithPassword(params: {
  userName: string;
  password: string;
  compCode: string;
  language: string;
}) {
  const body = new URLSearchParams({
    grant_type: 'password',
    username: `${params.userName},${params.compCode}`,
    password: params.password,
  });

  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-App-Language': params.language,
    },
    body,
  });

  if (!res.ok) {
    throw new Error('LOGIN_FAILED');
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    compCode: string;
    compName: string;
    empId: string;
    employeeObj: string;
    menuList?: string;
  }>;
}

export async function fetchEmployeeProfile(accessToken: string, language: string) {
  const res = await fetch(`${API_BASE}/api/v1/employees/me`, {
    headers: authHeaders(accessToken, language),
  });
  if (!res.ok) throw new Error('PROFILE_FAILED');
  const json = (await res.json()) as ApiEnvelope<{
    empId: string;
    userName: string;
    firstName: string;
    lastName?: string;
    roleName?: string;
    headQuarterId?: string;
  }>;
  return json.data;
}

export async function bootstrapMasters(accessToken: string, language: string, headQuarterId: string) {
  const res = await fetch(`${API_BASE}/api/v1/sync/masters/bootstrap`, {
    method: 'POST',
    headers: authHeaders(accessToken, language),
    body: JSON.stringify({ headQuarterId }),
  });
  if (!res.ok) throw new Error('BOOTSTRAP_FAILED');
  const json = (await res.json()) as ApiEnvelope<SyncBootstrapMasters>;
  await persistBootstrap(json.data);
  await setSyncMeta('headQuarterId', headQuarterId);
}

async function clearMasterTables() {
  await database.write(async () => {
    for (const row of await database.get<Doctor>('doctors').query().fetch()) {
      await row.destroyPermanently();
    }
    for (const row of await database.get<Retailer>('retailers').query().fetch()) {
      await row.destroyPermanently();
    }
    for (const row of await database.get<Route>('routes').query().fetch()) {
      await row.destroyPermanently();
    }
  });
}

async function persistBootstrap(data: SyncBootstrapMasters) {
  await clearMasterTables();
  await database.write(async () => {
    for (const route of data.routes) {
      await database.get<Route>('routes').create((record) => {
        record.serverId = route.id;
        record.routeName = route.routeName;
        record.headQuarterId = route.headQuarterId;
      });
    }
    for (const doctor of data.doctors) {
      await database.get<Doctor>('doctors').create((record) => {
        record.serverId = doctor.id;
        record.doctorName = doctor.doctorName;
        record.routeId = doctor.routeId ?? undefined;
        record.mobileNo = doctor.mobileNo ?? undefined;
      });
    }
    for (const retailer of data.retailers) {
      await database.get<Retailer>('retailers').create((record) => {
        record.serverId = retailer.id;
        record.retailerName = retailer.retailerName;
        record.routeId = retailer.routeId ?? undefined;
      });
    }
  });
}

function buildChanges(
  dcrs: DailyCallReport[],
  visits: DcrDoctorVisit[],
  gpsRows: GpsCheckIn[],
): SyncChange[] {
  const changes: SyncChange[] = [];

  for (const dcr of dcrs) {
    changes.push({
      clientId: dcr.clientId,
      serverId: dcr.serverId ?? null,
      entityType: 'daily_call_report',
      operation: 'create',
      version: dcr.version,
      payload: {
        workDate: dcr.workDate,
        headQuarterId: dcr.headQuarterId,
        routeId: dcr.routeId,
        approveStatus: dcr.approveStatus,
      },
    });
  }

  for (const visit of visits) {
    changes.push({
      clientId: visit.clientId,
      entityType: 'dcr_doctor_visit',
      operation: 'create',
      payload: {
        dcrClientId: visit.dcrClientId,
        doctorId: visit.doctorServerId,
        visitOrder: visit.visitOrder,
      },
    });
  }

  for (const gps of gpsRows) {
    changes.push({
      clientId: gps.clientId,
      entityType: 'gps_check_in',
      operation: 'create',
      payload: {
        latitude: gps.latitude,
        longitude: gps.longitude,
        eventType: gps.eventType,
        recordedAt: gps.recordedAt,
      },
    });
  }

  return changes;
}

export async function pushPendingChanges(accessToken: string, language: string) {
  const pendingDcrs = await database
    .get<DailyCallReport>('daily_call_reports')
    .query()
    .fetch();
  const pendingVisits = await database
    .get<DcrDoctorVisit>('dcr_doctor_visits')
    .query()
    .fetch();
  const pendingGps = await database
    .get<GpsCheckIn>('gps_check_ins')
    .query()
    .fetch();

  const unsyncedDcrs = pendingDcrs.filter((row) => row.localSyncState !== 'synced');
  const unsyncedVisits = pendingVisits.filter((row) => row.localSyncState !== 'synced');
  const unsyncedGps = pendingGps.filter((row) => row.localSyncState !== 'synced');

  if (unsyncedDcrs.length + unsyncedVisits.length + unsyncedGps.length === 0) {
    return { applied: 0 };
  }

  const syncBatchId = crypto.randomUUID();
  const lastSyncAt = await getSyncMeta('lastSyncAt');

  const res = await fetch(`${API_BASE}/api/v1/sync/push`, {
    method: 'POST',
    headers: authHeaders(accessToken, language),
    body: JSON.stringify({
      syncBatchId,
      clientTimestamp: new Date().toISOString(),
      lastSyncAt,
      changes: buildChanges(unsyncedDcrs, unsyncedVisits, unsyncedGps),
    }),
  });

  if (!res.ok) throw new Error('SYNC_PUSH_FAILED');

  const json = (await res.json()) as ApiEnvelope<{
    applied: Array<{ clientId: string; serverId: string; entityType: string }>;
    serverTimestamp: string;
  }>;

  await database.write(async () => {
    for (const item of json.data.applied) {
      if (item.entityType === 'daily_call_report') {
        const row = unsyncedDcrs.find((dcr) => dcr.clientId === item.clientId);
        if (row) {
          await row.update((record) => {
            record.serverId = item.serverId;
            record.localSyncState = 'synced';
          });
        }
      }
      if (item.entityType === 'dcr_doctor_visit') {
        const row = unsyncedVisits.find((visit) => visit.clientId === item.clientId);
        if (row) {
          await row.update((record) => {
            record.localSyncState = 'synced';
          });
        }
      }
      if (item.entityType === 'gps_check_in') {
        const row = unsyncedGps.find((gps) => gps.clientId === item.clientId);
        if (row) {
          await row.update((record) => {
            record.localSyncState = 'synced';
          });
        }
      }
    }
  });

  await setSyncMeta('lastSyncAt', json.data.serverTimestamp);
  return { applied: json.data.applied.length };
}

export async function createOfflineDcr(params: {
  workDate: string;
  headQuarterId?: string;
  routeId?: string;
  doctorServerId: string;
}) {
  const dcrClientId = crypto.randomUUID();
  const visitClientId = crypto.randomUUID();

  await database.write(async () => {
    await database.get<DailyCallReport>('daily_call_reports').create((record) => {
      record.clientId = dcrClientId;
      record.workDate = params.workDate;
      record.headQuarterId = params.headQuarterId;
      record.routeId = params.routeId;
      record.approveStatus = 'DRAFT';
      record.localSyncState = 'pending';
      record.version = 1;
    });

    await database.get<DcrDoctorVisit>('dcr_doctor_visits').create((record) => {
      record.clientId = visitClientId;
      record.dcrClientId = dcrClientId;
      record.doctorServerId = params.doctorServerId;
      record.visitOrder = 1;
      record.localSyncState = 'pending';
    });
  });

  return dcrClientId;
}

export async function submitOfflineDcr(dcrClientId: string) {
  const rows = await database.get<DailyCallReport>('daily_call_reports').query().fetch();
  const dcr = rows.find((row) => row.clientId === dcrClientId);
  if (!dcr) throw new Error('DCR_NOT_FOUND');

  await database.write(async () => {
    await dcr.update((record) => {
      record.approveStatus = 'SUBMITTED';
      record.localSyncState = 'pending';
      record.version = record.version + 1;
    });
  });
}
