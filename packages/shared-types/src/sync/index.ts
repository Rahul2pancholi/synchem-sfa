import { z } from 'zod';

export const SyncEntityTypeSchema = z.enum([
  'daily_call_report',
  'gps_check_in',
  'dcr_doctor_visit',
  'dcr_retailer_visit',
]);

export const SyncOperationSchema = z.enum(['create', 'update', 'delete']);

export const SyncChangeSchema = z.object({
  clientId: z.string().uuid(),
  serverId: z.string().uuid().nullable().optional(),
  entityType: SyncEntityTypeSchema,
  operation: SyncOperationSchema,
  version: z.number().int().min(1).optional(),
  payload: z.record(z.unknown()),
});

export const SyncPushRequestSchema = z.object({
  syncBatchId: z.string().uuid(),
  deviceId: z.string().max(100).optional(),
  clientTimestamp: z.string().datetime().optional(),
  lastSyncAt: z.string().datetime().nullable().optional(),
  schemaVersion: z.number().int().min(1).default(1),
  changes: z.array(SyncChangeSchema).max(500),
});

export const SyncPullRequestSchema = z.object({
  lastSyncAt: z.string().datetime().nullable().optional(),
  entityTypes: z.array(SyncEntityTypeSchema).optional(),
  nextCursor: z.string().optional(),
});

export const SyncBootstrapRequestSchema = z.object({
  headQuarterId: z.string().uuid(),
  routeIds: z.array(z.string().uuid()).optional(),
});

export type SyncEntityType = z.infer<typeof SyncEntityTypeSchema>;
export type SyncOperation = z.infer<typeof SyncOperationSchema>;
export type SyncChange = z.infer<typeof SyncChangeSchema>;
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
export type SyncPullRequest = z.infer<typeof SyncPullRequestSchema>;
export type SyncBootstrapRequest = z.infer<typeof SyncBootstrapRequestSchema>;

export interface SyncAppliedChange {
  clientId: string;
  serverId: string;
  entityType: SyncEntityType;
}

export interface SyncPushError {
  clientId: string;
  code: string;
  message: string;
}

export interface SyncPushResult {
  syncBatchId: string;
  serverTimestamp: string;
  applied: SyncAppliedChange[];
  errors: SyncPushError[];
  serverChanges: SyncChange[];
}

export interface SyncPullResult {
  serverChanges: SyncChange[];
  nextCursor: string | null;
}

export interface SyncBootstrapMasters {
  doctors: Array<{ id: string; doctorName: string; routeId: string | null; mobileNo: string | null }>;
  retailers: Array<{ id: string; retailerName: string; routeId: string | null }>;
  routes: Array<{ id: string; routeName: string; headQuarterId: string }>;
  products: Array<{ id: string; productName: string; productCode: string }>;
}
