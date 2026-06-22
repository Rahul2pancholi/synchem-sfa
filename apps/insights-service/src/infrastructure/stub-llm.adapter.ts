import { Injectable } from '@nestjs/common';
import type { LlmPort, ParsedIntent } from '../ports/llm.port';

@Injectable()
export class StubLlmAdapter implements LlmPort {
  async parseIntent(message: string, locale: string): Promise<ParsedIntent> {
    return {
      metricId: 'unimplemented',
      dimensions: [],
      filters: {},
      confidence: 'low',
    };
  }

  async narrateAnswer(): Promise<string> {
    return 'Insights chat is in scaffold mode. See docs/25-AI-ANALYTICS-CHATBOT-PLAN.md';
  }
}
