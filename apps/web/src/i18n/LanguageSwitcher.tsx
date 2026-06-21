import { APP_LANGUAGE_LABELS, APP_LANGUAGES, useI18n } from './I18nProvider';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className={className ?? 'language-switcher'}>
      <span>{t('common.language')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        aria-label={t('common.language')}
      >
        {APP_LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {APP_LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
