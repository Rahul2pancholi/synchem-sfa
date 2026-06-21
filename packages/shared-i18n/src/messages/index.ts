import type { AppLanguage } from '../locales';
import { MESSAGES as PHASE0_MESSAGES, PHASE0_MESSAGE_KEYS, type MessageKey as Phase0MessageKey } from './phase0';
import { PHASE1_MESSAGES, PHASE1_MESSAGE_KEYS, type Phase1MessageKey } from './phase1-masters';
import { PHASE1_EXTENDED_MESSAGES, PHASE1_EXTENDED_KEYS, type Phase1ExtendedKey } from './phase1-extended';
import { PHASE3_MESSAGES, PHASE3_MESSAGE_KEYS, type Phase3MessageKey } from './phase3-mobile';

export const MESSAGE_KEYS = [
  ...PHASE0_MESSAGE_KEYS,
  ...PHASE1_MESSAGE_KEYS,
  ...PHASE1_EXTENDED_KEYS,
  ...PHASE3_MESSAGE_KEYS,
] as const;

export type MessageKey = Phase0MessageKey | Phase1MessageKey | Phase1ExtendedKey | Phase3MessageKey;

export const MESSAGES: Record<AppLanguage, Record<MessageKey, string>> = {
  en: {
    ...PHASE0_MESSAGES.en,
    ...PHASE1_MESSAGES.en,
    ...PHASE1_EXTENDED_MESSAGES.en,
    ...PHASE3_MESSAGES.en,
  },
  hi: {
    ...PHASE0_MESSAGES.hi,
    ...PHASE1_MESSAGES.hi,
    ...PHASE1_EXTENDED_MESSAGES.hi,
    ...PHASE3_MESSAGES.hi,
  },
  hinglish: {
    ...PHASE0_MESSAGES.hinglish,
    ...PHASE1_MESSAGES.hinglish,
    ...PHASE1_EXTENDED_MESSAGES.hinglish,
    ...PHASE3_MESSAGES.hinglish,
  },
};

export { PHASE0_MESSAGE_KEYS, PHASE1_MESSAGE_KEYS, PHASE1_EXTENDED_KEYS, PHASE3_MESSAGE_KEYS };
