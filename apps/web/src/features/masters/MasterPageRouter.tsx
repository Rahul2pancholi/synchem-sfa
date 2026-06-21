import { BulkUploadPage } from './BulkUploadPage';
import { GenericMasterPage } from './GenericMasterPage';
import { LovMasterPage } from './LovMasterPage';
import { BULK_PAGES, getMasterPageConfig, LOV_PAGES } from './masterPageConfig';

export function MasterPageByKey({ pageKey }: { pageKey: string }) {
  const config = getMasterPageConfig(pageKey);
  if (!config) return null;
  return <GenericMasterPage config={config} />;
}

export function LovPageByKey({ pageKey }: { pageKey: string }) {
  const config = LOV_PAGES[pageKey];
  if (!config) return null;
  return <LovMasterPage config={config} />;
}

export function BulkPageByKey({ pageKey }: { pageKey: string }) {
  const config = BULK_PAGES[pageKey];
  if (!config) return null;
  return <BulkUploadPage config={config} />;
}
