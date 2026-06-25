import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveAppLanguage } from '@synchem-sfa/shared-i18n';
import {
  apiSuccess,
  matchChatIntent,
  type ChatAssistantReply,
  type ChatHistoryTurn,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { InsightsConfigService } from '../insights-config/insights-config.service';
import { TenantFeaturesService } from '../tenant/tenant-features.service';
import { AssistantLlmService } from './assistant-llm.service';
import { ChatIntentService } from './chat-intent.service';
import { ChatSessionService } from './chat-session.service';
import { withReplyText } from './chat-reply-humanizer';

@Injectable()
export class InsightsChatService {
  private readonly logger = new Logger(InsightsChatService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly insightsConfig: InsightsConfigService,
    private readonly tenantFeatures: TenantFeaturesService,
    private readonly chatIntent: ChatIntentService,
    private readonly assistantLlm: AssistantLlmService,
    private readonly chatSession: ChatSessionService,
  ) {}

  async getSession(user: JwtPayload, sessionId?: string) {
    await this.assertAssistantEnabled(user.compCode!);
    const snapshot = await this.chatSession.getActiveSession(user.compCode!, user.empId!, sessionId);
    return apiSuccess(snapshot);
  }

  async resetSession(user: JwtPayload) {
    await this.assertAssistantEnabled(user.compCode!);
    const snapshot = await this.chatSession.createSession(user.compCode!, user.empId!);
    return apiSuccess(snapshot);
  }

  async query(
    user: JwtPayload,
    message: string,
    language: string,
    authorization: string,
    history: ChatHistoryTurn[] = [],
    sessionId?: string,
  ) {
    const compCode = user.compCode!;
    const empId = user.empId!;
    const locale = resolveAppLanguage(language);

    await this.assertAssistantEnabled(compCode);

    const session = await this.chatSession.resolveSession(compCode, empId, sessionId);
    const mergedHistory =
      history.length > 0
        ? history
        : (await this.chatSession.getActiveSession(compCode, empId, session.id)).messages.map(
            (turn) => ({ role: turn.role, content: turn.content }),
          );

    const intent = await this.resolveIntent(message, user.roleType, mergedHistory, compCode, language);

    let reply: ChatAssistantReply;

    if (intent !== 'unknown') {
      reply = await this.buildIntentReply(user, message, mergedHistory, language, locale, intent);
    } else {
      reply = await this.buildUnknownReply(user, message, mergedHistory, language, locale, authorization);
    }

    reply.sessionId = session.id;
    await this.chatSession.appendTurn(session.id, compCode, message, reply);
    return apiSuccess(reply);
  }

  private async buildIntentReply(
    user: JwtPayload,
    message: string,
    history: ChatHistoryTurn[],
    language: string,
    locale: ReturnType<typeof resolveAppLanguage>,
    intent: NonNullable<Awaited<ReturnType<typeof matchChatIntent>>>,
  ) {
    const raw = await this.chatIntent.resolve(user, intent, message);
    const humanized = await this.assistantLlm.humanizeReply({
      message,
      reply: raw,
      history,
      compCode: user.compCode!,
      language,
      roleType: user.roleType,
      userName: user.fullName,
    });
    return withReplyText(raw, locale, humanized);
  }

  private async buildUnknownReply(
    user: JwtPayload,
    message: string,
    history: ChatHistoryTurn[],
    language: string,
    locale: ReturnType<typeof resolveAppLanguage>,
    authorization: string,
  ) {
    const config = await this.insightsConfig.getRuntimeConfig(user.compCode!);
    if (!config.enabled) {
      return this.finalizeNoMatch(user, message, history, language, locale);
    }

    const baseUrl = this.configService.get<string>('INSIGHTS_SERVICE_URL', 'http://localhost:3010');

    try {
      const res = await fetch(`${baseUrl}/insights/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
          'X-App-Language': language,
        },
        body: JSON.stringify({ message, locale: language }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.warn({
          module: 'insights-chat',
          action: 'upstreamError',
          compCode: user.compCode,
          status: res.status,
          body: text.slice(0, 200),
        });
        return this.finalizeNoMatch(user, message, history, language, locale);
      }

      const payload = (await res.json()) as {
        answer?: string;
        message?: string;
        data?: { answer?: string; message?: string };
      };
      const answer =
        payload.data?.answer ??
        payload.data?.message ??
        payload.answer ??
        payload.message ??
        '';

      if (!answer.trim()) {
        return this.finalizeNoMatch(user, message, history, language, locale);
      }

      const raw = {
        messageKey: 'chat.answer.freeText',
        params: { answer },
        actions: [{ labelKey: 'chat.action.openHelp', path: '/app/help' }],
      };
      return withReplyText(raw, locale, answer);
    } catch (err) {
      this.logger.warn({
        module: 'insights-chat',
        action: 'proxyFailed',
        compCode: user.compCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return this.finalizeNoMatch(user, message, history, language, locale);
    }
  }

  private async resolveIntent(
    message: string,
    roleType: JwtPayload['roleType'],
    history: ChatHistoryTurn[],
    compCode: string,
    language: string,
  ) {
    const llmIntent = await this.assistantLlm.classifyIntent(
      message,
      roleType,
      history,
      compCode,
      language,
    );
    if (llmIntent) {
      return llmIntent;
    }

    return matchChatIntent(message, roleType);
  }

  private async finalizeNoMatch(
    user: JwtPayload,
    message: string,
    history: ChatHistoryTurn[],
    language: string,
    locale: ReturnType<typeof resolveAppLanguage>,
  ) {
    const raw = this.chatIntent.noMatch(user.roleType);
    const humanized = await this.assistantLlm.humanizeReply({
      message,
      reply: raw,
      history,
      compCode: user.compCode!,
      language,
      roleType: user.roleType,
      userName: user.fullName,
    });
    return withReplyText(raw, locale, humanized);
  }

  private async assertAssistantEnabled(compCode: string) {
    const enabledForTenant = await this.tenantFeatures.isFeatureEnabled(compCode, 'ai_assistant');
    if (!enabledForTenant) {
      throw new ForbiddenException('AI assistant is not enabled for this company');
    }
  }
}
