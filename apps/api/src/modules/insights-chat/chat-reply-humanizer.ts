import { translate, type AppLanguage, type MessageKey } from '@synchem-sfa/shared-i18n';
import type { ChatAssistantReply, ChatReplyDraft } from '@synchem-sfa/shared-types';

function interpolate(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function buildFallbackReplyText(reply: ChatReplyDraft, language: AppLanguage): string {
  const template = translate(reply.messageKey as MessageKey, language);
  return interpolate(template, reply.params);
}

export function withReplyText(
  reply: ChatReplyDraft,
  language: AppLanguage,
  replyText?: string | null,
): ChatAssistantReply {
  const trimmed = replyText?.trim();
  return {
    ...reply,
    replyText: trimmed || buildFallbackReplyText(reply, language),
  };
}
