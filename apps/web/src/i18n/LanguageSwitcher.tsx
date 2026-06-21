import { Select, Space, Typography } from 'antd';
import { APP_LANGUAGE_LABELS, APP_LANGUAGES, useI18n } from './I18nProvider';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <Space className={className} size="small">
      <Typography.Text type="secondary">{t('common.language')}</Typography.Text>
      <Select
        size="small"
        value={language}
        style={{ minWidth: 120 }}
        onChange={(value) => setLanguage(value as AppLanguage)}
        aria-label={t('common.language')}
        options={APP_LANGUAGES.map((code) => ({
          value: code,
          label: APP_LANGUAGE_LABELS[code],
        }))}
      />
    </Space>
  );
}
