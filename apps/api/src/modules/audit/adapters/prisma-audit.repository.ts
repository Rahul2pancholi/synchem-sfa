import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type { AuditLogInput, AuditRepositoryPort } from '../ports/audit.repository.port';

@Injectable()
export class PrismaAuditRepository implements AuditRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async write(entry: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        compCode: entry.compCode,
        empId: entry.empId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        oldValues: entry.oldValues as Prisma.InputJsonValue | undefined,
        newValues: entry.newValues as Prisma.InputJsonValue | undefined,
        requestId: entry.requestId,
      },
    });
  }
}
