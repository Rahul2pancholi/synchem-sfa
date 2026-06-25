import { Injectable, Logger } from '@nestjs/common';
import { resolveAppLanguage } from '@synchem-sfa/shared-i18n';
import type {
  ChatHistoryTurn,
  ChatIntentId,
  ChatListItem,
  ChatReplyDraft,
  InsightsChatConfigRuntime,
  RoleType,
} from '@synchem-sfa/shared-types';
import { InsightsConfigService } from '../insights-config/insights-config.service';
import {
  ASSISTANT_INTENT_CLASSIFIER_PROMPT,
  DEFAULT_ASSISTANT_HUMANIZE_PROMPT,
} from '../insights-config/insights-config.defaults';

const VALID_INTENTS: ChatIntentId[] = [
  'pending_approvals',
  'my_pending',
  'my_dcr_drafts',
  'my_pob_drafts',
  'submit_dcr',
  'submit_pob',
  'pob_achievement',
  'coverage',
  'missed_calls',
  'open_dcr',
  'open_pob',
  'help',
  'unknown',
];

@Injectable()
export class AssistantLlmService {
  private readonly logger = new Logger(AssistantLlmService.name);

  constructor(private readonly insightsConfig: InsightsConfigService) {}

  async classifyIntent(
    message: string,
    roleType: RoleType | undefined,
    history: ChatHistoryTurn[],
    compCode: string,
    language: string,
  ): Promise<ChatIntentId | null> {
    const config = await this.loadLlmConfig(compCode);
    if (!config) return null;

    const roleHint =
      roleType === 'FS'
        ? 'User is field staff (MR). Pending/submit → my_pending.'
        : roleType === 'MAN'
          ? 'User is manager. Pending approvals → pending_approvals.'
          : 'User is admin.';

    const historyBlock = history
      .slice(-6)
      .map((turn) => `${turn.role}: ${turn.content}`)
      .join('\n');

    const userPayload = [
      roleHint,
      historyBlock ? `Recent conversation:\n${historyBlock}` : '',
      `Current message: ${message}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const content = await this.chatCompletion(
        config,
        ASSISTANT_INTENT_CLASSIFIER_PROMPT,
        userPayload,
      );
      return this.parseIntent(content);
    } catch (err) {
      this.logger.warn({
        module: 'assistant-llm',
        action: 'classifyFailed',
        compCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  async humanizeReply(params: {
    message: string;
    reply: ChatReplyDraft;
    history: ChatHistoryTurn[];
    compCode: string;
    language: string;
    roleType?: RoleType;
    userName?: string;
  }): Promise<string | null> {
    const config = await this.loadLlmConfig(params.compCode);
    if (!config) return null;

    const locale = resolveAppLanguage(params.language);
    const prompt =
      config.narrationPrompt.trim() || DEFAULT_ASSISTANT_HUMANIZE_PROMPT;

    const userPayload = JSON.stringify({
      userMessage: params.message,
      locale,
      roleType: params.roleType ?? 'unknown',
      userName: params.userName ?? '',
      facts: {
        messageKey: params.reply.messageKey,
        params: params.reply.params,
        items: params.reply.items?.map((item: ChatListItem) => ({
          labelKey: item.labelKey,
          params: item.params,
        })),
        actionCount: params.reply.actions.length,
      },
      recentHistory: params.history.slice(-6),
    });

    try {
      const content = await this.chatCompletion(config, prompt, userPayload);
      return content.trim() || null;
    } catch (err) {
      this.logger.warn({
        module: 'assistant-llm',
        action: 'humanizeFailed',
        compCode: params.compCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  private async loadLlmConfig(compCode: string): Promise<InsightsChatConfigRuntime | null> {
    const config = await this.insightsConfig.getRuntimeConfig(compCode);
    if (!config.enabled || config.provider === 'stub' || !config.apiKey) {
      return null;
    }
    return config;
  }

  private parseIntent(content: string): ChatIntentId | null {
    try {
      const cleaned = content
        .replace(/```json\s*/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned) as { intent?: string };
      if (parsed.intent && VALID_INTENTS.includes(parsed.intent as ChatIntentId)) {
        return parsed.intent as ChatIntentId;
      }
    } catch {
      // fall through
    }
    return null;
  }

  private async chatCompletion(
    config: InsightsChatConfigRuntime,
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    const fullSystem = `${config.systemPrompt}\n\n${systemPrompt}`;

    if (config.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: fullSystem },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`);
      }
      const body = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return body.choices?.[0]?.message?.content?.trim() ?? '';
    }

    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey!)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: fullSystem }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
      }
      const body = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    }

    return '';
  }
}
