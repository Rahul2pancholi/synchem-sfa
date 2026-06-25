import { Typography } from 'antd';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { useI18n } from '../../i18n/I18nProvider';

function roleSections(roleType: string | null): ('mr' | 'mgr' | 'ad')[] {
  if (roleType === 'FS') return ['mr'];
  if (roleType === 'MAN') return ['mgr'];
  if (roleType === 'AD') return ['ad'];
  return ['mr', 'mgr', 'ad'];
}

export function HelpPage() {
  const { t } = useI18n();
  const roleType = localStorage.getItem('roleType');
  const sections = roleSections(roleType);

  return (
    <PageLayout title={t('help.title')} subtitle={t('help.subtitle')}>
      <PageSection>
        <Typography.Paragraph type="secondary">{t('help.openChat')}</Typography.Paragraph>
      </PageSection>

      {sections.includes('mr') ? (
        <PageSection title={t('help.mr.title')}>
          <Typography.Paragraph>{t('help.mr.step1')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.mr.step2')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.mr.step3')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.mr.step4')}</Typography.Paragraph>
        </PageSection>
      ) : null}

      {sections.includes('mgr') ? (
        <PageSection title={t('help.mgr.title')}>
          <Typography.Paragraph>{t('help.mgr.step1')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.mgr.step2')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.mgr.step3')}</Typography.Paragraph>
        </PageSection>
      ) : null}

      {sections.includes('ad') ? (
        <PageSection title={t('help.ad.title')}>
          <Typography.Paragraph>{t('help.ad.step1')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.ad.step2')}</Typography.Paragraph>
          <Typography.Paragraph>{t('help.ad.step3')}</Typography.Paragraph>
        </PageSection>
      ) : null}
    </PageLayout>
  );
}
