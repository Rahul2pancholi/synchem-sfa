export interface QueryExecutorPort {
  executeReadOnly(validated: {
    sql: string;
    parameters: Record<string, string | number>;
  }): Promise<Record<string, unknown>[]>;
}

export const QUERY_EXECUTOR_PORT = Symbol('QUERY_EXECUTOR_PORT');
