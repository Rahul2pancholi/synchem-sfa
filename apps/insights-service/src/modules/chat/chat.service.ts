import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  KNOWLEDGE_GRAPH_PORT,
  type KnowledgeGraphPort,
} from '../../ports/knowledge-graph.port';
import { LLM_PORT, type LlmPort } from '../../ports/llm.port';
import {
  SEMANTIC_LAYER_PORT,
  type SemanticLayerPort,
} from '../../ports/semantic-layer.port';
import { SQL_VALIDATOR_PORT, type SqlValidatorPort } from '../../ports/sql-validator.port';
import type { ChatQueryDto } from './dto/chat-query.dto';

export type ChatActor = {
  userId: string;
  compCode: string;
  roleCode: string;
};

@Injectable()
export class ChatService {
  constructor(
    @Inject(LLM_PORT) private readonly llm: LlmPort,
    @Inject(SEMANTIC_LAYER_PORT) private readonly semanticLayer: SemanticLayerPort,
    @Inject(KNOWLEDGE_GRAPH_PORT) private readonly knowledgeGraph: KnowledgeGraphPort,
    @Inject(SQL_VALIDATOR_PORT) private readonly sqlValidator: SqlValidatorPort,
  ) {}

  async query(dto: ChatQueryDto, actor: ChatActor) {
    const locale = dto.locale ?? 'hinglish';

    const intent = await this.llm.parseIntent(dto.message, locale, actor.compCode);

    await this.knowledgeGraph.enrichContext({
      compCode: actor.compCode,
      userId: actor.userId,
      roleCode: actor.roleCode,
      intent: { metricId: intent.metricId, filters: intent.filters },
    });

    const plan = await this.semanticLayer.resolveIntent(
      {
        metricId: intent.metricId,
        dimensions: intent.dimensions,
        filters: intent.filters,
      },
      actor.compCode,
    );

    const validation = await this.sqlValidator.validate({
      sqlTemplateId: plan.sqlTemplateId,
      parameters: plan.parameters,
      compCode: actor.compCode,
    });

    if (!validation.ok) {
      throw new ServiceUnavailableException({
        code: 'INSIGHTS_NOT_READY',
        message: validation.reason,
        phase: 'scaffold',
        plan: { docs: 'docs/25-AI-ANALYTICS-CHATBOT-PLAN.md' },
      });
    }

    const answer = await this.llm.narrateAnswer({
      message: dto.message,
      locale,
      metricId: plan.metricId,
      rows: [],
      compCode: actor.compCode,
    });

    return {
      answer,
      data: { rows: [], metric: plan.metricId },
      sources: [`semantic:${plan.metricId}`],
      confidence: intent.confidence,
      conversationId: dto.conversationId ?? null,
    };
  }
}
