import type { AppLanguage } from '../locales';
import { MESSAGES as PHASE0_MESSAGES, PHASE0_MESSAGE_KEYS, type MessageKey as Phase0MessageKey } from './phase0';
import { PHASE1_MESSAGES, PHASE1_MESSAGE_KEYS, type Phase1MessageKey } from './phase1-masters';
import { PHASE1_EXTENDED_MESSAGES, PHASE1_EXTENDED_KEYS, type Phase1ExtendedKey } from './phase1-extended';
import { PHASE15_MESSAGES, PHASE15_MESSAGE_KEYS, type Phase15MessageKey } from './phase1.5-access';
import { PHASE2_MESSAGES, PHASE2_MESSAGE_KEYS, type Phase2MessageKey } from './phase2-transactions';
import { PHASE3_MESSAGES, PHASE3_MESSAGE_KEYS, type Phase3MessageKey } from './phase3-mobile';
import { PHASE4_MESSAGES, PHASE4_MESSAGE_KEYS, type Phase4MessageKey } from './phase4-approvals';
import { PHASE5_MESSAGES, PHASE5_MESSAGE_KEYS, type Phase5MessageKey } from './phase5-monthly';
import { PHASE6_INSIGHTS_MESSAGES, PHASE6_INSIGHTS_MESSAGE_KEYS, type Phase6InsightsMessageKey } from './phase6-insights';
import {
  PHASE6_SECURITY_MESSAGES,
  PHASE6_SECURITY_MESSAGE_KEYS,
  type Phase6SecurityMessageKey,
} from './phase6-security';
import {
  PHASE_SPRINT1_DASHBOARD_MESSAGES,
  PHASE_SPRINT1_DASHBOARD_KEYS,
  type PhaseSprint1DashboardKey,
} from './phase-sprint1-dashboard';
import {
  PHASE9_SALES_INSIGHTS_MESSAGES,
  PHASE9_SALES_INSIGHTS_KEYS,
  type Phase9SalesInsightsKey,
} from './phase9-sales-insights';
import {
  PHASE_PLATFORM_MESSAGES,
  PHASE_PLATFORM_KEYS,
  type PhasePlatformKey,
} from './phase-platform';
import {
  PHASE_WEEK2_MESSAGES,
  PHASE_WEEK2_KEYS,
  type PhaseWeek2Key,
} from './phase-week2';
import {
  PHASE_WEEK3_MESSAGES,
  PHASE_WEEK3_KEYS,
  type PhaseWeek3Key,
} from './phase-week3';
import {
  PHASE_SIMPLIFY_MESSAGES,
  PHASE_SIMPLIFY_KEYS,
  type PhaseSimplifyKey,
} from './phase-simplify';
import {
  PHASE_CHAT_HUMAN_MESSAGES,
  PHASE_CHAT_HUMAN_KEYS,
  type PhaseChatHumanKey,
} from './phase-chat-human';
import {
  PHASE_CHAT_ACTIONS_MESSAGES,
  PHASE_CHAT_ACTIONS_KEYS,
  type PhaseChatActionsKey,
} from './phase-chat-actions';

export const MESSAGE_KEYS = [
  ...PHASE0_MESSAGE_KEYS,
  ...PHASE1_MESSAGE_KEYS,
  ...PHASE1_EXTENDED_KEYS,
  ...PHASE15_MESSAGE_KEYS,
  ...PHASE2_MESSAGE_KEYS,
  ...PHASE3_MESSAGE_KEYS,
  ...PHASE4_MESSAGE_KEYS,
  ...PHASE5_MESSAGE_KEYS,
  ...PHASE6_INSIGHTS_MESSAGE_KEYS,
  ...PHASE6_SECURITY_MESSAGE_KEYS,
  ...PHASE_SPRINT1_DASHBOARD_KEYS,
  ...PHASE9_SALES_INSIGHTS_KEYS,
  ...PHASE_PLATFORM_KEYS,
  ...PHASE_WEEK2_KEYS,
  ...PHASE_WEEK3_KEYS,
  ...PHASE_SIMPLIFY_KEYS,
  ...PHASE_CHAT_HUMAN_KEYS,
  ...PHASE_CHAT_ACTIONS_KEYS,
] as const;

export type MessageKey =
  | Phase0MessageKey
  | Phase1MessageKey
  | Phase1ExtendedKey
  | Phase15MessageKey
  | Phase2MessageKey
  | Phase3MessageKey
  | Phase4MessageKey
  | Phase5MessageKey
  | Phase6InsightsMessageKey
  | Phase6SecurityMessageKey
  | PhaseSprint1DashboardKey
  | Phase9SalesInsightsKey
  | PhasePlatformKey
  | PhaseWeek2Key
  | PhaseWeek3Key
  | PhaseSimplifyKey
  | PhaseChatHumanKey
  | PhaseChatActionsKey;

const hinglishCatalog: Record<MessageKey, string> = {
  ...PHASE0_MESSAGES.hinglish,
  ...PHASE1_MESSAGES.hinglish,
  ...PHASE1_EXTENDED_MESSAGES.hinglish,
  ...PHASE15_MESSAGES.hinglish,
  ...PHASE2_MESSAGES.hinglish,
  ...PHASE3_MESSAGES.hinglish,
  ...PHASE4_MESSAGES.hinglish,
  ...PHASE5_MESSAGES.hinglish,
  ...PHASE6_INSIGHTS_MESSAGES.hinglish,
  ...PHASE6_SECURITY_MESSAGES.hinglish,
  ...PHASE_SPRINT1_DASHBOARD_MESSAGES.hinglish,
  ...PHASE9_SALES_INSIGHTS_MESSAGES.hinglish,
  ...PHASE_PLATFORM_MESSAGES.hinglish,
  ...PHASE_WEEK2_MESSAGES.hinglish,
  ...PHASE_WEEK3_MESSAGES.hinglish,
  ...PHASE_SIMPLIFY_MESSAGES.hinglish,
  ...PHASE_CHAT_HUMAN_MESSAGES.hinglish,
  ...PHASE_CHAT_ACTIONS_MESSAGES.hinglish,
};

export const MESSAGES: Record<AppLanguage, Record<MessageKey, string>> = {
  en: {
    ...PHASE0_MESSAGES.en,
    ...PHASE1_MESSAGES.en,
    ...PHASE1_EXTENDED_MESSAGES.en,
    ...PHASE15_MESSAGES.en,
    ...PHASE2_MESSAGES.en,
    ...PHASE3_MESSAGES.en,
    ...PHASE4_MESSAGES.en,
    ...PHASE5_MESSAGES.en,
    ...PHASE6_INSIGHTS_MESSAGES.en,
    ...PHASE6_SECURITY_MESSAGES.en,
    ...PHASE_SPRINT1_DASHBOARD_MESSAGES.en,
    ...PHASE9_SALES_INSIGHTS_MESSAGES.en,
    ...PHASE_PLATFORM_MESSAGES.en,
    ...PHASE_WEEK2_MESSAGES.en,
    ...PHASE_WEEK3_MESSAGES.en,
    ...PHASE_SIMPLIFY_MESSAGES.en,
    ...PHASE_CHAT_HUMAN_MESSAGES.en,
    ...PHASE_CHAT_ACTIONS_MESSAGES.en,
  },
  /** Mixed Roman Hindi for field users — not literary Devanagari. */
  hi: hinglishCatalog,
  hinglish: hinglishCatalog,
};

export {
  PHASE0_MESSAGE_KEYS,
  PHASE1_MESSAGE_KEYS,
  PHASE1_EXTENDED_KEYS,
  PHASE15_MESSAGE_KEYS,
  PHASE2_MESSAGE_KEYS,
  PHASE3_MESSAGE_KEYS,
  PHASE4_MESSAGE_KEYS,
  PHASE5_MESSAGE_KEYS,
  PHASE6_INSIGHTS_MESSAGE_KEYS,
  PHASE6_SECURITY_MESSAGE_KEYS,
  PHASE_SPRINT1_DASHBOARD_KEYS,
  PHASE9_SALES_INSIGHTS_KEYS,
  PHASE_PLATFORM_KEYS,
  PHASE_WEEK2_KEYS,
  PHASE_WEEK3_KEYS,
  PHASE_SIMPLIFY_KEYS,
  PHASE_CHAT_HUMAN_KEYS,
  PHASE_CHAT_ACTIONS_KEYS,
};
