export type ParsedIntent = {
  metricId: string;
  dimensions: string[];
  filters: Record<string, string | number | boolean>;
  confidence: 'low' | 'medium' | 'high';
};

export interface LlmPort {
  parseIntent(message: string, locale: string, compCode?: string): Promise<ParsedIntent>;
  narrateAnswer(params: {
    message: string;
    locale: string;
    metricId: string;
    rows: Record<string, unknown>[];
    compCode?: string;
  }): Promise<string>;
}

export const LLM_PORT = Symbol('LLM_PORT');
