import { Inject, Injectable } from '@nestjs/common';
import type { AuditLogInput } from './ports/audit.repository.port';
import { AUDIT_REPOSITORY, type AuditRepositoryPort } from './ports/audit.repository.port';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepo: AuditRepositoryPort,
  ) {}

  async log(entry: AuditLogInput): Promise<void> {
    await this.auditRepo.write(entry);
  }
}
