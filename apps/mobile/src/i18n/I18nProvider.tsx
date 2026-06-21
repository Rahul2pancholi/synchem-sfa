import {
  APP_LANGUAGE_HEADER,
  APP_LANGUAGES,
  APP_LANGUAGE_LABELS,
  resolveAppLanguage,
  translate,
  type AppLanguage,
  type MessageKey,
} from '@synchem-sfa/shared-i18n';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadLanguage, saveLanguage } from '../lib/auth-store';

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey) => string;
  languageHeader: Record<string, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    void loadLanguage().then((stored) => {
      if (stored) setLanguageState(resolveAppLanguage(stored));
    });
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    void saveLanguage(next);
    setLanguageState(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translate(key, language),
      languageHeader: { [APP_LANGUAGE_HEADER]: language },
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export { APP_LANGUAGES, APP_LANGUAGE_LABELS };
