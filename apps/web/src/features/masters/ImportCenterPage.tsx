import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { Select } from 'antd';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { useI18n } from '../../i18n/I18nProvider';
import { BulkUploadPage } from './BulkUploadPage';
import { BULK_PAGES, type BulkUploadConfig } from './masterPageConfig';

const IMPORT_OPTIONS: Array<{ key: keyof typeof BULK_PAGES; labelKey: MessageKey }> = [
  { key: 'bulkCityUpload', labelKey: 'masters.bulk.city' },
  { key: 'bulkHQUpload', labelKey: 'masters.bulk.hq' },
  { key: 'bulkRouteUpload', labelKey: 'masters.bulk.route' },
  { key: 'bulkDoctorUpload', labelKey: 'masters.bulk.doctor' },
  { key: 'bulkRetailerUpload', labelKey: 'masters.bulk.retailer' },
  { key: 'bulkStockistUpload', labelKey: 'masters.bulk.stockist' },
  { key: 'bulkProductUpload', labelKey: 'masters.bulk.product' },
];

function isImportKey(value: string | null): value is keyof typeof BULK_PAGES {
  return Boolean(value && value in BULK_PAGES);
}

export function ImportCenterPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('entity');
  const activeKey = isImportKey(requested) ? requested : IMPORT_OPTIONS[0].key;
  const config: BulkUploadConfig = BULK_PAGES[activeKey];

  const options = useMemo(
    () =>
      IMPORT_OPTIONS.map((item) => ({
        value: item.key,
        label: t(item.labelKey),
      })),
    [t],
  );

  return (
    <PageLayout title={t('simplify.import.title')}>
      <PageSection>
        <Select
          style={{ width: '100%', maxWidth: 420, marginBottom: 24 }}
          value={activeKey}
          options={options}
          onChange={(value) => setSearchParams({ entity: value })}
          aria-label={t('simplify.import.selectEntity')}
        />
        <BulkUploadPage config={config} embedded />
      </PageSection>
    </PageLayout>
  );
}
