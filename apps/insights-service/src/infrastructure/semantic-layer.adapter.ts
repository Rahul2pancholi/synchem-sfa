import { Injectable, NotFoundException } from '@nestjs/common';
import type { MetricIntent, SemanticLayerPort, SemanticQueryPlan } from '../ports/semantic-layer.port';
import { METRIC_BY_ID } from '../semantic-definitions/metrics';

@Injectable()
export class SemanticLayerAdapter implements SemanticLayerPort {
  async resolveIntent(intent: MetricIntent, compCode: string): Promise<SemanticQueryPlan> {
    const metric = METRIC_BY_ID.get(intent.metricId);
    if (!metric) {
      throw new NotFoundException(`Unknown metric: ${intent.metricId}`);
    }

    const parameters: Record<string, string | number> = {
      compCode,
      empId: (intent.filters.empId as string) ?? '',
      month: Number(intent.filters.month ?? new Date().getMonth() + 1),
      year: Number(intent.filters.year ?? new Date().getFullYear()),
      routeId: (intent.filters.routeId as string) ?? '',
    };

    return {
      metricId: metric.id,
      sqlTemplateId: metric.id,
      parameters,
    };
  }
}
