import { Module } from '@nestjs/common';
import { ApprovalsModule } from '../approvals/approvals.module';
import { InsightsConfigModule } from '../insights-config/insights-config.module';
import { ReportsModule } from '../reports/reports.module';
import { TenantModule } from '../tenant/tenant.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AssistantLlmService } from './assistant-llm.service';
import { ChatIntentService } from './chat-intent.service';
import { ChatSessionService } from './chat-session.service';
import { ChatSubmitService } from './chat-submit.service';
import { InsightsChatController } from './insights-chat.controller';
import { InsightsChatService } from './insights-chat.service';

@Module({
  imports: [InsightsConfigModule, TenantModule, ReportsModule, ApprovalsModule, TransactionsModule],
  controllers: [InsightsChatController],
  providers: [
    InsightsChatService,
    ChatIntentService,
    AssistantLlmService,
    ChatSessionService,
    ChatSubmitService,
  ],
})
export class InsightsChatModule {}
