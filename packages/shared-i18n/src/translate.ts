import { DEFAULT_APP_LANGUAGE, type AppLanguage } from './locales';
import { MESSAGES, type MessageKey } from './messages/phase0';

export function translate(key: MessageKey, language: AppLanguage = DEFAULT_APP_LANGUAGE): string {
  return MESSAGES[language][key] ?? MESSAGES.en[key] ?? key;
}

/** Shorthand used in app code. */
export const t = translate;
