import type { RoleType } from './auth';

export type ChatIntentId =
  | 'pending_approvals'
  | 'my_pending'
  | 'my_dcr_drafts'
  | 'my_pob_drafts'
  | 'submit_dcr'
  | 'submit_pob'
  | 'pob_achievement'
  | 'coverage'
  | 'missed_calls'
  | 'open_dcr'
  | 'open_pob'
  | 'help'
  | 'unknown';

export interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatActionKind = 'navigate' | 'submit';

export type ChatSubmitEntityType = 'DCR' | 'POB';

export interface ChatSubmitPayload {
  entityType: ChatSubmitEntityType;
  entityId: string;
  labelKey: string;
  confirmParams: Record<string, string | number>;
}

export interface ChatAction {
  kind?: ChatActionKind;
  labelKey: string;
  path?: string;
  entityType?: ChatSubmitEntityType;
  entityId?: string;
  confirmParams?: Record<string, string | number>;
}

export interface ChatListItem {
  labelKey: string;
  params: Record<string, string | number>;
  path?: string;
  submit?: ChatSubmitPayload;
}

export interface ChatAssistantReply {
  /** Primary human-readable message for the chat UI. */
  replyText: string;
  messageKey: string;
  params: Record<string, string | number>;
  actions: ChatAction[];
  items?: ChatListItem[];
  /** Set by API when server-side session persistence is active. */
  sessionId?: string;
}

export type ChatReplyDraft = Omit<ChatAssistantReply, 'replyText' | 'sessionId'>;

export interface ChatSessionMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  items?: ChatListItem[];
}

export interface ChatSessionSnapshot {
  sessionId: string;
  messages: ChatSessionMessage[];
}

/** @deprecated Regex router — emergency fallback only when LLM is unavailable. */
const PENDING = /pending|approval|approve|lambit|approve|queue|waiting/i;
const POB = /pob|order|achievement|target|sales|bech|booking/i;
const COVERAGE = /coverage|visit|doctor cover|covered/i;
const MISSED = /missed|miss call|skip/i;
const DCR = /\bdcr\b|daily visit|call report|visit report/i;
const DRAFT = /draft|submit pending|bhejna|submit karo|file karo|pending submit|dikhao/i;
const SUBMIT = /submit|bhej|bhejo|send|save|file kar|approval ke liye/i;
const HELP = /help|guide|kaise|how to|samjha|start/i;

export function matchChatIntent(message: string, roleType?: RoleType): ChatIntentId {
  const text = message.trim().toLowerCase();
  if (!text) return 'unknown';

  if (HELP.test(text)) return 'help';
  if ((DCR.test(text) || /\bdcr\b/.test(text)) && SUBMIT.test(text)) return 'submit_dcr';
  if ((/\bpob\b|doctor order/.test(text)) && SUBMIT.test(text)) return 'submit_pob';
  if ((DCR.test(text) || /\bdcr\b/.test(text)) && DRAFT.test(text)) return 'my_dcr_drafts';
  if ((/\bpob\b|doctor order/.test(text)) && DRAFT.test(text)) return 'my_pob_drafts';
  if (DCR.test(text)) return 'open_dcr';
  if (PENDING.test(text)) {
    return roleType === 'FS' ? 'my_pending' : 'pending_approvals';
  }
  if (MISSED.test(text)) return 'missed_calls';
  if (COVERAGE.test(text)) return 'coverage';
  if (POB.test(text)) return 'pob_achievement';
  if (/^(open pob|pob kholo|book order)$/i.test(text.trim())) return 'open_pob';

  return 'unknown';
}
