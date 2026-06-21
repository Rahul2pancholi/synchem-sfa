export interface AuditLogInput {
  compCode: string;
  empId?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  requestId?: string;
}

export interface AuditRepositoryPort {
  write(entry: AuditLogInput): Promise<void>;
}

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');
