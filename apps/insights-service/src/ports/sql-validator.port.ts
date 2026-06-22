export type ValidatedSql = {
  sql: string;
  parameters: Record<string, string | number>;
};

export type SqlValidationResult =
  | { ok: true; validated: ValidatedSql }
  | { ok: false; reason: string };

export interface SqlValidatorPort {
  validate(plan: {
    sqlTemplateId: string;
    parameters: Record<string, string | number>;
    compCode: string;
  }): Promise<SqlValidationResult>;
}

export const SQL_VALIDATOR_PORT = Symbol('SQL_VALIDATOR_PORT');
