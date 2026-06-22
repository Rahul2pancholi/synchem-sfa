import { Injectable } from '@nestjs/common';
import type { GraphContext, KnowledgeGraphPort } from '../ports/knowledge-graph.port';

@Injectable()
export class StubKnowledgeGraphAdapter implements KnowledgeGraphPort {
  async enrichContext(): Promise<GraphContext> {
    return { hints: ['knowledge-graph-stub: no graph data yet'] };
  }
}
