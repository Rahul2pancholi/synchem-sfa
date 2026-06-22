import { Injectable } from '@nestjs/common';
import type {
  MetricIntent,
  SemanticLayerPort,
  SemanticQueryPlan,
} from '../ports/semantic-layer.port';

@Injectable()
export class StubSemanticLayerAdapter implements SemanticLayerPort {
  async resolveIntent(intent: MetricIntent, compCode: string): Promise<SemanticQueryPlan> {
    return {
      metricId: intent.metricId,
      sqlTemplateId: `stub_${intent.metricId}`,
      parameters: { compCode, ...intent.filters },
    };
  }
}
