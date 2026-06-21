import type {
  SyncAppliedChange,
  SyncBootstrapMasters,
  SyncChange,
  SyncPushRequest,
  SyncPushResult,
} from '@synchem-sfa/shared-types';

export interface SyncBatchRecord {
  syncBatchId: string;
  compCode: string;
  empId: string;
  responseJson: SyncPushResult;
}

export interface SyncRepositoryPort {
  findBatchBySyncId(syncBatchId: string): Promise<SyncBatchRecord | null>;
  pushBatch(
    compCode: string,
    empId: string,
    request: SyncPushRequest,
    result: SyncPushResult,
  ): Promise<void>;
  applyChanges(
    compCode: string,
    empId: string,
    changes: SyncChange[],
  ): Promise<{ applied: SyncAppliedChange[]; errors: SyncPushResult['errors'] }>;
  pullChanges(
    compCode: string,
    empId: string,
    lastSyncAt: Date | null,
    entityTypes?: SyncChange['entityType'][],
  ): Promise<SyncChange[]>;
  bootstrapMasters(
    compCode: string,
    headQuarterId: string,
    routeIds?: string[],
  ): Promise<SyncBootstrapMasters>;
}

export const SYNC_REPOSITORY = Symbol('SYNC_REPOSITORY');
