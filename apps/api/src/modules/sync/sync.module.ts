import { Module } from '@nestjs/common';
import { PrismaSyncRepository } from './adapters/prisma-sync.repository';
import { SYNC_REPOSITORY } from './ports/sync.repository.port';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  controllers: [SyncController],
  providers: [
    SyncService,
    { provide: SYNC_REPOSITORY, useClass: PrismaSyncRepository },
  ],
  exports: [SyncService],
})
export class SyncModule {}
