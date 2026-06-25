import { Injectable } from '@nestjs/common';
import type { ChatIntentId, ChatReplyDraft, JwtPayload } from '@synchem-sfa/shared-types';
import { ApprovalService } from '../approvals/approval.service';
import { ReportsService } from '../reports/reports.service';

type DraftDcrRow = {
  id: string;
  workDate: string;
  approveStatus: string;
  doctorCount: number;
};

type DraftPobRow = {
  id: string;
  orderDate: string;
  approveStatus: string;
  amount: number;
};

@Injectable()
export class ChatIntentService {
  constructor(
    private readonly approvals: ApprovalService,
    private readonly reports: ReportsService,
  ) {}

  async resolve(user: JwtPayload, intent: ChatIntentId, message = ''): Promise<ChatReplyDraft> {
    const compCode = user.compCode!;
    const empId = user.empId!;
    const todayOnly = /aaj|today/i.test(message);

    switch (intent) {
      case 'pending_approvals':
        return this.managerPending(compCode, user);
      case 'my_pending':
        return this.fieldStaffPending(compCode, empId);
      case 'my_dcr_drafts':
        return this.fieldStaffDcrDrafts(compCode, empId, todayOnly);
      case 'my_pob_drafts':
        return this.fieldStaffPobDrafts(compCode, empId, todayOnly);
      case 'submit_dcr':
        return this.fieldStaffSubmitDcr(compCode, empId, todayOnly);
      case 'submit_pob':
        return this.fieldStaffSubmitPob(compCode, empId, todayOnly);
      case 'pob_achievement':
        return user.roleType === 'FS'
          ? this.fieldStaffPob(compCode, empId)
          : this.managerPob(compCode);
      case 'coverage':
        return user.roleType === 'FS'
          ? this.fieldStaffCoverage(compCode, empId)
          : this.managerCoverage(compCode);
      case 'missed_calls':
        return user.roleType === 'FS'
          ? this.fieldStaffMissed(compCode, empId)
          : this.managerMissed(compCode);
      case 'open_dcr':
        return {
          messageKey: 'chat.answer.openDcr',
          params: {},
          actions: [{ labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' }],
        };
      case 'open_pob':
        return {
          messageKey: 'chat.answer.openPob',
          params: {},
          actions: [{ labelKey: 'chat.action.openPob', path: '/app/pob/add' }],
        };
      case 'help':
        return {
          messageKey: 'chat.answer.help',
          params: {},
          actions: [{ labelKey: 'chat.action.openHelp', path: '/app/help' }],
        };
      default:
        return this.noMatch(user.roleType);
    }
  }

  noMatch(roleType?: JwtPayload['roleType']): ChatReplyDraft {
    const actions = [
      { labelKey: 'chat.action.openHelp', path: '/app/help' },
      ...(roleType === 'FS'
        ? [
            { labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' },
            { labelKey: 'chat.action.openPob', path: '/app/pob/add' },
          ]
        : [{ labelKey: 'chat.action.openApprovals', path: '/app/approvals' }]),
    ];
    return {
      messageKey: 'chat.noMatch',
      params: {},
      actions,
    };
  }

  private async managerPending(compCode: string, user: JwtPayload): Promise<ChatReplyDraft> {
    const res = await this.approvals.getSummary(compCode, user);
    const summary = res.data;
    const actions: ChatReplyDraft['actions'] = [];
    if (summary.dcr > 0) {
      actions.push({ labelKey: 'chat.action.openDcrApproval', path: '/app/approvals?type=DCR' });
    }
    if (summary.rtp > 0) {
      actions.push({ labelKey: 'chat.action.openRtpApproval', path: '/app/approvals?type=RTP' });
    }
    if (summary.weeklyPlan > 0) {
      actions.push({ labelKey: 'chat.action.openWeeklyApproval', path: '/app/approvals?type=WEEKLY_PLAN' });
    }
    if (summary.total === 0) {
      actions.push({ labelKey: 'chat.action.openApprovals', path: '/app/home' });
    }

    return {
      messageKey: 'chat.answer.pendingApprovals',
      params: {
        total: summary.total,
        dcr: summary.dcr,
        rtp: summary.rtp,
        weekly: summary.weeklyPlan,
      },
      actions,
    };
  }

  private async fieldStaffPending(compCode: string, empId: string): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffKpis(compCode, empId, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.myPending',
      params: { count: kpis.pendingSubmitCount },
      actions: [
        { labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' },
        { labelKey: 'chat.action.openPob', path: '/app/pob/add' },
      ],
    };
  }

  private async fieldStaffPob(compCode: string, empId: string): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffKpis(compCode, empId, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.pobAchievement',
      params: {
        pct: kpis.pobAchievementPct,
        amount: Math.round(kpis.pobApprovedAmount),
        target: Math.round(kpis.amountTarget),
      },
      actions: [
        { labelKey: 'chat.action.openPob', path: '/app/pob/add' },
        { labelKey: 'chat.action.openTargetReport', path: '/app/report/employeeTargetAchievement' },
      ],
    };
  }

  private async managerPob(compCode: string): Promise<ChatReplyDraft> {
    const res = await this.reports.managerSalesKpis(compCode, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.pobAchievement',
      params: {
        pct: kpis.pobAchievementPct,
        amount: Math.round(kpis.pobApprovedAmount),
        target: Math.round(kpis.amountTarget),
      },
      actions: [
        { labelKey: 'chat.action.openTargetReport', path: '/app/report/employeeTargetAchievement' },
        { labelKey: 'chat.action.openSalesReport', path: '/app/report/salesSummary' },
      ],
    };
  }

  private async fieldStaffCoverage(compCode: string, empId: string): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffKpis(compCode, empId, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.coverage',
      params: { pct: kpis.coveragePct },
      actions: [{ labelKey: 'chat.action.openVisitReport', path: '/app/report/visit-summary' }],
    };
  }

  private async managerCoverage(compCode: string): Promise<ChatReplyDraft> {
    const res = await this.reports.managerSalesKpis(compCode, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.coverage',
      params: { pct: kpis.coveragePct },
      actions: [{ labelKey: 'chat.action.openVisitReport', path: '/app/report/visit-summary' }],
    };
  }

  private async fieldStaffMissed(compCode: string, empId: string): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffKpis(compCode, empId, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.missedCalls',
      params: { count: kpis.missedCallCount },
      actions: [{ labelKey: 'chat.action.openMissedCalls', path: '/app/report/missedCallReport' }],
    };
  }

  private async managerMissed(compCode: string): Promise<ChatReplyDraft> {
    const res = await this.reports.managerSalesKpis(compCode, {});
    const kpis = res.data;
    return {
      messageKey: 'chat.answer.missedCalls',
      params: { count: kpis.missedCallCount },
      actions: [{ labelKey: 'chat.action.openMissedCalls', path: '/app/report/missedCallReport' }],
    };
  }

  private async fieldStaffDcrDrafts(
    compCode: string,
    empId: string,
    todayOnly: boolean,
  ): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffDcrDrafts(compCode, empId, todayOnly);
    const items = res.data.items as DraftDcrRow[];

    if (!items.length) {
      return {
        messageKey: todayOnly ? 'chat.answer.noDcrDraftsToday' : 'chat.answer.noDcrDrafts',
        params: {},
        actions: [{ labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' }],
      };
    }

    return {
      messageKey: todayOnly ? 'chat.answer.dcrDraftListToday' : 'chat.answer.dcrDraftList',
      params: { count: items.length },
      items: items.map((row) => this.mapDcrDraftItem(row)),
      actions: [{ labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' }],
    };
  }

  private async fieldStaffPobDrafts(
    compCode: string,
    empId: string,
    todayOnly: boolean,
  ): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffPobDrafts(compCode, empId, todayOnly);
    const items = res.data.items as DraftPobRow[];

    if (!items.length) {
      return {
        messageKey: todayOnly ? 'chat.answer.noPobDraftsToday' : 'chat.answer.noPobDrafts',
        params: {},
        actions: [{ labelKey: 'chat.action.openPob', path: '/app/pob/add' }],
      };
    }

    return {
      messageKey: todayOnly ? 'chat.answer.pobDraftListToday' : 'chat.answer.pobDraftList',
      params: { count: items.length },
      items: items.map((row) => this.mapPobDraftItem(row)),
      actions: [{ labelKey: 'chat.action.openPob', path: '/app/pob/add' }],
    };
  }

  private async fieldStaffSubmitDcr(
    compCode: string,
    empId: string,
    todayOnly: boolean,
  ): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffDcrDrafts(compCode, empId, todayOnly);
    const items = res.data.items as DraftDcrRow[];

    if (!items.length) {
      return {
        messageKey: todayOnly ? 'chat.answer.noDcrDraftsToday' : 'chat.answer.noDcrDrafts',
        params: {},
        actions: [{ labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' }],
      };
    }

    if (items.length === 1) {
      const row = items[0];
      return {
        messageKey: 'chat.answer.submitDcrConfirm',
        params: { date: row.workDate, count: row.doctorCount },
        actions: [this.buildDcrSubmitAction(row)],
      };
    }

    return {
      messageKey: 'chat.answer.submitDcrPick',
      params: { count: items.length },
      items: items.map((row) => this.mapDcrDraftItem(row)),
      actions: [{ labelKey: 'chat.action.openDcr', path: '/app/dcrRecord' }],
    };
  }

  private async fieldStaffSubmitPob(
    compCode: string,
    empId: string,
    todayOnly: boolean,
  ): Promise<ChatReplyDraft> {
    const res = await this.reports.fieldStaffPobDrafts(compCode, empId, todayOnly);
    const items = res.data.items as DraftPobRow[];

    if (!items.length) {
      return {
        messageKey: todayOnly ? 'chat.answer.noPobDraftsToday' : 'chat.answer.noPobDrafts',
        params: {},
        actions: [{ labelKey: 'chat.action.openPob', path: '/app/pob/add' }],
      };
    }

    if (items.length === 1) {
      const row = items[0];
      return {
        messageKey: 'chat.answer.submitPobConfirm',
        params: { date: row.orderDate, amount: row.amount },
        actions: [this.buildPobSubmitAction(row)],
      };
    }

    return {
      messageKey: 'chat.answer.submitPobPick',
      params: { count: items.length },
      items: items.map((row) => this.mapPobDraftItem(row)),
      actions: [{ labelKey: 'chat.action.openPob', path: '/app/pob/add' }],
    };
  }

  private mapDcrDraftItem(row: DraftDcrRow) {
    return {
      labelKey: 'chat.item.dcrDraft',
      params: {
        date: row.workDate,
        count: row.doctorCount,
        status: row.approveStatus,
      },
      path: '/app/dcrRecord',
      submit: {
        entityType: 'DCR' as const,
        entityId: row.id,
        labelKey: 'chat.action.submitDcr',
        confirmParams: {
          date: row.workDate,
          count: row.doctorCount,
        },
      },
    };
  }

  private mapPobDraftItem(row: DraftPobRow) {
    return {
      labelKey: 'chat.item.pobDraft',
      params: {
        date: row.orderDate,
        amount: row.amount,
        status: row.approveStatus,
      },
      path: '/app/pob/add',
      submit: {
        entityType: 'POB' as const,
        entityId: row.id,
        labelKey: 'chat.action.submitPob',
        confirmParams: {
          date: row.orderDate,
          amount: row.amount,
        },
      },
    };
  }

  private buildDcrSubmitAction(row: DraftDcrRow) {
    return {
      kind: 'submit' as const,
      labelKey: 'chat.action.submitDcr',
      entityType: 'DCR' as const,
      entityId: row.id,
      confirmParams: {
        date: row.workDate,
        count: row.doctorCount,
      },
    };
  }

  private buildPobSubmitAction(row: DraftPobRow) {
    return {
      kind: 'submit' as const,
      labelKey: 'chat.action.submitPob',
      entityType: 'POB' as const,
      entityId: row.id,
      confirmParams: {
        date: row.orderDate,
        amount: row.amount,
      },
    };
  }
}
