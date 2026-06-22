import { Injectable } from '@nestjs/common';
import type { SqlValidationResult, SqlValidatorPort } from '../ports/sql-validator.port';

@Injectable()
export class StubSqlValidatorAdapter implements SqlValidatorPort {
  async validate(): Promise<SqlValidationResult> {
    return { ok: false, reason: 'SQL validation not wired — scaffold only' };
  }
}
