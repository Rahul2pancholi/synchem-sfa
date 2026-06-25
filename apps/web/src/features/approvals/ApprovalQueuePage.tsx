import type { ApprovalEntityType } from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { PageLayout } from '../../components/ui/PageLayout';
import { useI18n } from '../../i18n/I18nProvider';
import { ApprovalQueuePanel } from './ApprovalQueuePanel';

type ApprovalTitleKey =
  | 'approval.dcr.title'
  | 'approval.rtp.title'
  | 'approval.weekly.title'
  | 'approval.leave.title'
  | 'approval.expense.title'
  | 'approval.doctor.title';

export function ApprovalQueuePage({
  entityType,
  titleKey,
}: {
  entityType: ApprovalEntityType;
  titleKey: ApprovalTitleKey;
}) {
  const { t } = useI18n();

  return (
    <PageLayout title={t(titleKey)}>
      <ApprovalQueuePanel entityType={entityType} />
    </PageLayout>
  );
}
