import { Injectable } from '@nestjs/common';
import type { SqlValidationResult, SqlValidatorPort } from '../ports/sql-validator.port';
import { METRIC_BY_ID } from '../semantic-definitions/metrics';

@Injectable()
export class SemanticSqlValidatorAdapter implements SqlValidatorPort {
  async validate(plan: {
    sqlTemplateId: string;
    parameters: Record<string, string | number>;
    compCode: string;
  }): Promise<SqlValidationResult> {
    const metric = METRIC_BY_ID.get(plan.sqlTemplateId);
    if (!metric) {
      return { ok: false, reason: `Unknown SQL template: ${plan.sqlTemplateId}` };
    }

    if (!metric.sqlTemplate.includes(':compCode')) {
      return { ok: false, reason: 'Template missing mandatory compCode filter' };
    }

    if (plan.parameters.compCode !== plan.compCode) {
      return { ok: false, reason: 'compCode parameter mismatch' };
    }

    const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b/i;
    if (forbidden.test(metric.sqlTemplate)) {
      return { ok: false, reason: 'Only SELECT templates allowed' };
    }

    return {
      ok: true,
      validated: {
        sql: metric.sqlTemplate.trim(),
        parameters: plan.parameters,
      },
    };
  }
}
