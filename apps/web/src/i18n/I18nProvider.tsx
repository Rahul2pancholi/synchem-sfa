import {
  APP_LANGUAGE_HEADER,
  APP_LANGUAGE_STORAGE_KEY,
  APP_LANGUAGES,
  APP_LANGUAGE_LABELS,
  resolveAppLanguage,
  translate,
  type AppLanguage,
  type MessageKey,
} from '@synchem-sfa/shared-i18n';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey) => string;
  languageHeader: Record<string, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(): AppLanguage {
  return resolveAppLanguage(localStorage.getItem(APP_LANGUAGE_STORAGE_KEY));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(readStoredLanguage);

  const setLanguage = useCallback((next: AppLanguage) => {
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, next);
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

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export { APP_LANGUAGES, APP_LANGUAGE_LABELS };
