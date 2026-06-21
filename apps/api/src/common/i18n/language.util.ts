import {
  APP_LANGUAGE_HEADER,
  resolveAppLanguage,
  translate,
  type AppLanguage,
  type MessageKey,
} from '@synchem-sfa/shared-i18n';

export function resolveRequestLanguage(
  headers: Record<string, string | string[] | undefined>,
): AppLanguage {
  const explicit = headers[APP_LANGUAGE_HEADER];
  if (typeof explicit === 'string') {
    return resolveAppLanguage(explicit);
  }

  const acceptLanguage = headers['accept-language'];
  if (typeof acceptLanguage === 'string') {
    const first = acceptLanguage.split(',')[0]?.trim();
    return resolveAppLanguage(first);
  }

  return resolveAppLanguage(undefined);
}

export function apiTranslate(key: MessageKey, language: AppLanguage): string {
  return translate(key, language);
}
