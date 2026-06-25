import type { ApprovalEntityType } from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { Tabs } from 'antd';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../../components/ui/PageLayout';
import { useI18n } from '../../i18n/I18nProvider';
import { usePermission } from '../../hooks/usePermission';
import { ApprovalQueuePanel } from './ApprovalQueuePanel';

type ApprovalTitleKey =
  | 'approval.dcr.title'
  | 'approval.rtp.title'
  | 'approval.weekly.title'
  | 'approval.leave.title'
  | 'approval.expense.title'
  | 'approval.doctor.title';

const APPROVAL_TABS: Array<{
  type: ApprovalEntityType;
  menuCode: string;
  titleKey: ApprovalTitleKey;
}> = [
  { type: 'DCR', menuCode: 'APP01', titleKey: 'approval.dcr.title' },
  { type: 'RTP', menuCode: 'TRN02', titleKey: 'approval.rtp.title' },
  { type: 'WEEKLY_PLAN', menuCode: 'APP04', titleKey: 'approval.weekly.title' },
  { type: 'DOCTOR', menuCode: 'MAS11', titleKey: 'approval.doctor.title' },
  { type: 'LEAVE', menuCode: 'TRN10', titleKey: 'approval.leave.title' },
  { type: 'EXPENSE', menuCode: 'TRN21', titleKey: 'approval.expense.title' },
];

function isApprovalEntityType(value: string | null): value is ApprovalEntityType {
  return APPROVAL_TABS.some((tab) => tab.type === value);
}

export function PendingApprovalsPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const canViewHub = usePermission('APP00', 'view');
  const canViewDcr = usePermission('APP01', 'view');
  const canViewRtp = usePermission('TRN02', 'view');
  const canViewWeekly = usePermission('APP04', 'view');
  const canViewDoctor = usePermission('MAS11', 'view');
  const canViewLeave = usePermission('TRN10', 'view');
  const canViewExpense = usePermission('TRN21', 'view');

  const permissionByMenu: Record<string, boolean> = {
    APP01: canViewDcr,
    TRN02: canViewRtp,
    APP04: canViewWeekly,
    MAS11: canViewDoctor,
    TRN10: canViewLeave,
    TRN21: canViewExpense,
  };

  const visibleTabs = useMemo(
    () =>
      canViewHub
        ? APPROVAL_TABS
        : APPROVAL_TABS.filter((tab) => permissionByMenu[tab.menuCode]),
    [canViewHub, canViewDcr, canViewRtp, canViewWeekly, canViewDoctor, canViewLeave, canViewExpense],
  );

  const requestedType = searchParams.get('type');
  const activeType =
    requestedType && isApprovalEntityType(requestedType) && visibleTabs.some((tab) => tab.type === requestedType)
      ? requestedType
      : visibleTabs[0]?.type;

  if (visibleTabs.length === 0) {
    return (
      <PageLayout title={t('simplify.approvals.hubTitle')}>
        <p>{t('approval.noPending')}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('simplify.approvals.hubTitle')}>
      <Tabs
        activeKey={activeType}
        onChange={(key) => setSearchParams({ type: key })}
        items={visibleTabs.map((tab) => ({
          key: tab.type,
          label: t(tab.titleKey),
          children: <ApprovalQueuePanel entityType={tab.type} />,
        }))}
      />
    </PageLayout>
  );
}
