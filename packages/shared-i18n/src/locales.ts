/** Supported UI languages — English, Hindi (mixed Roman), Hinglish (Roman mix). */
export const APP_LANGUAGES = ['en', 'hi', 'hinglish'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en';

export const APP_LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  hinglish: 'Hinglish',
};

export const APP_LANGUAGE_STORAGE_KEY = 'appLanguage';

export const APP_LANGUAGE_HEADER = 'x-app-language';

/** BCP-47 / custom values clients may send; maps to AppLanguage. */
export function resolveAppLanguage(input?: string | null): AppLanguage {
  if (!input) {
    return DEFAULT_APP_LANGUAGE;
  }

  const normalized = input.trim().toLowerCase();

  if (normalized === 'hinglish' || normalized === 'hi-latn' || normalized === 'hi-en') {
    return 'hinglish';
  }

  if (normalized === 'hi' || normalized.startsWith('hi-')) {
    return 'hi';
  }

  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en';
  }

  return DEFAULT_APP_LANGUAGE;
}
