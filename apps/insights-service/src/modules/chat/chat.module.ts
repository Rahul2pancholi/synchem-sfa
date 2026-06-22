import { Module } from '@nestjs/common';
import { StubKnowledgeGraphAdapter } from '../../infrastructure/stub-knowledge-graph.adapter';
import { ConfigurableLlmAdapter } from '../../infrastructure/configurable-llm.adapter';
import { MainApiConfigClient } from '../../infrastructure/main-api-config.client';
import { SemanticLayerAdapter } from '../../infrastructure/semantic-layer.adapter';
import { SemanticSqlValidatorAdapter } from '../../infrastructure/semantic-sql-validator.adapter';
import { KNOWLEDGE_GRAPH_PORT } from '../../ports/knowledge-graph.port';
import { LLM_PORT } from '../../ports/llm.port';
import { SEMANTIC_LAYER_PORT } from '../../ports/semantic-layer.port';
import { SQL_VALIDATOR_PORT } from '../../ports/sql-validator.port';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    MainApiConfigClient,
    { provide: LLM_PORT, useClass: ConfigurableLlmAdapter },
    { provide: SEMANTIC_LAYER_PORT, useClass: SemanticLayerAdapter },
    { provide: KNOWLEDGE_GRAPH_PORT, useClass: StubKnowledgeGraphAdapter },
    { provide: SQL_VALIDATOR_PORT, useClass: SemanticSqlValidatorAdapter },
  ],
})
export class ChatModule {}
