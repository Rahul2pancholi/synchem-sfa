import type { AppLanguage } from '../locales';
import { MESSAGES as PHASE0_MESSAGES, PHASE0_MESSAGE_KEYS, type MessageKey as Phase0MessageKey } from './phase0';
import { PHASE1_MESSAGES, PHASE1_MESSAGE_KEYS, type Phase1MessageKey } from './phase1-masters';
import { PHASE1_EXTENDED_MESSAGES, PHASE1_EXTENDED_KEYS, type Phase1ExtendedKey } from './phase1-extended';
import { PHASE15_MESSAGES, PHASE15_MESSAGE_KEYS, type Phase15MessageKey } from './phase1.5-access';
import { PHASE2_MESSAGES, PHASE2_MESSAGE_KEYS, type Phase2MessageKey } from './phase2-transactions';
import { PHASE3_MESSAGES, PHASE3_MESSAGE_KEYS, type Phase3MessageKey } from './phase3-mobile';
import { PHASE4_MESSAGES, PHASE4_MESSAGE_KEYS, type Phase4MessageKey } from './phase4-approvals';
import { PHASE5_MESSAGES, PHASE5_MESSAGE_KEYS, type Phase5MessageKey } from './phase5-monthly';

export const MESSAGE_KEYS = [
  ...PHASE0_MESSAGE_KEYS,
  ...PHASE1_MESSAGE_KEYS,
  ...PHASE1_EXTENDED_KEYS,
  ...PHASE15_MESSAGE_KEYS,
  ...PHASE2_MESSAGE_KEYS,
  ...PHASE3_MESSAGE_KEYS,
  ...PHASE4_MESSAGE_KEYS,
  ...PHASE5_MESSAGE_KEYS,
] as const;

export type MessageKey =
  | Phase0MessageKey
  | Phase1MessageKey
  | Phase1ExtendedKey
  | Phase15MessageKey
  | Phase2MessageKey
  | Phase3MessageKey
  | Phase4MessageKey
  | Phase5MessageKey;

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
  },
  hi: {
    ...PHASE0_MESSAGES.hi,
    ...PHASE1_MESSAGES.hi,
    ...PHASE1_EXTENDED_MESSAGES.hi,
    ...PHASE15_MESSAGES.hi,
    ...PHASE2_MESSAGES.hi,
    ...PHASE3_MESSAGES.hi,
    ...PHASE4_MESSAGES.hi,
    ...PHASE5_MESSAGES.hi,
  },
  hinglish: {
    ...PHASE0_MESSAGES.hinglish,
    ...PHASE1_MESSAGES.hinglish,
    ...PHASE1_EXTENDED_MESSAGES.hinglish,
    ...PHASE15_MESSAGES.hinglish,
    ...PHASE2_MESSAGES.hinglish,
    ...PHASE3_MESSAGES.hinglish,
    ...PHASE4_MESSAGES.hinglish,
    ...PHASE5_MESSAGES.hinglish,
  },
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
};
