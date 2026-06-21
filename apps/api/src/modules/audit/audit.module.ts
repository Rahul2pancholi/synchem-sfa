import { Module } from '@nestjs/common';
import { PrismaAuditRepository } from './adapters/prisma-audit.repository';
import { AuditService } from './audit.service';
import { AUDIT_REPOSITORY } from './ports/audit.repository.port';

@Module({
  providers: [
    AuditService,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
  ],
  exports: [AuditService],
})
export class AuditModule {}
