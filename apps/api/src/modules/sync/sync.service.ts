import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import {
  SyncBootstrapRequestSchema,
  SyncPullRequestSchema,
  SyncPushRequestSchema,
  apiSuccess,
  type JwtPayload,
  type SyncPullRequest,
  type SyncPushRequest,
} from '@synchem-sfa/shared-types';
import { Inject } from '@nestjs/common';
import { SYNC_REPOSITORY, type SyncRepositoryPort } from './ports/sync.repository.port';

@Injectable()
export class SyncService {
  constructor(@Inject(SYNC_REPOSITORY) private readonly syncRepo: SyncRepositoryPort) {}

  async push(user: JwtPayload, body: unknown) {
    const parsed = SyncPushRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const compCode = user.compCode!;
    const empId = user.empId!;

    const cached = await this.syncRepo.findBatchBySyncId(parsed.data.syncBatchId);
    if (cached && cached.compCode === compCode && cached.empId === empId) {
      return apiSuccess(cached.responseJson);
    }

    const { applied, errors } = await this.syncRepo.applyChanges(
      compCode,
      empId,
      parsed.data.changes,
    );

    const hasVersionConflict = errors.some((error) => error.message.includes('Version conflict'));
    if (hasVersionConflict) {
      throw new ConflictException('Version conflict in batch');
    }

    const serverChanges = await this.syncRepo.pullChanges(compCode, empId, null);
    const result = {
      syncBatchId: parsed.data.syncBatchId,
      serverTimestamp: new Date().toISOString(),
      applied,
      errors,
      serverChanges,
    };

    await this.syncRepo.pushBatch(compCode, empId, parsed.data, result);
    return apiSuccess(result);
  }

  async pull(user: JwtPayload, body: unknown) {
    const parsed = SyncPullRequestSchema.safeParse(body ?? {});
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const request: SyncPullRequest = parsed.data;
    const lastSyncAt = request.lastSyncAt ? new Date(request.lastSyncAt) : null;
    const serverChanges = await this.syncRepo.pullChanges(
      user.compCode!,
      user.empId!,
      lastSyncAt,
      request.entityTypes,
    );

    return apiSuccess({
      serverChanges,
      nextCursor: null,
    });
  }

  async bootstrap(user: JwtPayload, body: unknown) {
    const parsed = SyncBootstrapRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const masters = await this.syncRepo.bootstrapMasters(
      user.compCode!,
      parsed.data.headQuarterId,
      parsed.data.routeIds,
    );

    return apiSuccess(masters);
  }
}
