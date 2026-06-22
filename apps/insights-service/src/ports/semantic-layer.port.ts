/** Business metric resolved from NL intent — not raw SQL. */
export type MetricIntent = {
  metricId: string;
  dimensions: string[];
  filters: Record<string, string | number | boolean>;
};

export type SemanticQueryPlan = {
  metricId: string;
  sqlTemplateId: string;
  parameters: Record<string, string | number>;
};

export interface SemanticLayerPort {
  /** Map structured intent to an approved query plan (template + params). */
  resolveIntent(intent: MetricIntent, compCode: string): Promise<SemanticQueryPlan>;
}

export const SEMANTIC_LAYER_PORT = Symbol('SEMANTIC_LAYER_PORT');
