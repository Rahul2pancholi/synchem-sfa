import { Select, Space, Typography } from 'antd';
import { APP_LANGUAGE_LABELS, APP_LANGUAGES, useI18n } from './I18nProvider';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { language, setLanguage, t } = useI18n();

  return (
    <Space className={className} size="small">
      {!compact ? (
        <Typography.Text type="secondary" className="app-header__lang-label">
          {t('common.language')}
        </Typography.Text>
      ) : null}
      <Select
        size="small"
        value={language}
        style={{ minWidth: compact ? 96 : 120 }}
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
